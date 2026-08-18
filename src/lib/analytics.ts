import { Platform } from 'react-native';
import type { Analytics } from '@react-native-firebase/analytics';

import { ANALYTICS_EIGENSCHAP, type AnalyticsGebeurtenis } from '@/constants/analytics';

/**
 * Firebase Analytics, als bedoelingen in plaats van als API — dezelfde vorm als
 * `constants/haptics.ts` en `constants/notificaties.ts`.
 *
 * Drie eigenschappen die het hele ontwerp bepalen:
 *
 * 1. **Niets hierin gooit ooit.** Een meting is een bijwerking van iets wat de lezer aan het doen
 *    is; als het tellen mislukt hoort het lezen door te gaan. Elke functie slikt zijn fout en
 *    schrijft hooguit een regel in de console.
 * 2. **De module wordt lui geladen, achter een `Platform`-controle.** `@react-native-firebase`
 *    is een *native* module: hij bestaat niet op web (waar dit project zijn schermen bekijkt) en
 *    ook niet in een dev-client die nog gebouwd is van vóór deze wijziging. Een gewone `import`
 *    bovenaan zou de app dan op het eerste frame laten klappen — precies wat `supabase.ts`
 *    bewust wél doet, want zonder database is er geen app, maar zonder statistiek wel.
 * 3. **Mislukt het laden één keer, dan wordt het niet opnieuw geprobeerd.** `sdk === null` is de
 *    "hier is niets"-stand; zonder die vlag zou elke afgevinkte alinea opnieuw een `require`
 *    proberen en opnieuw dezelfde waarschuwing loggen.
 *
 * De toestemming van de lezer staat *niet* hier maar in `store/analytics-store.ts`; deze module
 * voert alleen uit wat hem gevraagd wordt. `zetVerzamelenAan()` is de schakelaar die de store
 * omzet.
 */

type AnalyticsSdk = typeof import('@react-native-firebase/analytics');

/** `undefined` = nog niet geprobeerd, `null` = niet beschikbaar op dit platform of deze build. */
let sdk: AnalyticsSdk | null | undefined;
let instantie: Analytics | null = null;
let waarschuwingGetoond = false;

type Geladen = { sdk: AnalyticsSdk; analytics: Analytics };

function laad(): Geladen | null {
  // Op web bestaat de native module niet. React Native Firebase kan daar via de firebase-js-sdk
  // wél praten, maar dan moet er een web-configuratie in `app.json` staan en gaat er vanuit de
  // browser-preview echt verkeer naar Google. Dat willen we niet tijdens het ontwikkelen.
  if (Platform.OS === 'web') return null;
  if (sdk === null) return null;

  try {
    if (sdk === undefined) {
      // Bewust lui en bewust `require`: een statische `import` laadt de native module op het
      // eerste frame, en dan valt de hele app om in een dev-client die nog niet opnieuw gebouwd
      // is. Zie de kop van dit bestand — dit is de enige plek in `src/` waar dat nodig is.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sdk = require('@react-native-firebase/analytics') as AnalyticsSdk;
    }
    instantie ??= sdk.getAnalytics();
    return { sdk, analytics: instantie };
  } catch (fout) {
    sdk = null;
    instantie = null;
    if (!waarschuwingGetoond) {
      waarschuwingGetoond = true;
      // Eén keer, niet bij elke gebeurtenis. Dit is bijna altijd "de dev-client is nog niet
      // opnieuw gebouwd na het toevoegen van Firebase" — zie CLAUDE.md.
      console.warn('[analytics] Firebase niet beschikbaar, metingen worden overgeslagen:', fout);
    }
    return null;
  }
}

/**
 * Maakt van een parameter-object iets dat Firebase accepteert.
 *
 * Waarden die `undefined` of `null` zijn vallen weg (een lege parameter is geen parameter), en
 * tekst wordt op 100 tekens afgekapt — dat is de harde grens van Firebase, en eroverheen gaat de
 * hele gebeurtenis verloren in plaats van alleen die ene waarde.
 */
function schoon(params?: Record<string, unknown>): Record<string, string | number> {
  const uit: Record<string, string | number> = {};
  if (!params) return uit;
  for (const [sleutel, waarde] of Object.entries(params)) {
    if (waarde === undefined || waarde === null) continue;
    if (typeof waarde === 'number') {
      if (Number.isFinite(waarde)) uit[sleutel] = waarde;
    } else if (typeof waarde === 'boolean') {
      // Firebase kent geen booleans. Als getal blijft het optelbaar ("hoeveel procent goed?"),
      // als tekst zou het alleen te groeperen zijn.
      uit[sleutel] = waarde ? 1 : 0;
    } else {
      uit[sleutel] = String(waarde).slice(0, 100);
    }
  }
  return uit;
}

export const analytics = {
  /** Staat Firebase op dit platform en in deze build tot onze beschikking? */
  get beschikbaar(): boolean {
    return laad() !== null;
  },

  /**
   * Het Firebase-projectid uit de meegeleverde `google-services.json`.
   *
   * Alleen voor het dev-dashboard, dat er zijn console-links mee opbouwt. Bewust uitgelezen en
   * niet overgetypt: Firebase plakt bij het aanmaken een willekeurig achtervoegsel achter de naam
   * die je intypt (`chronicles-app` wordt bijvoorbeeld `chronicles-app-4f21c`), dus elk
   * hardgecodeerd id is een gok die naar het verkeerde project linkt.
   */
  get projectId(): string | null {
    const geladen = laad();
    return geladen?.analytics.app.options.projectId ?? null;
  },

  /**
   * Het app-instance-id: het pseudonieme id waaronder dit toestel bij Firebase bekend staat.
   *
   * Voor het dev-dashboard, waar het het enige bruikbare antwoord is op "waarom zie ik mijn eigen
   * gebeurtenissen niet in DebugView?".
   */
  async instanceId(): Promise<string | null> {
    const geladen = laad();
    if (!geladen) return null;
    try {
      return await geladen.sdk.getAppInstanceId(geladen.analytics);
    } catch {
      return null;
    }
  },

  /**
   * Zet het verzamelen aan of uit. Dit is wat de privacyschakelaar in Instellingen bedient.
   *
   * Let op: dit werkt vanaf het moment dat het gezet wordt. Wie analytics standáárd uit wil
   * hebben moet ook `firebase_analytics_collection_enabled=false` in het Android-manifest zetten
   * — anders logt Firebase de app-start al voordat deze regel draait. Zolang
   * `STANDAARD_ANALYTICS_TOESTEMMING` op `true` staat is dat niet nodig.
   */
  zetVerzamelenAan(aan: boolean): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk.setAnalyticsCollectionEnabled(geladen.analytics, aan).catch(() => {});
  },

  /** Eén eigen gebeurtenis. De naam komt uit `ANALYTICS_GEBEURTENIS`, nooit uit een losse string. */
  log(naam: AnalyticsGebeurtenis, params?: Record<string, unknown>): void {
    const geladen = laad();
    if (!geladen) return;
    try {
      geladen.sdk.logEvent(geladen.analytics, naam, schoon(params));
    } catch (fout) {
      console.warn(`[analytics] ${naam} mislukt:`, fout);
    }
  },

  /**
   * Een schermweergave. Aparte functie omdat `screen_view` een gereserveerde naam is die
   * `logEvent` weigert — Firebase bouwt er zelf zijn schermrapport op.
   */
  logScherm(schermNaam: string): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk
      .logScreenView(geladen.analytics, { screen_name: schermNaam, screen_class: schermNaam })
      .catch(() => {});
  },

  /** Idem voor `login`: gereserveerd, dus via de eigen functie. */
  logInloggen(methode: string): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk.logLogin(geladen.analytics, { method: methode }).catch(() => {});
  },

  /** Idem voor `sign_up`. */
  logRegistreren(methode: string): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk.logSignUp(geladen.analytics, { method: methode }).catch(() => {});
  },

  /**
   * Koppelt de metingen aan een gebruiker-id, of maakt de koppeling los (`null` bij uitloggen).
   *
   * Dit is het Supabase-user-id. Daarmee wordt een verder pseudonieme meting herleidbaar tot een
   * account, en dat is precies waarom de privacypagina en het Data Safety-formulier dit moeten
   * noemen (zie `docs/README.md`). Zonder dit id blijft een lezer op twee toestellen twee lezers,
   * en klopt elk retentiecijfer niet meer.
   */
  zetGebruiker(userId: string | null): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk.setUserId(geladen.analytics, userId).catch(() => {});
  },

  /** Eén gebruikerseigenschap. `null` wist hem. */
  zetEigenschap(naam: (typeof ANALYTICS_EIGENSCHAP)[keyof typeof ANALYTICS_EIGENSCHAP], waarde: string | null): void {
    const geladen = laad();
    if (!geladen) return;
    geladen.sdk.setUserProperty(geladen.analytics, naam, waarde).catch(() => {});
  },
};
