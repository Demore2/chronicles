import { useSegments } from 'expo-router';
import { useEffect } from 'react';

import { ANALYTICS_EIGENSCHAP, type AnalyticsGebeurtenis } from '@/constants/analytics';
import { analytics } from '@/lib/analytics';
import { useAbonnementStore } from '@/store/abonnement-store';
import { useAnalyticsStore } from '@/store/analytics-store';
import { useAuthStore } from '@/store/auth-store';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { wachtOpHydratie } from '@/store/sync-hulp';
import { useTaalStore } from '@/store/taal-store';

/**
 * De koppeling tussen de app en Firebase Analytics.
 *
 * Zelfde rolverdeling als bij `useAuth()` en `useVoortgangSync()`: de losse `log*`-functies
 * hieronder zijn overal aan te roepen, en déze hook — die de toestemming toepast, de lezer
 * identificeert en de schermen bijhoudt — hoort **één keer** in de root layout te staan.
 *
 * Wat hij niet doet is losse gebeurtenissen versturen. Die staan in de schermen zelf, want alleen
 * daar is bekend wat er gebeurde; zie `ANALYTICS_GEBEURTENIS` voor de volledige lijst.
 */

/** Eén eigen gebeurtenis. Dunne doorgeefluik naar `lib/analytics.ts`, zie daar waarom het niet gooit. */
export function logEvent(naam: AnalyticsGebeurtenis, params?: Record<string, unknown>): void {
  analytics.log(naam, params);
}

/** Eén gebruikerseigenschap. Normaal doet `useAnalytics()` dit al; dit is voor de uitzonderingen. */
export function logUserProperty(
  naam: (typeof ANALYTICS_EIGENSCHAP)[keyof typeof ANALYTICS_EIGENSCHAP],
  waarde: string | null
): void {
  analytics.zetEigenschap(naam, waarde);
}

/**
 * Inloggen en registreren.
 *
 * Losse functies omdat `login` en `sign_up` gereserveerde namen zijn: Firebase bouwt er zelf zijn
 * acquisitie- en retentierapporten op, en `logEvent` weigert ze daarom. Ze staan dus niet in
 * `ANALYTICS_GEBEURTENIS`.
 */
export function logInloggen(methode: string): void {
  analytics.logInloggen(methode);
}

export function logRegistreren(methode: string): void {
  analytics.logRegistreren(methode);
}

/** Koppelt de metingen aan een account, of maakt ze los met `null`. */
export function setUserId(userId: string | null): void {
  analytics.zetGebruiker(userId);
}

/**
 * Meldt één scherm handmatig aan.
 *
 * In de praktijk heb je dit niet nodig: `useAnalytics()` hieronder houdt via de router élk scherm
 * al bij, ook de schermen die nog niet bestaan. Deze hook is er voor het geval dat een scherm
 * onder een eigen naam geteld moet worden — bijvoorbeeld twee weergaven binnen één route.
 */
export function useAnalyticsScreenTracking(screenName: string): void {
  useEffect(() => {
    analytics.logScherm(screenName);
  }, [screenName]);
}

/**
 * Maakt van de routesegmenten een schermnaam met een lage kardinaliteit.
 *
 * Dít is de reden dat de hook naar `useSegments()` kijkt en niet naar `usePathname()`: het pad is
 * `/verhaal/julius-caesar/reader`, en dan krijgt Firebase twintig verschillende schermen die
 * allemaal "de reader" zijn. De segmenten houden het dynamische deel als patroon vast
 * (`verhaal/[id]/reader`), precies wat je in een rapport wilt zien.
 *
 * Groepsmappen (`(tabs)`) vallen weg omdat ze over de bestandsindeling gaan en niet over wat de
 * lezer ziet; blijft er niets over, dan is dat de startpagina.
 */
function schermNaamUitSegmenten(segments: string[]): string {
  const zichtbaar = segments.filter((segment) => !segment.startsWith('('));
  return zichtbaar.length > 0 ? zichtbaar.join('/') : 'home';
}

export function useAnalytics(): void {
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const isPro = useAbonnementStore((state) => state.isPro);
  const taal = useTaalStore((state) => state.taal);
  const aantalPersonages = useCharacterUnlockStore((state) => state.unlockedCharacters.length);

  // --- Toestemming ---
  //
  // Eerst wachten tot `persist` uit AsyncStorage gelezen is. Zonder die stap kijken we vlak na
  // een koude start naar de beginwaarde en zetten we het verzamelen aan voor iemand die het
  // vorige week heeft uitgezet — hetzelfde probleem als bij de voortgangssync.
  useEffect(() => {
    let afgebroken = false;
    wachtOpHydratie(useAnalyticsStore).then(() => {
      if (afgebroken) return;
      analytics.zetVerzamelenAan(useAnalyticsStore.getState().toestemming);
    });
    return () => {
      afgebroken = true;
    };
  }, []);

  // --- Wie er leest ---
  //
  // `null` bij uitloggen is geen formaliteit: zonder dat blijven de metingen van de volgende
  // lezer op dit toestel aan het vorige account hangen.
  useEffect(() => {
    analytics.zetGebruiker(user?.id ?? null);
  }, [user]);

  // --- Hoe die lezer eruitziet ---
  //
  // Deze staan bewust in effecten die de stores volgen en niet in de inlog-afhandeling. Wordt er
  // halverwege een sessie een personage ontgrendeld of de Pro-schakelaar omgezet, dan klopt de
  // eigenschap meteen; bij een eenmalige aanroep na het inloggen zou hij een sessie achterlopen.
  useEffect(() => {
    analytics.zetEigenschap(ANALYTICS_EIGENSCHAP.tier, isPro ? 'pro' : 'free');
  }, [isPro]);

  useEffect(() => {
    analytics.zetEigenschap(ANALYTICS_EIGENSCHAP.personages, String(aantalPersonages));
  }, [aantalPersonages]);

  useEffect(() => {
    analytics.zetEigenschap(ANALYTICS_EIGENSCHAP.taal, taal);
  }, [taal]);

  // --- Waar die lezer is ---
  //
  // Eén plek voor alle schermen, inclusief de schermen die er nog niet zijn. Het alternatief —
  // `useAnalyticsScreenTracking()` in elk scherm — is 25 plekken die iemand kan vergeten, en de
  // vergeten schermen zijn precies de schermen waarvan je niet weet dat je ze mist.
  useEffect(() => {
    const naam = schermNaamUitSegmenten(segments as string[]);
    analytics.logScherm(naam);
  }, [segments]);
}
