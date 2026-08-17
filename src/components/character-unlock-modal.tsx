import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { haptics } from '@/constants/haptics';
import { Motion } from '@/constants/motion';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

const PORTRET_MAAT = 120;
const PULS_DUUR = 2000;

interface CharacterUnlockModalProps {
  personageNaam: string;
  /** `Verhaal.afbeelding` — een gebundeld asset, geen URL meer (LAUNCH-PLAN.md B1). */
  personageImage?: ImageSourcePropType;
  onClose: () => void;
}

/**
 * Eén ring die vanuit het portret naar buiten dijt en uitdooft. Twee stuks met een halve periode
 * verschil geven een doorlopende radiale puls (LAUNCH-PLAN.md B4).
 */
function PulsRing({ kleur, vertraging }: { kleur: string; vertraging: number }) {
  const puls = useSharedValue(0);

  useEffect(() => {
    puls.set(
      withDelay(
        vertraging,
        withRepeat(
          withTiming(1, { duration: PULS_DUUR, easing: Easing.out(Easing.quad) }),
          -1,
          false
        )
      )
    );
  }, [puls, vertraging]);

  const stijl = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + puls.get() * 0.7 }],
    opacity: 0.5 * (1 - puls.get()),
  }));

  return <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: kleur }, stijl]} />;
}

export function CharacterUnlockModal({ personageNaam, personageImage, onClose }: CharacterUnlockModalProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const initial = personageNaam[0]?.toUpperCase() ?? '?';

  const portretSchaal = useSharedValue(0.4);
  const gloed = useSharedValue(0.25);

  useEffect(() => {
    // Dit is de kernbeloning van de app, dus het zwaarste haptische signaal dat we hebben.
    haptics.ontgrendeld();

    portretSchaal.set(withDelay(Motion.duration.snel, withSpring(1, Motion.spring.stuiter)));
    gloed.set(withRepeat(withTiming(0.9, { duration: PULS_DUUR / 2 }), -1, true));
  }, [portretSchaal, gloed]);

  const portretStijl = useAnimatedStyle(() => ({
    transform: [{ scale: portretSchaal.get() }],
  }));

  const gloedStijl = useAnimatedStyle(() => ({
    opacity: gloed.get(),
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.modal, { backgroundColor: theme.background }]}
        entering={ZoomIn.springify().damping(13).mass(0.9)}>
        <View style={styles.portraitWrapper}>
          <PulsRing kleur={theme.accent} vertraging={0} />
          <PulsRing kleur={theme.accent} vertraging={PULS_DUUR / 2} />
          <Animated.View
            pointerEvents="none"
            style={[styles.gloedRing, { borderColor: theme.accent }, gloedStijl]}
          />

          <Animated.View style={portretStijl}>
            {personageImage ? (
              <Image
                source={personageImage}
                style={styles.portraitCircle}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.portraitCircle, { backgroundColor: theme.accent }]}>
                <ThemedText type="display" style={{ color: theme.background, fontSize: 56 }}>
                  {initial}
                </ThemedText>
              </View>
            )}
          </Animated.View>
        </View>

        <Animated.View
          style={styles.tekstBlok}
          entering={FadeInDown.delay(Motion.duration.normaal).duration(Motion.duration.normaal)}>
          <ThemedText type="display" style={styles.title}>
            {t((s) => s.personage.ontgrendeldTitel)}
          </ThemedText>

          <ThemedText type="subtitle" style={[styles.characterName, { color: theme.accent }]}>
            {personageNaam}
          </ThemedText>

          <ThemedText type="body" themeColor="textSecondary" style={styles.description}>
            {t((s) => s.personage.ontgrendeldBeschrijving)}
          </ThemedText>
        </Animated.View>

        {/* `haptisch={false}`: het zware ontgrendel-signaal is net geweest, een tikje erbovenop
            voelt als ruis. */}
        <AnimatedPressable
          onPress={onClose}
          haptisch={false}
          style={[styles.closeButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {t((s) => s.personage.naarHome)}
          </ThemedText>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: Radii.card,
    padding: Spacing.six,
    alignItems: 'center',
    maxWidth: '85%',
  },
  portraitWrapper: {
    width: PORTRET_MAAT,
    height: PORTRET_MAAT,
    marginBottom: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: PORTRET_MAAT,
    height: PORTRET_MAAT,
    borderRadius: PORTRET_MAAT / 2,
    borderWidth: 2,
  },
  gloedRing: {
    position: 'absolute',
    width: PORTRET_MAAT + Spacing.two,
    height: PORTRET_MAAT + Spacing.two,
    borderRadius: (PORTRET_MAAT + Spacing.two) / 2,
    borderWidth: 3,
  },
  portraitCircle: {
    width: PORTRET_MAAT,
    height: PORTRET_MAAT,
    borderRadius: PORTRET_MAAT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tekstBlok: {
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  characterName: {
    marginBottom: Spacing.three,
    textAlign: 'center',
    fontSize: 24,
  },
  description: {
    marginBottom: Spacing.five,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
});
