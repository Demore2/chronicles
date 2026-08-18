-- Gegenereerd door scripts/generate-interactive-content.mjs
-- Idempotent: on conflict do nothing.

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('ashoka-maurya', 4, 'What figures does Ashoka''s own Rock Edict XIII give for the cost of the Kalinga war?', array['100,000 deported, 150,000 killed', '150,000 deported, 100,000 killed', '150,000 killed, no deportations recorded', '100,000 deported and 100,000 killed']::text[], 1, 'The deportations may have been the crueller half: marching villagers hundreds of kilometres to settle new land killed by hunger and disease long after the fighting ended.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('ashoka-maurya', 6, 'At Kandahar in Afghanistan, in which languages was Ashoka''s message carved?', array['Prakrit and Brahmi', 'Greek and Aramaic', 'Kharoshthi and Persian', 'Sanskrit and Greek']::text[], 1, 'The bilingual slab was found by workmen in 1958. Ashoka was preaching abstention from killing to the descendants of Alexander''s garrisons, in the language of Plato.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('ashoka-maurya', 8, 'Who deciphered the Brahmi script and made the edicts readable again?', array['Megasthenes', 'Firuz Shah Tughluq', 'James Prinsep', 'H. G. Wells']::text[], 2, 'Prinsep cracked the script in 1837, but the king he read called himself only Devanampiya Piyadasi. The name Ashoka was not confirmed on stone until the Maski inscription surfaced in 1915.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('joan-of-arc', 3, 'How did Charles VII test Jeanne when she reached Chinon?', array['He hid among his courtiers dressed like a servant', 'He asked her to read aloud from a letter', 'He sent her to argue before the university', 'He ordered her to ride an untrained horse']::text[], 0, 'The recognition trick mattered because the king''s own legitimacy was in doubt; if God''s messenger knew him, so should everyone else. The theologians at Poitiers still examined her for weeks afterwards.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('joan-of-arc', 5, 'Where did Charles VII travel in July 1429 for his coronation?', array['Reims', 'Rouen', 'Chinon', 'Orléans']::text[], 0, 'Reims was the traditional coronation city, and the campaign along the Loire opened the road to it. Two years later Jeanne would be tried in Rouen, a city still held by the English.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('joan-of-arc', 6, 'Who took Jeanne prisoner in May 1430?', array['Burgundian forces at Compiègne', 'English archers at Orléans', 'French collaborators at Reims', 'The tribunal''s guards at Rouen']::text[], 0, 'The Burgundians sold her on to the English for a large sum. As a captured commander she should have been held for ransom, but no ransom was ever offered for her.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('charlemagne', 2, 'Why did Pope Hadrian call on Charles for help in 773?', array['Byzantine armies had landed in Italy', 'The Lombards threatened papal territories', 'The Saxons had raided Rome', 'Muslim forces had crossed the Pyrenees']::text[], 1, 'Charles beat the Lombards and then took their crown for himself. The lands he handed to the Church afterwards bound papacy and Frankish throne together for centuries.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('charlemagne', 3, 'What title did Pope Leo III give Charles on Christmas Day, 800?', array['King of the Lombards', 'Emperor of the Romans', 'Protector of the Holy See', 'King of all the Franks']::text[], 1, 'He was the first ruler in western Europe to carry an imperial title since Rome fell. In Constantinople, where a real Roman emperor still sat, the coronation was read as an insult.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('charlemagne', 7, 'What became of the empire after the death of Charles''s son Louis the Pious?', array['It passed whole to one grandson', 'Louis''s three sons divided it between them', 'The Pope took it under his rule', 'It was conquered by the Saxons']::text[], 1, 'Frankish custom split inheritances, the same custom that had once forced Charles to share with his brother Carloman. This time no brother died early to undo the division.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('richard-the-lionheart', 3, 'What did Richard do after a storm wrecked his fleet off Cyprus?', array['Conquered the island and sold it', 'Turned back to England for repairs', 'Demanded ships from Philip II', 'Wintered there until spring']::text[], 0, 'The sale funded a crusade that was already draining his treasury — Cyprus paid for the campaign that followed, and stayed in Latin hands long after Richard left the East.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('richard-the-lionheart', 4, 'What did the 1192 truce with Saladin actually secure for the Christians?', array['The city of Jerusalem itself', 'Safe passage for pilgrims to Jerusalem', 'Saladin''s conversion', 'A Muslim withdrawal from Palestine']::text[], 1, 'Jerusalem stayed under Muslim control, but Richard kept much of the Palestinian coast — the coastal strongholds outlasted him by generations.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('richard-the-lionheart', 5, 'How did Richard treat the crossbowman who wounded him in 1199?', array['He had him hanged from the walls', 'He forgave him and ordered his release', 'He never learned who fired', 'He took him into his household']::text[], 1, 'Richard was besieging only a minor castle when the bolt struck. The wound itself did not kill him — the infection that followed did, within days.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('leonardo-da-vinci', 2, 'When Leonardo wrote to Duke Ludovico Sforza of Milan around 1482, what did he mainly offer?', array['His skill as a painter of altarpieces', 'His services as an engineer and weapons designer', 'His knowledge of Latin and philosophy', 'His experience carving marble']::text[], 1, 'He led with military and architectural work because that was what princes paid for. The painting commissions followed once he was inside the court.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('leonardo-da-vinci', 3, 'How did Leonardo write the thousands of observations in his Milan notebooks?', array['In Latin verse', 'In mirror script, written backwards', 'In coded numbers', 'In Greek shorthand']::text[], 1, 'The reversed hand kept his pages effectively private, and it scattered his ideas for centuries — much of the material was not read or published until long after his death.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('leonardo-da-vinci', 7, 'How many completed paintings did Leonardo leave behind at his death in 1519?', array['Fewer than twenty', 'About fifty', 'More than a hundred', 'Exactly seven']::text[], 0, 'Against those few finished panels stand thousands of notebook pages. The unfinished commissions cost him patrons in his lifetime and made his reputation after it.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('galileo-galilei', 3, 'Roughly how much did Galileo''s own telescope magnify what he looked at?', array['About three times', 'About ten times', 'About thirty times', 'About a hundred times']::text[], 2, 'Thirty times was enough to show craters on the Moon and four points of light beside Jupiter. He built it within weeks of merely hearing rumours of the Dutch spyglass, without ever seeing one.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('galileo-galilei', 5, 'Which book made Galileo famous in 1610 — and marked him as dangerous?', array['The Starry Messenger', 'Dialogue Concerning the Two Chief World Systems', 'Two New Sciences', 'On the Revolutions of the Heavenly Spheres']::text[], 0, 'The Starry Messenger reported the telescope''s findings to a wide readership. Fame cut both ways: it meant Rome now knew exactly who he was, and in 1616 Pope Paul V summoned him.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('galileo-galilei', 6, 'Where was Galileo sent after the Inquisition sentenced him in 1633?', array['Exile in the Netherlands', 'A prison cell in Rome', 'House arrest at Arcetri near Florence', 'A monastery in Pisa']::text[], 2, 'He was barred from publishing, from discussing heliocentrism, and from receiving visitors unapproved. It was at Arcetri, under those terms, that he wrote Two New Sciences.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('galileo-galilei', 2, 'What did Galileo say explained the feather''s slow fall, contrary to Aristotle?', array['Its lighter weight', 'Air resistance', 'The shape of its edges', 'Its distance from the ground']::text[], 1, 'Remove the air, he argued, and cannonball and feather would land together. Scholars had repeated Aristotle''s rule for two thousand years without once testing it.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('catherine-the-great', 3, 'How long had Peter III been on the throne before Catherine moved against him?', array['Six weeks', 'Six months', 'Two years', 'Ten years']::text[], 1, 'In half a year he had offended the army, the nobility and the Church at once. Catherine did not have to build a faction so much as collect one already waiting.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('catherine-the-great', 5, 'Which power did Catherine fight to win Russian access to the Black Sea?', array['The Ottoman Empire', 'Prussia', 'Austria', 'Sweden']::text[], 0, 'The Ottomans held the southern territories Russia wanted. Prussia and Austria were partners in the Polish partition rather than enemies — for the moment.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('catherine-the-great', 7, 'Who led the great peasant rebellion of the 1770s?', array['Grigory Orlov', 'Emelian Pugachev', 'Peter III', 'Paul']::text[], 1, 'Pugachev was a Cossack, and the rising drew its strength from exactly the serf population whose bondage Catherine went on to tighten.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('james-watt', 2, 'What was the central flaw of the Newcomen engine that Watt identified?', array['It could not be built large enough', 'The same chamber was heated and cooled every cycle', 'It required too many skilled operators', 'Its cylinder was made of the wrong metal']::text[], 1, 'Newcomen''s engines had been pumping mine water for decades before Watt was handed a model to repair — nobody had thought the waste worth fixing because coal at the pithead was almost free.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('james-watt', 3, 'How much fuel did Watt''s improved design use compared with a Newcomen engine doing the same work?', array['About half', 'About a quarter', 'About three quarters', 'Roughly the same, but faster']::text[], 1, 'The saving was what sold the engines: Boulton and Watt often charged customers a share of the fuel they no longer burned.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('james-watt', 5, 'Which group near Birmingham did Watt join to discuss science and its practical uses?', array['The Royal Society', 'The Lunar Society', 'The Glasgow Philosophical Club', 'The Society of Instrument Makers']::text[], 1, 'The Lunar Society was informal and met in members'' houses, yet its conversations shaped much of British industry — Boulton was part of the same circle.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('florence-nightingale', 3, 'What did Florence Nightingale''s analysis of hospital records at Scutari reveal?', array['Most deaths came from battle wounds', 'Most deaths came from disease caused by poor sanitation', 'Most deaths came from lack of medicine', 'Most deaths came from cold and exposure']::text[], 1, 'Her charts turned an argument about cleanliness into a matter of counted deaths — harder for officials to dismiss than any appeal to pity.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('florence-nightingale', 5, 'Where did Florence Nightingale establish her nurse training school in 1860?', array['St Thomas'' Hospital, London', 'The Barrack Hospital, Scutari', 'A training institution in Germany', 'A private hospital in Harley Street']::text[], 0, 'Schools built on the same model followed in America and across Europe, so a single London ward became the pattern for a worldwide profession.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('florence-nightingale', 2, 'According to the chapter, what was killing most British soldiers in the Crimean War?', array['Enemy bullets', 'Starvation', 'Typhus, dysentery, typhoid and cholera', 'Wounds left untreated by surgeons']::text[], 2, 'Newspaper reports of these deaths caused public outrage at home, which is what made an official invitation to Nightingale politically possible.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('thomas-edison', 2, 'What was Edison''s first significant invention, made while he worked as a telegraph operator?', array['The stock ticker', 'An automatic telegraph repeater', 'The phonograph', 'The storage battery']::text[], 1, 'The repeater relayed signals over long distances with no operator sitting at the key. The stock ticker came afterwards in New York, and it was that device — not the repeater — that first made him money.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('thomas-edison', 4, 'What filament did Edison test on October 21, 1879, in the bulb that burned for over thirteen hours?', array['Carbonized bamboo', 'Platinum wire', 'Carbonized cotton', 'Tungsten']::text[], 2, 'Cotton proved the principle; bamboo proved the product. By 1880 a carbonized bamboo filament was lasting more than 1,200 hours, which made selling light as a service possible.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('thomas-edison', 7, 'Who suggested that Americans switch off their electric lights for a minute when Edison died?', array['Henry Ford', 'George Westinghouse', 'Nikola Tesla', 'His son Charles']::text[], 0, 'Ford was a friend and colleague, and the gesture worked as a measurement as much as a tribute: it showed how much of the country had something to turn off.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('winston-churchill', 2, 'Which campaign, backed by Churchill as First Lord of the Admiralty, damaged his reputation and led to his resignation?', array['The Gallipoli Campaign', 'The Somme offensive', 'The Norwegian campaign', 'The siege of Ladysmith']::text[], 0, 'The heavy casualties made him a convenient scapegoat, and he spent years afterwards as a political outcast, rebuilding his standing through journalism and books.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('winston-churchill', 4, 'What happened to Churchill in July 1945, weeks after Germany''s surrender?', array['He was made Leader of the Opposition after an election defeat', 'He resigned over the atomic bomb', 'He was re-elected with a large majority', 'He retired from Parliament altogether']::text[], 0, 'British voters chose Labour instead. Churchill felt the country had repaid his wartime leadership poorly, but he stayed on in Parliament rather than withdraw.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('winston-churchill', 5, 'Where did Churchill deliver his 1946 speech describing an "Iron Curtain" across Europe?', array['Fulton, Missouri', 'Yalta', 'Westminster', 'Chicago']::text[], 0, 'He spoke in collaboration with President Truman, and the phrase outlived them both as the standard metaphor for a divided Europe.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('martin-luther-king-jr', 3, 'How long did the Montgomery Bus Boycott last?', array['54 days', '90 days', '381 days', 'Just over two years']::text[], 2, 'It ended only when the Supreme Court ruled bus segregation unconstitutional. King was twenty-six when it finished, and no longer a local pastor but a national figure.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('martin-luther-king-jr', 5, 'How many people gathered in Washington on August 28, 1963?', array['About 20,000', 'About 75,000', 'More than 200,000', 'More than two million']::text[], 2, 'It was the largest political demonstration in American history to that date. Congress passed the Civil Rights Act the following year, and the march is widely credited with pushing it through.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('martin-luther-king-jr', 6, 'Which law followed the 1965 march from Selma to Montgomery?', array['The Voting Rights Act of 1965', 'The Civil Rights Act of 1964', 'A Supreme Court ruling on interstate buses', 'The Poor People''s Campaign bill']::text[], 0, 'Police attacked the marchers, and the national outcry did the political work that petitions had not. King had won the Nobel Peace Prize only months before, at thirty-five.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('steve-jobs', 2, 'What made the Apple II different from other personal computers sold in 1977?', array['It came fully assembled and ready to use', 'It was sold as a kit for buyers to solder', 'It needed no screen of any kind', 'It stored data on floppy disks only']::text[], 0, 'The finished plastic case mattered as much as the circuitry: it let a machine built by hobbyists sit on a desk in a home or a small office without looking like an experiment.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('steve-jobs', 4, 'Which of Jobs''s ventures during his twelve years away from Apple never achieved commercial success?', array['NeXT', 'Pixar', 'Apple Computer', 'Toy Story']::text[], 0, 'NeXT machines were admired and unaffordable. The failure taught Jobs to work without Apple''s market position behind him — a lesson he carried back in 1997.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('steve-jobs', 6, 'Where did Jobs introduce the iPhone on January 9, 2007?', array['The Macworld conference', 'A press event at NeXT', 'A Pixar film premiere', 'An iTunes launch in New York']::text[], 0, 'He told the audience Apple was going to reinvent the phone, and within a few years every manufacturer was redesigning its products in answer to it.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('malala-yousafzai', 2, 'How did Malala first tell the world what life under Taliban rule was like?', array['A blog for BBC Urdu, written under a pseudonym', 'A letter to the Pakistani prime minister', 'A speech at her father''s school', 'An interview with a Birmingham newspaper']::text[], 0, 'The pseudonym was meant to keep her safe. Her identity became public within a couple of years, and by then the Taliban knew exactly whose voice they had been reading.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('malala-yousafzai', 4, 'Where was Malala taken for her longer course of treatment after the shooting?', array['Mingora', 'Islamabad', 'Birmingham, England', 'Oslo']::text[], 2, 'She was first operated on in Pakistan, then flown to Birmingham. The city became her family''s home, and she later studied at Oxford.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('malala-yousafzai', 6, 'With whom did Malala share the 2014 Nobel Peace Prize?', array['Kailash Satyarthi', 'Ziauddin Yousafzai', 'Muhammad Ali Jinnah', 'Kofi Annan']::text[], 0, 'Satyarthi had spent decades campaigning against child labour in India. Pairing a Pakistani girl with an Indian man was a deliberate choice by the committee.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('nelson-mandela', 3, 'What was the name of the armed wing of the ANC that Mandela co-founded in 1961?', array['Umkhonto we Sizwe', 'African National Congress Youth League', 'Spear of the Thembu', 'Free Mandela Movement']::text[], 0, 'The name means Spear of the Nation. Its early plan was sabotage of government installations rather than attacks on people, a distinction Mandela pressed at his trial.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('nelson-mandela', 4, 'What work were prisoners on Robben Island forced to do?', array['Breaking limestone in a quarry', 'Fishing off the island coast', 'Building the prison walls', 'Farming the island''s fields']::text[], 0, 'The glare off the white limestone permanently damaged Mandela''s eyes — years later photographers were asked not to use flashbulbs near him.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values
  ('nelson-mandela', 7, 'Which institution did Mandela establish as president to deal with crimes committed under apartheid?', array['The Truth and Reconciliation Commission', 'The Springbok Council', 'The National Unity Tribunal', 'The Robben Island Inquiry']::text[], 0, 'Perpetrators could confess and be forgiven while victims were heard. The aim was to break the cycle of revenge rather than to fill the courts.')
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('ashoka-maurya', 4, 'Kalinga was the last territory Ashoka ever conquered. What do you think turned him?', array['Genuine horror at the slaughter', 'Political calculation about a costly empire', 'Exhaustion after a long fight for the throne']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('ashoka-maurya', 6, 'Rock Edict XIII was carved all over the empire, but not in Kalinga itself. Why?', array['The conquered were not to be reminded', 'Local officials needed different orders', 'Remorse was aimed at the loyal, not the beaten']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('ashoka-maurya', 8, 'Later Buddhist writers blamed Ashoka''s pacifism for the Mauryan collapse. What do you think?', array['An empire that stops conquering dies', 'Weak successors would have lost it anyway', 'The bureaucracy was too slow to hold it']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('joan-of-arc', 2, 'Her father finally let a seventeen-year-old girl leave for Vaucouleurs. Why do you think he agreed?', array['He believed her voices', 'He could not break her will', 'He thought the war would reach Domrémy anyway']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('joan-of-arc', 4, 'What broke the siege of Orléans?', array['Jeanne riding at the front', 'The soldiers'' restored belief', 'English exhaustion after years of war']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('joan-of-arc', 7, 'The English expected her execution to end French resistance. What did it actually do?', array['Made her a martyr and hardened France', 'Changed little on its own', 'Cost France its boldest commander']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('charlemagne', 2, 'The Saxon wars ran for more than thirty years. What do you think kept them going so long?', array['The Saxons would not give up their religion', 'Charles''s methods bred new revolts', 'The land was too wide to hold']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('charlemagne', 4, 'Which of Charles''s works do you think mattered most to his empire?', array['Roads, coinage and standard measures', 'The palace school at Aachen', 'Counts and bishops answerable to him']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('charlemagne', 7, 'Why did the empire not outlive its builder?', array['No successor had his force of will', 'Division among heirs was inevitable', 'It was always too large to govern']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('richard-the-lionheart', 4, 'Richard came within sight of Jerusalem and turned away. What do you think weighed heaviest?', array['Thin supply lines', 'Saladin''s strong position', 'Fear of holding a city he could not defend']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('richard-the-lionheart', 5, 'After his return from captivity Richard longed for another crusade rather than governing. How do you read that?', array['A soldier unfit for peace', 'Genuine religious devotion', 'Appetite for glory']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('richard-the-lionheart', 7, 'John lost the Angevin lands Richard had fought for. Whose failure was it?', array['John''s, for lacking skill', 'Richard''s, for draining the treasury', 'Nobody''s — the empire was too large to hold']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('leonardo-da-vinci', 1, 'Leonardo was barred from university because of his birth. Do you think that shut a door or opened one?', array['It cost him a real education', 'It freed him to study the world directly', 'It made little difference to a mind like his']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('leonardo-da-vinci', 3, 'Leonardo abandoned commissions whenever a new idea took hold. What do you make of that?', array['A failure of discipline', 'The price of real curiosity', 'A quarrel with his patrons, not with himself']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('leonardo-da-vinci', 5, 'He watched birds for hours and never flew. Was the flight work worth the years?', array['Yes — the principles outlived him', 'No — it took him from finished work', 'It was never really about flying']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('galileo-galilei', 6, 'Galileo denied that the Earth moved rather than defy the Inquisition. How do you read that denial?', array['Sensible survival', 'A betrayal of his work', 'The only way to keep writing']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('galileo-galilei', 5, 'He kept quiet after 1616, then published the Dialogue in 1632. What do you think drove him back?', array['Confidence he could outwit the censors', 'Simple pride', 'A duty to the evidence']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('galileo-galilei', 8, 'What was Galileo''s most lasting contribution?', array['The telescope observations', 'The method of testing ideas', 'Standing up to the Church']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('catherine-the-great', 4, 'Catherine made careful reforms rather than radical ones. Why do you think she held back?', array['She could not afford to lose the nobility', 'She never truly believed the ideas', 'The empire was too vast to change quickly']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('catherine-the-great', 5, 'The partition of Poland was the most controversial act of her reign. How do you judge it?', array['A crime of convenience', 'Ordinary statecraft of the age', 'A defence Russia could not avoid']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('catherine-the-great', 8, 'What kept a foreign-born princess on the Russian throne for thirty-four years?', array['The loyalty of the army and nobles', 'Her own political skill', 'Luck and the weakness of rivals']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('james-watt', 3, 'Watt had the invention, Boulton the capital and the workshops. Whose contribution mattered more to the engine''s success?', array['Watt''s design', 'Boulton''s business', 'Neither would have worked alone']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('james-watt', 4, 'Watt was skeptical that his engine belonged in transport. Why do you think he held back?', array['He doubted it could be made safe', 'He was absorbed in factory work', 'He mistrusted high-pressure steam']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('james-watt', 7, 'The industrial revolution brought wealth along with overcrowding, pollution and child labour. How would you weigh it?', array['Worth the cost', 'The cost was too high', 'Too early to judge even now']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('florence-nightingale', 1, 'Her family opposed her nursing plans for years. What do you think drove them hardest?', array['Fear of losing social standing', 'Genuine worry for her safety', 'Refusal to see a daughter work at all']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('florence-nightingale', 4, 'Which part of her work do you think saved more lives?', array['Scrubbing wards and changing bedding', 'Collecting and publishing the statistics', 'Training the nurses who came after']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('florence-nightingale', 6, 'She spent her later decades confined at home, writing reports. How do you read that?', array['Illness she worked around', 'A shield from public life', 'The most effective work she did']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('thomas-edison', 3, 'Menlo Park was called an invention factory. What do you think mattered most about it?', array['The well-stocked workshops', 'The assembled team of craftsmen', 'The systematic method of working']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('thomas-edison', 5, 'Edison lost the War of Currents. Why do you think his direct current system failed?', array['AC was better over long distances', 'He was too committed to his own design', 'His tactics cost him credibility']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('thomas-edison', 8, 'Which legacy do you consider the larger one?', array['The inventions themselves', 'The research laboratory as an institution', 'The electrical system in daily life']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('winston-churchill', 2, 'Churchill was dismissed as a warmonger for his warnings about Hitler. Why do you think so few listened?', array['Gallipoli had ruined his credibility', 'No one wanted another war', 'Appeasement seemed reasonable at the time']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('winston-churchill', 4, 'Which mattered more to Churchill''s wartime record — the speeches or the alliances?', array['The speeches to the British people', 'The alliances with Roosevelt and Stalin', 'Neither without the other']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('winston-churchill', 6, 'Churchill returned as Prime Minister at seventy-six and served until he was eighty. What do you make of that?', array['The country still needed him', 'He stayed too long', 'A fitting end to a long career']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('martin-luther-king-jr', 4, 'Students at the lunch counters were abused and beaten and never struck back. What do you think that discipline achieved most?', array['It shamed the onlookers', 'It kept the movement alive', 'It cost too much for too little']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('martin-luther-king-jr', 7, 'King held to nonviolence when some activists called it insufficient. Why do you think he refused to move?', array['He believed violence only breeds violence', 'He judged it the more effective strategy', 'His faith left him no other option']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('martin-luther-king-jr', 8, 'Which part of King''s work do you think mattered most?', array['The legislation it produced', 'The example of nonviolent resistance', 'The unfinished fight against poverty']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('steve-jobs', 3, 'Jobs was harsh with designers and engineers, and the work came out remarkable. What do you make of that?', array['The results justified it', 'Good work needed no cruelty', 'Others simply learned to endure him']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('steve-jobs', 5, 'Which move mattered most in saving Apple after 1997?', array['The colorful iMac', 'The iPod and iTunes', 'Tying hardware, software and services together']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('steve-jobs', 8, 'Which of his transformations do you think will last longest?', array['The smartphone', 'Animated film', 'The idea that design sells']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('malala-yousafzai', 3, 'Malala kept giving interviews even as the danger grew. What do you think drove her most?', array['Her father''s example', 'Anger at the school closures', 'Belief that publicity was protection']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('malala-yousafzai', 5, 'What did more for the cause of girls'' education — her blog, the shooting, or the UN speech?', array['The blog from Swat', 'The attack and its aftermath', 'The speech at the United Nations']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('malala-yousafzai', 7, 'Why do you think 250 million children remain out of school?', array['Poverty above all', 'War and displacement', 'Deliberate discrimination']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('nelson-mandela', 3, 'The ANC turned to sabotage in 1961 after years of peaceful protest. Was that the right decision?', array['Yes, nothing else was left', 'No, non-violence had more to give', 'It was justified but came too early']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('nelson-mandela', 6, 'What do you think mattered most in bringing the apartheid government to the negotiating table?', array['International sanctions and isolation', 'Resistance inside South Africa', 'De Klerk''s own decisions']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_polls (story_id, chapter_index, question, options) values
  ('nelson-mandela', 7, 'Mandela stepped down after a single term. Why do you think he did?', array['To prove power should rotate', 'He judged his work finished', 'Age and exhaustion']::text[])
  on conflict (story_id, chapter_index, question) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('ashoka-maurya', 3, 'turn-the-army-east', 'Kalinga was rich, proud and wedged between your heartland and your southern provinces. In Ashoka''s place, what would you do with it?', array['Invade and complete the map', 'Buy its loyalty with trade terms', 'Leave it alone and garrison the border']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('ashoka-maurya', 7, 'police-the-sangha', 'Monks were quarrelling over doctrine, and the emperor could order dissenters stripped of their robes. In his place, would you intervene?', array['Expel those who split the order', 'Fund the monasteries and stay out', 'Let the monks judge their own']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('joan-of-arc', 2, 'speak-of-the-voices', 'A voice in the garden tells a thirteen-year-old she is chosen, and her world burns witches. In her place, what would you do?', array['Keep it secret', 'Tell the parish priest', 'Set out for Vaucouleurs']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('joan-of-arc', 6, 'hold-firm-at-rouen', 'The Rouen tribunal has already decided the verdict and only wants a confession. In her place, what would you do?', array['Hold to the voices', 'Say whatever they want', 'Refuse to answer at all']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('charlemagne', 2, 'exile-carlomans-family', 'Carloman''s death left Charles sole ruler, and he drove his brother''s widow and children into exile. In his place, what would you have done?', array['Send them into exile', 'Let them keep Carloman''s lands', 'Keep them at court under watch']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('charlemagne', 5, 'lead-armies-in-old-age', 'In his seventies Charles still rode with his armies and shared their hardships. In his place, what would you have done?', array['Ride out with the army', 'Rule from Aachen', 'Send an heir in your name']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('richard-the-lionheart', 2, 'take-the-cross', 'Newly crowned, Richard heard the call for a crusade and left his kingdom for years. In his place, what would you have done?', array['Take the cross at once', 'Secure England first', 'Send money and knights, stay home']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('richard-the-lionheart', 4, 'pay-the-ransom', 'Richard sat in captivity while his brother seized land in England and France, and Eleanor raised a massive ransom. In her place, what would you have done?', array['Pay whatever they asked', 'Spend the money fighting John', 'Bargain and stall for terms']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('leonardo-da-vinci', 2, 'leave-florence-for-milan', 'Leonardo was one of Florence''s most promising artists, yet he wrote to a duke in another city offering to build weapons. In his place, what would you have done?', array['Go to Milan for a rich patron', 'Stay in Florence as a painter', 'Work alone without patronage']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('leonardo-da-vinci', 4, 'dissect-the-corpses', 'To paint the body correctly, Leonardo cut open corpses — controversial and dangerous work. In his place, would you have taken up the knife?', array['Dissect and learn the truth', 'Paint from the surface only', 'Study others'' anatomical drawings']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('galileo-galilei', 6, 'recant-before-the-inquisition', 'You are seventy, standing before the Inquisition, ordered to renounce what your own eyes have shown you. What do you say?', array['Recant and go home', 'Refuse and take the consequences', 'Recant, then keep writing in secret']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('galileo-galilei', 5, 'publish-the-dialogue', 'You have been warned by the Pope, and you hold a finished manuscript that clearly favours the Sun. What do you do with it?', array['Publish it', 'Burn it', 'Circulate it quietly among friends']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('catherine-the-great', 3, 'raise-the-army-against-peter', 'Her husband was Tsar, disliked by everyone who mattered, and she had officers willing to ride with her. In her place, what would you do?', array['Raise troops and take the throne', 'Wait and rule through her son', 'Remain the dutiful wife']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('catherine-the-great', 7, 'strengthen-or-loosen-serfdom', 'The wars needed the nobility''s money, and that money came from serfdom. In her place, what would you do?', array['Keep serfdom and fund the wars', 'Loosen it and risk the nobles', 'Give up the expansion']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('james-watt', 3, 'take-boultons-offer', 'You have a working model that quarters the fuel bill, but no capital and no factory. Boulton offers a partnership on his terms. What would you do?', array['Accept the partnership', 'Seek money elsewhere', 'Build the engines yourself']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('james-watt', 6, 'retire-from-the-works', 'Around 1800 Watt handed the business to his son and others. In his place, what would you have done?', array['Retire to experiments', 'Stay and run the works']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('florence-nightingale', 2, 'sail-for-scutari', 'The reports from the military hospitals were appalling, and she had a settled post in London. In her place, what would you do?', array['Sail for Scutari with the nurses', 'Stay and build the London hospital', 'Wait for the army to ask twice']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('florence-nightingale', 1, 'defy-the-family', 'Her family forbade nursing and expected an advantageous marriage. In her place, what would you do?', array['Pursue the training regardless', 'Accept the marriage and wait', 'Negotiate for charitable work instead']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('thomas-edison', 5, 'discredit-alternating-current', 'Faced with a rival system that worked better over distance, Edison staged public electrocutions to show the dangers of AC. In his place, what would you have done?', array['Attack AC in public', 'Compete on price and reliability', 'Adopt the rival system']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('thomas-edison', 3, 'leave-the-phonograph-behind', 'The phonograph had made Edison famous and wealthy overnight, and he turned straight to the light bulb. In his place, where would you have put the next years?', array['Perfect the phonograph', 'Chase the electric light', 'Sell the patents and rest']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('winston-churchill', 3, 'fight-on-alone', 'In May 1940, with France falling and invasion expected, Churchill refused any negotiation with Hitler. In his place, what would you have done?', array['Fight on alone', 'Explore terms', 'Wait for America first']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('winston-churchill', 4, 'accept-the-verdict', 'Voted out months after victory, Churchill took the post of Leader of the Opposition. In his place, what would you have done?', array['Stay and lead the opposition', 'Leave politics for writing', 'Demand another election']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('martin-luther-king-jr', 3, 'lead-the-boycott-under-threat', 'Threats against King''s life arrived while he was coordinating the Montgomery boycott from his own church. In his place, what would you do?', array['Lead the boycott openly', 'Let other ministers speak', 'Keep organizing in secret']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('martin-luther-king-jr', 7, 'speak-against-vietnam', 'Condemning the Vietnam War made King more controversial just as his moral standing was at its height. In his place, what would you do?', array['Speak against the war', 'Stay on civil rights alone', 'Raise it only in private']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('steve-jobs', 4, 'forced-out-of-apple', 'In 1985 Jobs was pushed out of the company he had founded. In his place, what would you have done?', array['Start a rival company', 'Wait for the board to call back', 'Leave the industry entirely']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('steve-jobs', 7, 'keep-working-through-illness', 'Diagnosed with cancer in 2004, Jobs stayed involved in every detail of Apple''s products. In his place, what would you have chosen?', array['Keep working as before', 'Hand the details to others', 'Step away completely']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('malala-yousafzai', 2, 'write-under-a-pseudonym', 'At twelve, Malala was offered the chance to describe Taliban rule for the BBC. In her place, what would you have done?', array['Write under a false name', 'Write openly under your own name', 'Stay silent and keep studying']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('malala-yousafzai', 4, 'speak-of-the-gunman', 'Recovering in hospital, Malala was asked about the man who shot her. In her place, what would you have said?', array['Speak of him with compassion', 'Demand he be punished', 'Refuse to discuss him']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('nelson-mandela', 5, 'learn-the-jailers-language', 'In prison Mandela learned Afrikaans, the language of the government that jailed him, and studied his guards. In his place, what would you have done?', array['Learn their language', 'Keep your distance', 'Speak only to fellow prisoners']::text[])
  on conflict (story_id, choice_point_id) do nothing;

insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values
  ('nelson-mandela', 6, 'punish-the-apartheid-leaders', 'After twenty-seven years in prison, Mandela refused to call for the punishment of apartheid''s leaders. In his place, what would you have demanded?', array['Forgiveness and a new constitution', 'Trials for those responsible', 'Removal from public life only']::text[])
  on conflict (story_id, choice_point_id) do nothing;
