import { supabase } from '@/lib/supabase';
import { foutTekst } from '@/store/sync-hulp';

/**
 * Interactief lezen: de quizzen, polls en keuzepunten die onder de hoofdstukblokken staan.
 *
 * **Dit is de enige laag in de app waar leescontent van de server komt.** De verhalen zelf zitten
 * in de bundel (`src/content/verhalen/**`) en werken offline; dit niet. Dat is een bewuste
 * afweging: de uitslag van een poll bestaat alleen als er een server is die hem optelt. De prijs
 * is dat een lezer zonder verbinding deze onderdelen niet ziet. Ze zijn daarom overal
 * **additief** — een hoofdstuk zonder interactie leest precies zoals het altijd deed, en een
 * mislukte fetch levert een lege sectie op, geen foutmelding over het hoofdstuk heen.
 *
 * **Let op: dit is niet de oude quiz terug.** `verhaal/[id]/quiz.tsx` was een apart scherm dat
 * tussen jou en het volgende hoofdstuk stond; dat is verwijderd en blijft verwijderd. Deze quiz
 * staat ín het hoofdstuk, is optioneel en blokkeert niets: je kunt eroverheen scrollen naar
 * "Mark Complete" zonder hem aan te raken.
 */

/** Eén meerkeuzevraag met een goed antwoord. Antwoorden worden niet bewaard — zie `story-quiz`. */
export type Quiz = {
  id: string;
  vraag: string;
  opties: string[];
  juisteAntwoord: number;
  toelichting: string | null;
};

/** Een peiling zonder goed antwoord. `resultaten` is altijd even lang als `opties`. */
export type Poll = {
  id: string;
  vraag: string;
  opties: string[];
  resultaten: number[];
  mijnKeuze: number | null;
};

/** Een keuzepunt: dezelfde vorm als een poll, maar in de tweede persoon gesteld. */
export type Keuzepunt = {
  id: string;
  keuzepuntId: string;
  vraag: string;
  opties: string[];
  resultaten: number[];
  mijnKeuze: number | null;
};

export type HoofdstukInteractie = {
  quizzes: Quiz[];
  polls: Poll[];
  keuzepunten: Keuzepunt[];
};

export const LEGE_INTERACTIE: HoofdstukInteractie = {
  quizzes: [],
  polls: [],
  keuzepunten: [],
};

export function isLeeg(interactie: HoofdstukInteractie): boolean {
  return (
    interactie.quizzes.length === 0 &&
    interactie.polls.length === 0 &&
    interactie.keuzepunten.length === 0
  );
}

// De RPC geeft `jsonb` terug, en `jsonb` kent geen vorm die Postgres afdwingt — precies zoals bij
// `character_unlocks.unlocked_characters`. Dus parsen we defensief en gooien we een rij weg die
// niet klopt, in plaats van het hele hoofdstuk te laten struikelen over één slechte seed.
function isTekstArray(waarde: unknown): waarde is string[] {
  return Array.isArray(waarde) && waarde.length > 0 && waarde.every((x) => typeof x === 'string');
}

/**
 * Leest de uitslagen als exact `aantalOpties` getallen. De RPC levert dat al zo aan, maar een
 * client die op die lengte vertrouwt rendert "undefined%" zodra er ooit iets misgaat.
 */
function leesResultaten(waarde: unknown, aantalOpties: number): number[] {
  const rij: unknown[] = Array.isArray(waarde) ? waarde : [];
  return Array.from({ length: aantalOpties }, (_, i) => {
    const getal = rij[i];
    return typeof getal === 'number' && Number.isFinite(getal) ? getal : 0;
  });
}

function leesKeuze(waarde: unknown, aantalOpties: number): number | null {
  if (typeof waarde !== 'number' || !Number.isInteger(waarde)) return null;
  return waarde >= 0 && waarde < aantalOpties ? waarde : null;
}

function leesQuiz(rij: Record<string, unknown>): Quiz | null {
  const opties = rij.options;
  if (typeof rij.id !== 'string' || typeof rij.question !== 'string' || !isTekstArray(opties)) {
    return null;
  }
  const juist = rij.correct_answer;
  // Een quiz waarvan het goede antwoord buiten de opties valt kan niemand goed hebben; overslaan
  // is beter dan tonen. De check-constraint op de tabel houdt dit ook tegen, een seed die er
  // langs een ander pad in komt niet per se.
  if (typeof juist !== 'number' || juist < 0 || juist >= opties.length) return null;

  return {
    id: rij.id,
    vraag: rij.question,
    opties,
    juisteAntwoord: juist,
    toelichting: typeof rij.explanation === 'string' ? rij.explanation : null,
  };
}

function leesPoll(rij: Record<string, unknown>): Poll | null {
  const opties = rij.options;
  if (typeof rij.id !== 'string' || typeof rij.question !== 'string' || !isTekstArray(opties)) {
    return null;
  }
  return {
    id: rij.id,
    vraag: rij.question,
    opties,
    resultaten: leesResultaten(rij.resultaten, opties.length),
    mijnKeuze: leesKeuze(rij.mijn_keuze, opties.length),
  };
}

function leesKeuzepunt(rij: Record<string, unknown>): Keuzepunt | null {
  const opties = rij.options;
  if (
    typeof rij.id !== 'string' ||
    typeof rij.prompt !== 'string' ||
    typeof rij.choice_point_id !== 'string' ||
    !isTekstArray(opties)
  ) {
    return null;
  }
  return {
    id: rij.id,
    keuzepuntId: rij.choice_point_id,
    vraag: rij.prompt,
    opties,
    resultaten: leesResultaten(rij.resultaten, opties.length),
    mijnKeuze: leesKeuze(rij.mijn_keuze, opties.length),
  };
}

function leesLijst<T>(waarde: unknown, lees: (rij: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(waarde)) return [];
  const uit: T[] = [];
  for (const rij of waarde) {
    if (rij && typeof rij === 'object' && !Array.isArray(rij)) {
      const item = lees(rij as Record<string, unknown>);
      if (item) uit.push(item);
    }
  }
  return uit;
}

/**
 * Haalt alles op wat bij één hoofdstuk hoort, in **één** aanroep.
 *
 * Drie losse selects zouden hier ook kunnen, maar de uitslag van een poll is een *aggregaat*: om
 * die in de client te tellen moet je álle rijen van `poll_responses` kunnen lezen, en dan lees je
 * meteen wie wat gestemd heeft. De RPC `hoofdstuk_interactie` telt server-side
 * (`security definer`) en geeft alleen aantallen terug — plus je eigen antwoord, want dat mag je
 * wél zien.
 *
 * `chapterId` is `Chapter.id` uit de content en telt vanaf 1. De kolom heet `chapter_index`; de
 * check-constraint daarop (`>= 1`) legt vast dat het ondanks die naam geen 0-gebaseerde index is.
 */
export async function haalHoofdstukInteractie(
  verhaalId: string,
  chapterId: number
): Promise<HoofdstukInteractie> {
  const { data, error } = await supabase.rpc('hoofdstuk_interactie', {
    p_story_id: verhaalId,
    p_chapter_index: chapterId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object') return LEGE_INTERACTIE;

  const bron = data as Record<string, unknown>;
  return {
    quizzes: leesLijst(bron.quizzes, leesQuiz),
    polls: leesLijst(bron.polls, leesPoll),
    keuzepunten: leesLijst(bron.choices, leesKeuzepunt),
  };
}

/**
 * Legt één stem vast. `ignoreDuplicates` maakt er `on conflict do nothing` van, en dat is precies
 * wat de unique constraint `(poll_id, user_id)` verwacht: twee toestellen die tegelijk stemmen
 * leveren één rij op in plaats van een fout, en er is geen `update`-policy voor nodig.
 *
 * Gooit niet. Een verloren stem is vervelend, maar mag het lezen niet onderbreken — de aanroeper
 * heeft de uitslag lokaal al bijgewerkt en krijgt hier `false` terug als het toch misging.
 */
export async function bewaarPollStem(
  pollId: string,
  userId: string,
  optie: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('poll_responses')
      .upsert(
        { poll_id: pollId, user_id: userId, selected_option: optie },
        { onConflict: 'poll_id,user_id', ignoreDuplicates: true }
      );
    if (error) throw error;
    return true;
  } catch (fout) {
    console.warn('[interactief] stem bewaren mislukt:', foutTekst(fout));
    return false;
  }
}

/** Zelfde verhaal als `bewaarPollStem`, voor een keuzepunt. */
export async function bewaarKeuze(
  keuzeId: string,
  userId: string,
  optie: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_choices')
      .upsert(
        { choice_id: keuzeId, user_id: userId, selected_option: optie },
        { onConflict: 'choice_id,user_id', ignoreDuplicates: true }
      );
    if (error) throw error;
    return true;
  } catch (fout) {
    console.warn('[interactief] keuze bewaren mislukt:', foutTekst(fout));
    return false;
  }
}
