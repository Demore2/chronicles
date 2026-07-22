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
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { useVertaling } from '@/hooks/use-vertaling';

export default function ChapterQuizScreen() {
  const { id, chapterId: chapterIdParam } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { v } = useVertaling();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const verhaal = getVerhaal(id);
  const chapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : 1;
  const chapter = verhaal?.chapters.find((ch) => ch.id === chapterId);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Niet gevonden' }} />
        <LegeStaat titel="Niet gevonden" beschrijving="Dit verhaal bestaat niet." />
      </ThemedView>
    );
  }

  if (!chapter || !chapter.quiz) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Niet gevonden' }} />
        <LegeStaat titel="Geen vraag" beschrijving="Dit chapter heeft geen quiz." />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal.tijdperkId);
  const isLastChapter = chapterId === verhaal.chapters.length;

  function handleAnswerSelect(answerIndex: number) {
    if (answered || !chapter?.quiz) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === chapter.quiz.antwoord;
    setIsCorrect(correct);
    progress.answerChapterQuiz(chapterId, correct);
    if (!correct) {
      progress.loseLive();
    }
    setAnswered(true);
  }

  function handleContinue() {
    if (isLastChapter) {
      router.push({
        pathname: '/verhaal/[id]/chapters',
        params: { id: verhaal!.id },
      });
    } else {
      router.push({
        pathname: '/verhaal/[id]/reader',
        params: { id: verhaal!.id, chapterId: String(chapterId + 1) },
      });
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/verhaal/[id]/reader',
              params: { id: verhaal!.id, chapterId: String(chapterId) },
            })
          }
          style={[styles.headerButton, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="arrow-back" size={16} color={theme.text} />
          <ThemedText type="smallBold">Back</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.livesIndicator}>
          <View style={styles.livesRow}>
            {[0, 1, 2].map((i) => (
              <Ionicons
                key={i}
                name={i < progress.lives ? 'heart' : 'heart-outline'}
                size={24}
                color={i < progress.lives ? '#FF6B6B' : theme.textSecondary}
              />
            ))}
          </View>
        </View>

        <View style={styles.quizHeader}>
          <ThemedText type="small" themeColor="textSecondary">
            Chapter {chapterId} Quiz
          </ThemedText>
          <ThemedText type="display">{v(chapter.quiz.vraag)}</ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {chapter?.quiz?.opties.map((optie, index) => (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(index)}
              disabled={answered}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    selectedAnswer === index
                      ? isCorrect
                        ? '#4CAF50'
                        : '#FF6B6B'
                      : answered && index === chapter?.quiz?.antwoord
                        ? '#4CAF50'
                        : theme.backgroundElement,
                  opacity: answered && selectedAnswer !== index ? 0.5 : 1,
                },
              ]}>
              <View style={styles.optionNumber}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color: selectedAnswer === index || (answered && index === chapter?.quiz?.antwoord) ? '#fff' : theme.text,
                  }}>
                  {String.fromCharCode(65 + index)}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={{
                  color: selectedAnswer === index || (answered && index === chapter?.quiz?.antwoord) ? '#fff' : theme.text,
                  flex: 1,
                }}>
                {v(optie)}
              </ThemedText>
              {selectedAnswer === index && (
                <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={20} color="#fff" />
              )}
              {answered && index === chapter?.quiz?.antwoord && selectedAnswer !== index && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              )}
            </Pressable>
          ))}
        </View>

        {answered && (
          <View
            style={[
              styles.feedbackBox,
              { backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)' },
            ]}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? '#4CAF50' : '#FF6B6B'}
            />
            <ThemedText type="subtitle" style={styles.feedbackText}>
              {isCorrect ? 'Correct!' : 'Oeps, dat is niet juist.'}
            </ThemedText>
            {!isCorrect && (
              <ThemedText type="small" themeColor="textSecondary">
                Je hebt 1 hartje verloren. ({progress.lives} remaining)
              </ThemedText>
            )}
          </View>
        )}
      </ScrollView>

      {answered && (
        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={handleContinue}
            style={[styles.footerKnop, { backgroundColor: tijdperk?.kleur ?? theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {isLastChapter ? 'Back to Chapters' : 'Next Chapter'}
            </ThemedText>
            <Ionicons
              name={isLastChapter ? 'arrow-back' : 'arrow-forward'}
              size={16}
              color={theme.background}
            />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  livesIndicator: {
    gap: Spacing.two,
  },
  livesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quizHeader: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  optionsContainer: {
    gap: Spacing.two,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  feedbackBox: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  feedbackText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
    flex: 1,
  },
});
