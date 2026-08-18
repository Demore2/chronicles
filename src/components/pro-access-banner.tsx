import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ProPaywall } from '@/components/pro-paywall';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useAbonnement } from '@/hooks/use-abonnement';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Eén schakelaar voor het hele Pro-aanbod: deze banner én het paywall-venster erachter, ook waar
 * Instellingen het opent. Staat hij uit, dan is er nergens in de app een spoor van abonnementen.
 *
 * **Zet dit terug op `false` voordat er een productiebuild naar Play gaat, zolang Google Play
 * Billing niet echt gekoppeld is.** `useAbonnement()` geeft nog hardcoded `isPremium: false`
 * terug, dus "Subscribe" leidt tot een melding en niet tot een aankoop. Dat is eerlijk richting de
 * gebruiker (`pro-paywall.tsx` legt uit hoe), maar een reviewer die een prijs ziet en geen
 * werkende aankoop vindt, wijst de app af — dezelfde afweging als bij `ADS_ENABLED` in
 * `ad-banner.tsx`. Hij staat nu aan zodat het scherm te bekijken en te testen is.
 *
 * De `isPremium`-check hieronder is voorlopig dood, maar staat er zodat een betalende gebruiker
 * straks niet naar zijn eigen aanbieding zit te kijken.
 */
export const PRO_BANNER_ENABLED = true;

// TODO (v1.1): koppelen aan Google Play Billing; tot die tijd verkoopt dit scherm niets.
export function ProAccessBanner() {
  const theme = useTheme();
  const { t } = useVertaling();
  const { isPremium } = useAbonnement();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (!PRO_BANNER_ENABLED) return null;
  if (isPremium) return null;

  return (
    <>
      <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
        <Ionicons name="star" size={22} color={theme.accent} />
        <View style={styles.tekst}>
          <ThemedText type="smallBold">{t((s) => s.pro.titel)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.pro.ondertitel)}
          </ThemedText>
        </View>
        <AnimatedPressable
          onPress={() => setPaywallOpen(true)}
          accessibilityRole="button"
          style={[styles.knop, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {t((s) => s.pro.knop)}
          </ThemedText>
        </AnimatedPressable>
      </View>

      <ProPaywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  tekst: {
    flex: 1,
    gap: Spacing.half,
  },
  knop: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
