import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { HoofdstukTegel } from '@/components/hoofdstuk-tegel';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Motion } from '@/constants/motion';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { berekenLeestijdMinuten } from '@/content/leestijd';
import { getVerhaal } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { useVertaling } from '@/hooks/use-vertaling';

export default function ChaptersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();

  const verhaal = getVerhaal(id);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  // Zonder verhaal is `progressPercentage` een NaN (0/0) — die mag niet in een animatie belanden.
  const voortgangPercentage = Number.isFinite(progress.progressPercentage)
    ? progress.progressPercentage
    : 0;
  const voortgangBreedte = useSharedValue(0);

  useEffect(() => {
    // Start op 0 en loop vol. Dit scherm wordt via `router.push` steeds opnieuw gemonteerd, dus
    // een overgang tussen twee waardes zou je nooit zien; het vollopen bij openen wel.
    voortgangBreedte.set(
      withDelay(
        Motion.duration.normaal,
        withTiming(voortgangPercentage, { duration: Motion.duration.traag })
      )
    );
  }, [voortgangPercentage, voortgangBreedte]);

  const voortgangStijl = useAnimatedStyle(() => ({
    width: `${voortgangBreedte.get()}%` as `${number}%`,
  }));

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

  // Het eerste hoofdstuk dat open staat maar nog niet af is — daar was de lezer gebleven.
  const volgendHoofdstukId = verhaal.chapters.find(
    (chapter) => progress.isChapterUnlocked(chapter.id) && !progress.isChapterCompleted(chapter.id)
  )?.id;

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

      <View style={styles.headerBar}>
        <AnimatedPressable
          onPress={() => router.push('/')}
          style={[styles.homeButton, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">{t((s) => s.tabs.ontdek)}</ThemedText>
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="display">{v(verhaal.titel)}</ThemedText>
        <ThemedText themeColor="textSecondary">{v(verhaal.ondertitel)}</ThemedText>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: tijdperk?.kleur ?? theme.accent },
                voortgangStijl,
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.hoofdstuk.voortgang)(progress.completedChapters.length, verhaal.chapters.length)}
          </ThemedText>
        </View>

        <View style={styles.chaptersGrid}>
          {verhaal.chapters.map((chapter, index) => (
            <HoofdstukTegel
              key={chapter.id}
              nummer={chapter.id}
              titel={v(chapter.titel)}
              afbeelding={chapter.afbeelding}
              leestijdMinuten={berekenLeestijdMinuten(chapter.blokken, v)}
              isUnlocked={progress.isChapterUnlocked(chapter.id)}
              isCompleted={progress.isChapterCompleted(chapter.id)}
              isVolgende={chapter.id === volgendHoofdstukId}
              tijdperkKleur={tijdperk?.kleur ?? theme.accent}
              index={index}
              onPress={() => handleChapterPress(chapter.id)}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
          <ThemedText type="small" style={styles.infoText}>
            {t((s) => s.hoofdstuk.volgordeUitleg)}
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
  headerBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
  },
  homeButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
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
  // De tegelstijlen (chapterTile/tileImage/tileContent/lockIcon/checkIcon) staan nu in
  // `components/hoofdstuk-tegel.tsx`, samen met de tegel zelf.
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
});
