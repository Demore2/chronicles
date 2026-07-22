import type { DeepPartial } from './deep-partial';
import type { Vertalingen } from './en';

const de: DeepPartial<Vertalingen> = {
  tabs: {
    ontdek: 'Entdecken',
    kaart: 'Karte',
    voortgang: 'Fortschritt',
    profiel: 'Profil',
  },
  ontdek: {
    uitgelicht: 'Empfohlen',
    leesNu: 'Jetzt lesen',
    verderLezen: 'Weiterlesen',
    verderLezenLegeTitel: 'Noch nichts begonnen',
    verderLezenLegeBeschrijving: 'Geschichten, die du öffnest, erscheinen hier.',
    verhaallijnen: 'Erzählstränge',
    perTijdperk: 'Nach Epoche',
    nieuwToegevoegd: 'Neu hinzugefügt',
  },
  voortgang: {
    titel: 'Fortschritt',
    streak: (n: number) => `${n} Tag${n === 1 ? '' : 'e'} in Folge`,
    streakBeschrijving: 'Lies jeden Tag eine Geschichte, um deine Serie fortzusetzen.',
    verhalenGelezen: 'Gelesene Geschichten',
    perTijdperk: 'Nach Epoche',
    perLand: 'Nach Land',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} Geschichten`,
    legeLandenTitel: 'Noch keine Länder',
    legeLandenBeschrijving: 'Länder mit Geschichten erscheinen hier.',
  },
  profiel: {
    titel: 'Profil',
    instellingen: 'Einstellungen',
    thema: 'Design',
    themaLicht: 'Hell',
    themaDonker: 'Dunkel',
    themaSysteem: 'System',
    taal: 'Sprache',
  },
  kaart: {
    titel: 'Karte',
  },
  collectie: {
    nietGevondenTitel: 'Erzählstrang nicht gefunden',
    nietGevondenBeschrijving: 'Dieser Erzählstrang existiert nicht mehr.',
  },
  tijdperkScherm: {
    titel: 'Epoche',
    nietGevondenTitel: 'Epoche nicht gefunden',
    nietGevondenBeschrijving: 'Diese Epoche existiert nicht mehr.',
    alle: 'Alle',
    geenVerhalenTitel: 'Keine Geschichten',
    geenVerhalenBeschrijving: 'Keine Geschichten für diesen Filter.',
  },
  verhaal: {
    nietGevondenTitel: 'Geschichte nicht gefunden',
    nietGevondenBeschrijving: 'Diese Geschichte existiert nicht mehr.',
    minLeestijd: (n: number) => `${n} Min. Lesezeit`,
    gelezen: 'Gelesen',
    markeerAlsGelezen: 'Als gelesen markieren',
    volgendVerhaal: 'Nächste Geschichte',
    waar: 'Wahr',
    nietWaar: 'Falsch',
    goedGeraden: 'Richtig geraten!',
    tochNietHelemaal: 'Nicht ganz.',
  },
  regio: {
    nietGevondenTitel: 'Land nicht gefunden',
    nietGevondenBeschrijving: 'Dieses Land existiert nicht mehr.',
    voortgang: (gelezen: number, totaal: number) => `${gelezen} von ${totaal} Geschichten gelesen`,
    geenVerhalenTitel: 'Noch keine Geschichten',
    geenVerhalenBeschrijving: 'Für dieses Land sind noch keine Geschichten bereit.',
  },
  continent: {
    titelFallback: 'Kontinent',
    binnenkortBeschikbaar: 'Demnächst verfügbar',
  },
  advertentie: {
    label: 'Werbung',
  },
};

export default de;
