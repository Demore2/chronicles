import { useCallback, useMemo } from 'react';
import { useStoryProgressStore } from '@/store/story-progress-store';

export function useStoryProgress(verhaalId: string, totalChapters: number) {
  const allProgress = useStoryProgressStore((state) => state.progress);
  const completeChapter = useStoryProgressStore((state) => state.completeChapter);
  const isChapterUnlocked = useStoryProgressStore((state) => state.isChapterUnlocked);

  const progress = useMemo(
    () => allProgress[verhaalId] ?? { completedChapters: [] },
    [allProgress, verhaalId]
  );

  const isChapterCompleted = useCallback(
    (chapterId: number) => progress.completedChapters.includes(chapterId),
    [progress.completedChapters]
  );

  return useMemo(
    () => ({
      completedChapters: progress.completedChapters,
      isChapterCompleted,
      completeChapter: (chapterId: number) => completeChapter(verhaalId, chapterId),
      isChapterUnlocked: (chapterId: number) => isChapterUnlocked(verhaalId, chapterId, totalChapters),
      progressPercentage: Math.round((progress.completedChapters.length / totalChapters) * 100),
    }),
    [
      progress,
      completeChapter,
      isChapterUnlocked,
      verhaalId,
      totalChapters,
      isChapterCompleted,
    ]
  );
}
