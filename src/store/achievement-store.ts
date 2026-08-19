import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PRESTATIES, puntenVoor, type PrestatieStand } from '@/constants/prestaties';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

/**
 * Wanneer een mijlpaal is verdiend, wat hij opleverde en of hij is gedeeld — de vijfde
 * sync-store.
 *
 * ## Waarom dit náást `prestatie-store` staat en niet erin
 *
 * Die twee lijken op elkaar en zijn precies tegengesteld bedoeld:
 *
 * | | `prestatie-store` | `achievement-store` (hier) |
 * |---|---|---|
 * | Bewaart | welke aankondiging je op **dit toestel** hebt gezien | wanneer je hem **verdiende** |
 * | Hoort bij | het toestel | het account |
 * | Synchroniseert | **nooit**, met opzet | ja, als vijfde in `SYNC_STORES` |
 *
 * `prestatie-store` mág niet synchroniseren: dan zou een tweede toestel bij de eerste login
 * veertien felicitaties overslaan óf ze alsnog allemaal tonen (het staat daar uitgeschreven bij
 * `geinitialiseerd`). Deze store móét juist wél, want "verdiend op 3 maart" is een feit over de
 * lezer en niet over de telefoon. Eén store met twee tegengestelde sync-regels is een store die
 * de ene helft van zijn velden altijd verkeerd behandelt.
 *
 * ## Waarom dit géén tweede bron van waarheid is
 *
 * Óf een mijlpaal behaald is blijft afgeleid uit voortgang (`behaaldePrestaties()` in
 * `constants/prestaties.ts`) en dus offline te beantwoorden. Deze store voegt alleen toe wat je
 * uit een teller niet terug kunt rekenen: het moment, en de deelstatus. Het raster leest daarom
 * nog steeds de afgeleide stand voor "behaald ja/nee", en deze store voor de datum ernaast.
 *
 * Praktisch gevolg: een mijlpaal kan hier ontbreken terwijl hij wél behaald is (je verdiende hem
 * offline en de push staat nog open). Dat is de goede kant om fout te gaan — de badge staat er,
 * alleen de datum komt later.
 */

export type PrestatieOntgrendeling = {
  /** Een id uit `PRESTATIES`. */
  prestatieId: string;
  /** Epoch-ms. Als getal en niet als ISO-tekst, net als `UnlockedCharacter.unlockedAt`. */
  unlockedAt: number;
  gedeeld: boolean;
  gedeeldOp: number | null;
};

export type AchievementState = {
  ontgrendeld: PrestatieOntgrendeling[];
  /**
   * De laatst gemeten stand van de vier tellers, voor `achievement_progress`.
   *
   * Hij staat hier en wordt niet in `syncToSupabase` opnieuw uitgerekend, omdat die vier tellers
   * uit vier andere stores komen — de sync zou dan van alle vier de hydratie moeten afwachten om
   * een tabel te vullen die niemand in de app leest. `use-prestaties.ts` heeft de stand toch al
   * berekend en geeft hem hier af.
   */
  stand: PrestatieStand | null;

  /**
   * Schrijft ids bij als verdiend, met het moment van nú.
   *
   * Idempotent: een id die er al staat wordt niet overschreven, want de eerste registratie is de
   * juiste. Alleen echt nieuwe ids zetten de sync-vlag.
   */
  registreer: (ids: string[]) => void;
  zetStand: (stand: PrestatieStand) => void;
  markeerGedeeld: (id: string) => void;
  ontgrendelingVoor: (id: string) => PrestatieOntgrendeling | undefined;
  /** Punten van alles wat hier als verdiend staat. */
  totalePunten: () => number;

  // --- Supabase-sync, zelfde contract als de vier andere stores ---
  isSyncing: boolean;
  syncError: string | null;
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerOntgrendelingenSamen: (vanServer: PrestatieOntgrendeling[]) => void;
  resetSyncStatus: () => void;
};

/**
 * Leest wat er uit `user_achievements` komt.
 *
 * Wantrouwig om dezelfde reden als `leesServerOntgrendelingen`: een rij kan van een oudere
 * appversie komen, en één kapotte rij mag niet de hele lijst onbruikbaar maken. Een onbekende
 * `achievement_id` valt af — dat is een mijlpaal die uit `PRESTATIES` is gehaald, en die hoort
 * niet als naamloze tegel terug te komen.
 */
export function leesServerPrestaties(rijen: unknown): PrestatieOntgrendeling[] {
  if (!Array.isArray(rijen)) return [];
  const bekend = new Set<string>(PRESTATIES.map((prestatie) => prestatie.id));

  return rijen.flatMap((rij): PrestatieOntgrendeling[] => {
    if (typeof rij !== 'object' || rij === null) return [];
    const kandidaat = rij as Record<string, unknown>;
    const id = kandidaat.achievement_id;
    if (typeof id !== 'string' || !bekend.has(id)) return [];

    // `unlocked_at` is timestamptz en komt als ISO-tekst binnen. Een onparseerbare datum is geen
    // reden om de ontgrendeling weg te gooien; dan telt hij als "zojuist".
    const tijd = Date.parse(String(kandidaat.unlocked_at ?? ''));
    const gedeeldOp = Date.parse(String(kandidaat.shared_at ?? ''));

    return [
      {
        prestatieId: id,
        unlockedAt: Number.isNaN(tijd) ? Date.now() : tijd,
        gedeeld: kandidaat.shared === true,
        gedeeldOp: Number.isNaN(gedeeldOp) ? null : gedeeldOp,
      },
    ];
  });
}

const syncPlanner = maakSyncPlanner(() => useAchievementStore.getState().syncToSupabase());

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      ontgrendeld: [],
      stand: null,

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      registreer: (ids) => {
        const bestaand = new Set(get().ontgrendeld.map((rij) => rij.prestatieId));
        const nieuw = ids.filter((id) => !bestaand.has(id));
        if (nieuw.length === 0) return;

        // Eén tijdstempel voor de hele batch: ze komen uit dezelfde meting, dus ze op een paar
        // milliseconden uit elkaar zetten zou een volgorde suggereren die er niet is.
        const nu = Date.now();
        set((state) => ({
          ontgrendeld: [
            ...state.ontgrendeld,
            ...nieuw.map((prestatieId) => ({
              prestatieId,
              unlockedAt: nu,
              gedeeld: false,
              gedeeldOp: null,
            })),
          ],
          heeftOnverzondenWijzigingen: true,
        }));
        syncPlanner.plan();
      },

      zetStand: (stand) => {
        const huidig = get().stand;
        // Alleen bij een echte wijziging: `use-prestaties.ts` meet ook bij elke terugkeer naar de
        // voorgrond, en een identieke stand hoeft geen sync te kosten.
        if (
          huidig &&
          huidig.hoofdstukken === stand.hoofdstukken &&
          huidig.verhalen === stand.verhalen &&
          huidig.personages === stand.personages &&
          huidig.streak === stand.streak
        ) {
          return;
        }
        set({ stand, heeftOnverzondenWijzigingen: true });
        syncPlanner.plan();
      },

      markeerGedeeld: (id) => {
        const rij = get().ontgrendeld.find((item) => item.prestatieId === id);
        // Niet verdiend, of al gedeeld: niets te melden. Delen is geen teller.
        if (!rij || rij.gedeeld) return;

        const nu = Date.now();
        set((state) => ({
          ontgrendeld: state.ontgrendeld.map((item) =>
            item.prestatieId === id ? { ...item, gedeeld: true, gedeeldOp: nu } : item
          ),
          heeftOnverzondenWijzigingen: true,
        }));
        syncPlanner.plan();
      },

      ontgrendelingVoor: (id) => get().ontgrendeld.find((rij) => rij.prestatieId === id),

      totalePunten: () => puntenVoor(get().ontgrendeld.map((rij) => rij.prestatieId)),

      /**
       * Duwt de ontgrendelingen én de deelvoortgang omhoog.
       *
       * Twee upserts van een array, geen lus over veertien rijen — zelfde reden als bij
       * `story_progress`: een lus is veertien rondes en laat bij een afbreking halverwege een
       * half geschreven serverstand achter.
       */
      syncToSupabase: async () => {
        await wachtOpHydratie(useAchievementStore);

        const { isSyncing, ontgrendeld, stand } = get();
        const user = useAuthStore.getState().user;
        if (isSyncing || !user) return;

        set({ isSyncing: true });

        try {
          if (ontgrendeld.length > 0) {
            const { error } = await supabase.from('user_achievements').upsert(
              ontgrendeld.map((rij) => ({
                user_id: user.id,
                achievement_id: rij.prestatieId,
                unlocked_at: new Date(rij.unlockedAt).toISOString(),
                shared: rij.gedeeld,
                shared_at: rij.gedeeldOp === null ? null : new Date(rij.gedeeldOp).toISOString(),
              })),
              { onConflict: 'user_id,achievement_id' }
            );
            if (error) throw error;
          }

          // **Alle veertien, ook de behaalde.** De verleiding is om alleen de openstaande te
          // schrijven, maar er is bewust geen delete-policy op deze tabel: de rij van een
          // zojuist behaalde mijlpaal zou dan voor altijd op "9 van de 10" blijven staan, en
          // een win-back-sweep stuurt "nog één hoofdstuk te gaan" voor iets dat al binnen is.
          // Zo leest de tabel zichzelf: behaald is precies `current_value >= target_value`.
          if (stand) {
            const { error } = await supabase.from('achievement_progress').upsert(
              PRESTATIES.map((prestatie) => ({
                user_id: user.id,
                achievement_id: prestatie.id,
                // Afgetopt op de drempel: hoger dan het doel is geen zinnige "3 van de 7".
                current_value: Math.min(stand[prestatie.categorie], prestatie.drempel),
                target_value: prestatie.drempel,
                updated_at: new Date().toISOString(),
              })),
              { onConflict: 'user_id,achievement_id' }
            );
            if (error) throw error;
          }

          set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
        } catch (fout) {
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[achievement] sync mislukt:', foutTekst(fout));
        }
      },

      /**
       * Verenigt server en toestel. Bij dezelfde mijlpaal wint de **vroegste** `unlockedAt` — dat
       * is het moment waarop je hem echt verdiende, en een tweede toestel dat vandaag inlogt mag
       * "verdiend op 3 maart" niet naar vandaag verzetten.
       *
       * `gedeeld` is een OF: gedeeld blijft gedeeld, ook als het andere toestel dat niet weet.
       */
      voegServerOntgrendelingenSamen: (vanServer) => {
        set((state) => {
          const perId = new Map<string, PrestatieOntgrendeling>();

          for (const rij of [...vanServer, ...state.ontgrendeld]) {
            const bestaand = perId.get(rij.prestatieId);
            if (!bestaand) {
              perId.set(rij.prestatieId, rij);
              continue;
            }
            perId.set(rij.prestatieId, {
              prestatieId: rij.prestatieId,
              unlockedAt: Math.min(bestaand.unlockedAt, rij.unlockedAt),
              gedeeld: bestaand.gedeeld || rij.gedeeld,
              // De vroegste keer dat er gedeeld is, van de kant die het weet.
              gedeeldOp:
                bestaand.gedeeldOp === null
                  ? rij.gedeeldOp
                  : rij.gedeeldOp === null
                    ? bestaand.gedeeldOp
                    : Math.min(bestaand.gedeeldOp, rij.gedeeldOp),
            });
          }

          const samen = Array.from(perId.values()).sort((a, b) => a.unlockedAt - b.unlockedAt);

          // Wijkt de uitkomst ergens af van wat de server stuurde, dan moet die terug omhoog.
          // Op de telling alleen letten is niet genoeg: even veel rijen met lokaal een eerdere
          // datum of een deelvlag die de server niet kent zou dan nooit worden weggeschreven.
          const perServerId = new Map(vanServer.map((rij) => [rij.prestatieId, rij]));
          const wijktAf = samen.some((rij) => {
            const opServer = perServerId.get(rij.prestatieId);
            return (
              opServer === undefined ||
              opServer.unlockedAt !== rij.unlockedAt ||
              opServer.gedeeld !== rij.gedeeld
            );
          });

          return {
            ontgrendeld: samen,
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
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // `isSyncing`/`syncError` blijven buiten de opslag: een bewaarde `isSyncing: true` zou elke
      // toekomstige sync blokkeren. Zie story-progress-store.
      partialize: (state) => ({
        ontgrendeld: state.ontgrendeld,
        stand: state.stand,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
    }
  )
);

/**
 * Haalt de ontgrendelingen op en voegt ze samen met wat er lokaal staat.
 *
 * De deelvoortgang wordt bewust **niet** teruggelezen: de app rekent die zelf uit de vier tellers
 * uit en doet dat offline en actueler. `achievement_progress` bestaat voor de server, niet voor
 * de client.
 */
export async function haalPrestatieOntgrendelingenOp(userId: string): Promise<void> {
  await wachtOpHydratie(useAchievementStore);

  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at, shared, shared_at')
    .eq('user_id', userId);

  if (error) {
    console.warn('[achievement] ophalen mislukt:', error.message);
    return;
  }

  useAchievementStore.getState().voegServerOntgrendelingenSamen(leesServerPrestaties(data));
}
