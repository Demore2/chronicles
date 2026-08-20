import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { deelAlsLink, deelViaWhatsApp, kopieer, type DeelResultaat } from '@/constants/deel';
import { haptics } from '@/constants/haptics';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * De drie deelknoppen, en de regel eronder die zegt wat er gebeurd is.
 *
 * Staat apart omdat er twee vensters op uitkomen — een mijlpaal (`share-achievement-modal.tsx`)
 * en een citaat (`share-quote-button.tsx`) — en die twee horen zich hetzelfde te gedragen. Twee
 * kopieën zouden op den duur twee verschillende antwoorden geven op "is dit nou gelukt?".
 *
 * ## Waarom er een terugkoppelingsregel is en geen melding
 *
 * "Gekopieerd" is iets anders dan "gedeeld" en geen van beide is een fout — zie `DeelResultaat`
 * in `constants/deel.ts`. Een `meld()` erbovenop zou een tweede venster op een venster zetten voor
 * iets wat de lezer zelf net in gang zette. Deze regel verschijnt onder de knoppen, blokkeert
 * niets, en is er bij een afgebroken deelvenster bewust *niet*: dat weet de lezer al.
 */

export type DeelUitkomst = Extract<DeelResultaat, 'gedeeld' | 'gekopieerd'>;

export function DeelOpties({
  bericht,
  deelTitel,
  accent,
  onGedeeld,
}: {
  /** De volledige tekst die verstuurd wordt, inclusief de app-link. */
  bericht: string;
  /** Titel van het deelvenster van het toestel. Zichtbaar op Android als vensterkop. */
  deelTitel: string;
  /** De kleur van de hoofdknop; volgt de categorie of het tijdperk van wat er gedeeld wordt. */
  accent: string;
  /**
   * Aangeroepen zodra er echt iets vertrokken is — gedeeld óf gekopieerd. Een weggeklikt
   * deelvenster telt niet, want dan is er niets gedeeld om te markeren.
   */
  onGedeeld?: (uitkomst: DeelUitkomst) => void;
}) {
  const theme = useTheme();
  const { t } = useVertaling();

  /** Wat er onder de knoppen staat. `null` = nog niets gedaan. */
  const [melding, setMelding] = useState<string | null>(null);

  async function voerUit(actie: () => Promise<DeelResultaat>) {
    haptics.tik();
    const resultaat = await actie();

    if (resultaat === 'gedeeld' || resultaat === 'gekopieerd') {
      haptics.succes();
      onGedeeld?.(resultaat);
    }

    // Weggeklikt is geen uitkomst om over te berichten: de lezer wéét dat hij dat net deed.
    if (resultaat === 'afgebroken') {
      setMelding(null);
      return;
    }

    setMelding(
      resultaat === 'gedeeld'
        ? t((s) => s.deel.gelukt)
        : resultaat === 'gekopieerd'
          ? t((s) => s.deel.gekopieerd)
          : t((s) => s.deel.nietMogelijk),
    );
  }

  return (
    <View style={styles.houder}>
      <AnimatedPressable
        // `voerUit` geeft zelf een tik en bij succes een zwaarder signaal.
        haptisch={false}
        onPress={() => void voerUit(() => deelViaWhatsApp(bericht))}
        accessibilityRole="button"
        accessibilityLabel={t((s) => s.deel.whatsapp)}
        style={[styles.knop, { backgroundColor: accent }]}>
        <Ionicons name="logo-whatsapp" size={18} color={theme.background} />
        <ThemedText type="bodyBold" style={{ color: theme.background }}>
          {t((s) => s.deel.whatsapp)}
        </ThemedText>
      </AnimatedPressable>

      <AnimatedPressable
        haptisch={false}
        onPress={() => void voerUit(() => deelAlsLink(deelTitel, bericht))}
        accessibilityRole="button"
        accessibilityLabel={t((s) => s.deel.alsLink)}
        style={[styles.knop, styles.knopStil, { borderColor: accent }]}>
        <Ionicons name="link-outline" size={18} color={accent} />
        <ThemedText type="bodyBold" style={{ color: accent }}>
          {t((s) => s.deel.alsLink)}
        </ThemedText>
      </AnimatedPressable>

      <AnimatedPressable
        haptisch={false}
        onPress={() =>
          void voerUit(async () => ((await kopieer(bericht)) ? 'gekopieerd' : 'niet-mogelijk'))
        }
        accessibilityRole="button"
        accessibilityLabel={t((s) => s.deel.kopieerTekst)}
        style={[styles.knop, styles.knopStil, { borderColor: theme.inactive }]}>
        <Ionicons name="copy-outline" size={18} color={theme.textSecondary} />
        <ThemedText type="bodyBold" themeColor="textSecondary">
          {t((s) => s.deel.kopieerTekst)}
        </ThemedText>
      </AnimatedPressable>

      {melding !== null && (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
          {melding}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  houder: {
    width: '100%',
    gap: Spacing.two,
  },
  knop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  knopStil: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  gecentreerd: {
    textAlign: 'center',
  },
});
