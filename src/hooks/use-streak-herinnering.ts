import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import {
  notificaties,
  STREAK_HERINNERING_MINUUT,
  STREAK_HERINNERING_UUR,
} from '@/constants/notificaties';
import { useVertaling } from '@/hooks/use-vertaling';
import { useNotificatieStore } from '@/store/notificatie-store';
import { berekenHuidigeStreak, useVoortgangStore, vandaagSleutel } from '@/store/voortgang-store';

/**
 * De streakwaarschuwing: "je reeks loopt vanavond af, één hoofdstuk houdt hem in leven."
 *
 * **Dit is de melding die van alle meldingen in dit project het meest voor DAU doet, en hij heeft
 * geen server nodig.** Het toestel weet zelf wanneer je voor het laatst las; FCM zou hier alleen
 * een netwerkafhankelijkheid en een tweede plek toevoegen waar het stuk kan.
 *
 * **De kern zit in wanneer er gepland wordt, niet in wat er gestuurd wordt.** Een lokale melding
 * kan alleen gezet worden terwijl de app open is, en de dag waarop de waarschuwing moet afgaan is
 * juist een dag dat de lezer de app *niet* opent. De oplossing is vooruitplannen:
 *
 * - Heb je vandaag gelezen? Dan staat er niets op het spel vandaag — plan de waarschuwing voor
 *   **morgenavond**. Open je de app morgen niet, dan gaat hij alsnog af.
 * - Heb je vandaag nog niet gelezen en is het nog vóór 20:30? Dan is hij voor **vanavond**.
 * - Is het al ná 20:30 en heb je niet gelezen? Dan is er niets meer te waarschuwen; de avond is
 *   voorbij en de reeks redt zichzelf niet meer met een melding.
 *
 * Elke herberekening overschrijft de vorige (vaste identifier), dus dit mag zo vaak draaien als
 * het wil. Mount hem één keer, in de root layout — net als `useDagelijkseHerinnering()`.
 */
export function useStreakHerinnering(): void {
  const { t } = useVertaling();
  const streakAan = useNotificatieStore((state) => state.streakAan);
  const streakDagen = useVoortgangStore((state) => state.streakDagen);
  const laatsteActiviteitDatum = useVoortgangStore((state) => state.laatsteActiviteitDatum);

  // De tekst hoort net als bij de dagelijkse herinnering in de dependencies: een geplande
  // notificatie draagt zijn tekst in zich, dus na een taalwissel moet hij opnieuw gezet worden.
  const titel = t((s) => s.notificatie.streakTitel);
  const tekstVoor = t((s) => s.notificatie.streakTekst);

  const herplan = useCallback(async () => {
    if (!streakAan) {
      await notificaties.annuleerStreakHerinnering();
      return;
    }

    // Zonder toestemming valt er niets te plannen. Bewust niet erom vragen: dat venster is er
    // één per installatie en wordt besteed na het eerste afgeronde hoofdstuk
    // (`biedHerinneringAan`).
    const mag = await notificaties.heeftToestemming();
    if (!mag) {
      await notificaties.annuleerStreakHerinnering();
      return;
    }

    const nu = new Date();
    const streak = berekenHuidigeStreak(streakDagen, laatsteActiviteitDatum, nu);

    // Geen streak = niets op het spel. Een "je reeks van 0 dagen loopt af" is geen waarschuwing
    // maar een raadsel.
    if (streak === 0) {
      await notificaties.annuleerStreakHerinnering();
      return;
    }

    const alGelezenVandaag = laatsteActiviteitDatum === vandaagSleutel(nu);

    const moment = new Date(nu);
    moment.setHours(STREAK_HERINNERING_UUR, STREAK_HERINNERING_MINUUT, 0, 0);
    // Vandaag gelezen: de reeks is veilig tot morgenavond, dus dan pas waarschuwen. Dit is de
    // stap die de melding laat werken op een dag dat de app dicht blijft.
    if (alGelezenVandaag) moment.setDate(moment.getDate() + 1);

    if (moment.getTime() <= nu.getTime()) {
      // Niet gelezen en het is al ná 20:30. Vooruitplannen naar morgen zou een waarschuwing
      // opleveren voor een reeks die vannacht al breekt.
      await notificaties.annuleerStreakHerinnering();
      return;
    }

    // Het getal in de tekst is de streak zoals hij is op het moment van *plannen*. Dat klopt ook
    // bij het afgaan: gaat de melding af, dan is er sindsdien niet gelezen — precies de reden dat
    // hij afgaat — en is de reeks dus niet gegroeid.
    await notificaties.planStreakHerinnering(titel, tekstVoor(streak), moment);
  }, [streakAan, streakDagen, laatsteActiviteitDatum, titel, tekstVoor]);

  useEffect(() => {
    void herplan();
  }, [herplan]);

  /**
   * Ook herberekenen bij elke terugkeer naar de voorgrond.
   *
   * Een streak verloopt door het verstrijken van tijd en niet door een state-wijziging (zie
   * `useStreak`), dus zonder dit blijft een app die dagenlang open in de achtergrond hing met de
   * planning van toen zitten — en dan waarschuwt hij over een reeks die al gebroken is.
   */
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') void herplan();
    });
    return () => abonnement.remove();
  }, [herplan]);
}
