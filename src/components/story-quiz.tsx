import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { haptics } from '@/constants/haptics';
import { Motion } from '@/constants/motion';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import type { Quiz } from '@/lib/interactief';

const LETTERS = 'ABCDEF';

/**
 * Een meerkeuzevraag ín het hoofdstuk.
 *
 * **Dit is niet het oude quizscherm terug.** Dat stond als aparte route tussen jou en het
 * volgende hoofdstuk en is daarom verwijderd (`verhaal/[id]/quiz.tsx` is nu een grafsteen). Deze
 * quiz blokkeert niets: hij staat onder de laatste alinea, "Mark Complete" zit er gewoon achter,
 * en je kunt er zonder één tik overheen scrollen.
 *
 * De uitslag verschijnt **onder de vraag, niet in een venster**. Een modal over de reader zou de
 * plek in de tekst wegnemen die je net aan het lezen was, en de app bewaart die zwaarte voor de
 * twee momenten die hem verdienen: een ontgrendeld personage en de onderbreking daarna.
 *
 * Antwoorden worden **niet** bewaard. Er is geen `quiz_responses`-tabel: een quiz is hier een
 * zelftest tijdens het lezen, geen cijfer dat je meedraagt. Herlees je het hoofdstuk, dan staat
 * de vraag weer open — dat is bij een zelftest een feature.
 */
export function StoryQuiz({
  quiz,
  accent,
  onBeantwoord,
}: {
  quiz: Quiz;
  accent: string;
  /**
   * Aangeroepen zodra de lezer op "Check" drukt, één keer per vraag.
   *
   * Bewust een callback en geen `logEvent` in dit component: de quiz weet niet bij welk verhaal
   * of hoofdstuk hij hoort, en die twee alleen voor de meting doorgeven zou het component
   * afhankelijk maken van iets waar het verder niets mee doet. `InteractieveSectie` heeft ze al.
   */
  onBeantwoord?: (gekozen: number, goed: boolean) => void;
}) {
  const theme = useTheme();
  const { t } = useVertaling();

  const [gekozen, setGekozen] = useState<number | null>(null);
  const [gecontroleerd, setGecontroleerd] = useState(false);

  const goed = gekozen === quiz.juisteAntwoord;

  function controleer() {
    if (gekozen === null) return;
    // Goed antwoord voelt anders dan fout: de zwaardere haptic is de kleine beloning.
    if (gekozen === quiz.juisteAntwoord) {
      haptics.succes();
    } else {
      haptics.tik();
    }
    setGecontroleerd(true);
    onBeantwoord?.(gekozen, gekozen === quiz.juisteAntwoord);
  }

  /** De randkleur van één optie. Vóór het controleren zegt hij alleen wat je hebt aangeraakt. */
  function optieRand(index: number): string {
    if (!gecontroleerd) {
      return index === gekozen ? accent : withAlpha(theme.inactive, 0.4);
    }
    if (index === quiz.juisteAntwoord) return theme.succes;
    if (index === gekozen) return theme.gevaar;
    return withAlpha(theme.inactive, 0.4);
  }

  return (
    <View
      style={[
        styles.kaart,
        { backgroundColor: theme.backgroundElement, borderColor: withAlpha(accent, 0.3) },
      ]}>
      <View style={styles.kop}>
        <Ionicons name="help-circle-outline" size={18} color={accent} />
        <ThemedText type="caption" style={{ color: accent }}>
          {t((s) => s.interactief.quizKop).toUpperCase()}
        </ThemedText>
      </View>

      <ThemedText type="subtitle">{quiz.vraag}</ThemedText>

      <View style={styles.opties} accessibilityRole="radiogroup">
        {quiz.opties.map((optie, index) => (
          <AnimatedPressable
            key={index}
            onPress={() => setGekozen(index)}
            disabled={gecontroleerd}
            accessibilityRole="radio"
            accessibilityState={{ selected: gekozen === index, disabled: gecontroleerd }}
            accessibilityLabel={t((s) => s.interactief.optieLabel)(LETTERS[index] ?? '?', optie)}
            style={[
              styles.optie,
              { backgroundColor: theme.background, borderColor: optieRand(index) },
            ]}>
            <View
              style={[
                styles.letter,
                {
                  backgroundColor:
                    gekozen === index && !gecontroleerd
                      ? accent
                      : withAlpha(theme.inactive, 0.25),
                },
              ]}>
              <ThemedText
                type="caption"
                style={{
                  color: gekozen === index && !gecontroleerd ? theme.background : theme.text,
                }}>
                {LETTERS[index] ?? '?'}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.optieTekst}>
              {optie}
            </ThemedText>
            {gecontroleerd && index === quiz.juisteAntwoord && (
              <Ionicons name="checkmark-circle" size={18} color={theme.succes} />
            )}
            {gecontroleerd && index === gekozen && index !== quiz.juisteAntwoord && (
              <Ionicons name="close-circle" size={18} color={theme.gevaar} />
            )}
          </AnimatedPressable>
        ))}
      </View>

      {!gecontroleerd ? (
        <AnimatedPressable
          onPress={controleer}
          disabled={gekozen === null}
          haptisch={false}
          accessibilityRole="button"
          accessibilityState={{ disabled: gekozen === null }}
          style={[styles.knop, { backgroundColor: accent, opacity: gekozen === null ? 0.4 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {t((s) => s.interactief.quizControleer)}
          </ThemedText>
        </AnimatedPressable>
      ) : (
        <Animated.View
          entering={FadeInDown.duration(Motion.duration.normaal)}
          style={[
            styles.uitslag,
            { backgroundColor: withAlpha(goed ? theme.succes : theme.gevaar, 0.12) },
          ]}>
          <View style={styles.uitslagKop}>
            <Ionicons
              name={goed ? 'checkmark-circle' : 'information-circle'}
              size={20}
              color={goed ? theme.succes : theme.gevaar}
            />
            <ThemedText type="smallBold" style={{ color: goed ? theme.succes : theme.gevaar }}>
              {goed
                ? t((s) => s.interactief.quizGoedTitel)
                : t((s) => s.interactief.quizFoutTitel)}
            </ThemedText>
          </View>

          <ThemedText type="small">
            {goed
              ? t((s) => s.interactief.quizGoedTekst)
              : t((s) => s.interactief.quizJuisteAntwoord)(quiz.opties[quiz.juisteAntwoord])}
          </ThemedText>

          {/* De toelichting is het punt van de hele quiz: fout antwoord of niet, je leest hier
              waaróm. Daarom staat hij er ook bij een goed antwoord. */}
          {quiz.toelichting && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.toelichting}>
              {quiz.toelichting}
            </ThemedText>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kaart: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.card,
    borderWidth: 1,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  opties: {
    gap: Spacing.two,
  },
  optie: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.button,
    borderWidth: 1,
  },
  letter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optieTekst: {
    flex: 1,
  },
  knop: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  uitslag: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.button,
  },
  uitslagKop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  toelichting: {
    fontStyle: 'italic',
  },
});
