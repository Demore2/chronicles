import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ContinentMap, type GeselecteerdeRegio } from '@/components/continent-map';
import { Flag } from '@/components/flag';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { continenten } from '@/constants/continenten';
import { Radii, Spacing } from '@/constants/theme';
import { getVerhalenByRegio } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export default function ContinentScreen() {
  const { continentId } = useLocalSearchParams<{ continentId: string }>();
  const continent = continenten.find((item) => item.id === continentId);
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const sheetRef = useRef<ComponentRef<typeof BottomSheet>>(null);
  const [geselecteerd, setGeselecteerd] = useState<GeselecteerdeRegio | null>(null);

  function handleSelectRegio(regio: GeselecteerdeRegio) {
    setGeselecteerd(regio);
    sheetRef.current?.snapToIndex(0);
  }

  function openVerhaal(verhaalId: string) {
    sheetRef.current?.close();
    router.push({ pathname: '/verhaal/[id]', params: { id: verhaalId } });
  }

  const verhalenVoorRegio = geselecteerd?.regioId ? getVerhalenByRegio(geselecteerd.regioId) : [];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: continent ? v(continent.naam) : t((s) => s.continent.titelFallback) }} />
      <ContinentMap continentId={continentId} onSelectRegio={handleSelectRegio} />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['45%']}
        enablePanDownToClose
        onClose={() => setGeselecteerd(null)}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.inactive }}>
        {geselecteerd && (
          <>
            <BottomSheetView style={styles.sheetHeader}>
              <Flag iso2={geselecteerd.iso2} size={40} />
              <ThemedText type="subtitle">{geselecteerd.naam}</ThemedText>
            </BottomSheetView>

            {verhalenVoorRegio.length > 0 ? (
              <BottomSheetFlatList
                data={verhalenVoorRegio}
                keyExtractor={(verhaal) => verhaal.id}
                contentContainerStyle={styles.sheetLijst}
                renderItem={({ item }) => (
                  <Pressable onPress={() => openVerhaal(item.id)}>
                    <ThemedView type="backgroundElement" style={styles.verhaalRij}>
                      <View style={styles.verhaalRijTekst}>
                        <ThemedText type="smallBold">{v(item.titel)}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {item.periodeLabel}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  </Pressable>
                )}
              />
            ) : (
              <BottomSheetView style={styles.sheetLege}>
                <LegeStaat titel={t((s) => s.continent.binnenkortBeschikbaar)} />
              </BottomSheetView>
            )}
          </>
        )}
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  sheetLijst: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  sheetLege: {
    paddingHorizontal: Spacing.four,
  },
  verhaalRij: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  verhaalRijTekst: {
    flex: 1,
    gap: Spacing.half,
  },
});
