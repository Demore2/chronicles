import type { Tijdperk } from '@/constants/types';

export const tijdperken: Tijdperk[] = [
  {
    id: 'oudheid',
    nummer: 1,
    titel: { en: 'Antiquity', nl: 'Oudheid', fr: 'Antiquité', de: 'Antike' },
    periode: {
      en: '3000 BC – 500 AD',
      nl: '3000 v.Chr. - 500',
      fr: '3000 av. J.-C. – 500',
      de: '3000 v. Chr. – 500',
    },
    korteBeschrijving: {
      en: 'The first empires, cities, and civilizations emerge.',
      nl: 'De eerste rijken, steden en beschavingen ontstaan.',
      fr: 'Les premiers empires, villes et civilisations voient le jour.',
      de: 'Die ersten Reiche, Städte und Zivilisationen entstehen.',
    },
    kleur: '#B8735A',
  },
  {
    id: 'middeleeuwen',
    nummer: 2,
    titel: { en: 'Middle Ages', nl: 'Middeleeuwen', fr: 'Moyen Âge', de: 'Mittelalter' },
    periode: { en: '500–1500', nl: '500-1500', fr: '500–1500', de: '500–1500' },
    korteBeschrijving: {
      en: 'Knights, monasteries, and the first cities with their own rights.',
      nl: 'Ridders, kloosters en de eerste steden met eigen rechten.',
      fr: 'Chevaliers, monastères et les premières villes dotées de droits propres.',
      de: 'Ritter, Klöster und die ersten Städte mit eigenen Rechten.',
    },
    kleur: '#8B4A52',
  },
  {
    id: 'vroegmoderne-tijd',
    nummer: 3,
    titel: { en: 'Early Modern Period', nl: 'Vroegmoderne Tijd', fr: 'Époque moderne', de: 'Frühe Neuzeit' },
    periode: { en: '1500–1800', nl: '1500-1800', fr: '1500–1800', de: '1500–1800' },
    korteBeschrijving: {
      en: 'Voyages of discovery, trade, and revolts against the powerful.',
      nl: 'Ontdekkingsreizen, handel en opstanden tegen de macht.',
      fr: 'Voyages de découverte, commerce et révoltes contre le pouvoir.',
      de: 'Entdeckungsreisen, Handel und Aufstände gegen die Macht.',
    },
    kleur: '#B8923F',
  },
  {
    id: 'industriele-revolutie',
    nummer: 4,
    titel: {
      en: 'Industrial Revolution',
      nl: 'Industriële Revolutie',
      fr: 'Révolution industrielle',
      de: 'Industrielle Revolution',
    },
    periode: { en: '1800–1900', nl: '1800-1900', fr: '1800–1900', de: '1800–1900' },
    korteBeschrijving: {
      en: 'Steam engines, new kingdoms, and rapid change.',
      nl: 'Stoommachines, nieuwe koninkrijken en snelle verandering.',
      fr: 'Machines à vapeur, nouveaux royaumes et changements rapides.',
      de: 'Dampfmaschinen, neue Königreiche und rascher Wandel.',
    },
    kleur: '#5B6B73',
  },
  {
    id: 'twintigste-eeuw',
    nummer: 5,
    titel: { en: '20th Century', nl: 'Twintigste Eeuw', fr: 'XXe siècle', de: '20. Jahrhundert' },
    periode: { en: '1900–2000', nl: '1900-2000', fr: '1900–2000', de: '1900–2000' },
    korteBeschrijving: {
      en: 'World wars, reconstruction, and a uniting Europe.',
      nl: 'Wereldoorlogen, wederopbouw en een verenigend Europa.',
      fr: "Guerres mondiales, reconstruction et une Europe qui s'unit.",
      de: 'Weltkriege, Wiederaufbau und ein sich einigendes Europa.',
    },
    kleur: '#5C7A5E',
  },
  {
    id: 'hedendaags',
    nummer: 6,
    titel: { en: 'Contemporary Era', nl: 'Hedendaags', fr: 'Époque contemporaine', de: 'Gegenwart' },
    periode: { en: '2000–present', nl: '2000-heden', fr: "2000–aujourd'hui", de: '2000–heute' },
    korteBeschrijving: {
      en: "Today's world, still being written.",
      nl: 'De wereld van vandaag, in wording.',
      fr: "Le monde d'aujourd'hui, encore en devenir.",
      de: 'Die Welt von heute, im Werden.',
    },
    kleur: '#5A6B8C',
  },
];

export function getTijdperk(id: string): Tijdperk | undefined {
  return tijdperken.find((tijdperk) => tijdperk.id === id);
}
