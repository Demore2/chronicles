/**
 * Portrait images per verhaal-id (LAUNCH-PLAN.md B1).
 *
 * These are `require()`d from `assets/images/characters/`, so Metro bundles the bytes into the
 * app. Dat is het hele punt van B1: hiervoor stonden hier `via.placeholder.com`-stubs en in de
 * content-files verlopende `replicate.delivery`-URL's, die in een gepubliceerde build kapot zijn.
 * Een nieuw portret toevoegen = het bestand in `assets/images/characters/<verhaal-id>.webp`
 * zetten en hier een regel bijschrijven; het bestandsnaam-slug is altijd gelijk aan `Verhaal.id`.
 *
 * Relatieve paden (niet `@/assets/...`): assets worden door Metro opgelost, en een relatief pad
 * werkt daar altijd, onafhankelijk van tsconfig-path-resolutie.
 */

import type { ImageSourcePropType } from 'react-native';

const IMAGES = {
  // Oudheid
  'julius-caesar': require('../../assets/images/characters/julius-caesar.webp'),
  'spartacus': require('../../assets/images/characters/spartacus.webp'),
  'rome-rise': require('../../assets/images/characters/rome-rise.webp'),
  'pompeii-disaster': require('../../assets/images/characters/pompeii-disaster.webp'),

  // Middeleeuwen
  'joan-of-arc': require('../../assets/images/characters/joan-of-arc.webp'),
  'charlemagne': require('../../assets/images/characters/charlemagne.webp'),
  'richard-the-lionheart': require('../../assets/images/characters/richard-the-lionheart.webp'),

  // Vroegmoderne Tijd
  'leonardo-da-vinci': require('../../assets/images/characters/leonardo-da-vinci.webp'),
  'galileo-galilei': require('../../assets/images/characters/galileo-galilei.webp'),
  'catherine-the-great': require('../../assets/images/characters/catherine-the-great.webp'),

  // Industriele Revolutie
  'james-watt': require('../../assets/images/characters/james-watt.webp'),
  'florence-nightingale': require('../../assets/images/characters/florence-nightingale.webp'),
  'thomas-edison': require('../../assets/images/characters/thomas-edison.webp'),

  // Twintigste Eeuw
  'marie-curie': require('../../assets/images/characters/marie-curie.webp'),
  'winston-churchill': require('../../assets/images/characters/winston-churchill.webp'),
  'martin-luther-king-jr': require('../../assets/images/characters/martin-luther-king-jr.webp'),

  // Hedendaags
  'steve-jobs': require('../../assets/images/characters/steve-jobs.webp'),
  'malala-yousafzai': require('../../assets/images/characters/malala-yousafzai.webp'),
  'nelson-mandela': require('../../assets/images/characters/nelson-mandela.webp'),
};

/** De verhaal-id's waarvoor een portret in de bundel zit. */
export type PortretId = keyof typeof IMAGES;

export const CHARACTER_IMAGES: Record<PortretId, ImageSourcePropType> = IMAGES;
