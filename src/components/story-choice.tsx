import { StemKaart } from '@/components/interactie-stem';
import type { Keuzepunt } from '@/lib/interactief';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Een keuzepunt: hetzelfde mechaniek als een peiling, maar in de tweede persoon en op het moment
 * waarop de historische figuur zelf moest kiezen.
 *
 * **Het verhaal vertakt niet, en de tekst belooft dat ook niet.** De hoofdstukken liggen vast in
 * de bundel; er is geen tweede versie van hoofdstuk 4 waarin Caesar de Rubicon niet oversteekt.
 * Hier stond eerst "Your choice affects the story" — dat is precies het soort belofte waar de
 * paywall en de advertentie-placeholder in deze app vanaf gestapt zijn. Wat je ná je keuze te
 * zien krijgt is wél echt: hoe andere lezers besloten, geteld uit `user_choices`.
 */
export function StoryChoice({
  keuzepunt,
  accent,
  onKies,
}: {
  keuzepunt: Keuzepunt;
  accent: string;
  onKies: (keuzeId: string, optie: number) => void;
}) {
  const { t } = useVertaling();

  const voet =
    keuzepunt.mijnKeuze === null
      ? t((s) => s.interactief.keuzeVoor)
      : t((s) => s.interactief.keuzeNa);

  return (
    <StemKaart
      icoon="git-branch-outline"
      kop={t((s) => s.interactief.keuzeKop)}
      vraag={keuzepunt.vraag}
      opties={keuzepunt.opties}
      resultaten={keuzepunt.resultaten}
      mijnKeuze={keuzepunt.mijnKeuze}
      voet={voet}
      accent={accent}
      nadruk
      onKies={(optie) => onKies(keuzepunt.id, optie)}
    />
  );
}
