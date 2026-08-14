import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AuthVeldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Extra regel onder het veld — de wachtwoordsterkte-meter op het registratiescherm. */
  hint?: React.ReactNode;
};

/**
 * Eén invoerveld met label voor de auth-schermen (R8.AUTH deel 2).
 *
 * Staat los van de schermen omdat login en signup hetzelfde veld tonen; de randkleur die
 * meebeweegt met de focus zit hier, zodat beide schermen dezelfde feedback geven.
 */
export function AuthVeld({ label, hint, onFocus, onBlur, ...rest }: AuthVeldProps) {
  const theme = useTheme();
  const [heeftFocus, setHeeftFocus] = useState(false);

  return (
    <View style={styles.veld}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        {...rest}
        onFocus={(event) => {
          setHeeftFocus(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setHeeftFocus(false);
          onBlur?.(event);
        }}
        placeholderTextColor={theme.inactive}
        style={[
          styles.invoer,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: heeftFocus ? theme.accent : theme.backgroundSelected,
            color: theme.text,
          },
        ]}
      />
      {hint}
    </View>
  );
}

const styles = StyleSheet.create({
  veld: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  invoer: {
    borderWidth: 1,
    borderRadius: Radii.button,
    padding: Spacing.three,
    fontSize: Typography.body.fontSize,
    // Zonder vaste hoogte verschilt het veld een paar pixels tussen Android en web, en dan
    // staan de twee velden onder elkaar net niet gelijk.
    minHeight: 48,
  },
});
