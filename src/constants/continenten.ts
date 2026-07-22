import type { Continent } from '@/constants/types';

export const continenten: Continent[] = [
  {
    id: 'europa',
    naam: { en: 'Europe', nl: 'Europa', fr: 'Europe', de: 'Europa' },
    actief: true,
  },
  {
    id: 'azie',
    naam: { en: 'Asia', nl: 'Azië', fr: 'Asie', de: 'Asien' },
    actief: false,
  },
  {
    id: 'afrika',
    naam: { en: 'Africa', nl: 'Afrika', fr: 'Afrique', de: 'Afrika' },
    actief: false,
  },
  {
    id: 'noord-amerika',
    naam: { en: 'North America', nl: 'Noord-Amerika', fr: 'Amérique du Nord', de: 'Nordamerika' },
    actief: false,
  },
  {
    id: 'zuid-amerika',
    naam: { en: 'South America', nl: 'Zuid-Amerika', fr: 'Amérique du Sud', de: 'Südamerika' },
    actief: false,
  },
  {
    id: 'oceanie',
    naam: { en: 'Oceania', nl: 'Oceanië', fr: 'Océanie', de: 'Ozeanien' },
    actief: false,
  },
];
