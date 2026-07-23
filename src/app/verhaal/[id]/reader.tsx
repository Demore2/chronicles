import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { BlokWeergave } from '@/components/blok-weergave';
import { CharacterUnlockModal } from '@/components/character-unlock-modal';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVerhaal } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';

export default function ReaderScreen() {
  const { id, chapterId: chapterIdParam } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { v } = useVertaling();
  const characterStore = useCharacterUnlockStore();

  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const verhaal = getVerhaal(id);
  const chapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : 1;
  const chapter = verhaal?.chapters.find((ch) => ch.id === chapterId);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  const allChaptersRead = progress.completedChapters.length === verhaal?.chapters.length;
  const characterUnlocked = verhaal ? characterStore.isCharacterUnlocked(verhaal.id) : false;
  const shouldShowUnlockButton = allChaptersRead && !characterUnlocked;

  useEffect(() => {
    if (chapter && scrollPercentage >= 0.8) {
      progress.completeChapter(chapterId);
    }
  }, [scrollPercentage, chapter, chapterId, progress]);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Niet gevonden' }} />
        <LegeStaat titel="Niet gevonden" beschrijving="Dit verhaal bestaat niet." />
      </ThemedView>
    );
  }

  if (!chapter) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Niet gevonden' }} />
        <LegeStaat titel="Niet gevonden" beschrijving="Dit chapter bestaat niet." />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal!.tijdperkId);
  const isLastChapter = chapterId === verhaal!.chapters.length;
  const nextChapterUnlocked = progress.isChapterUnlocked(chapterId + 1);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    setScrollPercentage(max > 0 ? Math.min(1, Math.max(0, contentOffset.y / max)) : 0);
  }

  function handleNextChapter() {
    if (!isLastChapter && nextChapterUnlocked) {
      router.push({
        pathname: '/verhaal/[id]/reader',
        params: { id: verhaal!.id, chapterId: String(chapterId + 1) },
      });
    }
  }

  function handleUnlockCharacter() {
    if (verhaal) {
      characterStore.unlockCharacter(verhaal.id, verhaal.personage.naam);
      setShowUnlockModal(true);
    }
  }

  function handleCloseUnlockModal() {
    setShowUnlockModal(false);
    router.push('/');
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/verhaal/[id]/chapters',
                params: { id: verhaal!.id },
              })
            }
            style={[styles.headerButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="arrow-back" size={16} color={theme.text} />
            <ThemedText type="smallBold">Back to Chapters</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={[styles.voortgangsbalkTrack, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.voortgangsbalkVulling,
            { backgroundColor: tijdperk?.kleur ?? theme.accent, width: `${scrollPercentage * 100}%` },
          ]}
        />
      </View>

      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={styles.scrollContent}>
        <View style={styles.scrollHeader}>
          <ThemedText type="small" themeColor="textSecondary">
            Chapter {chapterId} of {verhaal.chapters.length}
          </ThemedText>
          <ThemedText type="display">{v(chapter.titel)}</ThemedText>
        </View>

        <View style={styles.blokken}>
          {chapter.blokken.map((blok, index) => (
            <BlokWeergave
              key={index}
              blok={blok}
              tijdperkKleur={tijdperk?.kleur ?? theme.inactive}
            />
          ))}
        </View>

        <View style={styles.advertentie}>
          <AdBanner />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        {!progress.isChapterCompleted(chapterId) ? (
          <Pressable
            onPress={() => progress.completeChapter(chapterId)}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Mark Complete
            </ThemedText>
            <Ionicons name="checkmark-circle" size={16} color={theme.background} />
          </Pressable>
        ) : shouldShowUnlockButton ? (
          <Pressable
            onPress={handleUnlockCharacter}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Unlock {verhaal!.personage.naam}
            </ThemedText>
            <Ionicons name="star" size={16} color={theme.background} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNextChapter}
            disabled={isLastChapter}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {isLastChapter ? 'All Chapters Complete' : 'Next Chapter'}
            </ThemedText>
            <Ionicons
              name={isLastChapter ? 'checkmark-circle' : 'arrow-forward'}
              size={16}
              color={theme.background}
            />
          </Pressable>
        )}
      </View>

      <Modal visible={showUnlockModal} animationType="fade" transparent={true}>
        <CharacterUnlockModal
          personageNaam={verhaal?.personage.naam ?? 'Character'}
          onClose={handleCloseUnlockModal}
        />
      </Modal>
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
  headerTop: {
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
  voortgangsbalkTrack: {
    height: 3,
    width: '100%',
  },
  voortgangsbalkVulling: {
    height: 3,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  scrollHeader: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  blokken: {
    gap: Spacing.four,
  },
  advertentie: {
    marginTop: Spacing.four,
    marginHorizontal: -Spacing.four,
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
  },
});
