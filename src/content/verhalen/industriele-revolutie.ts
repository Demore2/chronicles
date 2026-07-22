import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'the-line-that-outran-the-horse',
    titel: { en: 'The Line That Outran the Horse' },
    ondertitel: { en: 'A public railway proves steam can do more than haul coal' },
    teaser: { en: 'Thousands line the tracks to watch an engine pull passengers where only horses went before.' },
    jaar: 1825,
    periodeLabel: '1825',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 1,
    tijdperkId: 'industriele-revolutie',
    themas: ['railways', 'technology', 'progress'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'On a September morning in 1825, a strange procession sets out in the north of England: a steam locomotive called Locomotion No. 1, dragging a line of coal wagons and one carriage full of passengers behind it. It is the opening of the Stockton and Darlington Railway, the first public line built to carry both goods and people using steam power rather than horses.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'A man on horseback rides ahead waving a flag to warn onlookers, but the locomotive soon outpaces him, reaching speeds close to 15 miles per hour. Farmers and townsfolk who had never seen a train before gather along the route, some cheering, some crossing themselves. Within a generation, tracks like this one will be laid across entire continents.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'The engine set off at a pace that soon left the crowd behind, and it seemed as if the animal power of the country was already replaced.' },
        bron: { en: 'a newspaper account of the opening day' },
      },
      {
        type: 'quiz',
        vraag: { en: 'The Stockton and Darlington Railway, opened in 1825, was the first public railway to carry both passengers and freight using steam locomotives.' },
        antwoord: true,
        uitleg: { en: 'Earlier lines existed for hauling coal, but the Stockton and Darlington Railway was the first public railway to combine steam haulage with scheduled passenger service.' },
      },
    ],
  },
  {
    id: 'small-hands-in-the-mill',
    titel: { en: 'Small Hands in the Mill' },
    ondertitel: { en: 'Parliament hears what children endure on the factory floor' },
    teaser: { en: 'A government inquiry forces Britain to confront what its factories are doing to their youngest workers.' },
    jaar: 1833,
    periodeLabel: '1833',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'industriele-revolutie',
    themas: ['labor', 'reform', 'childhood', 'law'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In Britain\'s booming textile mills, children as young as five or six work twelve- or fourteen-hour shifts, tending spinning machines and crawling beneath moving equipment to clear jammed threads. Accidents are common, and exhausted children are sometimes beaten to keep them awake at their posts. For years, mill owners insist such labor is simply how the industry works.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A row of young children standing beside towering spinning machines in a cotton mill' },
        bijschrift: { en: 'Child laborers dwarfed by the machinery they were employed to tend and clean.' },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Testimony gathered before a parliamentary committee in 1832 exposes the injuries and stunted growth suffered by child mill workers, shocking the British public. The following year, Parliament passes the Factory Act of 1833: children under nine are barred from textile mills entirely, those under thirteen face limited hours and mandatory schooling, and paid inspectors are appointed to enforce the rules. It is one of the first laws anywhere to regulate child labor with real enforcement behind it.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: "Britain's Factory Act of 1833 banned children under the age of nine from working in textile mills." },
        antwoord: true,
        uitleg: { en: 'The Act set nine as the minimum age for textile mill work and limited the hours of children up to thirteen, backed by a new inspectorate to check compliance.' },
      },
    ],
  },
  {
    id: 'a-question-sent-down-the-wire',
    titel: { en: 'A Question Sent Down the Wire' },
    ondertitel: { en: 'The first telegraph message crosses forty miles in an instant' },
    teaser: { en: 'A single sentence, tapped in dots and dashes, travels faster than any letter or rider ever has.' },
    jaar: 1844,
    periodeLabel: '1844',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'industriele-revolutie',
    themas: ['communication', 'technology', 'invention'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In a committee room in the United States Capitol, Samuel Morse taps out a short message on a strange device of wire and electromagnets. Forty miles away in Baltimore, his assistant Alfred Vail receives the same message, letter by letter, on an identical machine. It is the first public demonstration of the electric telegraph, a line strung on poles between the two cities.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'What hath God wrought' },
        bron: { en: 'Samuel Morse, first official telegraph message, 24 May 1844' },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The phrase, suggested to Morse by a friend\'s daughter and drawn from the Book of Numbers, is chosen precisely because no one could have overheard it in advance. Within a decade, telegraph wires will follow railway lines across whole continents, and news that once took weeks to travel by ship or horse will arrive in minutes.',
        },
      },
    ],
  },
  {
    id: 'the-summer-the-river-turned-foul',
    titel: { en: 'The Summer the River Turned Foul' },
    ondertitel: { en: 'A stinking heatwave forces a city to rebuild itself underground' },
    teaser: { en: 'A stench so overpowering it drives lawmakers from their own chambers finally forces a great city to act.' },
    jaar: 1858,
    periodeLabel: '1858',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'industriele-revolutie',
    themas: ['urbanization', 'public health', 'engineering'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'London has grown faster than its plumbing. For decades, human waste and industrial runoff have poured directly into the River Thames, which also supplies much of the city\'s drinking water. In the unusually hot summer of 1858, the river\'s stench grows so overwhelming that curtains soaked in chemicals are hung over the windows of Parliament, and members debate abandoning the building entirely.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The crisis, remembered afterward as the Great Stink, finally pushes Parliament to fund a project engineers had been proposing for years: a vast new network of enclosed sewers designed by civil engineer Joseph Bazalgette to carry waste away from the city rather than into its own water supply. Built over the following decade, the system dramatically reduces outbreaks of cholera and becomes a model for growing industrial cities elsewhere.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Workers standing inside a huge brick sewer tunnel beneath the streets of London' },
        bijschrift: { en: 'One of the new brick-lined interceptor sewers built beneath London in the 1860s.' },
      },
      {
        type: 'quiz',
        vraag: { en: "London's 1858 sanitation crisis, known as the Great Stink, led directly to the construction of a major new sewer system." },
        antwoord: true,
        uitleg: { en: 'The stench of 1858 pushed Parliament to fund Joseph Bazalgette\'s sewer network, built through the 1860s, which greatly improved the city\'s public health.' },
      },
    ],
  },
  {
    id: 'a-crown-proclaimed-in-a-hall-of-mirrors',
    titel: { en: 'A Crown Proclaimed in a Hall of Mirrors' },
    ondertitel: { en: 'A new empire is declared inside a defeated rival\'s palace' },
    teaser: { en: 'Inside a conquered palace, assembled princes proclaim a new empire that will reshape the map of Europe.' },
    jaar: 1871,
    periodeLabel: '1871',
    afbeelding: 'placeholder',
    volgorde: 5,
    tijdperkId: 'industriele-revolutie',
    themas: ['nation-building', 'politics', 'war'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In January 1871, amid the final weeks of a war that has already toppled a French emperor, a crowd of German kings, dukes, and generals gathers not in Berlin but inside the occupied Palace of Versailles, in the ornate Hall of Mirrors built by French monarchs to celebrate their own power. There, the assembled rulers proclaim the king of Prussia as Kaiser of a newly united German Empire.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The ceremony is the culmination of years of careful diplomacy and three wars orchestrated by the Prussian statesman Otto von Bismarck, who has drawn a patchwork of independent German states into a single empire under Prussian leadership. Staging the proclamation inside a defeated France\'s own palace is a deliberate humiliation, one that leaves lasting bitterness. Almost overnight, a new and powerful state has appeared at the center of Europe.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'We had come to see a king crowned, and instead we watched an empire assembled out of iron and speeches.' },
        bron: { en: 'a German officer present at the ceremony' },
      },
    ],
  },
  {
    id: 'the-filament-that-would-not-quit',
    titel: { en: 'The Filament That Would Not Quit' },
    ondertitel: { en: 'After thousands of failures, a bulb finally glows for hours' },
    teaser: { en: 'After thousands of failed materials, a workshop finally finds a filament that glows through the night.' },
    jaar: 1879,
    periodeLabel: '1879',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'industriele-revolutie',
    themas: ['electricity', 'invention', 'technology'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'At his laboratory in Menlo Park, New Jersey, Thomas Edison and his team have already tested thousands of materials in search of a filament that will glow inside a glass bulb without quickly burning out. In October 1879, a carbonized cotton thread finally holds, glowing steadily for more than thirteen hours before it fails.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'It is not the first electric light ever built, but it is the first practical enough, and cheap enough, to imagine in every home. Within a few years, Edison\'s company is running power lines through parts of New York City, and gas lamps that had lit streets and homes for generations begin to give way to electric bulbs.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: "I have not failed. I've just found 10,000 ways that won't work." },
        bron: { en: 'Thomas Edison, on his years of experimentation' },
      },
      {
        type: 'quiz',
        vraag: { en: "Thomas Edison's 1879 light bulb was the first electric light of any kind ever built." },
        antwoord: false,
        uitleg: { en: 'Earlier inventors had already built working electric lights, including arc lamps; Edison\'s breakthrough was a long-lasting, practical bulb suitable for everyday household use.' },
      },
    ],
  },
];
