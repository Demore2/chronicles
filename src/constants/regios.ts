import type { Regio } from '@/constants/types';

export const regios: Regio[] = [
  {
    id: 'nederland',
    naam: { en: 'Netherlands', nl: 'Nederland', fr: 'Pays-Bas', de: 'Niederlande' },
    continentId: 'europa',
    iso2: 'NL',
    actief: true,
  },
  {
    id: 'belgie',
    naam: { en: 'Belgium', nl: 'België', fr: 'Belgique', de: 'Belgien' },
    continentId: 'europa',
    iso2: 'BE',
    actief: false,
  },
  {
    id: 'duitsland',
    naam: { en: 'Germany', nl: 'Duitsland', fr: 'Allemagne', de: 'Deutschland' },
    continentId: 'europa',
    iso2: 'DE',
    actief: false,
  },
  {
    id: 'frankrijk',
    naam: { en: 'France', nl: 'Frankrijk', fr: 'France', de: 'Frankreich' },
    continentId: 'europa',
    iso2: 'FR',
    actief: false,
  },
];

export function getRegio(id: string): Regio | undefined {
  return regios.find((regio) => regio.id === id);
}

export function getRegioByIso2(iso2: string): Regio | undefined {
  return regios.find((regio) => regio.iso2 === iso2);
}
