import type { Collectie } from '@/constants/types';

export const collecties: Collectie[] = [
  {
    id: 'power-and-conflict',
    titel: { en: 'Power and Conflict' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Empires, wars, and the struggles that shaped them.' },
    kleur: '#8B4A52',
    icoonNaam: 'shield-outline',
    verhaalIds: ['crown-for-new-empire', 'rebuilding-after-the-war'],
  },
  {
    id: 'trade-and-progress',
    titel: { en: 'Trade and Progress' },
    label: { en: 'Storyline' },
    beschrijving: { en: 'Merchants, journeys, and the ideas that moved the world forward.' },
    kleur: '#B8923F',
    icoonNaam: 'boat-outline',
    verhaalIds: ['the-company-sets-sail', 'rebuilding-after-the-war'],
  },
];

export function getCollectie(id: string): Collectie | undefined {
  return collecties.find((collectie) => collectie.id === id);
}
