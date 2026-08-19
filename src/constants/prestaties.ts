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
  /**
   * Wat hij waard is in punten.
   *
   * Punten zijn een *score*, geen munteenheid: er is niets voor te kopen en dat is met opzet zo.
   * Ze bestaan om veertien losse badges op te tellen tot één getal dat groeit, zodat "hoe ver ben
   * ik" ook te beantwoorden is zonder het raster te lezen. Ging er ooit iets mee te betalen, dan
   * moeten ze van dit toestel af en naar de server verhuizen — nu staan ze in de bundel en is een
   * gewijzigde waarde dus één app-update, niet een migratie.
   *
   * Deze waarden zijn gespiegeld in `public.achievements.reward_points`. Deze hier is leidend.
   */
  punten: number;
};

/**
 * De veertien mijlpalen, op volgorde van drempel binnen hun categorie.
 *
 * Bewust geen mijlpaal voor "alle verhalen uit": dat getal groeit met elke nieuwe reeks, en een
 * badge die je kwijtraakt omdat er content bij komt is erger dan geen badge. De hoogste drempels
 * hierboven (100 hoofdstukken, 100 dagen) zijn haalbaar en blijven staan.
 */
export const PRESTATIES = [
  { id: 'hoofdstuk-1', categorie: 'hoofdstukken', drempel: 1, icoon: 'book-outline', punten: 10 },
  { id: 'hoofdstuk-10', categorie: 'hoofdstukken', drempel: 10, icoon: 'book-outline', punten: 25 },
  { id: 'hoofdstuk-25', categorie: 'hoofdstukken', drempel: 25, icoon: 'library-outline', punten: 50 },
  { id: 'hoofdstuk-50', categorie: 'hoofdstukken', drempel: 50, icoon: 'library-outline', punten: 100 },
  { id: 'hoofdstuk-100', categorie: 'hoofdstukken', drempel: 100, icoon: 'ribbon-outline', punten: 250 },

  { id: 'verhaal-1', categorie: 'verhalen', drempel: 1, icoon: 'bookmark-outline', punten: 20 },
  { id: 'verhaal-5', categorie: 'verhalen', drempel: 5, icoon: 'bookmarks-outline', punten: 75 },
  { id: 'verhaal-10', categorie: 'verhalen', drempel: 10, icoon: 'bookmarks-outline', punten: 150 },

  { id: 'personage-3', categorie: 'personages', drempel: 3, icoon: 'people-outline', punten: 30 },
  { id: 'personage-10', categorie: 'personages', drempel: 10, icoon: 'people-circle-outline', punten: 100 },

  { id: 'streak-3', categorie: 'streak', drempel: 3, icoon: 'flame-outline', punten: 15 },
  { id: 'streak-7', categorie: 'streak', drempel: 7, icoon: 'flame-outline', punten: 40 },
  { id: 'streak-30', categorie: 'streak', drempel: 30, icoon: 'flame', punten: 150 },
  { id: 'streak-100', categorie: 'streak', drempel: 100, icoon: 'trophy-outline', punten: 500 },
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

/**
 * De punten van een verzameling behaalde mijlpalen bij elkaar.
 *
 * Neemt ids en niet de mijlpalen zelf, omdat de aanroepers een `Set<string>` hebben: het raster
 * heeft de behaalde ids, `achievement-store` heeft de ontgrendelde ids van de server. Een id die
 * niet (meer) bestaat telt voor nul in plaats van te gooien — zie `prestatieMet`.
 */
export function puntenVoor(ids: Iterable<string>): number {
  let totaal = 0;
  for (const id of ids) totaal += prestatieMet(id)?.punten ?? 0;
  return totaal;
}

/** Alle punten die er te verdienen zijn. De noemer onder `puntenVoor`. */
export const MAXIMALE_PUNTEN = PRESTATIES.reduce((som, prestatie) => som + prestatie.punten, 0);
