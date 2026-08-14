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
    instellingen: 'Settings',
    thema: 'Theme',
    themaLicht: 'Light',
    themaDonker: 'Dark',
    themaSysteem: 'System',
    taal: 'Language',
    herinnering: 'Daily reminder',
    herinneringUitleg: 'A quiet nudge at 7 pm to read your next chapter.',
    over: 'About',
    privacybeleid: 'Privacy Policy',
    privacybeleidUitleg: 'Chronicles stores your progress on this device only and collects no personal data.',
  },
  // De dagelijkse herinnering. Bewust zonder app-naam (die staat al in de kop van de melding)
  // en zonder streakgetal: een notificatie wordt dagen vooruit gepland, dus elk getal erin is
  // tegen de tijd dat hij afgaat achterhaald.
  notificatie: {
    titel: 'Your next chapter is waiting',
    tekst: 'A few minutes of history, before the day is over.',
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
  personage: {
    ontgrendeldTitel: 'Character Unlocked!',
    ontgrendeldBeschrijving: "You've unlocked a new character! View your collection in the Profile tab.",
    naarHome: 'Continue to Home',
  },
  advertentie: {
    label: 'Advertisement',
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
