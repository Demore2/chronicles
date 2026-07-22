import type { Verhaal } from '@/constants/types';

// TIJDELIJK: 2 placeholder-verhalen per tijdperk toegevoegd om de volledige Home-conceptview
// (alle tijdperk-rijen met kaarten) te kunnen bekijken. Vervang/verwijder zodra de R7-agent voor
// dit tijdperk echte content schrijft.
export const verhalen: Verhaal[] = [
  {
    id: 'steam-power-takes-the-rails',
    titel: { en: 'Steam Power Takes the Rails' },
    ondertitel: { en: 'A locomotive faster than any horse' },
    teaser: { en: 'Crowds gather to watch a machine race across the countryside.' },
    jaar: 1830,
    periodeLabel: '1830',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'industriele-revolutie',
    themas: ['progress', 'technology'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'A steam locomotive pulls its first passengers between two cities, moving faster than anyone has ever traveled on land. Within decades, railways will crisscross entire countries.',
        },
      },
    ],
  },
  {
    id: 'a-voice-travels-down-a-wire',
    titel: { en: 'A Voice Travels Down a Wire' },
    ondertitel: { en: 'Speaking to someone in another room, instantly' },
    teaser: { en: 'For the first time, a voice reaches someone far away in an instant.' },
    jaar: 1876,
    periodeLabel: '1876',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'industriele-revolutie',
    themas: ['technology', 'communication'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In a workshop, an inventor speaks into a strange device and, in another room, his assistant hears the words clearly through a wire. It is the first telephone call ever made.',
        },
      },
    ],
  },
];
