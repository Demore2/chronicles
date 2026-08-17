import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/constants/haptics';
import { Motion } from '@/constants/motion';

// Shared values worden overal met `.get()`/`.set()` gelezen en gezet, niet via `.value`. Dat is de
// aanbevolen Reanimated-API én de enige vorm die door de `react-hooks/immutability`-regel van
// eslint-plugin-react-hooks komt: die ziet een `.value =`-toewijzing als het muteren van iets dat
// React onveranderlijk acht.
const PressableGeanimeerd = Animated.createAnimatedComponent(Pressable);

export type AnimatedPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Schaal op het diepste punt van de druk. Standaard `Motion.drukSchaal`. */
  drukSchaal?: number;
  /** Lichte haptische tik bij aanraking. Zet uit voor iets dat je vaak achter elkaar tikt. */
  haptisch?: boolean;
};

/**
 * `Pressable` die onder je duim indeukt en een lichte haptische tik geeft (LAUNCH-PLAN.md B4).
 *
 * Vervangt niets: de gewone `Pressable` blijft overal werken. Gebruik deze waar de aanraking een
 * beloning of navigatie inleidt (hoofdstuktegel, footer-knop, personagecirkel), niet voor elke
 * knop in de app — dan wordt de feedback ruis.
 *
 * Een `disabled` Pressable vuurt geen press-events, dus vergrendelde tegels blijven stil zonder
 * dat de aanroeper daar iets voor hoeft te doen.
 */
export function AnimatedPressable({
  style,
  drukSchaal = Motion.drukSchaal,
  haptisch = true,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const schaal = useSharedValue(1);

  const drukStijl = useAnimatedStyle(() => ({
    transform: [{ scale: schaal.get() }],
  }));

  function handlePressIn(event: GestureResponderEvent) {
    schaal.set(withSpring(drukSchaal, Motion.spring.druk));
    if (haptisch) haptics.tik();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    schaal.set(withSpring(1, Motion.spring.zacht));
    onPressOut?.(event);
  }

  return (
    <PressableGeanimeerd
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, drukStijl]}
    />
  );
}
