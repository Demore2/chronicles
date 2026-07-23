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
  /** Whether this era has enough content to show on Home yet (REFACTOR-PLAN.md R4 / open decision 4). */
  actief: boolean;
};

export type Blok =
  | { type: 'tekst'; inhoud: VertaaldVeld }
  | { type: 'afbeelding'; bron: string; alt: VertaaldVeld; bijschrift?: VertaaldVeld }
  | { type: 'citaat'; tekst: VertaaldVeld; bron: VertaaldVeld };

export type Chapter = {
  id: number;
  titel: VertaaldVeld;
  afbeelding?: string;
  blokken: Blok[];
};

export type Verhaal = {
  id: string;
  titel: VertaaldVeld;
  ondertitel: VertaaldVeld;
  teaser: VertaaldVeld;
  jaar: number;
  periodeLabel: string;
  /** Whether this story is about a person or an event (REFACTOR-PLAN.md R8). */
  soort: 'persoon' | 'gebeurtenis';
  /** Portrait/cover image source for the figure, used by the era-row card (REFACTOR-PLAN.md R4). Optional placeholder until AI-generated portraits exist (R8). */
  afbeelding?: string;
  /** Fallback hex color for the portrait card when afbeelding is absent (REFACTOR-PLAN.md R8). */
  portretKleur: string;
  /** Whether this story is eligible for the Home "uitgelicht" hero slot. */
  uitgelicht?: boolean;
  /** Display order within its tijdperk, e.g. for the ~5 figures shown on Home (REFACTOR-PLAN.md R4). */
  volgorde?: number;
  tijdperkId: string;
  themas: string[];
  leestijdMinuten: number;
  chapters: Chapter[];
  /** Character name for unlock system (REFACTOR-PLAN.md R8b). */
  personage: {
    naam: string;
  };
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
