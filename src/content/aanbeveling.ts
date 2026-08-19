import { verhalen } from '@/content/verhalen';
import type { Verhaal } from '@/constants/types';

/**
 * Welk verhaal we deze lezer voorstellen, en waarom.
 *
 * Puur afgeleid uit voortgang die al op het toestel staat, dus offline te beantwoorden en
 * altijd actueel. De tabel `public.story_recommendations` bewaart alleen de *uitkomst*
 * (zie `store/recommendation-store.ts`) — niet de redenering, want die zou dan op twee plekken
 * staan en uit elkaar lopen.
 *
 * ## Dezelfde keuze als de push-sweep, met opzet
 *
 * De server doet dit al een keer, in `push_kandidaten` (zie `supabase/README-push.md`): daar
 * bepalen de CTE's `voorkeur_tijdperk` en `aanbeveling` welk verhaal in "Spartacus wacht op je"
 * genoemd wordt. Deze twee functies volgen die volgorde regel voor regel — het meest gelezen
 * tijdperk (gelijkspel op tijdperk-id), dan een ongeopend verhaal daaruit op `volgorde`, dan op
 * id. Een lezer die 's avonds een melding over Ashoka krijgt en de app opent moet daar niet
 * ineens Joan of Arc aangeraden zien: dat leest als willekeur, en willekeur is precies wat een
 * aanbeveling niet mag zijn.
 *
 * Wijzigt de ene kant, wijzig dan de andere mee.
 */

/**
 * Waarom een verhaal wordt voorgesteld.
 *
 * Een slug en geen zin: de app toont dit in vier talen, dus de tekst hoort in i18n en alleen de
 * sleutel in de database. Een reden erbij betekent een sleutel erbij in `i18n/en.ts` — de
 * kolom `story_recommendations.reason` heeft bewust geen check-constraint, zodat een oudere
 * appversie geen sync-fout krijgt van een reden die zij nog niet kent.
 */
export const AANBEVELING_REDENEN = ['favorite_era', 'next_up', 'first_story'] as const;

export type AanbevelingReden = (typeof AANBEVELING_REDENEN)[number];

export function isAanbevelingReden(waarde: unknown): waarde is AanbevelingReden {
  return (
    typeof waarde === 'string' && (AANBEVELING_REDENEN as readonly string[]).includes(waarde)
  );
}

/**
 * De vorm van `story-progress-store.progress`, hier los overgetypt zodat deze module niets uit
 * de store hoeft te importeren. Content mag van voortgang afhangen als *invoer*; andersom zou
 * een importlus opleveren en deze functies onmogelijk maken om met verzonnen voortgang te
 * beproeven.
 */
export type Leesvoortgang = Record<string, { completedChapters: number[] }>;

/** Verhalen waarin ten minste één hoofdstuk is afgerond. */
function aangeraakteVerhalen(voortgang: Leesvoortgang): Set<string> {
  return new Set(
    Object.entries(voortgang)
      .filter(([, verhaal]) => verhaal.completedChapters.length > 0)
      .map(([verhaalId]) => verhaalId),
  );
}

/**
 * Het tijdperk waar deze lezer het vaakst in leest, of `null` als er nog niets gelezen is.
 *
 * **Telt verhalen, niet hoofdstukken** — net als de server. Wie acht hoofdstukken van één
 * Romeins verhaal las en één hoofdstuk van elk van drie middeleeuwse verhalen heeft niet de
 * Oudheid als voorkeur maar de Middeleeuwen: breedte zegt meer over smaak dan diepte, want
 * diepte is vooral een gevolg van waar je toevallig begon.
 *
 * Bij gelijkspel wint het alfabetisch eerste tijdperk-id. Niet omdat dat de mooiste keuze is,
 * maar omdat hij *dezelfde* is als die van `push_kandidaten` en als die van de vorige keer:
 * een aanbeveling die per meting wisselt tussen twee even populaire tijdperken maakt de lezer
 * wantrouwig over allebei.
 */
export function detectFavoriteEra(voortgang: Leesvoortgang): string | null {
  const gelezen = aangeraakteVerhalen(voortgang);
  if (gelezen.size === 0) return null;

  const perTijdperk = new Map<string, number>();
  for (const verhaal of verhalen) {
    if (!gelezen.has(verhaal.id)) continue;
    perTijdperk.set(verhaal.tijdperkId, (perTijdperk.get(verhaal.tijdperkId) ?? 0) + 1);
  }

  // Een verhaal-id in de voortgang dat niet (meer) in de bundel staat telt nergens mee; dan is
  // er wel voortgang maar geen tijdperk om op te wijzen.
  let favoriet: string | null = null;
  let hoogste = 0;
  for (const [tijdperkId, aantal] of perTijdperk) {
    if (aantal > hoogste || (aantal === hoogste && favoriet !== null && tijdperkId < favoriet)) {
      favoriet = tijdperkId;
      hoogste = aantal;
    }
  }

  return favoriet;
}

/**
 * Het eerstvolgende verhaal waar nog geen hoofdstuk van af is.
 *
 * `tijdperkId` is een *voorkeur*, geen filter: verhalen uit dat tijdperk komen eerst, maar als
 * ze allemaal al open zijn wijkt de suggestie uit naar de rest. Een lezer die zijn favoriete
 * tijdperk uitgelezen heeft mag geen lege aanbeveling krijgen als beloning.
 *
 * Binnen die twee groepen telt `volgorde` (ontbrekend = achteraan) en daarna het id, zodat twee
 * metingen op dezelfde stand hetzelfde verhaal opleveren.
 */
export function suggestUnreadStory(
  voortgang: Leesvoortgang,
  tijdperkId?: string | null,
): Verhaal | undefined {
  const gelezen = aangeraakteVerhalen(voortgang);

  return verhalen
    .filter((verhaal) => !gelezen.has(verhaal.id))
    .sort((a, b) => {
      if (tijdperkId) {
        const aBuiten = a.tijdperkId === tijdperkId ? 0 : 1;
        const bBuiten = b.tijdperkId === tijdperkId ? 0 : 1;
        if (aBuiten !== bBuiten) return aBuiten - bBuiten;
      }
      const aVolgorde = a.volgorde ?? Number.MAX_SAFE_INTEGER;
      const bVolgorde = b.volgorde ?? Number.MAX_SAFE_INTEGER;
      if (aVolgorde !== bVolgorde) return aVolgorde - bVolgorde;
      return a.id.localeCompare(b.id);
    })[0];
}

export type AanbevelingKeuze = {
  verhaalId: string;
  reden: AanbevelingReden;
};

/**
 * De twee functies hierboven achter elkaar: favoriet tijdperk → ongelezen verhaal → reden.
 *
 * `undefined` betekent "alles is al geopend" en niet "er ging iets mis". Dat is een geldige
 * eindtoestand met twintig verhalen in de bundel, en de aanroeper hoort er niets over te melden.
 */
export function bepaalAanbeveling(voortgang: Leesvoortgang): AanbevelingKeuze | undefined {
  const favoriet = detectFavoriteEra(voortgang);
  const verhaal = suggestUnreadStory(voortgang, favoriet);
  if (!verhaal) return undefined;

  const reden: AanbevelingReden =
    favoriet === null ? 'first_story' : verhaal.tijdperkId === favoriet ? 'favorite_era' : 'next_up';

  return { verhaalId: verhaal.id, reden };
}
