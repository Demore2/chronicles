import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Wat de app onthoudt over mijlpalen: **alleen welke er al zijn aangekondigd.**
 *
 * De mijlpalen zelf worden afgeleid uit de voortgang (zie `constants/prestaties.ts`), dus dit is
 * geen tweede administratie van wat je hebt bereikt — het is een lijstje "hier heb je de melding
 * al voor gezien". Zonder dat zou elke koude start dezelfde veertien felicitaties opleveren.
 *
 * **Bewust niet gesynchroniseerd naar Supabase.** De onderliggende voortgang synchroniseert al;
 * dit gaat over een melding die op *dit* toestel is getoond, en dat is precies zo'n feit over het
 * toestel als `toestemmingGevraagd` in `notificatie-store`. Het gevolg is dat een tweede toestel
 * bij de eerste keer inloggen zijn eigen "eerste peiling" doet en dus niets aankondigt (zie
 * `geinitialiseerd` hieronder) — geen veertien meldingen, en dat is de goede uitkomst.
 */
type PrestatieState = {
  /** Ids uit `PRESTATIES` waarvan de lezer de aankondiging heeft gehad (of stil is bijgeschreven). */
  bekendeIds: string[];
  /**
   * Heeft deze installatie al één keer gemeten?
   *
   * **Dit is het belangrijkste veld hier.** Wie deze versie installeert met 50 hoofdstukken achter
   * de rug heeft in één klap zes mijlpalen staan. Zonder deze vlag krijgt die lezer zes meldingen
   * achter elkaar bij de eerste start — de snelste manier om alle meldingen van een app uit te
   * zetten. De eerste meting schrijft daarom alles stil bij en kondigt niets aan.
   */
  geinitialiseerd: boolean;
  /**
   * De mijlpaal die nog in de app gevierd moet worden, als de app op de voorgrond stond toen hij
   * binnenkwam. `null` = niets te vieren. Stond de app op de achtergrond, dan is het een melding
   * geworden en komt hij hier niet terecht.
   */
  teVieren: string | null;
  /**
   * De mijlpaal waarvan het venster openstaat, of `null`.
   *
   * Staat hier en niet als lokale state in het raster, omdat er twee ingangen naar hetzelfde
   * venster zijn: een tegel op Voortgang en de strook die na een ontgrendeling binnenschuift (die
   * hangt in de root layout, ver buiten het raster). Twee kopieen van het venster zouden op
   * elkaar kunnen stapelen.
   */
  detailId: string | null;

  /** Schrijft ids bij als bekend, zonder aankondiging. */
  markeerBekend: (ids: string[]) => void;
  /** Eerste meting: alles wat nu al behaald is telt als gezien. */
  initialiseer: (ids: string[]) => void;
  zetTeVieren: (id: string) => void;
  wisTeVieren: () => void;
  toonDetail: (id: string) => void;
  wisDetail: () => void;
  /** Voor het wissen van lokale gegevens bij accountverwijdering. */
  reset: () => void;
};

export const usePrestatieStore = create<PrestatieState>()(
  persist(
    (set) => ({
      bekendeIds: [],
      geinitialiseerd: false,
      teVieren: null,
      detailId: null,

      markeerBekend: (ids) =>
        set((state) => {
          const nieuw = ids.filter((id) => !state.bekendeIds.includes(id));
          if (nieuw.length === 0) return state;
          return { bekendeIds: [...state.bekendeIds, ...nieuw] };
        }),

      initialiseer: (ids) => set({ bekendeIds: ids, geinitialiseerd: true }),

      zetTeVieren: (id) => set({ teVieren: id }),
      // De strook gaat weg zodra het venster opengaat: ze vertellen hetzelfde, en de strook zou
      // anders over de rand van het venster heen blijven staan tot zijn tijd om is.
      toonDetail: (id) => set({ detailId: id, teVieren: null }),
      wisDetail: () => set({ detailId: null }),
      wisTeVieren: () => set({ teVieren: null }),

      reset: () => set({ bekendeIds: [], geinitialiseerd: false, teVieren: null, detailId: null }),
    }),
    {
      name: 'prestatie-storage',
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * `teVieren` en `detailId` blijven buiten de opslag. Een bewaarde mijlpaal zou bij de
       * volgende koude start opnieuw over het scherm schuiven (of een venster openzetten), dagen
       * na het moment waar hij bij hoorde.
       */
      partialize: (state) => ({
        bekendeIds: state.bekendeIds,
        geinitialiseerd: state.geinitialiseerd,
      }),
    }
  )
);
