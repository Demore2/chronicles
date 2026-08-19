import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Waar Chronicles je wél en niet over zou mailen.
 *
 * **Er gaat vandaag geen enkele mail de deur uit** — er is geen verzendsysteem, en deze voorkeuren
 * staan (net als taal, thema en de avatar) alleen op dit toestel. Dat is precies waarom het scherm
 * het er in `instellingen.emailUitleg` bij zegt: keuzes bewaren is eerlijk, doen alsof er post
 * onderweg is niet. Zodra er wél verstuurd wordt horen deze vier vlaggen bij het account en niet
 * bij het toestel; dan is dit de plek die naar Supabase gaat, zoals de drie voortgangsstores.
 *
 * **Drie staan standaard aan, aanbiedingen niet.** De maandbrief, de nieuwe verhalen en de
 * leestips gaan over de app waar je je net voor aanmeldde; aanbiedingen gaan over iets kopen, en
 * die blijven uit tot de lezer erom vraagt.
 *
 * **Wat daar tegenin gaat, zodat het hier staat en niet in een review opduikt.** De AVG (art.
 * 4(11)/7) en de e-Privacyrichtlijn kennen geen geldige toestemming die je al aangevinkt
 * aantreft; voor commerciële mail aan een EU-lezer is een vooraf aangezette vlag geen toestemming,
 * ook niet als het uitzetten één tik kost. De uitzondering die deze stand kan dragen is de
 * *soft opt-in*: eigen, gelijksoortige inhoud aan een eigen klant, met een afmeldmogelijkheid in
 * élke mail. Daarom hoort bij deze wijziging dat er nooit een mail uitgaat zonder afmeldlink,
 * en staat dat ook in `instellingen.emailUitleg`. Aanbiedingen vallen niet onder die uitzondering
 * en staan daarom uit.
 *
 * **Een bestaande installatie blijft staan waar hij stond.** De `merge` hieronder legt de
 * opgeslagen keuzes over deze standaardwaarden heen, dus wie ze eerder (bewust of niet) uit had
 * staan wordt niet alsnog aangemeld. Alleen een nieuwe installatie begint met deze stand.
 */
export const EMAIL_VOORKEUR_SLEUTELS = [
  'nieuwsbrief',
  'nieuweVerhalen',
  'tips',
  'aanbiedingen',
] as const;

export type EmailVoorkeurSleutel = (typeof EMAIL_VOORKEUR_SLEUTELS)[number];

type EmailVoorkeurState = {
  voorkeuren: Record<EmailVoorkeurSleutel, boolean>;
  zetVoorkeur: (sleutel: EmailVoorkeurSleutel, aan: boolean) => void;
};

/**
 * De beginstand. Ook de terugvalwaarde bij het wissen van het account (`lokale-gegevens.ts`): een
 * keuze van de vorige lezer mag niet blijven staan voor wie zich daarna op dit toestel aanmeldt.
 * Dat betekent hier dus dat een gewist toestel terugvalt op "de eerste drie aan" en niet op de
 * stand die de vorige lezer koos — precies zoals een verse installatie.
 */
export const STANDAARD_EMAIL_VOORKEUREN: Record<EmailVoorkeurSleutel, boolean> = {
  nieuwsbrief: true,
  nieuweVerhalen: true,
  tips: true,
  /** Verkoop, geen inhoud. Dit is de enige van de vier die de lezer zelf moet aanzetten. */
  aanbiedingen: false,
};

export const useEmailVoorkeurStore = create<EmailVoorkeurState>()(
  persist(
    (set) => ({
      voorkeuren: STANDAARD_EMAIL_VOORKEUREN,
      zetVoorkeur: (sleutel, aan) =>
        set((state) => ({ voorkeuren: { ...state.voorkeuren, [sleutel]: aan } })),
    }),
    {
      name: 'email-voorkeur-storage',
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * Een sleutel die later bijkomt bestaat niet in de opgeslagen state; zonder deze merge zou
       * hij dan `undefined` zijn in plaats van uit. Vandaar de standaardwaarden eronder leggen.
       */
      merge: (opgeslagen, huidig) => {
        const bewaard = (opgeslagen as Partial<EmailVoorkeurState> | undefined)?.voorkeuren;
        return { ...huidig, voorkeuren: { ...STANDAARD_EMAIL_VOORKEUREN, ...bewaard } };
      },
    }
  )
);
