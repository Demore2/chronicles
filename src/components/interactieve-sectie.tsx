import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryChoice } from '@/components/story-choice';
import { StoryPoll } from '@/components/story-poll';
import { StoryQuiz } from '@/components/story-quiz';
import { ANALYTICS_GEBEURTENIS } from '@/constants/analytics';
import { Motion, staggerVertraging } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
import { useHoofdstukInteractie } from '@/hooks/use-interactie';
import { logEvent } from '@/hooks/useAnalytics';
import { isLeeg } from '@/lib/interactief';

/**
 * De interactieve onderdelen onder een hoofdstuk: eerst de quiz (kijk of je het volgde), dan de
 * peiling (wat vind je ervan), dan het keuzepunt (wat had jij gedaan). Die volgorde loopt van
 * feitelijk naar persoonlijk, en dat is ook de volgorde waarin het de tekst het minst in de weg
 * zit: de quiz gaat over wat je net gelezen hebt, het keuzepunt kijkt vooruit.
 *
 * Het staat **onder** de blokken en boven de advertentiebalk, niet ertussenin. Een quiz halverwege
 * een alinea knipt de leesregel door; hier is het een natuurlijke pauze aan het eind.
 *
 * Rendert `null` zolang er niets is — laden, mislukt, of een hoofdstuk zonder interactie zien er
 * voor de lezer hetzelfde uit, en dat is precies de bedoeling: dit is additief.
 */
export function InteractieveSectie({
  verhaalId,
  chapterId,
  accent,
}: {
  verhaalId: string;
  chapterId: number;
  /** De tijdperkkleur, zodat de kaarten bij het verhaal horen — net als `BlokWeergave`. */
  accent: string;
}) {
  const { interactie, status, stemOpPoll, kiesOptie } = useHoofdstukInteractie(
    verhaalId,
    chapterId
  );

  if (status !== 'klaar' || isLeeg(interactie)) return null;

  // Doorlopende positie over de drie soorten heen, zodat de kaarten na elkaar binnenkomen in
  // plaats van alle drie tegelijk. Berekend uit de lengtes en niet met een teller die tijdens het
  // renderen ophoogt — muteren in een `.map()` is precies het patroon dat later stilletjes breekt.
  const naQuizzes = interactie.quizzes.length;
  const naPolls = naQuizzes + interactie.polls.length;

  return (
    <View style={styles.sectie}>
      {interactie.quizzes.map((quiz, index) => (
        <Animated.View
          key={quiz.id}
          entering={FadeInDown.delay(staggerVertraging(index)).duration(Motion.duration.normaal)}>
          <StoryQuiz
            quiz={quiz}
            accent={accent}
            onBeantwoord={(gekozen, goed) =>
              logEvent(ANALYTICS_GEBEURTENIS.quizBeantwoord, {
                story_id: verhaalId,
                chapter_index: chapterId,
                quiz_id: quiz.id,
                selected_option: gekozen,
                correct: goed,
              })
            }
          />
        </Animated.View>
      ))}

      {interactie.polls.map((poll, index) => (
        <Animated.View
          key={poll.id}
          entering={FadeInDown.delay(staggerVertraging(naQuizzes + index)).duration(
            Motion.duration.normaal
          )}>
          <StoryPoll poll={poll} accent={accent} onStem={stemOpPoll} />
        </Animated.View>
      ))}

      {interactie.keuzepunten.map((keuzepunt, index) => (
        <Animated.View
          key={keuzepunt.id}
          entering={FadeInDown.delay(staggerVertraging(naPolls + index)).duration(
            Motion.duration.normaal
          )}>
          <StoryChoice keuzepunt={keuzepunt} accent={accent} onKies={kiesOptie} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectie: {
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
});
