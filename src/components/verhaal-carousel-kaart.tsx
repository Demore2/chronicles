import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import type { Verhaal } from '@/constants/types';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function VerhaalCarouselKaart({
  verhaal,
}: {
  verhaal: Verhaal;
}) {
  const { v } = useVertaling();
  const router = useRouter();

  const getInitial = () => {
    const titel = v(verhaal.titel);
    return titel.charAt(0).toUpperCase();
  };

  const handlePress = () => {
    router.push(`/verhaal/${verhaal.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}>
      {/* Portrait/Image Section */}
      <View
        style={[
          styles.portraitContainer,
          {
            backgroundColor: verhaal.portretKleur,
          },
        ]}>
        {verhaal.afbeelding ? (
          <Image
            source={{ uri: verhaal.afbeelding }}
            style={styles.portraitImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedText style={styles.initiaalText}>
            {getInitial()}
          </ThemedText>
        )}
      </View>

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <ThemedText type="subtitle" numberOfLines={2} style={styles.titel}>
          {v(verhaal.titel)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: Radii.card,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  portraitContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radii.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  portraitImage: {
    width: '100%',
    height: '100%',
  },
  initiaalText: {
    fontSize: 64,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  titleContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  titel: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
