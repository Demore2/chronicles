import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CharacterUnlockModalProps {
  personageNaam: string;
  personageImage?: string;
  onClose: () => void;
}

export function CharacterUnlockModal({ personageNaam, personageImage, onClose }: CharacterUnlockModalProps) {
  const theme = useTheme();
  const initial = personageNaam[0]?.toUpperCase() ?? '?';

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: theme.background }]}>
        {personageImage ? (
          <View style={styles.portraitWrapper}>
            <Image
              source={{ uri: personageImage }}
              style={[styles.portraitCircle, styles.portraitImage]}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={[styles.portraitCircle, { backgroundColor: theme.accent }]}>
            <ThemedText
              type="display"
              style={{
                color: theme.background,
                fontSize: 56,
              }}>
              {initial}
            </ThemedText>
          </View>
        )}

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
  portraitWrapper: {
    marginBottom: Spacing.four,
  },
  portraitCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  portraitImage: {
    width: 120,
    height: 120,
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
