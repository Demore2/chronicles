import { Platform } from 'react-native';

/**
 * Firebase Cloud Messaging, als bedoelingen in plaats van als API — precies dezelfde vorm als
 * `lib/analytics.ts`, `constants/haptics.ts` en `constants/notificaties.ts`.
 *
 * Drie eigenschappen, om dezelfde redenen als bij analytics:
 *
 * 1. **Niets hierin gooit ooit.** Een push is een extraatje; als het registreren mislukt hoort de
 *    app gewoon te werken. Elke functie slikt zijn fout.
 * 2. **De module wordt lui ge`require`d achter een `Platform`-controle.** `@react-native-firebase`
 *    is native: hij bestaat niet op web (waar dit project zijn schermen bekijkt) en ook niet in
 *    een dev-client die van vóór deze fase is. Een statische `import` laat de app daar op het
 *    eerste frame omvallen.
 * 3. **Mislukt het laden één keer, dan niet opnieuw.** `sdk === null` is de "hier is niets"-stand.
 *
 * **Let op — dit werkt pas als `google-services.json` in de repo-root staat.** Zonder dat bestand
 * faalt `expo prebuild` al, en zonder een nieuwe native build blijft `laad()` hier `null` geven.
 * De app werkt dan volledig; alleen de push-kant is stil. Zie CLAUDE.md, "Analytics".
 *
 * Wat hier **niet** in zit is de dagelijkse herinnering. Die is en blijft lokaal
 * (`constants/notificaties.ts` + `use-dagelijkse-herinnering.ts`): hij werkt offline, staat op de
 * seconde in de tijdzone van het toestel zelf, en heeft geen server nodig die elk uur wakker
 * wordt. FCM is er voor wat een toestel *niet* alleen kan weten — dat je een week weg bent, of
 * dat er een verhaal is dat je nog niet opende.
 */

type PushSdk = typeof import('@react-native-firebase/messaging');

/**
 * De typen worden uit de SDK zelf afgeleid in plaats van geïmporteerd.
 *
 * `@react-native-firebase/messaging` exporteert zijn interfaces niet vanaf de hoofdingang — ze
 * staan in `dist/typescript/lib/types/messaging`, en dáárheen importeren is een pad dat bij de
 * volgende versie stilletjes verschuift. `ReturnType`/`Parameters` blijven kloppen zolang de
 * functies bestaan, en als die verdwijnen is dat meteen een compileerfout op de juiste plek.
 */
type Messaging = ReturnType<PushSdk['getMessaging']>;
export type PushBericht = Parameters<Parameters<PushSdk['onMessage']>[1]>[0];

/** `undefined` = nog niet geprobeerd, `null` = niet beschikbaar op dit platform of deze build. */
let sdk: PushSdk | null | undefined;
let instantie: Messaging | null = null;
let waarschuwingGetoond = false;

type Geladen = { sdk: PushSdk; messaging: Messaging };

function laad(): Geladen | null {
  if (Platform.OS === 'web') return null;
  if (sdk === null) return null;

  try {
    if (sdk === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sdk = require('@react-native-firebase/messaging') as PushSdk;
    }
    instantie ??= sdk.getMessaging();
    return { sdk, messaging: instantie };
  } catch (fout) {
    sdk = null;
    instantie = null;
    if (!waarschuwingGetoond) {
      waarschuwingGetoond = true;
      // Eén keer. Bijna altijd "de dev-client is niet opnieuw gebouwd" of
      // "google-services.json ontbreekt".
      console.warn('[push] Firebase Messaging niet beschikbaar, push wordt overgeslagen:', fout);
    }
    return null;
  }
}

/** Wat er in `data` van een push kan zitten. Alle waarden zijn strings — FCM kent niets anders. */
export type PushLading = {
  /** Routepad binnen de app, bijv. `/verhaal/joan-of-arc/chapters`. */
  pad?: string;
  soort?: string;
  /** De rij in `notifications_sent`, zodat "geopend" terug te melden is. */
  melding_id?: string;
};

export function leesLading(data: unknown): PushLading {
  if (typeof data !== 'object' || data === null) return {};
  const rauw = data as Record<string, unknown>;
  const tekst = (sleutel: string) =>
    typeof rauw[sleutel] === 'string' ? (rauw[sleutel] as string) : undefined;
  return { pad: tekst('pad'), soort: tekst('soort'), melding_id: tekst('melding_id') };
}

export const push = {
  /** Staat FCM op dit platform en in deze build tot onze beschikking? */
  get beschikbaar(): boolean {
    return laad() !== null;
  },

  /**
   * Vraagt toestemming voor push.
   *
   * Op Android 13+ is dit dezelfde `POST_NOTIFICATIONS`-toestemming als die van de dagelijkse
   * herinnering, en het systeemvenster verschijnt maar **één keer per installatie**. Vandaar dat
   * de app hem niet zelf opvraagt: `notificaties.vraagToestemming()` in
   * `constants/notificaties.ts` is de enige plek die het venster opent, op het moment dat het uit
   * te leggen valt (na het eerste afgeronde hoofdstuk). Deze functie is er voor iOS, waar FCM een
   * eigen APNs-registratie kent.
   */
  async vraagToestemming(): Promise<boolean> {
    const geladen = laad();
    if (!geladen) return false;
    try {
      const status = await geladen.sdk.requestPermission(geladen.messaging);
      const { AUTHORIZED, PROVISIONAL } = geladen.sdk.AuthorizationStatus;
      return status === AUTHORIZED || status === PROVISIONAL;
    } catch {
      return false;
    }
  },

  /**
   * Het registratietoken van dít toestel. `null` als er geen is — geen toestemming, geen
   * native module, of geen netwerk bij de eerste registratie.
   */
  async haalToken(): Promise<string | null> {
    const geladen = laad();
    if (!geladen) return null;
    try {
      const token = await geladen.sdk.getToken(geladen.messaging);
      return token || null;
    } catch (fout) {
      console.warn('[push] token ophalen mislukt:', fout);
      return null;
    }
  },

  /**
   * Gooit het token weg. Voor het uitzetten van push: zonder dit blijft het toestel bereikbaar
   * ook al staat elke schakelaar uit, en dan hangt het alleen nog van de serverkant af of er
   * iets aankomt.
   */
  async wisToken(): Promise<void> {
    const geladen = laad();
    if (!geladen) return;
    try {
      await geladen.sdk.deleteToken(geladen.messaging);
    } catch {
      // Geen token om te wissen is precies de gewenste eindtoestand.
    }
  },

  /**
   * FCM vernieuwt een token uit zichzelf (herinstallatie, gewiste app-data, af en toe zomaar).
   * Wie daar niet naar luistert houdt een token in de database dat het niet meer doet, en merkt
   * dat pas als er weken niets aankomt.
   */
  opTokenVernieuwd(luisteraar: (token: string) => void): () => void {
    const geladen = laad();
    if (!geladen) return () => {};
    try {
      return geladen.sdk.onTokenRefresh(geladen.messaging, luisteraar);
    } catch {
      return () => {};
    }
  },

  /**
   * Een push die binnenkomt terwijl de app open staat.
   *
   * Android toont die **niet** vanzelf — FCM levert hem alleen af aan de code. Zonder deze
   * luisteraar lijkt het of de melding niet aankwam, terwijl hij netjes is bezorgd.
   */
  opVoorgrondBericht(luisteraar: (bericht: PushBericht) => void): () => void {
    const geladen = laad();
    if (!geladen) return () => {};
    try {
      return geladen.sdk.onMessage(geladen.messaging, luisteraar);
    } catch {
      return () => {};
    }
  },

  /** De lezer tikte op een melding terwijl de app op de achtergrond stond. */
  opMeldingGeopend(luisteraar: (bericht: PushBericht) => void): () => void {
    const geladen = laad();
    if (!geladen) return () => {};
    try {
      return geladen.sdk.onNotificationOpenedApp(geladen.messaging, luisteraar);
    } catch {
      return () => {};
    }
  },

  /**
   * De melding waarmee de app vanuit een *gesloten* toestand is geopend.
   *
   * Aparte functie en geen luisteraar: op dat moment bestond er nog geen listener om aan te
   * roepen, dus FCM bewaart hem en je moet er zelf om vragen. Precies één keer, bij het starten —
   * dit is de reden dat een deeplink uit een push "soms wel en soms niet" werkt als je hem
   * vergeet.
   */
  async startMelding(): Promise<PushBericht | null> {
    const geladen = laad();
    if (!geladen) return null;
    try {
      return await geladen.sdk.getInitialNotification(geladen.messaging);
    } catch {
      return null;
    }
  },
};
