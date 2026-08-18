import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Motion } from '@/constants/motion';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * De gedeelde stemkaart achter `story-poll.tsx` en `story-choice.tsx`.
 *
 * Die twee verschillen in toon (een peiling vraagt wat je vindt, een keuzepunt wat je zou doen)
 * en in nadruk, maar niet in werking: kiezen, en daarna zien wat anderen kozen. Eén implementatie
 * dus, en twee dunne omhulsels eromheen — zoals `SettingsSectie` ook maar één keer bestaat.
 */

const LETTERS = 'ABCDEF';

function berekenPercentage(aantal: number, totaal: number): number {
  return totaal === 0 ? 0 : Math.round((aantal / totaal) * 100);
}

/**
 * Eén optieregel. Staat bewust buiten `StemKaart`: elke regel heeft zijn eigen shared value voor
 * de balk, en hooks kunnen niet in een `.map()` — dezelfde reden waarom `HoofdstukTegel` een
 * eigen bestand heeft.
 */
function StemRij({
  tekst,
  index,
  gekozen,
  beantwoord,
  percentage,
  accent,
  onKies,
}: {
  tekst: string;
  index: number;
  gekozen: boolean;
  beantwoord: boolean;
  percentage: number;
  accent: string;
  onKies: (index: number) => void;
}) {
  const theme = useTheme();
  const { t } = useVertaling();
  const vulling = useSharedValue(0);

  useEffect(() => {
    // De balk groeit pas ná het antwoord. Vooraf de uitslag tonen zou de peiling sturen: dan
    // stemt iedereen op wat al voorstaat.
    vulling.set(withTiming(beantwoord ? percentage : 0, { duration: Motion.duration.traag }));
  }, [beantwoord, percentage, vulling]);

  const balkStijl = useAnimatedStyle(() => ({
    width: `${vulling.get()}%` as `${number}%`,
  }));

  return (
    <AnimatedPressable
      onPress={() => onKies(index)}
      disabled={beantwoord}
      accessibilityRole="radio"
      accessibilityState={{ selected: gekozen, disabled: beantwoord }}
      accessibilityLabel={t((s) => s.interactief.optieLabel)(LETTERS[index] ?? '?', tekst)}
      style={[
        styles.rij,
        {
          backgroundColor: theme.background,
          borderColor: gekozen ? accent : withAlpha(theme.inactive, 0.4),
        },
      ]}>
      {/* De balk ligt achter de tekst in plaats van eronder: een uitslag van 68% hoort te voelen
          als een regel die voor tweederde vol staat, niet als een streepje in de marge. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.balk,
          { backgroundColor: withAlpha(accent, gekozen ? 0.3 : 0.14) },
          balkStijl,
        ]}
      />
      <View style={styles.rijInhoud}>
        <ThemedText type="small" style={styles.rijTekst}>
          {tekst}
        </ThemedText>
        {beantwoord && (
          <ThemedText type="smallBold" style={{ color: accent }}>
            {percentage}%
          </ThemedText>
        )}
        {gekozen && <Ionicons name="checkmark-circle" size={16} color={accent} />}
      </View>
    </AnimatedPressable>
  );
}

export function StemKaart({
  icoon,
  kop,
  vraag,
  opties,
  resultaten,
  mijnKeuze,
  voet,
  accent,
  nadruk = false,
  onKies,
}: {
  icoon: IoniconNaam;
  kop: string;
  vraag: string;
  opties: string[];
  /** Even lang als `opties`; de RPC garandeert dat en `leesResultaten` maakt het hard. */
  resultaten: number[];
  mijnKeuze: number | null;
  voet: string;
  accent: string;
  /** Een keuzepunt krijgt een zwaardere rand dan een peiling — het is een moment, geen vraagje. */
  nadruk?: boolean;
  onKies: (index: number) => void;
}) {
  const theme = useTheme();
  const beantwoord = mijnKeuze !== null;
  const totaal = resultaten.reduce((som, n) => som + n, 0);

  return (
    <View
      style={[
        styles.kaart,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: nadruk ? accent : withAlpha(accent, 0.3),
          borderWidth: nadruk ? 2 : 1,
        },
      ]}>
      <View style={styles.kop}>
        <Ionicons name={icoon} size={18} color={accent} />
        <ThemedText type="caption" style={{ color: accent }}>
          {kop.toUpperCase()}
        </ThemedText>
      </View>

      <ThemedText type="subtitle">{vraag}</ThemedText>

      <View style={styles.opties} accessibilityRole="radiogroup">
        {opties.map((optie, index) => (
          <StemRij
            key={index}
            tekst={optie}
            index={index}
            gekozen={mijnKeuze === index}
            beantwoord={beantwoord}
            percentage={berekenPercentage(resultaten[index] ?? 0, totaal)}
            accent={accent}
            onKies={onKies}
          />
        ))}
      </View>

      <ThemedText type="caption" themeColor="textSecondary">
        {voet}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  kaart: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  opties: {
    gap: Spacing.two,
  },
  rij: {
    overflow: 'hidden',
    borderRadius: Radii.button,
    borderWidth: 1,
  },
  balk: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  rijInhoud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rijTekst: {
    flex: 1,
  },
});
