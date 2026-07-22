import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVerhaal } from '@/content/verhalen';
import type { Blok } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const markeerAlsGelezen = useVoortgangStore((state) => state.markeerAlsGelezen);

  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const verhaal = getVerhaal(id);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Niet gevonden' }} />
        <LegeStaat titel="Niet gevonden" beschrijving="Dit verhaal bestaat niet." />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal.tijdperkId);

  // Extract all quiz blocks from all chapters
  const quizzes: (Blok & { type: 'quiz' })[] = [];
  verhaal.chapters.forEach((chapter) => {
    chapter.blokken.forEach((blok) => {
      if (blok.type === 'quiz') {
        quizzes.push(blok as Blok & { type: 'quiz' });
      }
    });
  });

  if (quizzes.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <LegeStaat titel="Geen vragen" beschrijving="Dit verhaal heeft geen quiz." />
      </ThemedView>
    );
  }

  const correctAnswers = quizzes.reduce((count, _, index) => {
    return count + (answers[index] === quizzes[index].antwoord ? 1 : 0);
  }, 0);

  const score = Math.round((correctAnswers / quizzes.length) * 100);

  function handleSubmit() {
    setSubmitted(true);
    progress.completeQuiz();
    markeerAlsGelezen(verhaal!.id);
  }

  if (submitted) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Resultaten' }} />
        <ScrollView contentContainerStyle={styles.resultsContent}>
          <View style={styles.resultsCard}>
            <Ionicons
              name={score >= 70 ? 'checkmark-circle' : 'alert-circle'}
              size={64}
              color={score >= 70 ? tijdperk?.kleur ?? theme.accent : theme.textSecondary}
            />
            <ThemedText type="display" style={styles.scoreText}>
              {score}%
            </ThemedText>
            <ThemedText type="subtitle">
              {correctAnswers} van {quizzes.length} correct
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.resultMessage}>
              {score >= 70
                ? 'Uitstekend! Je hebt dit verhaal volledig gelezen en begrepen.'
                : 'Goed werk! Je hebt dit verhaal afgerond.'}
            </ThemedText>
          </View>

          <Pressable
            onPress={() => router.replace('/')}
            style={[
              styles.button,
              { backgroundColor: tijdperk?.kleur ?? theme.accent },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Terug naar Home
            </ThemedText>
            <Ionicons name="home" size={16} color={theme.background} />
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Quiz' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="display">Quiz</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {quizzes.length} vragen
          </ThemedText>
        </View>

        <View style={styles.quizzes}>
          {quizzes.map((quiz, index) => (
            <View
              key={index}
              style={[
                styles.quizBlock,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <View style={styles.quizHeader}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={tijdperk?.kleur ?? theme.accent}
                />
                <ThemedText type="smallBold" style={styles.quizNumber}>
                  Vraag {index + 1}
                </ThemedText>
              </View>

              <ThemedText type="subtitle" style={styles.quizVraag}>
                {v(quiz.vraag)}
              </ThemedText>

              <View style={styles.answerButtons}>
                <Pressable
                  onPress={() => setAnswers((prev) => ({ ...prev, [index]: true }))}
                  style={[
                    styles.answerButton,
                    {
                      backgroundColor:
                        answers[index] === true
                          ? tijdperk?.kleur ?? theme.accent
                          : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: answers[index] === true ? theme.background : theme.text,
                    }}>
                    {t((s) => s.verhaal.waar ?? 'Waar')}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setAnswers((prev) => ({ ...prev, [index]: false }))}
                  style={[
                    styles.answerButton,
                    {
                      backgroundColor:
                        answers[index] === false
                          ? tijdperk?.kleur ?? theme.accent
                          : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{
                      color: answers[index] === false ? theme.background : theme.text,
                    }}>
                    {t((s) => s.verhaal.nietWaar ?? 'Niet waar')}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.footerButton, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">Terug</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          style={[
            styles.footerButton,
            { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
          ]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            Verzenden
          </ThemedText>
          <Ionicons name="checkmark" size={16} color={theme.background} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  quizzes: {
    gap: Spacing.three,
  },
  quizBlock: {
    padding: Spacing.three,
    borderRadius: Radii.card,
    gap: Spacing.two,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  quizNumber: {
    fontSize: 12,
  },
  quizVraag: {
    marginTop: Spacing.one,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  answerButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  resultsContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
  },
  scoreText: {
    marginTop: Spacing.two,
  },
  resultMessage: {
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radii.card,
    marginTop: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
