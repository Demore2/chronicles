import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, SYNC_DEBOUNCE_MS, wachtOpHydratie } from '@/store/sync-hulp';

type VoortgangState = {
  gelezenIds: Set<string>;
  bekekenIds: Set<string>;
  completedStories: Set<string>;
  streakDagen: number;
  laatsteActiviteitDatum: string | null;
  markeerAlsGelezen: (verhaalId: string) => void;
  markeerAlsBekeken: (verhaalId: string) => void;
  markStoryCompleted: (verhaalId: string) => void;
  isStoryCompleted: (verhaalId: string) => boolean;
  registreerLeesactiviteit: () => void;

  // --- Supabase-sync (R8.AUTH deel 3) ---
  isSyncing: boolean;
  syncError: string | null;
  lastSyncTime: number | null;
  /**
   * Er staat lokaal iets dat de server nog niet heeft.
   *
   * Dit verving de `pendingSyncs: { bekekenIds, timestamp }[]`-wachtrij uit het oorspronkelijke
   * plan. Zo'n rij bewaart momentopnames van state die alleen maar *groeit* — elke oudere
   * opname is een deelverzameling van de huidige, dus na een mislukte sync stuur je hoe dan ook
   * de laatste stand. De rij zou alleen geheugen kosten en de vraag oproepen in welke volgorde
   * je hem afspeelt. Eén "dirty"-vlag zegt precies hetzelfde en overleeft een herstart.
   */
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  clearSyncError: () => void;
  voegServerVoortgangSamen: (rij: ServerVoortgang) => void;
  resetSyncStatus: () => void;
};

/** De rij zoals `public.voortgang` hem teruggeeft — kolomnamen zijn lowercase, zie hieronder. */
export type ServerVoortgang = {
  gelezenids: string[] | null;
  bekekenids: string[] | null;
  completedstories: string[] | null;
  streak: number | null;
  laatsteactiviteitdatum: string | null;
};

/**
 * De kolommen die we lezen én schrijven.
 *
 * **Alles kleingeschreven, met opzet.** Postgres vouwt niet-gequote identifiers naar lowercase,
 * dus de kolom die als `bekekenIds` is aangemaakt heet in werkelijkheid `bekekenids`. supabase-js
 * quote't wat je hier intypt; `bekekenIds` levert daarom een "column does not exist"-fout op.
 * De app-kant houdt zijn camelCase namen — deze twee regels zijn de vertaallaag.
 */
const VOORTGANG_KOLOMMEN = 'gelezenids, bekekenids, completedstories, streak, laatsteactiviteitdatum';

/**
 * Hoe lang we wachten na een wijziging voordat we pushen (deel 3: 2 seconden).
 * Woont sinds R8.SYNC-B in `sync-hulp.ts`, samen met de andere drie stores; hier alleen nog
 * doorgegeven zodat bestaande imports uit deze module blijven werken.
 */
export { SYNC_DEBOUNCE_MS };

/**
 * Datumsleutel in de **lokale** tijdzone (LAUNCH-PLAN.md B6).
 *
 * Hier stond `new Date().toISOString().slice(0, 10)`, en dat is UTC. In UTC+2 begon "morgen" dus
 * om 22:00: wie 's avonds las kreeg meteen een streakdag erbij, en wie de volgende ochtend
 * verder las telde twee dagen als één. `getFullYear/getMonth/getDate` lezen de lokale kalender,
 * wat is wat een gebruiker onder "een dag" verstaat.
 */
function datumSleutel(datum: Date): string {
  const jaar = datum.getFullYear();
  const maand = String(datum.getMonth() + 1).padStart(2, '0');
  const dag = String(datum.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

function vandaag(nu: Date = new Date()): string {
  return datumSleutel(nu);
}

function gisteren(nu: Date = new Date()): string {
  const datum = new Date(nu);
  datum.setDate(datum.getDate() - 1);
  return datumSleutel(datum);
}

/**
 * De **werkelijke** streak op dit moment, afgeleid uit de opgeslagen waarde.
 *
 * De opgeslagen `streakDagen` wordt alleen bijgewerkt als je iets leest, dus na twee stille dagen
 * blijft daar het oude getal staan. Deze functie is de enige plek waar een streak "verloopt":
 * hij telt alleen als de laatste leesdag vandaag of gisteren was. Gisteren telt nog mee — de dag
 * is nog niet voorbij en je kunt hem nog redden.
 *
 * Exporteren (in plaats van in de store zetten) zodat het scherm hem bij elke render opnieuw kan
 * uitrekenen: een streak verloopt door het verstrijken van tijd, niet door een state-wijziging.
 */
export function berekenHuidigeStreak(
  streakDagen: number,
  laatsteActiviteitDatum: string | null,
  nu: Date = new Date()
): number {
  if (!laatsteActiviteitDatum) return 0;
  if (laatsteActiviteitDatum === vandaag(nu) || laatsteActiviteitDatum === gisteren(nu)) {
    return streakDagen;
  }
  return 0;
}

function bijgewerkteStreak(laatsteActiviteitDatum: string | null, streakDagen: number) {
  const vandaagStr = vandaag();
  if (laatsteActiviteitDatum === vandaagStr) {
    return { streakDagen, laatsteActiviteitDatum: vandaagStr };
  }
  // Vervolg op gisteren = +1, anders begint de telling opnieuw bij 1 (vandaag is dag één).
  const nieuweStreak = laatsteActiviteitDatum === gisteren() ? streakDagen + 1 : 1;
  return { streakDagen: nieuweStreak, laatsteActiviteitDatum: vandaagStr };
}

type SerializedSet = { __type: 'Set'; values: string[] };

function isSerializedSet(value: unknown): value is SerializedSet {
  return typeof value === 'object' && value !== null && (value as { __type?: unknown }).__type === 'Set';
}

/**
 * Zet de sync 2 seconden vooruit. Aangeroepen door élke muterende actie hieronder.
 *
 * Bewust hier en niet via `store.subscribe`: `voegServerVoortgangSamen` wijzigt óók state, en een
 * abonnement op alles zou daar meteen een push op terugsturen — een echo van wat we net binnen
 * hebben gehaald. De timer zelf zit in `maakSyncPlanner` — op moduleniveau en niet in de state,
 * want een timer-id hoort niet in AsyncStorage en mag geen render veroorzaken.
 */
const syncPlanner = maakSyncPlanner(() => useVoortgangStore.getState().syncToSupabase());

function plandeSync() {
  syncPlanner.plan();
}

export const useVoortgangStore = create<VoortgangState>()(
  persist(
    (set, get) => ({
      gelezenIds: new Set<string>(),
      bekekenIds: new Set<string>(),
      completedStories: new Set<string>(),
      // Begint op 0, niet op 1: een verse gebruiker die nog niets heeft gelezen kreeg anders
      // meteen "1 day streak" te zien (LAUNCH-PLAN.md B6).
      streakDagen: 0,
      laatsteActiviteitDatum: null,

      isSyncing: false,
      syncError: null,
      lastSyncTime: null,
      heeftOnverzondenWijzigingen: false,

      markeerAlsGelezen: (verhaalId) => {
        set((state) => ({
          gelezenIds: new Set(state.gelezenIds).add(verhaalId),
          ...bijgewerkteStreak(state.laatsteActiviteitDatum, state.streakDagen),
          heeftOnverzondenWijzigingen: true,
        }));
        plandeSync();
      },
      // Bewust géén streak-update: dit is het *openen* van een verhaal (de redirect in
      // `verhaal/[id].tsx`), en het scherm zelf zegt "read a story every day". Een streak die
      // oploopt van tikken zonder lezen is geen streak. Alleen een afgerond hoofdstuk telt —
      // zie `registreerLeesactiviteit`.
      markeerAlsBekeken: (verhaalId) => {
        set((state) => ({
          bekekenIds: new Set(state.bekekenIds).add(verhaalId),
          heeftOnverzondenWijzigingen: true,
        }));
        plandeSync();
      },
      markStoryCompleted: (verhaalId) => {
        set((state) => ({
          completedStories: new Set(state.completedStories).add(verhaalId),
          ...bijgewerkteStreak(state.laatsteActiviteitDatum, state.streakDagen),
          heeftOnverzondenWijzigingen: true,
        }));
        plandeSync();
      },
      isStoryCompleted: (verhaalId) => get().completedStories.has(verhaalId),
      registreerLeesactiviteit: () => {
        set((state) => ({
          ...bijgewerkteStreak(state.laatsteActiviteitDatum, state.streakDagen),
          heeftOnverzondenWijzigingen: true,
        }));
        plandeSync();
      },

      /**
       * Duwt de hele lokale voortgang naar `public.voortgang`.
       *
       * Eén `upsert` op `user_id` in plaats van select-dan-insert: sinds de migratie van deel 3
       * staat er een unieke index op die kolom, en zonder die index kan Postgres `on conflict`
       * niet uitvoeren. Zonder upsert zou een tweede sync die met de eerste racet een tweede rij
       * voor dezelfde gebruiker achterlaten.
       *
       * Faalt hij (offline, 401, server weg), dan blijft `heeftOnverzondenWijzigingen` staan en
       * doet de volgende trigger — reconnect, terug naar de voorgrond, of de volgende wijziging —
       * het gewoon opnieuw. Er wordt niets weggegooid en er wordt niet in een lus geprobeerd.
       */
      syncToSupabase: async () => {
        // Eerst wachten tot AsyncStorage is uitgelezen. Duwen we vóór de hydratie, dan sturen we
        // de *lege* beginstand omhoog en overschrijft die upsert de echte rij op de server.
        await wachtOpHydratie(useVoortgangStore);

        const { isSyncing } = get();
        const user = useAuthStore.getState().user;

        // Uitgelogd is geen fout: de voortgang blijft dan gewoon op het apparaat staan, zoals
        // voor deel 3. `syncError` daarom niet zetten — er valt niets te herstellen.
        if (isSyncing || !user) return;

        set({ isSyncing: true });

        try {
          const { gelezenIds, bekekenIds, completedStories, streakDagen, laatsteActiviteitDatum } = get();

          const { error } = await supabase.from('voortgang').upsert(
            {
              user_id: user.id,
              gelezenids: Array.from(gelezenIds),
              bekekenids: Array.from(bekekenIds),
              completedstories: Array.from(completedStories),
              streak: streakDagen,
              laatsteactiviteitdatum: laatsteActiviteitDatum,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

          if (error) throw error;

          set({
            isSyncing: false,
            syncError: null,
            lastSyncTime: Date.now(),
            heeftOnverzondenWijzigingen: false,
          });
        } catch (fout) {
          // De vlag blijft bewust staan: dit ís de wachtrij.
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[voortgang] sync mislukt:', foutTekst(fout));
        }
      },

      clearSyncError: () => set({ syncError: null }),

      /**
       * Voegt de serverrij samen met wat er lokaal staat. Aangeroepen zodra er een sessie is
       * (zie `herstelSessie` in `useAuth`).
       *
       * **Samenvoegen, niet overschrijven.** Het oorspronkelijke plan zette de lokale state
       * simpelweg op de serverwaarden. Dat wist alles wat je las vóórdat je inlogde, en alles wat
       * je op dit toestel offline las terwijl een ander toestel wél synchroniseerde. Deze drie
       * verzamelingen groeien alleen maar — een verhaal wordt nooit ontlezen — dus is de
       * vereniging altijd de juiste uitkomst en kan er per definitie niets verdwijnen. Daarmee is
       * meteen punt 3 uit de checkpoint (lokale voortgang van vóór het inloggen) afgehandeld:
       * die wordt bij de eerste sync opgenomen in het account.
       *
       * De streak is geen verzameling en kan dus niet verenigd worden: de meest recente leesdag
       * wint, en bij een gelijkspel het hoogste aantal dagen.
       */
      voegServerVoortgangSamen: (rij) => {
        set((state) => {
          const gelezenIds = new Set([...state.gelezenIds, ...(rij.gelezenids ?? [])]);
          const bekekenIds = new Set([...state.bekekenIds, ...(rij.bekekenids ?? [])]);
          const completedStories = new Set([...state.completedStories, ...(rij.completedstories ?? [])]);

          const serverDatum = rij.laatsteactiviteitdatum;
          const serverStreak = rij.streak ?? 0;
          const lokaalDatum = state.laatsteActiviteitDatum;

          let streakDagen = state.streakDagen;
          let laatsteActiviteitDatum = lokaalDatum;
          if (serverDatum && (!lokaalDatum || serverDatum > lokaalDatum)) {
            streakDagen = serverStreak;
            laatsteActiviteitDatum = serverDatum;
          } else if (serverDatum && serverDatum === lokaalDatum) {
            streakDagen = Math.max(state.streakDagen, serverStreak);
          }

          // Het lokale toestel had iets wat de server niet had als een van de verzamelingen is
          // gegroeid of de streak lokaal verder staat. Dan moet het antwoord terug omhoog.
          const isGegroeid =
            gelezenIds.size > (rij.gelezenids?.length ?? 0) ||
            bekekenIds.size > (rij.bekekenids?.length ?? 0) ||
            completedStories.size > (rij.completedstories?.length ?? 0) ||
            laatsteActiviteitDatum !== serverDatum ||
            streakDagen !== serverStreak;

          return {
            gelezenIds,
            bekekenIds,
            completedStories,
            streakDagen,
            laatsteActiviteitDatum,
            heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen || isGegroeid,
          };
        });
      },

      /**
       * De statusvelden terug naar nul, bij uitloggen.
       *
       * De voortgang zelf blijft staan — dat is de belofte die het uitlogdialoog op Profiel doet
       * ("your reading progress stays on this device"), en de rij op de server is inmiddels de
       * kopie voor de volgende keer.
       *
       * `heeftOnverzondenWijzigingen` blijft óók staan, met opzet. Die vlag beschrijft geen
       * sessie maar het verschil tussen dit toestel en de server; uitloggen terwijl de laatste
       * push mislukte (offline) mag dat verschil niet wegpoetsen, anders is er bij de volgende
       * login niets meer dat zegt dat er nog iets omhoog moet.
       */
      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null, lastSyncTime: null });
      },
    }),
    {
      name: 'voortgang-storage',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage, {
        replacer: (_key, value) => (value instanceof Set ? { __type: 'Set', values: Array.from(value) } : value),
        reviver: (_key, value) => (isSerializedSet(value) ? new Set(value.values) : value),
      }),
      /**
       * `isSyncing` en `syncError` mogen niet mee naar AsyncStorage.
       *
       * Wordt de app afgesloten terwijl een upsert loopt, dan komt `isSyncing: true` bij de
       * volgende start weer terug — en de eerste regel van `syncToSupabase` is "loopt er al een,
       * dan niets doen". De sync zou dan voorgoed dood zijn. `heeftOnverzondenWijzigingen`
       * bewaren we juist wél: dat is precies de wachtrij die een herstart moet overleven.
       */
      partialize: (state) => ({
        gelezenIds: state.gelezenIds,
        bekekenIds: state.bekekenIds,
        completedStories: state.completedStories,
        streakDagen: state.streakDagen,
        laatsteActiviteitDatum: state.laatsteActiviteitDatum,
        lastSyncTime: state.lastSyncTime,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<VoortgangState> | undefined;
        if (state && version === 0) {
          // v0 begon op `streakDagen: 1` met `laatsteActiviteitDatum: null`. Wie de app had
          // geïnstalleerd maar nooit iets afmaakte, draagt dat spook-getal mee.
          if (!state.laatsteActiviteitDatum) {
            state.streakDagen = 0;
          }
          // De datums uit v0 zijn UTC-sleutels. Die zijn hooguit één dag verschoven t.o.v. de
          // lokale kalender; herrekenen kan niet (de tijdstippen zijn nooit opgeslagen), en in
          // het slechtste geval verloopt één streak een dag te vroeg. Bewust zo gelaten.
        }
        return persistedState as VoortgangState;
      },
    }
  )
);

/**
 * Haalt de serverrij op en voegt hem samen met de lokale state.
 *
 * `maybeSingle()` — een ontbrekende rij is geen fout maar een lege waarde: bij een signup met
 * e-mailbevestiging bestaat hij nog niet. Dan valt er niets samen te voegen en blijft de lokale
 * voortgang staan, die de eerstvolgende push alsnog naar boven brengt.
 */
export async function haalVoortgangOp(userId: string): Promise<void> {
  await wachtOpHydratie(useVoortgangStore);

  const { data, error } = await supabase
    .from('voortgang')
    .select(VOORTGANG_KOLOMMEN)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[voortgang] ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  useVoortgangStore.getState().voegServerVoortgangSamen(data as ServerVoortgang);
}
