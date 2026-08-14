import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

export type StoryProgress = {
  completedChapters: number[];
};

export type StoryProgressState = {
  progress: Record<string, StoryProgress>;
  getChapterProgress: (verhaalId: string) => StoryProgress;
  completeChapter: (verhaalId: string, chapterId: number) => void;
  isChapterUnlocked: (verhaalId: string, chapterId: number, totalChapters: number) => boolean;

  // --- Supabase-sync (R8.SYNC-B) ---
  isSyncing: boolean;
  syncError: string | null;
  /** Er staat lokaal een afgerond hoofdstuk dat de server nog niet heeft. Overleeft een herstart. */
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerVoortgangSamen: (rijen: ServerHoofdstukVoortgang[]) => void;
  resetSyncStatus: () => void;
};

/** Eén rij uit `public.story_progress` — kolomnamen snake_case, zoals ze in Postgres staan. */
export type ServerHoofdstukVoortgang = {
  verhaal_id: string;
  completed_chapters: number[] | null;
};

/** De kolommen die we lezen. */
const STORY_PROGRESS_KOLOMMEN = 'verhaal_id, completed_chapters';

/**
 * Het aantal afgeronde hoofdstukken over alle verhalen heen.
 *
 * Dit is de bron voor de "chapters done"-teller op Profiel (LAUNCH-PLAN.md B6). Die las
 * `voortgangStore.bekekenIds.size` — het aantal *geopende verhalen* — en stond daardoor op 2
 * terwijl er 8 hoofdstukken af waren. Een losse functie (geen store-methode) zodat een
 * component hem in een `useMemo` op `progress` kan draaien en netjes hertekent.
 */
export function telVoltooideHoofdstukken(progress: Record<string, StoryProgress>): number {
  return Object.values(progress).reduce((som, verhaal) => som + verhaal.completedChapters.length, 0);
}

/**
 * Zet de sync twee seconden vooruit. Aangeroepen door `completeChapter`.
 *
 * Bewust een expliciete aanroep en geen `store.subscribe`: `voegServerVoortgangSamen` wijzigt óók
 * `progress`, en een abonnement op alles zou daar meteen een push op terugsturen — een echo van
 * wat we net hebben opgehaald.
 */
const syncPlanner = maakSyncPlanner(() => useStoryProgressStore.getState().syncToSupabase());

export const useStoryProgressStore = create<StoryProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      getChapterProgress: (verhaalId) => {
        return get().progress[verhaalId] ?? { completedChapters: [] };
      },

      completeChapter: (verhaalId, chapterId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [] };
          const completed = new Set(current.completedChapters);
          completed.add(chapterId);
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: Array.from(completed).sort((a, b) => a - b),
              },
            },
            heeftOnverzondenWijzigingen: true,
          };
        });
        syncPlanner.plan();
      },

      isChapterUnlocked: (verhaalId, chapterId, totalChapters) => {
        if (chapterId === 1) return true;
        const progress = get().getChapterProgress(verhaalId);
        return progress.completedChapters.includes(chapterId - 1);
      },

      /**
       * Duwt alle hoofdstukvoortgang naar `public.story_progress`.
       *
       * Eén `upsert` met een array in plaats van een lus met een upsert per verhaal: dat is één
       * netwerkronde in plaats van negentien, en het is atomair — een halverwege afgebroken lus
       * laat de server in een tussenstand achter waar de volgende merge zich op baseert.
       *
       * Faalt hij (offline, 401), dan blijft `heeftOnverzondenWijzigingen` staan en probeert de
       * volgende trigger het opnieuw. Er wordt niets weggegooid en niet in een lus geprobeerd.
       */
      syncToSupabase: async () => {
        // Eerst wachten tot AsyncStorage is uitgelezen — anders pushen we de lege beginstand.
        await wachtOpHydratie(useStoryProgressStore);

        const { isSyncing, progress } = get();
        const user = useAuthStore.getState().user;

        // Uitgelogd is geen fout: de voortgang blijft dan gewoon op het apparaat staan.
        if (isSyncing || !user) return;

        const rijen = Object.entries(progress).map(([verhaalId, verhaal]) => ({
          user_id: user.id,
          verhaal_id: verhaalId,
          completed_chapters: verhaal.completedChapters,
          updated_at: new Date().toISOString(),
        }));

        if (rijen.length === 0) {
          // Niets om te versturen; de vlag mag dan ook weg (een verse installatie die inlogt).
          set({ heeftOnverzondenWijzigingen: false });
          return;
        }

        set({ isSyncing: true });

        try {
          const { error } = await supabase
            .from('story_progress')
            .upsert(rijen, { onConflict: 'user_id,verhaal_id' });

          if (error) throw error;

          set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
        } catch (fout) {
          // De vlag blijft bewust staan: dit ís de wachtrij.
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[story-progress] sync mislukt:', foutTekst(fout));
        }
      },

      /**
       * Voegt de serverrijen samen met wat er lokaal staat. Aangeroepen zodra er een sessie is.
       *
       * **Samenvoegen, niet overschrijven** — net als bij `voortgang-store`. Een hoofdstuk wordt
       * nooit *on*gelezen, dus de vereniging per verhaal is altijd de juiste uitkomst en kan per
       * definitie niets verliezen: niet wat je op dit toestel offline las, en niet wat je las
       * vóórdat je een account had. Dat laatste is meteen hoe lokale voortgang het account in komt.
       */
      voegServerVoortgangSamen: (rijen) => {
        set((state) => {
          const progress: Record<string, StoryProgress> = { ...state.progress };
          let lokaalWeetMeer = false;

          for (const rij of rijen) {
            const lokaal = state.progress[rij.verhaal_id]?.completedChapters ?? [];
            const vanServer = rij.completed_chapters ?? [];
            const samen = Array.from(new Set([...lokaal, ...vanServer])).sort((a, b) => a - b);

            if (samen.length > vanServer.length) lokaalWeetMeer = true;
            progress[rij.verhaal_id] = { completedChapters: samen };
          }

          // Verhalen die alleen lokaal bestaan komen niet in de lus hierboven voor, maar moeten
          // wél omhoog — anders blijft een verhaal dat je vóór het inloggen las eeuwig lokaal.
          const serverIds = new Set(rijen.map((rij) => rij.verhaal_id));
          if (Object.keys(state.progress).some((id) => !serverIds.has(id))) lokaalWeetMeer = true;

          return {
            progress,
            heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen || lokaalWeetMeer,
          };
        });
      },

      /**
       * Statusvelden terug naar nul bij uitloggen. De voortgang zelf blijft staan — dat is de
       * belofte die het uitlogdialoog op Profiel doet.
       *
       * `heeftOnverzondenWijzigingen` blijft óók staan: die vlag beschrijft het verschil tussen dit
       * toestel en de server, en uitloggen terwijl de laatste push mislukte mag dat niet wegpoetsen.
       */
      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null });
      },
    }),
    {
      name: 'story-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * `isSyncing` en `syncError` mogen niet mee naar AsyncStorage: een bewaarde
       * `isSyncing: true` (app gesloten tijdens een upsert) laat elke volgende sync bij de
       * eerste regel afslaan en is dus permanent. De dirty-vlag bewaren we juist wél.
       */
      partialize: (state) => ({
        progress: state.progress,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
    },
  ),
);

/**
 * Haalt de hoofdstukvoortgang op en voegt hem samen met de lokale state.
 *
 * Geen rijen is geen fout maar een lege lijst: bij een verse account bestaat er nog niets. Dan
 * valt er niets samen te voegen en blijft de lokale voortgang staan, die de push erna alsnog
 * naar boven brengt.
 */
export async function haalHoofdstukVoortgangOp(userId: string): Promise<void> {
  await wachtOpHydratie(useStoryProgressStore);

  const { data, error } = await supabase
    .from('story_progress')
    .select(STORY_PROGRESS_KOLOMMEN)
    .eq('user_id', userId);

  if (error) {
    console.warn('[story-progress] ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  useStoryProgressStore.getState().voegServerVoortgangSamen(data as ServerHoofdstukVoortgang[]);
}
