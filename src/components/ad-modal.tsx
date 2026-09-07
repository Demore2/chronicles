import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ProPaywall } from '@/components/pro-paywall';
import { ThemedText } from '@/components/themed-text';
import { AD_AFTELLING_SECONDEN, AD_ONDERBREKING_ENABLED } from '@/constants/monetisatie';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useAbonnement } from '@/hooks/use-abonnement';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

type AdModalProps = {
  visible: boolean;
  /** Sluiten gaat altijd door — de aftelling stelt uit, hij houdt niets tegen. */
  onClose: () => void;
};

/**
 * De onderbreking na een uitgelezen verhaal, voor lezers zonder Pro.
 *
 * **Dit is een placeholder en zegt dat ook.** Er zit geen AdMob achter; het vak toont
 * `advertentie.plaatshouder` in plaats van een nagespeelde advertentie, want een nep-advertentie
 * die op een echte lijkt is precies waar een Play-review op afwijst. De vlag
 * `AD_ONDERBREKING_ENABLED` in `constants/monetisatie.ts` zet het geheel uit; hij hoort uit te
 * staan in een productiebuild zolang er geen echte advertenties zijn.
 *
 * Drie dingen die de vorm bepalen:
 *
 * 1. **Eén keer per uitgelezen verhaal**, niet per hoofdstuk. Acht onderbrekingen per verhaal is
 *    geen gratis model maar een strafblad.
 * 2. **De aftelling loopt alleen als het venster open staat**, en begint opnieuw bij elke opening.
 *    De timer wordt in de cleanup opgeruimd, anders tikt hij door op een gesloten scherm. Hij duurt
 *    `AD_AFTELLING_SECONDEN` (dertig — de lengte van een rewarded video), en dat is precies waarom
 *    punt 1 hierboven zwaar weegt: dertig seconden na acht hoofdstukken is een advertentie, acht
 *    keer dertig seconden is een tolpoort.
 * 3. **Er is geen weg terug via de hardwareknop** (`onRequestClose` sluit gewoon): een
 *    onderbreking die je niet weg krijgt is een vastloper, en dit scherm staat tussen de lezer en
 *    zijn net vrijgespeelde personage.
 */
export function AdModal({ visible, onClose }: AdModalProps) {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { isPremium } = useAbonnement();

  // Pro betaalt hier juist voor; de aanroeper hoeft dat niet te weten.
  if (!AD_ONDERBREKING_ENABLED || isPremium) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        {/* De inhoud (en dus de aftelling) bestaat alleen zolang het venster open staat, zodat de
            teller vanzelf weer op volle stand begint zonder een `setState` in een effect. */}
        {visible ? (
          <AdInhoud onClose={onClose} onPro={() => setPaywallOpen(true)} />
        ) : null}
      </Modal>

      <ProPaywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} bron="ad" />
    </>
  );
}

function AdInhoud({ onClose, onPro }: { onClose: () => void; onPro: () => void }) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [seconden, setSeconden] = useState(AD_AFTELLING_SECONDEN);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconden((huidig) => (huidig <= 1 ? 0 : huidig - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.8) }]}>
      <View style={[styles.venster, { backgroundColor: theme.background }]}>
        <ThemedText type="caption" themeColor="textSecondary" style={styles.label}>
          {t((s) => s.advertentie.label).toUpperCase()}
        </ThemedText>

        <View style={[styles.vak, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="megaphone-outline" size={36} color={theme.inactive} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
            {t((s) => s.advertentie.plaatshouder)}
          </ThemedText>
        </View>

        {seconden > 0 ? (
          <View style={[styles.wachtKnop, { borderColor: theme.inactive }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t((s) => s.advertentie.overslaanIn)(seconden)}
            </ThemedText>
          </View>
        ) : (
          <AnimatedPressable
            onPress={onClose}
            accessibilityRole="button"
            style={[styles.overslaanKnop, { backgroundColor: theme.accent }]}>
            <ThemedText type="bodyBold" style={{ color: theme.background }}>
              {t((s) => s.advertentie.overslaan)}
            </ThemedText>
          </AnimatedPressable>
        )}

        <Pressable onPress={onPro} accessibilityRole="button" style={styles.proKnop}>
          <ThemedText type="link" themeColor="accent">
            {t((s) => s.advertentie.proKnop)}
          </ThemedText>
        </Pressable>
      </View>
    </View>
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
  label: {
    letterSpacing: 1,
  },
  vak: {
    width: '100%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radii.button,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  wachtKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  overslaanKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  proKnop: {
    paddingVertical: Spacing.one,
  },
});
