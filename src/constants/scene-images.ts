/**
 * Scènebeelden per hoofdstuk (LAUNCH-PLAN.md B2).
 *
 * De sleutel is altijd `<verhaal-id>-<hoofdstuk-id>` en het bestand heet exact zo:
 * `assets/images/scenes/<verhaal-id>-<hoofdstuk-id>.webp`. Net als bij `character-images.ts`
 * worden ze `require()`d zodat Metro de bytes meebundelt — een gepubliceerde build mag niet van
 * een verlopende `replicate.delivery`-URL afhangen.
 *
 * Bewust expliciet en niet `require.context`: een ontbrekend bestand hoort een build-fout te
 * geven, geen leeg vlak in het hoofdstuk.
 *
 * Elk beeld wordt op twee plekken gebruikt: als `Chapter.afbeelding` (thumbnail op de
 * hoofdstuktegel) en als `{ type: 'afbeelding' }`-blok in het hoofdstuk zelf.
 *
 * Genereren: `npm run generate:images:scenes` (zie scripts/generate-scene-images.mjs voor de
 * prompts). Alle 20 verhalen × 8 hoofdstukken = 160 beelden; de Oudheid kwam in B2 (Fase 5), de
 * overige 15 verhalen in B2b (Fase 6.5), en Ashoka sloot als laatste aan.
 */

import type { ImageSourcePropType } from 'react-native';

const IMAGES = {
  // Oudheid — Julius Caesar
  'julius-caesar-1': require('../../assets/images/scenes/julius-caesar-1.webp'),
  'julius-caesar-2': require('../../assets/images/scenes/julius-caesar-2.webp'),
  'julius-caesar-3': require('../../assets/images/scenes/julius-caesar-3.webp'),
  'julius-caesar-4': require('../../assets/images/scenes/julius-caesar-4.webp'),
  'julius-caesar-5': require('../../assets/images/scenes/julius-caesar-5.webp'),
  'julius-caesar-6': require('../../assets/images/scenes/julius-caesar-6.webp'),
  'julius-caesar-7': require('../../assets/images/scenes/julius-caesar-7.webp'),
  'julius-caesar-8': require('../../assets/images/scenes/julius-caesar-8.webp'),

  // Oudheid — Spartacus
  'spartacus-1': require('../../assets/images/scenes/spartacus-1.webp'),
  'spartacus-2': require('../../assets/images/scenes/spartacus-2.webp'),
  'spartacus-3': require('../../assets/images/scenes/spartacus-3.webp'),
  'spartacus-4': require('../../assets/images/scenes/spartacus-4.webp'),
  'spartacus-5': require('../../assets/images/scenes/spartacus-5.webp'),
  'spartacus-6': require('../../assets/images/scenes/spartacus-6.webp'),
  'spartacus-7': require('../../assets/images/scenes/spartacus-7.webp'),
  'spartacus-8': require('../../assets/images/scenes/spartacus-8.webp'),

  // Oudheid — Rome's Rise
  'rome-rise-1': require('../../assets/images/scenes/rome-rise-1.webp'),
  'rome-rise-2': require('../../assets/images/scenes/rome-rise-2.webp'),
  'rome-rise-3': require('../../assets/images/scenes/rome-rise-3.webp'),
  'rome-rise-4': require('../../assets/images/scenes/rome-rise-4.webp'),
  'rome-rise-5': require('../../assets/images/scenes/rome-rise-5.webp'),
  'rome-rise-6': require('../../assets/images/scenes/rome-rise-6.webp'),
  'rome-rise-7': require('../../assets/images/scenes/rome-rise-7.webp'),
  'rome-rise-8': require('../../assets/images/scenes/rome-rise-8.webp'),

  // Oudheid — Pompeii Disaster
  'pompeii-disaster-1': require('../../assets/images/scenes/pompeii-disaster-1.webp'),
  'pompeii-disaster-2': require('../../assets/images/scenes/pompeii-disaster-2.webp'),
  'pompeii-disaster-3': require('../../assets/images/scenes/pompeii-disaster-3.webp'),
  'pompeii-disaster-4': require('../../assets/images/scenes/pompeii-disaster-4.webp'),
  'pompeii-disaster-5': require('../../assets/images/scenes/pompeii-disaster-5.webp'),
  'pompeii-disaster-6': require('../../assets/images/scenes/pompeii-disaster-6.webp'),
  'pompeii-disaster-7': require('../../assets/images/scenes/pompeii-disaster-7.webp'),
  'pompeii-disaster-8': require('../../assets/images/scenes/pompeii-disaster-8.webp'),

  // Oudheid — Ashoka
  'ashoka-maurya-1': require('../../assets/images/scenes/ashoka-maurya-1.webp'),
  'ashoka-maurya-2': require('../../assets/images/scenes/ashoka-maurya-2.webp'),
  'ashoka-maurya-3': require('../../assets/images/scenes/ashoka-maurya-3.webp'),
  'ashoka-maurya-4': require('../../assets/images/scenes/ashoka-maurya-4.webp'),
  'ashoka-maurya-5': require('../../assets/images/scenes/ashoka-maurya-5.webp'),
  'ashoka-maurya-6': require('../../assets/images/scenes/ashoka-maurya-6.webp'),
  'ashoka-maurya-7': require('../../assets/images/scenes/ashoka-maurya-7.webp'),
  'ashoka-maurya-8': require('../../assets/images/scenes/ashoka-maurya-8.webp'),

  // Middeleeuwen — Joan of Arc
  'joan-of-arc-1': require('../../assets/images/scenes/joan-of-arc-1.webp'),
  'joan-of-arc-2': require('../../assets/images/scenes/joan-of-arc-2.webp'),
  'joan-of-arc-3': require('../../assets/images/scenes/joan-of-arc-3.webp'),
  'joan-of-arc-4': require('../../assets/images/scenes/joan-of-arc-4.webp'),
  'joan-of-arc-5': require('../../assets/images/scenes/joan-of-arc-5.webp'),
  'joan-of-arc-6': require('../../assets/images/scenes/joan-of-arc-6.webp'),
  'joan-of-arc-7': require('../../assets/images/scenes/joan-of-arc-7.webp'),
  'joan-of-arc-8': require('../../assets/images/scenes/joan-of-arc-8.webp'),

  // Middeleeuwen — Charlemagne
  'charlemagne-1': require('../../assets/images/scenes/charlemagne-1.webp'),
  'charlemagne-2': require('../../assets/images/scenes/charlemagne-2.webp'),
  'charlemagne-3': require('../../assets/images/scenes/charlemagne-3.webp'),
  'charlemagne-4': require('../../assets/images/scenes/charlemagne-4.webp'),
  'charlemagne-5': require('../../assets/images/scenes/charlemagne-5.webp'),
  'charlemagne-6': require('../../assets/images/scenes/charlemagne-6.webp'),
  'charlemagne-7': require('../../assets/images/scenes/charlemagne-7.webp'),
  'charlemagne-8': require('../../assets/images/scenes/charlemagne-8.webp'),

  // Middeleeuwen — Richard the Lionheart
  'richard-the-lionheart-1': require('../../assets/images/scenes/richard-the-lionheart-1.webp'),
  'richard-the-lionheart-2': require('../../assets/images/scenes/richard-the-lionheart-2.webp'),
  'richard-the-lionheart-3': require('../../assets/images/scenes/richard-the-lionheart-3.webp'),
  'richard-the-lionheart-4': require('../../assets/images/scenes/richard-the-lionheart-4.webp'),
  'richard-the-lionheart-5': require('../../assets/images/scenes/richard-the-lionheart-5.webp'),
  'richard-the-lionheart-6': require('../../assets/images/scenes/richard-the-lionheart-6.webp'),
  'richard-the-lionheart-7': require('../../assets/images/scenes/richard-the-lionheart-7.webp'),
  'richard-the-lionheart-8': require('../../assets/images/scenes/richard-the-lionheart-8.webp'),

  // Vroegmoderne tijd — Leonardo da Vinci
  'leonardo-da-vinci-1': require('../../assets/images/scenes/leonardo-da-vinci-1.webp'),
  'leonardo-da-vinci-2': require('../../assets/images/scenes/leonardo-da-vinci-2.webp'),
  'leonardo-da-vinci-3': require('../../assets/images/scenes/leonardo-da-vinci-3.webp'),
  'leonardo-da-vinci-4': require('../../assets/images/scenes/leonardo-da-vinci-4.webp'),
  'leonardo-da-vinci-5': require('../../assets/images/scenes/leonardo-da-vinci-5.webp'),
  'leonardo-da-vinci-6': require('../../assets/images/scenes/leonardo-da-vinci-6.webp'),
  'leonardo-da-vinci-7': require('../../assets/images/scenes/leonardo-da-vinci-7.webp'),
  'leonardo-da-vinci-8': require('../../assets/images/scenes/leonardo-da-vinci-8.webp'),

  // Vroegmoderne tijd — Galileo Galilei
  'galileo-galilei-1': require('../../assets/images/scenes/galileo-galilei-1.webp'),
  'galileo-galilei-2': require('../../assets/images/scenes/galileo-galilei-2.webp'),
  'galileo-galilei-3': require('../../assets/images/scenes/galileo-galilei-3.webp'),
  'galileo-galilei-4': require('../../assets/images/scenes/galileo-galilei-4.webp'),
  'galileo-galilei-5': require('../../assets/images/scenes/galileo-galilei-5.webp'),
  'galileo-galilei-6': require('../../assets/images/scenes/galileo-galilei-6.webp'),
  'galileo-galilei-7': require('../../assets/images/scenes/galileo-galilei-7.webp'),
  'galileo-galilei-8': require('../../assets/images/scenes/galileo-galilei-8.webp'),

  // Vroegmoderne tijd — Catherine the Great
  'catherine-the-great-1': require('../../assets/images/scenes/catherine-the-great-1.webp'),
  'catherine-the-great-2': require('../../assets/images/scenes/catherine-the-great-2.webp'),
  'catherine-the-great-3': require('../../assets/images/scenes/catherine-the-great-3.webp'),
  'catherine-the-great-4': require('../../assets/images/scenes/catherine-the-great-4.webp'),
  'catherine-the-great-5': require('../../assets/images/scenes/catherine-the-great-5.webp'),
  'catherine-the-great-6': require('../../assets/images/scenes/catherine-the-great-6.webp'),
  'catherine-the-great-7': require('../../assets/images/scenes/catherine-the-great-7.webp'),
  'catherine-the-great-8': require('../../assets/images/scenes/catherine-the-great-8.webp'),

  // Industriële revolutie — James Watt
  'james-watt-1': require('../../assets/images/scenes/james-watt-1.webp'),
  'james-watt-2': require('../../assets/images/scenes/james-watt-2.webp'),
  'james-watt-3': require('../../assets/images/scenes/james-watt-3.webp'),
  'james-watt-4': require('../../assets/images/scenes/james-watt-4.webp'),
  'james-watt-5': require('../../assets/images/scenes/james-watt-5.webp'),
  'james-watt-6': require('../../assets/images/scenes/james-watt-6.webp'),
  'james-watt-7': require('../../assets/images/scenes/james-watt-7.webp'),
  'james-watt-8': require('../../assets/images/scenes/james-watt-8.webp'),

  // Industriële revolutie — Florence Nightingale
  'florence-nightingale-1': require('../../assets/images/scenes/florence-nightingale-1.webp'),
  'florence-nightingale-2': require('../../assets/images/scenes/florence-nightingale-2.webp'),
  'florence-nightingale-3': require('../../assets/images/scenes/florence-nightingale-3.webp'),
  'florence-nightingale-4': require('../../assets/images/scenes/florence-nightingale-4.webp'),
  'florence-nightingale-5': require('../../assets/images/scenes/florence-nightingale-5.webp'),
  'florence-nightingale-6': require('../../assets/images/scenes/florence-nightingale-6.webp'),
  'florence-nightingale-7': require('../../assets/images/scenes/florence-nightingale-7.webp'),
  'florence-nightingale-8': require('../../assets/images/scenes/florence-nightingale-8.webp'),

  // Industriële revolutie — Thomas Edison
  'thomas-edison-1': require('../../assets/images/scenes/thomas-edison-1.webp'),
  'thomas-edison-2': require('../../assets/images/scenes/thomas-edison-2.webp'),
  'thomas-edison-3': require('../../assets/images/scenes/thomas-edison-3.webp'),
  'thomas-edison-4': require('../../assets/images/scenes/thomas-edison-4.webp'),
  'thomas-edison-5': require('../../assets/images/scenes/thomas-edison-5.webp'),
  'thomas-edison-6': require('../../assets/images/scenes/thomas-edison-6.webp'),
  'thomas-edison-7': require('../../assets/images/scenes/thomas-edison-7.webp'),
  'thomas-edison-8': require('../../assets/images/scenes/thomas-edison-8.webp'),

  // Twintigste eeuw — Marie Curie
  'marie-curie-1': require('../../assets/images/scenes/marie-curie-1.webp'),
  'marie-curie-2': require('../../assets/images/scenes/marie-curie-2.webp'),
  'marie-curie-3': require('../../assets/images/scenes/marie-curie-3.webp'),
  'marie-curie-4': require('../../assets/images/scenes/marie-curie-4.webp'),
  'marie-curie-5': require('../../assets/images/scenes/marie-curie-5.webp'),
  'marie-curie-6': require('../../assets/images/scenes/marie-curie-6.webp'),
  'marie-curie-7': require('../../assets/images/scenes/marie-curie-7.webp'),
  'marie-curie-8': require('../../assets/images/scenes/marie-curie-8.webp'),

  // Twintigste eeuw — Winston Churchill
  'winston-churchill-1': require('../../assets/images/scenes/winston-churchill-1.webp'),
  'winston-churchill-2': require('../../assets/images/scenes/winston-churchill-2.webp'),
  'winston-churchill-3': require('../../assets/images/scenes/winston-churchill-3.webp'),
  'winston-churchill-4': require('../../assets/images/scenes/winston-churchill-4.webp'),
  'winston-churchill-5': require('../../assets/images/scenes/winston-churchill-5.webp'),
  'winston-churchill-6': require('../../assets/images/scenes/winston-churchill-6.webp'),
  'winston-churchill-7': require('../../assets/images/scenes/winston-churchill-7.webp'),
  'winston-churchill-8': require('../../assets/images/scenes/winston-churchill-8.webp'),

  // Twintigste eeuw — Martin Luther King Jr.
  'martin-luther-king-jr-1': require('../../assets/images/scenes/martin-luther-king-jr-1.webp'),
  'martin-luther-king-jr-2': require('../../assets/images/scenes/martin-luther-king-jr-2.webp'),
  'martin-luther-king-jr-3': require('../../assets/images/scenes/martin-luther-king-jr-3.webp'),
  'martin-luther-king-jr-4': require('../../assets/images/scenes/martin-luther-king-jr-4.webp'),
  'martin-luther-king-jr-5': require('../../assets/images/scenes/martin-luther-king-jr-5.webp'),
  'martin-luther-king-jr-6': require('../../assets/images/scenes/martin-luther-king-jr-6.webp'),
  'martin-luther-king-jr-7': require('../../assets/images/scenes/martin-luther-king-jr-7.webp'),
  'martin-luther-king-jr-8': require('../../assets/images/scenes/martin-luther-king-jr-8.webp'),

  // Hedendaags — Steve Jobs
  'steve-jobs-1': require('../../assets/images/scenes/steve-jobs-1.webp'),
  'steve-jobs-2': require('../../assets/images/scenes/steve-jobs-2.webp'),
  'steve-jobs-3': require('../../assets/images/scenes/steve-jobs-3.webp'),
  'steve-jobs-4': require('../../assets/images/scenes/steve-jobs-4.webp'),
  'steve-jobs-5': require('../../assets/images/scenes/steve-jobs-5.webp'),
  'steve-jobs-6': require('../../assets/images/scenes/steve-jobs-6.webp'),
  'steve-jobs-7': require('../../assets/images/scenes/steve-jobs-7.webp'),
  'steve-jobs-8': require('../../assets/images/scenes/steve-jobs-8.webp'),

  // Hedendaags — Malala Yousafzai
  'malala-yousafzai-1': require('../../assets/images/scenes/malala-yousafzai-1.webp'),
  'malala-yousafzai-2': require('../../assets/images/scenes/malala-yousafzai-2.webp'),
  'malala-yousafzai-3': require('../../assets/images/scenes/malala-yousafzai-3.webp'),
  'malala-yousafzai-4': require('../../assets/images/scenes/malala-yousafzai-4.webp'),
  'malala-yousafzai-5': require('../../assets/images/scenes/malala-yousafzai-5.webp'),
  'malala-yousafzai-6': require('../../assets/images/scenes/malala-yousafzai-6.webp'),
  'malala-yousafzai-7': require('../../assets/images/scenes/malala-yousafzai-7.webp'),
  'malala-yousafzai-8': require('../../assets/images/scenes/malala-yousafzai-8.webp'),

  // Hedendaags — Nelson Mandela
  'nelson-mandela-1': require('../../assets/images/scenes/nelson-mandela-1.webp'),
  'nelson-mandela-2': require('../../assets/images/scenes/nelson-mandela-2.webp'),
  'nelson-mandela-3': require('../../assets/images/scenes/nelson-mandela-3.webp'),
  'nelson-mandela-4': require('../../assets/images/scenes/nelson-mandela-4.webp'),
  'nelson-mandela-5': require('../../assets/images/scenes/nelson-mandela-5.webp'),
  'nelson-mandela-6': require('../../assets/images/scenes/nelson-mandela-6.webp'),
  'nelson-mandela-7': require('../../assets/images/scenes/nelson-mandela-7.webp'),
  'nelson-mandela-8': require('../../assets/images/scenes/nelson-mandela-8.webp'),
};

/** De `<verhaal-id>-<hoofdstuk-id>`-sleutels waarvoor een scènebeeld in de bundel zit. */
export type SceneId = keyof typeof IMAGES;

export const SCENE_IMAGES: Record<SceneId, ImageSourcePropType> = IMAGES;
