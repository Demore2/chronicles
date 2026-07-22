import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type StoryProgress = {
  completedChapters: number[];
  quizCompleted: boolean;
};

export type StoryProgressState = {
  progress: Record<string, StoryProgress>;
  getChapterProgress: (verhaalId: string) => StoryProgress;
  completeChapter: (verhaalId: string, chapterId: number) => void;
  completeQuiz: (verhaalId: string) => void;
  isChapterUnlocked: (verhaalId: string, chapterId: number, totalChapters: number) => boolean;
  isQuizUnlocked: (verhaalId: string, totalChapters: number) => boolean;
};

export const useStoryProgressStore = create<StoryProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      getChapterProgress: (verhaalId) => {
        return get().progress[verhaalId] ?? { completedChapters: [], quizCompleted: false };
      },

      completeChapter: (verhaalId, chapterId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false };
          const completed = new Set(current.completedChapters);
          completed.add(chapterId);
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: Array.from(completed).sort((a, b) => a - b),
                quizCompleted: current.quizCompleted,
              },
            },
          };
        });
      },

      completeQuiz: (verhaalId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false };
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: current.completedChapters,
                quizCompleted: true,
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

      isQuizUnlocked: (verhaalId, totalChapters) => {
        const progress = get().getChapterProgress(verhaalId);
        return progress.completedChapters.length === totalChapters;
      },
    }),
    {
      name: 'story-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
