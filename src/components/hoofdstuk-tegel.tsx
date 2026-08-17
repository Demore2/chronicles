import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Motion, staggerVertraging } from '@/constants/motion';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

const ROMEINSE_CIJFERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface HoofdstukTegelProps {
  /** `Chapter.id` — 1-gebaseerd, tevens het Romeinse cijfer op de tegel. */
  nummer: number;
  /** Titel, al door `v()` gehaald door de aanroeper. */
  titel: string;
  /**
   * Scènebeeld van dit hoofdstuk (`Chapter.afbeelding`). Wordt alleen getoond zodra het hoofdstuk
   * open staat — een tegel op slot houdt zijn scène nog even voor zich (LAUNCH-PLAN.md B2).
   */
  afbeelding?: ImageSourcePropType;
  leestijdMinuten: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  /** Het eerste hoofdstuk dat open staat maar nog niet af is: krijgt een puls als aandachtstrekker. */
  isVolgende: boolean;
  tijdperkKleur: string;
  /** Positie in het rooster, bepaalt de vertraging van de entree. */
  index: number;
  onPress: () => void;
}

/**
 * Eén tegel op het hoofdstukoverzicht (LAUNCH-PLAN.md B4).
 *
 * Zat eerst inline in `chapters.tsx`; is een eigen component omdat elke tegel eigen shared values
 * nodig heeft en hooks niet in een `.map()` mogen.
 *
 * De achtergrondkleur springt bewust *niet* geanimeerd om: voltooid = tijdperkkleur met lichte
 * tekst, en een kleurovergang van een halve seconde zou lichte tekst op een lichte achtergrond
 * laten zien. De spring-pop en de checkmark dragen de beweging.
 */
export function HoofdstukTegel({
  nummer,
  titel,
  afbeelding,
  leestijdMinuten,
  isUnlocked,
  isCompleted,
  isVolgende,
  tijdperkKleur,
  index,
  onPress,
}: HoofdstukTegelProps) {
  const theme = useTheme();
  const { t } = useVertaling();

  const schaal = useSharedValue(1);
  const ontgrendeld = useSharedValue(isUnlocked ? 1 : 0);
  const wasVoltooid = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    // Alleen poppen bij een échte overgang. Zonder deze check stuitert het hele rooster zodra je
    // het overzicht van een half afgerond verhaal opent.
    if (isCompleted && wasVoltooid.get() === 0) {
      schaal.set(
        withSequence(withSpring(1.06, Motion.spring.stuiter), withSpring(1, Motion.spring.zacht))
      );
    }
    wasVoltooid.set(isCompleted ? 1 : 0);
  }, [isCompleted, schaal, wasVoltooid]);

  useEffect(() => {
    ontgrendeld.set(withTiming(isUnlocked ? 1 : 0, { duration: Motion.duration.traag }));
  }, [isUnlocked, ontgrendeld]);

  useEffect(() => {
    // Vuurt zowel bij de eerste render (je opent het overzicht: "hier was je") als live wanneer je
    // met de terugknop uit een net voltooid hoofdstuk komt en deze tegel opengaat. Wacht tot de
    // entree-animatie klaar is, anders vallen de twee over elkaar heen.
    if (!isVolgende) return;
    schaal.set(
      withDelay(
        staggerVertraging(index) + Motion.duration.normaal,
        withSequence(withSpring(1.03, Motion.spring.stuiter), withSpring(1, Motion.spring.zacht))
      )
    );
  }, [isVolgende, index, schaal]);

  const tegelStijl = useAnimatedStyle(() => ({
    transform: [{ scale: schaal.get() }],
    // Vergrendeld stond op 0.5; nu geanimeerd zodat ontgrendelen zichtbaar is.
    opacity: 0.5 + 0.5 * ontgrendeld.get(),
  }));

  const tekstKleur = isCompleted ? theme.background : theme.text;
  const toonAfbeelding = afbeelding !== undefined && isUnlocked;

  return (
    <Animated.View
      style={styles.buitenkant}
      entering={FadeInDown.delay(staggerVertraging(index)).duration(Motion.duration.normaal)}>
      <Animated.View style={tegelStijl}>
        <AnimatedPressable
          onPress={onPress}
          disabled={!isUnlocked}
          style={[
            styles.tegel,
            {
              backgroundColor: isCompleted
                ? tijdperkKleur
                : isUnlocked
                  ? theme.backgroundElement
                  : theme.inactive,
            },
          ]}>
          <View style={styles.cijfer}>
            {toonAfbeelding && (
              <>
                <Image
                  source={afbeelding}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={Motion.duration.normaal}
                />
                {/* Sluier over het beeld: zonder deze laag valt een Romeins cijfer weg zodra de
                    scène toevallig licht is (Pompeii's aswolken zijn bijna wit). */}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: withAlpha(isCompleted ? tijdperkKleur : '#000000', 0.45) },
                  ]}
                />
              </>
            )}
            <ThemedText type="display" style={{ color: toonAfbeelding ? '#FFFFFF' : tekstKleur }}>
              {ROMEINSE_CIJFERS[nummer - 1] ?? String(nummer)}
            </ThemedText>
          </View>

          <View style={styles.inhoud}>
            <ThemedText type="smallBold" numberOfLines={2} style={{ color: tekstKleur }}>
              {t((s) => s.hoofdstuk.tegelTitel)(nummer, titel)}
            </ThemedText>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={{
                color: isCompleted ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary,
                marginTop: Spacing.one,
              }}>
              {t((s) => s.verhaal.minLeestijd)(leestijdMinuten)}
            </ThemedText>
          </View>

          {!isUnlocked && (
            <Ionicons
              name="lock-closed"
              size={16}
              color={theme.textSecondary}
              style={styles.slotIcoon}
            />
          )}

          {isCompleted && (
            <Animated.View style={styles.vinkIcoon} entering={ZoomIn.springify().damping(9)}>
              <Ionicons name="checkmark-circle" size={16} color={theme.background} />
            </Animated.View>
          )}
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buitenkant: {
    width: '48%',
  },
  tegel: {
    borderRadius: Radii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  cijfer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    // De tegel heeft `overflow: 'hidden'`, dus het absoluut gevulde beeld volgt vanzelf de
    // afgeronde bovenhoeken.
    overflow: 'hidden',
  },
  inhoud: {
    padding: Spacing.two,
    paddingTop: Spacing.one,
  },
  slotIcoon: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
  },
  vinkIcoon: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
  },
});
