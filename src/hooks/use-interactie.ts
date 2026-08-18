import { useCallback, useEffect, useState } from 'react';

import { ANALYTICS_GEBEURTENIS } from '@/constants/analytics';
import { logEvent } from '@/hooks/useAnalytics';

import {
  bewaarKeuze,
  bewaarPollStem,
  haalHoofdstukInteractie,
  LEGE_INTERACTIE,
  type HoofdstukInteractie,
} from '@/lib/interactief';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst } from '@/store/sync-hulp';

export type InteractieStatus = 'laden' | 'klaar' | 'mislukt';

/** Wat er geladen is, mét het hoofdstuk waar het bij hoort. */
type Geladen = {
  sleutel: string;
  status: 'klaar' | 'mislukt';
  interactie: HoofdstukInteractie;
};

function maakSleutel(verhaalId: string, chapterId: number): string {
  return `${verhaalId}#${chapterId}`;
}

/**
 * De quizzen, polls en keuzepunten van één hoofdstuk, plus de twee schrijfacties.
 *
 * **De status wordt afgeleid, niet gezet.** De state bewaart bij welk hoofdstuk de geladen data
 * hoort; komt die sleutel niet overeen met wat er nu op het scherm staat, dan is de status
 * "laden". Een `setStatus('laden')` boven in het effect zou hetzelfde doen, maar dat is een
 * synchrone setState in een effect — een extra renderronde, en de `react-hooks`-regel die dat
 * afvangt heeft gelijk: de informatie zat al in de props.
 *
 * De stemmen worden **optimistisch** verwerkt: de balkjes schuiven meteen, de rij gaat daarna pas
 * naar Supabase. Andersom kijk je na elke stem een halve seconde naar een onveranderd scherm.
 * Mislukt het schrijven, dan draaien we het terug in plaats van een balkje te laten staan dat
 * nergens op slaat — de vraag is dan gewoon weer beantwoordbaar.
 *
 * Er is bewust géén offline wachtrij zoals bij de voortgangssync. Een stem is een losse
 * mededeling over één moment in het lezen, geen groeiende toestand die per se moet aankomen; een
 * stem die een uur later alsnog vertrekt is verwarrender dan geen stem.
 */
export function useHoofdstukInteractie(verhaalId: string, chapterId: number) {
  const user = useAuthStore((state) => state.user);
  const sleutel = maakSleutel(verhaalId, chapterId);

  const [geladen, setGeladen] = useState<Geladen | null>(null);

  useEffect(() => {
    if (!verhaalId) return;

    // Navigeren naar het volgende hoofdstuk gaat via `router.replace`, dus dit effect draait
    // opnieuw terwijl een oudere fetch nog onderweg kan zijn. Zonder deze vlag zet het antwoord
    // van hoofdstuk 3 de state van hoofdstuk 4 over.
    let geannuleerd = false;
    const dezeSleutel = maakSleutel(verhaalId, chapterId);

    haalHoofdstukInteractie(verhaalId, chapterId)
      .then((interactie) => {
        if (geannuleerd) return;
        setGeladen({ sleutel: dezeSleutel, status: 'klaar', interactie });
      })
      .catch((fout: unknown) => {
        if (geannuleerd) return;
        // Stil falen, met een regel in de console. Er is geen foutmelding en geen "opnieuw
        // proberen"-knop, omdat de app "netwerk stuk" niet kan onderscheiden van "dit hoofdstuk
        // heeft geen interactie" — en de meeste hoofdstukken hebben die niet. Een melding zou
        // offline dus onder vrijwel elk hoofdstuk verschijnen over iets dat er niet was.
        console.warn('[interactief] laden mislukt:', foutTekst(fout));
        setGeladen({ sleutel: dezeSleutel, status: 'mislukt', interactie: LEGE_INTERACTIE });
      });

    return () => {
      geannuleerd = true;
    };
  }, [verhaalId, chapterId]);

  const hoortErbij = geladen?.sleutel === sleutel;
  const status: InteractieStatus = hoortErbij ? geladen.status : 'laden';
  const interactie = hoortErbij ? geladen.interactie : LEGE_INTERACTIE;

  const stemOpPoll = useCallback(
    async (pollId: string, optie: number) => {
      // De auth-poort laat de reader alleen met sessie zien; dit is een vangnet. Zonder `user_id`
      // weigert de RLS-policy de rij toch.
      if (!user) return;

      const verschuif = (richting: 1 | -1, vanKeuze: number | null) => {
        setGeladen((huidig) => {
          if (!huidig || huidig.sleutel !== sleutel) return huidig;
          return {
            ...huidig,
            interactie: {
              ...huidig.interactie,
              polls: huidig.interactie.polls.map((poll) =>
                poll.id === pollId && poll.mijnKeuze === vanKeuze
                  ? {
                      ...poll,
                      mijnKeuze: richting === 1 ? optie : null,
                      resultaten: poll.resultaten.map((n, i) =>
                        i === optie ? Math.max(0, n + richting) : n
                      ),
                    }
                  : poll
              ),
            },
          };
        });
      };

      verschuif(1, null);
      const gelukt = await bewaarPollStem(pollId, user.id, optie);
      if (!gelukt) verschuif(-1, optie);
      // Pas meten als de rij er ook echt staat. Een teruggedraaide stem is geen stem, en een
      // meting die dat niet weet telt offline-pogingen mee als deelname.
      if (gelukt) {
        logEvent(ANALYTICS_GEBEURTENIS.pollGestemd, {
          story_id: verhaalId,
          chapter_index: chapterId,
          poll_id: pollId,
          selected_option: optie,
        });
      }
    },
    [user, sleutel, verhaalId, chapterId]
  );

  const kiesOptie = useCallback(
    async (keuzeId: string, optie: number) => {
      if (!user) return;

      const verschuif = (richting: 1 | -1, vanKeuze: number | null) => {
        setGeladen((huidig) => {
          if (!huidig || huidig.sleutel !== sleutel) return huidig;
          return {
            ...huidig,
            interactie: {
              ...huidig.interactie,
              keuzepunten: huidig.interactie.keuzepunten.map((keuze) =>
                keuze.id === keuzeId && keuze.mijnKeuze === vanKeuze
                  ? {
                      ...keuze,
                      mijnKeuze: richting === 1 ? optie : null,
                      resultaten: keuze.resultaten.map((n, i) =>
                        i === optie ? Math.max(0, n + richting) : n
                      ),
                    }
                  : keuze
              ),
            },
          };
        });
      };

      verschuif(1, null);
      const gelukt = await bewaarKeuze(keuzeId, user.id, optie);
      if (!gelukt) verschuif(-1, optie);
      if (gelukt) {
        logEvent(ANALYTICS_GEBEURTENIS.keuzeGemaakt, {
          story_id: verhaalId,
          chapter_index: chapterId,
          choice_id: keuzeId,
          selected_option: optie,
        });
      }
    },
    [user, sleutel, verhaalId, chapterId]
  );

  return { interactie, status, stemOpPoll, kiesOptie };
}
