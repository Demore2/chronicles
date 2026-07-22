import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 extra placeholder-verhalen toegevoegd om de volledige Home-conceptview (alle
// tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor dit
// tijdperk echte content schrijft.
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
  {
    id: 'a-new-view-of-the-heavens',
    titel: { en: 'A New View of the Heavens' },
    ondertitel: { en: 'A telescope challenges old beliefs' },
    teaser: { en: 'A simple tube of glass lenses turns the universe upside down.' },
    jaar: 1610,
    periodeLabel: '1610',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['science', 'discovery'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Pointing his telescope at the night sky, a scholar sees moons circling another planet. It is proof that not everything in the heavens circles the Earth — a dangerous idea to share.',
        },
      },
    ],
  },
  {
    id: 'storming-a-fortress-for-liberty',
    titel: { en: 'Storming a Fortress for Liberty' },
    ondertitel: { en: 'A crowd turns on a symbol of royal power' },
    teaser: { en: 'An angry crowd marches on an old fortress-prison.' },
    jaar: 1789,
    periodeLabel: '1789',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['revolt', 'power'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Hungry and angry about the price of bread, a crowd gathers outside an old fortress used as a royal prison. By the end of the day, its fall becomes a symbol of a revolution just beginning.',
        },
      },
    ],
  },
];
