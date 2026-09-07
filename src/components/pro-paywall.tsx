import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import { useSubscriptionStore } from '@/store/subscription-store';

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
  const { setTrial, loading: subscriptionLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isStartingTrial, setIsStartingTrial] = useState(false);

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
    if (visible) {
      logStoryEvent(ANALYTICS_EVENTS.PAYWALL_VIEWED, { tier: 'pro', source: bron });
    }
  }, [visible, bron]);

  // Sluiten zet de plankeuze terug op de standaard, zodat het venster bij een volgende opening
  // niet met de vorige keuze begint. Dat gebeurt hier en niet in het effect hierboven: een
  // `setState` in een effect op `visible` is een extra render-ronde voor iets wat de aanleiding
  // (de tik waarmee je sluit) zelf al weet. `isStartingTrial` hoeft niet mee — `startFreeTrial`
  // zet die in zijn `finally` al terug.
  function sluit() {
    setSelectedPlan('yearly');
    onClose();
  }

  async function startFreeTrial() {
    setIsStartingTrial(true);
    try {
      // Log the subscription attempt
      logStoryEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ATTEMPT, {
        tier: 'pro',
        source: bron,
        status: 'trial_started',
        plan: selectedPlan,
      });

      // Start 7-day free trial
      await setTrial(7);

      // Close the modal and show success
      sluit();
      meld(
        t((s) => s.pro.trialStartedTitel),
        t((s) => s.pro.trialStartedTekst),
        t((s) => s.instellingen.ok),
      );
    } catch (error) {
      console.error('Error starting trial:', error);
      meld(
        t((s) => s.pro.trialFailedTitel),
        t((s) => s.pro.trialFailedTekst),
        t((s) => s.instellingen.ok),
      );
    } finally {
      setIsStartingTrial(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={sluit}>
      <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.6) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={sluit} />

        <View style={[styles.venster, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={sluit}
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

            {/* Plan selection */}
            <View style={styles.planSelectie}>
              <Pressable
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.planButton,
                  {
                    backgroundColor:
                      selectedPlan === 'monthly' ? theme.accent : theme.backgroundElement,
                    borderWidth: selectedPlan === 'monthly' ? 0 : 1,
                    borderColor: theme.textSecondary,
                  },
                ]}>
                <ThemedText
                  type="bodyBold"
                  style={{
                    color: selectedPlan === 'monthly' ? theme.background : theme.text,
                    textAlign: 'center',
                  }}>
                  €4.99 / month
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selectedPlan === 'monthly' ? theme.background : theme.textSecondary,
                    textAlign: 'center',
                  }}>
                  Renews monthly
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setSelectedPlan('yearly')}
                style={[
                  styles.planButton,
                  {
                    backgroundColor:
                      selectedPlan === 'yearly' ? theme.accent : theme.backgroundElement,
                    borderWidth: selectedPlan === 'yearly' ? 0 : 1,
                    borderColor: theme.textSecondary,
                  },
                ]}>
                <ThemedText
                  type="bodyBold"
                  style={{
                    color: selectedPlan === 'yearly' ? theme.background : theme.text,
                    textAlign: 'center',
                  }}>
                  €49.99 / year
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selectedPlan === 'yearly' ? theme.background : theme.textSecondary,
                    textAlign: 'center',
                  }}>
                  Save 17%
                </ThemedText>
              </Pressable>
            </View>

            {/* Trial info box */}
            <View style={[styles.trialBox, { backgroundColor: withAlpha(theme.accent, 0.1) }]}>
              <Ionicons name="gift-outline" size={20} color={theme.accent} />
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyBold" themeColor="accent">
                  {t((s) => s.pro.trialOffer)}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {t((s) => s.pro.trialOfferDescription)}
                </ThemedText>
              </View>
            </View>

            <AnimatedPressable
              onPress={startFreeTrial}
              disabled={isStartingTrial || subscriptionLoading}
              accessibilityRole="button"
              style={[styles.hoofdKnop, { backgroundColor: theme.accent }]}>
              <ThemedText type="bodyBold" style={{ color: theme.background }}>
                {isStartingTrial
                  ? t((s) => s.pro.startingTrial)
                  : t((s) => s.pro.startTrial)}
              </ThemedText>
            </AnimatedPressable>

            <Pressable onPress={sluit} accessibilityRole="button" style={styles.laterKnop}>
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
  planSelectie: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  planButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  trialBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.button,
  },
});
