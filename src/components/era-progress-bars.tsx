import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Motion } from '@/constants/motion';
import { Radii, Spacing } from '@/constants/theme';
import { getActieveTijdperken } from '@/constants/tijdperken';
import type { Tijdperk } from '@/constants/types';
import { verhalen } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * Eén balk per tijdperk: hoeveel van dat tijdperk je hebt uitgelezen.
 *
 * **De teller is `completedStories`, niet `bekekenIds`.** Een balk die volloopt zodra je een
 * verhaal *opent* meet nieuwsgierigheid en geen voortgang, en zou vol staan na een middag
 * rondklikken. Uitgelezen is uitgelezen.
 *
 * De kleur van een balk is `tijdperk.kleur` — dezelfde kleur waarmee dat tijdperk overal in de app
 * al herkenbaar is, dus geen tweede kleurenlijst die uit de pas kan gaan lopen. Alleen de actieve
 * tijdperken staan er: een tijdperk zonder content zou een 0/0-balk zijn waar je niets aan hebt.
 *
 * Elke rij blijft aantikbaar en gaat naar dat tijdperk. Dat is het antwoord op de vraag die een
 * halfvolle balk oproept ("welke mis ik dan nog?"), en het was ook wat de oude lijst deed.
 */
export function EraProgressBars() {
  const { t } = useVertaling();
  const completedStories = useVoortgangStore((state) => state.completedStories);

  const rijen = useMemo(() => {
    return getActieveTijdperken().map((tijdperk) => {
      const verhalenInEra = verhalen.filter((verhaal) => verhaal.tijdperkId === tijdperk.id);
      const voltooid = verhalenInEra.filter((verhaal) => completedStories.has(verhaal.id)).length;
      return { tijdperk, voltooid, totaal: verhalenInEra.length };
    });
  }, [completedStories]);

  return (
    <View style={styles.blok}>
      <ThemedText type="title" style={styles.kop}>
        {t((s) => s.voortgang.byEra)}
      </ThemedText>
      <View style={styles.lijst}>
        {rijen.map((rij) => (
          <EraBalk
            key={rij.tijdperk.id}
            tijdperk={rij.tijdperk}
            voltooid={rij.voltooid}
            totaal={rij.totaal}
          />
        ))}
      </View>
    </View>
  );
}

function EraBalk({
  tijdperk,
  voltooid,
  totaal,
}: {
  tijdperk: Tijdperk;
  voltooid: number;
  totaal: number;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { t, v } = useVertaling();

  const fractie = totaal > 0 ? voltooid / totaal : 0;
  const procent = Math.round(fractie * 100);
  const compleet = totaal > 0 && voltooid === totaal;

  // De balk groeit naar zijn stand in plaats van er te staan. Hij begint op 0 en loopt bij het
  // openen van het scherm vol: dat is het hele punt van deze sectie — je *ziet* dat er iets is
  // opgeschoven sinds de vorige keer. Bij een latere wijziging (een verhaal uitgelezen terwijl
  // dit scherm in de stack staat) animeert dezelfde `withTiming` van oud naar nieuw.
  const breedte = useSharedValue(0);

  useEffect(() => {
    breedte.set(withTiming(fractie, { duration: Motion.duration.traag }));
  }, [breedte, fractie]);

  const vullingStijl = useAnimatedStyle(() => ({
    width: `${breedte.get() * 100}%`,
  }));

  return (
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/tijdperk/[id]', params: { id: tijdperk.id } })}
      style={[styles.rij, { backgroundColor: theme.backgroundElement }]}
      accessibilityRole="button"
      accessibilityLabel={`${v(tijdperk.titel)}. ${t((s) => s.voortgang.storiesOfEra)(voltooid, totaal)}`}>
      <View style={styles.rijKop}>
        <View style={styles.rijTitel}>
          {/* Een gekleurde stip in plaats van een emoji: dezelfde kleur als de balk eronder, dus
              de rij is al herkenbaar voordat je de naam leest. */}
          <View style={[styles.stip, { backgroundColor: tijdperk.kleur }]} />
          <ThemedText type="smallBold" numberOfLines={1} style={styles.rijNaam}>
            {v(tijdperk.titel)}
          </ThemedText>
          {compleet && <Ionicons name="checkmark-circle" size={16} color={theme.accent} />}
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          {t((s) => s.voortgang.storiesOfEra)(voltooid, totaal)}
        </ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <Animated.View
          style={[styles.vulling, { backgroundColor: tijdperk.kleur }, vullingStijl]}
        />
      </View>

      <ThemedText type="caption" themeColor="textSecondary" style={styles.procent}>
        {t((s) => s.voortgang.eraPercentage)(procent)}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  blok: {
    gap: Spacing.three,
  },
  kop: {
    paddingHorizontal: Spacing.four,
  },
  lijst: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  rij: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  rijKop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rijTitel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rijNaam: {
    flexShrink: 1,
  },
  stip: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  track: {
    height: 8,
    borderRadius: Radii.small,
    overflow: 'hidden',
    marginTop: Spacing.half,
  },
  vulling: {
    height: '100%',
    borderRadius: Radii.small,
  },
  procent: {
    alignSelf: 'flex-end',
  },
});
