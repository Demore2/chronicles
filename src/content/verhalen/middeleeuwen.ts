import type { Verhaal } from '@/constants/types';

export const verhalen: Verhaal[] = [
  {
    id: 'a-dome-to-outdo-solomon',
    titel: { en: 'A Dome to Outdo Solomon' },
    ondertitel: { en: 'Justinian raises a new Hagia Sophia' },
    teaser: { en: 'After riots burn the old church to the ground, an emperor builds something the world has never seen.' },
    jaar: 537,
    periodeLabel: '537',
    afbeelding: 'placeholder',
    volgorde: 1,
    tijdperkId: 'middeleeuwen',
    themas: ['religion', 'architecture', 'empire'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In 532, riots tear through Constantinople and burn the city\'s great church to ashes. Rather than rebuild what was lost, Emperor Justinian orders something far more ambitious: a dome unlike any built before, wide enough to seem to float on light.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Two mathematicians, not master builders, are put in charge of the design. Within five years, using brick, stone, and an entirely new approach to engineering, Hagia Sophia rises over the city — a building so large its dome would not be surpassed in Europe for nearly a thousand years.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A vast domed church filled with light' },
        bijschrift: { en: 'Hagia Sophia, completed in 537' },
      },
      {
        type: 'citaat',
        tekst: { en: 'Solomon, I have outdone thee!' },
        bron: { en: 'Words later attributed to Emperor Justinian upon entering the finished church' },
      },
    ],
  },
  {
    id: 'an-empire-crowned-again',
    titel: { en: 'An Empire, Crowned Again' },
    ondertitel: { en: 'A Frankish king becomes Roman emperor' },
    teaser: { en: 'On Christmas Day, a king kneeling to pray rises up an emperor.' },
    jaar: 800,
    periodeLabel: '800',
    afbeelding: 'placeholder',
    uitgelicht: true,
    volgorde: 2,
    tijdperkId: 'middeleeuwen',
    themas: ['power', 'empire', 'religion'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'On Christmas Day in the year 800, King Charles of the Franks kneels to pray in Old St. Peter\'s Basilica in Rome. As he rises, Pope Leo III places a crown on his head, and the assembled crowd hails him as emperor — a title unused in the West for over three centuries.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The coronation binds the Frankish kingdom, already the largest in Western Europe, to the memory and authority of ancient Rome. Charlemagne, as he becomes known, now rules an empire stretching from the Pyrenees to the edge of Central Europe.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A king kneels as a pope places a crown on his head' },
        bijschrift: { en: 'The coronation of Charlemagne, Christmas Day, 800' },
      },
      {
        type: 'citaat',
        tekst: { en: 'To Charles Augustus, crowned by God, great and peace-bringing emperor of the Romans, life and victory!' },
        bron: { en: 'The Royal Frankish Annals, recording the crowd\'s acclamation' },
      },
      {
        type: 'quiz',
        vraag: { en: 'Charlemagne was the first person in centuries to be crowned "Emperor of the Romans" in Western Europe.' },
        antwoord: true,
        uitleg: {
          en: 'No Western ruler had held the title since the fall of the last Roman emperor in the West in 476, over three hundred years earlier.',
        },
      },
    ],
  },
  {
    id: 'an-arrow-decides-a-kingdom',
    titel: { en: 'An Arrow Decides a Kingdom' },
    ondertitel: { en: 'The Battle of Hastings' },
    teaser: { en: 'A single autumn day settles who will rule England for centuries to come.' },
    jaar: 1066,
    periodeLabel: '1066',
    afbeelding: 'placeholder',
    volgorde: 3,
    tijdperkId: 'middeleeuwen',
    themas: ['power', 'conquest', 'war'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In October 1066, two armies face each other on a ridge near Hastings. King Harold II of England has just marched his exhausted troops the length of the country after crushing one invasion in the north, only to meet a second: William, Duke of Normandy, has landed with his own claim to the English throne.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'The fighting lasts most of the day. Harold\'s shield wall holds for hours against repeated cavalry charges, until a late assault breaks the English line. Harold is killed in the fighting, and within weeks William marches on London to be crowned king.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'Armored knights on horseback charge a line of shielded soldiers' },
        bijschrift: { en: 'The Battle of Hastings, depicted on the Bayeux Tapestry' },
      },
      {
        type: 'quiz',
        vraag: { en: 'William the Conqueror was crowned King of England on the day of the battle itself.' },
        antwoord: false,
        uitleg: {
          en: 'William won the battle in October but was not crowned king until Christmas Day 1066, after securing London.',
        },
      },
    ],
  },
  {
    id: 'a-king-bends-to-parchment',
    titel: { en: 'A King Bends to Parchment' },
    ondertitel: { en: 'The sealing of Magna Carta' },
    teaser: { en: 'Furious barons corner their king in a meadow and force him to sign away his own absolute power.' },
    jaar: 1215,
    periodeLabel: '1215',
    afbeelding: 'placeholder',
    volgorde: 4,
    tijdperkId: 'middeleeuwen',
    themas: ['law', 'power'],
    leestijdMinuten: 2,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'By 1215, King John of England has taxed and antagonized his barons past their limit. Rather than face open civil war unarmed of any settlement, John meets the rebellious barons at Runnymede, a meadow beside the River Thames, and puts his royal seal to a charter limiting his own power.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Magna Carta promises that free men cannot be imprisoned or punished except through lawful judgment, and that even the king is bound by the law of the land. John tries to have it annulled within months, but the charter is reissued by later kings and slowly becomes a cornerstone of English law.',
        },
      },
      {
        type: 'citaat',
        tekst: { en: 'No free man shall be seized or imprisoned, or stripped of his rights or possessions... except by the lawful judgment of his equals or by the law of the land.' },
        bron: { en: 'Magna Carta, clause 39' },
      },
      {
        type: 'quiz',
        vraag: { en: 'King John willingly and permanently accepted every term of Magna Carta.' },
        antwoord: false,
        uitleg: {
          en: 'John sought the pope\'s help to annul the charter within weeks, and it only endured because his successors reissued revised versions of it.',
        },
      },
    ],
  },
  {
    id: 'a-ship-brings-a-reckoning',
    titel: { en: 'A Ship Brings a Reckoning' },
    ondertitel: { en: 'The Black Death arrives in Europe' },
    teaser: { en: 'A merchant fleet limps into harbor carrying a sickness that will kill a third of a continent.' },
    jaar: 1347,
    periodeLabel: '1347',
    afbeelding: 'placeholder',
    volgorde: 5,
    tijdperkId: 'middeleeuwen',
    themas: ['disease', 'society'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'In October 1347, a fleet of Genoese trading ships puts in at the Sicilian port of Messina. Most of the sailors aboard are already dead or dying, covered in strange black swellings. Within days, the sickness is loose in the port city, and there is no way to stop its spread.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'Carried along trade routes by fleas living on black rats, the plague sweeps across Europe over the next four years. Towns empty, harvests rot in the fields for lack of workers, and by the time it recedes, an estimated one-third to one-half of Europe\'s population is dead.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A ship approaches a medieval harbor town' },
        bijschrift: { en: 'A trading vessel nearing a European port, 1347' },
      },
      {
        type: 'quiz',
        vraag: { en: 'People in 1347 understood that the plague was spread by fleas carried on rats.' },
        antwoord: false,
        uitleg: {
          en: 'Germ theory did not exist yet; contemporaries blamed causes ranging from bad air to divine punishment. The role of fleas and rats was only established scientifically in the late 19th century.',
        },
      },
    ],
  },
  {
    id: 'a-press-multiplies-the-word',
    titel: { en: 'A Press Multiplies the Word' },
    ondertitel: { en: 'Gutenberg\'s printing press' },
    teaser: { en: 'A goldsmith in Mainz builds a machine that can copy a book faster than a room full of scribes.' },
    jaar: 1450,
    periodeLabel: 'c. 1450',
    afbeelding: 'placeholder',
    volgorde: 6,
    tijdperkId: 'middeleeuwen',
    themas: ['technology', 'knowledge'],
    leestijdMinuten: 3,
    blokken: [
      {
        type: 'tekst',
        inhoud: {
          en: 'For centuries, every book in Europe has been copied by hand, letter by letter, a task that can take a scribe a year or more to complete. In the German city of Mainz, a goldsmith named Johannes Gutenberg spends years perfecting a different idea: cast metal letters that can be arranged, inked, pressed onto paper, and reused.',
        },
      },
      {
        type: 'tekst',
        inhoud: {
          en: 'By around 1450, Gutenberg\'s workshop is running a working press, and within a few years it produces a complete Bible of striking quality. The technique spreads across Europe within decades, and the price of books begins a steady fall that puts reading within reach of far more people than ever before.',
        },
      },
      {
        type: 'afbeelding',
        bron: 'placeholder',
        alt: { en: 'A workshop with a wooden printing press and trays of metal type' },
        bijschrift: { en: 'A reconstruction of a mid-15th-century print workshop' },
      },
      {
        type: 'citaat',
        tekst: { en: 'This noble art has brought light to things that were hidden in darkness.' },
        bron: { en: 'An early printer, describing the spread of the press' },
      },
    ],
  },
];
