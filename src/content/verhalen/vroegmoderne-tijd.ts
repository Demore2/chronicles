import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'the-company-sets-sail',
    titel: { en: 'The Company Sets Sail' },
    ondertitel: { en: 'A new trading power on the seas' },
    teaser: { en: 'Merchants join forces and conquer the world’s oceans.' },
    jaar: 1602,
    periodeLabel: '1602',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['trade', 'exploration'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'The harbor is busy with activity. Large sailing ships are loaded for a voyage of months, all the way to Asia.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A large sailing ship leaves the harbor' },
      },
      {
        type: 'quiz',
        vraag: { en: 'This was the first company in the world to sell shares to ordinary people.' },
        antwoord: true,
        uitleg: {
          en: 'It founded the first stock exchange where anyone could buy and trade shares — a world first.',
        },
      },
    ],
  },
];
