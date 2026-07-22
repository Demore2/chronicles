import { Pressable, StyleSheet, View } from 'react-native';

import { HorizontaleRij } from '@/components/horizontale-rij';
import { ThemedText } from '@/components/themed-text';
import { VerhaalKaart } from '@/components/verhaal-kaart';
import { CardDimensions, Spacing } from '@/constants/theme';
import type { Tijdperk, Verhaal } from '@/constants/types';
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
        <Pressable onPress={onPressOntdekMeer} hitSlop={8}>
          <ThemedText type="link" themeColor="accent">
            {t((s) => s.ontdek.ontdekMeer)}
          </ThemedText>
        </Pressable>
      </View>
      <HorizontaleRij
        data={verhalen}
        keyExtractor={(verhaal) => verhaal.id}
        itemBreedte={CardDimensions.portraitWidth}
        contentContainerStyle={styles.rij}
        renderItem={({ item }) => (
          <VerhaalKaart verhaal={item} gelezen={gelezenIds.has(item.id)} onPress={() => onPressVerhaal(item.id)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  titelArea: {
    flex: 1,
    gap: Spacing.half,
  },
  rij: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
