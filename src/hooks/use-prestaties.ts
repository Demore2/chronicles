import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { notificaties } from '@/constants/notificaties';
import { behaaldePrestaties, type PrestatieStand } from '@/constants/prestaties';
import { useVertaling } from '@/hooks/use-vertaling';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { useAchievementStore } from '@/store/achievement-store';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { useNotificatieStore } from '@/store/notificatie-store';
import { usePrestatieStore } from '@/store/prestatie-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { wachtOpHydratie } from '@/store/sync-hulp';
import { berekenHuidigeStreak, useVoortgangStore } from '@/store/voortgang-store';

/**
 * Merkt op wanneer er een mijlpaal wordt bereikt, en kondigt hem aan.
 *
 * **Mount dit één keer, in de root layout**, naast `useAuth()`, `useVoortgangSync()`,
 * `useAnalytics()` en `usePushRegistratie()`.
 *
 * ## Waar de melding vandaan komt, en waarom niet van de server
 *
 * Een mijlpaal is af te leiden uit voortgang die op het toestel staat. De server zou er niets aan
 * toe te voegen hebben en wél een afhankelijkheid: dan komt de felicitatie voor je tiende
 * hoofdstuk pas binnen als je online bent. Dit is dus een lokale melding, net als de dagelijkse
 * herinnering en de streakwaarschuwing — FCM blijft voor wat het toestel *niet* kan weten.
 *
 * ## Melding of viering in de app?
 *
 * Een mijlpaal wordt vrijwel altijd bereikt terwijl de lezer naar de app kijkt: je vinkt een
 * hoofdstuk af en dat is de tiende. Een systeemmelding erbovenop is dan ruis over iets wat je
 * zojuist zelf deed — dezelfde afweging die in `i18n/en.ts` bij de verwijderde ontgrendelmelding
 * staat, en die in B4 de automatische ontgrendeling deed sneuvelen.
 *
 * Dus: staat de app op de **voorgrond**, dan gaat de mijlpaal naar `teVieren` en schuift
 * `PrestatieMelding` hem in beeld. Staat de app op de **achtergrond** — voortgang die
 * binnenkomt via de sync van een ander toestel, of een afgerond hoofdstuk vlak voordat het
 * scherm uitging — dan wordt het een echte notificatie.
 *
 * ## Eén tegelijk
 *
 * Er wordt hoogstens één mijlpaal per meting aangekondigd; de rest wordt stil bijgeschreven. Dat
 * is geen zuinigheid maar de enige manier om te voorkomen dat een lezer die op een tweede toestel
 * inlogt zes felicitaties achter elkaar krijgt. De aangekondigde is de laatste in `PRESTATIES`,
 * dus de zwaarste van de nieuwe.
 */
export function usePrestaties(): void {
  const { t } = useVertaling();

  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const completedStories = useVoortgangStore((state) => state.completedStories);
  const streakDagen = useVoortgangStore((state) => state.streakDagen);
  const laatsteActiviteitDatum = useVoortgangStore((state) => state.laatsteActiviteitDatum);
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  const prestatiesAan = useNotificatieStore((state) => state.prestatiesAan);

  /**
   * De teksten van de melding.
   *
   * Ze staan gewoon in de afhankelijkheden van `meet`, dus een taalwissel maakt een nieuwe `meet`
   * en meet opnieuw. Dat is veilig en dat is geen toeval: `markeerBekend` staat hieronder *vóór*
   * de aankondiging, dus een tweede meting vindt niets nieuws meer en doet niets. Bij een
   * *geplande* melding (de dagelijkse herinnering, de streakwaarschuwing) moet de tekst wél
   * opnieuw gezet worden, want die wordt dagen vooruit vastgelegd; deze verschijnt meteen.
   */
  const meldingTitel = t((s) => s.prestatie.meldingTitel);
  const namen = t((s) => s.prestatie.namen);
  const uitleggen = t((s) => s.prestatie.uitleg);

  const meet = useCallback(async () => {
    // **Wachten op de hydratie is hier geen voorzorg maar het verschil tussen werken en niet
    // werken.** Vlak na een koude start staan de drie voortgangsstores nog op hun lege beginwaarde.
    // Meten we dan, dan is de eerste peiling "nul mijlpalen" en wordt die als beginstand
    // vastgelegd — waarna de hydratie er vijftig hoofdstukken naast legt en de lezer alsnog zijn
    // hele geschiedenis als meldingen terugkrijgt. Precies wat `geinitialiseerd` moet voorkomen.
    await wachtOpHydratie(useStoryProgressStore);
    await wachtOpHydratie(useVoortgangStore);
    await wachtOpHydratie(useCharacterUnlockStore);
    await wachtOpHydratie(usePrestatieStore);
    await wachtOpHydratie(useAchievementStore);

    const voortgang = useVoortgangStore.getState();
    const stand: PrestatieStand = {
      hoofdstukken: telVoltooideHoofdstukken(useStoryProgressStore.getState().progress),
      verhalen: voortgang.completedStories.size,
      personages: useCharacterUnlockStore.getState().unlockedCharacters.length,
      // De opgeslagen `streakDagen` weet niet dat er sindsdien dagen voorbij zijn; alleen
      // `berekenHuidigeStreak` geeft de reeks zoals hij nú is. Zie `use-streak.ts`.
      streak: berekenHuidigeStreak(
        voortgang.streakDagen,
        voortgang.laatsteActiviteitDatum,
        new Date()
      ),
    };

    const behaald = behaaldePrestaties(stand);
    const store = usePrestatieStore.getState();
    const prestatieServer = useAchievementStore.getState();

    // De stand gaat sowieso naar `achievement-store`, ook als er niets nieuws is: die voedt
    // `achievement_progress`, en juist "3 van de 7" verandert op momenten dat er géén mijlpaal
    // bijkomt. De store slaat een ongewijzigde stand zelf over, dus dit kost niets.
    prestatieServer.zetStand(stand);

    // Eerste meting op dit toestel: alles wat er al staat telt als gezien, zonder aankondiging.
    if (!store.geinitialiseerd) {
      const idsNu = behaald.map((prestatie) => prestatie.id);
      store.initialiseer(idsNu);
      // Wél registreren, ook al wordt er niets aangekondigd: anders heeft een lezer die deze
      // versie installeert met vijftig hoofdstukken achter de rug badges zonder datum. Het moment
      // is dan "nu" — een gok, maar de enige die dit toestel heeft, en de samenvoeging in
      // `achievement-store` zet hem terug zodra de server een eerdere datum blijkt te kennen.
      prestatieServer.registreer(idsNu);
      return;
    }

    const nieuw = behaald.filter((prestatie) => !store.bekendeIds.includes(prestatie.id));
    if (nieuw.length === 0) return;

    // Alles bijschrijven vóórdat er iets wordt aangekondigd. Andersom zou een melding die
    // halverwege misgaat de mijlpaal opnieuw laten opduiken bij de volgende meting.
    store.markeerBekend(nieuw.map((prestatie) => prestatie.id));
    prestatieServer.registreer(nieuw.map((prestatie) => prestatie.id));

    // De zwaarste van de nieuwe: `PRESTATIES` staat op drempel gesorteerd binnen een categorie.
    const aankondigen = nieuw[nieuw.length - 1];

    logStoryEvent(ANALYTICS_EVENTS.ACHIEVEMENT_UNLOCKED, {
      achievement_id: aankondigen.id,
      categorie: aankondigen.categorie,
      drempel: aankondigen.drempel,
      // Hoeveel er in één keer binnenkwamen. Structureel meer dan 1 betekent dat de eerste meting
      // ergens te vroeg gebeurt.
      tegelijk: nieuw.length,
    });

    // Uitgezet in Instellingen? Dan wordt hij wél bijgeschreven en verschijnt hij gewoon op
    // Profiel — alleen de aankondiging blijft achterwege. Een mijlpaal afzeggen is iets anders
    // dan hem niet verdienen.
    if (!prestatiesAan) return;

    if (AppState.currentState === 'active') {
      const prestatieUI = usePrestatieStore.getState();

      // **Voorgrond: het deelvenster, tenzij er iets zwaarders in beeld staat.**
      //
      // De viering was tot nu toe alleen de strook, en pas een tik verderop een venster. Sinds
      // sociaal delen is het venster het aanbod zelf ("je hebt dit — vertel het"), en dat werkt
      // alleen op het moment dat de mijlpaal binnenkomt; twee schermen verderop is de
      // aanleiding weg.
      //
      // Wat blijft staan is de reden dat de strook ooit een strook werd: een mijlpaal komt bijna
      // altijd binnen op precies het moment dat de reader het ontgrendelde personage viert, en
      // twee vensters die om dezelfde tik vragen is er één te veel. Vandaar de vlag — staat er
      // een `CharacterUnlockModal` of `AdModal` open, dan valt dit terug op de strook, en is het
      // deelvenster daarvandaan één tik weg (`prestatie-melding.tsx` → `toonDetail`).
      if (prestatieUI.onderbrekingBezet) {
        prestatieUI.zetTeVieren(aankondigen.id);
        return;
      }

      prestatieUI.toonDelen(aankondigen.id);
      return;
    }

    const naam = namen[aankondigen.id];
    const uitleg = uitleggen[aankondigen.categorie](aankondigen.drempel);
    void notificaties.toonNu(meldingTitel, `${naam} — ${uitleg}`, {
      kanaal: 'prestatie',
      data: { soort: 'prestatie', pad: '/profiel' },
    });
  }, [prestatiesAan, meldingTitel, namen, uitleggen]);

  // Elke wijziging in een van de vier tellers is een moment om te meten. Er staat geen debounce
  // omheen: `meet` doet geen netwerkwerk en stopt bij de eerste `nieuw.length === 0`.
  useEffect(() => {
    void meet();
  }, [
    meet,
    hoofdstukVoortgang,
    completedStories,
    streakDagen,
    laatsteActiviteitDatum,
    unlockedCharacters,
  ]);

  // Terug op de voorgrond: de streak kan intussen verlopen zijn en de sync kan voortgang van een
  // ander toestel hebben binnengehaald. Zelfde reden als bij `useStreak()`.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') void meet();
    });
    return () => abonnement.remove();
  }, [meet]);
}
