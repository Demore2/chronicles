import { useAbonnementStore } from '@/store/abonnement-store';

type AbonnementStatus = {
  isPremium: boolean;
};

/**
 * De abonnementsstatus zoals de rest van de app hem ziet.
 *
 * Gaf tot voor kort hardcoded `{ isPremium: false }` terug; sinds het gratis/Pro-model leest hij
 * `abonnement-store`. Dat verandert in de praktijk nog niets — de vlag daar wordt alleen door de
 * dev-schakelaar in Instellingen gezet, want er is nog geen Google Play Billing. Wat het wél doet
 * is de hele app vanuit één bron laten antwoorden: banner, advertenties, leeslimiet en het
 * "Your plan"-regeltje kijken allemaal hierheen.
 *
 * TODO (v1.1): `setPro` laten zetten door een geverifieerde Play-aankoop in plaats van door een
 * schakelaar. De vorm van deze hook verandert daar niet van.
 */
export function useAbonnement(): AbonnementStatus {
  const isPro = useAbonnementStore((state) => state.isPro);
  return { isPremium: isPro };
}
