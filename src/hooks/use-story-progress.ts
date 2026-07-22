import { useCallback, useMemo } from 'react';
import { useStoryProgressStore } from '@/store/story-progress-store';

export function useStoryProgress(verhaalId: string, totalChapters: number) {
  const allProgress = useStoryProgressStore((state) => state.progress);
  const completeChapter = useStoryProgressStore((state) => state.completeChapter);
  const completeQuiz = useStoryProgressStore((state) => state.completeQuiz);
  const answerChapterQuiz = useStoryProgressStore((state) => state.answerChapterQuiz);
  const loseLive = useStoryProgressStore((state) => state.loseLive);
  const resetLives = useStoryProgressStore((state) => state.resetLives);
  const isChapterUnlocked = useStoryProgressStore((state) => state.isChapterUnlocked);
  const isQuizUnlocked = useStoryProgressStore((state) => state.isQuizUnlocked);

  const progress = useMemo(
    () => allProgress[verhaalId] ?? { completedChapters: [], quizCompleted: false, lives: 3, chapterQuizAnswers: {} },
    [allProgress, verhaalId]
  );

  const isChapterCompleted = useCallback(
    (chapterId: number) => progress.completedChapters.includes(chapterId),
    [progress.completedChapters]
  );

  return useMemo(
    () => ({
      completedChapters: progress.completedChapters,
      quizCompleted: progress.quizCompleted,
      lives: progress.lives,
      chapterQuizAnswers: progress.chapterQuizAnswers,
      isChapterCompleted,
      completeChapter: (chapterId: number) => completeChapter(verhaalId, chapterId),
      completeQuiz: () => completeQuiz(verhaalId),
      answerChapterQuiz: (chapterId: number, correct: boolean) => answerChapterQuiz(verhaalId, chapterId, correct),
      loseLive: () => loseLive(verhaalId),
      resetLives: () => resetLives(verhaalId),
      isChapterUnlocked: (chapterId: number) => isChapterUnlocked(verhaalId, chapterId, totalChapters),
      isQuizUnlocked: () => isQuizUnlocked(verhaalId, totalChapters),
      progressPercentage: Math.round((progress.completedChapters.length / totalChapters) * 100),
    }),
    [
      progress,
      completeChapter,
      completeQuiz,
      answerChapterQuiz,
      loseLive,
      resetLives,
      isChapterUnlocked,
      isQuizUnlocked,
      verhaalId,
      totalChapters,
      isChapterCompleted,
    ]
  );
}
