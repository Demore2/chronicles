import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type StoryProgress = {
  completedChapters: number[];
  quizCompleted: boolean;
  lives: number;
  chapterQuizAnswers: Record<number, boolean>;
};

export type StoryProgressState = {
  progress: Record<string, StoryProgress>;
  getChapterProgress: (verhaalId: string) => StoryProgress;
  completeChapter: (verhaalId: string, chapterId: number) => void;
  completeQuiz: (verhaalId: string) => void;
  answerChapterQuiz: (verhaalId: string, chapterId: number, correct: boolean) => void;
  loseLive: (verhaalId: string) => void;
  resetLives: (verhaalId: string) => void;
  isChapterUnlocked: (verhaalId: string, chapterId: number, totalChapters: number) => boolean;
  isQuizUnlocked: (verhaalId: string, totalChapters: number) => boolean;
};

export const useStoryProgressStore = create<StoryProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      getChapterProgress: (verhaalId) => {
        return get().progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
      },

      completeChapter: (verhaalId, chapterId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
          const completed = new Set(current.completedChapters);
          completed.add(chapterId);
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: Array.from(completed).sort((a, b) => a - b),
                quizCompleted: current.quizCompleted,
                lives: current.lives,
                chapterQuizAnswers: current.chapterQuizAnswers,
              },
            },
          };
        });
      },

      completeQuiz: (verhaalId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: current.completedChapters,
                quizCompleted: true,
                lives: current.lives,
                chapterQuizAnswers: current.chapterQuizAnswers,
              },
            },
          };
        });
      },

      answerChapterQuiz: (verhaalId, chapterId, correct) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: current.completedChapters,
                quizCompleted: current.quizCompleted,
                lives: current.lives,
                chapterQuizAnswers: { ...current.chapterQuizAnswers, [chapterId]: correct },
              },
            },
          };
        });
      },

      loseLive: (verhaalId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: current.completedChapters,
                quizCompleted: current.quizCompleted,
                lives: Math.max(0, current.lives - 1),
                chapterQuizAnswers: current.chapterQuizAnswers,
              },
            },
          };
        });
      },

      resetLives: (verhaalId) => {
        set((state) => {
          const current = state.progress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} };
          return {
            progress: {
              ...state.progress,
              [verhaalId]: {
                completedChapters: current.completedChapters,
                quizCompleted: current.quizCompleted,
                lives: 3,
                chapterQuizAnswers: current.chapterQuizAnswers,
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
