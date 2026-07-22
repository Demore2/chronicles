import { useCallback, useMemo } from 'react';
import { useStoryProgressStore } from '@/store/story-progress-store';

export function useStoryProgress(verhaalId: string, totalChapters: number) {
  const allProgress = useStoryProgressStore((state) => state.progress);
  const completeChapter = useStoryProgressStore((state) => state.completeChapter);
  const completeQuiz = useStoryProgressStore((state) => state.completeQuiz);
  const isChapterUnlocked = useStoryProgressStore((state) => state.isChapterUnlocked);
  const isQuizUnlocked = useStoryProgressStore((state) => state.isQuizUnlocked);

  const progress = useMemo(
    () => allProgress[verhaalId] ?? { completedChapters: [], quizCompleted: false },
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
      isChapterCompleted,
      completeChapter: (chapterId: number) => completeChapter(verhaalId, chapterId),
      completeQuiz: () => completeQuiz(verhaalId),
      isChapterUnlocked: (chapterId: number) => isChapterUnlocked(verhaalId, chapterId, totalChapters),
      isQuizUnlocked: () => isQuizUnlocked(verhaalId, totalChapters),
      progressPercentage: Math.round((progress.completedChapters.length / totalChapters) * 100),
    }),
    [
      progress,
      completeChapter,
      completeQuiz,
      isChapterUnlocked,
      isQuizUnlocked,
      verhaalId,
      totalChapters,
      isChapterCompleted,
    ]
  );
}
