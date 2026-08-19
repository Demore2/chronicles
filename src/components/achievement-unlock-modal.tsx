import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { deel } from '@/constants/deel';
import { haptics } from '@/constants/haptics';
import {
  prestatieMet,
  type PrestatieCategorie,
  type PrestatieItem,
} from '@/constants/prestaties';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAchievementStore } from '@/store/achievement-store';
import { usePrestatieStore } from '@/store/prestatie-store';

/**
 * Het venster achter een mijlpaal: wat hij is, wanneer je hem verdiende, wat hij opleverde, en de
 * knop om hem te delen.
 *
 * ## Waarom dit venster niet vanzelf over het scherm valt
 *
 * Een mijlpaal wordt bijna altijd bereikt op het moment dat je een hoofdstuk afvinkt — precies
 * waar de reader zijn "Unlock &lt;naam&gt;"-knop toont en er even later een `CharacterUnlockModal`
 * overheen komt. Twee vensters die om dezelfde tik vragen is er één te veel, en de zwaarste
 * onderbreking is in dit project gereserveerd voor het ontgrendelde personage.
 *
 * De aankondiging blijft dus de strook (`prestatie-melding.tsx`): die blokkeert niets en ruimt
 * zichzelf op. **Nieuw is dat de strook een ingang is geworden** — hem aantikken opent dit
 * venster in plaats van hem alleen weg te halen. Zo is de viering één tik na de ontgrendeling
 * bereikbaar zonder dat er ooit een venster óver de personageviering valt. De tweede ingang is
 * een tegel in het raster op Voortgang.
 *
 * Beide ingangen zetten `prestatie-store.detailId`; dit venster hangt één keer in de root layout.
 */
export function AchievementUnlockModal() {
  const detailId = usePrestatieStore((state) => state.detailId);
  const wisDetail = usePrestatieStore((state) => state.wisDetail);

  const prestatie = detailId === null ? undefined : prestatieMet(detailId);

  // Niets aangetikt, of een id dat niet meer bestaat (mijlpaal hernoemd of weggehaald): dan valt
  // er niets te tonen. Een leeg venster is erger dan geen venster.
  if (!prestatie) return null;

  // De `key` laat React het venster per mijlpaal opnieuw opbouwen. Daarmee verdwijnt de
  // terugkoppeling onder de deelknop vanzelf bij de volgende mijlpaal — dat stond hier eerst als
  // een `useEffect` die state zette, wat precies het soort cascade is waar `set-state-in-effect`
  // voor waarschuwt.
  return <Venster key={prestatie.id} prestatie={prestatie} onClose={wisDetail} />;
}

/** Welke van de vier accentkleuren bij een categorie hoort. Gelijk aan `achievements-grid.tsx`. */
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

function Venster({ prestatie, onClose }: { prestatie: PrestatieItem; onClose: () => void }) {
  const theme = useTheme();
  const { t, taal } = useVertaling();

  const ontgrendeling = useAchievementStore((state) =>
    state.ontgrendeld.find((rij) => rij.prestatieId === prestatie.id)
  );
  const markeerGedeeld = useAchievementStore((state) => state.markeerGedeeld);
  const stand = useAchievementStore((state) => state.stand);

  /** Wat er onder de knoppen staat nadat er gedeeld is. `null` = nog niets gedaan. */
  const [deelMelding, setDeelMelding] = useState<string | null>(null);

  const naam = t((s) => s.prestatie.namen)[prestatie.id];
  const uitleg = t((s) => s.prestatie.uitleg)[prestatie.categorie](prestatie.drempel);
  const kleur = categorieKleur(prestatie.categorie, theme);

  const behaald = ontgrendeling !== undefined;
  const huidig = stand ? stand[prestatie.categorie] : 0;

  const datumRegel =
    ontgrendeling === undefined
      ? null
      : t((s) => s.prestatie.ontgrendeldOp)(
          new Date(ontgrendeling.unlockedAt).toLocaleDateString(taal, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        );

  async function deelNu() {
    haptics.tik();

    const resultaat = await deel(
      t((s) => s.prestatie.deelTitel),
      t((s) => s.prestatie.deelBericht)(naam, uitleg)
    );

    if (resultaat === 'gedeeld' || resultaat === 'gekopieerd') {
      // Alleen markeren als er echt iets is vertrokken. Wegklikken is geen delen.
      markeerGedeeld(prestatie.id);
      haptics.succes();
    }

    // Weggeklikt is geen uitkomst om over te berichten: de lezer wéét dat hij dat net deed.
    if (resultaat === 'afgebroken') return;

    setDeelMelding(
      resultaat === 'gedeeld'
        ? t((s) => s.prestatie.deelGelukt)
        : resultaat === 'gekopieerd'
          ? t((s) => s.prestatie.deelGekopieerd)
          : t((s) => s.prestatie.deelNietMogelijk)
    );
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // Android's terugknop moet dit venster kunnen sluiten; zonder dit zit de lezer vast.
      onRequestClose={onClose}>
      {/* De achtergrond sluit ook. Anders dan bij `story-limit-modal` mag dat hier: er valt niets
          te beslissen, dit venster vertelt alleen iets. */}
      <Pressable
        style={[styles.laag, { backgroundColor: withAlpha('#000000', 0.6) }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t((s) => s.prestatie.sluiten)}>
        {/* Een tik op de kaart zelf mag niet doorlekken naar de sluitlaag eronder. */}
        <Pressable onPress={() => undefined} style={styles.kaartHouder}>
          <Animated.View
            entering={FadeIn.duration(160)}
            style={[styles.kaart, { backgroundColor: theme.background, borderColor: kleur }]}>
            <Animated.View
              entering={ZoomIn.springify().damping(14)}
              style={[
                styles.icoonRing,
                {
                  backgroundColor: behaald ? kleur : theme.backgroundElement,
                  borderColor: behaald ? kleur : withAlpha(theme.inactive, 0.5),
                },
              ]}>
              <Ionicons
                name={prestatie.icoon}
                size={46}
                color={behaald ? theme.background : theme.inactive}
              />
            </Animated.View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
              {behaald ? t((s) => s.prestatie.behaald) : t((s) => s.prestatie.nogNiet)}
            </ThemedText>

            <ThemedText type="title" style={styles.gecentreerd}>
              {naam}
            </ThemedText>

            <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
              {uitleg}
            </ThemedText>

            {/* Behaald: de punten die hij opleverde. Nog niet: hoe ver je bent. Twee antwoorden op
                dezelfde vraag "waar sta ik", en nooit allebei tegelijk. */}
            {behaald ? (
              <View
                style={[
                  styles.pil,
                  { backgroundColor: theme.backgroundElement, borderColor: kleur },
                ]}>
                <Ionicons name="star" size={16} color={kleur} />
                <ThemedText type="small" style={{ color: kleur }}>
                  {t((s) => s.prestatie.punten)(prestatie.punten)}
                </ThemedText>
              </View>
            ) : (
              <View
                style={[
                  styles.pil,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: withAlpha(theme.inactive, 0.5),
                  },
                ]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.prestatie.voortgangRegel)(huidig, prestatie.drempel)}
                </ThemedText>
              </View>
            )}

            {datumRegel !== null && (
              <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
                {datumRegel}
              </ThemedText>
            )}

            {deelMelding !== null && (
              <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
                {deelMelding}
              </ThemedText>
            )}

            <View style={styles.knoppen}>
              {/* Delen kan alleen wat je hebt. Een deelknop onder een vergrendelde mijlpaal zou
                  aanbieden op te scheppen over iets wat nog niet gebeurd is. */}
              {behaald && (
                <AnimatedPressable
                  // `deelNu` geeft zelf een tik en bij succes een zwaarder signaal.
                  haptisch={false}
                  onPress={() => void deelNu()}
                  accessibilityRole="button"
                  accessibilityLabel={t((s) => s.prestatie.deel)}
                  style={[styles.knop, { backgroundColor: kleur }]}>
                  <Ionicons name="share-social-outline" size={18} color={theme.background} />
                  <ThemedText type="bodyBold" style={{ color: theme.background }}>
                    {ontgrendeling.gedeeld
                      ? t((s) => s.prestatie.deelOpnieuw)
                      : t((s) => s.prestatie.deel)}
                  </ThemedText>
                </AnimatedPressable>
              )}

              <AnimatedPressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t((s) => s.prestatie.sluiten)}
                style={[styles.knop, styles.knopStil, { borderColor: theme.inactive }]}>
                <ThemedText type="bodyBold" themeColor="textSecondary">
                  {t((s) => s.prestatie.sluiten)}
                </ThemedText>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  laag: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  kaartHouder: {
    width: '100%',
    maxWidth: 380,
  },
  kaart: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radii.card,
    borderWidth: 1,
  },
  icoonRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  pil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.small,
    borderWidth: 1,
    marginTop: Spacing.one,
  },
  knoppen: {
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.three,
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
});
