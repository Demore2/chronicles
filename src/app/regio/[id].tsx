import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { Flag } from '@/components/flag';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getRegio } from '@/constants/regios';
import { Radii, Spacing } from '@/constants/theme';
import { getVerhalenByRegio } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function RegioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);

  const regio = getRegio(id);
  const verhalen = getVerhalenByRegio(id);
  const gelezenAantal = verhalen.filter((verhaal) => gelezenIds.has(verhaal.id)).length;

  if (!regio) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.regio.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.regio.nietGevondenTitel)}
          beschrijving={t((s) => s.regio.nietGevondenBeschrijving)}
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
          <View style={[styles.kop, { backgroundColor: theme.backgroundElement }]}>
            <Flag iso2={regio.iso2} size={48} />
            <ThemedText type="display">{v(regio.naam)}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {t((s) => s.regio.voortgang)(gelezenAantal, verhalen.length)}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <LegeStaat
            titel={t((s) => s.regio.geenVerhalenTitel)}
            beschrijving={t((s) => s.regio.geenVerhalenBeschrijving)}
          />
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
