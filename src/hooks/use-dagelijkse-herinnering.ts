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
      // De toestemming kan buiten de app zijn ingetrokken (Instellingen → Meldingen). Dan is de
      // voorkeur niet waar te maken en zetten we hem terug, zodat de schakelaar op Profiel de
      // werkelijkheid toont in plaats van een belofte.
      const mag = await notificaties.heeftToestemming();
      if (afgebroken) return;
      if (!mag) {
        useNotificatieStore.getState().setHerinnering(false);
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
 * herinneren. Bij toestemming zet dit alleen de voorkeur aan — het plannen zelf doet
 * `useDagelijkseHerinnering`, die de actuele taal bij de hand heeft.
 */
export async function biedHerinneringAan(): Promise<void> {
  const store = useNotificatieStore.getState();
  if (store.toestemmingGevraagd || store.herinneringAan) return;
  store.markeerToestemmingGevraagd();
  const toegestaan = await notificaties.vraagToestemming();
  if (toegestaan) {
    store.setHerinnering(true);
  }
}
