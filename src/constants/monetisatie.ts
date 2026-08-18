/**
 * De schakelaars van het gratis/Pro-model, op één plek.
 *
 * Chronicles kent sinds deze fase drie lagen: een gratis lezer opent een beperkt aantal *nieuwe*
 * verhalen per dag en krijgt na een uitgelezen verhaal een onderbreking te zien; een Pro-lezer
 * krijgt geen van beide. Wat "Pro" betekent leest `useAbonnement()` uit `abonnement-store`.
 *
 * **Beide vlaggen hieronder zijn releaseblokkers zolang Google Play Billing een stub is.** Dat is
 * dezelfde afweging als bij `PRO_BANNER_ENABLED` in `pro-access-banner.tsx` en `ADS_ENABLED` in
 * `ad-banner.tsx`, maar hier weegt hij zwaarder: een limiet die je alleen met een aankoop kunt
 * opheffen terwijl er niets te kopen valt, is een muur zonder deur. Een reviewer die daar
 * tegenaan loopt wijst de app af, en terecht.
 *
 * Zet ze dus op `false` vóór de productiebuild, óf lever ze samen met een werkende aankoop. Ze
 * staan nu aan zodat het model te bekijken en te testen is (zie de dev-schakelaar "Simulate Pro"
 * onderaan Instellingen, die alleen in `__DEV__` bestaat).
 */

/**
 * Hoeveel *nieuwe* verhalen een gratis lezer per dag mag openen.
 *
 * Nieuw is hier het sleutelwoord: een verhaal dat je vandaag al opende telt niet nog eens, en een
 * verhaal dat je al helemaal uitgelezen hebt telt nooit mee. Anders zou je met de teller op nul
 * niet terug kunnen naar een hoofdstuk dat je al gelezen had — een limiet hoort nieuwe inhoud te
 * doseren, niet je eigen boekenkast op slot te doen.
 */
export const DAGELIJKSE_VERHAAL_LIMIET = 2;

/** De dagelijkse leeslimiet zelf. `false` = elke lezer leest onbeperkt, zoals vóór deze fase. */
export const VERHAAL_LIMIET_ENABLED = true;

/**
 * De onderbreking ná een uitgelezen verhaal (`ad-modal.tsx`).
 *
 * Los van `ADS_ENABLED` in `ad-banner.tsx`, dat over de vaste banner op vier schermen gaat en
 * bewust uit blijft. Dit is een ander moment en een andere afweging: één scherm aan het eind van
 * acht hoofdstukken, met een aftelling en een uitweg. Ook dit is nog een placeholder — er zit geen
 * AdMob achter — en het scherm zegt dat er ook bij.
 */
export const AD_ONDERBREKING_ENABLED = true;

/** Hoeveel seconden de onderbreking blijft staan voordat hij weggeklikt kan worden. */
export const AD_AFTELLING_SECONDEN = 3;
