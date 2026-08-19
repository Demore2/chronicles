import { Pressable, StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ThemedText } from '@/components/themed-text';
import type { Tijdperk } from '@/constants/types';
import { CardDimensions, Radii, Spacing, withAlpha } from '@/constants/theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function TijdperkKaart({ tijdperk, onPress }: { tijdperk: Tijdperk; onPress: () => void }) {
  const { v } = useVertaling();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: withAlpha(tijdperk.kleur, 0.12) }]}>
      <Illustratie kleur={tijdperk.kleur} icoonNaam="time-outline" iconSize={26} style={styles.iconBlok} />
      <View style={styles.textArea}>
        <ThemedText type="smallBold">{v(tijdperk.titel)}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {v(tijdperk.periode)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {v(tijdperk.korteBeschrijving)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CardDimensions.wideHeight,
    borderRadius: Radii.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
  },
  iconBlok: {
    width: CardDimensions.wideHeight - Spacing.two * 2,
    height: CardDimensions.wideHeight - Spacing.two * 2,
    borderRadius: Radii.button,
  },
  textArea: {
    flex: 1,
    gap: Spacing.half,
  },
});
