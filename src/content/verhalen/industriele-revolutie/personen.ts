import type { Verhaal } from '@/constants/types';

export const james: Verhaal = {
  id: 'james-watt',
  titel: { en: 'James Watt' },
  ondertitel: { en: 'Scottish Engineer Who Perfected the Steam Engine' },
  teaser: { en: 'A mind obsessed with efficiency transformed the world through steam.' },
  jaar: 1819,
  periodeLabel: '1736 - 1819',
  soort: 'persoon',
  portretKleur: '#5B6B73',
  uitgelicht: false,
  volgorde: 1,
  tijdperkId: 'industriele-revolutie',
  themas: ['stoom', 'uitvinding', 'industrie', 'schotland', 'technologie'],
  leestijdMinuten: 45,
  personage: { naam: 'James Watt' },
  chapters: [
    {
      id: 1,
      titel: { en: 'A Boy Who Asked Questions' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'James Watt was born on January 19, 1736, in Greenock, Scotland, during a time when the world was beginning to transform through mechanical innovation. His father, James Watt Sr., was a ship carpenter and merchant. His mother, Agnes Muirhead, came from a respected family. Young James showed an early curiosity about how things worked. He would spend hours observing the mechanical devices around him, asking questions that sometimes puzzled the adults in his life. Unlike many children his age who were content to accept things as they were, James wanted to understand the principles behind them.' },
        {
          type: 'tekst',
          inhoud: { en: 'James received a basic education in reading, writing, and mathematics, but his greatest teacher was his own curiosity and observation. He watched blacksmiths, carpenters, and other craftsmen at work, learning the practical skills of making and repairing things. He developed an interest in mathematics and the sciences, studying them on his own when formal instruction was not available. When he was a teenager, James decided he wanted to become an instrument maker—someone who would build precision instruments for scientific research and navigation. To pursue this ambition, he traveled to London to apprentice with a renowned instrument maker. After a year of study, he returned to Scotland with the skills and knowledge he needed to establish himself in this trade.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'The Problem of Inefficiency' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In the 1760s, James Watt was working as an instrument maker and repairer at the University of Glasgow. One day, he was asked to repair a model of a Newcomen steam engine—a device that had been invented by Thomas Newcomen decades earlier and was used to pump water out of mines. The Newcomen engine worked, but it was terribly inefficient. It wasted enormous amounts of fuel because it was constantly being heated and then cooled in the same chamber, requiring continuous firing of the furnace to keep it running.' },
        {
          type: 'tekst',
          inhoud: { en: 'As Watt examined the engine, he began to think about the problem. Why did it waste so much fuel? The issue, he realized, was that every cycle required heating a massive cylinder and then cooling it—an enormously wasteful process. He began to calculate and think about how the engine might be improved. What if, instead of cooling the entire cylinder, only a small section was cooled? What if the hot and cold parts of the engine were separated? These thoughts occupied him for weeks as he worked on other tasks and pursued his daily life.' },
        {
          type: 'tekst',
          inhoud: { en: 'In 1765, while walking across Glasgow Green on a Sunday afternoon, the solution came to him in a flash of insight. Separate the condenser! Keep one chamber for condensation and another for the high-pressure steam. This simple but brilliant idea would transform the steam engine from a fuel-hungry, inefficient device into a powerful and relatively economical machine. Watt immediately began to work on the concept, first in his mind and then on paper, calculating the improvements and planning how to build a model that would prove his theory.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'Innovation and Partnership' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Watt built a model of his improved steam engine and tested it. The results exceeded his expectations. His new design used only about a quarter of the fuel that a Newcomen engine would require for the same amount of work. But building a working engine and getting it manufactured were very different challenges. Watt had the knowledge and creativity to invent, but he lacked the capital and business acumen to bring his invention to market. This is where fortune intervened. Watt met Matthew Boulton, a successful industrialist who owned a manufacturing enterprise near Birmingham. Boulton recognized the potential of Watt\'s invention immediately and proposed a partnership.' },
        {
          type: 'tekst',
          inhoud: { en: 'In 1775, Watt and Boulton established a formal partnership. Boulton would manufacture the engines, and Watt would continue to improve the design and supervise production. It was a perfect match: Watt had the genius for innovation, while Boulton had the business skills, capital, and manufacturing facilities necessary to turn the invention into a commercial success. Together, they began producing steam engines that were far more efficient than anything previously available. Their engines started being used not just for pumping water from mines but for powering machinery in factories, mills, and other industrial operations.' },
        {
          type: 'tekst',
          inhoud: { en: 'Watt continued to improve his design throughout the 1770s and 1780s. He developed a rotary motion engine that could power machinery directly, without the complex system of levers and rods that had been required before. He added governors to regulate speed, developed new valve systems, and created improvements that made the engines more reliable and efficient. Each improvement expanded the possible uses for the steam engine and increased its value to industry.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'The Power Revolution' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'As Watt\'s improved steam engines became available, they revolutionized manufacturing and transportation. Factories no longer needed to be built near water sources to power their machinery with waterwheels. They could be built anywhere, powered by steam engines. This flexibility transformed manufacturing, allowing industrial development to spread far beyond the locations that had natural water power. The engines were used in textile mills, iron foundries, breweries, and countless other industrial facilities. Output increased dramatically as industries could increase production beyond what had previously been possible.' },
        {
          type: 'citaat',
          tekst: { en: 'I can think of nothing else but this machine. I\'ll never be happy until it succeeds.' },
          bron: { en: 'James Watt' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'The steam engine also transformed transportation. While Watt himself was skeptical about applying his engine to transportation, others saw the possibilities. Within decades of his death, steam engines were powering locomotives and steamships, revolutionizing travel and commerce. Goods could be transported faster and more reliably than ever before. People could travel across continents and across oceans with unprecedented speed. The industrial revolution that Watt had helped to create ultimately connected the entire world in new ways.' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'The Mind Never Rests' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Despite the success of his steam engine business, Watt\'s curiosity never ceased. He investigated chemistry, geology, and metallurgy. He experimented with various processes and materials. He studied the properties of steam itself to better understand how to make engines more efficient. He took out numerous patents for improvements and new applications of steam power. By the end of his life, he held so many patents that he was recognized as one of the most prolific inventors in British history.' },
        {
          type: 'tekst',
          inhoud: { en: 'Watt was also interested in the broader implications of technology. He was elected to the Lunar Society, an informal group of scientists, engineers, and businessmen who met near Birmingham to discuss scientific discoveries and their practical applications. Members of this society included some of the brightest minds of the age, and their conversations helped to shape the scientific and industrial development of Britain. Watt remained intellectually active well into his later years, continuing to observe, learn, and contribute to the advancement of knowledge.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'Honors and Recognition' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'By the end of his life, James Watt was widely recognized as one of the greatest engineers and inventors of his age. Universities awarded him honorary degrees. The Royal Society of London, the most prestigious scientific organization in Britain, recognized his achievements. The unit of power called the "watt"—used to measure electrical and mechanical power—was named in his honor, ensuring that his name would be associated with power and energy for all time.' },
        {
          type: 'tekst',
          inhoud: { en: 'Watt retired from his business around 1800, turning over the operation of the company to his son and others. He continued to be active in research and invention until his death in 1819 at the age of eighty-three. By the time he died, the world had been transformed by the industrial revolution that his improvements to the steam engine had made possible. The economy had shifted from an agricultural base to an industrial one. Production had increased exponentially. Trade had expanded globally. Watt had lived to see the beginning of a new age—the age of steam and industry.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'An Industrial World' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'James Watt\'s improvements to the steam engine were not just technical achievements; they were the foundation of the Industrial Revolution. Without his innovation, the transformation of society that occurred in the eighteenth and nineteenth centuries might not have happened, or might have developed much more slowly. The steam engine powered the factories that produced goods on an unprecedented scale. It drove the railroads that connected cities and nations. It propelled the ships that carried goods and people around the world. Every major development in the industrial age was either directly or indirectly powered by engines based on Watt\'s principles.' },
        {
          type: 'tekst',
          inhoud: { en: 'The industrial revolution brought tremendous benefits to humanity. It created wealth, enabled technological progress, and improved living standards (eventually, after initial hardships). It also brought challenges—urban overcrowding, pollution, child labor in factories, and the social dislocation of traditional ways of life. But it transformed the world permanently, bringing humanity into the modern age. At the center of this transformation stood James Watt\'s steam engine, a machine that changed everything.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'The Engineer\'s Legacy' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'James Watt embodied the spirit of the engineer and inventor. He was not a dreamer who imagined grand possibilities without understanding practical reality. Nor was he merely a craftsman who made things work without understanding the principles behind them. He was a man who combined practical knowledge with scientific understanding, who could identify a problem, think through potential solutions mathematically, and then work with others to bring those solutions to practical reality. His approach—identifying inefficiency, thinking systematically about solutions, and implementing improvements—became the foundation of engineering as a discipline.' },
        {
          type: 'tekst',
          inhoud: { en: 'More than two hundred years after his death, James Watt is remembered as one of the most important figures in the history of technology and industry. His portrait appears in textbooks. His name is known around the world as the unit of electrical power. His inventions are studied in every engineering curriculum. But perhaps his greatest legacy is less his specific inventions than the attitude they represent—the belief that human ingenuity, combined with systematic thinking and hard work, can solve problems and create tools that transform the world. That belief, more than any specific engine, is what James Watt gave to the world.' }
        }
      ]
    }
  ]
};

export const florence: Verhaal = {
  id: 'florence-nightingale',
  titel: { en: 'Florence Nightingale' },
  ondertitel: { en: 'The Pioneer Who Transformed Modern Nursing' },
  teaser: { en: 'She defied her family, revolutionized healthcare, and proved that data could save lives.' },
  jaar: 1910,
  periodeLabel: '1820 - 1910',
  soort: 'persoon',
  portretKleur: '#8B6B47',
  uitgelicht: false,
  volgorde: 2,
  tijdperkId: 'industriele-revolutie',
  themas: ['verpleegkunde', 'geneeskunde', 'oorlog', 'hervorming', 'vrouwen'],
  leestijdMinuten: 46,
  personage: { naam: 'Florence Nightingale' },
  chapters: [
    {
      id: 1,
      titel: { en: 'Born to Wealth, Called to Service' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Florence Nightingale was born on May 12, 1820, into a wealthy and respected English family. Her mother was fashionable and concerned with social status; her father was a landowner with progressive ideas. Florence grew up in luxury, surrounded by comfort and opportunity. She was well-educated—unusual for girls of her time—and learned languages, history, music, and mathematics. She was expected to make an advantageous marriage to a gentleman of appropriate social standing and to spend her life managing a household and raising children, as was typical for women of her class.' },
        {
          type: 'tekst',
          inhoud: { en: 'But Florence had other dreams. When she was young, she felt what she later described as a "calling"—a sense that God wanted her to dedicate her life to serving others. Specifically, she felt drawn to nursing. In the 1840s, nursing was not a respectable profession for women of good family. Nurses were often seen as rough, uneducated women of questionable character. The idea that Florence would want to work in hospitals tending to the sick was shocking to her family. They opposed her plans firmly and repeatedly. They urged her to abandon these ambitions and accept her place in respectable society.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'Against All Odds' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Florence\'s determination was extraordinary. Despite her family\'s opposition, she pursued her goal of becoming a nurse. She found ways to gain practical experience. She studied at a training institution in Germany. She visited hospitals and learned about different approaches to patient care and hospital management. She read everything she could find about nursing, medicine, and hospital administration. Her family remained opposed, but Florence persisted. At age thirty-one, after years of conflict with her family, Florence accepted a position as superintendent of a small private hospital in London. This was a major achievement—she now had authority to implement her ideas about patient care and hospital management.' },
        {
          type: 'tekst',
          inhoud: { en: 'Florence\'s opportunity to make her greatest impact came in 1853 when the Crimean War broke out. Britain, France, and the Ottoman Empire were fighting against Russia. British soldiers were dying not primarily from combat wounds but from disease—typhus, dysentery, typhoid, and cholera were killing more soldiers than enemy bullets. Conditions in the military hospitals were terrible: overcrowded, dirty, poorly ventilated, and inadequately supplied. When reports of these conditions reached Britain, public outrage grew. Florence read the reports and knew this was where she needed to be. She offered her services, and with official permission, she traveled to the Crimea with a small group of nurses she had trained.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'The Lady with the Lamp' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'When Florence Nightingale and her nurses arrived at the Barrack Hospital in Scutari in November 1853, they found appalling conditions. The hospital was filthy, lice-infested, and overrun with rats. Patients lay on straw mattresses that were never changed. The mortality rate was shockingly high—in some months, more than one in four of the patients admitted died. Florence and her nurses immediately set about trying to improve conditions. They scrubbed floors, washed bedding, improved ventilation, and organized supply systems. They provided basic care and comfort to the wounded and dying soldiers.' },
        {
          type: 'tekst',
          inhoud: { en: 'Florence worked tirelessly, often staying up all night tending to patients. According to accounts, she would walk through the wards at night, making her rounds with a lamp, checking on patients and making sure they had what they needed. She became known as "the Lady with the Lamp," an image that captured the public imagination and made her famous. But Florence was not satisfied with just providing comfort. She began to analyze the hospital\'s records systematically. She collected data on mortality rates, causes of death, and changes in conditions. Her analysis revealed something shocking: most of the soldiers were dying not from their wounds but from diseases that resulted from poor sanitation and overcrowding.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Florence\'s data-driven approach was revolutionary for its time. She used statistics to prove that improving sanitation and hygiene could dramatically reduce mortality. She created detailed charts and diagrams showing the relationship between sanitary conditions and patient outcomes. Her work demonstrated that systematic observation, careful record-keeping, and analysis of data could identify problems and solutions. This approach—using statistics to understand and improve healthcare—became the foundation of modern hospital administration and public health.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'Data Saves Lives' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'As Florence implemented improvements in sanitation at the Barrack Hospital, something remarkable happened. The mortality rate began to fall dramatically. Patients who might have died from typhoid, dysentery, or cholera began to recover. The improvements she made—better ventilation, cleaner bedding, improved water supply, and organized waste disposal—had a measurable impact on patient survival. Her careful records proved it beyond doubt.' },
        {
          type: 'citaat',
          tekst: { en: 'To understand God\'s thoughts, we must study statistics, for these are the measure of His purpose.' },
          bron: { en: 'Florence Nightingale' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'When Florence returned to England after the Crimean War, she was famous. She had become a symbol of compassion and dedication. But Florence was not interested in basking in fame. She was focused on using her experience to transform nursing and healthcare more broadly. She wrote extensively about what she had learned. She designed a training school for nurses that emphasized both theoretical knowledge and practical skills. She advised on hospital design and organization. She advocated for public health reforms that would improve conditions for poor people living in crowded urban areas. She was determined that the lessons learned from her work in the Crimea would benefit the entire nation.' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Establishing Modern Nursing' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1860, Florence Nightingale established the Nightingale Training School at St. Thomas\' Hospital in London. This was the first systematic training program for nurses, designed to elevate nursing from an unskilled occupation to a respected profession. The program included classroom instruction in anatomy, physiology, hygiene, and disease, combined with supervised practical experience. Graduates of the school became known for their high standards of care and professional competence. The Nightingale model influenced nursing education around the world. Schools based on her principles were established in America, Europe, and elsewhere, creating a global profession of trained nurses.' },
        {
          type: 'tekst',
          inhoud: { en: 'Florence also wrote extensively about hospital design. She believed that the physical environment affected patient outcomes. She advocated for hospitals with good ventilation, natural light, adequate space between beds to prevent disease transmission, and organized systems for managing patients. Her ideas about hospital design were revolutionary and influenced how hospitals were built for decades. She also worked on public health issues, investigating the conditions in which poor people lived and advocating for reforms that would improve sanitation and reduce disease.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'A Life Dedicated to Reform' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'After the Crimean War, Florence lived a relatively private life, but she remained intensely active in her work. She suffered from a chronic illness that limited her ability to leave her home, but this did not slow her productivity. She wrote reports, advised government officials, corresponded with leaders in the field of nursing and public health, and continued to gather and analyze data about healthcare outcomes. She was a prolific author, and her writings were widely read and influential. Her book "Notes on Nursing" became a classic text that shaped how care is understood and provided.' },
        {
          type: 'tekst',
          inhoud: { en: 'Florence was also unusual for her time in her advocacy for women\'s rights and independence. She believed that women should have the opportunity to pursue meaningful work and to achieve recognition for their accomplishments. She herself had defied conventional expectations to pursue her calling, and she used her influence to open doors for other women in nursing and healthcare. She served as a role model and inspiration for generations of women who wanted to build careers in service to others.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'An Evolving World' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'As Florence Nightingale aged, she saw the world changing in ways that validated her work and vision. Germ theory, which had been emerging during her time in the Crimea, became established scientific knowledge. The understanding of how disease spreads through contamination and poor sanitation became widely accepted. The improvements she had advocated—better sanitation, cleaner conditions, organized waste disposal—became standard practice in hospitals and public health. The profession of nursing, which she had helped to establish and elevate, became increasingly respected and professionalized.' },
        {
          type: 'tekst',
          inhoud: { en: 'Florence Nightingale died on August 13, 1910, at the age of ninety. She had lived a long life, seeing tremendous changes in healthcare and society. Many of the conditions she had fought to improve—poor sanitation, lack of professional nursing care, absence of systematic record-keeping in hospitals—had been significantly addressed. Her influence extended far beyond her own time, as her principles and methods continued to guide healthcare practice for generations.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'Data, Compassion, and Care' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Florence Nightingale\'s legacy is extraordinary in its breadth and depth. She revolutionized nursing, transforming it from an unskilled, disreputable occupation into a respected profession. She demonstrated the power of data and systematic analysis in healthcare, pioneering the use of statistics to improve patient outcomes. She showed that the physical environment—cleanliness, ventilation, light, space—directly affects health and recovery. She proved that one person, armed with determination and knowledge, could change systems and improve the lives of thousands of people.' },
        {
          type: 'tekst',
          inhoud: { en: 'What makes Florence Nightingale\'s story particularly inspiring is that she overcame tremendous obstacles to pursue her vision. She defied her family, challenged social conventions, and persisted in her goals despite opposition. She combined practical compassion for individual patients with systematic thinking about how to improve healthcare systems more broadly. She used data to support her arguments and convince skeptics that her reforms were necessary and effective. She established institutions and practices that outlasted her and influenced how healthcare is understood and provided to this day. Florence Nightingale showed that caring for others and pursuing systematic improvement are not contradictory goals—they reinforce each other. Her life reminds us that meaningful change requires both heart and mind, both compassion and analysis.' }
        }
      ]
    }
  ]
};

export const thomas: Verhaal = {
  id: 'thomas-edison',
  titel: { en: 'Thomas Edison' },
  ondertitel: { en: 'The Inventor Who Lit Up the World' },
  teaser: { en: 'With over a thousand patents, he transformed daily life through practical innovation and relentless experimentation.' },
  jaar: 1931,
  periodeLabel: '1847 - 1931',
  soort: 'persoon',
  portretKleur: '#6B5B4A',
  uitgelicht: false,
  volgorde: 3,
  tijdperkId: 'industriele-revolutie',
  themas: ['uitvinding', 'elektriciteit', 'licht', 'Amerika', 'innovatie'],
  leestijdMinuten: 47,
  personage: { naam: 'Thomas Edison' },
  chapters: [
    {
      id: 1,
      titel: { en: 'The Boy Who Experimented' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Thomas Alva Edison was born on February 11, 1847, in Milan, Ohio. His father was a jack-of-all-trades who had fled Canada for political reasons; his mother was a schoolteacher. Young Tom showed an early curiosity about how things worked. He was a curious child, always asking questions and experimenting. His formal schooling was brief—he attended school for only three months before his teacher decided he was a difficult student and his mother took him out to teach him at home. But this turned out to be fortunate. His mother\'s patient, thoughtful approach to education suited Tom\'s learning style far better than traditional schooling.' },
        {
          type: 'tekst',
          inhoud: { en: 'As a boy, Tom built a chemical laboratory in the basement of his family\'s home. He conducted experiments in chemistry and electricity, reading books and learning through trial and error. When his family moved to Michigan, the young Edison set up another laboratory on the train that ran between Detroit and Michigan. He even began printing a small newspaper on the train, the first newspaper ever printed on a moving vehicle. These early experiences showed the characteristics that would define his life: curiosity, experimentation, practical application, and entrepreneurship. He was not interested in pure theory; he wanted to build things that worked and that people could use.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'Telegraph Operator and Young Inventor' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'At age sixteen, Edison worked as a telegraph operator for Western Union. The telegraph was one of the most important communication technologies of the time, transmitting electrical signals over long distances. Working with the telegraph gave Edison an intimate knowledge of electrical systems and how they could be used to transmit information. While working as a telegraph operator, Edison made his first significant invention: an automatic repeater that allowed telegraph signals to be relayed over long distances without an operator. This invention caught the attention of other businessmen and inventors, and Edison began to consider making invention his primary occupation.' },
        {
          type: 'tekst',
          inhoud: { en: 'Edison moved to New York and then to Boston, working on telegraph systems while continuing to develop his own inventions. In 1869, he moved to New York permanently and began to establish himself as an independent inventor. He founded a company to develop and sell his electrical innovations. His work on telegraph technology led him to develop the stock ticker—a device that would print stock prices on paper tape using electrical signals. This device was highly valued on Wall Street, and it made Edison financially successful for the first time.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'Menlo Park: The Invention Factory' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'With his success from the stock ticker, Edison had the financial resources to pursue his larger vision. In 1876, he established a laboratory in Menlo Park, New Jersey. This laboratory was unlike any research facility that had existed before. Edison brought together skilled mechanics, craftsmen, and experimenters to work on his ideas. The laboratory had machinery for making metal and other materials, electrical equipment, chemical apparatus, and everything else needed to turn ideas into working prototypes. Edison called it his "invention factory," and it was designed to produce innovations systematically, almost like a manufacturing plant produces goods.' },
        {
          type: 'tekst',
          inhoud: { en: 'At Menlo Park, Edison and his team developed several important innovations in rapid succession. In 1877, he invented the phonograph—a device that could record sound on a tin foil cylinder and play it back. It was the first device ever able to capture and reproduce human voice and music. The achievement astounded the world. Edison became a celebrity, and the phonograph made him wealthy. But Edison was already focused on his next project: creating a practical, long-lasting electric light bulb.' },
        {
          type: 'tekst',
          inhoud: { en: 'The challenge of the light bulb was not inventing the basic principle—scientists already understood that passing electric current through a wire could produce light. The challenge was finding a material that would glow bright enough to be useful, last long enough to be practical, and operate in a way that could be controlled. Edison attacked this problem systematically. He tested hundreds of different materials as filaments. He designed experiments carefully, kept detailed records, and analyzed results. His approach combined scientific knowledge with practical problem-solving and stubborn determination.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'Let There Be Light' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'On October 21, 1879, after months of experimentation, Edison tested a light bulb with a carbonized cotton filament. The bulb burned continuously for over thirteen hours—far longer than any previous attempt. Edison continued to refine the design. He tested different filaments and discovered that carbonized bamboo could last much longer than cotton. By 1880, Edison had developed a practical light bulb that could burn for over 1,200 hours. Most importantly, he had done more than invent a light bulb; he had created a complete electrical system to support it.' },
        {
          type: 'tekst',
          inhoud: { en: 'Edison understood that a light bulb was useless without an electrical system to power it. He designed and built the first electrical distribution system in New York City, complete with generators to produce electricity, wiring to distribute it, and safety systems to prevent overloads and fires. On September 4, 1882, Edison\'s Pearl Street Station began supplying electrical power to buildings in lower Manhattan. Electric lights began to illuminate homes, streets, and businesses. The era of electric lighting had begun.' },
        {
          type: 'citaat',
          tekst: { en: 'Genius is one percent inspiration and ninety-nine percent perspiration.' },
          bron: { en: 'Thomas Edison' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Competition and Innovation' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Edison\'s success with electric light did not go unchallenged. Other inventors and companies were working on electrical systems and lighting. George Westinghouse and Nikola Tesla developed an alternating current (AC) system that competed with Edison\'s direct current (DC) system. A period of intense competition, later called the "War of Currents," ensued. Edison fought aggressively to promote his system and discredit his rivals\' approaches. While Edison was brilliant at innovation, he was also willing to use questionable tactics in business competition—including conducting public demonstrations of electrocution to show the dangers of AC current.' },
        {
          type: 'tekst',
          inhoud: { en: 'Ultimately, the AC system proved to be more practical for long-distance electrical transmission, and Westinghouse and Tesla\'s approach prevailed over Edison\'s DC system for most applications. However, this did not diminish Edison\'s accomplishments or his influence. He had pioneered the practical application of electricity to everyday life. He had developed the light bulb that made electric lighting possible. He had created the first electrical distribution system. His contributions to electrification were fundamental and lasting.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'The Prolific Inventor' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Throughout his long career, Edison patented over 1,000 inventions. Beyond the light bulb and the phonograph, he developed the electrical storage battery, improvements to telephone technology, motion picture camera, and countless other devices. Some of his inventions changed the world; others were less significant. But collectively, they demonstrated an extraordinary capacity for innovation and practical problem-solving. Edison had established a method of systematic invention that has influenced how research and development is conducted ever since.' },
        {
          type: 'tekst',
          inhoud: { en: 'Edison\'s laboratories at Menlo Park and later at West Orange, New Jersey, became models for research and development facilities. The idea of bringing together skilled people in a well-equipped facility to work systematically on solving problems and creating innovations became a standard approach in industry. Many of the largest corporations in the world maintain research laboratories based on principles that Edison pioneered.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'The Later Years' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'As Edison aged, he became something of an elder statesman of innovation and industry. He was celebrated as one of the great inventors of all time. Presidents and important people sought his counsel. Universities wanted to honor him. Yet Edison never stopped working. Well into his eighties, he continued to conduct experiments and work on new projects. He developed improved storage batteries, investigated electrical railway systems, and pursued numerous other projects.' },
        {
          type: 'tekst',
          inhoud: { en: 'Edison died on October 18, 1931, at the age of eighty-four. At his funeral, his colleague Henry Ford suggested that people turn off their electric lights for a minute in honor of Edison\'s passing. Across the United States, millions of electric lights went dark for one minute, a fitting tribute to the man who had lit up the modern world. The event symbolized how thoroughly Edison\'s inventions had transformed modern life. From the light in our homes to the power that runs our industries, Edison\'s legacy surrounds us.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'The Legacy of Practical Innovation' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Thomas Edison\'s contributions to modern civilization are difficult to overstate. He did not work alone—he built teams of talented people and fostered an environment of creativity and systematic innovation. He was not always right—some of his ideas failed, and some of his business practices were questionable. But his fundamental approach to innovation—identify a problem, systematically investigate possible solutions, conduct experiments, learn from failures, refine designs, and create practical applications—became the model for modern research and development.' },
        {
          type: 'tekst',
          inhoud: { en: 'Edison proved that innovation could be more than the work of isolated geniuses having sudden insights. It could be systematic, methodical, and organized. It could be conducted in laboratories equipped with the necessary tools and staffed with skilled people. It could be focused on practical problems and create products that people could use and that would improve their lives. This vision of innovation—practical, systematic, and focused on human benefit—is one of Edison\'s greatest legacies, perhaps even more important than his specific inventions. In an age of rapid technological change, the Edisonian approach to innovation remains relevant and valuable. Thomas Edison showed that light comes from sustained effort, systematic thinking, and the refusal to accept failure as final.' }
        }
      ]
    }
  ]
};

export const industrieleRevolutie: Verhaal[] = [james, florence, thomas];
