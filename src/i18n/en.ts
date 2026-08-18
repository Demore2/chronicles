import type { PrestatieId } from '@/constants/prestaties';

// Bron van waarheid voor alle UI-sleutels. nl/fr/de moeten dezelfde
// structuur volgen; ontbrekende sleutels daar vallen terug op deze Engelse
// tekst (zie src/i18n/index.ts).
const en = {
  tabs: {
    ontdek: 'Home',
    voortgang: 'Progress',
    profiel: 'Profile',
  },
  ontdek: {
    uitgelicht: 'Featured',
    leesNu: 'Read now',
    verderLezen: 'Continue reading',
    verderLezenLegeTitel: 'Nothing started yet',
    verderLezenLegeBeschrijving: 'Stories you open will appear here.',
    verhaallijnen: 'Storylines',
    ontdekMeer: 'Discover more',
    nieuwToegevoegd: 'Newly added',
  },
  voortgang: {
    titel: 'Progress',
    streak: (n: number) => (n === 1 ? `${n} day streak` : `${n} days streak`),
    streakBeschrijving: 'Finish a chapter every day to keep your streak going.',
    streakLeeg: 'No streak yet',
    streakLeegBeschrijving: 'Finish a chapter today to start one.',
    verhalenGelezen: 'Stories read',
    chaptersRead: 'chapters done',
    charactersUnlocked: 'characters unlocked',
    storiesCompleted: 'stories completed',
    perTijdperk: 'By era',
    byEra: 'By Era',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} stories`,
    storiesOfEra: (completed: number, total: number) => `${completed} of ${total} stories`,
    noMoreStories: 'All stories explored! View all via Discover more.',
  },
  profiel: {
    titel: 'Profile',
    characterCollection: 'Character Collection',
    // Functies, geen strings: het getal staat als los `display`-cijfer boven het label, dus
    // alleen het label mag meebuigen. "1 chapters done" stond in een store-screenshot.
    // Het expliciete `: string` is nodig: `en` is `as const`, dus zonder annotatie wordt het
    // retourtype de letterlijke Engelse tekst en past geen enkele vertaling er meer in.
    chaptersRead: (n: number): string => (n === 1 ? 'chapter done' : 'chapters done'),
    charactersUnlocked: (n: number): string => (n === 1 ? 'character unlocked' : 'characters unlocked'),
    storiesCompleted: (n: number): string => (n === 1 ? 'story completed' : 'stories completed'),
    unlockedCounter: (count: number, total: number) => `${count} of ${total} unlocked`,
    /** Op een vergrendelde personagekaart, in plaats van de naam die je nog moet verdienen. */
    personageVergrendeld: 'Still hidden',
    personageVergrendeldUitleg: 'Finish this story to add the portrait to your collection.',
    /** Aanmoediging onder de collectie. Verdwijnt zodra alles ontgrendeld is. */
    nogTeOntgrendelen: (n: number): string =>
      n === 1 ? 'One more story to complete your collection.' : `Read on to unlock ${n} more characters.`,
    collectieCompleet: 'Your collection is complete. Every character unlocked.',
    instellingen: 'Settings',
    thema: 'Theme',
    themaLicht: 'Light',
    themaDonker: 'Dark',
    themaSysteem: 'System',
    taal: 'Language',
    herinnering: 'Daily reminder',
    // Bewust zonder tijdstip: dat is sinds de instelbare herinnering geen vast gegeven meer, en
    // het staat een regel lager als waarde bij `instellingen.herinneringTijd`.
    herinneringUitleg: 'A quiet nudge to read your next chapter.',
    over: 'About',
    privacybeleid: 'Privacy Policy',
    privacybeleidUitleg: 'Chronicles stores your progress on this device only and collects no personal data.',
    /** Toegankelijkheidslabels van de twee icoonknoppen bovenaan Profiel. */
    instellingenOpenen: 'Open settings',
    feedbackOpenen: 'Send feedback',
    avatarWijzigen: 'Change avatar',
    /** Valt in als er noch een gebruikersnaam noch een e-mailadres bekend is. */
    naamloos: 'Reader',
  },
  /** Het avatarscherm (modal vanaf Profiel). */
  avatar: {
    titel: 'Your avatar',
    ondertitel: 'Wear a character you unlocked, or a picture of your own.',
    fotoKiezen: 'Choose a photo',
    fotoUitleg: 'Stays on this device.',
    fotoMislukt: 'That picture could not be opened.',
    personages: 'Unlocked characters',
    personagesLeeg: 'Finish a story to unlock a portrait you can wear here.',
    verwijderen: 'Remove avatar',
    huidige: 'Current avatar',
  },
  /** Het instellingenscherm (`app/profiel/settings.tsx`). */
  instellingen: {
    titel: 'Settings',
    sectieAccount: 'Account',
    sectieWeergave: 'Appearance',
    sectieMeldingen: 'Notifications',
    sectieAbonnement: 'Subscription',
    sectieSupport: 'Support & feedback',
    sectieApp: 'App info',
    sectieGevaar: 'Account',

    // Alles wat nog niet bestaat draagt dit label in plaats van een knop die doet alsof.
    binnenkort: 'Soon',
    binnenkortTitel: 'Not available yet',
    binnenkortTekst: (onderwerp: string): string =>
      `${onderwerp} is not part of this version of Chronicles yet.`,
    ok: 'OK',

    ingelogdAls: 'Signed in as',
    gebruikersnaam: 'Username',
    geenGebruikersnaam: 'Not set',
    wachtwoordWijzigen: 'Change password',
    synchronisatie: 'Sync',

    appIcoon: 'App icon',
    abonnement: 'Your plan',
    abonnementGratis: 'Free',
    abonnementPro: 'Pro',
    dagelijkseLimiet: 'Today’s reading',
    /** Rechts van "Your plan" voor een gratis lezer: hoeveel van de dag nog over is. */
    verhalenVandaag: (gebruikt: number, limiet: number): string =>
      `${gebruikt}/${limiet} stories today`,
    onbeperkt: 'Unlimited',

    // --- Dagelijkse herinnering ---
    herinneringTijd: 'Reminder time',
    /**
     * Klok­notatie. Een functie en geen `toLocaleTimeString`: de app kent vier talen die niet met
     * de systeemtaal hoeven mee te lopen, en alleen het Engels gebruikt AM/PM.
     */
    tijdWaarde: (uur: number, minuut: number): string => {
      const deel = uur < 12 ? 'AM' : 'PM';
      const twaalf = uur % 12 === 0 ? 12 : uur % 12;
      return `${twaalf}:${String(minuut).padStart(2, '0')} ${deel}`;
    },
    tijdKiezerTitel: 'When should we nudge you?',
    tijdKiezerUitleg: 'One reminder a day, at this time. You can change it whenever you like.',
    tijdOpslaan: 'Save time',
    uur: 'Hour',
    minuut: 'Minute',

    // --- E-mailvoorkeuren ---
    sectieEmail: 'Email',
    emailVoorkeuren: 'Email preferences',
    /**
     * Eerlijk over de stand van zaken: er gaat vandaag geen enkele mail de deur uit. De keuzes
     * bewaren is dus geen loze knop, maar beloven dat er post komt zou dat wél zijn.
     */
    emailUitleg:
      'Chronicles sends no email yet. Your choices are saved here and will apply from the first one.',
    emailNieuwsbrief: 'Monthly letter',
    emailNieuwsbriefUitleg: 'One email a month, with what we have been reading.',
    emailNieuweVerhalen: 'New stories',
    emailNieuweVerhalenUitleg: 'A note when a new story or era lands.',
    emailTips: 'Reading tips',
    emailTipsUitleg: 'Occasional ideas on getting more out of a chapter.',
    emailAanbiedingen: 'Offers',
    emailAanbiedingenUitleg: 'Discounts on Chronicles Pro. Rare, we promise.',

    // --- Privacy ---
    sectiePrivacy: 'Privacy',
    analytics: 'Usage statistics',
    analyticsUitleg: 'Helps us see which stories get read and where people stop.',
    /**
     * Bewust geen "anoniem": zodra je bent ingelogd hangt de meting aan je account. Zeggen wat er
     * gebeurt kost één zin meer en is het enige dat de schakelaar boven een vinkje uittilt.
     */
    analyticsVoet:
      'Chronicles counts screens you open, chapters you finish and buttons you press, together with your device type and country. It is tied to your account and handled by Google Firebase. It never includes what you write. Turn this off and none of it leaves your device.',

    // --- Push-notificaties ---
    //
    // Los van de dagelijkse herinnering, die lokaal is en zijn eigen sectie heeft. Wat hier staat
    // komt van de server, en de teksten zeggen dat ook: wie een melding krijgt hoort te weten
    // waarom hij hem krijgt.
    sectiePush: 'Push notifications',
    /**
     * Zegt wat er nodig is om ze te sturen. Bewust geen "we respect your privacy"-zin: wat er
     * gebeurt is dat dit toestel bij ons bekend staat, en dát is de mededeling.
     */
    pushVoet:
      'To send these, Chronicles registers this device with Google Firebase and keeps track of when you last read. Turn both off and the device is unregistered again.',
    /** Als FCM in deze build niet bestaat: dan is er maar één schakelaar, en die is lokaal. */
    pushVoetLokaal:
      'This reminder is created on your device and never leaves it. Suggestions to come back are not available in this version.',
    pushTerugkeer: 'Nudge me back',
    pushTerugkeerUitleg: 'A quiet reminder if a few days pass without reading.',
    pushAanbevelingen: 'Story suggestions',
    pushAanbevelingenUitleg: 'Now and then, a story from an era you like that you have not opened.',
    pushStreak: 'Streak at risk',
    pushStreakUitleg: 'A heads-up in the evening if today would break your streak.',
    /**
     * Mijlpalen. Staat in dezelfde sectie als de rest, maar is net als de streakmelding lokaal —
     * de voetnoot van de sectie gaat over de twee die dat niet zijn.
     */
    pushPrestaties: 'Milestones',
    pushPrestatiesUitleg: 'A note when you reach a milestone while the app is closed.',

    beoordeel: 'Rate Chronicles',
    contact: 'Contact support',
    contactOnderwerp: 'Chronicles support',
    voorwaarden: 'Terms of Service',

    versie: 'Version',

    accountVerwijderen: 'Delete account',
    accountVerwijderenTitel: 'Delete account?',
    /**
     * Zegt precies wat er gebeurt, inclusief het toestel. Dit stond hier eerder als "we handle it
     * by hand — email us"; sinds de edge function `delete-account` is het echt onmiddellijk, en
     * dan mag de tekst niet meer om een mailtje vragen. De regel over dit toestel staat er bij
     * omdat uitloggen het tegenovergestelde belooft — dat verschil is precies de vraag die je op
     * dit moment stelt.
     */
    accountVerwijderenTekst:
      'This deletes your account, your reading progress, your characters and your answers — on our servers and on this device. It happens right away and cannot be undone.',
    accountVerwijderenBevestig: 'Delete forever',
    accountVerwijderenBezig: 'Deleting…',
    accountVerwijderdTitel: 'Account deleted',
    accountVerwijderdTekst:
      'Everything is gone and this device has been cleared. Thank you for reading with us.',
    accountVerwijderenMisluktTitel: 'Could not delete your account',
    /** Belangrijkste zin: er is *niets* half weg. Zonder dat blijft de vraag hangen. */
    accountVerwijderenMisluktTekst: (adres: string): string =>
      `Nothing was deleted — your account is exactly as it was. Check your connection and try again, or write to ${adres}.`,
    // Superseded: het verwijderen loopt niet meer via een mailtje. Blijft staan zolang de
    // andere talen hem nog kennen.
    accountVerwijderenMail: 'Email us',

    // --- Gegevensverzoek (AVG art. 15/20) ---
    /**
     * Een export bouwen we (nog) niet in de app: dat is een tweede edge function plus een
     * bestandsformaat, en de gegevens passen in een e-mail. Deze regel opent er dus eentje, met
     * onderwerp en tekst al ingevuld, zodat het verzoek herkenbaar binnenkomt.
     */
    gegevensVerzoek: 'Request my data',
    gegevensVerzoekUitleg: 'A copy of everything stored against your account, by email.',
    gegevensVerzoekOnderwerp: 'Chronicles data request',
    gegevensVerzoekBody:
      'Hello,\n\nI would like a copy of the data stored against my Chronicles account.\n\nPlease send it to the address I am writing from.\n\nThank you.',
  },
  /**
   * De premium-banner op Profiel en het paywall-venster erachter (`pro-paywall.tsx`).
   *
   * De prijzen staan hier en niet in het component: zodra Google Play Billing echt gekoppeld is
   * komen ze uit de producten van de store zelf (andere valuta en andere bedragen per land), en
   * dan is dit precies de plek die vervalt. Tot die tijd zijn het richtprijzen, en dat zegt
   * `voorbehoud` er ook bij.
   */
  pro: {
    titel: 'Get Pro access',
    ondertitel: 'Every era, no interruptions.',
    knop: 'See plans',

    paywallTitel: 'Chronicles Pro',
    paywallOndertitel: 'More history, fewer interruptions.',
    sluiten: 'Close',

    /**
     * Elke voordeelregel is iets wat de app heeft of aantoonbaar krijgt. Bewust géén "100+
     * stories": het er zijn er negentien, en een belofte die de build niet waarmaakt is zowel een
     * klassieke Play-afwijsreden als gewoon onwaar tegen de gebruiker. Het aantal is daarom een
     * parameter en geen overgetypt getal — `verhalen.length` vult het.
     */
    voordeelVerhalen: (n: number): string => `All ${n} stories, across six eras`,
    voordeelPersonages: 'Every character portrait in your collection',
    voordeelVroeg: 'New stories first, as soon as they land',
    voordeelOffline: 'Read offline, anywhere',
    voordeelGeenAds: 'No ads, ever',

    prijsMaand: '€4.99 / month',
    prijsJaar: '€39.99 / year — save 33%',
    abonneer: 'Subscribe',
    misschienLater: 'Maybe later',
    /**
     * Eerlijk over wat er vandaag gebeurt: niets. Een "7 dagen gratis proberen"-regel zonder
     * Billing erachter belooft een proefperiode die niet bestaat en die niemand kan opzeggen.
     */
    voorbehoud:
      'Indicative pricing. Subscriptions arrive in a later version — nothing is charged today.',
    nogNietTitel: 'Not available yet',
    nogNietTekst:
      'Subscriptions arrive with a later version of Chronicles. Nothing has been charged.',
  },
  /**
   * De dagelijkse leeslimiet voor gratis lezers (`story-limit-modal.tsx`).
   *
   * De toon is bewust "tot morgen" en niet "betaal nu": wie de limiet raakt heeft net twee
   * verhalen gelezen, en dat is precies het gedrag dat de app wil. Er staat daarom óók dat de
   * voortgang bewaard blijft — dat is de vraag die je op dit scherm stelt.
   */
  limiet: {
    titel: 'That is today’s reading',
    tekst: (n: number): string =>
      n === 1
        ? 'Chronicles opens one new story a day for free readers. Everything you read is saved — the next one is waiting tomorrow.'
        : `Chronicles opens ${n} new stories a day for free readers. Everything you read is saved — the next one is waiting tomorrow.`,
    /** Een verhaal dat je vandaag al opende blijft open; dat zegt deze regel. */
    verderUitleg: 'Stories you already started today stay open.',
    voordeelOnbeperkt: 'Read as many stories as you like',
    voordeelGeenAds: 'No ads between chapters',
    voordeelAlles: 'Every era, every character',
    upgrade: 'See Chronicles Pro',
    morgen: 'Come back tomorrow',
  },
  /**
   * Het feedbackvenster achter het spreekwolkje op Profiel (`feedback-modal.tsx`).
   *
   * Het bericht gaat naar `public.feedback` in Supabase, dus "verzonden" betekent hier ook echt
   * verzonden — vandaar dat er een aparte mislukt-tekst is die zegt dat de tekst blijft staan.
   */
  feedback: {
    titel: 'Send feedback',
    ondertitel: 'What went wrong, or what would you like to see?',
    soortBug: 'Bug report',
    soortIdee: 'Feature idea',
    plaatshouderBug: 'What happened, and what did you expect instead?',
    plaatshouderIdee: 'What would you like Chronicles to do?',
    versturen: 'Send feedback',
    verzenden: 'Sending…',
    sluiten: 'Close',
    tekensOver: (n: number): string => `${n} characters left`,
    leegTitel: 'Nothing to send yet',
    leegTekst: 'Write a line or two first.',
    geluktTitel: 'Thank you!',
    geluktTekst:
      'Your feedback came through. We read everything, even when we cannot reply to all of it.',
    misluktTitel: 'Could not send',
    misluktTekst: 'Your message is still here — check your connection and try again.',
    geenSessie: 'Sign in to send feedback.',
    ok: 'OK',
  },
  // De dagelijkse herinnering. Bewust zonder app-naam (die staat al in de kop van de melding)
  // en zonder streakgetal: een notificatie wordt dagen vooruit gepland, dus elk getal erin is
  // tegen de tijd dat hij afgaat achterhaald.
  notificatie: {
    titel: 'Your next chapter is waiting',
    tekst: 'A few minutes of history, before the day is over.',
    /**
     * De ontgrendelmelding. Lokaal en meteen — het ontgrendelen gebeurt op dit toestel, dus er
     * is geen server voor nodig (zie `notificaties.toonNu`).
     *
     * Hij verschijnt alleen als de app *niet* op de voorgrond staat: wie de ontgrendelmodal voor
     * zijn neus heeft gehad, heeft het al gezien, en dan is een melding erbovenop ruis.
     */
    streakTitel: 'Your streak ends tonight',
    streakTekst: (dagen: number): string =>
      `${dagen} day${dagen === 1 ? '' : 's'} in a row. One chapter keeps it alive.`,
  },
  /**
   * Mijlpalen (`constants/prestaties.ts`). De naam is per mijlpaal geschreven, de uitleg wordt uit
   * de categorie samengesteld — zo staat er één zin per categorie in plaats van veertien.
   *
   * `namen` is getypeerd als `Record<PrestatieId, string>`: een mijlpaal erbij zonder naam is
   * daarmee een compileerfout en niet een badge die "streak-30" heet.
   */
  prestatie: {
    sectie: 'Milestones',
    /** De teller boven het raster op Profiel. */
    telling: (behaald: number, totaal: number): string => `${behaald} of ${totaal}`,
    /** Titel van de systeemmelding. De naam van de mijlpaal staat in de body. */
    meldingTitel: 'Milestone reached',
    /** Onder een nog niet behaalde mijlpaal in het raster. */
    nogNiet: 'Not yet',
    /** Wat er in het raster staat als er nog geen enkele mijlpaal is. */
    leeg: 'Finish a chapter and the first one is yours.',
    namen: {
      'hoofdstuk-1': 'First Page',
      'hoofdstuk-10': 'Ten Chapters In',
      'hoofdstuk-25': 'Well Read',
      'hoofdstuk-50': 'Deep in the Archive',
      'hoofdstuk-100': 'Centurion',
      'verhaal-1': 'A Life Read',
      'verhaal-5': 'Five Lives',
      'verhaal-10': 'Ten Lives',
      'personage-3': 'Good Company',
      'personage-10': 'A Gathering',
      'streak-3': 'Three Days Running',
      'streak-7': 'A Full Week',
      'streak-30': 'A Month of History',
      'streak-100': 'A Hundred Days',
    } satisfies Record<PrestatieId, string>,
    uitleg: {
      hoofdstukken: (n: number): string => `${n} chapter${n === 1 ? '' : 's'} finished.`,
      verhalen: (n: number): string => `${n} stor${n === 1 ? 'y' : 'ies'} read to the end.`,
      personages: (n: number): string => `${n} character${n === 1 ? '' : 's'} in your collection.`,
      streak: (n: number): string => `${n} day${n === 1 ? '' : 's'} in a row.`,
    },
  },
  collectie: {
    nietGevondenTitel: 'Storyline not found',
    nietGevondenBeschrijving: 'This storyline no longer exists.',
  },
  tijdperkScherm: {
    titel: 'Era',
    nietGevondenTitel: 'Era not found',
    nietGevondenBeschrijving: 'This era no longer exists.',
    alle: 'All',
    geenVerhalenTitel: 'No stories',
    geenVerhalenBeschrijving: 'No stories for this filter.',
  },
  verhaal: {
    nietGevondenTitel: 'Story not found',
    nietGevondenBeschrijving: 'This story no longer exists.',
    minLeestijd: (n: number) => `${n} min read`,
    gelezen: 'Read',
    markeerAlsGelezen: 'Mark as read',
    volgendVerhaal: 'Next story',
    waar: 'True',
    nietWaar: 'False',
    goedGeraden: 'Correct!',
    tochNietHelemaal: 'Not quite.',
  },
  hoofdstuk: {
    nietGevondenTitel: 'Chapter not found',
    nietGevondenBeschrijving: 'This chapter no longer exists.',
    /** Tegeltitel op het hoofdstukoverzicht: "Chapter 3: The Rubicon". */
    tegelTitel: (nummer: number, titel: string) => `Chapter ${nummer}: ${titel}`,
    teller: (huidig: number, totaal: number) => `Chapter ${huidig} of ${totaal}`,
    voortgang: (voltooid: number, totaal: number) => `${voltooid} / ${totaal} chapters`,
    volgordeUitleg: 'Complete chapters in order to unlock the next one.',
    terugNaarOverzicht: 'Back to Chapters',
    markeerVoltooid: 'Mark Complete',
    volgende: 'Next Chapter',
    allesVoltooid: 'All Chapters Complete',
    ontgrendelPersonage: (naam: string) => `Unlock ${naam}`,
  },
  /** Labels die `blok-weergave.tsx` zelf toevoegt aan een blok (LAUNCH-PLAN.md B3). */
  blok: {
    weetjeLabel: 'Did you know?',
    /**
     * Jaartal van een sleutelmoment-blok. Negatief = voor Christus. "AD" alleen bij jaren onder
     * 1000 — "AD 1969" leest raar, "AD 79" is juist nodig om het van 79 BC te onderscheiden.
     */
    jaarLabel: (jaar: number) =>
      jaar < 0 ? `${Math.abs(jaar)} BC` : jaar < 1000 ? `AD ${jaar}` : `${jaar}`,
  },
  /**
   * Interactief lezen: de quiz, de peiling en het keuzepunt onder een hoofdstuk.
   *
   * `keuzeNa` zegt met opzet *niet* dat je keuze het verhaal verandert. Er vertakt niets — de
   * hoofdstukken liggen vast in de bundel. Wat je na het kiezen te zien krijgt is echt: hoe
   * andere lezers besloten. Dezelfde afweging als bij de paywall: liever iets kleiners dat waar
   * is dan een belofte die het scherm niet waarmaakt.
   */
  interactief: {
    quizKop: 'Quick check',
    quizControleer: 'Check answer',
    quizGoedTitel: 'Correct',
    quizGoedTekst: 'You were paying attention.',
    quizFoutTitel: 'Not quite',
    quizJuisteAntwoord: (antwoord: string): string => `The answer is ${antwoord}.`,
    quizVerder: 'Continue reading',
    optieLabel: (letter: string, tekst: string): string => `Option ${letter}: ${tekst}`,
    pollKop: 'What do you think?',
    pollVoor: 'Answer to see what other readers chose.',
    pollStemmen: (n: number): string =>
      n === 1 ? '1 reader has answered' : `${n} readers have answered`,
    pollEerste: 'You are the first to answer.',
    keuzeKop: 'Your call',
    keuzeVoor: 'What would you have done?',
    keuzeNa: 'History went its own way — this is how other readers decided.',
  },
  personage: {
    ontgrendeldTitel: 'Character Unlocked!',
    ontgrendeldBeschrijving: "You've unlocked a new character! View your collection in the Profile tab.",
    naarHome: 'Continue to Home',
  },
  advertentie: {
    label: 'Advertisement',
    /**
     * De onderbreking na een uitgelezen verhaal is een *placeholder* — er is nog geen AdMob. De
     * tekst zegt dat dan ook, in plaats van een advertentie na te spelen die er niet is.
     */
    plaatshouder: 'A sponsored message would appear here.',
    overslaanIn: (n: number): string => `Skip in ${n}s`,
    overslaan: 'Skip',
    proKnop: 'Remove ads with Pro',
  },
  /** Inloggen, registreren en uitloggen (R8.AUTH deel 2). */
  auth: {
    loginTitel: 'Welcome back',
    loginOndertitel: 'Sign in to pick up where you left off.',
    signupTitel: 'Create an account',
    signupOndertitel: 'Keep your progress safe across devices.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    wachtwoord: 'Password',
    wachtwoordPlaceholder: 'At least 6 characters',
    gebruikersnaam: 'Username',
    gebruikersnaamPlaceholder: 'The name shown on your profile',
    inloggen: 'Sign in',
    registreren: 'Create account',
    wachtwoordVergeten: 'Forgot password?',
    geenAccount: 'No account yet?',
    welAccount: 'Already have an account?',
    naarSignup: 'Sign up',
    naarLogin: 'Sign in',
    sterkte: 'Password strength',
    sterkteZwak: 'Weak',
    sterkteGemiddeld: 'Medium',
    sterkteSterk: 'Strong',
    voorwaarden: 'I agree to the Terms of Service and the Privacy Policy.',
    // Staat e-mailbevestiging aan in Supabase, dan is er na signUp() nog geen sessie: de
    // gebruiker moet eerst de link in zijn mail openen. Zie `signup` in use-auth.
    bevestigMail: (email: string): string =>
      `Almost there — open the confirmation link we sent to ${email}, then sign in.`,
    foutVeldenLeeg: 'Email and password are required.',
    foutAlleVelden: 'All fields are required.',
    foutEmailOngeldig: "That doesn't look like an email address.",
    foutWachtwoordKort: 'Password must be at least 6 characters.',
    foutVoorwaarden: 'You need to agree to the Terms of Service first.',
    account: 'Account',
    uitloggen: 'Sign out',
    uitlogTitel: 'Sign out?',
    // Bewust niet "you'll lose your progress": uitloggen wist de lokale voortgang niet, die
    // staat in AsyncStorage op dit toestel. Een waarschuwing die niet klopt is erger dan geen.
    uitlogTekst:
      'Your reading progress stays on this device. You will need to sign in again to reach your account.',
    annuleren: 'Cancel',
  },
  // Statusregel onder het account op Profiel (R8.AUTH deel 3). Bewust geruststellend van toon:
  // een mislukte sync kost de gebruiker niets — het lezen staat lokaal en gaat vanzelf alsnog
  // omhoog — dus mag de tekst geen alarm slaan dat de app zelf al oplost.
  sync: {
    bezig: 'Syncing…',
    wachtend: 'Waiting to sync',
    mislukt: 'Offline — your progress will sync later',
    nooit: 'Not synced yet',
    zojuist: 'Progress synced just now',
    minutenGeleden: (minuten: number): string =>
      `Progress synced ${minuten} ${minuten === 1 ? 'minute' : 'minutes'} ago`,
    urenGeleden: (uren: number): string =>
      `Progress synced ${uren} ${uren === 1 ? 'hour' : 'hours'} ago`,
    langGeleden: 'Progress synced earlier',
  },
} as const;

export default en;

export type Vertalingen = typeof en;
