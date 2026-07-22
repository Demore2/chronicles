import type { Verhaal } from '@/constants/types';

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
];
