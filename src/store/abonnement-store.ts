import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DAGELIJKSE_VERHAAL_LIMIET, VERHAAL_LIMIET_ENABLED } from '@/constants/monetisatie';
import { isAbonnementActief, useSubscriptionStore } from '@/store/subscription-store';
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
  /**
   * Voegt de verhalen die de server voor vandaag kent bij de lokale lijst.
   *
   * Alleen erbij, nooit eraf: zie de implementatie voor waarom een vervanging hier de verkeerde
   * kant op faalt.
   */
  voegServerVerhalenSamen: (dagSleutel: string, verhaalIds: string[]) => void;
  /** Mag dit verhaal nu open? Kijkt naar Pro, de vlag, en wat er vandaag al open ging. */
  magVerhaalOpenen: (verhaalId: string) => boolean;
};

/**
 * Wat er vandaag geopend is. Staat er een sleutel van gisteren in de opslag, dan is het antwoord
 * een lege lijst — de state zelf blijft ongemoeid tot er weer iets geopend wordt.
 */
export function verhalenVanVandaag(
  state: Pick<AbonnementState, 'dagSleutel' | 'gestarteVerhalen'>
): string[] {
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

/**
 * Heeft deze lezer nú Pro, **beide helften meegeteld**: het abonnement op het account én het
 * tegoed op dit toestel.
 *
 * Hier stond een gat, en het stond in CLAUDE.md en in de kop van `use-abonnement.ts` als
 * waarschuwing beschreven: `magVerhaalOpenen` keek alleen naar `isProActief` en dus alleen naar de
 * lokale helft. Een lezer die betaald had maar zijn Pro uit `public.user_subscriptions` haalde,
 * liep gewoon tegen de dagelijkse limiet aan — de ene plek in de app waar dat het meest voelbaar
 * is. Dat is nu dicht.
 *
 * Dit is bewust een **losse functie die de andere store bij de state pakt**, en niet een tweede
 * veld in deze store dat door een effect wordt bijgehouden. Een gespiegelde vlag kan achterlopen;
 * `getState()` kan dat niet. En het is met opzet exact dezelfde optelsom als in `useAbonnement()`
 * — die hook is de reactieve variant voor de weergave, dit is de variant voor een beslissing op
 * één moment. **Wijzigt de een, wijzig de ander mee**; twee antwoorden op "heeft deze lezer Pro"
 * is precies de bug die hierboven beschreven staat.
 */
export function heeftProNu(nu: number = Date.now()): boolean {
  if (isProActief(useAbonnementStore.getState(), nu)) return true;
  return isAbonnementActief(useSubscriptionStore.getState(), nu);
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
            !heeftProNu() &&
            vanVandaag.length >= DAGELIJKSE_VERHAAL_LIMIET &&
            state.bonusVerhalen > 0;

          return {
            dagSleutel: vandaag,
            gestarteVerhalen: [...vanVandaag, verhaalId],
            bonusVerhalen: gebruiktBonus ? state.bonusVerhalen - 1 : state.bonusVerhalen,
          };
        });
      },

      /**
       * De lijst van vandaag aanvullen met wat de server weet (`public.user_daily_reads`).
       *
       * Dit sluit het gat dat in CLAUDE.md onder "Known gaps" stond: `gestarteVerhalen` leeft in
       * AsyncStorage, dus twee toestellen gaven elk hun eigen dagvoorraad. De limiet hoort bij het
       * account, niet bij de telefoon.
       *
       * Drie dingen die de vorm bepalen:
       *
       * 1. **Een vereniging, geen vervanging** — precies zoals `voegServerVoortgangSamen`. Een
       *    verhaal dat je zojuist op dit toestel opende staat mogelijk nog niet op de server (de
       *    insert is fire-and-forget), en een vervanging zou het dan uit de telling wissen en je
       *    een gratis plek teruggeven.
       * 2. **De dagsleutel van de aanroeper wordt gecontroleerd.** Rond middernacht kan de dag
       *    tussen het opvragen en het verwerken omslaan; die rijen horen dan bij gisteren en
       *    zouden de nieuwe dag meteen halfvol zetten.
       * 3. **Er wordt niets `heeftOnverzondenWijzigingen`-achtigs gezet.** Dit is geen zevende
       *    sync-store: het verkeer gaat één kant op (rijen worden bij het openen geschreven), en
       *    wat hier binnenkomt is uitsluitend een correctie op de telling.
       */
      voegServerVerhalenSamen: (dagSleutel, verhaalIds) => {
        if (dagSleutel !== vandaagSleutel()) return;
        set((state) => {
          const vanVandaag = state.dagSleutel === dagSleutel ? state.gestarteVerhalen : [];
          const samen = [...new Set([...vanVandaag, ...verhaalIds])];
          // Niets nieuws: de state ongemoeid laten, anders krijgt de lijst een nieuwe identiteit
          // en hertekent elke `useVerhalenVandaag()` voor niets.
          if (samen.length === vanVandaag.length && state.dagSleutel === dagSleutel) return state;
          return { dagSleutel, gestarteVerhalen: samen };
        });
      },

      magVerhaalOpenen: (verhaalId) => {
        const state = get();
        // `heeftProNu()` en niet `isProActief(state, …)`: die laatste kent alleen het tegoed op dit
        // toestel en liet een lezer met een serverabonnement tegen de limiet aanlopen.
        if (!VERHAAL_LIMIET_ENABLED || heeftProNu()) return true;
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
