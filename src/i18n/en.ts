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
    streakBeschrijving: 'Read a story every day to keep your streak going.',
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
    chaptersRead: 'chapters done',
    charactersUnlocked: 'characters unlocked',
    storiesCompleted: 'stories completed',
    unlockedCounter: (count: number, total: number) => `${count} of ${total} unlocked`,
    instellingen: 'Settings',
    thema: 'Theme',
    themaLicht: 'Light',
    themaDonker: 'Dark',
    themaSysteem: 'System',
    taal: 'Language',
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
  advertentie: {
    label: 'Advertisement',
  },
} as const;

export default en;

export type Vertalingen = typeof en;
