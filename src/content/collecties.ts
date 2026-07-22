import type { Collectie } from '@/constants/types';

// verhaalIds below point at real stories written by the R7 per-era content agents
// (REFACTOR-PLAN.md). getVerhalenVoorCollectie() silently drops any id that no longer
// resolves, so if an era file's ids ever change again, re-check these lists — a renamed/removed
// id won't error, it'll just quietly shrink a storyline.
export const collecties: Collectie[] = [
  {
    id: 'power-and-conflict',
    titel: { en: 'Power and Conflict' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Kings, crowds, and the wars that reshaped power.' },
    kleur: '#8B4A52',
    icoonNaam: 'shield-outline',
    verhaalIds: ['an-empire-crowned-again', 'a-fortress-falls-in-paris', 'the-night-the-wall-came-down'],
  },
  {
    id: 'trade-and-progress',
    titel: { en: 'Trade and Progress' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Scholars, merchants, and the inventions that moved the world forward.' },
    kleur: '#B8923F',
    icoonNaam: 'boat-outline',
    verhaalIds: ['marks-that-remember', 'shares-for-every-merchant', 'the-line-that-outran-the-horse'],
  },
];

export function getCollectie(id: string): Collectie | undefined {
  return collecties.find((collectie) => collectie.id === id);
}
