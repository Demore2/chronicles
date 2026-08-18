import type { IoniconNaam } from '@/constants/types';

/**
 * Mijlpalen — de "achievements" uit het pushplan.
 *
 * **Ze worden afgeleid, niet bijgehouden.** Er is geen tabel, geen teller en geen extra sync: een
 * mijlpaal is een uitspraak over voortgang die de app al heeft (afgeronde hoofdstukken,
 * uitgelezen verhalen, ontgrendelde personages, de streak), en die voortgang staat al in drie
 * stores die naar Supabase gaan. Een vierde plek die hetzelfde nog eens opschrijft kan alleen maar
 * gaan afwijken — en dan zie je op je tweede toestel een badge die je op je eerste niet hebt.
 *
 * Wat wél wordt opgeslagen is uitsluitend **welke mijlpaal al is aangekondigd**
 * (`prestatie-store.ts`), zodat dezelfde melding niet elke keer opnieuw verschijnt.
 *
 * De namen staan in i18n (`prestatie.namen`), de uitleg wordt per categorie samengesteld
 * (`prestatie.uitleg`). Dat scheelt 56 vertaalde zinnen: de naam is het leuke deel en dat is per
 * mijlpaal geschreven, "10 hoofdstukken uitgelezen" is een invuloefening en dat is één functie.
 */

/** Waar een mijlpaal over gaat. Bepaalt welke teller ertegen wordt gelegd. */
export type PrestatieCategorie = 'hoofdstukken' | 'verhalen' | 'personages' | 'streak';

export type Prestatie = {
  /** Stabiel: dit staat in AsyncStorage en in de analytics-parameter. Nooit hernoemen. */
  id: string;
  categorie: PrestatieCategorie;
  /** Vanaf welke stand hij behaald is. */
  drempel: number;
  icoon: IoniconNaam;
};

/**
 * De veertien mijlpalen, op volgorde van drempel binnen hun categorie.
 *
 * Bewust geen mijlpaal voor "alle verhalen uit": dat getal groeit met elke nieuwe reeks, en een
 * badge die je kwijtraakt omdat er content bij komt is erger dan geen badge. De hoogste drempels
 * hierboven (100 hoofdstukken, 100 dagen) zijn haalbaar en blijven staan.
 */
export const PRESTATIES = [
  { id: 'hoofdstuk-1', categorie: 'hoofdstukken', drempel: 1, icoon: 'book-outline' },
  { id: 'hoofdstuk-10', categorie: 'hoofdstukken', drempel: 10, icoon: 'book-outline' },
  { id: 'hoofdstuk-25', categorie: 'hoofdstukken', drempel: 25, icoon: 'library-outline' },
  { id: 'hoofdstuk-50', categorie: 'hoofdstukken', drempel: 50, icoon: 'library-outline' },
  { id: 'hoofdstuk-100', categorie: 'hoofdstukken', drempel: 100, icoon: 'ribbon-outline' },

  { id: 'verhaal-1', categorie: 'verhalen', drempel: 1, icoon: 'bookmark-outline' },
  { id: 'verhaal-5', categorie: 'verhalen', drempel: 5, icoon: 'bookmarks-outline' },
  { id: 'verhaal-10', categorie: 'verhalen', drempel: 10, icoon: 'bookmarks-outline' },

  { id: 'personage-3', categorie: 'personages', drempel: 3, icoon: 'people-outline' },
  { id: 'personage-10', categorie: 'personages', drempel: 10, icoon: 'people-circle-outline' },

  { id: 'streak-3', categorie: 'streak', drempel: 3, icoon: 'flame-outline' },
  { id: 'streak-7', categorie: 'streak', drempel: 7, icoon: 'flame-outline' },
  { id: 'streak-30', categorie: 'streak', drempel: 30, icoon: 'flame' },
  { id: 'streak-100', categorie: 'streak', drempel: 100, icoon: 'trophy-outline' },
] as const satisfies readonly Prestatie[];

/**
 * Eén mijlpaal zoals hij in `PRESTATIES` staat — mét zijn letterlijke id, in plaats van de
 * verbrede `Prestatie` hierboven. De functies in dit bestand geven dít type terug, zodat een id
 * dat er uit komt overal een `PrestatieId` blijft en niet stilletjes `string` wordt.
 */
export type PrestatieItem = (typeof PRESTATIES)[number];

/**
 * De ids als union in plaats van als `string`.
 *
 * Daarmee is `prestatie.namen` in i18n een `Record<PrestatieId, string>`: een mijlpaal toevoegen
 * zonder naam is dan een compileerfout in plaats van een badge die "streak-30" heet.
 */
export type PrestatieId = PrestatieItem['id'];

/** De tellers waar de mijlpalen tegenaan worden gelegd. Eén object, zodat er niets kan schuiven. */
export type PrestatieStand = Record<PrestatieCategorie, number>;

export function prestatieMet(id: string): PrestatieItem | undefined {
  return PRESTATIES.find((prestatie) => prestatie.id === id);
}

/** Is dit een bestaande mijlpaal-id? Voor waarden die uit opslag of een melding komen. */
export function isPrestatieId(id: string): id is PrestatieId {
  return PRESTATIES.some((prestatie) => prestatie.id === id);
}

/**
 * Welke mijlpalen zijn bij deze stand behaald? Zuivere functie, zonder store en zonder datum —
 * daardoor is hij in een `useMemo` te draaien en met de hand na te rekenen.
 */
export function behaaldePrestaties(stand: PrestatieStand): PrestatieItem[] {
  return PRESTATIES.filter((prestatie) => stand[prestatie.categorie] >= prestatie.drempel);
}

/**
 * De eerstvolgende mijlpaal binnen een categorie, of `undefined` als ze allemaal binnen zijn.
 * Gebruikt door het raster op Profiel om te laten zien waar je naartoe werkt.
 */
export function volgendePrestatie(
  stand: PrestatieStand,
  categorie: PrestatieCategorie
): PrestatieItem | undefined {
  return PRESTATIES.find(
    (prestatie) => prestatie.categorie === categorie && stand[prestatie.categorie] < prestatie.drempel
  );
}
