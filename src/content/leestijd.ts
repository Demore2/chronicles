// Leestijd-berekening op één plek (LAUNCH-PLAN.md B5).
//
// Was hiervoor gedupliceerd én fout: chapters.tsx las `blok.tekst` voor tekst-blokken (die zetten
// hun inhoud in `blok.inhoud`) en `blok.citaat` voor citaten (die heten `blok.tekst`), waardoor
// elke tegel "1 min read" toonde. `Verhaal.leestijdMinuten` in de content was los ingevuld en
// stond er ~3,5x naast. Beide gebruiken nu deze functies; scripts/recalculate-read-times.mjs
// schrijft de uitkomst terug naar de content-files.
import type { Blok, Chapter, VertaaldVeld } from '@/constants/types';

/** Gemiddelde leessnelheid; zelfde constante als in het oude chapters.tsx. */
export const WOORDEN_PER_MINUUT = 250;

/**
 * Resolver voor een VertaaldVeld — in de app is dit `v` uit `useVertaling()`, in
 * Node-scripts een `(veld) => veld.en`. Zo hoeft deze module zelf geen taal te kennen.
 */
export type VeldResolver = (veld: VertaaldVeld) => string;

function telWoorden(tekst: string): number {
  const schoon = tekst.trim();
  return schoon === '' ? 0 : schoon.split(/\s+/).length;
}

/** Woorden die de lezer daadwerkelijk op het scherm ziet. `alt` telt niet mee. */
export function telWoordenInBlok(blok: Blok, v: VeldResolver): number {
  switch (blok.type) {
    case 'tekst':
      return telWoorden(v(blok.inhoud));
    case 'citaat':
      return telWoorden(v(blok.tekst)) + telWoorden(v(blok.bron));
    case 'afbeelding':
      return blok.bijschrift ? telWoorden(v(blok.bijschrift)) : 0;
    case 'kop':
    case 'weetje':
    case 'sleutelmoment':
      // Het jaartal en het "Wist je dat"-label komen uit de i18n-laag, niet uit de content; hier
      // telt alleen wat de auteur zelf schrijft.
      return telWoorden(v(blok.tekst));
    default:
      return 0;
  }
}

export function telWoordenInBlokken(blokken: Blok[], v: VeldResolver): number {
  return blokken.reduce((totaal, blok) => totaal + telWoordenInBlok(blok, v), 0);
}

export function telWoordenInChapters(chapters: Chapter[], v: VeldResolver): number {
  return chapters.reduce((totaal, chapter) => totaal + telWoordenInBlokken(chapter.blokken, v), 0);
}

/** Leestijd van één hoofdstuk, minimaal 1 minuut. */
export function berekenLeestijdMinuten(blokken: Blok[], v: VeldResolver): number {
  return Math.max(1, Math.ceil(telWoordenInBlokken(blokken, v) / WOORDEN_PER_MINUUT));
}

/** Leestijd van een heel verhaal — de waarde die in `Verhaal.leestijdMinuten` hoort te staan. */
export function berekenVerhaalLeestijdMinuten(chapters: Chapter[], v: VeldResolver): number {
  return Math.max(1, Math.ceil(telWoordenInChapters(chapters, v) / WOORDEN_PER_MINUUT));
}
