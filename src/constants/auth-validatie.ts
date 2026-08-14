/**
 * Formuliercontroles voor het inlog- en registratiescherm (R8.AUTH deel 2).
 *
 * Bewust los van de schermen: login en signup moeten dezelfde grens hanteren, anders keurt
 * het ene scherm een wachtwoord goed dat het andere afwijst. Dit is *geen* beveiliging —
 * Supabase controleert alles nog een keer aan zijn kant. Het is er om de gebruiker een
 * netwerkronde en een cryptische serverfout te besparen.
 */

/** Supabase weigert standaard alles korter dan 6 tekens; hier hetzelfde getal, meteen zichtbaar. */
export const MIN_WACHTWOORD_LENGTE = 6;

/** Boven deze lengte noemen we een wachtwoord sterk (zie `wachtwoordSterkte`). */
const STERK_VANAF_LENGTE = 10;

export type Wachtwoordsterkte = 'zwak' | 'gemiddeld' | 'sterk';

/**
 * Lengte is de enige maat die we gebruiken. Een meter die om een hoofdletter en een cijfer
 * vraagt levert vooral "Passw0rd!" op — langer is in de praktijk de betere raadgeving.
 */
export function wachtwoordSterkte(wachtwoord: string): Wachtwoordsterkte {
  if (wachtwoord.length < MIN_WACHTWOORD_LENGTE) return 'zwak';
  if (wachtwoord.length <= STERK_VANAF_LENGTE) return 'gemiddeld';
  return 'sterk';
}

/**
 * Grof e-mailfilter: iets, een @, iets, een punt, iets. Strenger willen zijn is een klassieke
 * val — geldige adressen sneuvelen op een regex die te veel wil. De echte controle is de
 * bevestigingsmail.
 */
export function isGeldigEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
