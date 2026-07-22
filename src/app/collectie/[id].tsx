import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { getCollectie } from '@/content/collecties';
import { getVerhalenVoorCollectie } from '@/content/queries';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function CollectieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);

  const collectie = getCollectie(id);
  const verhalen = getVerhalenVoorCollectie(id);

  if (!collectie) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.collectie.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.collectie.nietGevondenTitel)}
          beschrijving={t((s) => s.collectie.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <FlatList
        data={verhalen}
        keyExtractor={(verhaal) => verhaal.id}
        contentContainerStyle={styles.lijst}
        ListHeaderComponent={
          <View style={[styles.kop, { backgroundColor: collectie.kleur }]}>
            <Ionicons name={collectie.icoonNaam} size={36} color="#FFFFFF" />
            <ThemedText type="display" style={styles.wit}>
              {v(collectie.titel)}
            </ThemedText>
            <ThemedText style={styles.wit}>{v(collectie.beschrijving)}</ThemedText>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/verhaal/[id]', params: { id: item.id } })}
            style={[styles.rij, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.rijNummer}>
              {index + 1}
            </ThemedText>
            <View style={styles.rijTekst}>
              <ThemedText type="smallBold">{v(item.titel)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.periodeLabel}
              </ThemedText>
            </View>
            {gelezenIds.has(item.id) && (
              <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
            )}
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.advertentie}>
            <AdBanner />
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lijst: {
    paddingBottom: Spacing.six,
  },
  kop: {
    padding: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  wit: {
    color: '#FFFFFF',
  },
  rij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  rijNummer: {
    width: Spacing.five,
  },
  rijTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  advertentie: {
    marginTop: Spacing.two,
  },
});
