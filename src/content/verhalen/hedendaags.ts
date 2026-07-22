import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'a-map-of-the-human-blueprint',
    titel: { en: 'A Map of the Human Blueprint' },
    ondertitel: { en: 'Scientists finish reading the code of life' },
    teaser: { en: 'After thirteen years of work, the instructions for a human being are finally spelled out in full.' },
    jaar: 2003,
    periodeLabel: '2003',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'hedendaags',
    themas: ['science', 'discovery'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'An international team of scientists announces that it has finished sequencing almost the entire human genome, the roughly three billion letters of DNA that make up the instructions for building a person. What began in 1990 as an ambitious, costly gamble finishes years ahead of early expectations, thanks to faster machines and fierce competition between public and private labs.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The finished map does not immediately cure any disease, but it hands researchers something they never had before: a complete reference to compare against. Within a generation, gene sequencing that once took over a decade and billions of dollars can be done for a single patient in a day, reshaping how doctors diagnose and treat illness.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: 'The Human Genome Project was finished by a single country working alone.' },
        antwoord: false,
        uitleg: {
          en: 'It was an international public effort involving researchers across many countries, running alongside a competing private company that raced to sequence the genome first.',
        },
      },
    ],
  },
  {
    id: 'a-network-connects-the-world',
    titel: { en: 'A Network Connects the World' },
    ondertitel: { en: 'A phone becomes a window to everywhere' },
    teaser: { en: 'A small device puts the whole world in people’s pockets.' },
    jaar: 2007,
    periodeLabel: '2007',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'hedendaags',
    themas: ['technology', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'A company unveils a phone that fits a touchscreen computer, a camera, and a map into one pocket-sized device, controlled almost entirely with a finger instead of buttons. Critics wonder whether people really need such a thing; within a few years, billions of them carry one anyway.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A hand holding an early touchscreen smartphone' },
        bijschrift: { en: 'The touchscreen replaced the physical keyboard many expected phones would always need.' },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'App stores turn the device into a platform other companies build on, from maps and messaging to banking and ride-hailing. Within a decade, the smartphone reshapes how people navigate cities, take photographs, read the news, and stay in touch with each other.',
        },
      },
    ],
  },
  {
    id: 'the-banks-that-were-too-big-to-fail',
    titel: { en: 'The Banks That Were Too Big to Fail' },
    ondertitel: { en: 'A housing bust freezes the world economy' },
    teaser: { en: 'A storied Wall Street bank collapses overnight, and the shockwaves spread across the globe.' },
    jaar: 2008,
    periodeLabel: '2008',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'hedendaags',
    themas: ['economy', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'For years, banks hand out home loans to borrowers who cannot easily repay them, then bundle those loans into complex investments sold around the world. When American homeowners start defaulting in large numbers, the value of those investments collapses, and a storied investment bank goes bankrupt in a single weekend.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Credit markets seize up almost everywhere, banks stop trusting each other enough to lend, and stock markets around the world plunge. Governments and central banks intervene with massive rescue packages to keep the financial system from collapsing entirely, while millions of people lose their jobs or homes in the recession that follows.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'We came very close to a financial collapse, and to a second Great Depression, with all the misery that implies.' },
        bron: { en: 'A central banker, reflecting on the crisis years later' },
      },
    ],
  },
  {
    id: 'a-promise-signed-by-nearly-every-nation',
    titel: { en: 'A Promise Signed by Nearly Every Nation' },
    ondertitel: { en: 'The world agrees to hold back the warming' },
    teaser: { en: 'For the first time, almost every country on Earth agrees to a single climate target.' },
    jaar: 2015,
    periodeLabel: '2015',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'hedendaags',
    themas: ['climate', 'diplomacy'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'After two weeks of tense negotiations in Paris, delegates from nearly 200 countries adopt an agreement committing their nations to limit global warming, ideally to well below 2 degrees Celsius above pre-industrial levels. Unlike earlier climate talks, this one includes both wealthy and developing nations under a single framework.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Rather than imposing fixed cuts from above, the agreement asks each country to set its own targets and report on its progress, then ratchet those targets up over time. Supporters call it an imperfect but historic turning point; critics note it has no real enforcement mechanism, leaving its success dependent on countries actually following through.',
        },
      },
    ],
  },
  {
    id: 'the-world-goes-quiet-at-once',
    titel: { en: 'The World Goes Quiet at Once' },
    ondertitel: { en: 'A new virus sends billions of people indoors' },
    teaser: { en: 'Streets that are normally full of life suddenly stand empty everywhere at once.' },
    jaar: 2020,
    periodeLabel: '2020',
    afbeelding: 'placeholder',
    volgorde: 5,
    tijdperkId: 'hedendaags',
    themas: ['society', 'health'],
    uitgelicht: true,
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'A new coronavirus, first identified in late 2019, spreads to nearly every country within a few months. As hospitals fill up, governments around the world take a step almost without precedent: they order people to stay home, close schools and shops, and ground much of international air travel.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'An empty city street during a pandemic lockdown' },
        bijschrift: { en: 'Streets normally packed with commuters and shoppers stood empty for weeks at a time.' },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Offices and classrooms move onto video calls almost overnight, while scientists race to develop vaccines at record speed, delivering several within about a year of the outbreak instead of the usual decade or more. By the time the emergency eases, the pandemic has killed millions of people and changed how many think about remote work, health, and daily routines.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: 'Developing an effective vaccine against the virus took over a decade, as vaccines typically do.' },
        antwoord: false,
        uitleg: {
          en: 'Several vaccines were developed and authorized within roughly a year of the outbreak, far faster than the decade or more vaccine development usually takes.',
        },
      },
    ],
  },
  {
    id: 'the-deepest-photograph-of-the-sky',
    titel: { en: 'The Deepest Photograph of the Sky' },
    ondertitel: { en: 'A new telescope opens its eyes to the early universe' },
    teaser: { en: 'A single image reveals thousands of galaxies never seen before.' },
    jaar: 2022,
    periodeLabel: '2022',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'hedendaags',
    themas: ['science', 'discovery'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'After decades of development and delays, a giant new space telescope unfolds its mirrors more than a million miles from Earth and beams back its first full-color image: a patch of sky no bigger than a grain of sand held at arm’s length, packed with thousands of galaxies, some among the oldest ever observed.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Built to see in infrared light, the telescope can peer through clouds of cosmic dust and look further back in time than any instrument before it, catching light that left its source billions of years earlier. Astronomers immediately put it to work studying the atmospheres of distant planets and the earliest galaxies to form after the Big Bang.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'Every image is a new discovery, and each one will help humanity understand the origins of the universe and our place in it.' },
        bron: { en: 'A NASA administrator, on the telescope’s first images' },
      },
    ],
  },
];
