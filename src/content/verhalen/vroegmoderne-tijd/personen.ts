import type { Verhaal } from '@/constants/types';

export const leonardo: Verhaal = {
  id: 'leonardo-da-vinci',
  titel: { en: 'Leonardo da Vinci' },
  ondertitel: { en: 'Renaissance Master of Art, Science, and Invention' },
  teaser: { en: 'A mind that saw possibilities in everythingâ€”from a perfect smile to the mechanics of flight.' },
  jaar: 1519,
  periodeLabel: '1452 - 1519',
  soort: 'persoon',
  afbeelding: 'https://replicate.delivery/xezq/Iy2SjfTsvYWAbq5UqCResuU7KfAmmNbJvFJLslbdr8AjID4tA/tmpbae4bwms.webp',
  portretKleur: '#C9A961',
  uitgelicht: false,
  volgorde: 1,
  tijdperkId: 'vroegmoderne-tijd',
  themas: ['kunst', 'wetenschap', 'vernieuwing', 'genialiteit', 'renaissance'],
  leestijdMinuten: 47,
  personage: { naam: 'Leonardo da Vinci' },
  chapters: [
    {
      id: 1,
      titel: { en: 'The Boy from Vinci' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In the small Tuscan village of Vinci, in 1452, a boy was born who would become one of history\'s greatest minds. Leonardo da Vinci came into the world as the illegitimate son of a notary, which meant he couldn\'t attend university or follow his father\'s profession. Instead of seeing this as a limitation, young Leonardo saw it as freedom. While other boys studied Latin and philosophy from books, Leonardo studied the world around himâ€”the movement of water, the structure of plants, the way light fell across a landscape.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'His father recognized his son\'s talent and, around age fourteen, arranged for Leonardo to apprentice with Andrea del Verrocchio, one of Florence\'s finest artists. Verrocchio\'s workshop was a place of constant creationâ€”painters, sculptors, and engineers worked side by side, learning from each other. Here, Leonardo would master the fundamentals of art: how to mix colors, carve marble, and understand human anatomy. But more importantly, he learned that art and science were not separate pursuitsâ€”they were two ways of understanding the same universe.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'The Florentine Years' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'By his early twenties, Leonardo was one of Florence\'s most promising artists. He painted altarpieces, designed armor, and created intricate drawings of imaginary weapons. But he was never content with just one thing. While working as an artist, he was also observing human anatomy by studying corpses, drawing detailed sketches of muscles and bones that wouldn\'t be seen again in scientific drawings for centuries. He filled notebooks with observations about optics, engineering, and the natural world.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Around 1482, Leonardo decided to leave Florence for Milan, where the powerful Duke Ludovico Sforza ruled. Leonardo wrote the Duke a letter offering his servicesâ€”not primarily as an artist, but as an engineer and weapons designer. He knew that princes valued military innovation and architectural knowledge. Once in Milan, Leonardo found exactly what he wanted: a patron wealthy enough to support his endless curiosities, and a city full of projects where art and engineering could merge.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'Masterpieces and Mysteries' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In Milan, Leonardo created some of his most famous works. He painted "The Last Supper" on the wall of the monastery of Santa Maria delle Grazieâ€”not a simple religious scene, but a moment frozen in time, with each apostle reacting differently to Jesus\'s announcement of betrayal. He sketched flying machines that wouldn\'t actually fly until four hundred years later. He designed canals, bridges, and cities that were centuries ahead of their time. His notebooks from these years contain thousands of observations written in his distinctive mirror scriptâ€”backwards writing that only he could easily read.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Yet for all his productivity, Leonardo was also a perfectionist who struggled to finish things. He would work on the same painting for years, never quite satisfied. He took commissions he never completed. He started projects with enthusiasm and abandoned them when new ideas captured his attention. This was both his genius and his curseâ€”his mind was always reaching for the next discovery, the next possibility, the next connection between seemingly unrelated things.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'The Scientist-Artist' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'What made Leonardo unique was his refusal to accept any boundary between art and science. When he wanted to paint the human body accurately, he dissected corpsesâ€”a controversial and dangerous practiceâ€”to understand the placement of muscles and organs. When he wanted to paint water correctly, he studied its flow patterns for years. His anatomical drawings were so precise and detailed that modern surgeons have studied them with admiration. He drew the human heart and understood its function centuries before medical science could confirm it.' },
        },
        {
          type: 'citaat',
          tekst: { en: 'Whoever loves practice without theory is like a sailor steering without rudder and compass.' },
          bron: { en: 'Leonardo da Vinci' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Dreams of Flight' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Among all of Leonardo\'s obsessions, one captured his imagination like no other: human flight. He watched birds for hours, sketching their wing movements and theorizing about air currents. He filled page after page with designs for flying machinesâ€”some with wings like a bat, others like a bird, still others like nothing nature had ever created. He designed a massive mechanical device he called the "ornithopter" that he believed a man could operate to soar through the air. He thought about parachutes and helicopters centuries before they existed.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Though Leonardo never flew himself, his vision wasn\'t mere fantasy. It was based on careful observation and logical thinking. When aviation finally became reality, engineers looked back at his designs and found principles that actually worked. His dream of human flight was a dream of understanding nature so completely that humans could do what only birds could doâ€”an ambitious goal that showed the extraordinary scope of his ambitions.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'Restless Genius' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'As Leonardo grew older, he remained restless. When Milan fell to French forces, he left the city he had called home for nearly two decades. He returned to Florence, where he painted the "Mona Lisa"â€”the portrait that would become the most famous painting in the world, famous partly for the mysterious quality of the woman\'s smile, achieved through Leonardo\'s perfect understanding of how light and shadow could convey emotion.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'He worked for the Duke of Rome, conducted military engineering projects, and continued his endless investigations into nature. He designed cities with advanced sanitation systems. He studied geology and fossils, trying to understand the history of the earth. He examined the flow of water and the structure of spirals in nature. At sixty, most people might retire, but Leonardo\'s curiosity showed no signs of slowing down.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'The Final Years' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1516, King Francis I of France invited Leonardo to come to his court. By then Leonardo was an old man, living in a time that had moved beyond him in some ways, yet remained forever ahead of him in imagination. He brought his notebooks with him, thousands of pages filled with observations, sketches, and ideas. At the French court, he was treated with respect as a sage and artist, though his body was failing. He spent his time refining his drawings, explaining his ideas to anyone who would listen, and continuing to dream.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Leonardo da Vinci died on May 2, 1519, at the age of sixty-seven. He left behind fewer than twenty completed paintings, but thousands of notebook pages that showed a mind operating on a level most people had never imagined. He left behind flying machines that would inspire engineers centuries later, anatomical drawings that advanced medical science, and the idea that human knowledge wasn\'t divided into separate boxes but was one vast, interconnected exploration of the universe.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'A Legacy of Wonder' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'What made Leonardo truly great wasn\'t that he mastered any single fieldâ€”he didn\'t really. He left numerous projects unfinished and many of his ideas remained only sketches. What made him great was his conviction that everything in the universe was worth understanding. A military engineer could be an artist. An artist could be a scientist. A scientist could be a visionary. He refused to accept that human knowledge had limits or boundaries.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'When we look at Leonardo today, more than five hundred years after his death, we see a man who truly represented the Renaissance idealâ€”not someone who knew everything, but someone who believed everything was worth learning. His paintings moved people because they showed his understanding of human emotion. His inventions worked (when built by others) because they were based on careful observation. His sketches continue to inspire because they show a mind that saw possibility everywhere. Leonardo da Vinci stands as a reminder that the most creative human minds are those that refuse to be confined to a single discipline.' }
        }
      ]
    }
  ]
};

export const galileo: Verhaal = {
  id: 'galileo-galilei',
  titel: { en: 'Galileo Galilei' },
  ondertitel: { en: 'The Stargazer Who Changed Science' },
  teaser: { en: 'When Galileo looked through his telescope, he didn\'t just see the starsâ€”he saw a universe that contradicted everything people believed.' },
  jaar: 1642,
  periodeLabel: '1564 - 1642',
  soort: 'persoon',
  afbeelding: 'https://replicate.delivery/xezq/gkwzw6gxyUJsKxl1SMLeRESRwn8owqo8W6kE2lI3L7FW5AeWA/tmptfswg309.webp',
  portretKleur: '#8B7355',
  uitgelicht: false,
  volgorde: 2,
  tijdperkId: 'vroegmoderne-tijd',
  themas: ['wetenschap', 'astronomie', 'vernieuwing', 'kerk', 'waarheid'],
  leestijdMinuten: 46,
  personage: { naam: 'Galileo Galilei' },
  chapters: [
    {
      id: 1,
      titel: { en: 'The Young Mathematician' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1564, the same year William Shakespeare was born, another child entered the world who would reshape human understandingâ€”Galileo Galilei, born in Pisa, Italy. His father was a merchant and musician, a man of talent but modest means. Galileo\'s early life wasn\'t marked by extraordinary advantage, but rather by an extraordinary mind. As a student, he was curious about everythingâ€”how things moved, why pendulums swung at constant rhythms, how the natural world actually worked rather than how ancient authorities said it should work.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'At the University of Pisa, Galileo was supposed to study medicine, but mathematics and physics captured his imagination instead. He showed a talent for mathematics that impressed his teachers, and eventually he became a professor of mathematics. But Galileo wasn\'t content to simply teach the mathematics that had been accepted for centuries. He wanted to verify it, test it, and improve it. He believed that nature could be understood through careful observation and mathematics, not just through ancient texts and logical debate.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'Challenging the Ancient Authorities' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In Galileo\'s time, scientific knowledge rested on the authority of ancient philosophers, especially Aristotle, who had lived over two thousand years earlier. Aristotle had taught that heavier objects fall faster than lighter ones. This seemed logicalâ€”if you dropped a cannonball and a feather, the cannonball hit the ground first. But Galileo questioned this assumption. He realized that the feather fell slowly because of air resistance, not because it was inherently slower. If you could eliminate air resistance, he theorized, both objects would fall at the same speed.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Whether or not Galileo actually dropped objects from the Leaning Tower of Pisa (the famous story may be exaggerated), he certainly conducted experiments and mathematical calculations that proved Aristotle wrong. This was revolutionary. For centuries, scholars had accepted that if Aristotle said something, it must be true. Galileo demonstrated that the way to find truth wasn\'t to defer to ancient authorities but to observe nature directly and test ideas systematically. This approachâ€”what we now call the scientific methodâ€”would change human knowledge forever.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'The Telescope Arrives' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1609, when Galileo was forty-five years old, he heard rumors of a new invention coming from the Netherlandsâ€”a "spyglass" or telescope that could make distant objects appear close. Within weeks, Galileo had constructed his own telescope using his understanding of lenses and optics. His version was crude by modern standards but powerful for its time, magnifying objects about thirty times their actual size. He realized immediately what this meant: he could see the heavens in detail never before possible.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'That winter, Galileo pointed his telescope at the sky and began a revolution. He saw that the Moon wasn\'t a perfect, smooth sphere as scholars believedâ€”it had mountains and valleys, craters and shadows, just like Earth. He saw that Jupiter wasn\'t alone in the skyâ€”it had moons orbiting it, small bodies dancing around the giant planet. He saw that Venus went through phases, like the Moon, which was impossible if the Earth was the center of the universe. For the first time, a human being was seeing the cosmos with unprecedented clarity, and what he saw contradicted everything the authorities had taught.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'Supporting the Sun' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'For over a thousand years, the Christian Church and almost all European scholars had accepted that Earth was the center of the universe. The Sun, Moon, and stars all orbited around us. It made intuitive senseâ€”the Earth felt still and solid, and the heavens seemed to move around us. But in the 1500s, a Polish astronomer named Copernicus had proposed something radical: what if the Earth orbited the Sun instead? What if we were not the center of everything?' },
        },
        {
          type: 'citaat',
          tekst: { en: 'I do not feel obliged to believe that the same God who has endowed us with sense, reason, and intellect has intended us to forgo their use.' },
          bron: { en: 'Galileo Galilei' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Conflict with Authority' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Galileo\'s telescope observations supported Copernicus\'s ideas. If the Earth were the center, Venus shouldn\'t show phases as it orbited the Sun. If the Earth were the center, Jupiter\'s moons shouldn\'t orbit Jupiterâ€”they should orbit Earth. Galileo published his findings in 1610 in a book called "The Starry Messenger," which made him famous but also put him in danger. The Church considered the Copernican theory hereticalâ€”contrary to Scripture and to the teaching of the Church Fathers.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'In 1616, Pope Paul V called Galileo to Rome and warned him not to support the Copernican theory. Galileo compliedâ€”for a while. He continued his scientific work but tried to avoid the theological controversy. However, his personality made silence difficult. He was brilliant, confident, and not inclined to hide his views. In 1632, he published another book, "Dialogue Concerning the Two Chief World Systems," which, despite its careful writing, clearly favored the heliocentric system. The Church saw this as defiance.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'The Trial' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1633, Galileo, now almost seventy years old, was brought before the Inquisitionâ€”the Church\'s court for matters of heresy. He was ordered to renounce his support for heliocentrism. The trial was difficult, and Galileo was afraid. He had seen what happened to those who defied the Church. Under pressure, he agreed to deny that the Earth moved around the Sun. According to legend, as he left the trial, he muttered under his breath: "And yet it moves"â€”meaning the Earth does indeed move, regardless of what he was forced to say.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Galileo was sentenced to house arrest in his home in Arcetri, near Florence. He was forbidden to talk about heliocentrism, forbidden to publish, forbidden to receive visitors without permission. For a man who had spent his life investigating, experimenting, and teaching, it was a kind of living death. Yet even in prison, Galileo continued to think and write. He was working on his greatest scientific work, the "Discourses and Mathematical Demonstrations Relating to Two New Sciences," which laid the foundation for modern physics.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'A Life of Discovery' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Galileo spent his final years under house arrest, but his mind remained free. He had made discoveries in so many fieldsâ€”motion, gravity, astronomy, mathematics. He understood that falling objects accelerate at a constant rate, a principle that would later be refined into Newton\'s laws of motion. He studied the behavior of projectiles and pendulums. He improved his telescopes and made new observations. Visitors who were allowed to see him reported that his mind remained sharp, his curiosity undiminished, even as his body grew frail.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Galileo died on January 8, 1642, at the age of seventy-seven. He was buried quietly, almost as if the Church wanted to minimize attention to his final resting place. Yet his work had already spread throughout Europe. Scientists and mathematicians built upon his discoveries. His commitment to observation and experiment over blind authority became the foundation of modern science. The telescope he had pointed at the sky had revealed not just new celestial objects but a new way of knowing.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'The Revolutionary Who Changed Everything' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Galileo\'s conflict with the Church was not simply about astronomy. It was about a fundamental question: How do we know what is true? For centuries, the answer had been: through ancient authorities, through logic, through Scripture. Galileo argued for something different: through observation, through experiment, through direct evidence from nature itself. This ideaâ€”that nature is the ultimate authority, not ancient texts or powerful institutionsâ€”became the foundation of modern science.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Today, we live in a world shaped by the scientific revolution that Galileo helped create. Every technology, every medical treatment, every understanding of how the universe works has roots in the idea that Galileo championedâ€”that we can understand nature by carefully observing it and testing our ideas against reality. The remarkable thing is that he maintained this belief even when powerful forces tried to force him to abandon it. Galileo\'s life reminds us that the pursuit of truth sometimes requires courage, and that one person\'s determination to see clearly can change the world.' }
        }
      ]
    }
  ]
};

export const catherine: Verhaal = {
  id: 'catherine-the-great',
  titel: { en: 'Catherine the Great' },
  ondertitel: { en: 'The Empress Who Transformed Russia' },
  teaser: { en: 'Born a princess in a small German state, she became ruler of the vast Russian Empire through intelligence, determination, and one of history\'s boldest power grabs.' },
  jaar: 1796,
  periodeLabel: '1729 - 1796',
  soort: 'persoon',
  afbeelding: 'https://replicate.delivery/xezq/2vHjjlc8yILuOJZd348my70GWjA5eQZYlNq4hq4kkRz05AeWA/tmpnmjhuqu7.webp',
  portretKleur: '#9B6B4F',
  uitgelicht: false,
  volgorde: 3,
  tijdperkId: 'vroegmoderne-tijd',
  themas: ['macht', 'rusland', 'vrouwen', 'bestuur', 'expansie'],
  leestijdMinuten: 48,
  personage: { naam: 'Catherine the Great' },
  chapters: [
    {
      id: 1,
      titel: { en: 'A Princess from Prussia' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In the year 1729, in the small German principality of Anhalt-Zerbst, a girl was born who would one day rule the largest empire in Europe. She was named Sophie Augusta Frederica, but the world would know her as Catherine the Great. She wasn\'t born to the Russian throneâ€”in fact, she wasn\'t born Russian at all. She was the daughter of a minor German prince, growing up in a modest household without great wealth or exceptional status. Yet from her earliest years, Sophie showed a mind that reached beyond the narrow world she had been born into.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'As a child, Sophie was clever, ambitious, and restless. She taught herself languages and studied history and politics. She read Enlightenment philosophers who were challenging old ways of thinking across Europe. She dreamed of a larger life than what a minor German principality could offer. When she was fourteen, her dream suddenly became real. She received a proposal of marriage from Peter, the grandson of Peter the Great and the heir to the Russian throne. She was to become the future Empress of Russia.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'A Difficult Marriage' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1745, Sophie married Peter in St. Petersburg and took a new nameâ€”Catherine. She became the wife of the heir to the Russian throne, but her new position was far from a fairy tale. Peter was immature and irresponsible, more interested in military drills and playing with toy soldiers than in the serious business of governing. Catherine quickly realized that her husband would not be a strong leader. Meanwhile, she worked tirelessly to make herself essential. She learned Russian fluently, studied Russian history and Orthodox Christianity, and made herself beloved by the court and the military.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'For years, Catherine played the role of the dutiful wife while building her own power base. She bore a son, Paul, securing the succession. She became close to the most powerful people at court. She understood that patience and strategy would serve her better than direct confrontation. As she watched her husband remain weak and irresponsible, Catherine prepared herself mentally for the possibility that she might need to take power herself. She wasn\'t content to be merely a queenâ€”she wanted to be a great ruler.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'Seizing Power' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'In 1762, when Catherine\'s husband became Tsar Peter III, his incompetence became immediately apparent. He made decisions that angered the military and the nobility. He alienated the Church. He showed favoritism to people no one respected. After just six months on the throne, Peter had managed to make enemies of almost everyone who mattered. Catherine sensed her moment. With the support of the military, the nobility, and the Church, she organized what was essentially a coup d\'Ã©tat. She left the city with a military officer named Grigory Orlov, and together they raised an army loyal to her.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Peter, faced with a force he couldn\'t resist, was forced to abdicate. Catherine, now just thirty-three years old, became the Tsarina and Autocrat of All the Russias. What she had accomplished was almost without precedentâ€”a woman, not born Russian, had seized the throne of the largest empire in the world. In a time when women had almost no power, Catherine had seized the ultimate power. She would keep that power for thirty-four years.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'A Modern Empress' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Catherine understood that to maintain power, she needed to be more than just a competent rulerâ€”she needed to be seen as a legitimate one. She surrounded herself with able advisors and ministers. She made careful reformsâ€”not radical changes that would upset the nobility, but improvements that proved she could govern effectively. She improved the legal system, strengthened the administration, and encouraged education and culture. She brought the ideas of the Enlightenment, which she had read and admired, into Russian policy.' },
        },
        {
          type: 'citaat',
          tekst: { en: 'I have a passion for Russia, and I am convinced that I shall succeed in rendering her a great country.' },
          bron: { en: 'Catherine the Great' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Expansion and War' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Catherine believed that Russia\'s greatness lay in its territory and influence. During her reign, she pursued an aggressive foreign policy that expanded Russian power considerably. She fought wars against the Ottoman Empire, the kingdom that controlled the southern territories Russia wanted to reach. Through these wars, Russia gained access to the Black Sea, opening new trade routes and increasing Russian influence in Europe. She also expanded Russian territory eastward and gained control of lands that had been contested by various powers.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Catherine also orchestrated the partition of Poland, working with the rulers of Prussia and Austria to divide that kingdom among themselves. This was one of the most controversial acts of her reign, but it reflected the political realities of the timeâ€”weaker nations were absorbed by stronger ones. By the end of Catherine\'s reign, Russia was significantly larger and more powerful than when she had taken the throne. She had made Russia a major European power, respected and feared by other nations.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'Patron of Culture' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'While Catherine was building Russian military and political power, she was also building Russian culture. She was a patron of the arts, bringing famous architects, musicians, and artists to her court. She supported writers and philosophers. She built libraries and established schools. She wanted Russia to be seen not just as a military power but as a center of civilization and learning. The Winter Palace in St. Petersburg became one of the most magnificent palaces in the world, filled with art and architecture that reflected Catherine\'s refined taste.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Catherine herself was remarkably educated and cultured. She corresponded with famous philosophers like Voltaire and Diderot. She read voraciously and understood the intellectual movements transforming Europe. She wanted to share this learning with Russia. She founded schools and academies. She encouraged the study of science and literature. In many ways, Catherine was trying to bring the Enlightenment to Russia, to make her empire not just powerful but also modern and sophisticated.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'The Costs of Power' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Catherine\'s achievements came at a cost. The expansionist wars required massive expenditures. The military grew and became ever more powerful. To pay for all this, Catherine relied heavily on the nobility and the wealth that came from serfdomâ€”a system in which peasants were essentially enslaved to landowners. Though Catherine considered herself an Enlightenment ruler, she actually strengthened serfdom during her reign. This contradictionâ€”a ruler who admired progressive ideas but maintained feudal systemsâ€”was one of the great paradoxes of her rule.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Catherine also faced rebellions and discontent. A massive peasant rebellion led by Cossack leader Emelian Pugachev shook her rule in the 1770s. Though she defeated it, the rebellion reminded her that not everyone was happy with her government. As she grew older, Catherine became more conservative, more concerned with maintaining stability than with progressive reforms. By her final years, she was seen by some as having abandoned the Enlightenment ideals she had once championed.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'A Life of Ambition' },
      blokken: [
        {
          type: 'tekst',
          inhoud: { en: 'Catherine the Great died in 1796 at the age of sixty-seven. She had ruled Russia for thirty-four years, longer than most monarchs. She had expanded the empire, reformed the government, encouraged culture, and established Russia as a major European power. She had done something that seemed nearly impossibleâ€”a woman without a strong hereditary claim to the throne had seized power and kept it for decades. She had proven that intelligence, determination, and political skill could matter more than the circumstances of your birth.' },
      },
        {
          type: 'tekst',
          inhoud: { en: 'Catherine remains one of history\'s most remarkable rulers precisely because she understood that power isn\'t just about military strength or inherited position. It\'s about making people believe you deserve to rule, about creating alliances, about presenting yourself as a capable leader. She was shrewd, ambitious, and willing to do what was necessary to maintain her authority. She made mistakesâ€”her handling of serfdom being perhaps the most significantâ€”but she fundamentally transformed Russia from a secondary power into a major player on the world stage. The woman born as a minor princess in Prussia had become one of the most powerful rulers in European history.' }
        }
      ]
    }
  ]
};

export const vroegmoderneTijd: Verhaal[] = [leonardo, galileo, catherine];

