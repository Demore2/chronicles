import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { berekenHuidigeStreak, useVoortgangStore } from '@/store/voortgang-store';

/**
 * De streak zoals hij *nu* is, inclusief verlopen (LAUNCH-PLAN.md B6).
 *
 * `useVoortgangStore().streakDagen` is de opgeslagen waarde en verandert alleen bij een
 * leesactie — hij weet niet dat er sindsdien twee dagen voorbij zijn. Vandaar de her-evaluatie
 * bij elke terugkeer naar de voorgrond: een gebruiker die de app gisteren openliet en hem
 * vandaag weer oppakt, hoort niet naar het getal van gisteren te kijken.
 */
export function useStreak(): number {
  const streakDagen = useVoortgangStore((state) => state.streakDagen);
  const laatsteActiviteitDatum = useVoortgangStore((state) => state.laatsteActiviteitDatum);
  const [peilmoment, setPeilmoment] = useState(() => Date.now());

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setPeilmoment(Date.now());
    });
    return () => abonnement.remove();
  }, []);

  return useMemo(
    () => berekenHuidigeStreak(streakDagen, laatsteActiviteitDatum, new Date(peilmoment)),
    [streakDagen, laatsteActiviteitDatum, peilmoment]
  );
}
