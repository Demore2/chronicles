import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isProActief, useAbonnementStore } from '@/store/abonnement-store';

type AbonnementStatus = {
  isPremium: boolean;
  /** Wanneer een tijdelijke Pro-periode afloopt (epoch-ms), of `null` bij vast of geen Pro. */
  proTot: number | null;
};

/**
 * De abonnementsstatus zoals de rest van de app hem ziet.
 *
 * Gaf tot voor kort hardcoded `{ isPremium: false }` terug; sinds het gratis/Pro-model leest hij
 * `abonnement-store`. Dat verandert in de praktijk nog weinig — `isPro` wordt alleen door de
 * dev-schakelaar in Instellingen gezet, want er is nog geen Google Play Billing. Wat het wél doet
 * is de hele app vanuit één bron laten antwoorden: banner, advertenties, leeslimiet en het
 * "Your plan"-regeltje kijken allemaal hierheen.
 *
 * **Sinds de uitnodigingsbeloningen kan Pro ook tijdelijk zijn** (`proTot`), en dat verloopt door
 * het verstrijken van tijd en niet door een toestandswissel. Precies dezelfde vorm als
 * `useStreak()` dus: een peilmoment in state, opnieuw gezet bij elke terugkeer naar de voorgrond.
 * De klok tijdens het renderen aflezen zou de zuiverheidsregel van `react-hooks` breken en, erger,
 * een scherm dat al uren openstaat op een verlopen week Pro laten staan.
 *
 * TODO (v1.1): `setPro` laten zetten door een geverifieerde Play-aankoop in plaats van door een
 * schakelaar. De vorm van deze hook verandert daar niet van.
 */
export function useAbonnement(): AbonnementStatus {
  const isPro = useAbonnementStore((state) => state.isPro);
  const proTot = useAbonnementStore((state) => state.proTot);
  const [peilmoment, setPeilmoment] = useState(() => Date.now());

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setPeilmoment(Date.now());
    });
    return () => abonnement.remove();
  }, []);

  return {
    isPremium: isProActief({ isPro, proTot }, peilmoment),
    // Een vast abonnement heeft geen einddatum om te tonen; alleen een lopend tegoed wel.
    proTot: isPro || proTot === null || proTot <= peilmoment ? null : proTot,
  };
}
