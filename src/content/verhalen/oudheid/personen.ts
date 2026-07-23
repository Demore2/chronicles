import type { Verhaal } from '@/constants/types';
import { GENERATED_IMAGES } from '@/constants/generated-images';

export const juliusCaesar: Verhaal = {
  id: 'julius-caesar',
  titel: { en: 'Julius Caesar' },
  ondertitel: { en: 'Roman military commander and statesman' },
  teaser: { en: 'From modest origins to the most powerful man in Rome—a story of ambition, genius, and tragedy.' },
  jaar: -44,
  periodeLabel: '100 BC - 44 BC',
  soort: 'persoon',
  afbeelding: GENERATED_IMAGES['julius-caesar'],
  portretKleur: '#8B4513',
  uitgelicht: false,
  volgorde: 1,
  tijdperkId: 'oudheid',
  themas: ['macht', 'rome', 'ambitie', 'militair', 'politiek'],
  leestijdMinuten: 40,
  personage: { naam: 'Julius Caesar' },
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
    },
  ],
};

export const spartacus: Verhaal = {
  id: 'spartacus',
  titel: { en: 'Spartacus' },
  ondertitel: { en: 'Gladiator and leader of the greatest slave revolt in Roman history' },
  teaser: { en: 'From the arena to freedom—a man who dared to challenge an empire.' },
  jaar: -71,
  periodeLabel: '109 BC - 71 BC',
  soort: 'persoon',
  afbeelding: GENERATED_IMAGES['spartacus'],
  portretKleur: '#CD853F',
  uitgelicht: false,
  volgorde: 2,
  tijdperkId: 'oudheid',
  themas: ['vrijheid', 'opstand', 'rome', 'verzet', 'slavernij'],
  leestijdMinuten: 40,
  personage: { naam: 'Spartacus' },
  chapters: [
    { id: 1, titel: { en: 'Forged in Chains' }, blokken: [{ type: 'tekst', inhoud: { en: 'In the Roman province of Thrace, a man whose name would echo through history as a symbol of resistance was born into slavery. Spartacus possessed a spirit that chains could not break. Around 109 BC, he entered the world as a slave, stripped of freedom by military defeat. For much of his life, he remained bound to masters who saw him as nothing more than property—a tool to be used and discarded.' } }, { type: 'tekst', inhoud: { en: 'The institution of slavery in Rome was vast and brutal. Millions labored in mines, fields, and households across the empire. But it was in the gladiatorial arenas where Spartacus found his purpose. Sold to Batiatus, a lanista who trained fighters for combat, Spartacus excelled. He possessed strength, speed, and intelligence. He survived the arena when so many others perished, earning a reputation as an exceptional fighter.' } }, { type: 'tekst', inhoud: { en: 'Yet even as Spartacus defeated opponent after opponent, something burned within him. The roar of crowds and the blood did not dull his desire for freedom. Unlike many who accepted their fate, Spartacus never resigned himself to slavery. In 73 BC, at approximately thirty-six years old, Spartacus was housed in the gladiatorial school at Capua, Italy. It was here that Spartacus would ignite a flame that would shake Rome to its foundations.' } }] },
    { id: 2, titel: { en: 'The Slave Pits' }, blokken: [{ type: 'tekst', inhoud: { en: 'The gladiatorial school at Capua was organized horror. Men were treated as expendable commodities, fed minimal rations and beaten for infractions. The training was intense—designed to produce fighters who would fight regardless of wounds or fear. Spartacus trained alongside warriors like Crixus and Gannicus. Among them, Spartacus began to organize, speaking of freedom not as an impossible dream, but as something that could be seized.' } }, { type: 'tekst', inhoud: { en: 'In the arena, gladiators were forced to fight to the death before crowds demanding blood. Yet before games began, they took an oath binding them as warriors and men. It was this oath Spartacus invoked. He spoke to his fellow fighters about escape, about taking their weapons and breaking free. Most dismissed him as a dreamer. Others, worn down by years of servitude, began to believe. Word spread quietly—there was a plan.' } }, { type: 'tekst', inhoud: { en: 'The guards and masters were confident in their control. They did not see these broken men as a threat, did not see the spark of rebellion Spartacus had kindled. In 73 BC, that spark was about to become a fire.' } }] },
    { id: 3, titel: { en: 'The Spark Ignites' }, blokken: [{ type: 'tekst', inhoud: { en: 'In 73 BC, Spartacus and followers made their move. Approximately seventy or eighty gladiators fled, leaving behind the walls of their prison. They fled to Mount Vesuvius, a desperate refuge where they might hide from pursuing Romans. But here, Spartacus began to gather recruits. Word spread among the enslaved: a gladiator had broken free and was gathering followers. Field workers, servants, miners—all began to seek him out.' } }, { type: 'tekst', inhoud: { en: 'Spartacus transformed this growing mass into an army. He organized them into units, trained them to fight, and gave them hope. Within months, approximately 70,000 followers had gathered. They were not professional soldiers, but they were fighting for their lives, for their freedom. This hunger for liberty proved a powerful motivator. Spartacus declared that his followers would no longer be slaves—they would fight their way to freedom or die trying.' } }, { type: 'tekst', inhoud: { en: 'For the first time, Rome would face a slave revolt of unprecedented scale. The mountain that would later destroy Pompeii was now the birthplace of a rebellion that would shake Rome to its core.' } }] },
    { id: 4, titel: { en: 'First Victories' }, blokken: [{ type: 'tekst', inhoud: { en: 'Rome sent relatively small forces to crush what they viewed as a minor nuisance. This proved a grave mistake. The Roman forces, confident in their superiority, advanced into Spartacus\'s territory. What followed were stunning defeats for Rome. Spartacus, with tactical brilliance and knowledge of terrain, outmaneuvered the Roman legions. One by one, Roman commanders fell in battle or retreated in humiliation.' } }, { type: 'tekst', inhoud: { en: 'The early victories had a profound effect throughout Italy. The enslaved population, witnessing that their Roman masters were not invincible, flocked to join his cause. Entire estates were liberated, entire communities rose up against their oppressors. Spartacus\'s army grew exponentially. These victories gave the slave army confidence. They were no longer just refugees hiding in mountains; they were a force that could defeat Roman armies.' } }, { type: 'citaat', tekst: { en: 'I am not a slave, and I will never again be a slave' }, bron: { en: 'Spartacus' } }] },
    { id: 5, titel: { en: 'The March Through Italy' }, blokken: [{ type: 'tekst', inhoud: { en: 'Having defeated multiple Roman forces, Spartacus faced a crucial decision. He could escape Rome, seeking safety beyond the empire\'s borders, or continue marching through Italy, liberating more slaves. For a time, he marched north toward the Alps, perhaps hoping to lead his people to freedom in Gaul. Yet his followers had other ideas. Many had families still enslaved in the south. Others believed they could actually challenge Rome, could overthrow the system that had enslaved them.' } }, { type: 'tekst', inhoud: { en: 'Spartacus decided to turn his army around and march south, toward Rome itself. It was a bold, perhaps reckless decision. As they moved through Italy, more and more joined his cause. The wealthy estates that had built Rome\'s prosperity were attacked and burned. The slaveholders who had lived off enslaved labor were killed or fled. For a brief, glorious moment, it seemed possible that the slave revolt could actually succeed.' } }, { type: 'tekst', inhoud: { en: 'Rome\'s rulers watched with alarm. A slave was marching through their territory with an army now in the hundreds of thousands. The Senate took action. They recalled their best general from Spain and gave him command against Spartacus. His name was Marcus Licinius Crassus, one of Rome\'s richest men and a brilliant military commander.' } }] },
    { id: 6, titel: { en: 'Alliance Tested' }, blokken: [{ type: 'tekst', inhoud: { en: 'Crassus proved a far more formidable opponent than previous generals. He was disciplined, strategic, and merciless. He understood that Spartacus\'s army, though numerous, was not a true military force but desperate individuals. Crassus implemented encirclement and containment, cutting off escape routes and fragmenting forces. The slave army, which had seemed so powerful months earlier, began to come apart. Internal divisions emerged—some wanted to continue fighting, others wanted to escape, still others wanted to negotiate.' } }, { type: 'tekst', inhoud: { en: 'Among Spartacus\'s followers were different factions with different goals. Some, like Crixus, believed in fighting to the end. Others questioned whether they could defeat Rome. Spartacus held his fractured army together through force of personality, but the unity that had made early victories possible was crumbling. The reality of facing a professional Roman military machine was sobering. Each battle with Crassus ate away at numbers and resources.' } }, { type: 'tekst', inhoud: { en: 'By 71 BC, Spartacus was cornered in southern Italy. Crassus had cut off his escape routes. Behind him was the sea; ahead and on all sides were Roman legions. Spartacus\'s great dream had reached its final moment. He had achieved something no slave before him had—gathered hundreds of thousands, defeated Rome\'s generals, proven the enslaved could fight back. But Rome\'s military machine had proven too powerful.' } }] },
    { id: 7, titel: { en: 'Final Stand' }, blokken: [{ type: 'tekst', inhoud: { en: 'In 71 BC, at the foot of Mount Vesuvius, Spartacus and his remaining forces made their final stand. The exact battle details are unclear—ancient sources vary—but what is certain is that it was devastating. Crassus brought Rome\'s full military might to bear. Spartacus, knowing the end was near, fought with the courage of a man with nothing left to lose but his chains. He died in battle, though it is not entirely clear how.' } }, { type: 'tekst', inhoud: { en: 'The aftermath was brutal. Crassus wanted to make an example, to ensure no one would ever dare rise up again. He crucified 6,000 of Spartacus\'s followers along the Appian Way, the great road connecting Rome to the provinces. The crucified slaves were left hanging, a terrible warning to anyone who might consider rebellion. Yet in doing this, Rome\'s rulers admitted something: they feared the enslaved. They recognized that beneath their empire\'s surface existed a vast population that resented their bondage.' } }, { type: 'tekst', inhoud: { en: 'Spartacus died as he lived—a warrior fighting for freedom. He never achieved his ultimate goal of liberating all Rome\'s enslaved. But he proved something Rome\'s rulers had hoped to keep hidden: that the enslaved were not content to remain in chains, that they could organize, could fight, and could challenge even the greatest military power the world had yet known.' } }] },
    { id: 8, titel: { en: 'Legacy of Freedom' }, blokken: [{ type: 'tekst', inhoud: { en: 'Spartacus died in 71 BC, but his memory lived on. For the enslaved masses, he became a symbol of resistance—proof that freedom was not impossible, that slaves could fight back. For Rome\'s rulers, he was a cautionary tale—a reminder that power built on slavery could never be entirely stable. In centuries that followed, Spartacus\'s name was remembered and retold. Philosophers, historians, and modern revolutionaries invoked his spirit as evidence that the oppressed could rise up against their oppressors.' } }, { type: 'tekst', inhoud: { en: 'While Rome continued relying on slavery for centuries after Spartacus\'s death, his revolt exposed deep contradictions of the slave system. Subsequent slave wars were fewer and less successful. Yet Spartacus demonstrated something no military power could fully suppress: the human desire for freedom is stronger than the chains that bind us. In the end, Spartacus did not fail—he succeeded in proving that the enslaved were not mere property, but men and women capable of fighting for their own destiny.' } }, { type: 'tekst', inhoud: { en: 'His name echoes through history as a symbol of resistance, of the courage it takes to defy an empire, and of the belief that freedom is worth any price. Spartacus remains one of history\'s most inspiring figures—a man who dared to dream of liberation and inspired millions to do the same.' } }] },
  ],
};

export const oudheidPersonen: Verhaal[] = [juliusCaesar, spartacus];
