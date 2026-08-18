import { StyleSheet, View } from 'react-native';

import { CharacterGrid } from '@/components/character-grid';
import { SectieKop } from '@/components/sectie-kop';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { verhalen } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';

/**
 * De personagecollectie op Profiel: kop met teller, daaronder het raster.
 *
 * Het raster zelf (`CharacterGrid`) bleef zoals het was — dit component pakt het alleen in met de
 * sectiekop en de "x van 19"-teller, zodat Profiel zelf niet meer over stores hoeft te weten.
 * Het totaal is `verhalen.length` en geen los getal: elk verhaal levert precies één personage op,
 * dus een nieuw verhaal verhoogt de noemer vanzelf.
 */
export function ProfileCardCollection() {
  const theme = useTheme();
  const { t } = useVertaling();
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);

  const totaal = verhalen.length;
  const ontgrendeld = unlockedCharacters.length;

  return (
    <View style={styles.sectie}>
      <SectieKop titel={t((s) => s.profiel.characterCollection)} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.teller}>
        {t((s) => s.profiel.unlockedCounter)(ontgrendeld, totaal)}
      </ThemedText>
      <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
        <CharacterGrid unlockedCharacters={unlockedCharacters} totalCharacters={totaal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectie: {
    gap: Spacing.two,
  },
  teller: {
    paddingHorizontal: Spacing.four,
  },
  kaart: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
});
