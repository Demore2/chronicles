import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import type { Verhaal } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/** Vaste kaartbreedte, ook nodig door `HorizontaleRij` om één kaart per pijlklik te stappen. */
export const CHARACTER_CARD_BREEDTE = 232;
const PORTRET_HOOGTE = 200;

type CharacterCardProps = {
  verhaal: Verhaal;
  isUnlocked: boolean;
  /** Alleen aangeroepen als de kaart ontgrendeld is; een vergrendelde kaart is volledig inert. */
  onPress?: () => void;
};

/**
 * Eén personage in de collectie op Profiel — portret, naam, ondertitel, tijdperk en teaser.
 *
 * **Een vergrendelde kaart verklapt niets.** Naam, portret en teaser zijn precies de beloning voor
 * het uitlezen van een verhaal, dus die staan er pas ná het ontgrendelen. Wat wél zichtbaar is, is
 * het tijdperk en de tijdperkkleur: genoeg om te zien dát er nog iemand te vinden is in de Oudheid,
 * te weinig om te weten wie. De portretkleur van het verhaal (`portretKleur`) vult het lege vlak,
 * zodat een vergrendelde rij niet als grijze blokken leest.
 *
 * De gegevens komen uit het `Verhaal` zelf — elk verhaal levert precies één personage op. Er is dus
 * bewust geen aparte personage-datastructuur naast de content: die zou meteen kunnen gaan afwijken.
 */
export function CharacterCard({ verhaal, isUnlocked, onPress }: CharacterCardProps) {
  const theme = useTheme();
  const { t, v } = useVertaling();

  const tijdperk = getTijdperk(verhaal.tijdperkId);
  const tijdperkKleur = tijdperk?.kleur ?? theme.accent;

  return (
    <AnimatedPressable
      // `disabled` in plaats van een `if` in de handler: zo geeft een vergrendelde kaart ook geen
      // veerbeweging of haptische tik terug — zelfde afspraak als in `character-grid.tsx`.
      disabled={!isUnlocked || !onPress}
      onPress={onPress}
      accessibilityRole={isUnlocked && onPress ? 'button' : 'image'}
      accessibilityLabel={
        isUnlocked ? verhaal.personage.naam : t((s) => s.profiel.characterCollection)
      }
      style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.portretVak, { backgroundColor: verhaal.portretKleur }]}>
        {isUnlocked && verhaal.afbeelding ? (
          <Image
            source={verhaal.afbeelding}
            style={styles.portret}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.silhouet}>
            <Ionicons
              name={isUnlocked ? 'person' : 'lock-closed'}
              size={40}
              color={withAlpha('#FFFFFF', 0.85)}
            />
          </View>
        )}

        {/* Tijdperkstrook onderaan het portret: dezelfde kleur die het tijdperk overal in de app
            heeft, zodat de kaart zonder tekst al te plaatsen is. */}
        <View style={[styles.tijdperkBalk, { backgroundColor: withAlpha(tijdperkKleur, 0.92) }]}>
          <ThemedText type="caption" style={styles.tijdperkTekst} numberOfLines={1}>
            {tijdperk ? v(tijdperk.titel) : verhaal.periodeLabel}
          </ThemedText>
        </View>

        {!isUnlocked && (
          <View style={[styles.slotBadge, { backgroundColor: withAlpha(theme.background, 0.92) }]}>
            <Ionicons name="lock-closed" size={12} color={theme.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.inhoud}>
        {isUnlocked ? (
          <>
            <ThemedText type="subtitle" numberOfLines={1}>
              {verhaal.personage.naam}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {v(verhaal.ondertitel)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
              {v(verhaal.teaser)}
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="subtitle" themeColor="textSecondary" numberOfLines={1}>
              {t((s) => s.profiel.personageVergrendeld)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
              {t((s) => s.profiel.personageVergrendeldUitleg)}
            </ThemedText>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  kaart: {
    width: CHARACTER_CARD_BREEDTE,
    borderRadius: Radii.card,
    // Nodig zodat het portret en de tijdperkbalk de ronde bovenhoeken volgen.
    overflow: 'hidden',
  },
  portretVak: {
    height: PORTRET_HOOGTE,
    justifyContent: 'flex-end',
  },
  portret: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  silhouet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tijdperkBalk: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  tijdperkTekst: {
    // Vaste lichte tekst: de balk is altijd een verzadigde tijdperkkleur, in beide thema's.
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  slotBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radii.small,
  },
  inhoud: {
    gap: Spacing.half,
    padding: Spacing.three,
    // Vaste hoogte, zodat kaarten in de rij niet om en om springen op de lengte van een teaser.
    minHeight: 108,
  },
});
