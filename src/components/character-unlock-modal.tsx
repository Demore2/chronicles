import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CharacterUnlockModalProps {
  personageNaam: string;
  onClose: () => void;
}

export function CharacterUnlockModal({ personageNaam, onClose }: CharacterUnlockModalProps) {
  const theme = useTheme();

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: theme.background }]}>
        <View style={styles.celebration}>
          <Ionicons name="star" size={64} color={theme.accent} />
        </View>

        <ThemedText type="display" style={styles.title}>
          Character Unlocked!
        </ThemedText>

        <ThemedText
          type="subtitle"
          style={[styles.characterName, { color: theme.accent }]}>
          {personageNaam}
        </ThemedText>

        <ThemedText type="body" themeColor="textSecondary" style={styles.description}>
          You&apos;ve unlocked a new character! View your collection in the Profile tab.
        </ThemedText>

        <Pressable
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            Continue to Home
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: Radii.card,
    padding: Spacing.six,
    alignItems: 'center',
    maxWidth: '85%',
  },
  celebration: {
    position: 'relative',
    height: 100,
    width: 100,
    marginBottom: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  characterName: {
    marginBottom: Spacing.three,
    textAlign: 'center',
    fontSize: 24,
  },
  description: {
    marginBottom: Spacing.five,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
});
