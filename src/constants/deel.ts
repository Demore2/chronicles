import { Platform, Share } from 'react-native';

/**
 * Iets delen via het deelvenster van het toestel.
 *
 * Zelfde afspraak als `haptics.ts` en `dialoog.ts`: een bedoeling, geen platform-API, en niets
 * dat kan gooien. Een toestel zonder deelvenster (of een browser zonder `navigator.share`) moet
 * hoogstens minder kunnen, nooit een scherm laten klappen.
 *
 * **Op web is `Share` uit react-native niet te vertrouwen** — react-native-web implementeert hem
 * niet in elke versie, en waar hij bestaat is het een dunne laag over `navigator.share`, die
 * alleen in een beveiligde context en na een echte tik werkt. Daarom hier drie trappen:
 * `navigator.share` → klembord → "hier kan het niet". De aanroeper hoort op alle drie een ander
 * antwoord te geven, want "gekopieerd" is iets anders dan "gedeeld" en geen van beide is een fout.
 */

export type DeelResultaat =
  /** Het deelvenster is geopend en de lezer heeft het afgerond. */
  | 'gedeeld'
  /** Geen deelvenster, maar de tekst staat op het klembord. */
  | 'gekopieerd'
  /** De lezer heeft het deelvenster weggeklikt. Geen fout — en geen reden om iets te markeren. */
  | 'afgebroken'
  /** Hier kan het niet. */
  | 'niet-mogelijk';

type Navigatie = Navigator & {
  share?: (data: { title?: string; text?: string }) => Promise<void>;
  canShare?: (data: { title?: string; text?: string }) => boolean;
};

async function deelOpWeb(titel: string, bericht: string): Promise<DeelResultaat> {
  if (typeof navigator === 'undefined') return 'niet-mogelijk';
  const nav = navigator as Navigatie;

  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: titel, text: bericht });
      return 'gedeeld';
    } catch {
      // `AbortError` (weggeklikt) en een geweigerde permissie zijn hier niet te onderscheiden
      // zonder op de foutnaam te gokken. Doorvallen naar het klembord is in beide gevallen het
      // vriendelijkste antwoord.
    }
  }

  try {
    await nav.clipboard?.writeText(bericht);
    return nav.clipboard ? 'gekopieerd' : 'niet-mogelijk';
  } catch {
    return 'niet-mogelijk';
  }
}

export async function deel(titel: string, bericht: string): Promise<DeelResultaat> {
  if (Platform.OS === 'web') return deelOpWeb(titel, bericht);

  try {
    // `Share` bestaat op native altijd, maar een oude of uitgeklede runtime is geen reden om te
    // gooien in een functie die belooft dat niet te doen.
    if (!Share?.share) return 'niet-mogelijk';

    // `title` wordt op Android alleen gebruikt als venstertitel; de tekst die daadwerkelijk
    // verstuurd wordt is `message`. Daarom staat alles wat de ontvanger moet zien in `message`.
    const resultaat = await Share.share({ message: bericht, title: titel }, { dialogTitle: titel });
    return resultaat.action === Share.dismissedAction ? 'afgebroken' : 'gedeeld';
  } catch {
    return 'niet-mogelijk';
  }
}
