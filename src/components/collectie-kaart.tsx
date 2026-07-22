import { Pressable, StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ThemedText } from '@/components/themed-text';
import type { Collectie } from '@/constants/types';
import { CardDimensions, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function CollectieKaart({ collectie, onPress }: { collectie: Collectie; onPress: () => void }) {
  const theme = useTheme();
  const { v } = useVertaling();

  return (
    <Pressable onPress={onPress} style={[styles.shadowWrapper, { backgroundColor: theme.background }]}>
      <View style={styles.card}>
        <Illustratie
          kleur={collectie.kleur}
          icoonNaam={collectie.icoonNaam}
          iconSize={48}
          style={styles.illustratie}
        />
        <View style={styles.textArea}>
          <ThemedText type="caption" themeColor="textSecondary">
            {v(collectie.label)}
          </ThemedText>
          <ThemedText type="smallBold" numberOfLines={2}>
            {v(collectie.titel)}
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
  card: {
    flex: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  illustratie: {
    height: Math.round(CardDimensions.portraitHeight * CardDimensions.portraitIllustrationRatio),
  },
  textArea: {
    flex: 1,
    padding: Spacing.two,
    gap: Spacing.half,
    justifyContent: 'center',
  },
});
