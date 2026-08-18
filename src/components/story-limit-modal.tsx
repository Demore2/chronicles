import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ProPaywall } from '@/components/pro-paywall';
import { ThemedText } from '@/components/themed-text';
import { DAGELIJKSE_VERHAAL_LIMIET } from '@/constants/monetisatie';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

type StoryLimitModalProps = {
  visible: boolean;
  /** "Tot morgen" — sluit het venster én verlaat het verhaal. */
  onClose: () => void;
};

/**
 * Wat een gratis lezer ziet als hij vandaag zijn tweede verhaal al opende.
 *
 * De toon is met opzet geen verkooppraatje maar een afsluiting: wie hier komt heeft net twee
 * verhalen gelezen, precies wat de app hem vroeg. Daarom staat "Come back tomorrow" onderaan als
 * volwaardige uitweg, staat er nadrukkelijk bij dat de voortgang bewaard blijft, en is er geen
 * kruisje dat je stiekem tóch verder laat lezen — het verhaal gaat pas morgen weer open.
 *
 * De Pro-knop opent hetzelfde `pro-paywall.tsx` als de banner op Profiel; dat venster is eerlijk
 * over het feit dat er nog niets te kopen valt. **Zolang dat zo is hoort deze limiet niet in een
 * productiebuild** — zie `constants/monetisatie.ts`.
 */
export function StoryLimitModal({ visible, onClose }: StoryLimitModalProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const voordelen: { icoon: IoniconNaam; tekst: string }[] = [
    { icoon: 'infinite-outline', tekst: t((s) => s.limiet.voordeelOnbeperkt) },
    { icoon: 'eye-off-outline', tekst: t((s) => s.limiet.voordeelGeenAds) },
    { icoon: 'people-outline', tekst: t((s) => s.limiet.voordeelAlles) },
  ];

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.7) }]}>
          <View style={[styles.venster, { backgroundColor: theme.background }]}>
            <View style={[styles.merkCirkel, { backgroundColor: withAlpha(theme.accent, 0.14) }]}>
              <Ionicons name="moon-outline" size={30} color={theme.accent} />
            </View>

            <View style={styles.kopTekst}>
              <ThemedText type="title" style={styles.gecentreerd}>
                {t((s) => s.limiet.titel)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
                {t((s) => s.limiet.tekst)(DAGELIJKSE_VERHAAL_LIMIET)}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
                {t((s) => s.limiet.verderUitleg)}
              </ThemedText>
            </View>

            <View style={styles.voordelen}>
              {voordelen.map((voordeel) => (
                <View key={voordeel.tekst} style={styles.voordeel}>
                  <Ionicons name={voordeel.icoon} size={18} color={theme.accent} />
                  <ThemedText type="small" style={styles.voordeelTekst}>
                    {voordeel.tekst}
                  </ThemedText>
                </View>
              ))}
            </View>

            <AnimatedPressable
              onPress={() => setPaywallOpen(true)}
              accessibilityRole="button"
              style={[styles.hoofdKnop, { backgroundColor: theme.accent }]}>
              <ThemedText type="bodyBold" style={{ color: theme.background }}>
                {t((s) => s.limiet.upgrade)}
              </ThemedText>
            </AnimatedPressable>

            <Pressable onPress={onClose} accessibilityRole="button" style={styles.morgenKnop}>
              <ThemedText type="link" themeColor="textSecondary">
                {t((s) => s.limiet.morgen)}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Naast de Modal en niet erin: twee geneste `Modal`s zijn op Android net zo vaak één
          onzichtbaar venster als twee zichtbare. */}
      <ProPaywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
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
    maxWidth: 380,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  merkCirkel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kopTekst: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  voordelen: {
    width: '100%',
    gap: Spacing.two,
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
  hoofdKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  morgenKnop: {
    paddingVertical: Spacing.one,
  },
});
