import { StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ThemedText } from '@/components/themed-text';
import type { Blok } from '@/constants/types';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function BlokWeergave({
  blok,
  tijdperkKleur,
}: {
  blok: Blok;
  tijdperkKleur: string;
}) {
  const theme = useTheme();
  const { v } = useVertaling();

  if (blok.type === 'tekst') {
    return <ThemedText style={styles.tekst}>{v(blok.inhoud)}</ThemedText>;
  }

  if (blok.type === 'afbeelding') {
    return (
      <View style={styles.afbeeldingBlok}>
        <Illustratie kleur={tijdperkKleur} icoonNaam="image-outline" style={styles.afbeelding} />
        {blok.bijschrift && (
          <ThemedText type="caption" themeColor="textSecondary" style={styles.bijschrift}>
            {v(blok.bijschrift)}
          </ThemedText>
        )}
      </View>
    );
  }

  if (blok.type === 'citaat') {
    return (
      <View style={[styles.citaatBlok, { borderLeftColor: theme.accent }]}>
        <ThemedText type="subtitle" style={styles.citaatTekst}>
          {'"'}{v(blok.tekst)}{'"'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          — {v(blok.bron)}
        </ThemedText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  tekst: {
    lineHeight: 26,
  },
  afbeeldingBlok: {
    gap: Spacing.one,
  },
  afbeelding: {
    height: 180,
    borderRadius: Radii.card,
  },
  bijschrift: {
    textAlign: 'center',
  },
  citaatBlok: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.three,
    gap: Spacing.one,
  },
  citaatTekst: {
    fontStyle: 'italic',
  },
});
