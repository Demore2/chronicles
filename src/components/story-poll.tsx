import { StemKaart } from '@/components/interactie-stem';
import type { Poll } from '@/lib/interactief';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Een peiling onder een hoofdstuk: geen goed antwoord, alleen wat lezers ervan vinden.
 *
 * De voetregel vertelt vóór het stemmen waarom je zou stemmen ("antwoord om te zien wat anderen
 * kozen") en daarna hoeveel mensen dat deden. Het aantal pas achteraf tonen is geen truc maar
 * eerlijkheid over volgorde: bij nul stemmen zou "0 lezers hebben geantwoord" onder een verse
 * peiling vooral ontmoedigen.
 */
export function StoryPoll({
  poll,
  accent,
  onStem,
}: {
  poll: Poll;
  accent: string;
  onStem: (pollId: string, optie: number) => void;
}) {
  const { t } = useVertaling();
  const totaal = poll.resultaten.reduce((som, n) => som + n, 0);

  const voet =
    poll.mijnKeuze === null
      ? t((s) => s.interactief.pollVoor)
      : totaal <= 1
        ? t((s) => s.interactief.pollEerste)
        : t((s) => s.interactief.pollStemmen)(totaal);

  return (
    <StemKaart
      icoon="stats-chart-outline"
      kop={t((s) => s.interactief.pollKop)}
      vraag={poll.vraag}
      opties={poll.opties}
      resultaten={poll.resultaten}
      mijnKeuze={poll.mijnKeuze}
      voet={voet}
      accent={accent}
      onKies={(optie) => onStem(poll.id, optie)}
    />
  );
}
