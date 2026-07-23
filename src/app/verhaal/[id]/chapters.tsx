import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function calculateReadTime(blokken: any[]): number {
  let totalWords = 0;
  blokken.forEach((blok) => {
    if (blok.tekst) {
      const text = typeof blok.tekst === 'string' ? blok.tekst : blok.tekst.en || '';
      totalWords += text.split(/\s+/).length;
    } else if (blok.citaat) {
      const text = typeof blok.citaat === 'string' ? blok.citaat : blok.citaat.en || '';
      totalWords += text.split(/\s+/).length;
    }
  });
  return Math.max(1, Math.ceil(totalWords / 250));
}

export default function ChaptersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();

  const verhaal = getVerhaal(id);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.verhaal.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.verhaal.nietGevondenTitel)}
          beschrijving={t((s) => s.verhaal.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal.tijdperkId);

  function handleChapterPress(chapterId: number) {
    if (progress.isChapterUnlocked(chapterId)) {
      router.push({
        pathname: '/verhaal/[id]/reader',
        params: { id: verhaal!.id, chapterId: String(chapterId) },
      });
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={() => router.push('/')} style={[styles.homeButton, { backgroundColor: theme.backgroundElement }]}>
        <Ionicons name="chevron-back" size={20} color={theme.text} />
        <ThemedText type="smallBold">Home</ThemedText>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="display">{v(verhaal.titel)}</ThemedText>
        <ThemedText themeColor="textSecondary">{v(verhaal.ondertitel)}</ThemedText>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress.progressPercentage}%`,
                  backgroundColor: tijdperk?.kleur ?? theme.accent,
                },
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {progress.completedChapters.length} / {verhaal.chapters.length} chapters
          </ThemedText>
        </View>

        <View style={styles.chaptersGrid}>
          {verhaal.chapters.map((chapter) => {
            const isUnlocked = progress.isChapterUnlocked(chapter.id);
            const isCompleted = progress.isChapterCompleted(chapter.id);
            const readTime = calculateReadTime(chapter.blokken);

            return (
              <Pressable
                key={chapter.id}
                onPress={() => handleChapterPress(chapter.id)}
                disabled={!isUnlocked}
                style={[
                  styles.chapterTile,
                  {
                    backgroundColor: isCompleted
                      ? tijdperk?.kleur ?? theme.accent
                      : isUnlocked
                        ? theme.backgroundElement
                        : theme.inactive,
                    opacity: isUnlocked ? 1 : 0.5,
                  },
                ]}>
                <View style={styles.tileImage}>
                  <ThemedText
                    type="display"
                    style={{
                      color: isCompleted ? theme.background : theme.text,
                    }}>
                    {ROMAN_NUMERALS[chapter.id - 1]}
                  </ThemedText>
                </View>

                <View style={styles.tileContent}>
                  <ThemedText
                    type="smallBold"
                    numberOfLines={2}
                    style={{
                      color: isCompleted ? theme.background : theme.text,
                    }}>
                    {`Chapter ${chapter.id}: `}
                    {v(chapter.titel)}
                  </ThemedText>

                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={{
                      color: isCompleted ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary,
                      marginTop: Spacing.one,
                    }}>
                    {readTime} min read
                  </ThemedText>
                </View>

                {!isUnlocked && (
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={theme.textSecondary}
                    style={styles.lockIcon}
                  />
                )}

                {isCompleted && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.background}
                    style={styles.checkIcon}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
          <ThemedText type="small" style={styles.infoText}>
            Complete chapters in order to unlock the next one.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingTop: Spacing.six + Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  progressSection: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  chapterTile: {
    width: '48%',
    borderRadius: Radii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  tileImage: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileContent: {
    padding: Spacing.two,
    paddingTop: Spacing.one,
  },
  lockIcon: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
  },
  checkIcon: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
  },
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
    marginTop: Spacing.three,
  },
  infoText: {
    flex: 1,
  },
  homeButton: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.button,
    zIndex: 10,
  },
});
