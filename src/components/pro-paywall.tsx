import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { meld } from '@/constants/dialoog';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { verhalen } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { logStoryEvent } from '@/hooks/useAnalytics';

/**
 * Vanwaar het venster geopend is.
 *
 * **Verplicht en geen optionele string met een standaardwaarde**, want het verschil tussen deze
 * vier is precies wat `paywall_viewed` interessant maakt. `banner` en `settings` zijn iemand die
 * uit zichzelf gaat kijken; `limit` en `ad` zijn iemand die tegen een muur liep. Als de conversie
 * ergens vandaan komt, komt hij van die laatste twee — en zonder deze parameter zie je dat niet.
 * Een vijfde ingang moet daarom een keuze maken in plaats van in een `undefined` te vallen.
 */
export type PaywallBron = 'banner' | 'settings' | 'limit' | 'ad';

type ProPaywallProps = {
  visible: boolean;
  onClose: () => void;
  bron: PaywallBron;
};

/**
 * Het aanbodvenster achter de Pro-banner en achter "Your plan" in Instellingen.
 *
 * **Er wordt hier niets verkocht.** Google Play Billing is nog een stub (`useAbonnement()` geeft
 * hardcoded `isPremium: false`), dus "Subscribe" opent een eerlijke melding in plaats van een
 * aankoop. Twee dingen volgen daaruit, en ze zijn allebei bewust:
 *
 * 1. De prijzen dragen een voorbehoud. Een bedrag tonen mag; doen alsof er vandaag iets af te
 *    rekenen valt niet. Er staat daarom ook geen "7 dagen gratis proberen" — een proefperiode die
 *    niet bestaat is een belofte die niemand kan opzeggen.
 * 2. De voordelenlijst noemt alleen wat de app heeft of aantoonbaar krijgt, en het aantal verhalen
 *    komt uit `verhalen.length`. Een overgetypte "100+ stories" zou én onwaar zijn (het zijn er
 *    negentien) én precies het soort claim waarop een Play-review afwijst.
 *
 * Zie `pro-access-banner.tsx` voor de vlag die het hele aanbod aan- en uitzet.
 */
export function ProPaywall({ visible, onClose, bron }: ProPaywallProps) {
  const theme = useTheme();
  const { t } = useVertaling();

  const voordelen: { icoon: IoniconNaam; tekst: string }[] = [
    { icoon: 'book-outline', tekst: t((s) => s.pro.voordeelVerhalen)(verhalen.length) },
    { icoon: 'people-outline', tekst: t((s) => s.pro.voordeelPersonages) },
    { icoon: 'sparkles-outline', tekst: t((s) => s.pro.voordeelVroeg) },
    { icoon: 'cloud-offline-outline', tekst: t((s) => s.pro.voordeelOffline) },
    { icoon: 'eye-off-outline', tekst: t((s) => s.pro.voordeelGeenAds) },
  ];

  // Het venster is een `Modal` die altijd gemonteerd staat, dus "getoond" is `visible` dat op
  // `true` springt — niet het monteren. Zonder deze voorwaarde zou elk scherm dat de paywall
  // klaarzet er meteen een weergave voor tellen.
  useEffect(() => {
    if (visible) logStoryEvent(ANALYTICS_EVENTS.PAYWALL_VIEWED, { tier: 'pro', source: bron });
  }, [visible, bron]);

  function nogNiet() {
    // Wat hier gemeten wordt is de *intentie*, niet een aankoop — zie de toelichting bij
    // `SUBSCRIPTION_ATTEMPT`. Er gaat met opzet geen bedrag of valuta in mee: een omzetparameter
    // bij een gebeurtenis die niets oplevert vervuilt het omzetrapport blijvend. `status` en
    // `reason` staan er wél in, zodat straks te zien is welke rijen uit de stub-periode komen en
    // die apart te filteren zijn zodra Billing er is.
    logStoryEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ATTEMPT, {
      tier: 'pro',
      source: bron,
      status: 'blocked_no_billing',
      reason: 'play_billing_not_integrated',
    });
    meld(
      t((s) => s.pro.nogNietTitel),
      t((s) => s.pro.nogNietTekst),
      t((s) => s.instellingen.ok),
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.6) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.venster, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t((s) => s.pro.sluiten)}
            style={styles.sluitKnop}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </Pressable>

          {/* Scrollbaar: vijf voordelen plus prijzen passen op een kleine telefoon in landschap
              niet zonder. */}
          <ScrollView contentContainerStyle={styles.inhoud} showsVerticalScrollIndicator={false}>
            <View style={[styles.merkCirkel, { backgroundColor: withAlpha(theme.accent, 0.14) }]}>
              <Ionicons name="star" size={32} color={theme.accent} />
            </View>

            <View style={styles.kopTekst}>
              <ThemedText type="title">{t((s) => s.pro.paywallTitel)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
                {t((s) => s.pro.paywallOndertitel)}
              </ThemedText>
            </View>

            <View style={styles.voordelen}>
              {voordelen.map((voordeel) => (
                <View key={voordeel.tekst} style={styles.voordeel}>
                  <Ionicons name={voordeel.icoon} size={20} color={theme.accent} />
                  <ThemedText type="small" style={styles.voordeelTekst}>
                    {voordeel.tekst}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={[styles.prijsVak, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" themeColor="accent">
                {t((s) => s.pro.prijsMaand)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t((s) => s.pro.prijsJaar)}
              </ThemedText>
            </View>

            <AnimatedPressable
              onPress={nogNiet}
              accessibilityRole="button"
              style={[styles.hoofdKnop, { backgroundColor: theme.accent }]}>
              <ThemedText type="bodyBold" style={{ color: theme.background }}>
                {t((s) => s.pro.abonneer)}
              </ThemedText>
            </AnimatedPressable>

            <Pressable onPress={onClose} accessibilityRole="button" style={styles.laterKnop}>
              <ThemedText type="link" themeColor="textSecondary">
                {t((s) => s.pro.misschienLater)}
              </ThemedText>
            </Pressable>

            <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
              {t((s) => s.pro.voorbehoud)}
            </ThemedText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  venster: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: Radii.card,
  },
  sluitKnop: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    // Boven de ScrollView, anders vangt die de tik op.
    zIndex: 1,
  },
  inhoud: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    paddingTop: Spacing.five,
  },
  merkCirkel: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kopTekst: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  voordelen: {
    width: '100%',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  voordeel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  voordeelTekst: {
    flex: 1,
  },
  prijsVak: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radii.button,
  },
  hoofdKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  laterKnop: {
    paddingVertical: Spacing.one,
  },
});
