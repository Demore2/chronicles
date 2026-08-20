import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PRO_WEEK_DAGEN, type BeloningSoort, type ReferralData, type UitgenodigdeVriend } from '@/types/referral';
import { supabase } from '@/lib/supabase';
import { useAbonnementStore } from '@/store/abonnement-store';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

/**
 * Het uitnodigingssysteem — de zevende sync-store.
 *
 * ## Waar dit synchroniseert, en waarom niet naar Firestore
 *
 * De opdracht noemt Firebase Firestore. Dat kan hier niet en het zou hier ook niet horen:
 * Firestore zit niet in dit project (alleen `@react-native-firebase/{app,analytics,messaging}`),
 * en Firebase staat sinds de MVP volledig uit achter `EXPO_PUBLIC_FIREBASE_ENABLED` — zonder
 * `google-services.json` initialiseert de SDK niet eens. Een tweede backend voor één tabel zou
 * bovendien betekenen dat het account bij Supabase staat en de uitnodigingen ergens anders, met
 * twee sessies en twee autorisatiemodellen om gelijk te houden. De rij staat dus in
 * `public.referrals`, naast de zes andere stores, achter dezelfde RLS.
 *
 * ## Wat hier wél en niet gebeurt
 *
 * Deze store beheert de **eigen** rij van de lezer: zijn code, wie hij binnenhaalde, wat dat
 * opleverde. Wat er nog *niet* is, is de andere kant: een vriend die de code invoert. Dat kan
 * principieel niet vanaf de client — RLS geeft een lezer alleen zijn eigen rij, dus hij kan geen
 * vreemde rij op `referral_code` opzoeken (en zou dat ook niet moeten kunnen: dan is de tabel
 * doorzoekbaar op andermans code). Dat wordt een `security definer` RPC die de code opzoekt, de
 * vriend bijschrijft en de beloning toekent — één functie, in de trant van
 * `hoofdstuk_interactie`. `addFriendInvite` is de plek waar die RPC straks binnenkomt; vandaag is
 * hij de enige manier om een uitnodiging te registreren.
 *
 * ## Beloningen zijn een tegoed, geen valuta
 *
 * Eén beloning per uitnodiging, in te wisselen voor één extra verhaal vandaag of een week Pro.
 * Ze staan lokaal én op de server, maar het inwisselen zelf gebeurt in `abonnement-store` — daar
 * woont de vraag "mag deze lezer dit verhaal openen". Zelfde afweging als bij de punten van de
 * mijlpalen: zolang er niets mee te betálen valt mag de stand op het toestel staan, en de server
 * is de kopie voor het volgende toestel.
 */

/**
 * De code van een gebruiker: de eerste acht tekens van zijn id, in hoofdletters.
 *
 * Zuiver en apart van de store, zodat de afleiding te controleren is zonder een sessie. De
 * streepjes van een UUID vallen weg — een code die je iemand voorleest of overtypt is beter af
 * zonder leestekens. `unique` op de kolom is wat een botsing (twee id's die met dezelfde acht
 * tekens beginnen) een fout maakt in plaats van twee lezers die elkaars vrienden krijgen.
 */
export function codeVoor(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

type ReferralState = {
  /** `null` zolang er geen sessie is geweest: een code zonder gebruiker bestaat niet. */
  data: ReferralData | null;

  /**
   * Zorgt dat er een rij is voor de ingelogde lezer en geeft zijn code terug.
   *
   * Idempotent, en met opzet geen zuivere getter: hij schrijft de rij bij de eerste aanroep aan.
   * Roep hem daarom aan vanuit een effect of een handler, nooit tijdens het renderen — een
   * component die zijn eigen store muteert terwijl hij tekent is de kortste weg naar een
   * oneindige hertekening. Zonder sessie geeft hij een lege string.
   */
  generateReferralCode: () => string;

  /**
   * Schrijft een uitgenodigde vriend bij en kent de beloning toe.
   *
   * Idempotent op `friendId`: dezelfde vriend twee keer aanmelden is niet twee uitnodigingen.
   * Dat is niet netheid maar de enige rem die er is — zonder die controle is een beloning
   * bijschrijven een lus om een `addFriendInvite`-aanroep heen.
   */
  addFriendInvite: (friendId: string) => void;

  /**
   * Wisselt één beloning in. Geeft `false` als er niets in te wisselen valt.
   *
   * De beloning wordt hier afgeboekt en in `abonnement-store` verzilverd; die twee horen in
   * dezelfde handeling te gebeuren, want een afgeboekt tegoed zonder verzilvering is een
   * verdwenen beloning.
   */
  claimReward: (soort: BeloningSoort) => boolean;

  /** Verdiend min ingewisseld. Nooit negatief. */
  beschikbareBeloningen: () => number;

  // --- Supabase-sync, zelfde contract als de zes andere stores ---
  isSyncing: boolean;
  syncError: string | null;
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerReferralSamen: (vanServer: ReferralData | null) => void;
  resetSyncStatus: () => void;
};

/**
 * Leest wat er uit `public.referrals` komt.
 *
 * Wantrouwig om dezelfde reden als `leesServerOntgrendelingen` en `leesServerPrestaties`:
 * `friends_invited` is `jsonb` en Postgres dwingt daar geen vorm in af, dus één kapotte inzending
 * mag niet de hele lijst onbruikbaar maken. Een onleesbare vriend valt eruit, de rest blijft.
 */
export function leesServerReferral(rij: unknown): ReferralData | null {
  if (typeof rij !== 'object' || rij === null) return null;
  const kandidaat = rij as Record<string, unknown>;

  const userId = kandidaat.user_id;
  const code = kandidaat.referral_code;
  if (typeof userId !== 'string' || typeof code !== 'string') return null;

  const vrienden: UitgenodigdeVriend[] = Array.isArray(kandidaat.friends_invited)
    ? kandidaat.friends_invited.flatMap((item): UitgenodigdeVriend[] => {
        if (typeof item !== 'object' || item === null) return [];
        const vriend = item as Record<string, unknown>;
        if (typeof vriend.friendId !== 'string') return [];
        const moment = Number(vriend.invitedAt);
        return [
          { friendId: vriend.friendId, invitedAt: Number.isFinite(moment) ? moment : Date.now() },
        ];
      })
    : [];

  const aangemaakt = Date.parse(String(kandidaat.created_at ?? ''));

  return {
    userId,
    referralCode: code,
    friendsInvited: vrienden,
    // Een verdiend aantal dat lager is dan het aantal vrienden zou betekenen dat een uitnodiging
    // zijn beloning kwijt is. Eén per vriend is de regel; de kolom is de administratie ervan.
    rewardsEarned: Math.max(Number(kandidaat.rewards_earned ?? 0) || 0, vrienden.length),
    rewardsClaimed: Math.max(Number(kandidaat.rewards_claimed ?? 0) || 0, 0),
    createdAt: Number.isNaN(aangemaakt) ? Date.now() : aangemaakt,
  };
}

const syncPlanner = maakSyncPlanner(() => useReferralStore.getState().syncToSupabase());

/** Een verse rij voor een lezer die er nog geen had. */
function nieuweReferral(userId: string): ReferralData {
  return {
    userId,
    referralCode: codeVoor(userId),
    friendsInvited: [],
    rewardsEarned: 0,
    rewardsClaimed: 0,
    createdAt: Date.now(),
  };
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      data: null,

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      generateReferralCode: () => {
        const user = useAuthStore.getState().user;
        if (!user) return '';

        const huidig = get().data;
        // Bestaat er een rij van een *andere* lezer, dan is dit toestel van eigenaar gewisseld
        // zonder dat `wisLokaleGebruikersgegevens()` langs is geweest (uitloggen wist niets, met
        // opzet). Die rij hoort niet bij deze sessie en wordt vervangen, niet aangevuld.
        if (huidig && huidig.userId === user.id) return huidig.referralCode;

        const verse = nieuweReferral(user.id);
        set({ data: verse, heeftOnverzondenWijzigingen: true });
        syncPlanner.plan();
        return verse.referralCode;
      },

      addFriendInvite: (friendId) => {
        const huidig = get().data;
        // Zonder rij is er ook geen code die iemand ingevoerd kan hebben.
        if (!huidig) return;
        if (huidig.friendsInvited.some((vriend) => vriend.friendId === friendId)) return;
        // Jezelf uitnodigen is de eerste die iemand probeert.
        if (friendId === huidig.userId) return;

        set({
          data: {
            ...huidig,
            friendsInvited: [...huidig.friendsInvited, { friendId, invitedAt: Date.now() }],
            rewardsEarned: huidig.rewardsEarned + 1,
          },
          heeftOnverzondenWijzigingen: true,
        });
        syncPlanner.plan();
      },

      claimReward: (soort) => {
        const huidig = get().data;
        if (!huidig) return false;
        if (huidig.rewardsEarned - huidig.rewardsClaimed <= 0) return false;

        // Eerst verzilveren, dan afboeken. Andersom zou een fout in `abonnement-store` een
        // afgeboekt tegoed achterlaten waar niets tegenover staat.
        if (soort === 'verhaal') {
          useAbonnementStore.getState().voegBonusVerhaalToe(1);
        } else {
          useAbonnementStore.getState().verlengPro(PRO_WEEK_DAGEN);
        }

        set({
          data: { ...huidig, rewardsClaimed: huidig.rewardsClaimed + 1 },
          heeftOnverzondenWijzigingen: true,
        });
        syncPlanner.plan();
        return true;
      },

      beschikbareBeloningen: () => {
        const huidig = get().data;
        if (!huidig) return 0;
        return Math.max(0, huidig.rewardsEarned - huidig.rewardsClaimed);
      },

      syncToSupabase: async () => {
        await wachtOpHydratie(useReferralStore);

        const { isSyncing, data } = get();
        const user = useAuthStore.getState().user;
        if (isSyncing || !user || !data) return;
        // De rij van een vorige lezer op dit toestel hoort niet onder het huidige account terecht
        // te komen. `generateReferralCode()` ruimt hem op; tot die tijd blijft hij hier staan.
        if (data.userId !== user.id) return;

        set({ isSyncing: true });

        try {
          const { error } = await supabase.from('referrals').upsert(
            {
              user_id: user.id,
              referral_code: data.referralCode,
              friends_invited: data.friendsInvited,
              rewards_earned: data.rewardsEarned,
              rewards_claimed: data.rewardsClaimed,
              created_at: new Date(data.createdAt).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
          if (error) throw error;

          set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
        } catch (fout) {
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[referral] sync mislukt:', foutTekst(fout));
        }
      },

      /**
       * Verenigt server en toestel, net als de andere stores — en niet overschrijven.
       *
       * Per veld:
       * - **vrienden**: vereniging op `friendId`, met de **vroegste** `invitedAt`. Een tweede
       *   toestel dat vandaag inlogt mag "uitgenodigd op 3 maart" niet naar vandaag verzetten.
       * - **verdiend**: het hoogste van de drie kandidaten (server, lokaal, aantal vrienden). Het
       *   aantal vrienden is de ondergrens — één beloning per uitnodiging is de regel.
       * - **ingewisseld**: het hoogste van de twee. Dubbel tellen kost de lezer hoogstens één
       *   beloning; te laag tellen laat hem dezelfde beloning op twee toestellen innen.
       * - **code**: die van de server. Hij is afgeleid van het gebruiker-id, dus hij hoort
       *   hetzelfde te zijn; wijkt hij af, dan is de serverversie degene die de vrienden hebben.
       */
      voegServerReferralSamen: (vanServer) => {
        set((state) => {
          if (!vanServer) return state;
          const lokaal = state.data;
          if (!lokaal || lokaal.userId !== vanServer.userId) {
            return { data: vanServer, heeftOnverzondenWijzigingen: false };
          }

          const perVriend = new Map<string, UitgenodigdeVriend>();
          for (const vriend of [...vanServer.friendsInvited, ...lokaal.friendsInvited]) {
            const bestaand = perVriend.get(vriend.friendId);
            perVriend.set(
              vriend.friendId,
              bestaand
                ? { friendId: vriend.friendId, invitedAt: Math.min(bestaand.invitedAt, vriend.invitedAt) }
                : vriend,
            );
          }
          const vrienden = Array.from(perVriend.values()).sort((a, b) => a.invitedAt - b.invitedAt);

          const samen: ReferralData = {
            userId: lokaal.userId,
            referralCode: vanServer.referralCode,
            friendsInvited: vrienden,
            rewardsEarned: Math.max(vanServer.rewardsEarned, lokaal.rewardsEarned, vrienden.length),
            rewardsClaimed: Math.max(vanServer.rewardsClaimed, lokaal.rewardsClaimed),
            createdAt: Math.min(vanServer.createdAt, lokaal.createdAt),
          };

          // Wijkt de uitkomst ergens af van wat de server stuurde, dan moet die terug omhoog.
          // Op de telling alleen letten is niet genoeg: even veel vrienden met lokaal een eerdere
          // datum, of een ingewisselde beloning die de server niet kent, moet ook mee.
          const wijktAf =
            samen.referralCode !== vanServer.referralCode ||
            samen.rewardsEarned !== vanServer.rewardsEarned ||
            samen.rewardsClaimed !== vanServer.rewardsClaimed ||
            samen.createdAt !== vanServer.createdAt ||
            samen.friendsInvited.length !== vanServer.friendsInvited.length ||
            samen.friendsInvited.some((vriend, index) => {
              const opServer = vanServer.friendsInvited[index];
              return (
                opServer === undefined ||
                opServer.friendId !== vriend.friendId ||
                opServer.invitedAt !== vriend.invitedAt
              );
            });

          return {
            data: samen,
            heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen || wijktAf,
          };
        });
      },

      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null });
      },
    }),
    {
      name: 'referral-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Zie story-progress-store: een bewaarde `isSyncing: true` zou de sync permanent blokkeren.
      partialize: (state) => ({
        data: state.data,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
    },
  ),
);

/**
 * Haalt de referral-rij op en voegt hem samen met wat er lokaal staat.
 *
 * Geen rij is geen fout maar een lezer die nog nooit het uitnodigingsscherm opende — `maybeSingle`
 * geeft dan `null` in plaats van een 406. Dit is de `haalOp` die `SYNC_STORES` aanroept zodra er
 * een sessie is.
 */
export async function haalReferralOp(userId: string): Promise<void> {
  await wachtOpHydratie(useReferralStore);

  const { data, error } = await supabase
    .from('referrals')
    .select('user_id, referral_code, friends_invited, rewards_earned, rewards_claimed, created_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[referral] ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  useReferralStore.getState().voegServerReferralSamen(leesServerReferral(data));
}
