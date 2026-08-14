import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AuthKnopProps = {
  label: string;
  onPress: () => void;
  /** Toont een spinner in plaats van het label en maakt de knop inert. */
  bezig?: boolean;
  disabled?: boolean;
};

/**
 * De primaire knop van de auth-schermen (R8.AUTH deel 2).
 *
 * De spinner staat *in* de knop en niet als overlay over het scherm: de gebruiker moet zien
 * dat zijn tik is aangekomen, zonder dat het formulier eronder verdwijnt.
 */
export function AuthKnop({ label, onPress, bezig = false, disabled = false }: AuthKnopProps) {
  const theme = useTheme();
  const inert = bezig || disabled;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: bezig }}
      style={[styles.knop, { backgroundColor: inert ? theme.inactive : theme.accent }]}>
      {bezig ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <ThemedText type="bodyBold" style={{ color: theme.background }}>
          {label}
        </ThemedText>
      )}
      {/* Houdt de knop even hoog met en zonder spinner. */}
      <View style={styles.hoogtevuller} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  knop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
  },
  hoogtevuller: {
    height: 24,
  },
});
