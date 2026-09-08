import { Ionicons } from '@expo/vector-icons';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';

/**
 * De bouwstenen van het instellingenscherm: een sectie met een kop, en de regels erin.
 *
 * Bewust een gewone `Pressable` en geen `AnimatedPressable`: die veert in en tikt haptisch, en
 * dat is bedoeld voor een aanraking die iets oplevert (een hoofdstuk, een personage). Zeventien
 * instellingsregels die allemaal terugduwen is precies de ruis waar CLAUDE.md voor waarschuwt.
 */
export function SettingsSectie({
  titel,
  children,
  voet,
}: {
  titel: string;
  children: ReactNode;
  /** Kleine toelichting onder de kaart, voor uitleg die bij de sectie hoort en niet bij één regel. */
  voet?: string;
}) {
  const theme = useTheme();
  // `toArray` gooit `null`/`false` uit de lijst, zodat een voorwaardelijk verborgen regel geen
  // scheidingslijn achterlaat die nergens tussen staat.
  const regels = Children.toArray(children);

  return (
    <View style={styles.sectie}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.sectieTitel}>
        {titel.toUpperCase()}
      </ThemedText>
      <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
        {regels.map((regel, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={[styles.scheiding, { backgroundColor: theme.background }]} />}
            {regel}
          </Fragment>
        ))}
      </View>
      {voet ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.sectieVoet}>
          {voet}
        </ThemedText>
      ) : null}
    </View>
  );
}

export type SettingsItemProps = {
  icoon: IoniconNaam;
  label: string;
  /** Rechts uitgelijnde waarde, bijvoorbeeld het e-mailadres of "Free". */
  waarde?: string;
  /** Ontbreekt `onPress`, dan is de regel informatie en geen knop — dus ook geen chevron. */
  onPress?: () => void;
  /** Rood icoon en label. Voor uitloggen en accountverwijdering. */
  isGevaar?: boolean;
  /** Klein label achter de tekst, gebruikt voor "Soon" bij wat nog niet bestaat. */
  badge?: string;
  /** Vervangt de chevron, bijvoorbeeld door een `Switch`. */
  rechts?: ReactNode;
  /** Extra regel onder het label, voor uitleg die niet in het label past. */
  uitleg?: string;
};

export function SettingsItem({
  icoon,
  label,
  waarde,
  onPress,
  isGevaar = false,
  badge,
  rechts,
  uitleg,
}: SettingsItemProps) {
  const theme = useTheme();
  const kleur = isGevaar ? theme.gevaar : theme.accent;

  const inhoud = (
    <>
      <Ionicons name={icoon} size={20} color={kleur} style={styles.icoon} />
      <View style={styles.tekst}>
        <ThemedText type="body" style={isGevaar ? { color: theme.gevaar } : undefined}>
          {label}
        </ThemedText>
        {uitleg ? (
          <ThemedText type="small" themeColor="textSecondary">
            {uitleg}
          </ThemedText>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="caption" themeColor="textSecondary">
            {badge}
          </ThemedText>
        </View>
      ) : null}
      {waarde ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.waarde}>
          {waarde}
        </ThemedText>
      ) : null}
      {rechts ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.inactive} /> : null)}
    </>
  );

  if (!onPress) {
    return <View style={styles.regel}>{inhoud}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.regel, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {inhoud}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectie: {
    gap: Spacing.two,
  },
  sectieTitel: {
    paddingHorizontal: Spacing.four,
    letterSpacing: 0.8,
  },
  sectieVoet: {
    paddingHorizontal: Spacing.four,
    // Lopende tekst, geen label: dus zonder de letterspacing van de sectiekop.
    letterSpacing: 0,
  },
  kaart: {
    marginHorizontal: Spacing.four,
    borderRadius: Radii.card,
    // Nodig zodat de druk-achtergrond van de eerste en laatste regel de ronde hoek volgt.
    overflow: 'hidden',
  },
  scheiding: {
    height: StyleSheet.hairlineWidth,
    // Begint na het icoon, zodat de lijn de tekstkolom volgt in plaats van de kaart te doorsnijden.
    marginLeft: Spacing.three + 20 + Spacing.three,
  },
  regel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 52,
  },
  icoon: {
    width: 20,
    textAlign: 'center',
  },
  tekst: {
    flex: 1,
    gap: Spacing.half,
  },
  waarde: {
    // Mag krimpen als het label lang is, maar niet tot niets: een half e-mailadres zegt meer
    // dan een afgekapt label.
    flexShrink: 1,
    // 62% en niet 50%: het langste dat hier staat is het supportadres, en op een smal toestel
    // kapte dat halverwege af tot iets dat op een tikfout leek. De labels ernaast zijn kort
    // ("Contact support", "Your plan"), dus die houden met `flex: 1` ruim genoeg over.
    maxWidth: '62%',
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.small,
  },
});
