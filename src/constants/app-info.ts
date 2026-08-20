/**
 * App-, store- en supportgegevens voor het instellingenscherm.
 *
 * Eén plek, zelfde afspraak als `juridisch.ts`: een link die nog niet bestaat staat hier als
 * placeholder en wordt door een afgeleide vlag herkend, zodat het scherm hem als "binnenkort"
 * toont in plaats van als knop die naar een 404 leidt. Zo kan er nooit een dode link meeliften
 * op een release, en is het aanzetten later één regel wijzigen.
 */

import Constants from 'expo-constants';

/**
 * Het versienummer uit `app.json`, niet een tweede keer overgetypt.
 *
 * `expo-constants` leest de manifest van de draaiende build, dus dit getal kan per definitie niet
 * uit de pas lopen met wat er op Play staat. De versionCode staat er bewust *niet* bij: die wordt
 * op de EAS-server bijgehouden (`cli.appVersionSource: "remote"`), dus elk getal dat we hier
 * zouden tonen is een gok.
 */
export const APP_VERSIE = Constants.expoConfig?.version ?? '1.0.0';

/** Het Android-package, zoals in `app.json`. Basis voor de Play-links hieronder. */
export const ANDROID_PAKKET = 'com.chronicles.historyapp';

/**
 * Staat de app in de Play Store?
 *
 * Zolang dit `false` is toont Instellingen "Rate app" als binnenkort-item: de listing bestaat nog
 * niet, dus de link zou een foutpagina openen. Zet dit op `true` zodra de app live is.
 */
export const APP_IS_GEPUBLICEERD = false;

/** De listing waar "Rate app" naartoe gaat zodra `APP_IS_GEPUBLICEERD` aan staat. */
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PAKKET}`;

/**
 * Het adres achter "Contact support" en "Delete account".
 *
 * Play toont het contactadres in de listing, en de door Play vereiste accountverwijdering loopt
 * er via een mailto naartoe. Het moet dus een postbus zijn die ook echt gelezen wordt: elk
 * verwijderverzoek komt hier binnen en moet met de hand worden afgehandeld zolang er geen edge
 * function is die het zelf doet.
 */
export const SUPPORT_EMAIL = 'businessthedemoreagency@gmail.com';

/**
 * `false` zolang `SUPPORT_EMAIL` de placeholder is; zie daar.
 *
 * De check kijkt naar het woord dat ín de placeholder staat, niet naar een adres dat er níét in
 * staat. Dat klinkt vanzelfsprekend, maar de vorige versie deed het omgekeerde en gaf voor de
 * placeholder `true` terug — waarmee "Contact support" en, erger, de door Play vereiste
 * accountverwijdering een mailto naar `SUPPORT-EMAIL-INVULLEN` openden. Een placeholder herken je
 * aan zichzelf; elk ander adres is per definitie een echt adres.
 */
export const supportEmailIsIngesteld = !SUPPORT_EMAIL.includes('INVULLEN');

/**
 * Algemene voorwaarden, gepubliceerd naast het privacybeleid (`docs/terms-of-service.html`).
 *
 * Het document zelf staat óók in de app (`app/profiel/terms.tsx`, tekst in
 * `constants/juridische-teksten.ts`); dit is de publieke kopie voor wie het buiten de app wil
 * lezen — en voor Play, dat naar een bereikbare URL vraagt. Wijzigt de ene, wijzig de andere mee.
 */
export const VOORWAARDEN_URL = 'https://demore.github.io/chronicles/terms-of-service.html';

/** `false` zolang `VOORWAARDEN_URL` de placeholder is. */
export const voorwaardenZijnGepubliceerd =
  !VOORWAARDEN_URL.includes('GITHUB-GEBRUIKERSNAAM') && !VOORWAARDEN_URL.includes('REPONAAM');
