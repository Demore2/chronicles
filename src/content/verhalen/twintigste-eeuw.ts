import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'twelve-seconds-in-the-air',
    titel: { en: 'Twelve Seconds in the Air' },
    ondertitel: { en: 'A bicycle shop notion takes flight' },
    teaser: {
      en: 'Two brothers turn years of gliders and wind-tunnel tests into the first powered flight.',
    },
    jaar: 1903,
    periodeLabel: 'December 1903',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'twintigste-eeuw',
    themas: ['science', 'technology'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'On a windswept dune near Kitty Hawk, North Carolina, brothers Orville and Wilbur Wright have spent four years testing gliders, propellers, and their own homemade wind tunnel. On the cold morning of 17 December 1903, Orville lies flat across the lower wing of their fragile biplane, the Flyer, and eases open the throttle. The machine lifts off the launch rail, wobbles into the air, and comes down again twelve seconds and about 120 feet later — the first sustained, controlled flight of a powered aircraft.',
        },
      },
      {
        type: 'citaat',
        tekst: {
          en: 'This flight lasted only twelve seconds, but it was nevertheless the first in the history of the world in which a machine carrying a man had raised itself by its own power into the air in full flight, sailed forward without reduction of speed, and finally landed at a point as high as that from which it started.',
        },
        bron: { en: 'Orville Wright, diary entry, 17 December 1903' },
      },
      {
        type: 'quiz',
        vraag: { en: "The Wright brothers' first powered flight in 1903 covered more than a mile." },
        antwoord: false,
        uitleg: {
          en: 'The first flight covered only about 120 feet (37 metres) — shorter than the wingspan of many modern airliners. By the fourth flight that same day, Wilbur had extended it to 852 feet.',
        },
      },
    ],
  },
  {
    id: 'mould-in-a-petri-dish',
    titel: { en: 'Mould in a Petri Dish' },
    ondertitel: { en: 'An untidy laboratory bench changes medicine' },
    teaser: { en: 'A forgotten dish of bacteria reveals a mould that kills germs on contact.' },
    jaar: 1928,
    periodeLabel: 'September 1928',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'twintigste-eeuw',
    themas: ['science', 'medicine'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: "Returning from a summer holiday in September 1928, bacteriologist Alexander Fleming finds a stack of unwashed petri dishes on his laboratory bench at St Mary's Hospital in London. One dish, growing colonies of Staphylococcus bacteria, has been contaminated by a stray blue-green mould — and around the mould, the bacteria have died. Fleming identifies the mould as a strain of Penicillium and publishes his observation the following year, though it takes until the early 1940s for other scientists to turn his discovery into a usable drug.",
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A petri dish with a ring of mould surrounded by cleared bacteria' },
        bijschrift: { en: "The contaminated dish that first revealed penicillin's bacteria-killing effect" },
      },
      {
        type: 'citaat',
        tekst: { en: 'One sometimes finds what one is not looking for.' },
        bron: { en: 'Alexander Fleming' },
      },
    ],
  },
  {
    id: 'dawn-over-the-normandy-beaches',
    titel: { en: 'Dawn Over the Normandy Beaches' },
    ondertitel: { en: 'The largest seaborne invasion in history begins' },
    teaser: {
      en: 'Thousands of ships cross the Channel under cover of darkness to open a new front in the war.',
    },
    jaar: 1944,
    periodeLabel: '6 June 1944',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'twintigste-eeuw',
    themas: ['war', 'history'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Before dawn on 6 June 1944, nearly 7,000 ships carry Allied soldiers across the English Channel toward five stretches of the Normandy coast, codenamed Utah, Omaha, Gold, Juno, and Sword. Paratroopers have already dropped inland overnight to secure bridges and roads. By nightfall, more than 150,000 troops have come ashore, opening the long-awaited second front against Nazi-occupied Europe and beginning the campaign that will liberate France within the year.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Soldiers wading ashore from landing craft under grey skies' },
        bijschrift: { en: 'Troops disembark on the Normandy coast on the morning of the invasion' },
      },
      {
        type: 'citaat',
        tekst: {
          en: 'You are about to embark upon the Great Crusade, toward which we have striven these many months. The eyes of the world are upon you.',
        },
        bron: { en: 'General Dwight D. Eisenhower, Order of the Day, 6 June 1944' },
      },
    ],
  },
  {
    id: 'a-seat-she-would-not-surrender',
    titel: { en: 'A Seat She Would Not Surrender' },
    ondertitel: { en: 'One refusal sets a boycott in motion' },
    teaser: { en: 'A tired seamstress says no, and a city-wide protest against segregation begins.' },
    jaar: 1955,
    periodeLabel: 'December 1955',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'twintigste-eeuw',
    themas: ['civil rights', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: "On 1 December 1955, seamstress and civil rights activist Rosa Parks boards a bus in Montgomery, Alabama, and takes a seat in the section reserved for Black passengers. When the driver orders her to give up her seat to a white passenger, she refuses and is arrested. Local Black leaders, including a young pastor named Martin Luther King Jr., organise a boycott of the city's buses that lasts 381 days, until the Supreme Court rules that bus segregation is unconstitutional.",
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'The only tired I was, was tired of giving in.' },
        bron: { en: 'Rosa Parks, Rosa Parks: My Story (1992)' },
      },
      {
        type: 'quiz',
        vraag: { en: 'The Montgomery Bus Boycott lasted longer than a full year.' },
        antwoord: true,
        uitleg: {
          en: "The boycott ran for 381 days, from December 1955 to December 1956, when the Supreme Court's ruling took effect and the city's buses were desegregated.",
        },
      },
    ],
  },
  {
    id: 'a-footprint-on-another-world',
    titel: { en: 'A Footprint on Another World' },
    ondertitel: { en: 'Humanity leaves the cradle for the first time' },
    teaser: { en: 'Two astronauts stand on the Moon while hundreds of millions watch from home.' },
    jaar: 1969,
    periodeLabel: '20 July 1969',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 5,
    tijdperkId: 'twintigste-eeuw',
    themas: ['space', 'discovery'],
    leestijdMinuten: 4,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: "On 20 July 1969, the lunar module Eagle carries astronauts Neil Armstrong and Buzz Aldrin to a landing on the Moon's Sea of Tranquility, while Michael Collins orbits overhead in the command module. Hours later, Armstrong climbs down the ladder and becomes the first person to set foot on another world, broadcast live to an estimated audience of 600 million people. Aldrin joins him on the surface, and together they spend about two and a half hours collecting rock samples and setting up experiments before returning to Collins for the journey home.",
        },
      },
      {
        type: 'citaat',
        tekst: { en: "That's one small step for man, one giant leap for mankind." },
        bron: { en: 'Neil Armstrong, 20 July 1969' },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'An astronaut in a white spacesuit standing on the grey lunar surface' },
        bijschrift: { en: 'Buzz Aldrin on the surface of the Moon, photographed by Neil Armstrong' },
      },
      {
        type: 'quiz',
        vraag: { en: "All three Apollo 11 astronauts walked on the Moon's surface." },
        antwoord: false,
        uitleg: {
          en: 'Only Armstrong and Aldrin walked on the Moon; Michael Collins remained in lunar orbit aboard the command module, Columbia.',
        },
      },
    ],
  },
  {
    id: 'the-night-the-wall-came-down',
    titel: { en: 'The Night the Wall Came Down' },
    ondertitel: { en: 'A hesitant announcement opens the border' },
    teaser: { en: 'A fumbled press conference sends thousands of Berliners rushing to the crossing points.' },
    jaar: 1989,
    periodeLabel: '9 November 1989',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'twintigste-eeuw',
    themas: ['power', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: "On the evening of 9 November 1989, East German spokesman Günter Schabowski reads out new travel rules at a press conference, and when pressed on when they take effect, answers that it is immediate. Within hours, thousands of East Berliners gather at the checkpoints, and overwhelmed border guards open the gates. Crowds climb onto the Berlin Wall itself, and in the following days people chip away at the concrete with hammers and chisels, tearing down the barrier that has divided the city since 1961.",
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'As far as I know... immediately, without delay.' },
        bron: { en: 'Günter Schabowski, East German government spokesman, press conference, 9 November 1989' },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Crowds of people standing on top of the Berlin Wall at night' },
        bijschrift: { en: 'Berliners climb onto the wall near the Brandenburg Gate' },
      },
    ],
  },
];
