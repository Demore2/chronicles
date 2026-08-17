import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ThemedText } from '@/components/themed-text';
import type { Verhaal } from '@/constants/types';
import { CardDimensions, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function VerhaalKaart({
  verhaal,
  gelezen,
  onPress,
}: {
  verhaal: Verhaal;
  gelezen: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { v } = useVertaling();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.shadowWrapper, { backgroundColor: theme.background }, gelezen && styles.gelezen]}>
      <View style={styles.card}>
        {verhaal.afbeelding ? (
          <Image
            source={verhaal.afbeelding}
            style={styles.portraitImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Illustratie
            kleur={verhaal.portretKleur}
            icoonNaam="book-outline"
            style={styles.illustratie}
          />
        )}
        {gelezen && (
          <View style={[styles.checkBadge, { backgroundColor: theme.accent }]}>
            <Ionicons name="checkmark" size={14} color={theme.background} />
          </View>
        )}
        <View style={styles.textArea}>
          <ThemedText type="caption" themeColor="textSecondary">
            {verhaal.periodeLabel}
          </ThemedText>
          <ThemedText type="smallBold" numberOfLines={2}>
            {v(verhaal.titel)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: CardDimensions.portraitWidth,
    height: CardDimensions.portraitHeight,
    borderRadius: Radii.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  gelezen: {
    opacity: 0.6,
  },
  card: {
    flex: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  illustratie: {
    height: Math.round(CardDimensions.portraitHeight * CardDimensions.portraitIllustrationRatio),
  },
  portraitImage: {
    height: Math.round(CardDimensions.portraitHeight * CardDimensions.portraitIllustrationRatio),
    width: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    flex: 1,
    padding: Spacing.two,
    gap: Spacing.half,
    justifyContent: 'center',
  },
});
