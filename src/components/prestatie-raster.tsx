import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  behaaldePrestaties,
  PRESTATIES,
  type PrestatieItem,
  type PrestatieStand,
} from '@/constants/prestaties';
import { Radii, Spacing } from '@/constants/theme';
import { useStreak } from '@/hooks/use-streak';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * De mijlpalen op Profiel: veertien tegels, behaald of nog niet.
 *
 * **ORPHANED — niets rendert dit meer.** De mijlpalen staan sinds deze fase alleen nog op
 * Voortgang, in `achievements-grid.tsx`. Twee rasters van dezelfde veertien badges was er één te
 * veel: ze rekenden hun stand ook nog eens verschillend uit (dit raster leest de ontgrendelingen,
 * dat raster leidt ze af uit de vier tellers en loopt daardoor niet achter op een verse
 * ontgrendeling), dus een verschil tussen de twee schermen zag eruit als een bug in de app in
 * plaats van als twee bronnen. Het bestand blijft staan omdat verwijderen in dit project
 * geblokkeerd is (zie CLAUDE.md, "File deletion"); wire het niet terug aan zonder eerst deze
 * reden te weerleggen.
 *
 * **Een vergrendelde tegel verklapt zijn naam wél**, anders dan een vergrendelde `CharacterCard`.
 * Daar is de naam de beloning voor het uitlezen; hier is hij het doel waar je naartoe werkt, en
 * een raster met veertien vraagtekens vertelt je niet waar je aan begint.
 *
 * De volgorde is die van `PRESTATIES` — contentvolgorde, niet behaald-eerst. Zelfde afweging als
 * bij de personagerij: een raster dat zichzelf herschikt laat je je eigen voortgang steeds opnieuw
 * zoeken.
 */
export function PrestatieRaster() {
  const { t } = useVertaling();
  const theme = useTheme();

  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const completedStories = useVoortgangStore((state) => state.completedStories);
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  // Via de hook en niet via `state.streakDagen`: die weet niet dat er sindsdien dagen voorbij zijn.
  const streak = useStreak();

  const stand: PrestatieStand = useMemo(
    () => ({
      hoofdstukken: telVoltooideHoofdstukken(hoofdstukVoortgang),
      verhalen: completedStories.size,
      personages: unlockedCharacters.length,
      streak,
    }),
    [hoofdstukVoortgang, completedStories, unlockedCharacters, streak]
  );

  const behaaldeIds = useMemo(
    () => new Set(behaaldePrestaties(stand).map((prestatie) => prestatie.id)),
    [stand]
  );

  return (
    <View style={styles.blok}>
      <View style={styles.kop}>
        <ThemedText type="subtitle">{t((s) => s.prestatie.sectie)}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {t((s) => s.prestatie.telling)(behaaldeIds.size, PRESTATIES.length)}
        </ThemedText>
      </View>

      {behaaldeIds.size === 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {t((s) => s.prestatie.leeg)}
        </ThemedText>
      ) : null}

      <View style={styles.raster}>
        {PRESTATIES.map((prestatie) => (
          <PrestatieTegel
            key={prestatie.id}
            prestatie={prestatie}
            behaald={behaaldeIds.has(prestatie.id)}
          />
        ))}
      </View>
    </View>
  );
}

function PrestatieTegel({ prestatie, behaald }: { prestatie: PrestatieItem; behaald: boolean }) {
  const theme = useTheme();
  const { t } = useVertaling();

  const naam = t((s) => s.prestatie.namen)[prestatie.id];
  const uitleg = t((s) => s.prestatie.uitleg)[prestatie.categorie](prestatie.drempel);

  return (
    <View
      style={[
        styles.tegel,
        {
          backgroundColor: theme.backgroundElement,
          // Alleen een behaalde tegel krijgt de accentrand. Vergrendeld blijft vlak: het verschil
          // moet van een afstand te zien zijn, zonder de tekst te lezen.
          borderColor: behaald ? theme.accent : 'transparent',
          opacity: behaald ? 1 : 0.55,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${naam}. ${behaald ? uitleg : t((s) => s.prestatie.nogNiet)}`}>
      <Ionicons
        name={prestatie.icoon}
        size={22}
        color={behaald ? theme.accent : theme.inactive}
      />
      <ThemedText type="small" numberOfLines={2} style={styles.naam}>
        {naam}
      </ThemedText>
      <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
        {behaald ? uitleg : t((s) => s.prestatie.nogNiet)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  blok: {
    gap: Spacing.three,
    // Zelfde marge als `profile-stats` en `profile-character-collection`: de ScrollView op Profiel
    // heeft er zelf geen, elk blok zet hem.
    paddingHorizontal: Spacing.four,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  raster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tegel: {
    // Drie op een rij, met twee tussenruimtes van `Spacing.two` erbij gerekend.
    width: '31.8%',
    minHeight: 104,
    padding: Spacing.two,
    borderRadius: Radii.small,
    borderWidth: 1,
    gap: Spacing.one,
  },
  naam: {
    fontWeight: '700',
  },
});
