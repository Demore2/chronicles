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
 * **Alles staat standaard uit.** De AVG kent geen geldige toestemming die je al aangevinkt
 * aantreft, en dit zijn vier vormen van reclame — ook de maandbrief. Aanzetten is dus een
 * handeling van de lezer, niet iets waar hij zich uit moet klikken.
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
 * Alles uit. Ook de terugvalwaarde bij het wissen van het account: een "ja, stuur maar" van de
 * vorige lezer mag niet blijven staan voor wie zich daarna op dit toestel aanmeldt.
 */
export const STANDAARD_EMAIL_VOORKEUREN: Record<EmailVoorkeurSleutel, boolean> = {
  nieuwsbrief: false,
  nieuweVerhalen: false,
  tips: false,
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
