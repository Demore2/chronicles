/**
 * De namen die Firebase Analytics te zien krijgt, op één plek.
 *
 * **Een gebeurtenisnaam is een schema, geen tekst.** Firebase legt de eerste spelling vast, maakt
 * van elke variant een tweede rapport, en kan die twee daarna niet samenvoegen of hernoemen. Een
 * typefout kost dus data die je pas maanden later mist. Hier is elke naam een sleutel van een
 * `as const`-object, dus een typefout is een compileerfout — dat `as const` is het hele punt van
 * dit bestand, een gewoon object zou `string` opleveren en niets afvangen.
 *
 * Grenzen die Firebase stelt en die hieronder gehaald moeten blijven: een gebeurtenisnaam is
 * maximaal 40 tekens, een parameternaam 40, een tekstwaarde 100, en er passen 25 parameters in
 * één gebeurtenis. Namen van gebruikerseigenschappen zijn maximaal 24 tekens.
 */

/**
 * De eigen gebeurtenissen. Tien stuks, en dat is met opzet weinig: elke naam hier is een vraag
 * die je echt gaat stellen, en een gebeurtenis die niemand ooit opzoekt maakt de andere negen
 * moeilijker te vinden.
 *
 * `login` en `sign_up` staan hier niet bij, maar worden **wel** gemeten — zie
 * `logInloggen`/`logRegistreren` in `hooks/useAnalytics.ts`. Firebase verzamelt die twee namelijk
 * *niet* vanzelf: automatisch verzameld zijn alleen `first_open`, `session_start`,
 * `user_engagement`, `app_update`, `os_update` en dergelijke (de volledige lijst staat als
 * `ReservedEventNames` in `@react-native-firebase/analytics`, en `login`/`sign_up` staan er niet
 * in). Ze zijn *aanbevolen* events: je logt ze zelf, en in ruil vult Firebase er zijn
 * standaardrapporten over nieuwe versus terugkerende lezers mee.
 */
export const ANALYTICS_EVENTS = {
  /** Een verhaal is geopend (het hoofdstukoverzicht is bereikt). Bovenkant van de trechter. */
  STORY_READ: 'story_read',
  /** Eén hoofdstuk afgevinkt met "Mark Complete". De echte betrokkenheidsmaat. */
  CHAPTER_COMPLETED: 'chapter_completed',
  /** Het láátste hoofdstuk is afgevinkt — alles gelezen, personage nog niet opgehaald. */
  STORY_FINISHED: 'story_finished',
  /** De knop "Unlock <naam>" is ingedrukt. Bewust los van `STORY_FINISHED`: zie de reader. */
  CHAR_UNLOCKED: 'char_unlocked',
  /** Een gratis lezer liep tegen de dagelijkse limiet aan. Het directe signaal voor Pro. */
  LIMIT_REACHED: 'story_limit_reached',
  /** Een quizvraag is nagekeken. `correct` zegt of het antwoord goed was. */
  QUIZ_ANSWER: 'quiz_answer',
  /** Er is op een peiling gestemd. */
  POLL_VOTE: 'poll_vote',
  /** Er is een optie in een keuzepunt gekozen. */
  CHOICE_SELECT: 'choice_select',
  /** Het Pro-venster is geopend. `source` zegt vanwaar. */
  PAYWALL_VIEWED: 'paywall_viewed',
  /**
   * De upgradeknop is ingedrukt terwijl er niets te kopen valt.
   *
   * **Dit is nadrukkelijk geen aankoop.** Google Play Billing is een stub (zie
   * `constants/monetisatie.ts`), dus wat hier gemeten wordt is de *intentie*, met `status` en
   * `reason` erbij zodat later te zien is dat deze rijen uit de stub-periode komen. Een
   * gebeurtenis `subscription_upgrade` of Firebase' eigen `purchase` zou een omzet rapporteren
   * die niet bestaat, en dát rapport is achteraf niet meer schoon te krijgen. Vervang dit pas
   * door `purchase` als er echt iets gekocht kan worden.
   */
  SUBSCRIPTION_ATTEMPT: 'subscription_attempt',
  /**
   * Dit toestel heeft een FCM-token en staat in `user_devices`. Eén keer per registratie, niet
   * bij elke start — de hook schrijft alleen bij een échte wijziging.
   *
   * Zonder deze gebeurtenis is "hoeveel lezers zijn überhaupt bereikbaar" niet te beantwoorden,
   * en dat is de noemer onder elk bereikcijfer van de push-campagnes.
   */
  PUSH_REGISTERED: 'push_registered',
  /**
   * Een melding is binnengekomen terwijl de app op de voorgrond stond.
   *
   * Bewust *niet* gelogd voor meldingen die aankomen terwijl de app dicht is: daar draait geen
   * code van ons, dus dat is niet te meten. Wie aflevering écht wil tellen heeft de
   * BigQuery-export van FCM nodig, niet dit.
   */
  NOTIFICATION_RECEIVED: 'notification_received',
  /**
   * Er is op een melding getikt. `soort` zegt welke categorie, `pad` waar hij heen ging.
   *
   * Dit is de enige gebeurtenis die de vraag "werkt onze retentie-aanpak?" beantwoordt: het
   * aantal verzonden meldingen staat in `notifications_sent`, en dit is de teller erboven.
   */
  NOTIFICATION_OPENED: 'notification_opened',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * De gebruikerseigenschappen: eigenschappen van de lezer waarmee je elk rapport kunt opdelen
 * ("hoe leest een Pro-lezer anders dan een gratis lezer?"). Drie, niet meer — Firebase staat er 25
 * toe, maar elke eigenschap die niemand als filter gebruikt is een kolom die je bij het lezen van
 * een rapport moet overslaan.
 *
 * Ze worden gezet door `useAnalytics()` in de root layout, die de stores volgt — niet eenmalig bij
 * het inloggen. Een eigenschap die alleen bij het inloggen wordt gezet loopt achter zodra de lezer
 * in dezelfde sessie iets ontgrendelt of Pro wordt.
 */
export const USER_PROPERTIES = {
  /** `'free'` of `'pro'`. */
  TIER: 'subscription_tier',
  /**
   * De *app*-taal uit `taal-store`, niet de systeemtaal.
   *
   * Firebase heeft zelf al een "Language"-dimensie, maar die komt van het toestel. Zodra de
   * taalkiezer aan gaat (`SHOW_LANGUAGE_PICKER` in Instellingen) lopen die twee uiteen, en dan
   * is déze de interessante. Daarom een eigen naam en niet `language`.
   */
  LANGUAGE: 'app_language',
  /** Hoeveel personages deze lezer heeft. Als tekst — Firebase kent alleen tekstwaarden. */
  TOTAL_CHARS: 'total_characters',
} as const;

export type UserProperty = (typeof USER_PROPERTIES)[keyof typeof USER_PROPERTIES];

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
