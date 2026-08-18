/**
 * De namen die Firebase Analytics te zien krijgt, op één plek.
 *
 * Twee redenen dat dit een tabel is en geen losse strings in de schermen:
 *
 * 1. **Een gebeurtenisnaam is een schema, geen tekst.** Firebase legt de eerste spelling vast en
 *    maakt van elke variant een tweede rapport; `story_completed` en `story_complete` naast
 *    elkaar zijn niet samen te voegen en niet te hernoemen. Een typefout kost dus data die je
 *    pas maanden later mist. Hier is het een sleutel van een `as const`-object, dus een typefout
 *    is een compileerfout.
 * 2. **De sleutels zijn Nederlands, de waarden Engels.** Dat is dezelfde afspraak als in de rest
 *    van het project (interne namen Nederlands, zie CLAUDE.md), maar hier heeft het een extra
 *    functie: de kolomnamen in het Firebase-dashboard zijn de waarden, en die leest straks ook
 *    iemand die dit project niet kent.
 *
 * Grenzen die Firebase stelt en die hieronder gehaald moeten blijven: een gebeurtenisnaam is
 * maximaal 40 tekens, een parameternaam 40, een tekstwaarde 100, en er passen 25 parameters in
 * één gebeurtenis. Namen van gebruikerseigenschappen zijn maximaal 24 tekens.
 */

/**
 * De eigen gebeurtenissen. `login` en `sign_up` staan hier bewust *niet* bij: dat zijn
 * gereserveerde namen die Firebase zelf in zijn standaardrapporten gebruikt, en `logEvent`
 * weigert ze. Die gaan via `logInloggen` / `logRegistreren` in `lib/analytics.ts`.
 */
export const ANALYTICS_GEBEURTENIS = {
  /** Een verhaal is geopend (het hoofdstukoverzicht is bereikt). Bovenkant van de trechter. */
  verhaalGestart: 'story_started',
  /** Eén hoofdstuk afgevinkt met "Mark Complete". De echte betrokkenheidsmaat. */
  hoofdstukVoltooid: 'chapter_completed',
  /** Het láátste hoofdstuk is afgevinkt — alles gelezen, personage nog niet opgehaald. */
  verhaalVoltooid: 'story_completed',
  /** De knop "Unlock <naam>" is ingedrukt. Bewust los van `verhaalVoltooid`: zie de reader. */
  personageOntgrendeld: 'character_unlocked',
  /** Een gratis lezer liep tegen de dagelijkse limiet aan. Het directe signaal voor Pro. */
  limietBereikt: 'story_limit_reached',
  /** Een quizvraag is nagekeken. `correct` zegt of het antwoord goed was. */
  quizBeantwoord: 'quiz_answered',
  /** Er is op een peiling gestemd. */
  pollGestemd: 'poll_voted',
  /** Er is een optie in een keuzepunt gekozen. */
  keuzeGemaakt: 'choice_made',
  /** Het Pro-venster is geopend. */
  paywallGetoond: 'paywall_viewed',
  /**
   * De upgradeknop in het Pro-venster is ingedrukt.
   *
   * **Dit is nadrukkelijk geen aankoop.** Google Play Billing is een stub (zie
   * `constants/monetisatie.ts`), dus wat hier gemeten wordt is de *intentie*: hoeveel lezers
   * zouden willen betalen. Een gebeurtenis `subscription_upgrade` of `purchase` zou een omzet
   * rapporteren die niet bestaat, en dat rapport is daarna niet meer schoon te krijgen. Hernoem
   * dit pas als er echt iets gekocht kan worden — en gebruik dan Firebase's eigen `purchase`.
   */
  paywallUpgradeGedrukt: 'paywall_upgrade_pressed',
} as const;

export type AnalyticsGebeurtenis =
  (typeof ANALYTICS_GEBEURTENIS)[keyof typeof ANALYTICS_GEBEURTENIS];

/**
 * De gebruikerseigenschappen: eigenschappen van de lezer waarmee je elk rapport kunt opdelen
 * ("hoe leest een Pro-lezer anders dan een gratis lezer?").
 *
 * Ze worden gezet door `useAnalytics()` in de root layout, die naar de stores kijkt — niet
 * eenmalig bij het inloggen. Een eigenschap die alleen bij het inloggen wordt gezet loopt achter
 * zodra de lezer in dezelfde sessie iets ontgrendelt of Pro wordt.
 */
export const ANALYTICS_EIGENSCHAP = {
  /** `'free'` of `'pro'`. */
  tier: 'user_tier',
  /** Hoeveel personages deze lezer heeft. Als tekst — Firebase kent alleen tekstwaarden. */
  personages: 'characters_unlocked',
  /**
   * De *app*-taal uit `taal-store`, niet de systeemtaal.
   *
   * Firebase heeft zelf al een "Language"-dimensie, maar die komt van het toestel. Zodra de
   * taalkiezer aan gaat (`SHOW_LANGUAGE_PICKER` in Instellingen) lopen die twee uiteen, en dan
   * is déze de interessante.
   */
  taal: 'language',
} as const;

/**
 * Verzamelt Chronicles standaard gebruiksstatistieken?
 *
 * `true`: analytics staat aan zodra de app start en de lezer kan het uitzetten in Instellingen
 * (Privacy). Dat is een bewuste keuze en een andere dan bij de e-mailvoorkeuren, die standaard
 * uit staan omdat toestemming voor marketing actief gegeven moet worden.
 *
 * **De keerzijde staat in `docs/README.md`:** het Data Safety-formulier en de privacypagina
 * moeten vertellen dát dit gebeurt, en voor EU-lezers is "gerechtvaardigd belang" voor
 * niet-essentiële statistiek een standpunt dat de EDPB betwist. Wie op zeker wil spelen zet dit
 * op `false` — dan blijft alles hieronder werken, maar verzamelt Firebase pas iets nadat de
 * lezer de schakelaar heeft omgezet.
 */
export const STANDAARD_ANALYTICS_TOESTEMMING = true;
