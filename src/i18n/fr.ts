import type { DeepPartial } from './deep-partial';
import type { Vertalingen } from './en';

const fr: DeepPartial<Vertalingen> = {
  tabs: {
    ontdek: 'Découvrir',
    kaart: 'Carte',
    voortgang: 'Progrès',
    profiel: 'Profil',
  },
  ontdek: {
    uitgelicht: 'À la une',
    leesNu: 'Lire maintenant',
    verderLezen: 'Continuer la lecture',
    verderLezenLegeTitel: 'Rien de commencé pour l’instant',
    verderLezenLegeBeschrijving: 'Les histoires que vous ouvrez apparaîtront ici.',
    verhaallijnen: 'Récits',
    perTijdperk: 'Par époque',
    nieuwToegevoegd: 'Nouveautés',
  },
  voortgang: {
    titel: 'Progrès',
    streak: (n: number) => `${n} jour${n === 1 ? '' : 's'} de suite`,
    streakBeschrijving: 'Lisez une histoire chaque jour pour maintenir votre série.',
    verhalenGelezen: 'Histoires lues',
    perTijdperk: 'Par époque',
    perLand: 'Par pays',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} histoires`,
    legeLandenTitel: 'Pas encore de pays',
    legeLandenBeschrijving: 'Les pays avec des histoires apparaîtront ici.',
  },
  profiel: {
    titel: 'Profil',
    instellingen: 'Paramètres',
    thema: 'Thème',
    themaLicht: 'Clair',
    themaDonker: 'Sombre',
    themaSysteem: 'Système',
    taal: 'Langue',
  },
  kaart: {
    titel: 'Carte',
  },
  collectie: {
    nietGevondenTitel: 'Récit introuvable',
    nietGevondenBeschrijving: 'Ce récit n’existe plus.',
  },
  tijdperkScherm: {
    titel: 'Époque',
    nietGevondenTitel: 'Époque introuvable',
    nietGevondenBeschrijving: 'Cette époque n’existe plus.',
    alle: 'Tout',
    geenVerhalenTitel: 'Aucune histoire',
    geenVerhalenBeschrijving: 'Aucune histoire pour ce filtre.',
  },
  verhaal: {
    nietGevondenTitel: 'Histoire introuvable',
    nietGevondenBeschrijving: 'Cette histoire n’existe plus.',
    minLeestijd: (n: number) => `${n} min de lecture`,
    gelezen: 'Lu',
    markeerAlsGelezen: 'Marquer comme lu',
    volgendVerhaal: 'Histoire suivante',
    waar: 'Vrai',
    nietWaar: 'Faux',
    goedGeraden: 'Bien deviné !',
    tochNietHelemaal: 'Pas tout à fait.',
  },
  regio: {
    nietGevondenTitel: 'Pays introuvable',
    nietGevondenBeschrijving: 'Ce pays n’existe plus.',
    voortgang: (gelezen: number, totaal: number) => `${gelezen} histoire${gelezen === 1 ? '' : 's'} lue${gelezen === 1 ? '' : 's'} sur ${totaal}`,
    geenVerhalenTitel: 'Pas encore d’histoires',
    geenVerhalenBeschrijving: 'Aucune histoire n’est encore prête pour ce pays.',
  },
  continent: {
    titelFallback: 'Continent',
    binnenkortBeschikbaar: 'Bientôt disponible',
  },
  advertentie: {
    label: 'Publicité',
  },
};

export default fr;
