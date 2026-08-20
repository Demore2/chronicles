/**
 * Juridische links (LAUNCH-PLAN.md A5).
 *
 * Google Play eist een publiek bereikbare privacybeleid-URL voor élke app, ook een zonder
 * advertenties en zonder accounts. De pagina zelf staat in dit project onder
 * `docs/privacy-policy.html` en wordt via GitHub Pages gepubliceerd — zie `docs/README.md`
 * voor de stappen.
 *
 * **De pagina staat online.** De URL hieronder is de gepubliceerde versie; dezelfde URL hoort in
 * de Play Console onder "Store settings → Privacy policy". De vlag hieronder blijft bestaan
 * omdat hij de plek markeert waar een placeholder ooit stond: wordt de host ooit verhuisd, dan
 * verbergt het scherm de link vanzelf zolang er weer een placeholder staat, in plaats van naar
 * een 404 te wijzen.
 */
export const PRIVACY_BELEID_URL = 'https://demore.github.io/chronicles/privacy-policy.html';

/**
 * `false` zolang `PRIVACY_BELEID_URL` nog de placeholder is. Wordt vanzelf `true` op het moment
 * dat de echte URL is ingevuld — er is dus niets anders om te vergeten aan te zetten.
 */
export const privacyBeleidIsGepubliceerd =
  !PRIVACY_BELEID_URL.includes('GITHUB-GEBRUIKERSNAAM') && !PRIVACY_BELEID_URL.includes('REPONAAM');
