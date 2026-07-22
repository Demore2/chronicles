import type { DeepPartial } from './deep-partial';
import type { Vertalingen } from './en';

const nl: DeepPartial<Vertalingen> = {
  tabs: {
    ontdek: 'Ontdek',
    voortgang: 'Voortgang',
    profiel: 'Profiel',
  },
  ontdek: {
    uitgelicht: 'Uitgelicht',
    leesNu: 'Lees nu',
    verderLezen: 'Verder lezen',
    verderLezenLegeTitel: 'Nog niets begonnen',
    verderLezenLegeBeschrijving: 'Verhalen die je opent verschijnen hier.',
    verhaallijnen: 'Verhaallijnen',
    nieuwToegevoegd: 'Nieuw toegevoegd',
  },
  voortgang: {
    titel: 'Voortgang',
    streak: (n: number) => `${n} ${n === 1 ? 'dag' : 'dagen'} op rij`,
    streakBeschrijving: 'Lees elke dag een verhaal om je streak te behouden.',
    verhalenGelezen: 'Verhalen gelezen',
    perTijdperk: 'Per tijdperk',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} verhalen`,
  },
  profiel: {
    titel: 'Profiel',
    instellingen: 'Instellingen',
    thema: 'Thema',
    themaLicht: 'Licht',
    themaDonker: 'Donker',
    themaSysteem: 'Systeem',
    taal: 'Taal',
  },
  collectie: {
    nietGevondenTitel: 'Verhaallijn niet gevonden',
    nietGevondenBeschrijving: 'Deze verhaallijn bestaat niet (meer).',
  },
  tijdperkScherm: {
    titel: 'Tijdperk',
    nietGevondenTitel: 'Tijdperk niet gevonden',
    nietGevondenBeschrijving: 'Dit tijdperk bestaat niet (meer).',
    alle: 'Alle',
    geenVerhalenTitel: 'Geen verhalen',
    geenVerhalenBeschrijving: 'Geen verhalen voor deze filter.',
  },
  verhaal: {
    nietGevondenTitel: 'Verhaal niet gevonden',
    nietGevondenBeschrijving: 'Dit verhaal bestaat niet (meer).',
    minLeestijd: (n: number) => `${n} min leestijd`,
    gelezen: 'Gelezen',
    markeerAlsGelezen: 'Markeer als gelezen',
    volgendVerhaal: 'Volgende verhaal',
    waar: 'Waar',
    nietWaar: 'Niet waar',
    goedGeraden: 'Goed geraden!',
    tochNietHelemaal: 'Toch niet helemaal.',
  },
  advertentie: {
    label: 'Advertentie',
  },
};

export default nl;
