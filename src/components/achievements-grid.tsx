import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import {
  behaaldePrestaties,
  MAXIMALE_PUNTEN,
  PRESTATIES,
  puntenVoor,
  type PrestatieCategorie,
  type PrestatieItem,
  type PrestatieStand,
} from '@/constants/prestaties';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useStreak } from '@/hooks/use-streak';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAchievementStore } from '@/store/achievement-store';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { usePrestatieStore } from '@/store/prestatie-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * De mijlpalen als badgeraster onderaan Voortgang: veertien tegels, vier op een rij.
 *
 * **Dit is geen tweede mijlpalenlijst.** De veertien komen uit `constants/prestaties.ts`, dezelfde
 * bron die `use-prestaties.ts` gebruikt om een melding te sturen en die `PrestatieRaster` op
 * Profiel toont. Een eigen lijstje badges hier zou betekenen dat je een melding krijgt voor een
 * mijlpaal die op dit scherm niet bestaat, of andersom.
 *
 * **Een vergrendelde tegel verklapt zijn naam wél**, anders dan een vergrendelde `CharacterCard`:
 * daar is de naam de beloning voor het uitlezen, hier is hij het doel waar je naartoe werkt.
 * Vergrendeld mét voortgang krijgt er een `3/7`-pil bij — dat is het verschil tussen "nog niet"
 * en "bijna".
 *
 * Aantikken opent `AchievementUnlockModal`: de uitleg, wanneer je hem verdiende, wat hij opleverde
 * en de knop om hem te delen. Hier stond een `meld()`, en die kon niet blijven — een
 * systeemvenster heeft geen plaats voor een deelknop. Het venster zelf hangt in de root layout;
 * deze tegel zet alleen `prestatie-store.detailId`.
 *
 * De puntenteller naast de kop is de tweede lezing van hetzelfde raster: "9 van de 14" telt
 * badges, punten wegen ze. Een streak van honderd dagen hoort zwaarder te tellen dan je eerste
 * hoofdstuk, en dat is aan veertien even grote tegels niet te zien.
 */
export function AchievementsGrid() {
  const { t } = useVertaling();

  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const completedStories = useVoortgangStore((state) => state.completedStories);
  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  // Via de hook: `state.streakDagen` weet niet dat er sindsdien dagen voorbij zijn.
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

  // De punten komen uit de afgeleide stand en niet uit `achievement-store`: die loopt achter
  // zolang een verse ontgrendeling nog niet gesynchroniseerd is, en een teller die na het
  // afvinken van een hoofdstuk twee seconden blijft hangen leest als een fout.
  const punten = useMemo(() => puntenVoor(behaaldeIds), [behaaldeIds]);

  return (
    <View style={styles.blok}>
      <View style={styles.kop}>
        <ThemedText type="title">{t((s) => s.prestatie.sectie)}</ThemedText>
        <View style={styles.kopTellers}>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.prestatie.telling)(behaaldeIds.size, PRESTATIES.length)}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {t((s) => s.prestatie.puntenTotaal)(punten, MAXIMALE_PUNTEN)}
          </ThemedText>
        </View>
      </View>

      {behaaldeIds.size === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {t((s) => s.prestatie.leeg)}
        </ThemedText>
      )}

      <View style={styles.raster}>
        {PRESTATIES.map((prestatie) => (
          <PrestatieBadge
            key={prestatie.id}
            prestatie={prestatie}
            behaald={behaaldeIds.has(prestatie.id)}
            huidig={stand[prestatie.categorie]}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Welke van de vier accentkleuren een mijlpaal krijgt. Aan de categorie gekoppeld en niet per
 * mijlpaal: zo hebben de vijf hoofdstukmijlpalen dezelfde kleur als de hoofdstukteller bovenaan
 * het scherm, en leest het raster als vier soorten voortgang in plaats van veertien losse tegels.
 */
function categorieKleur(
  categorie: PrestatieCategorie,
  theme: ReturnType<typeof useTheme>
): string {
  switch (categorie) {
    case 'hoofdstukken':
      return theme.statHoofdstuk;
    case 'verhalen':
      return theme.statVerhaal;
    case 'personages':
      return theme.statPersonage;
    case 'streak':
      return theme.statStreak;
  }
}

function PrestatieBadge({
  prestatie,
  behaald,
  huidig,
}: {
  prestatie: PrestatieItem;
  behaald: boolean;
  huidig: number;
}) {
  const theme = useTheme();
  const { t, taal } = useVertaling();
  const toonDetail = usePrestatieStore((state) => state.toonDetail);
  const ontgrendeling = useAchievementStore((state) =>
    state.ontgrendeld.find((rij) => rij.prestatieId === prestatie.id)
  );

  const naam = t((s) => s.prestatie.namen)[prestatie.id];
  const uitleg = t((s) => s.prestatie.uitleg)[prestatie.categorie](prestatie.drempel);
  const kleur = categorieKleur(prestatie.categorie, theme);

  // Alleen tonen als er iets te tonen is: een `0/7` onder elke nog niet begonnen mijlpaal maakt
  // het raster druk zonder iets te zeggen.
  const toontVoortgang = !behaald && huidig > 0;

  /**
   * De datum staat niet op de tegel maar wél in het label.
   *
   * Vier tegels op een rij hebben geen plaats voor "17 augustus 2026" zonder dat de namen — bij
   * een mijlpaal juist het doel — in de verdrukking komen. Voor wie het scherm laat voorlezen
   * kost hij niets, en zichtbaar staat hij in het venster achter de tik.
   *
   * Hij kan ontbreken terwijl de badge er wél staat: behaald-ja/nee is afgeleid en dus meteen
   * bekend, de datum komt uit `achievement-store` en dus pas na de sync. Dat is de goede kant om
   * fout te gaan.
   */
  const datumLabel =
    ontgrendeling === undefined
      ? null
      : t((s) => s.prestatie.ontgrendeldOp)(
          new Date(ontgrendeling.unlockedAt).toLocaleDateString(taal, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        );

  return (
    <AnimatedPressable
      onPress={() => toonDetail(prestatie.id)}
      style={styles.badgeKolom}
      accessibilityRole="button"
      accessibilityLabel={[
        naam,
        behaald ? uitleg : t((s) => s.prestatie.voortgangRegel)(huidig, prestatie.drempel),
        datumLabel,
      ]
        .filter((regel) => regel !== null)
        .join('. ')}>
      <View
        style={[
          styles.badge,
          {
            // Behaald is vol gekleurd, vergrendeld is vlak met een dunne rand: het verschil moet
            // van een afstand te zien zijn, zonder de namen te lezen.
            backgroundColor: behaald ? kleur : theme.backgroundElement,
            borderColor: behaald ? kleur : withAlpha(theme.inactive, 0.5),
          },
        ]}>
        <Ionicons
          name={prestatie.icoon}
          size={26}
          color={behaald ? theme.background : theme.inactive}
        />

        {toontVoortgang && (
          <View
            style={[styles.voortgangPil, { backgroundColor: theme.background, borderColor: kleur }]}>
            <ThemedText type="caption" style={[styles.voortgangTekst, { color: kleur }]}>
              {t((s) => s.prestatie.voortgangKort)(huidig, prestatie.drempel)}
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText
        type="caption"
        // Drie regels, niet twee: "Tien hoofdstukken ver" liep op een tegel van een kwart scherm
        // af met een beletselteken, en juist de naam is bij een mijlpaal het doel dat je leest.
        // Alleen de rij met zo'n lange naam wordt hoger — `flexWrap` maakt elke rij zo hoog als
        // zijn hoogste tegel, dus de rest van het raster schuift niet mee.
        numberOfLines={3}
        themeColor={behaald ? 'text' : 'textSecondary'}
        style={styles.badgeNaam}>
        {naam}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  blok: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  kopTellers: {
    alignItems: 'flex-end',
  },
  raster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badgeKolom: {
    // Vier op een rij, met drie tussenruimtes van `Spacing.two` erbij gerekend.
    width: '23%',
    alignItems: 'center',
  },
  badge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voortgangPil: {
    position: 'absolute',
    bottom: -Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
    borderRadius: Radii.small,
    borderWidth: 1,
  },
  voortgangTekst: {
    fontSize: 10,
    lineHeight: 14,
  },
  badgeNaam: {
    textAlign: 'center',
    // Twee regels ruimte, zodat een naam van één regel de tegels eronder niet omhoogtrekt en het
    // raster scheef komt te staan. Plus de ruimte die de voortgangspil buiten de tegel inneemt.
    minHeight: 32,
    marginTop: Spacing.three,
  },
});
