import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DAGELIJKSE_VERHAAL_LIMIET, VERHAAL_LIMIET_ENABLED } from '@/constants/monetisatie';
import { vandaagSleutel } from '@/store/voortgang-store';

/**
 * Wie de lezer is voor het gratis/Pro-model, en wat hij vandaag al gelezen heeft.
 *
 * Twee dingen die de vorm bepalen:
 *
 * 1. **Er wordt geteld welke verhalen open zijn gegaan, niet hoeveel.** Een teller die bij elk
 *    bezoek ophoogt telt hetzelfde verhaal twee keer zodra je het hoofdstukoverzicht opnieuw
 *    binnenkomt — en dat gebeurt na élk hoofdstuk, want de reader gaat met `router.back()` terug.
 *    Een verzameling id's is idempotent: hetzelfde verhaal nog eens openen verandert niets.
 * 2. **De dag rolt om bij het schrijven, niet bij het lezen.** `magVerhaalOpenen` en de tellers
 *    hieronder zijn zuivere functies van de state; ze vergelijken `dagSleutel` met vandaag en doen
 *    verder niets. Zou een getter de state bijwerken, dan muteert een component tijdens zijn eigen
 *    render — en dat is precies het soort bug dat zich als een oneindige rerender aandient.
 *
 * `isPro` komt tot de koppeling met Google Play Billing alleen van de dev-schakelaar in
 * Instellingen; `useAbonnement()` is de hook die de rest van de app ernaar laat kijken.
 */
type AbonnementState = {
  /** Heeft deze lezer Pro? Tot Billing er is alleen door de dev-schakelaar te zetten. */
  isPro: boolean;
  /** De lokale datum waar `gestarteVerhalen` bij hoort. `null` = nog nooit iets geopend. */
  dagSleutel: string | null;
  /** Id's van de verhalen die op `dagSleutel` voor het eerst zijn geopend. */
  gestarteVerhalen: string[];

  setPro: (isPro: boolean) => void;
  /** Noteert dat dit verhaal vandaag geopend is. Idempotent binnen dezelfde dag. */
  registreerVerhaalGeopend: (verhaalId: string) => void;
  /** Mag dit verhaal nu open? Kijkt naar Pro, de vlag, en wat er vandaag al open ging. */
  magVerhaalOpenen: (verhaalId: string) => boolean;
};

/**
 * Wat er vandaag geopend is. Staat er een sleutel van gisteren in de opslag, dan is het antwoord
 * een lege lijst — de state zelf blijft ongemoeid tot er weer iets geopend wordt.
 */
function verhalenVanVandaag(state: Pick<AbonnementState, 'dagSleutel' | 'gestarteVerhalen'>): string[] {
  return state.dagSleutel === vandaagSleutel() ? state.gestarteVerhalen : [];
}

export const useAbonnementStore = create<AbonnementState>()(
  persist(
    (set, get) => ({
      isPro: false,
      dagSleutel: null,
      gestarteVerhalen: [],

      setPro: (isPro) => set({ isPro }),

      registreerVerhaalGeopend: (verhaalId) => {
        const vandaag = vandaagSleutel();
        set((state) => {
          // Nieuwe dag: de lijst begint opnieuw. Dit is de enige plek waar dat gebeurt.
          const vanVandaag = state.dagSleutel === vandaag ? state.gestarteVerhalen : [];
          if (vanVandaag.includes(verhaalId)) {
            return { dagSleutel: vandaag, gestarteVerhalen: vanVandaag };
          }
          return { dagSleutel: vandaag, gestarteVerhalen: [...vanVandaag, verhaalId] };
        });
      },

      magVerhaalOpenen: (verhaalId) => {
        const state = get();
        if (!VERHAAL_LIMIET_ENABLED || state.isPro) return true;
        const vanVandaag = verhalenVanVandaag(state);
        // Al geopend vandaag: dan is de plek al betaald. Anders zou je middenin een verhaal
        // buitengesloten worden zodra je terugloopt naar het hoofdstukoverzicht.
        if (vanVandaag.includes(verhaalId)) return true;
        return vanVandaag.length < DAGELIJKSE_VERHAAL_LIMIET;
      },
    }),
    {
      name: 'abonnement-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Het aantal verhalen dat vandaag geopend is, als hook — voor de regel "1/2 stories today" in
 * Instellingen en voor de limietmelding.
 *
 * Een selector die een getal teruggeeft, geen array: zo hertekent het scherm alleen als het getal
 * verandert, en niet elke keer dat de lijst een nieuwe identiteit krijgt.
 */
export function useVerhalenVandaag(): number {
  return useAbonnementStore((state) => verhalenVanVandaag(state).length);
}
