import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { staggerVertraging } from '@/constants/motion';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useStreak } from '@/hooks/use-streak';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * De vier tellers bovenaan Voortgang: streak, hoofdstukken, verhalen, personages.
 *
 * **Elke teller komt uit de store die hem echt bijhoudt** — zelfde regel als in
 * `profile-stats.tsx`, en om dezelfde reden. "Hoofdstukken af" is `telVoltooideHoofdstukken`,
 * niet `voortgangStore.bekekenIds.size`: dat laatste telt *geopende verhalen*, wat de teller op 2
 * liet staan terwijl er 8 hoofdstukken af waren (LAUNCH-PLAN.md B6). En de streak komt via
 * `useStreak()` en niet via `state.streakDagen`, want de opgeslagen waarde weet niet dat er
 * sindsdien dagen voorbij zijn.
 *
 * De vier accentkleuren staan in `theme.ts` (`statStreak` en zijn drie broertjes) en niet hier.
 * Een hardgecodeerde hex in een component heeft geen donkere tegenhanger, en dan is een gekleurde
 * kaart in donkere modus een lichtvlek in een warm bruin scherm.
 */
export function ProgressStatsHeader() {
  const theme = useTheme();
  const { t } = useVertaling();

  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const completedStories = useVoortgangStore((state) => state.completedStories);
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  const streak = useStreak();

  const hoofdstukkenAf = useMemo(
    () => telVoltooideHoofdstukken(hoofdstukVoortgang),
    [hoofdstukVoortgang]
  );

  const kaarten: StatKaart[] = [
    {
      sleutel: 'streak',
      // Een gedoofde vlam bij nul, net als op de streakkaart die hier eerder stond: nul is een
      // uitnodiging, geen prestatie.
      icoon: streak > 0 ? 'flame' : 'flame-outline',
      kleur: streak > 0 ? theme.statStreak : theme.inactive,
      waarde: streak,
      naam: t((s) => s.voortgang.statStreak),
      eenheid: t((s) => s.voortgang.statStreakEenheid)(streak),
    },
    {
      sleutel: 'hoofdstukken',
      icoon: 'book-outline',
      kleur: theme.statHoofdstuk,
      waarde: hoofdstukkenAf,
      naam: t((s) => s.voortgang.statHoofdstukken),
      eenheid: t((s) => s.voortgang.statHoofdstukkenEenheid),
    },
    {
      sleutel: 'verhalen',
      icoon: 'bookmarks-outline',
      kleur: theme.statVerhaal,
      waarde: completedStories.size,
      naam: t((s) => s.voortgang.statVerhalen),
      eenheid: t((s) => s.voortgang.statVerhalenEenheid),
    },
    {
      sleutel: 'personages',
      icoon: 'people-outline',
      kleur: theme.statPersonage,
      waarde: unlockedCharacters.length,
      naam: t((s) => s.voortgang.statPersonages),
      eenheid: t((s) => s.voortgang.statPersonagesEenheid),
    },
  ];

  return (
    <View style={styles.raster}>
      {kaarten.map((kaart, index) => (
        <Animated.View
          key={kaart.sleutel}
          entering={FadeInDown.delay(staggerVertraging(index))}
          style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}
          accessibilityRole="text"
          accessibilityLabel={`${kaart.waarde} ${kaart.naam} ${kaart.eenheid}`}>
          <View style={[styles.icoon, { backgroundColor: withAlpha(kaart.kleur, 0.16) }]}>
            <Ionicons name={kaart.icoon} size={22} color={kaart.kleur} />
          </View>
          <ThemedText type="display" style={{ color: kaart.kleur }}>
            {kaart.waarde}
          </ThemedText>
          <View style={styles.labels}>
            <ThemedText type="smallBold">{kaart.naam}</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {kaart.eenheid}
            </ThemedText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

type StatKaart = {
  sleutel: string;
  icoon: IoniconNaam;
  kleur: string;
  waarde: number;
  naam: string;
  eenheid: string;
};

const styles = StyleSheet.create({
  raster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  kaart: {
    // Twee op een rij, met één tussenruimte van `Spacing.two` erbij gerekend. Een vaste breedte
    // in plaats van `flex: 1`, anders legt `flexWrap` alle vier op één rij.
    width: '48.7%',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.card,
  },
  icoon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    alignItems: 'center',
  },
});
