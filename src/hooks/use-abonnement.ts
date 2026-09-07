import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isProActief, useAbonnementStore } from '@/store/abonnement-store';
import { isAbonnementActief, useSubscriptionStore } from '@/store/subscription-store';

type AbonnementStatus = {
  isPremium: boolean;
  /** Wanneer een tijdelijke Pro-periode afloopt (epoch-ms), of `null` bij vast of geen Pro. */
  proTot: number | null;
};

/**
 * De abonnementsstatus zoals de rest van de app hem ziet.
 *
 * **De serverrij is sinds deze fase de bron, met het lokale tegoed ernaast.** `subscription-store`
 * spiegelt `public.user_subscriptions` en is wat het *account* heeft; `abonnement-store.proTot` is
 * een tegoed dat op dít toestel verdiend is met een uitnodiging. Het zijn twee verschillende
 * dingen, dus ze worden opgeteld en niet tegen elkaar afgewogen: wie een van beide heeft, heeft
 * Pro. Zo antwoordt de hele app vanuit één plek — banner, advertenties, de onderbreking in de
 * reader en het "Your plan"-regeltje kijken allemaal hierheen.
 *
 * `abonnement-store.isPro` zit er nog in maar staat nu altijd op `false`: dat vlaggetje werd
 * uitsluitend gezet door de dev-schakelaar "Simulate Pro" in Instellingen, en die is eruit nu
 * premium via de server te zetten is (zie `docs/TEST_ACCOUNTS.md`). Het blijft meegewogen zodat
 * `isProActief` één betekenis houdt.
 *
 * **Beide helften verlopen door het verstrijken van tijd**, niet door een toestandswissel — een
 * abonnement met een datum in het verleden en een verlopen week Pro tellen allebei niet meer.
 * Daarom dezelfde vorm als `useStreak()`: een peilmoment in state, opnieuw gezet bij elke
 * terugkeer naar de voorgrond. De klok tijdens het renderen aflezen zou de zuiverheidsregel van
 * `react-hooks` breken en, erger, een scherm dat al uren openstaat op een verlopen periode laten
 * staan.
 *
 * **De dagelijkse verhaallimiet kijkt hier sinds de rate limiting ook naar.** Hier stond een
 * waarschuwing: `magVerhaalOpenen` is een methode ván `abonnement-store` en zag de andere store
 * niet, dus een Pro-lezer met alleen een serverabonnement liep tegen de limiet aan. Die optelsom
 * staat nu als `heeftProNu()` in `abonnement-store` — dezelfde twee helften, maar dan als losse
 * functie voor een beslissing op één moment in plaats van als hook voor de weergave.
 * **Wijzigt de een, wijzig de ander mee.**
 */
export function useAbonnement(): AbonnementStatus {
  // Vier losse selectors, geen `a() || b()`: dat laatste slaat bij kortsluiting een hook-aanroep
  // over en breekt de hook-volgorde. Zelfde reden als bij `SyncIndicator`.
  const isPro = useAbonnementStore((state) => state.isPro);
  const proTot = useAbonnementStore((state) => state.proTot);
  const tier = useSubscriptionStore((state) => state.tier);
  const trialEndsAt = useSubscriptionStore((state) => state.trialEndsAt);
  const subscriptionEndsAt = useSubscriptionStore((state) => state.subscriptionEndsAt);
  const [peilmoment, setPeilmoment] = useState(() => Date.now());

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setPeilmoment(Date.now());
    });
    return () => abonnement.remove();
  }, []);

  const serverPro = isAbonnementActief({ tier, trialEndsAt, subscriptionEndsAt }, peilmoment);
  const lokaalPro = isProActief({ isPro, proTot }, peilmoment);

  return {
    isPremium: serverPro || lokaalPro,
    // Een doorlopend abonnement heeft geen einddatum om te tonen; alleen een lopend tegoed wel.
    proTot: serverPro || isPro || proTot === null || proTot <= peilmoment ? null : proTot,
  };
}
