import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { DeelOpties } from '@/components/deel-opties';
import { ThemedText } from '@/components/themed-text';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { deelBerichtMetLink } from '@/constants/deel';
import { Fonts, Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Een zin uit een hoofdstuk delen.
 *
 * Verschijnt onder elke lopende alinea en onder elk citaat in de reader (`blok-weergave.tsx`).
 * Dat zijn de twee bloktypen waarvan de tekst *van iemand* is en op zichzelf staat; een kop, een
 * weetje of een sleutelmoment leest los van zijn hoofdstuk als een fragment zonder houvast.
 *
 * ## Waarom het een icoon is en geen knop met tekst
 *
 * Er staan tot vijftien blokken in een hoofdstuk. Vijftien knoppen met "Share this quote" erop
 * maken van een leesscherm een werkbalk, en dit is een leesapp. Het is dus een klein,
 * laagcontrast icoontje rechts uitgelijnd, met een ruime `hitSlop` zodat het toch te raken is —
 * dezelfde afweging die `SettingsSectie` een gewone `Pressable` geeft in plaats van een
 * `AnimatedPressable`: terugduwen bij élke aanraking is ruis.
 *
 * Het venster erachter is wél volwaardig: daar staat wat er verstuurd wordt en welke drie wegen
 * er zijn (`deel-opties.tsx`, gedeeld met het deelvenster van een mijlpaal).
 */
export function ShareQuoteButton({
  citaat,
  verhaalTitel,
  accent,
  /** Zichtbaar boven het citaat in het venster; bij een `citaat`-blok is dat de bronvermelding. */
  bron,
  verhaalId,
}: {
  citaat: string;
  verhaalTitel: string;
  accent: string;
  bron?: string;
  verhaalId?: string;
}) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [open, setOpen] = useState(false);

  const bericht = deelBerichtMetLink(t((s) => s.deel.citaatBericht)(citaat, verhaalTitel));

  function openVenster() {
    setOpen(true);
    if (verhaalId) {
      logStoryEvent(ANALYTICS_EVENTS.QUOTE_SHARE_OPENED, { story_id: verhaalId });
    }
  }

  return (
    <>
      <View style={styles.rij}>
        <Pressable
          onPress={openVenster}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t((s) => s.deel.citaatKnop)}
          style={({ pressed }) => [styles.knop, pressed && { opacity: 0.5 }]}>
          <Ionicons name="share-outline" size={15} color={theme.inactive} />
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.laag, { backgroundColor: withAlpha('#000000', 0.6) }]}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel={t((s) => s.deel.sluiten)}>
          <Pressable onPress={() => undefined} style={styles.kaartHouder}>
            <Animated.View
              entering={FadeIn.duration(160)}
              style={[styles.kaart, { backgroundColor: theme.background, borderColor: accent }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {t((s) => s.deel.citaatKop)}
              </ThemedText>

              {/* Het fragment zoals het eruitziet, niet zoals het straks in de app staat: serif en
                  cursief, net als een `citaat`-blok in de reader. */}
              <View
                style={[
                  styles.citaatBlok,
                  { backgroundColor: theme.backgroundElement, borderLeftColor: accent },
                ]}>
                <ThemedText style={styles.citaatTekst} numberOfLines={8}>
                  {citaat}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  — {bron ?? verhaalTitel}
                </ThemedText>
              </View>

              <DeelOpties
                bericht={bericht}
                deelTitel={t((s) => s.deel.citaatTitel)}
                accent={accent}
              />

              <AnimatedPressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel={t((s) => s.deel.sluiten)}
                style={styles.sluitKnop}>
                <ThemedText type="bodyBold" themeColor="textSecondary">
                  {t((s) => s.deel.sluiten)}
                </ThemedText>
              </AnimatedPressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rij: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // Trekt het icoon tegen de alinea erboven aan in plaats van het als eigen blok te laten lezen.
    marginTop: -Spacing.one,
  },
  knop: {
    padding: Spacing.one,
  },
  laag: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  kaartHouder: {
    width: '100%',
    maxWidth: 380,
  },
  kaart: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.card,
    borderWidth: 1,
  },
  citaatBlok: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    borderLeftWidth: 3,
  },
  citaatTekst: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  sluitKnop: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
