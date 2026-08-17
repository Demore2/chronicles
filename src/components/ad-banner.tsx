import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useAbonnement } from '@/hooks/use-abonnement';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Advertenties staan uit in v1.0 (LAUNCH-PLAN.md A4).
 *
 * Deze banner was een placeholder — een leeg vakje met de tekst "Advertisement" — en die kreeg
 * élke gebruiker te zien op vier schermen, omdat `useAbonnement()` hardcoded `isPremium: false`
 * teruggeeft. Placeholder-content is een klassieke afwijsreden bij Play-review, dus de vlag
 * hieronder staat op `false` en het component rendert niets.
 *
 * Zet dit pas op `true` samen met een échte AdMob-integratie (v1.1); zolang het een placeholder
 * is, hoort er niets op het scherm te staan. De call-sites in `collectie/[id]`, `regio/[id]`,
 * `tijdperk/[id]` en `verhaal/[id]/reader` blijven bewust staan, zodat de plekken bekend blijven.
 */
const ADS_ENABLED = false;

// TODO (v1.1): vervangen door een echte AdMob-banner en `ADS_ENABLED` weer aanzetten.
export function AdBanner() {
  const { isPremium } = useAbonnement();
  const theme = useTheme();
  const { t } = useVertaling();

  if (!ADS_ENABLED) return null;
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
