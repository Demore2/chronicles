import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 extra placeholder-verhalen toegevoegd om de volledige Home-conceptview (alle
// tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor dit
// tijdperk echte content schrijft.
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
  {
    id: 'a-wall-divides-a-city',
    titel: { en: 'A Wall Divides a City' },
    ondertitel: { en: 'Overnight, a city is split in two' },
    teaser: { en: 'Families wake up to find their city cut in half.' },
    jaar: 1961,
    periodeLabel: '1961',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'twintigste-eeuw',
    themas: ['power', 'society'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Residents wake up to find soldiers laying barbed wire through the middle of their city overnight. Within days it becomes a concrete wall, separating friends and families for decades.',
        },
      },
    ],
  },
  {
    id: 'one-small-step',
    titel: { en: 'One Small Step' },
    ondertitel: { en: 'Humanity leaves its first footprint elsewhere' },
    teaser: { en: 'For the first time, a person walks on another world.' },
    jaar: 1969,
    periodeLabel: '1969',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'twintigste-eeuw',
    themas: ['progress', 'discovery'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'After years of racing to get there first, an astronaut climbs down a ladder and steps onto the surface of the Moon, live on television for millions of people watching at home.',
        },
      },
    ],
  },
];
