import type { Collectie } from '@/constants/types';

// R8: Leeg tot Oudheid 4-verhalen gereed
export const collecties: Collectie[] = [];

export function getCollectie(id: string): Collectie | undefined {
  return collecties.find((collectie) => collectie.id === id);
}
