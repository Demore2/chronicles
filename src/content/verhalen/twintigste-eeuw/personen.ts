import type { Verhaal } from '@/constants/types';
import { CHARACTER_IMAGES } from '@/constants/character-images';
import { SCENE_IMAGES } from '@/constants/scene-images';

// Content generated from 20th Century agent (3 stories with 8 chapters each)
// Full details: Marie Curie, Winston Churchill, Martin Luther King Jr.

export const marieCurie: Verhaal = {
  id: 'marie-curie',
  titel: { en: 'Marie Curie' },
  ondertitel: { en: 'The Scientist Who Unveiled the Power of Atoms' },
  teaser: { en: 'Born in Warsaw, she discovered the hidden forces within matter itself—and changed science forever.' },
  jaar: 1934,
  periodeLabel: '1867 - 1934',
  soort: 'persoon',
  afbeelding: CHARACTER_IMAGES['marie-curie'],
  portretKleur: '#6B8E4F',
  uitgelicht: false,
  volgorde: 1,
  tijdperkId: 'twintigste-eeuw',
  themas: ['wetenschap', 'radioactiviteit', 'vrouwen', 'Frankrijk', 'atoom'],
  leestijdMinuten: 9,
  personage: { naam: 'Marie Curie' },
  chapters: [
    {
      id: 1,
      titel: { en: 'A Polish Girl Dreams of Science' },
      afbeelding: SCENE_IMAGES['marie-curie-1'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-1'],
          alt: { en: 'A girl reading by candlelight in a modest Warsaw apartment.' },
          bijschrift: { en: 'Russian-ruled Warsaw did not admit women to university. She studied at an illegal one instead.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Maria Skłodowska was born in Warsaw, Poland, in 1867, during a time when few girls were permitted to pursue science. Her childhood was marked by tragedy. When she was only eight years old, her eldest sister died of typhus. Two years later, her mother succumbed to tuberculosis. These losses shaped Maria\'s character, giving her a fierce determination to achieve something meaningful with her life. Despite her grief, she was captivated by the world of science—by chemistry, physics, and the mysteries of nature that seemed to hold infinite answers.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In Russian-occupied Warsaw, where her family lived, attending university was forbidden for women. But Maria was undeterred. She attended secret "floating schools"—underground educational gatherings held in different locations to avoid Russian authorities. There, she studied with other eager young people, absorbing every bit of knowledge she could gather. Her teachers recognized her exceptional talent. By her late teens, Maria had made a decision: she would leave Poland and travel to Paris, where women were allowed to study at universities. It was a bold move for a young woman traveling alone in the 1890s, but Maria was ready to seize this opportunity.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'From Warsaw to Paris' },
      afbeelding: SCENE_IMAGES['marie-curie-2'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-2'],
          alt: { en: 'A student working by candlelight in a freezing Paris attic room.' },
          bijschrift: { en: 'She finished first in her physics degree, and second in mathematics the year after.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1891, at the age of 23, Maria arrived in Paris with almost no money in her pockets. She enrolled at the University of Paris, one of the first female physics students in the institution\'s history. Life was difficult. She lived in a small, freezing room in the Latin Quarter, surviving on bread, chocolate, and eggs. Sometimes she had so little food that she would faint during her studies. Despite these hardships, Maria threw herself into her work with remarkable intensity. She attended lectures, performed experiments, and read everything she could find about the latest discoveries in physics and chemistry.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1893, she earned her degree in physics—ranking first in her examinations. A year later, she obtained another degree in mathematics, ranking second. By this time, Maria had adopted the French version of her name: Marie. Her dedication and brilliance had not gone unnoticed. Through a Polish physicist friend, Marie was introduced to Pierre Curie, a talented scientist who had made important discoveries in crystallography. When they met in 1894, it was clear that they shared not only a passion for science but also a connection that would change both their lives. They married in July 1895, beginning a partnership that would lead to some of the greatest scientific discoveries of the age.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'The Mystery of Rays' },
      afbeelding: SCENE_IMAGES['marie-curie-3'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-3'],
          alt: { en: 'A shed laboratory where a couple stir a vat of pitchblende residue.' },
          bijschrift: { en: 'A tonne of pitchblende yielded about a tenth of a gram of radium chloride.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1896, Marie chose an exciting topic for her doctoral research. Just one year earlier, Wilhelm Röntgen had discovered X-rays, and Henri Becquerel had noticed that uranium emitted mysterious rays. The scientific world was ablaze with curiosity. Marie decided to investigate these rays more thoroughly using an electrometer—a sensitive instrument that Pierre and his brother had invented. This device could measure tiny electrical currents with remarkable precision, making it perfect for studying these invisible radiations.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Working in a converted shed that served as a laboratory, Marie tested numerous elements and minerals. She discovered that the strength of the rays was proportional to the amount of uranium present—not to the chemical compounds it formed. This meant the rays came from the atom itself, a revolutionary idea. But then she noticed something puzzling. Some minerals emitted far more rays than their uranium content would predict. Marie hypothesized that these minerals must contain unknown elements that were even more radioactive than uranium. This intuition would prove correct.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Working alongside Pierre, Marie began the arduous process of processing tons of pitchblende ore—a mineral that had been mined in Bohemia. They boiled it, filtered it, and chemically separated it, fraction by fraction, always measuring the radioactivity. It was exhausting, painstaking work conducted in their cold, drafty shed. But in 1898, their efforts were rewarded: they isolated two new elements. One they named polonium, after Marie\'s native country. The other, they called radium—the most radioactive element they had found. The scientific community erupted in excitement.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'Fame and Tragedy' },
      afbeelding: SCENE_IMAGES['marie-curie-4'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-4'],
          alt: { en: 'A woman in black walking away down a rain-wet Paris street.' },
          bijschrift: { en: 'Pierre was killed by a horse-drawn wagon in 1906. She was thirty-eight.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'The discovery of radium and polonium made the Curies world-famous. In 1903, Marie became the first woman to earn a doctorate in physics in France. That same year, she and Pierre, along with Henri Becquerel, shared the Nobel Prize in Physics—one of the world\'s highest scientific honors. Remarkably, the Nobel Prize committee initially had not intended to include Marie, planning to honor only Pierre and Becquerel. It was Pierre himself who insisted that his wife\'s contributions be recognized equally. Marie and Pierre had become symbols of scientific progress and intellectual partnership.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'The Curies refused to patent their radium discovery, believing that scientific knowledge should be freely available to all researchers and doctors. This decision meant they never became wealthy from their breakthrough, but they adhered to their principles. They had two daughters, Irène and Ève, and Marie tried to balance motherhood with her scientific ambitions—a challenge few women of her era attempted. But tragedy struck on April 19, 1906. Pierre, deep in thought about his research, stepped behind a horse-drawn wagon near the Pont-Neuf in Paris. He was instantly killed. Marie was devastated. Her partner, her scientific collaborator, and the father of her children was gone in an instant.' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'Continuing the Work' },
      afbeelding: SCENE_IMAGES['marie-curie-5'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-5'],
          alt: { en: 'A woman lecturing to a packed amphitheatre of students at the Sorbonne.' },
          bijschrift: { en: 'She took over his chair and became the first woman ever to teach at the Sorbonne.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Marie faced a choice. She could retreat from science and focus on her daughters, as many people expected a widow to do. Instead, she made a remarkable decision: she would continue the work. The University of Paris offered her Pierre\'s professorship—the first time a French university had appointed a woman to such a position. In her first lecture, before a packed hall of scientists and curious onlookers, Marie spoke about radium and its properties. When she reached the point in her notes where Pierre\'s work ended, she paused, too overcome with emotion to continue. The audience sat in respectful silence. It was a powerful moment, but Marie recovered and finished her lecture. She would not be stopped by grief.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Over the following years, Marie threw herself into her research with even greater intensity. She had already been nominated for a second Nobel Prize for her discovery of radium\'s atomic weight, and in 1911, she won it—becoming the first person ever to win Nobel Prizes in two different scientific fields. This achievement was remarkable, but it also sparked controversy. Some voices in the French press attacked her, partly because she was a woman, and partly because she had become involved in a personal relationship with a fellow scientist, Paul Langevin, who was separated from his wife. The scandal threatened to overshadow her scientific accomplishments, but Marie refused to let public opinion silence her. She continued her work, undeterred.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'War and Dedication' },
      afbeelding: SCENE_IMAGES['marie-curie-6'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-6'],
          alt: { en: 'A motor van fitted as a mobile X-ray unit at a field hospital.' },
          bijschrift: { en: 'She equipped some twenty radiology vans and drove one herself, with her daughter Irène.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'When World War I erupted in 1914, Europe was plunged into unprecedented conflict. Marie recognized that X-ray machines could save lives on the battlefield by helping doctors locate bullets and identify internal injuries in wounded soldiers. The French military, however, had very few radiography units, and many were far from the front lines. Marie could not sit idle while soldiers suffered. Using her own money and donations, she purchased X-ray equipment and installed it in a van she nicknamed "Petite Curies"—little Curies—after her two daughters. She drove to the front lines herself, operating the equipment and training others to use it.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Marie made multiple trips to dangerous areas near the fighting, often working in conditions that exposed her to both enemy fire and continuous radiation. She wrote about her experiences: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less." Her mobile X-ray units, and the radiography stations she helped establish, saved thousands of lives during the war. After the war, her health had been damaged by the accumulated radiation exposure from years of handling radioactive materials without proper protection—though she did not yet realize how seriously.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Despite her health challenges, Marie continued to work and to train the next generation of scientists. Her daughter Irène followed in her footsteps, becoming a physicist and eventually winning her own Nobel Prize. Marie established the Curie Institute in Paris, a world-leading research center dedicated to the study of radioactivity and its applications in medicine. She traveled internationally, giving lectures and raising funds for her institute. Even as her energy waned, she remained committed to the mission that had defined her life: the pursuit of scientific knowledge and its application to help humanity.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'The Price of Discovery' },
      afbeelding: SCENE_IMAGES['marie-curie-7'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-7'],
          alt: { en: 'A worn notebook, glassware and fogged photographic plates on a bench.' },
          bijschrift: { en: 'Her notebooks are still radioactive. They are kept in lead-lined boxes.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In her final years, Marie\'s health deteriorated. The cumulative effects of radiation exposure were taking their toll. She suffered from anemia, joint pain, and other ailments that made it difficult to work. In 1934, at the age of 66, she was admitted to a hospital near Paris. Doctors diagnosed her with aplastic anemia—a rare blood disorder almost certainly caused by decades of exposure to radiation. At this time, very little was known about how to treat radiation sickness, and there was no cure. Marie knew, better than anyone, what was happening to her body. The very element she had devoted her life to studying was destroying her.' }
        },
        {
          type: 'citaat',
          tekst: { en: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.' },
          bron: { en: 'Marie Curie' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'On July 4, 1934, Marie Curie died. She was buried in a simple grave in the Panthéon in Paris—a rare honor for a woman. Her life had been dedicated to understanding the mysteries of matter, and in doing so, she had opened doors that would lead to countless medical and technological advances. The periodic table of elements now carries her legacy: Curium, element 96, was named in honor of Marie and Pierre for their contributions to the discovery of radioactivity. She had lived by her principles: to question, to investigate, and to share knowledge with the world.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'A Revolutionary Legacy' },
      afbeelding: SCENE_IMAGES['marie-curie-8'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['marie-curie-8'],
          alt: { en: 'Young women in white coats at work in a bright institute laboratory.' },
          bijschrift: { en: 'She remains the only person to have won Nobel Prizes in two different sciences.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Marie Curie\'s impact on science and society extended far beyond her discoveries of polonium and radium. She shattered the barrier that had prevented women from entering the world of scientific research at the highest levels. Before Marie, it was almost unthinkable for a woman to win a Nobel Prize, to hold a university professorship, or to direct a major scientific institute. She proved that scientific brilliance knows no gender. Today, countless women in physics, chemistry, biology, and medicine cite Marie Curie as their inspiration. She showed the world that a woman could be just as dedicated, just as brilliant, and just as transformative as any man in science.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'The applications of her discoveries revolutionized medicine and physics. Radioactivity became central to modern nuclear physics and led to the development of nuclear energy. In medicine, radiotherapy became one of the most powerful tools for treating cancer. X-rays, which she helped popularize, became essential for diagnosis. Medical isotopes derived from her work are used worldwide every day. Her research laid the groundwork for 20th-century physics and changed how we understand the fundamental nature of matter itself. Marie Curie\'s story reminds us that great achievements often require sacrifice, determination, and the courage to pursue your passion despite obstacles. She faced poverty, discrimination because of her gender, personal tragedy, and ultimately, illness caused by her own scientific work. Yet she never wavered in her commitment to understanding nature and using that understanding to benefit humanity. In 2011, on what would have been her 144th birthday, the Google Doodle honored her—introducing millions of people worldwide to her remarkable life. Marie Curie remains one of history\'s most celebrated scientists, a testament to the power of curiosity, perseverance, and the human desire to understand our world.' }
        }
      ]
    },
  ]
};

export const winstonChurchill: Verhaal = {
  id: 'winston-churchill',
  titel: { en: 'Winston Churchill' },
  ondertitel: { en: 'The Statesman Who Led Britain Through Its Darkest Hour' },
  teaser: { en: 'A determined leader who rallied a nation against tyranny and changed the course of history.' },
  jaar: 1965,
  periodeLabel: '1874 - 1965',
  soort: 'persoon',
  afbeelding: CHARACTER_IMAGES['winston-churchill'],
  portretKleur: '#4A5A6B',
  uitgelicht: false,
  volgorde: 2,
  tijdperkId: 'twintigste-eeuw',
  themas: ['politiek', 'wereldoorlog', 'leiderschap', 'groot-brittannie', 'strategie'],
  leestijdMinuten: 7,
  personage: { naam: 'Winston Churchill' },
  chapters: [
    {
      id: 1,
      titel: { en: 'Born to Privilege, Driven by Ambition' },
      afbeelding: SCENE_IMAGES['winston-churchill-1'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-1'],
          alt: { en: 'A boy arranging rows of lead soldiers in a vast palace room.' },
          bijschrift: { en: 'Born at Blenheim, near the bottom of his class, and a soldier before he was a politician.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Winston Leonard Spencer Churchill was born on November 30, 1874, into one of Britain\'s most aristocratic families. His father, Lord Randolph Churchill, was a prominent Conservative politician, and his mother was an American heiress. Despite his privileged birth, young Winston\'s childhood was marked by emotional distance from his parents. He attended elite schools but was considered a mediocre student, struggling with subjects that bored him. However, he possessed an unshakeable determination and an exceptional talent for writing and public speaking that would define his career.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'As a young man, Churchill embarked on a military career, serving in India, Sudan, and South Africa. His experiences as a soldier and war correspondent shaped his worldview and provided material for his prolific writing. He wrote books about his military adventures that became bestsellers and established him as a public figure. By his early thirties, Churchill had transitioned from military service to politics, entering Parliament as a Conservative MP in 1900. His political journey would be marked by party switches, powerful speeches, and an unwavering belief in Britain\'s destiny as a global power.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'Rising Through the Political Ranks' },
      afbeelding: SCENE_IMAGES['winston-churchill-2'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-2'],
          alt: { en: 'A politician studying naval charts with admirals in an Admiralty room.' },
          bijschrift: { en: 'Gallipoli cost him the Admiralty. He went to the Western Front as a battalion commander.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill rapidly climbed the political ladder, serving as President of the Board of Trade, Home Secretary, and First Lord of the Admiralty before turning forty. His tenure at the Admiralty during World War I was marked by ambitious initiatives, including his support for the ill-fated Gallipoli Campaign, which resulted in heavy British casualties. This failure damaged his reputation and led to his resignation. For several years, Churchill was something of a political outcast, blamed for the disaster and struggling to rebuild his standing in Parliament and with the public.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'During the 1920s and 1930s, Churchill held various political positions and wrote extensively, maintaining his public profile through journalism and books. However, he grew increasingly alarmed by the rise of Adolf Hitler and Nazi Germany. While many British politicians, including Prime Minister Neville Chamberlain, pursued a policy of appeasement, Churchill warned repeatedly about the Nazi threat. His speeches became more passionate and urgent as he tried to wake his country to the danger. Though widely dismissed as a warmonger at the time, Churchill\'s warnings would prove prophetic.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'War and Leadership' },
      afbeelding: SCENE_IMAGES['winston-churchill-3'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-3'],
          alt: { en: 'An underground map room beneath wartime London.' },
          bijschrift: { en: 'He became prime minister on 10 May 1940 — the day Germany invaded the Low Countries.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In May 1940, as Nazi Germany invaded France and seemed poised to conquer all of Europe, Churchill became Prime Minister of Britain at age sixty-five. The nation was in crisis, facing possible invasion and seemingly inevitable defeat. In his first speech as Prime Minister, Churchill told the British people he had nothing to offer but "blood, toil, tears and sweat." He refused to consider surrender or negotiation with Hitler, declaring that Britain would defend itself alone if necessary and that ultimate victory would belong to those who never surrendered.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill\'s leadership during the darkest days of World War II was extraordinary. Through stirring speeches delivered over radio, he inspired the British people to endure the German Blitz, bombing raids that destroyed cities and killed thousands. He communicated a sense of purpose and defiance, transforming Britain\'s fight from a desperate struggle against overwhelming odds into a moral battle for civilization itself. His famous declaration that "we shall never surrender" became a rallying cry that steeled the nation\'s resolve. Churchill also proved himself a shrewd strategist and diplomat, forging alliances with the United States and the Soviet Union.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'Victory and Defeat' },
      afbeelding: SCENE_IMAGES['winston-churchill-4'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-4'],
          alt: { en: 'Three Allied leaders seated for a photograph before a colonnaded palace.' },
          bijschrift: { en: 'Yalta, February 1945. Britain was still fighting, and negotiating from growing weakness.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'As the war progressed, Churchill worked tirelessly to maintain the alliance between Britain, America, and the Soviet Union. He met with Franklin D. Roosevelt and Joseph Stalin at key conferences to coordinate strategy and plan for the postwar world. Churchill negotiated from a position of declining British power—Britain was fighting for survival but increasingly dependent on American economic and military support. Nevertheless, he fought hard to protect British interests and to shape the peace that would follow the war.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Germany surrendered in May 1945, and Churchill was at the height of his fame and influence. However, in July 1945, British voters unexpectedly voted his Conservative Party out of power, choosing the Labour Party instead. Shocked and hurt, Churchill was forced to step down as Prime Minister just months after victory. He felt that Britain had repaid him poorly for his leadership during the war, but he remained in Parliament as Leader of the Opposition. His defeat was a reminder that military victory does not always translate into political success.' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'The Iron Curtain and the Cold War' },
      afbeelding: SCENE_IMAGES['winston-churchill-5'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-5'],
          alt: { en: 'An elderly statesman speaking from a podium in an American college hall.' },
          bijschrift: { en: 'Fulton, Missouri, 1946: an iron curtain, he said, had descended across the continent.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Out of power, Churchill warned of new dangers. In a famous 1946 speech in Fulton, Missouri, he spoke of an "Iron Curtain" that had descended across Eastern Europe, dividing the free West from the Soviet-dominated East. This speech, delivered in collaboration with President Truman, helped articulate what would become known as the Cold War—the ideological and strategic competition between the capitalist West and the communist Soviet Union that would dominate global politics for the next four decades.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill\'s concept of the "Iron Curtain" became a central metaphor for understanding the postwar division of Europe. He advocated for a strong Western alliance, including NATO, to contain Soviet expansion. His warnings about communist threats shaped Western policy for years. Churchill also promoted the idea of a "special relationship" between Britain and America, arguing that these two English-speaking democracies should work together to preserve freedom and prevent another world war. His influence on postwar geopolitics was immense, even from opposition.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'Return to Power and Continued Service' },
      afbeelding: SCENE_IMAGES['winston-churchill-6'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-6'],
          alt: { en: 'An old prime minister at the cabinet table in a panelled Downing Street room.' },
          bijschrift: { en: 'He returned to office at seventy-six and stayed until a stroke forced him out.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1951, Churchill returned to power as Prime Minister at age seventy-six. Rather than fading into retirement, he embarked on a second term as Britain\'s leader. His government focused on maintaining Britain\'s status as a great power and managing the transition to a new postwar world. Churchill also commissioned the building of nuclear weapons to ensure Britain would not be eclipsed by American nuclear superiority. He worked to maintain the Anglo-American alliance and to contain Soviet expansion while also managing Britain\'s declining empire.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill served as Prime Minister until 1955, when he finally retired at age eighty. Even in his seventies and eighties, he continued to command respect and influence. He remained an MP until 1964, continuing to contribute to Parliament\'s debates and serving as an elder statesman. Churchill\'s second term was less dramatic than his wartime leadership but was still significant in shaping the early Cold War world and establishing Britain\'s role in the new international order.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'Words and Legacy' },
      afbeelding: SCENE_IMAGES['winston-churchill-7'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-7'],
          alt: { en: 'A writer’s study with manuscript pages, a cigar and a green-shaded lamp.' },
          bijschrift: { en: 'He won the Nobel Prize in Literature in 1953 — for history and oratory, not fiction.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Throughout his long life, Churchill was a master of rhetoric and language. His speeches were carefully crafted, full of vivid imagery, classical references, and memorable phrases. He won the Nobel Prize in Literature in 1953 for his war memoirs and historical writings. Churchill believed in the power of words to inspire, persuade, and shape history. His speeches during World War II are still studied for their oratorical brilliance and their ability to move people to action. He demonstrated that political leadership is not just about making decisions—it\'s about communicating a vision that people can believe in.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill was also a prolific writer, producing numerous books on military history, politics, and his own life. His multi-volume work "The Second World War" is considered a masterpiece of historical writing. He used his writing to influence political thinking and to shape how people understood history. For Churchill, words were a weapon as powerful as any military force, and he wielded them with precision and skill.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'An Enduring Legacy' },
      afbeelding: SCENE_IMAGES['winston-churchill-8'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['winston-churchill-8'],
          alt: { en: 'A coffin on a launch passing dockside cranes that dip in salute.' },
          bijschrift: { en: 'The Thames cranes lowered their jibs as he passed. Nobody had ordered them to.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Winston Churchill died on January 24, 1965, at age ninety. His death was mourned worldwide as the end of an era. He is remembered as one of the greatest leaders of the twentieth century—a man who rallied his nation in its darkest hour and helped defeat Nazi tyranny. His stubbornness, determination, and refusal to accept defeat when others counseled surrender were exactly the qualities Britain needed during World War II. Churchill proved that individual leadership matters, that moral courage is essential in times of crisis, and that words can be as powerful as weapons in shaping the course of history.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Churchill\'s legacy extends beyond World War II and the Cold War. He is remembered for demonstrating the importance of democratic values, individual liberty, and resistance to tyranny. His warnings about the dangers of totalitarianism remain relevant. His speeches continue to be read and quoted as examples of powerful political communication. Churchill showed that a leader must be willing to stand alone against prevailing opinion when principle demands it, and that perseverance in the face of overwhelming odds can lead to ultimate victory. Today, nearly sixty years after his death, Winston Churchill remains one of history\'s most celebrated and influential political figures.' }
        }
      ]
    },
  ]
};

export const martinLutherKingJr: Verhaal = {
  id: 'martin-luther-king-jr',
  titel: { en: 'Martin Luther King Jr.' },
  ondertitel: { en: 'The Dreamer Who Changed America' },
  teaser: { en: 'Through nonviolent resistance, he shattered the chains of racial segregation and inspired a nation.' },
  jaar: 1968,
  periodeLabel: '1929 - 1968',
  soort: 'persoon',
  afbeelding: CHARACTER_IMAGES['martin-luther-king-jr'],
  portretKleur: '#6B4A3A',
  uitgelicht: false,
  volgorde: 3,
  tijdperkId: 'twintigste-eeuw',
  themas: ['burgerrechten', 'rascisme', 'geweldloosheid', 'amerikaanse samenleving', 'gelijkheid'],
  leestijdMinuten: 7,
  personage: { naam: 'Martin Luther King Jr.' },
  chapters: [
    {
      id: 1,
      titel: { en: 'Growing Up in the Jim Crow South' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-1'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-1'],
          alt: { en: 'A southern American street with two drinking fountains side by side.' },
          bijschrift: { en: 'Segregation was not merely custom but law, enforced in schools, buses, courts and waiting rooms.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Martin Luther King Jr. was born on January 15, 1929, in Atlanta, Georgia, in the American South during the era of Jim Crow segregation. His father was a prominent minister, and young Martin grew up in a relatively privileged African American household. However, no amount of family wealth or education could shield him from the brutal reality of racial segregation. Jim Crow laws mandated the separation of blacks and whites in schools, restaurants, public transportation, and almost every aspect of public life. The signs reading "Whites Only" and "Colored" were constant reminders of the inferior status to which African Americans were relegated.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Martin\'s parents were educated and proud, determined to instill in their son a sense of his own worth and dignity despite the racism surrounding him. They taught him that he was equal to anyone, regardless of skin color. His father\'s work as a minister exposed Martin to the traditions of the black church, which combined faith, morality, and social justice. Young Martin excelled in school and showed an early interest in theology and philosophy. He attended Morehouse College at age fifteen and later went to seminary. Throughout his education, King grappled with questions about justice, equality, and how to address the sin of racism.' }
        }
      ]
    },
    {
      id: 2,
      titel: { en: 'Becoming a Minister and Finding a Philosophy' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-2'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-2'],
          alt: { en: 'A young minister preaching from the pulpit of a red-brick Baptist church.' },
          bijschrift: { en: 'Montgomery, 1954. He was twenty-five, with a new doctorate and a first congregation.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Martin Luther King Jr. was ordained as a minister at age eighteen and later earned a doctorate in systematic theology. He became pastor of the Dexter Avenue Baptist Church in Montgomery, Alabama, in 1954. King\'s early ministry focused on the spiritual and moral dimensions of faith, but he was increasingly aware of the gap between Christian teachings about love and equality and the reality of racial injustice in American society. He studied the teachings of Mahatma Gandhi, whose philosophy of nonviolent resistance through civil disobedience offered a practical approach to fighting injustice without resorting to violence.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'King developed a theology that combined Christian ethics, American ideals of democracy and equality, and Gandhi\'s methods of nonviolent resistance. He believed that moral progress required confronting injustice directly but without hatred or violence. This philosophy—often called nonviolent civil disobedience—became the foundation of the civil rights movement. King argued that unjust laws should be openly disobeyed, but those who broke the law should be willing to accept legal punishment without fighting back, thereby exposing the injustice of the system through their suffering.' }
        }
      ]
    },
    {
      id: 3,
      titel: { en: 'The Montgomery Bus Boycott' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-3'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-3'],
          alt: { en: 'Residents walking to work at dawn as an empty city bus passes.' },
          bijschrift: { en: '381 days of walking. The bus company lost roughly three-quarters of its riders.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'On December 1, 1955, Rosa Parks, a seamstress and civil rights activist, refused to give up her seat to a white passenger on a Montgomery bus, an act that violated local segregation laws. She was arrested. This simple act of courage sparked the Montgomery Bus Boycott, a sustained protest that lasted 381 days. The black community of Montgomery organized a complete boycott of the bus system, coordinated by a group of ministers including the young Martin Luther King Jr. King\'s church became headquarters for the boycott movement.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Despite threats against his life, King led the boycott with remarkable composure and grace. He articulated a vision of nonviolent resistance that inspired thousands of people to maintain the boycott despite personal hardship. The boycott achieved its goal—the Supreme Court ruled that segregation on buses was unconstitutional. The Montgomery Bus Boycott was a watershed moment. It demonstrated that organized, nonviolent protest could succeed against an unjust system, and it catapulted Martin Luther King Jr. to national prominence. He was just twenty-six years old and had already changed the course of American history.' }
        }
      ]
    },
    {
      id: 4,
      titel: { en: 'The Sit-Ins and Freedom Rides' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-4'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-4'],
          alt: { en: 'Students sitting at a segregated lunch counter as a crowd presses behind.' },
          bijschrift: { en: 'The rule was absolute: whatever was done to you, you did not hit back.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'Throughout the late 1950s and early 1960s, King led and supported a series of nonviolent protests against segregation. In 1960, African American college students began sit-ins at segregated lunch counters in Greensboro, North Carolina, and the movement spread rapidly. Young people, black and white, sat peacefully at lunch counters and endured verbal abuse, threats, and physical violence, never fighting back. King supported these sit-ins and encouraged students to maintain nonviolent discipline, believing that their refusal to respond with violence would ultimately expose the immorality of their oppressors\' actions.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1961, Freedom Riders—integrated groups of activists—traveled on buses through the deep South to challenge segregation in interstate bus travel. These rides were dangerous, and the riders faced violent mobs and arrest. King did not always participate directly in each action, but he provided moral and strategic leadership for the movement. He was arrested multiple times, jailed, and threatened with death. Each time, he emerged from these experiences strengthened in his conviction that nonviolent resistance was morally superior to violence, even when facing brutal opposition.' }
        }
      ]
    },
    {
      id: 5,
      titel: { en: 'The Dream and the March on Washington' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-5'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-5'],
          alt: { en: 'A vast crowd filling the reflecting pool between a memorial and an obelisk.' },
          bijschrift: { en: 'August 1963. The most famous passage of the speech was not in the prepared text.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'On August 28, 1963, more than 200,000 people gathered in Washington, DC, for the March on Washington for Jobs and Freedom. It was the largest political demonstration in American history to that date. Martin Luther King Jr. stood on the steps of the Lincoln Memorial and delivered the speech that would define his legacy: "I Have a Dream." In this soaring oration, King articulated a vision of a future America where racial segregation would be gone and where people would be judged not by the color of their skin but by the content of their character.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'The dream King described was both deeply rooted in American ideals—drawing on the Declaration of Independence and the Gettysburg Address—and prophetic in its vision of radical transformation. He spoke not with anger but with hope, not with calls for revenge but with demands for justice. The speech moved millions of Americans and elevated the civil rights movement to unprecedented heights. The march and King\'s speech are credited with influencing Congress to pass the Civil Rights Act of 1964, which outlawed racial segregation in public accommodations and employment. For the first time in nearly a century, the federal government had taken strong action to protect the rights of African Americans.' }
        }
      ]
    },
    {
      id: 6,
      titel: { en: 'Nobel Prize and the Struggle Continues' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-6'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-6'],
          alt: { en: 'A laureate receiving a medal in a grand Scandinavian civic hall.' },
          bijschrift: { en: 'At thirty-five, the youngest Nobel Peace laureate up to that point. He gave the money away.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'In 1964, at age thirty-five, Martin Luther King Jr. became the youngest man at that time to win the Nobel Peace Prize. The award recognized his leadership in the civil rights movement and his commitment to nonviolent resistance. In his Nobel Prize acceptance speech, King spoke of peace and called on humanity to abolish war. However, he also acknowledged that the struggle for racial justice in America was far from over. Despite the Civil Rights Act of 1964, African Americans still faced discrimination in employment, housing, education, and voting rights.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'King expanded his focus to address economic inequality, housing segregation, and voting rights. In 1965, he led a march from Selma to Montgomery, Alabama, to protest voting discrimination. The march was violently attacked by police, but King persisted. The resulting national outcry led Congress to pass the Voting Rights Act of 1965, protecting African Americans\' right to vote. King\'s later years saw him become increasingly critical of American foreign policy, particularly the Vietnam War, which he believed was unjust and was draining resources needed to fight poverty and racism at home.' }
        }
      ]
    },
    {
      id: 7,
      titel: { en: 'The Widening Vision' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-7'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-7'],
          alt: { en: 'Striking sanitation workers marching down a wet Memphis street.' },
          bijschrift: { en: 'By 1968 he was speaking about poverty and Vietnam — and losing allies over both.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'By the mid-1960s, King\'s focus had expanded beyond legal segregation to address the deeper structural problems of poverty, inequality, and militarism. He began the Poor People\'s Campaign to address economic injustice affecting not just African Americans but poor people of all races. He became a vocal opponent of the Vietnam War, arguing that America should not be spending billions on warfare when millions of its citizens lived in poverty. King\'s message evolved to encompass a broader vision of human rights and dignity, connected to struggles for justice around the world.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'King\'s willingness to speak out on controversial issues like poverty and war made him more controversial in some circles, even as his moral stature grew. He remained committed to nonviolence despite increasing radicalization within the civil rights movement. After the assassinations of Malcolm X and others, some activists argued that nonviolence was insufficient. King stood firm in his conviction that nonviolent resistance was not only morally superior but also more effective in the long run. He believed that using violence would only perpetuate cycles of violence and would undermine the moral power of the movement.' }
        }
      ]
    },
    {
      id: 8,
      titel: { en: 'A Dream Deferred But Not Defeated' },
      afbeelding: SCENE_IMAGES['martin-luther-king-jr-8'],
      blokken: [
        {
          type: 'afbeelding',
          bron: SCENE_IMAGES['martin-luther-king-jr-8'],
          alt: { en: 'A candlelight vigil beneath a motel balcony at night.' },
          bijschrift: { en: 'Memphis, 4 April 1968. He was thirty-nine years old.' }
        },
        {
          type: 'tekst',
          inhoud: { en: 'On April 4, 1968, Martin Luther King Jr. was assassinated in Memphis, Tennessee, at age thirty-nine. His death shocked the world and sparked both mourning and anger. He did not live to see the full realization of his dream, and in many ways, the struggle for racial justice and equality continues to this day. Yet the impact of his life and work was immeasurable. The civil rights legislation he helped inspire transformed American society and provided legal protections that continue to benefit millions.' },
        },
        {
          type: 'tekst',
          inhoud: { en: 'Martin Luther King Jr.\'s legacy extends far beyond the civil rights movement. He demonstrated that one person, armed with moral conviction and committed to nonviolence, can inspire millions and change the course of history. His dream of a nation where people are judged by character rather than color remains an aspiration that continues to inspire people around the world. King showed that moral leadership requires not just words but willingness to suffer for what is right. His life reminds us that progress toward justice is not automatic—it requires constant effort, sacrifice, and unwavering commitment to the principles of human dignity and equality. Today, the civil rights movement King led stands as one of the great moral achievements of the twentieth century, a testament to the power of nonviolent resistance and the possibility of transforming unjust systems through courage and faith.' }
        }
      ]
    },
  ]
};

export const twintigsteEeuw: Verhaal[] = [marieCurie, winstonChurchill, martinLutherKingJr];
