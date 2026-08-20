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
  /**
   * Pro tot dit moment (epoch-ms), of `null`. Losstaand van `isPro`, want het is iets anders:
   * `isPro` is een abonnement dat doorloopt, dit is een tegoed met een einddatum — vandaag alleen
   * de "week Pro" die je met een uitnodiging verdient (`referral-store.claimReward`).
   *
   * Bij het aflopen wordt hier niets opgeruimd en dat is met opzet: een `setTimeout` over zeven
   * dagen overleeft geen herstart, en een getal dat in het verleden ligt is precies zo duidelijk.
   */
  proTot: number | null;
  /** De lokale datum waar `gestarteVerhalen` bij hoort. `null` = nog nooit iets geopend. */
  dagSleutel: string | null;
  /** Id's van de verhalen die op `dagSleutel` voor het eerst zijn geopend. */
  gestarteVerhalen: string[];
  /**
   * Extra *nieuwe* verhalen bovenop de dagelijkse limiet, verdiend met een uitnodiging.
   *
   * Bewust **niet** aan een dag gebonden, anders dan `gestarteVerhalen`: een beloning die
   * verdampt op de avond dat je hem verdient is geen beloning. Hij wordt afgeboekt op het moment
   * dat hij écht een deur opent — zie `registreerVerhaalGeopend`.
   */
  bonusVerhalen: number;

  setPro: (isPro: boolean) => void;
  /** Verlengt de tijdelijke Pro-periode met een aantal dagen, vanaf nu of vanaf het huidige eind. */
  verlengPro: (dagen: number) => void;
  /** Schrijft extra verhaal-tegoed bij. Zie `bonusVerhalen`. */
  voegBonusVerhaalToe: (aantal: number) => void;
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

/**
 * Heeft deze lezer nú Pro — het abonnement óf een lopende tegoedperiode?
 *
 * Het peilmoment komt als parameter binnen en wordt hier niet afgelezen. Zo blijft dit een zuivere
 * functie (te beproeven met een verzonnen klok) en, belangrijker, kan hij vanuit een selector
 * worden aangeroepen zonder tijdens het renderen de klok af te lezen — precies wat de
 * `react-hooks`-zuiverheidsregel tegenhoudt. `useAbonnement()` levert het moment aan, net zoals
 * `useStreak()` dat doet voor `berekenHuidigeStreak`.
 */
export function isProActief(state: Pick<AbonnementState, 'isPro' | 'proTot'>, nu: number): boolean {
  if (state.isPro) return true;
  return state.proTot !== null && state.proTot > nu;
}

export const useAbonnementStore = create<AbonnementState>()(
  persist(
    (set, get) => ({
      isPro: false,
      proTot: null,
      dagSleutel: null,
      gestarteVerhalen: [],
      bonusVerhalen: 0,

      setPro: (isPro) => set({ isPro }),

      verlengPro: (dagen) => {
        const nu = Date.now();
        set((state) => {
          // Vanaf het huidige eind als dat nog in de toekomst ligt, anders vanaf nu. Twee weken
          // achter elkaar inwisselen hoort veertien dagen op te leveren, geen zeven.
          const basis = state.proTot !== null && state.proTot > nu ? state.proTot : nu;
          return { proTot: basis + dagen * 24 * 60 * 60 * 1000 };
        });
      },

      voegBonusVerhaalToe: (aantal) =>
        set((state) => ({ bonusVerhalen: state.bonusVerhalen + Math.max(0, aantal) })),

      registreerVerhaalGeopend: (verhaalId) => {
        const vandaag = vandaagSleutel();
        set((state) => {
          // Nieuwe dag: de lijst begint opnieuw. Dit is de enige plek waar dat gebeurt.
          const vanVandaag = state.dagSleutel === vandaag ? state.gestarteVerhalen : [];
          if (vanVandaag.includes(verhaalId)) {
            return { dagSleutel: vandaag, gestarteVerhalen: vanVandaag };
          }
          // Ging dit verhaal alleen open dankzij een bonus, dan wordt die hier afgeboekt — op het
          // moment dat hij daadwerkelijk een deur opende, en niet eerder. Een Pro-lezer verbruikt
          // niets: voor hem was er geen deur.
          const gebruiktBonus =
            VERHAAL_LIMIET_ENABLED &&
            !isProActief(state, Date.now()) &&
            vanVandaag.length >= DAGELIJKSE_VERHAAL_LIMIET &&
            state.bonusVerhalen > 0;

          return {
            dagSleutel: vandaag,
            gestarteVerhalen: [...vanVandaag, verhaalId],
            bonusVerhalen: gebruiktBonus ? state.bonusVerhalen - 1 : state.bonusVerhalen,
          };
        });
      },

      magVerhaalOpenen: (verhaalId) => {
        const state = get();
        if (!VERHAAL_LIMIET_ENABLED || isProActief(state, Date.now())) return true;
        const vanVandaag = verhalenVanVandaag(state);
        // Al geopend vandaag: dan is de plek al betaald. Anders zou je middenin een verhaal
        // buitengesloten worden zodra je terugloopt naar het hoofdstukoverzicht.
        if (vanVandaag.includes(verhaalId)) return true;
        return vanVandaag.length < DAGELIJKSE_VERHAAL_LIMIET + state.bonusVerhalen;
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
