import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IoniconNaam = ComponentProps<typeof Ionicons>['name'];

export type TaalCode = 'en' | 'nl' | 'fr' | 'de';

// Een stukje zichtbare tekst per taal. 'en' is verplicht en dient als
// terugval wanneer een taal ontbreekt (bv. content die nog niet vertaald is).
export type VertaaldVeld = { en: string } & Partial<Record<Exclude<TaalCode, 'en'>, string>>;

export type Continent = {
  id: string;
  naam: VertaaldVeld;
  actief: boolean;
};

export type Regio = {
  id: string;
  naam: VertaaldVeld;
  continentId: string;
  iso2: string;
  actief: boolean;
};

export type Tijdperk = {
  id: string;
  nummer: number;
  titel: VertaaldVeld;
  periode: VertaaldVeld;
  korteBeschrijving: VertaaldVeld;
  kleur: string;
};

export type Blok =
  | { type: 'tekst'; inhoud: VertaaldVeld }
  | { type: 'afbeelding'; bron: string; alt: VertaaldVeld; bijschrift?: VertaaldVeld }
  | { type: 'citaat'; tekst: VertaaldVeld; bron: VertaaldVeld }
  | { type: 'quiz'; vraag: VertaaldVeld; antwoord: boolean; uitleg: VertaaldVeld };

export type Verhaal = {
  id: string;
  titel: VertaaldVeld;
  ondertitel: VertaaldVeld;
  teaser: VertaaldVeld;
  jaar: number;
  periodeLabel: string;
  regioIds: string[];
  tijdperkId: string;
  themas: string[];
  leestijdMinuten: number;
  blokken: Blok[];
};

export type Collectie = {
  id: string;
  titel: VertaaldVeld;
  label: VertaaldVeld;
  beschrijving: VertaaldVeld;
  kleur: string;
  icoonNaam: IoniconNaam;
  verhaalIds: string[];
};
