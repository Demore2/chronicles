/**
 * Gedeelde bouwstenen voor de Supabase-sync (R8.AUTH deel 3 → R8.SYNC-B).
 *
 * `voortgang-store` had deze drie dingen als privé-helpers. Sinds `story-progress-store` en
 * `character-unlock-store` precies hetzelfde patroon volgen staan ze hier: één debounce-lengte,
 * één hydratiegarantie, één manier om een onbekende fout in een zin te veranderen. Drie kopieën
 * van `wachtOpHydratie` is drie kansen om er één te vergeten.
 */

/** Hoe lang we wachten na een wijziging voordat we pushen (deel 3: 2 seconden). */
export const SYNC_DEBOUNCE_MS = 2000;

export function foutTekst(fout: unknown): string {
  if (fout instanceof Error) return fout.message;
  if (typeof fout === 'string') return fout;
  return 'Onbekende synchronisatiefout.';
}

/**
 * Het stukje van een `persist`-store dat we nodig hebben. Structureel getypeerd, zodat elke
 * Zustand-store met `persist` erin past zonder dat we zijn state-type hoeven te kennen.
 */
type GehydrateerdeStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

/**
 * Wacht tot `persist` klaar is met lezen uit AsyncStorage.
 *
 * De hydratie is asynchroon, dus vlak na het opstarten staat de store nog op zijn lege
 * beginwaarden. Wie dan al synchroniseert doet dat met de verkeerde gegevens: een push stuurt de
 * lege beginstand omhoog en overschrijft de serverrij. In de praktijk is de opslag altijd sneller
 * dan de eerste netwerkronde, maar "meestal sneller" is geen garantie en het verlies is stil.
 */
export function wachtOpHydratie(store: GehydrateerdeStore): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const stopLuisteren = store.persist.onFinishHydration(() => {
      stopLuisteren();
      resolve();
    });
  });
}

/**
 * Eén gedeelde debounce-timer per store.
 *
 * De timer staat bewust buiten de state: een timer-id hoort niet in AsyncStorage, mag geen render
 * veroorzaken, en er is er per store maar één nodig. Elke wijziging schuift dezelfde timer op, dus
 * acht hoofdstukken achter elkaar afvinken levert één upsert op in plaats van acht.
 *
 * `annuleer` is er voor het uitloggen: een push die nog in de wachtkamer staat mag niet een
 * seconde ná `signOut()` alsnog met een verlopen token vertrekken.
 */
export function maakSyncPlanner(uitvoeren: () => void | Promise<void>) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    plan() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void uitvoeren();
      }, SYNC_DEBOUNCE_MS);
    },
    annuleer() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}
