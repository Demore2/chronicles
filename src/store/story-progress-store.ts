import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type StoryProgress = {
  completedChapters: number[];
};

export type StoryProgressState = {
  progress: Record<string, StoryProgress>;
  getChapterProgress: (verhaalId: string) => StoryProgress;
  completeChapter: (verhaalId: string, chapterId: number) => void;
  isChapterUnlocked: (verhaalId: string, chapterId: number, totalChapters: number) => boolean;
};

export const useStoryProgressStore = create<StoryProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

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
          };
        });
      },

      isChapterUnlocked: (verhaalId, chapterId, totalChapters) => {
        if (chapterId === 1) return true;
        const progress = get().getChapterProgress(verhaalId);
        return progress.completedChapters.includes(chapterId - 1);
      },
    }),
    {
      name: 'story-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
