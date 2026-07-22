import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ThemedText } from '@/components/themed-text';
import type { Blok } from '@/constants/types';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function BlokWeergave({
  blok,
  tijdperkKleur,
  gekozenAntwoord,
  onBeantwoord,
}: {
  blok: Blok;
  tijdperkKleur: string;
  gekozenAntwoord?: boolean;
  onBeantwoord: (antwoord: boolean) => void;
}) {
  const theme = useTheme();
  const { t, v } = useVertaling();

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

  const beantwoord = gekozenAntwoord !== undefined;
  const correct = beantwoord && gekozenAntwoord === blok.antwoord;

  return (
    <View style={[styles.quizBlok, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.quizVraagRij}>
        <Ionicons name="help-circle-outline" size={20} color={theme.accent} />
        <ThemedText type="smallBold" style={styles.quizVraag}>
          {v(blok.vraag)}
        </ThemedText>
      </View>
      {!beantwoord ? (
        <View style={styles.quizKnoppen}>
          <Pressable
            onPress={() => onBeantwoord(true)}
            style={[styles.quizKnop, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">{t((s) => s.verhaal.waar)}</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => onBeantwoord(false)}
            style={[styles.quizKnop, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">{t((s) => s.verhaal.nietWaar)}</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.quizUitleg}>
          <ThemedText type="smallBold" themeColor={correct ? 'accent' : 'text'}>
            {correct ? t((s) => s.verhaal.goedGeraden) : t((s) => s.verhaal.tochNietHelemaal)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {v(blok.uitleg)}
          </ThemedText>
        </View>
      )}
    </View>
  );
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
  quizBlok: {
    borderRadius: Radii.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  quizVraagRij: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  quizVraag: {
    flex: 1,
  },
  quizKnoppen: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quizKnop: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
  quizUitleg: {
    gap: Spacing.one,
  },
});
