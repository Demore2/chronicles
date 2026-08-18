import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * De drie tellers op Profiel: hoofdstukken af, personages vrijgespeeld, verhalen voltooid.
 *
 * **Elke teller komt uit de store die hem echt bijhoudt.** "Hoofdstukken af" telde ooit
 * `voortgangStore.bekekenIds` — dat zijn *geopende verhalen*, en de teller stond daardoor op 2
 * terwijl er 8 hoofdstukken af waren (LAUNCH-PLAN.md B6). `telVoltooideHoofdstukken` is de enige
 * juiste bron; laat hem staan.
 */
export function ProfileStats() {
  const { t } = useVertaling();

  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  const completedStories = useVoortgangStore((state) => state.completedStories);

  const hoofdstukkenAf = useMemo(
    () => telVoltooideHoofdstukken(hoofdstukVoortgang),
    [hoofdstukVoortgang],
  );

  return (
    <View style={styles.rij}>
      <Stat waarde={hoofdstukkenAf} label={t((s) => s.profiel.chaptersRead)(hoofdstukkenAf)} />
      <Stat
        waarde={unlockedCharacters.length}
        label={t((s) => s.profiel.charactersUnlocked)(unlockedCharacters.length)}
      />
      <Stat
        waarde={completedStories.size}
        label={t((s) => s.profiel.storiesCompleted)(completedStories.size)}
      />
    </View>
  );
}

function Stat({ waarde, label }: { waarde: number; label: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="display" style={{ color: theme.accent }}>
        {waarde}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  rij: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  kaart: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.card,
  },
  label: {
    textAlign: 'center',
  },
});
