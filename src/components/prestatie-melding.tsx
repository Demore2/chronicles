import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { haptics } from '@/constants/haptics';
import { prestatieMet } from '@/constants/prestaties';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { usePrestatieStore } from '@/store/prestatie-store';

/** Hoe lang de melding blijft staan als de lezer hem niet wegtikt. */
const ZICHTBAAR_MS = 4500;

/**
 * De viering van een mijlpaal *in* de app: een strook die vanaf de bovenrand binnenschuift en
 * zichzelf weer opruimt.
 *
 * **Bewust een strook en geen modal.** Een mijlpaal wordt bijna altijd bereikt op het moment dat
 * je een hoofdstuk afvinkt — precies wanneer de reader zijn eigen "Unlock &lt;naam&gt;"-knop toont
 * en er even later een `CharacterUnlockModal` overheen komt. Twee vensters die om dezelfde tik
 * vragen is één te veel, en de zwaarste onderbreking is in dit project gereserveerd voor het
 * ontgrendelde personage (zie `character-unlock-modal.tsx`). Deze strook onderbreekt niets: hij
 * blokkeert geen aanraking, wacht niet op een `onClose` en verdwijnt vanzelf.
 *
 * Hangt in de root layout, zodat hij op elk scherm kan verschijnen. Wat er te vieren valt komt uit
 * `prestatie-store.teVieren`; `use-prestaties.ts` zet dat alleen als de app op de voorgrond stond
 * — stond hij op de achtergrond, dan is het een systeemmelding geworden.
 */
export function PrestatieMelding() {
  const theme = useTheme();
  const { t } = useVertaling();
  const insets = useSafeAreaInsets();
  const teVieren = usePrestatieStore((state) => state.teVieren);
  const wisTeVieren = usePrestatieStore((state) => state.wisTeVieren);
  const toonDetail = usePrestatieStore((state) => state.toonDetail);

  useEffect(() => {
    if (!teVieren) return;
    haptics.succes();
    const timer = setTimeout(() => wisTeVieren(), ZICHTBAAR_MS);
    return () => clearTimeout(timer);
  }, [teVieren, wisTeVieren]);

  if (!teVieren) return null;
  const prestatie = prestatieMet(teVieren);
  // Een id uit de opslag die niet meer bestaat (mijlpaal hernoemd of verwijderd): stilletjes niets
  // tonen is hier beter dan een lege strook.
  if (!prestatie) return null;

  const naam = t((s) => s.prestatie.namen)[prestatie.id];
  const uitleg = t((s) => s.prestatie.uitleg)[prestatie.categorie](prestatie.drempel);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(200)}
      // `pointerEvents="box-none"` op de laag eromheen: alleen de strook zelf vangt tikken, de
      // rest van het scherm blijft gewoon bedienbaar terwijl hij in beeld staat.
      pointerEvents="box-none"
      style={[styles.laag, { top: insets.top + Spacing.two }]}>
      <Pressable
        // Aantikken opent het venster met de datum, de punten en de deelknop; het haalt de strook
        // meteen weg (`toonDetail` wist `teVieren`). Zo is die viering één tik na de ontgrendeling
        // bereikbaar zonder dat er ooit een venster óver de personageviering in de reader valt —
        // zie de kop van `achievement-unlock-modal.tsx`.
        onPress={() => toonDetail(teVieren)}
        accessibilityRole="button"
        accessibilityLabel={`${t((s) => s.prestatie.meldingTitel)}: ${naam}. ${uitleg}`}
        style={[
          styles.strook,
          { backgroundColor: theme.backgroundElement, borderColor: theme.accent },
        ]}>
        <View style={[styles.icoonRing, { backgroundColor: theme.accent }]}>
          <Ionicons name={prestatie.icoon} size={20} color={theme.background} />
        </View>
        <View style={styles.tekst}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t((s) => s.prestatie.meldingTitel)}
          </ThemedText>
          <ThemedText type="bodyBold" numberOfLines={1}>
            {naam}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {uitleg}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  laag: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    // Boven de schermen, onder een eventuele modal: die hoort deze strook te kunnen bedekken.
    zIndex: 50,
  },
  strook: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.card,
    borderWidth: 1,
  },
  icoonRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tekst: {
    flex: 1,
    gap: 1,
  },
});
