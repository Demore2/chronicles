import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 placeholder-verhalen per tijdperk toegevoegd om de volledige Home-conceptview
// (alle tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor
// dit tijdperk echte content schrijft.
export const verhalen: Verhaal[] = [
  {
    id: 'first-written-laws',
    titel: { en: 'The First Written Laws' },
    ondertitel: { en: 'A king carves justice into stone' },
    teaser: { en: 'For the first time, the same rules apply to everyone.' },
    jaar: -1754,
    periodeLabel: '1754 BC',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'oudheid',
    themas: ['law', 'power'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In Babylon, a king orders nearly 300 laws carved onto a great stone pillar for all to see. Rich or poor, everyone can now find out exactly what the rules are.',
        },
      },
    ],
  },
  {
    id: 'a-library-for-the-world',
    titel: { en: 'A Library for the World' },
    ondertitel: { en: 'Collecting all human knowledge in one city' },
    teaser: { en: 'Scholars from every land gather to fill one enormous library.' },
    jaar: -250,
    periodeLabel: '250 BC',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'oudheid',
    themas: ['knowledge', 'trade'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In the harbor city of Alexandria, ships are searched not for treasure but for scrolls. Every book found is copied for the great library, built to hold all the knowledge in the world.',
        },
      },
    ],
  },
];
