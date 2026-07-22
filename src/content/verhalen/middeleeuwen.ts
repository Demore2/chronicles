import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 extra placeholder-verhalen toegevoegd om de volledige Home-conceptview (alle
// tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor dit
// tijdperk echte content schrijft.
export const verhalen: Verhaal[] = [
  {
    id: 'crown-for-new-empire',
    titel: { en: 'A Crown for a New Empire' },
    ondertitel: { en: 'The coronation of a Frankish king' },
    teaser: { en: 'On Christmas Day, a king becomes an emperor.' },
    jaar: 800,
    periodeLabel: '800',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 1,
    tijdperkId: 'middeleeuwen',
    themas: ['power', 'empire'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'On Christmas Day in the year 800, a Frankish king walks into a church in Rome to pray. He has no idea that what happens next will change his life forever.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A king is crowned inside a church' },
        bijschrift: { en: 'The coronation, in the year 800' },
      },
      {
        type: 'citaat',
        tekst: { en: 'Long live the crowned, great and peace-bringing emperor!' },
        bron: { en: 'A chronicler, describing the crowd’s reaction' },
      },
      {
        type: 'quiz',
        vraag: { en: 'The king knew in advance that he would be crowned emperor.' },
        antwoord: false,
        uitleg: {
          en: 'According to tradition, the crowning came as a surprise — though historians still debate how spontaneous it really was.',
        },
      },
    ],
  },
  {
    id: 'plague-reaches-the-city',
    titel: { en: 'The Plague Reaches the City' },
    ondertitel: { en: 'A sickness no one can explain' },
    teaser: { en: 'A ship arrives at the harbor, and with it, a deadly disease.' },
    jaar: 1347,
    periodeLabel: '1347',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'middeleeuwen',
    themas: ['disease', 'society'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'A trading ship docks in the harbor, its crew already sick. Within days, the disease spreads through the city. No doctor of the time understands what is causing it, or how to stop it.',
        },
      },
    ],
  },
  {
    id: 'cathedrals-reach-the-sky',
    titel: { en: 'Cathedrals Reach for the Sky' },
    ondertitel: { en: 'Building higher than ever before' },
    teaser: { en: 'A whole city works for generations on a single building.' },
    jaar: 1163,
    periodeLabel: '1163',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'middeleeuwen',
    themas: ['religion', 'craft'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Stonemasons lay the first foundation of a cathedral so tall it seems impossible. It will take nearly two hundred years and generations of workers to finish it.',
        },
      },
    ],
  },
];
