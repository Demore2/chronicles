import type { Verhaal } from '@/constants/types';

export const juliusCaesar: Verhaal = {
  id: 'julius-caesar',
  titel: { en: 'Julius Caesar' },
  ondertitel: { en: 'Roman military commander and statesman' },
  teaser: { en: 'From modest origins to the most powerful man in Rome—a story of ambition, genius, and tragedy.' },
  jaar: -44,
  periodeLabel: '100 BC - 44 BC',
  soort: 'persoon',
  portretKleur: '#8B4513',
  uitgelicht: false,
  volgorde: 1,
  tijdperkId: 'oudheid',
  themas: ['macht', 'rome', 'ambitie', 'militair', 'politiek'],
  leestijdMinuten: 40,
  chapters: [
    {
      id: 1,
      titel: { en: 'The Rise of an Ambitious Youth' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'In the heart of the Roman Republic, where power was contested and ambition drove men to extraordinary deeds, one figure would reshape the course of history: Gaius Julius Caesar. Born into a patrician family in 100 BC, Caesar was not destined for greatness from birth, yet through cunning, military genius, and an unrelenting appetite for power, he would transform Rome from a republic into an empire under his rule. His life was a tale of triumph and tragedy, of alliances forged and betrayed, and of a man who dared to challenge the very foundations of Roman democracy.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar was born into privilege, but not into power. His family, the Julii, traced their lineage back to Venus herself, according to Roman mythology, yet in his youth, Caesar lacked the wealth and influence that defined true power in Rome. His uncle Marius was a renowned general, and the young Caesar watched and learned, absorbing lessons about military strategy and political maneuvering. As a teenager, he served as a priest and studied rhetoric—the art of persuasion—which would become one of his greatest weapons. Rome in this era was tumultuous, torn between the interests of the Senate, the people, and ambitious generals who saw the state as a ladder to personal glory.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar\'s early career was marked by careful calculation. He allied himself with Pompey, one of Rome\'s greatest generals, and Crassus, one of Rome\'s wealthiest men. Together, they formed the First Triumvirate—not an official alliance, but a private agreement to support each other\'s political ambitions. Through this partnership, Caesar secured the position of consul in 59 BC, the highest office in the republic. With the consulship achieved, Caesar\'s eyes turned toward greater prizes: military glory and wealth that would cement his position as Rome\'s most powerful man.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'In what year was Julius Caesar born?' },
        opties: [
          { en: '50 BC' },
          { en: '100 BC' },
          { en: '44 BC' },
          { en: '75 BC' },
        ],
        antwoord: 1,
      },
    },
    {
      id: 2,
      titel: { en: 'The Conquest of Gaul' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'In 58 BC, Caesar was appointed governor of Gaul—the vast region that corresponds to modern-day France and parts of surrounding territories. What followed was eight years of relentless military campaigns that would make Caesar a legend. Gaul was not conquered; it had to be taken from a coalition of fierce Celtic tribes who fiercely resisted Roman expansion. Caesar proved to be a tactical genius, adapting his strategies to the terrain and the enemy he faced. He built fortifications, engineered siege weapons, and coordinated his legions with precision that earned the admiration of his soldiers.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'The conquest was brutal. Caesar estimated that he killed over one million Gauls and enslaved another million—though modern historians consider these figures inflated. Regardless, the campaign was devastating to the Gallic people and their way of life. For Caesar, however, it was transformative. His legions grew loyal to him personally, not to Rome. They saw him as a leader who would reward their loyalty with gold and glory. Caesar wrote dispatches describing his victories, which were read aloud in the Senate and published throughout Rome. His reputation grew with each campaign, and so did his wealth and the devotion of his soldiers—a combination that would prove decisive in the years to come.',
          },
        },
        {
          type: 'citaat',
          tekst: { en: 'Veni, vidi, vici' },
          bron: { en: 'Julius Caesar (Latin: "I came, I saw, I conquered")' },
        },
      ],
      quiz: {
        vraag: { en: 'How long did Caesar\'s campaigns in Gaul last?' },
        opties: [
          { en: '5 years' },
          { en: 'Eight years' },
          { en: '12 years' },
          { en: '3 years' },
        ],
        antwoord: 1,
      },
    },
    {
      id: 3,
      titel: { en: 'The Return and the Rubicon' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'By 50 BC, Caesar\'s enemies in the Senate, led by Pompey and the conservative faction, demanded that he disband his armies. Caesar, aware that returning to Rome without military power would leave him vulnerable to prosecution for his actions in Gaul, was in an impossible position. He was a military genius in the field, but in Rome\'s political arena, his rivals controlled the Senate. Negotiations broke down, and it became clear that his enemies intended to destroy him. In January 49 BC, the Senate voted to revoke Caesar\'s command.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar faced a choice: surrender and face certain ruin, or march on Rome. The Rubicon River marked the boundary between Gaul and Italy. Roman law forbade any general from bringing an army across the Rubicon into Italy itself. Caesar paused at the river\'s edge, fully aware of the gravity of his decision. To cross meant civil war. To turn back meant the destruction of everything he had built. With a mixture of resolve and resignation, Caesar gave the order: his legions would cross the Rubicon. The die was cast, and Rome would never be the same.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'What did crossing the Rubicon River mean for Caesar?' },
        opties: [
          { en: 'A peaceful negotiation' },
          { en: 'Civil war—an irreversible decision' },
          { en: 'A journey to Egypt' },
          { en: 'A retreat from Rome' },
        ],
        antwoord: 1,
      },
    },
    {
      id: 4,
      titel: { en: 'Civil War and Victory' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'The civil war between Caesar and Pompey lasted from 49 to 45 BC. Caesar, with the loyalty of his seasoned legions and his superior strategic mind, moved swiftly. Pompey, despite his legendary status, was outmaneuvered. Caesar defeated him at the Battle of Pharsalus in Greece in 48 BC, a decisive engagement that shattered Pompey\'s army. Pompey fled to Egypt, where he was assassinated, leaving Caesar without a rival of equal stature.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar pursued any remaining resistance in Africa and Spain, consolidating his power. By 45 BC, all opposition had been crushed. Caesar returned to Rome not as a consul, but as a dictator—a title that granted him absolute power. The Senate, controlled by Caesar\'s supporters, voted him dictator for life. Yet Caesar\'s victory was complete and overwhelming. He had achieved what no one before him had done: he had taken Rome through force of arms and made himself supreme.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'In which year did Caesar defeat Pompey at the Battle of Pharsalus?' },
        opties: [
          { en: '50 BC' },
          { en: '45 BC' },
          { en: '48 BC' },
          { en: '49 BC' },
        ],
        antwoord: 2,
      },
    },
    {
      id: 5,
      titel: { en: 'The Dictator\'s Reforms' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'With power consolidated, Caesar implemented sweeping reforms. He reformed the calendar, creating what we know today as the Julian calendar (the basis of our modern calendar, with Julius Caesar\'s name immortalized in the month of July). He reformed the land distribution system, providing property to his soldiers. He expanded Roman citizenship to non-Italians, strengthening the empire\'s unity. He reduced corruption and reorganized the provinces.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'These reforms were popular with the common people and the middle classes, who saw Caesar as a champion against the corrupt old aristocracy. However, the traditional Senate aristocrats—the very class from which Caesar came—viewed his reforms with alarm. They saw their power and privilege slipping away. Caesar\'s vision of Rome was fundamentally different from theirs: more centralized, more meritocratic, and above all, dependent on the power and will of a single man rather than the distributed power of aristocratic families.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'Which calendar reform is Julius Caesar famous for?' },
        opties: [
          { en: 'The Gregorian calendar' },
          { en: 'The Julian calendar' },
          { en: 'The lunar calendar' },
          { en: 'The Egyptian calendar' },
        ],
        antwoord: 1,
      },
    },
    {
      id: 6,
      titel: { en: 'The Ides of March' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'By 44 BC, Caesar\'s position seemed unassailable. He held the title of dictator for life. He had vanquished all his enemies. Yet the seeds of his destruction were sown among his closest allies. Senators who felt threatened by his power—including men he considered friends—began to plot. Among the conspirators was Brutus, a senator Caesar had treated with particular favor and affection. On the 15th of March (the Ides of March in the Roman calendar), Caesar attended a Senate meeting, ignoring warnings from a soothsayer who had cautioned him to "beware the Ides of March."',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'As Caesar took his seat, the conspirators surrounded him. One by one, they struck. Over sixty senators participated in the assassination, each stabbing Caesar to assert their commitment to the plot. Caesar tried to fight back, but overwhelmed by numbers, he fell. As he recognized Brutus among his attackers, Caesar supposedly uttered his final words: "Et tu, Brute?"—"And you, Brutus?" With that, one of history\'s most powerful men lay dead, victim not to an external enemy, but to the very men who governed beside him.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'On what date was Caesar assassinated?' },
        opties: [
          { en: 'The Kalends of March' },
          { en: 'The Nones of March' },
          { en: 'The Ides of March' },
          { en: 'The Ides of April' },
        ],
        antwoord: 2,
      },
    },
    {
      id: 7,
      titel: { en: 'The Legacy Unfolds' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar\'s assassination did not restore the Republic as the conspirators had hoped. Instead, it triggered another round of civil war. Caesar\'s ally Mark Antony and Caesar\'s adopted heir Octavian (later Augustus) defeated the assassins and took control of Rome. Over the following years, Octavian consolidated power and became the first emperor of Rome, creating the system that would last for centuries. In a sense, Caesar\'s dream of centralized power under a single leader was realized through his successors.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar\'s name became synonymous with power itself. The word "Caesar" was used as a title by Roman emperors and echoed through history—the German Kaiser, the Russian Tsar, and countless other rulers borrowed the name and the concept of absolute authority it represented. Julius Caesar transformed Rome from a republic into an empire. He changed the nature of power itself, showing that with sufficient ambition, military genius, and political skill, one man could reshape an entire civilization.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'Who was Caesar\'s adopted heir that became the first emperor?' },
        opties: [
          { en: 'Mark Antony' },
          { en: 'Octavian (later Augustus)' },
          { en: 'Pompey' },
          { en: 'Brutus' },
        ],
        antwoord: 1,
      },
    },
    {
      id: 8,
      titel: { en: 'A Man Who Changed History' },
      blokken: [
        {
          type: 'tekst',
          inhoud: {
            en: 'Caesar died at fifty-six years old, his life cut short just as his power reached its absolute peak. Yet in his fifty-six years, he accomplished more than most men achieve in a century. He conquered Gaul, expanded Rome\'s territory by millions of square miles. He defeated his rivals and took control of the greatest state the world had yet known. He implemented reforms that would influence governance for centuries to come.',
          },
        },
        {
          type: 'tekst',
          inhoud: {
            en: 'Julius Caesar\'s story is one of ambition, genius, and the dangers of concentrated power. He showed that Rome could be ruled by one man, that a single individual with talent and determination could reshape history. Yet his story also reveals the fragility of power maintained through force alone, and the deep human need for shared governance and accountability. His name lives on in history, in the calendar we use, and in the very concept of empire itself. From a youth of modest privilege to the most powerful man in the world, Julius Caesar walked a path few mortals have ever dared to tread.',
          },
        },
      ],
      quiz: {
        vraag: { en: 'At what age did Julius Caesar die?' },
        opties: [
          { en: '44 years old' },
          { en: '60 years old' },
          { en: '56 years old' },
          { en: '50 years old' },
        ],
        antwoord: 2,
      },
    },
  ],
};

export const oudheidPersonen: Verhaal[] = [juliusCaesar];
