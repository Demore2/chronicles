import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { BlokWeergave } from '@/components/blok-weergave';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVolgendVerhaal } from '@/content/queries';
import { getVerhaal } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function VerhaalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);
  const markeerAlsGelezen = useVoortgangStore((state) => state.markeerAlsGelezen);
  const markeerAlsBekeken = useVoortgangStore((state) => state.markeerAlsBekeken);

  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [quizAntwoorden, setQuizAntwoorden] = useState<Record<number, boolean>>({});

  const verhaal = getVerhaal(id);

  useEffect(() => {
    if (verhaal) markeerAlsBekeken(verhaal.id);
  }, [verhaal, markeerAlsBekeken]);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.verhaal.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.verhaal.nietGevondenTitel)}
          beschrijving={t((s) => s.verhaal.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal.tijdperkId);
  const volgende = getVolgendVerhaal(verhaal.id);
  const gelezen = gelezenIds.has(verhaal.id);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    setScrollPercentage(max > 0 ? Math.min(1, Math.max(0, contentOffset.y / max)) : 0);
  }

  function beantwoordQuiz(blokIndex: number, antwoord: boolean) {
    setQuizAntwoorden((prev) => ({ ...prev, [blokIndex]: antwoord }));
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '' }} />

      <View style={[styles.voortgangsbalkTrack, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.voortgangsbalkVulling,
            { backgroundColor: theme.accent, width: `${scrollPercentage * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        <ThemedText type="display">{v(verhaal.titel)}</ThemedText>
        <ThemedText themeColor="textSecondary">{v(verhaal.ondertitel)}</ThemedText>
        <View style={styles.metaRij}>
          <ThemedText type="small" themeColor="textSecondary">
            {verhaal.periodeLabel}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ·
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.verhaal.minLeestijd)(verhaal.leestijdMinuten)}
          </ThemedText>
        </View>

        <View style={styles.blokken}>
          {verhaal.blokken.map((blok, index) => (
            <BlokWeergave
              key={index}
              blok={blok}
              tijdperkKleur={tijdperk?.kleur ?? theme.inactive}
              gekozenAntwoord={quizAntwoorden[index]}
              onBeantwoord={(antwoord) => beantwoordQuiz(index, antwoord)}
            />
          ))}
        </View>

        <View style={styles.advertentie}>
          <AdBanner />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Pressable
          onPress={() => markeerAlsGelezen(verhaal.id)}
          style={[styles.footerKnopSecundair, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons
            name={gelezen ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={theme.accent}
          />
          <ThemedText type="smallBold">
            {gelezen ? t((s) => s.verhaal.gelezen) : t((s) => s.verhaal.markeerAlsGelezen)}
          </ThemedText>
        </Pressable>
        {volgende && (
          <Pressable
            onPress={() => router.replace({ pathname: '/verhaal/[id]', params: { id: volgende.id } })}
            style={[styles.footerKnopPrimair, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {t((s) => s.verhaal.volgendVerhaal)}
            </ThemedText>
            <Ionicons name="arrow-forward" size={16} color={theme.background} />
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voortgangsbalkTrack: {
    height: 3,
    width: '100%',
  },
  voortgangsbalkVulling: {
    height: 3,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  metaRij: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  blokken: {
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  advertentie: {
    marginTop: Spacing.four,
    marginHorizontal: -Spacing.four,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerKnopSecundair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.button,
  },
  footerKnopPrimair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
});
