type AbonnementStatus = {
  isPremium: boolean;
};

// TODO: koppelen aan Google Play Billing zodra abonnementen beschikbaar zijn.
// Deze hook geeft tot die tijd altijd { isPremium: false } terug, zodat alle
// call-sites al op de uiteindelijke vorm zijn voorbereid.
export function useAbonnement(): AbonnementStatus {
  return { isPremium: false };
}
