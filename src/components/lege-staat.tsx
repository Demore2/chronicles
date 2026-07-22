import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { IoniconNaam } from '@/constants/types';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LegeStaat({
  titel,
  beschrijving,
  icoonNaam = 'file-tray-outline',
}: {
  titel: string;
  beschrijving?: string;
  icoonNaam?: IoniconNaam;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icoonNaam} size={32} color={theme.inactive} />
      <ThemedText type="smallBold">{titel}</ThemedText>
      {beschrijving && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.beschrijving}>
          {beschrijving}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  beschrijving: {
    textAlign: 'center',
  },
});
