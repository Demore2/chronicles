import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { verhalen } from '@/content/verhalen';
import type { UnlockedCharacter } from '@/store/character-unlock-store';

interface CharacterGridProps {
  unlockedCharacters: UnlockedCharacter[];
  totalCharacters: number;
}

export function CharacterGrid({ unlockedCharacters, totalCharacters }: CharacterGridProps) {
  const theme = useTheme();
  const router = useRouter();

  const unlockedIds = new Set(unlockedCharacters.map((c) => c.verhaalId));

  return (
    <View style={styles.grid}>
      {verhalen.map((verhaal) => {
        const isUnlocked = unlockedIds.has(verhaal.id);
        const initial = verhaal.personage?.naam?.[0]?.toUpperCase() ?? '?';

        return (
          <AnimatedPressable
            key={verhaal.id}
            // `disabled` in plaats van een `if` in de handler: zo geeft een vergrendelde cirkel ook
            // geen druk-animatie of haptische tik terug (LAUNCH-PLAN.md B4).
            disabled={!isUnlocked}
            onPress={() => router.push(`/verhaal/${verhaal.id}`)}
            style={styles.cardContainer}>
            {isUnlocked && verhaal.afbeelding ? (
              <View style={styles.portraitWrapper}>
                <Image
                  source={verhaal.afbeelding}
                  style={styles.circle}
                  contentFit="cover"
                  transition={200}
                />
                <View style={[styles.checkmark, { backgroundColor: theme.background }]}>
                  <Ionicons name="checkmark" size={12} color={theme.accent} />
                </View>
              </View>
            ) : isUnlocked ? (
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.accent,
                  },
                ]}>
                <ThemedText
                  type="display"
                  style={{
                    color: theme.background,
                    fontSize: 32,
                  }}>
                  {initial}
                </ThemedText>
                <View style={[styles.checkmark, { backgroundColor: theme.background }]}>
                  <Ionicons name="checkmark" size={12} color={theme.accent} />
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.inactive,
                  },
                ]}>
                <ThemedText
                  type="display"
                  style={{
                    color: theme.textSecondary,
                    fontSize: 24,
                  }}>
                  ?
                </ThemedText>
              </View>
            )}
            <ThemedText
              type="small"
              numberOfLines={2}
              style={[
                styles.name,
                {
                  color: isUnlocked ? theme.text : theme.textSecondary,
                },
              ]}>
              {isUnlocked ? verhaal.personage?.naam ?? 'Character' : 'Locked'}
            </ThemedText>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Spacing.four,
  },
  cardContainer: {
    alignItems: 'center',
    width: '30%',
    marginBottom: Spacing.two,
  },
  portraitWrapper: {
    position: 'relative',
    marginBottom: Spacing.two,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    overflow: 'hidden',
  },
  checkmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: Spacing.half,
  },
  name: {
    textAlign: 'center',
    fontSize: 11,
  },
});
