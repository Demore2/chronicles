import { Pressable, StyleSheet, View } from 'react-native';

import { HorizontaleRij } from '@/components/horizontale-rij';
import { ThemedText } from '@/components/themed-text';
import { VerhaalCarouselKaart } from '@/components/verhaal-carousel-kaart';
import { Radii, Spacing } from '@/constants/theme';
import type { Tijdperk, Verhaal } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function TijdperkRij({
  tijdperk,
  verhalen,
  gelezenIds,
  onPressVerhaal,
  onPressOntdekMeer,
}: {
  tijdperk: Tijdperk;
  verhalen: Verhaal[];
  gelezenIds: Set<string>;
  onPressVerhaal: (verhaalId: string) => void;
  onPressOntdekMeer: () => void;
}) {
  const theme = useTheme();
  const { t, v } = useVertaling();

  return (
    <View style={styles.container}>
      <View style={styles.kop}>
        <View style={styles.titelArea}>
          <ThemedText type="title">{v(tijdperk.titel)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {v(tijdperk.korteBeschrijving)}
          </ThemedText>
        </View>
      </View>
      <HorizontaleRij
        data={verhalen}
        keyExtractor={(verhaal) => verhaal.id}
        itemBreedte={280}
        contentContainerStyle={styles.rij}
        renderItem={({ item }) => (
          <VerhaalCarouselKaart verhaal={item} />
        )}
      />
      <Pressable
        onPress={onPressOntdekMeer}
        style={[styles.button, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          {t((s) => s.ontdek.ontdekMeer)}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  kop: {
    paddingHorizontal: Spacing.four,
  },
  titelArea: {
    gap: Spacing.half,
  },
  rij: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  button: {
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
