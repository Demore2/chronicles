import * as Clipboard from 'expo-clipboard';
import { Linking, Platform, Share } from 'react-native';

import { APP_DEEL_LINK } from '@/constants/app-info';

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

// ---------------------------------------------------------------------------------------------
// Delen naar één bestemming (sociaal delen)
//
// `deel()` hierboven opent het deelvenster van het toestel en laat de lezer kiezen. Wat hieronder
// staat slaat die keuze over: één knop voor WhatsApp, één om te kopiëren. Dezelfde afspraak —
// intents, geen platform-API's, en niets dat kan gooien.
// ---------------------------------------------------------------------------------------------

/**
 * Zet tekst op het klembord.
 *
 * `expo-clipboard` en niet `Clipboard` uit react-native: die laatste bestaat in 0.86 nog wel,
 * maar zijn getter logt bij élke aanraking een deprecatiewaarschuwing en verdwijnt in een
 * volgende versie. `expo-clipboard` heeft bovendien een echte webimplementatie
 * (`navigator.clipboard`), zodat de browserpreview van dit project hetzelfde doet als het
 * toestel.
 *
 * **Native module**: na het pullen hiervan is een JS-reload niet genoeg, de dev client moet
 * opnieuw gebouwd worden.
 */
export async function kopieer(tekst: string): Promise<boolean> {
  try {
    return await Clipboard.setStringAsync(tekst);
  } catch {
    // Een browser zonder klembordrechten (of een niet-beveiligde context) weigert hier. Dat is
    // geen reden om een scherm te laten klappen; de aanroeper toont "hier kan het niet".
    return false;
  }
}

/**
 * Opent WhatsApp met het bericht al ingevuld.
 *
 * Twee trappen, en de volgorde is niet willekeurig:
 *
 * 1. **`whatsapp://send?text=…`** — het app-schema. Staat WhatsApp geïnstalleerd, dan opent het
 *    meteen de gesprekkiezer. `Linking.openURL` doet een `startActivity`, en dát valt níét onder
 *    de package-visibility-beperking van Android 11+ — alleen `canOpenURL` doet dat. Vandaar dat
 *    hier bewust geen `canOpenURL` staat: die zou zonder een `<queries>`-blok in de manifest
 *    altijd `false` teruggeven en de knop op elk modern toestel doodleggen.
 * 2. **`https://wa.me/?text=…`** — de universele link. WhatsApp vangt hem af als hij er is; is
 *    hij er niet, dan opent de browser een pagina die uitlegt wat WhatsApp is. Dat is een eerlijk
 *    antwoord op een knop waar "WhatsApp" op staat.
 *
 * Op web slaan we stap 1 over: een custom schema laat de browser daar met een foutmelding of een
 * lege tab achter, terwijl `wa.me` gewoon werkt.
 */
export async function deelViaWhatsApp(bericht: string): Promise<DeelResultaat> {
  const tekst = encodeURIComponent(bericht);

  if (Platform.OS !== 'web') {
    try {
      await Linking.openURL(`whatsapp://send?text=${tekst}`);
      return 'gedeeld';
    } catch {
      // WhatsApp staat er niet. Doorvallen naar de universele link.
    }
  }

  try {
    await Linking.openURL(`https://wa.me/?text=${tekst}`);
    return 'gedeeld';
  } catch {
    return 'niet-mogelijk';
  }
}

/**
 * Plakt de app-link achter een deelbericht.
 *
 * Eén plek waar dat gebeurt, voor alle drie de soorten bericht (mijlpaal, citaat, uitnodiging).
 * De losse zinnen staan in i18n, zodat elke taal zijn eigen woordvolgorde kiest; alleen dit
 * laatste stukje is voor elke taal hetzelfde en mag daarom nergens vergeten worden.
 */
export function deelBerichtMetLink(kern: string): string {
  return `${kern} ${APP_DEEL_LINK}`;
}

/**
 * "Deel als link": de tekst mét de app-link erachter, naar het deelvenster of anders het klembord.
 *
 * Het onderscheid met `deel()` is dat dit altijd íets achterlaat waar de lezer verder mee kan.
 * Sluit hij het deelvenster, dan staat de link alsnog op zijn klembord — bij een uitnodiging is
 * dat het verschil tussen "later plakken" en opnieuw beginnen.
 */
export async function deelAlsLink(titel: string, bericht: string): Promise<DeelResultaat> {
  const resultaat = await deel(titel, bericht);
  if (resultaat === 'gedeeld' || resultaat === 'gekopieerd') return resultaat;
  return (await kopieer(bericht)) ? 'gekopieerd' : resultaat;
}
