import type { Verhaal } from '@/constants/types';

// Minimale voorbeeldset (Engelstalig) om alle schermen mee te testen.
// De echte content komt later — vertaal- en terugvalgedrag (v()) werkt
// hetzelfde, ook wanneer alleen 'en' is ingevuld.
export const verhalen: Verhaal[] = [
  {
    id: 'crown-for-new-empire',
    titel: { en: 'A Crown for a New Empire' },
    ondertitel: { en: 'The coronation of a Frankish king' },
    teaser: { en: 'On Christmas Day, a king becomes an emperor.' },
    jaar: 800,
    periodeLabel: '800',
    regioIds: ['nederland', 'belgie', 'duitsland', 'frankrijk'],
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
    id: 'the-company-sets-sail',
    titel: { en: 'The Company Sets Sail' },
    ondertitel: { en: 'A new trading power on the seas' },
    teaser: { en: 'Merchants join forces and conquer the world’s oceans.' },
    jaar: 1602,
    periodeLabel: '1602',
    regioIds: ['nederland'],
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
    id: 'rebuilding-after-the-war',
    titel: { en: 'Rebuilding After the War' },
    ondertitel: { en: 'A continent rises from the rubble' },
    teaser: { en: 'Out of ruin and hardship grows a new prosperity.' },
    jaar: 1945,
    periodeLabel: '1945-1960',
    regioIds: ['duitsland', 'frankrijk'],
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

export function getVerhaal(id: string): Verhaal | undefined {
  return verhalen.find((verhaal) => verhaal.id === id);
}

export function getVerhalenByTijdperk(tijdperkId: string): Verhaal[] {
  return verhalen.filter((verhaal) => verhaal.tijdperkId === tijdperkId).sort((a, b) => a.jaar - b.jaar);
}

export function getVerhalenByRegio(regioId: string): Verhaal[] {
  return verhalen.filter((verhaal) => verhaal.regioIds.includes(regioId)).sort((a, b) => a.jaar - b.jaar);
}
