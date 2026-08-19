import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  bepaalAanbeveling,
  isAanbevelingReden,
  type AanbevelingReden,
  type Leesvoortgang,
} from '@/content/aanbeveling';
import { getVerhaal } from '@/content/verhalen';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import type { Verhaal } from '@/constants/types';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useStoryProgressStore } from '@/store/story-progress-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

/**
 * Welk verhaal we deze lezer voorstelden, en waarom — de zesde sync-store.
 *
 * ## Waarom hier iets bewaard wordt terwijl het afgeleid is
 *
 * `content/aanbeveling.ts` rekent de suggestie uit de voortgang uit, offline en in een
 * milliseconde. Dat maakt deze tabel op het eerste gezicht overbodig, en bij `achievement-store`
 * was dat precies het argument om alleen op te slaan wat je niet terug kunt rekenen.
 *
 * Twee dingen kun je hier niet terugrekenen, en die zijn de reden dat de tabel bestaat:
 *
 * 1. **Wannéér we het voorstelden.** "Sinds vorige week ligt Ashoka klaar" is iets anders dan
 *    "we bedachten dit zojuist", en na het uitrekenen is dat verschil weg.
 * 2. **Wat de server mag noemen.** De push-sweep draait terwijl de app dicht is en kan de bundel
 *    niet lezen; `story_recommendations` is hoe een aanbeveling die in de app ontstond ook in een
 *    melding terecht kan komen — en hoe beide kanten hetzelfde verhaal noemen.
 *
 * Wat hier *niet* staat is of het verhaal inmiddels gelezen is. Dat weet `story-progress-store`
 * beter, en `getNext()` leest het daar. Een tweede kopie van "al gelezen" is een tweede kans om
 * een verhaal aan te bevelen dat de lezer gisteren uitlas.
 *
 * ## De melding wordt hier niet verstuurd, en dat kan ook niet
 *
 * De verleiding is om na het opschrijven meteen `supabase.functions.invoke('send-push')` aan te
 * roepen. Dat loopt op drie dingen stuk, en het eerste is hard:
 *
 * 1. **`send-push` weigert een lezerstoken** (403 `alleen_service_role`). Die controle staat er
 *    met opzet: zonder haar kan iedereen die inlogt een melding naar een willekeurige `userId`
 *    sturen, want `verify_jwt` laat elk geldig token door.
 * 2. **Er zou niemand op zitten te wachten.** Deze functie draait doordat Home open staat, dus de
 *    melding zou aankomen terwijl de lezer naar de aanbeveling kíjkt — dezelfde afweging die de
 *    ontgrendelmelding heeft geschrapt en de mijlpaal een strook maakte in plaats van een push.
 * 3. **Het bestaat al.** `push-sweep` verstuurt de categorie `recommendation` op het uur van de
 *    lezer, met dedupe en een limiet van één per week. Sinds de migratie
 *    `push_kandidaten_gebruikt_story_recommendations` kiest die sweep het verhaal uit déze tabel,
 *    dus wat hier wordt opgeschreven is precies wat er straks in de melding staat.
 *
 * De rolverdeling blijft dus die van `supabase/README-push.md`: het toestel doet wat het zelf kan
 * weten, de server doet wat alleen zij kan weten — namelijk dat je er al twee dagen niet was.
 */

export type Aanbeveling = {
  verhaalId: string;
  reden: AanbevelingReden;
  /** Epoch-ms, net als `UnlockedCharacter.unlockedAt` — niet als ISO-tekst. */
  aangemaaktOp: number;
};

/** Wat `getNext()` teruggeeft: de aanbeveling met het verhaal er al bij opgezocht. */
export type VolgendeAanbeveling = Aanbeveling & { verhaal: Verhaal };

export type RecommendationState = {
  aanbevelingen: Aanbeveling[];

  /**
   * Legt vast dat we dit verhaal voorstellen.
   *
   * Idempotent op `verhaalId`: een tweede aanbeveling voor hetzelfde verhaal is geen tweede
   * aanbeveling. Verandert alleen de reden, dan wordt die bijgewerkt en blijft het oorspronkelijke
   * moment staan — anders zou een suggestie die al een week klaarligt zichzelf steeds verversen
   * en nooit oud worden.
   */
  recommend: (verhaalId: string, reden: AanbevelingReden) => void;

  /**
   * Rekent de suggestie uit de huidige leesvoortgang uit en legt hem vast.
   *
   * Doet niets als alles al geopend is; dat is een geldige eindtoestand en geen fout.
   */
  genereerAanbeveling: () => void;

  /** Haalt de aanbevelingen van de server en voegt ze samen met wat hier staat. */
  loadRecommendations: () => Promise<void>;

  /**
   * De aanbeveling die nu nog ergens toe leidt: het nieuwste voorstel voor een verhaal dat
   * bestaat en waarvan nog geen hoofdstuk af is.
   *
   * **Nieuwste eerst**, want een latere meting berust op een vollediger beeld van wat deze lezer
   * leest. Een rij die achterhaald is (het verhaal is inmiddels uit) wordt overgeslagen in plaats
   * van verwijderd — er is bewust geen delete-policy op de tabel, en zo dooft een oude rij vanzelf
   * uit.
   *
   * `voortgang` is te overschrijven zodat dit een zuivere functie blijft; standaard leest hij
   * `story-progress-store`. Let op dat dit gewoon een aanroep is en geen selector: een component
   * die alleen hierop leunt hertekent niet wanneer de voortgang wijzigt.
   */
  getNext: (voortgang?: Leesvoortgang) => VolgendeAanbeveling | undefined;

  // --- Supabase-sync, zelfde contract als de vijf andere stores in SYNC_STORES ---
  isSyncing: boolean;
  syncError: string | null;
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerAanbevelingenSamen: (vanServer: Aanbeveling[]) => void;
  resetSyncStatus: () => void;
};

/**
 * Leest wat er uit `story_recommendations` komt.
 *
 * Wantrouwig om dezelfde reden als `leesServerPrestaties`: er staat geen check-constraint op
 * `reason` (met opzet — zie de migratie), dus een nieuwere appversie kan een reden hebben
 * geschreven die deze build niet kent. Zo'n rij valt af in plaats van als lege tekst in beeld te
 * komen; de sync herstelt hem niet, maar hij hoort ook niet bij deze versie.
 */
export function leesServerAanbevelingen(rijen: unknown): Aanbeveling[] {
  if (!Array.isArray(rijen)) return [];

  return rijen.flatMap((rij): Aanbeveling[] => {
    if (typeof rij !== 'object' || rij === null) return [];
    const kandidaat = rij as Record<string, unknown>;
    if (typeof kandidaat.story_id !== 'string') return [];
    if (!isAanbevelingReden(kandidaat.reason)) return [];

    // `created_at` is timestamptz en komt als ISO-tekst binnen. Een onparseerbare datum is geen
    // reden om de aanbeveling weg te gooien; dan telt hij als "zojuist".
    const tijd = Date.parse(String(kandidaat.created_at ?? ''));

    return [
      {
        verhaalId: kandidaat.story_id,
        reden: kandidaat.reason,
        aangemaaktOp: Number.isNaN(tijd) ? Date.now() : tijd,
      },
    ];
  });
}

const syncPlanner = maakSyncPlanner(() => useRecommendationStore.getState().syncToSupabase());

export const useRecommendationStore = create<RecommendationState>()(
  persist(
    (set, get) => ({
      aanbevelingen: [],

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      recommend: (verhaalId, reden) => {
        const bestaand = get().aanbevelingen.find((rij) => rij.verhaalId === verhaalId);
        // Zelfde verhaal, zelfde reden: er wijzigt niets, dus ook geen sync inplannen.
        if (bestaand && bestaand.reden === reden) return;

        set((state) => ({
          aanbevelingen: bestaand
            ? state.aanbevelingen.map((rij) =>
                rij.verhaalId === verhaalId ? { ...rij, reden } : rij,
              )
            : [...state.aanbevelingen, { verhaalId, reden, aangemaaktOp: Date.now() }],
          heeftOnverzondenWijzigingen: true,
        }));
        syncPlanner.plan();
      },

      genereerAanbeveling: () => {
        const keuze = bepaalAanbeveling(useStoryProgressStore.getState().progress);
        if (!keuze) return;

        // Dezelfde controle die `recommend` ook doet, hier nog een keer — niet om de schrijfactie
        // te sparen maar om de meting: de kaart op Home meet bij elke wijziging in de voortgang
        // en bij elke montage opnieuw, en een gebeurtenis die dáárop meeloopt telt hertekeningen
        // in plaats van aanbevelingen.
        const bestaand = get().aanbevelingen.find((rij) => rij.verhaalId === keuze.verhaalId);
        if (bestaand && bestaand.reden === keuze.reden) return;

        get().recommend(keuze.verhaalId, keuze.reden);

        logStoryEvent(ANALYTICS_EVENTS.RECOMMENDATION_GENERATED, {
          story_id: keuze.verhaalId,
          reason: keuze.reden,
        });
      },

      loadRecommendations: async () => {
        const user = useAuthStore.getState().user;
        // Uitgelogd is geen fout: de aanbevelingen staan dan gewoon op het toestel.
        if (!user) return;
        await haalAanbevelingenOp(user.id);
      },

      getNext: (voortgang) => {
        const stand = voortgang ?? useStoryProgressStore.getState().progress;

        return [...get().aanbevelingen]
          .sort((a, b) => b.aangemaaktOp - a.aangemaaktOp)
          .flatMap((rij): VolgendeAanbeveling[] => {
            const verhaal = getVerhaal(rij.verhaalId);
            // Uit de bundel gehaald, of er is al een hoofdstuk van af.
            if (!verhaal) return [];
            if ((stand[rij.verhaalId]?.completedChapters.length ?? 0) > 0) return [];
            return [{ ...rij, verhaal }];
          })[0];
      },

      /**
       * Duwt alle aanbevelingen omhoog. Eén `upsert` met een array, geen lus — zelfde reden als
       * bij `story_progress`: één netwerkronde, en geen half geschreven serverstand als hij
       * halverwege afbreekt.
       */
      syncToSupabase: async () => {
        await wachtOpHydratie(useRecommendationStore);

        const { isSyncing, aanbevelingen } = get();
        const user = useAuthStore.getState().user;

        if (isSyncing || !user) return;

        if (aanbevelingen.length === 0) {
          // Niets te versturen; de vlag mag dan ook weg (een verse installatie die inlogt).
          set({ heeftOnverzondenWijzigingen: false });
          return;
        }

        set({ isSyncing: true });

        try {
          const { error } = await supabase.from('story_recommendations').upsert(
            aanbevelingen.map((rij) => ({
              user_id: user.id,
              story_id: rij.verhaalId,
              reason: rij.reden,
              created_at: new Date(rij.aangemaaktOp).toISOString(),
            })),
            { onConflict: 'user_id,story_id' },
          );

          if (error) throw error;

          set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
        } catch (fout) {
          // De vlag blijft bewust staan: dit ís de wachtrij.
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[recommendation] sync mislukt:', foutTekst(fout));
        }
      },

      /**
       * Verenigt server en toestel. Bij hetzelfde verhaal wint de **vroegste** `aangemaaktOp` — en
       * de reden die bij dat moment hoorde, want een reden is een uitspraak over het moment waarop
       * hij werd opgeschreven. Zo komen twee toestellen op dezelfde rij uit, ongeacht wie het
       * laatst synchroniseerde.
       */
      voegServerAanbevelingenSamen: (vanServer) => {
        set((state) => {
          const perVerhaal = new Map<string, Aanbeveling>();

          for (const rij of [...vanServer, ...state.aanbevelingen]) {
            const bestaand = perVerhaal.get(rij.verhaalId);
            if (!bestaand || rij.aangemaaktOp < bestaand.aangemaaktOp) {
              perVerhaal.set(rij.verhaalId, rij);
            }
          }

          const samen = Array.from(perVerhaal.values()).sort(
            (a, b) => a.aangemaaktOp - b.aangemaaktOp,
          );

          // Op de telling alleen letten is niet genoeg: even veel rijen waarvan er lokaal één een
          // eerdere datum of een andere reden heeft moeten nog steeds omhoog.
          const perServerId = new Map(vanServer.map((rij) => [rij.verhaalId, rij]));
          const wijktAf = samen.some((rij) => {
            const opServer = perServerId.get(rij.verhaalId);
            return (
              opServer === undefined ||
              opServer.aangemaaktOp !== rij.aangemaaktOp ||
              opServer.reden !== rij.reden
            );
          });

          return {
            aanbevelingen: samen,
            heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen || wijktAf,
          };
        });
      },

      /** Statusvelden terug naar nul bij uitloggen; de aanbevelingen blijven op het toestel. */
      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null });
      },
    }),
    {
      name: 'recommendation-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Zie story-progress-store: een bewaarde `isSyncing: true` zou de sync permanent blokkeren.
      partialize: (state) => ({
        aanbevelingen: state.aanbevelingen,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
    },
  ),
);

/**
 * Haalt de aanbevelingen op en voegt ze samen met de lokale lijst.
 *
 * Geen rijen is geen fout maar een lege lijst: bij een verse account bestaat er nog niets. Dit is
 * de `haalOp` die `SYNC_STORES` in `use-voortgang-sync.ts` aanroept zodra er een sessie is.
 */
export async function haalAanbevelingenOp(userId: string): Promise<void> {
  await wachtOpHydratie(useRecommendationStore);

  const { data, error } = await supabase
    .from('story_recommendations')
    .select('story_id, reason, created_at')
    .eq('user_id', userId);

  if (error) {
    console.warn('[recommendation] ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  useRecommendationStore.getState().voegServerAanbevelingenSamen(leesServerAanbevelingen(data));
}
