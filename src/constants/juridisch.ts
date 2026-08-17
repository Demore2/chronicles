/**
 * Juridische links (LAUNCH-PLAN.md A5).
 *
 * Google Play eist een publiek bereikbare privacybeleid-URL voor élke app, ook een zonder
 * advertenties en zonder accounts. De pagina zelf staat in dit project onder
 * `docs/privacy-policy.html` en wordt via GitHub Pages gepubliceerd — zie `docs/README.md`
 * voor de stappen.
 *
 * **Vul hieronder je GitHub-gebruikersnaam en reponaam in.** Zolang de placeholder blijft staan
 * verbergt Profiel de link (`privacyBeleidIsGepubliceerd` is dan `false`), zodat er nooit een
 * dode link in een release terechtkomt. Dezelfde URL moet straks in de Play Console onder
 * "Store settings → Privacy policy".
 */
export const PRIVACY_BELEID_URL =
  'https://GITHUB-GEBRUIKERSNAAM.github.io/REPONAAM/privacy-policy.html';

/**
 * `false` zolang `PRIVACY_BELEID_URL` nog de placeholder is. Wordt vanzelf `true` op het moment
 * dat de echte URL is ingevuld — er is dus niets anders om te vergeten aan te zetten.
 */
export const privacyBeleidIsGepubliceerd =
  !PRIVACY_BELEID_URL.includes('GITHUB-GEBRUIKERSNAAM') && !PRIVACY_BELEID_URL.includes('REPONAAM');
