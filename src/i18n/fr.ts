import type { DeepPartial } from './deep-partial';
import type { Vertalingen } from './en';

const fr: DeepPartial<Vertalingen> = {
  tabs: {
    ontdek: 'Découvrir',
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
    nieuwToegevoegd: 'Nouveautés',
  },
  voortgang: {
    titel: 'Progrès',
    streak: (n: number) => `${n} jour${n === 1 ? '' : 's'} de suite`,
    streakBeschrijving: 'Lisez une histoire chaque jour pour maintenir votre série.',
    verhalenGelezen: 'Histoires lues',
    perTijdperk: 'Par époque',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} histoires`,
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
  advertentie: {
    label: 'Publicité',
  },
};

export default fr;
