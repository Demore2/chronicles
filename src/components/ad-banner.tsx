import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useAbonnement } from '@/hooks/use-abonnement';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

// TODO: vervangen door een echte AdMob-banner zodra advertenties zijn ingericht.
export function AdBanner() {
  const { isPremium } = useAbonnement();
  const theme = useTheme();
  const { t } = useVertaling();

  if (isPremium) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <Ionicons name="megaphone-outline" size={18} color={theme.textSecondary} />
      <ThemedText type="small" themeColor="textSecondary">
        {t((s) => s.advertentie.label)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: Radii.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
  },
});
