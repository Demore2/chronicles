import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VerhaalKaart } from '@/components/verhaal-kaart';
import { Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVerhalenByTijdperk } from '@/content/verhalen';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function TijdperkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

      <ScrollView contentContainerStyle={styles.inhoud}>
        {verhalen.length === 0 ? (
          <LegeStaat
            titel={t((s) => s.tijdperkScherm.geenVerhalenTitel)}
            beschrijving={t((s) => s.tijdperkScherm.geenVerhalenBeschrijving)}
          />
        ) : (
          <>
            <View style={styles.grid}>
              {verhalen.map((verhaal) => (
                <VerhaalKaart
                  key={verhaal.id}
                  verhaal={verhaal}
                  gelezen={gelezenIds.has(verhaal.id)}
                  onPress={() => router.push({ pathname: '/verhaal/[id]', params: { id: verhaal.id } })}
                />
              ))}
            </View>
            <View style={styles.advertentie}>
              <AdBanner />
            </View>
          </>
        )}
      </ScrollView>
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
  inhoud: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  advertentie: {
    marginTop: Spacing.three,
  },
});
