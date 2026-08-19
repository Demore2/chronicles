import { useEffect } from 'react';

import { notificaties } from '@/constants/notificaties';
import { useVertaling } from '@/hooks/use-vertaling';
import { useNotificatieStore } from '@/store/notificatie-store';

/**
 * Houdt de geplande herinnering gelijk aan de voorkeur van de gebruiker (LAUNCH-PLAN.md B6).
 *
 * Hangt in de root-layout, zodat er precies één plek is die plant en annuleert. Dat de tekst in
 * de dependencies staat is geen detail: een notificatie wordt gepland mét zijn tekst, dus na een
 * taalwissel moet hij opnieuw gezet worden — anders krijgt een Duitse gebruiker over een week
 * nog steeds de Engelse zin die bij het aanzetten gold.
 */
export function useDagelijkseHerinnering() {
  const { t } = useVertaling();
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  // Het tijdstip staat om dezelfde reden in de dependencies als de tekst: een geplande notificatie
  // draagt zijn uur in zich, dus een verzet tijdstip moet opnieuw gezet worden.
  const uur = useNotificatieStore((state) => state.herinneringUur);
  const minuut = useNotificatieStore((state) => state.herinneringMinuut);
  const titel = t((s) => s.notificatie.titel);
  const tekst = t((s) => s.notificatie.tekst);

  useEffect(() => {
    let afgebroken = false;

    async function synchroniseer() {
      if (!herinneringAan) {
        await notificaties.annuleerDagelijkseHerinnering();
        return;
      }
      // De toestemming kan buiten de app zijn ingetrokken (Instellingen → Meldingen). Vroeger
      // zette dit de voorkeur terug op uit; dat kan niet meer, want de herinnering hoort bij het
      // lezen en heeft geen schakelaar meer. De voorkeur blijft dus staan en er wordt niets
      // gepland — Instellingen leest de systeemtoestemming zélf en toont daar de werkelijkheid,
      // in plaats van een uitgezette schakelaar die de lezer niet terug kan zetten.
      const mag = await notificaties.heeftToestemming();
      if (afgebroken) return;
      if (!mag) {
        await notificaties.annuleerDagelijkseHerinnering();
        return;
      }
      await notificaties.planDagelijkseHerinnering(titel, tekst, uur, minuut);
    }

    synchroniseer();
    return () => {
      afgebroken = true;
    };
  }, [herinneringAan, titel, tekst, uur, minuut]);
}

/**
 * Vraagt één keer om toestemming, ná het eerste afgeronde hoofdstuk.
 *
 * Niet bij de eerste start: op dat moment weet de gebruiker nog niet wat de app doet, en een
 * geweigerde Android-melding komt niet terug. Na een afgerond hoofdstuk is er iets om aan te
 * herinneren.
 *
 * **De voorwaarde is alleen `toestemmingGevraagd`.** Hier stond ook `|| store.herinneringAan`,
 * uit de tijd dat die vlag pas aanging als je de schakelaar omzette. Nu staat hij vanaf de eerste
 * start aan, en met die oude voorwaarde zou het systeemvenster dus nooit meer verschijnen — geen
 * toestemming, geen enkele melding, en niets dat dat laat zien. Het plannen doet
 * `useDagelijkseHerinnering`, die de actuele taal bij de hand heeft.
 */
export async function biedHerinneringAan(): Promise<void> {
  const store = useNotificatieStore.getState();
  if (store.toestemmingGevraagd) return;
  store.markeerToestemmingGevraagd();
  await notificaties.vraagToestemming();
}
