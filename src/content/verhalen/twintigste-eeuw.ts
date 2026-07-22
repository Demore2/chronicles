import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'rebuilding-after-the-war',
    titel: { en: 'Rebuilding After the War' },
    ondertitel: { en: 'A continent rises from the rubble' },
    teaser: { en: 'Out of ruin and hardship grows a new prosperity.' },
    jaar: 1945,
    periodeLabel: '1945-1960',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'twintigste-eeuw',
    themas: ['progress', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Cities lie in ruins, bridges are destroyed, and many people have lost everything. Yet reconstruction begins almost immediately.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Workers rebuild a destroyed bridge' },
      },
      {
        type: 'citaat',
        tekst: { en: 'Out of the ashes, a new prosperity none of us could have imagined.' },
        bron: { en: 'A worker, recalling the years after the war' },
      },
    ],
  },
];
