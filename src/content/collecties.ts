import type { Collectie } from '@/constants/types';

// verhaalIds below point at the current per-era placeholder stories (see the TIJDELIJK
// comments in src/content/verhalen/*.ts). getVerhalenVoorCollectie() silently drops any id
// that no longer resolves, so when an R7 agent replaces its era's placeholder stories, re-check
// these lists — a renamed/removed id won't error, it'll just quietly shrink a storyline.
export const collecties: Collectie[] = [
  {
    id: 'power-and-conflict',
    titel: { en: 'Power and Conflict' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Kings, crowds, and the wars that reshaped power.' },
    kleur: '#8B4A52',
    icoonNaam: 'shield-outline',
    verhaalIds: ['crown-for-new-empire', 'storming-a-fortress-for-liberty', 'rebuilding-after-the-war'],
  },
  {
    id: 'trade-and-progress',
    titel: { en: 'Trade and Progress' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Scholars, merchants, and the inventions that moved the world forward.' },
    kleur: '#B8923F',
    icoonNaam: 'boat-outline',
    verhaalIds: ['a-library-for-the-world', 'the-company-sets-sail', 'steam-power-takes-the-rails'],
  },
];

export function getCollectie(id: string): Collectie | undefined {
  return collecties.find((collectie) => collectie.id === id);
}
