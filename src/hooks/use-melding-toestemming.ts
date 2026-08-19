import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { notificaties } from '@/constants/notificaties';
import { useNotificatieStore } from '@/store/notificatie-store';

/**
 * De systeemtoestemming voor meldingen, zoals Instellingen hem moet tonen.
 *
 * **Waarom dit bestaat sinds de meldingen vast aan staan.** De schakelaars in Instellingen waren
 * tot nu toe twee dingen tegelijk: een voorkeur én de plek waar de toestemming gevraagd werd. Zet
 * je de voorkeur vast, dan valt dat tweede weg — en dan kan een lezer een scherm zien dat drie
 * meldingen belooft terwijl Android ze allemaal tegenhoudt, zonder één aanwijzing waarom er nooit
 * iets komt. Deze hook is die aanwijzing.
 *
 * `undefined` betekent "nog niet gemeten", niet "nee". Het verschil telt: de regel die om
 * toestemming vraagt mag niet één frame verschijnen om daarna weg te springen.
 *
 * De her-evaluatie bij terugkeer naar de voorgrond is geen luxe. De enige plek waar een lezer de
 * toestemming weer aan kan zetten nadat hij "niet toestaan" koos, zijn de systeeminstellingen —
 * dus hij komt per definitie terug uit een andere app, en het scherm moet dan bijgewerkt zijn.
 */
export function useMeldingToestemming(): {
  /** `undefined` zolang de eerste meting loopt. */
  toestemming: boolean | undefined;
  /** Vraagt toestemming, of stuurt naar de systeeminstellingen als dat niet meer kan. */
  vraagAan: () => Promise<void>;
} {
  const [toestemming, setToestemming] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let afgebroken = false;

    async function meet() {
      const mag = await notificaties.heeftToestemming();
      if (!afgebroken) setToestemming(mag);
    }

    meet();
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') meet();
    });
    return () => {
      afgebroken = true;
      abonnement.remove();
    };
  }, []);

  const vraagAan = useCallback(async () => {
    const toegestaan = await notificaties.vraagToestemming();
    // Dit telt als "het venster is hier geweest", ook als het niet verscheen omdat de lezer al
    // eerder definitief weigerde. Anders vraagt de reader er na het volgende hoofdstuk nóg eens
    // om, op een moment dat het systeem sowieso niets meer toont.
    useNotificatieStore.getState().markeerToestemmingGevraagd();
    setToestemming(toegestaan);
    if (toegestaan) return;
    // `vraagToestemming` geeft ook `false` als het systeemvenster niet meer verschijnt
    // (`canAskAgain: false`). Dan is de app uitgepraat en is de enige route de systeeminstellingen
    // — die openen is hier de eerlijke afloop van een tik op "Meldingen toestaan".
    await Linking.openSettings().catch(() => {});
  }, []);

  return { toestemming, vraagAan };
}
