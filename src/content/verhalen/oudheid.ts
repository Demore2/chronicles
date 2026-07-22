import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'marks-that-remember',
    titel: { en: 'The Marks That Remember' },
    ondertitel: { en: 'Temple clerks invent writing to count grain' },
    teaser: { en: 'A tally of sheep and barley becomes the first written language.' },
    jaar: -3200,
    periodeLabel: 'c. 3200 BC',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'oudheid',
    themas: ['writing', 'knowledge'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In the temple storerooms of Uruk, clerks press wedge-shaped marks into wet clay to track jars of oil and sacks of grain. What starts as bookkeeping for the gods’ storehouses slowly grows into something far bigger: symbols for sounds and words, not just numbers.',
        },
      },
      {
        type: 'citaat',
        tekst: {
          en: 'Three measures of barley, received from the shepherd, for the temple of the goddess.',
        },
        bron: { en: 'a Sumerian temple scribe, paraphrased from a clay tablet' },
      },
    ],
  },
  {
    id: 'a-tomb-to-touch-the-sky',
    titel: { en: 'A Tomb to Touch the Sky' },
    ondertitel: { en: 'Egypt raises its tallest monument for one king' },
    teaser: { en: 'For nearly 4,000 years, no building on Earth stands taller.' },
    jaar: -2560,
    periodeLabel: 'c. 2560 BC',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'oudheid',
    themas: ['power', 'architecture'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'On the Giza plateau, tens of thousands of workers haul limestone blocks up ramps for the tomb of the pharaoh Khufu. Each block weighs as much as a small car, and there are over two million of them, stacked with a precision that still puzzles engineers today.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The workers are not slaves but paid laborers, housed in a nearby town with bakeries and breweries built just to feed them. When the last stone is set, the Great Pyramid stands taller than any structure humans have ever built — a record it keeps for well over three thousand years.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: 'The Great Pyramid of Giza was built by enslaved workers.' },
        antwoord: false,
        uitleg: {
          en: 'Archaeological evidence, including nearby worker villages and bakeries, shows the pyramid was built mainly by paid or conscripted laborers, not slaves.',
        },
      },
    ],
  },
  {
    id: 'one-law-carved-in-stone',
    titel: { en: 'One Law, Carved in Stone' },
    ondertitel: { en: 'A king puts the same rules above everyone' },
    teaser: { en: 'For the first time, the same written rules apply to rich and poor alike.' },
    jaar: -1754,
    periodeLabel: '1754 BC',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'oudheid',
    themas: ['law', 'power'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In Babylon, King Hammurabi orders nearly 300 laws carved onto a towering pillar of black stone, set up in public where anyone can see it. The laws cover everything from unpaid debts to shoddy house-building, each paired with a clear punishment.',
        },
      },
      {
        type: 'citaat',
        tekst: {
          en: 'So that the strong might not oppress the weak, and that justice might be done for the orphan and the widow.',
        },
        bron: { en: 'epilogue of the Code of Hammurabi' },
      },
    ],
  },
  {
    id: 'power-returned-to-the-people',
    titel: { en: 'Power Returned to the People' },
    ondertitel: { en: 'Athens lets its citizens rule themselves' },
    teaser: { en: 'One reformer’s idea gives ordinary citizens a direct vote on the laws.' },
    jaar: -508,
    periodeLabel: '508 BC',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'oudheid',
    themas: ['power', 'democracy'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'After Athens throws out its ruling tyrant, the statesman Cleisthenes redraws the city’s political map, breaking the old noble families’ grip on power. He creates an assembly where any male citizen can speak and vote directly on the laws that govern him.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'It is a radical, imperfect experiment — women, foreigners, and the enslaved are excluded entirely — but the word Athenians use for it, demokratia, "rule by the people," will echo through political systems for the next twenty-five centuries.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: 'In Cleisthenes’ Athenian democracy, women were allowed to vote.' },
        antwoord: false,
        uitleg: {
          en: 'Athenian democracy only granted political rights to adult male citizens; women, foreigners, and enslaved people had no vote.',
        },
      },
    ],
  },
  {
    id: 'daggers-on-the-senate-floor',
    titel: { en: 'Daggers on the Senate Floor' },
    ondertitel: { en: 'Rome’s most powerful man is struck down by his own senators' },
    teaser: { en: 'A warning to beware a single day goes unheeded, with fatal results.' },
    jaar: -44,
    periodeLabel: '44 BC',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 5,
    tijdperkId: 'oudheid',
    themas: ['power', 'betrayal'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Julius Caesar has crushed his rivals, been named dictator for life, and filled the Senate with his own appointees. To a group of senators, that looks less like leadership and more like the death of the Roman Republic itself.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'Beware the Ides of March.' },
        bron: { en: 'a soothsayer’s warning to Caesar, recorded by ancient historians' },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'On the 15th of March, more than sixty senators surround Caesar in the Senate house and stab him some twenty-three times. They call themselves liberators, saving Rome from a king in all but name — but their act plunges Rome into civil war and, within years, into the very empire they feared.',
        },
      },
    ],
  },
  {
    id: 'buried-in-a-single-afternoon',
    titel: { en: 'Buried in a Single Afternoon' },
    ondertitel: { en: 'A mountain erupts and freezes a Roman town in time' },
    teaser: { en: 'An ordinary day at the market ends under twenty feet of ash.' },
    jaar: 79,
    periodeLabel: '79 AD',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'oudheid',
    themas: ['disaster', 'daily-life'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In the Roman town of Pompeii, bakers are pulling bread from ovens and shoppers are haggling over fish when Mount Vesuvius tears itself open. Within hours, a column of ash and pumice rises miles into the sky, then collapses into scorching clouds that race down the mountainside.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Plaster cast of a Pompeii resident, preserved in the pose of their final moment' },
        bijschrift: {
          en: 'Ash hardened around the bodies of the dead, preserving the exact shape of their final moments.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Pompeii and its neighbor Herculaneum are buried so completely, and so quickly, that ordinary life is frozen in place — loaves in ovens, graffiti on walls, dogs still on their chains. Rediscovered centuries later, the towns give historians their clearest window yet into everyday Roman life.',
        },
      },
    ],
  },
];
