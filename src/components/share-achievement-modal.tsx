import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { DeelOpties } from '@/components/deel-opties';
import { ThemedText } from '@/components/themed-text';
import { deelBerichtMetLink } from '@/constants/deel';
import { prestatieMet, type PrestatieCategorie, type PrestatieItem } from '@/constants/prestaties';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAchievementStore } from '@/store/achievement-store';
import { usePrestatieStore } from '@/store/prestatie-store';

/**
 * Het deelvenster van een mijlpaal: wat je behaalde, en drie manieren om het te vertellen.
 *
 * ## Hoe dit zich verhoudt tot de twee vensters die er al waren
 *
 * Er lagen al twee lagen over een behaalde mijlpaal, en dit is de derde:
 *
 * | | Wat het beantwoordt | Wanneer |
 * |---|---|---|
 * | `PrestatieMelding` (strook) | "er is iets gebeurd" | zodra hij binnenkomt |
 * | `AchievementUnlockModal` | "wat is dit, en wanneer verdiende ik het" | een tik verderop |
 * | **dit venster** | "hoe deel ik het" | na de deelknop, of meteen bij een verse mijlpaal |
 *
 * Ze zijn met opzet niet samengevoegd: de vorige twee moeten ook bestaan voor een mijlpaal die je
 * op Voortgang aantikt en helemaal niet wilt delen, en dit venster moet bestaan zonder eerst een
 * uitleg te tonen die je zojuist als strook voorbij zag komen. `prestatie-store` zorgt dat er
 * nooit twee tegelijk openstaan (`toonDelen` wist `detailId` en `teVieren`).
 *
 * ## Waarom het niet altijd vanzelf verschijnt
 *
 * `use-prestaties.ts` opent dit venster wél automatisch bij een nieuwe mijlpaal — maar niet
 * wanneer de reader op dat moment het ontgrendelde personage viert. Dat is precies het moment
 * waarop de meeste mijlpalen binnenkomen (je leest een verhaal uit: dat is één verhaal én acht
 * hoofdstukken én één personage erbij), en twee vensters die om dezelfde tik vragen is er één te
 * veel. In dat geval blijft de strook staan en is dit venster twee tikken verderop. Zie
 * `prestatie-store.onderbrekingBezet`.
 *
 * Hangt één keer in de root layout, om dezelfde reden als `AchievementUnlockModal`: er zijn
 * meerdere ingangen (de automatische, en de deelknop in het detailvenster) en twee kopieën zouden
 * op elkaar kunnen stapelen.
 */
export function ShareAchievementModal() {
  const deelId = usePrestatieStore((state) => state.deelId);
  const wisDelen = usePrestatieStore((state) => state.wisDelen);

  const prestatie = deelId === null ? undefined : prestatieMet(deelId);

  // Niets aangetikt, of een id dat niet meer bestaat (mijlpaal hernoemd of weggehaald).
  if (!prestatie) return null;

  return <Venster key={prestatie.id} prestatie={prestatie} onClose={wisDelen} />;
}

/** Welke van de vier accentkleuren bij een categorie hoort. Gelijk aan `achievements-grid.tsx`. */
function categorieKleur(categorie: PrestatieCategorie, theme: ReturnType<typeof useTheme>): string {
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
  const { t } = useVertaling();

  const markeerGedeeld = useAchievementStore((state) => state.markeerGedeeld);

  const naam = t((s) => s.prestatie.namen)[prestatie.id];
  const uitleg = t((s) => s.prestatie.uitleg)[prestatie.categorie](prestatie.drempel);
  const kleur = categorieKleur(prestatie.categorie, theme);

  const bericht = deelBerichtMetLink(t((s) => s.deel.prestatieBericht)(naam));

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // Android's terugknop moet dit venster kunnen sluiten; zonder dit zit de lezer vast.
      onRequestClose={onClose}>
      {/* De achtergrond sluit ook. Dat mag hier: er valt niets te beslissen — delen is een aanbod,
          geen vraag die beantwoord moet worden voordat de app verder kan. */}
      <Pressable
        style={[styles.laag, { backgroundColor: withAlpha('#000000', 0.6) }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t((s) => s.deel.sluiten)}>
        {/* Een tik op de kaart zelf mag niet doorlekken naar de sluitlaag eronder. */}
        <Pressable onPress={() => undefined} style={styles.kaartHouder}>
          <Animated.View
            entering={FadeIn.duration(160)}
            style={[styles.kaart, { backgroundColor: theme.background, borderColor: kleur }]}>
            <Animated.View
              entering={ZoomIn.springify().damping(14)}
              style={[styles.icoonRing, { backgroundColor: kleur, borderColor: kleur }]}>
              <Ionicons name={prestatie.icoon} size={40} color={theme.background} />
            </Animated.View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
              {t((s) => s.deel.prestatieKop)}
            </ThemedText>

            <ThemedText type="title" style={styles.gecentreerd}>
              {naam}
            </ThemedText>

            <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
              {uitleg}
            </ThemedText>

            {/* Wat er verstuurd wordt, vóórdat het verstuurd wordt. Een deelknop die zonder
                voorbeeld iets in je naam de deur uit doet is precies de reden dat mensen ze niet
                aanraken. */}
            <View style={[styles.voorbeeld, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {bericht}
              </ThemedText>
            </View>

            <DeelOpties
              bericht={bericht}
              deelTitel={t((s) => s.prestatie.deelTitel)}
              accent={kleur}
              // Alleen markeren als er echt iets vertrokken is; `DeelOpties` roept dit niet aan
              // bij een weggeklikt deelvenster.
              onGedeeld={() => markeerGedeeld(prestatie.id)}
            />

            <AnimatedPressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t((s) => s.deel.sluiten)}
              style={styles.sluitKnop}>
              <ThemedText type="bodyBold" themeColor="textSecondary">
                {t((s) => s.deel.sluiten)}
              </ThemedText>
            </AnimatedPressable>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  voorbeeld: {
    width: '100%',
    padding: Spacing.three,
    borderRadius: Radii.card,
    marginVertical: Spacing.two,
  },
  sluitKnop: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
