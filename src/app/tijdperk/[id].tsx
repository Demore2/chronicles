import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVerhalenByTijdperk } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function TijdperkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);

  const tijdperk = getTijdperk(id);
  const verhalen = useMemo(() => getVerhalenByTijdperk(id), [id]);

  if (!tijdperk) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.tijdperkScherm.titel) }} />
        <LegeStaat
          titel={t((s) => s.tijdperkScherm.nietGevondenTitel)}
          beschrijving={t((s) => s.tijdperkScherm.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <View style={[styles.kop, { backgroundColor: tijdperk.kleur }]}>
        <ThemedText type="display" style={styles.wit}>
          {v(tijdperk.titel)}
        </ThemedText>
        <ThemedText style={styles.wit}>{v(tijdperk.periode)}</ThemedText>
      </View>

      <FlatList
        data={verhalen}
        keyExtractor={(verhaal) => verhaal.id}
        contentContainerStyle={styles.lijst}
        ListEmptyComponent={
          <LegeStaat
            titel={t((s) => s.tijdperkScherm.geenVerhalenTitel)}
            beschrijving={t((s) => s.tijdperkScherm.geenVerhalenBeschrijving)}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/verhaal/[id]', params: { id: item.id } })}
            style={[styles.rij, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.rijTekst}>
              <ThemedText type="caption" themeColor="textSecondary">
                {item.periodeLabel}
              </ThemedText>
              <ThemedText type="smallBold">{v(item.titel)}</ThemedText>
            </View>
            {gelezenIds.has(item.id) && (
              <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
            )}
          </Pressable>
        )}
        ListFooterComponent={
          verhalen.length > 0 ? (
            <View style={styles.advertentie}>
              <AdBanner />
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kop: {
    padding: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.two,
  },
  wit: {
    color: '#FFFFFF',
  },
  lijst: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  rij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  rijTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  advertentie: {
    marginTop: Spacing.two,
  },
});
