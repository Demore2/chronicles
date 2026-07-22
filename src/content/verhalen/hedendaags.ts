import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 placeholder-verhalen per tijdperk toegevoegd om de volledige Home-conceptview
// (alle tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor
// dit tijdperk echte content schrijft.
export const verhalen: Verhaal[] = [
  {
    id: 'a-network-connects-the-world',
    titel: { en: 'A Network Connects the World' },
    ondertitel: { en: 'A phone becomes a window to everywhere' },
    teaser: { en: 'A small device puts the whole world in people’s pockets.' },
    jaar: 2007,
    periodeLabel: '2007',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'hedendaags',
    themas: ['technology', 'society'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'A company unveils a phone that fits an entire computer, camera, and map into one pocket-sized device. Within a few years, billions of people carry one.',
        },
      },
    ],
  },
  {
    id: 'a-pandemic-changes-daily-life',
    titel: { en: 'A Pandemic Changes Daily Life' },
    ondertitel: { en: 'The whole world stays home at once' },
    teaser: { en: 'Streets that are normally full suddenly stand empty.' },
    jaar: 2020,
    periodeLabel: '2020',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'hedendaags',
    themas: ['society', 'health'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'As a new virus spreads across the globe, governments everywhere ask people to stay home. Schools, shops, and offices close, and daily life changes almost overnight for billions of people.',
        },
      },
    ],
  },
];
