import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'ninety-five-nails-on-a-door',
    titel: { en: 'Ninety-Five Nails on a Door' },
    ondertitel: { en: 'A monk challenges the sale of forgiveness' },
    teaser: { en: 'A list of complaints nailed to a church door splits a continent’s faith.' },
    jaar: 1517,
    periodeLabel: '1517',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 1,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['religion', 'printing', 'reformation'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In the German town of Wittenberg, a university professor and monk grows furious at traveling preachers who sell certificates promising forgiveness of sins. He writes ninety-five arguments against the practice and, following academic custom, posts them on the door of the Castle Church for other scholars to debate.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'What should have stayed a local university dispute spreads across Europe within weeks. Printing presses, still a fairly new invention, copy and recopy the theses far faster than any handwritten letter ever could. Within a few years the monk is excommunicated, and much of northern Europe breaks away from the pope entirely.',
        },
      },
      {
        type: 'citaat',
        tekst: {
          en: 'Why does the pope, whose wealth today is greater than the wealth of the richest of men, build the basilica of St. Peter with the money of poor believers rather than with his own money?',
        },
        bron: { en: 'Martin Luther, Ninety-Five Theses, Thesis 86 (1517)' },
      },
      {
        type: 'quiz',
        vraag: { en: 'Luther originally wrote his ninety-five theses in Latin, the language of scholars, not in German for ordinary people.' },
        antwoord: true,
        uitleg: {
          en: 'The theses were written for an academic audience. It was printers who quickly translated and reprinted them in German, which is what let the ideas reach far beyond the university.',
        },
      },
    ],
  },
  {
    id: 'the-long-way-around',
    titel: { en: 'The Long Way Around' },
    ondertitel: { en: 'One ship returns from a voyage that circles the globe' },
    teaser: { en: 'Five ships sail west to reach the east — only one makes it all the way home.' },
    jaar: 1522,
    periodeLabel: '1522',
    afbeelding: 'placeholder',
    volgorde: 2,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['exploration', 'navigation', 'trade'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Five ships leave Spain in 1519 under a Portuguese captain, aiming to reach the spice islands of Asia by sailing west instead of east around Africa. The voyage is longer and crueler than anyone expects: storms, mutiny, starvation, and a strait at the tip of South America so difficult it takes over a month to cross.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The captain never sees the voyage finished — he is killed in a local conflict in the Philippines in 1521. Command passes to his officers, and eventually to one ship, the Victoria, limping home in 1522 with a skeleton crew. It is the first vessel ever to sail all the way around the world.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A weathered sailing ship crossing open ocean' },
        bijschrift: { en: 'The Victoria, the only ship of the original fleet to complete the voyage' },
      },
      {
        type: 'quiz',
        vraag: { en: 'Ferdinand Magellan personally completed the full circumnavigation of the globe.' },
        antwoord: false,
        uitleg: {
          en: 'Magellan died partway through the voyage in the Philippines. It was his second-in-command, Juan Sebastián Elcano, who brought the last surviving ship home to Spain.',
        },
      },
    ],
  },
  {
    id: 'a-quiet-book-moves-the-earth',
    titel: { en: 'A Quiet Book Moves the Earth' },
    ondertitel: { en: 'A dying scholar reorders the universe' },
    teaser: { en: 'A book printed as its author lay dying quietly puts the sun at the center of everything.' },
    jaar: 1543,
    periodeLabel: '1543',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['science', 'astronomy', 'discovery'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'For decades, a Polish astronomer and church official works out the mathematics of a startling idea: the Earth is not the fixed center of the universe, but one of several planets circling the sun. Aware of how disruptive this claim could be, he delays publishing for years, refining his calculations in private.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'A printed copy of his finished book reaches him only in the last days of his life, in 1543. It spreads slowly at first, read mainly by other astronomers, but over the following century it reshapes how people understand their place in the cosmos entirely.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'Mathematics is written for mathematicians.' },
        bron: { en: 'Nicolaus Copernicus, dedication to De revolutionibus orbium coelestium (1543)' },
      },
    ],
  },
  {
    id: 'shares-for-every-merchant',
    titel: { en: 'Shares for Every Merchant' },
    ondertitel: { en: 'A trading venture invents a new way to raise money' },
    teaser: { en: 'Merchants pool their money into a single company — and invent the modern share.' },
    jaar: 1602,
    periodeLabel: '1602',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['trade', 'exploration', 'finance'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Sailing to Asia for spices is enormously profitable, but also enormously risky — a single lost ship can ruin a merchant. In 1602, a group of Dutch trading companies merges into one large chartered company, spreading the risk across many investors instead of a few wealthy families.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'To raise the huge sums needed for its fleets, the company sells shares to ordinary citizens, not just nobles and merchants — and lets them buy and sell those shares afterward. That marketplace becomes the world’s first stock exchange, a model that trading and finance still follow centuries later.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A large sailing ship being loaded at a busy harbor' },
      },
      {
        type: 'quiz',
        vraag: { en: 'This company was the first in the world to let ordinary people buy and trade shares openly.' },
        antwoord: true,
        uitleg: {
          en: 'Its shares could be bought, sold, and inherited freely on the exchange founded in Amsterdam — a genuine first for public investment.',
        },
      },
    ],
  },
  {
    id: 'a-single-law-for-heaven-and-earth',
    titel: { en: 'A Single Law for Heaven and Earth' },
    ondertitel: { en: 'One idea explains falling apples and orbiting moons' },
    teaser: { en: 'The same force that pulls things down to earth also holds the planets in their paths.' },
    jaar: 1687,
    periodeLabel: '1687',
    afbeelding: 'placeholder',
    volgorde: 5,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['science', 'mathematics', 'enlightenment'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'An English mathematician spends years working out why objects fall, why planets stay in orbit, and why tides rise and fall — and concludes it is all the same force, acting by the same mathematical rule, whether on Earth or among the stars.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'He publishes his findings in 1687 in a dense Latin work laying out laws of motion and universal gravitation. Few people can follow its mathematics at the time, but it becomes the foundation for physics and engineering for the next two centuries.',
        },
      },
      {
        type: 'quiz',
        vraag: { en: 'Newton\'s 1687 book was the first to argue that the same force governs motion both on Earth and in the heavens.' },
        antwoord: true,
        uitleg: {
          en: 'Before this, many assumed the heavens obeyed entirely different rules than the earthly world. Newton\'s single law of gravitation applied to both.',
        },
      },
    ],
  },
  {
    id: 'a-fortress-falls-in-paris',
    titel: { en: 'A Fortress Falls in Paris' },
    ondertitel: { en: 'A crowd turns on a symbol of royal power' },
    teaser: { en: 'An angry crowd storms an old prison-fortress, and a revolution begins.' },
    jaar: 1789,
    periodeLabel: '1789',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'vroegmoderne-tijd',
    themas: ['revolution', 'power', 'monarchy'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'Bread prices are soaring, the royal treasury is empty, and rumors swirl that the king is massing troops around Paris. On the morning of 14 July 1789, a crowd searching for weapons and gunpowder gathers outside the Bastille, an old fortress used to imprison people on the king\'s orders alone, without trial.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'After hours of fighting, the small garrison surrenders. The building holds only a handful of prisoners that day, but its fall matters far more as a symbol: ordinary Parisians have defeated a stronghold of royal authority by force. Within weeks, the fortress is being torn apart, stone by stone, by souvenir hunters.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'Is it a revolt? No, sire, it is a revolution.' },
        bron: { en: 'attributed exchange between the Duke of La Rochefoucauld-Liancourt and King Louis XVI, July 1789' },
      },
      {
        type: 'quiz',
        vraag: { en: 'The Bastille held hundreds of political prisoners at the time it was stormed.' },
        antwoord: false,
        uitleg: {
          en: 'By 1789 the Bastille held only seven prisoners. Its capture was significant as a symbol of royal power broken, not for freeing a large prison population.',
        },
      },
    ],
  },
];
