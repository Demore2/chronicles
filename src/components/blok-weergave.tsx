import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Illustratie } from '@/components/illustratie';
import { ShareQuoteButton } from '@/components/share-quote-button';
import { ThemedText } from '@/components/themed-text';
import type { Blok } from '@/constants/types';
import { Fonts, Radii, Spacing, withAlpha } from '@/constants/theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Rendert één blok uit een hoofdstuk. Elke variant van `Blok` heeft hier een tak; een nieuw type
 * toevoegen betekent ook een case in `scripts/validate-content.mjs` en, als het leesbare tekst
 * toont, in `telWoordenInBlok` (`src/content/leestijd.ts`).
 */
export function BlokWeergave({
  blok,
  tijdperkKleur,
  verhaalTitel,
  verhaalId,
}: {
  blok: Blok;
  tijdperkKleur: string;
  /**
   * De titel van het verhaal waar dit blok in staat, al vertaald.
   *
   * Optioneel, en de deelknop hangt eraan: zonder titel is er geen bericht te bouwen ("— from
   * ..."), dus dan verschijnt hij niet. Zo hoeft een toekomstige aanroeper die alleen blokken wil
   * tekenen (een voorbeeldweergave, een validatiescherm) niets te weten van delen.
   */
  verhaalTitel?: string;
  /** Alleen voor de analytics-gebeurtenis; de deelknop werkt er ook zonder. */
  verhaalId?: string;
}) {
  // Geen `useTheme()` meer: elk blok kleurt nu met `tijdperkKleur` (het citaat gebruikte hiervoor
  // `theme.accent` voor zijn randje links, dat randje is vervangen door het glyph).
  const { t, v } = useVertaling();

  if (blok.type === 'tekst') {
    return (
      <View style={styles.tekstBlok}>
        <ThemedText style={styles.tekst}>{v(blok.inhoud)}</ThemedText>
        {/* De deelknop hangt onder de alinea en niet ernaast: naast de tekst zou hij de
            regellengte inkorten, en een leeskolom die per blok van breedte wisselt leest slecht. */}
        {verhaalTitel !== undefined && (
          <ShareQuoteButton
            citaat={v(blok.inhoud)}
            verhaalTitel={verhaalTitel}
            verhaalId={verhaalId}
            accent={tijdperkKleur}
          />
        )}
      </View>
    );
  }

  if (blok.type === 'afbeelding') {
    return (
      <View style={styles.afbeeldingBlok}>
        {/* LAUNCH-PLAN.md B2: hier stond een `<Illustratie>` die `blok.bron` volledig negeerde —
            elk afbeeldingsblok was een gekleurd vierkantje met een icoontje. De illustratie is nu
            alleen nog de terugval voor content zonder bron. */}
        {blok.bron ? (
          <Image
            source={blok.bron}
            style={[styles.afbeelding, { backgroundColor: withAlpha(tijdperkKleur, 0.15) }]}
            contentFit="cover"
            transition={200}
            accessibilityLabel={v(blok.alt)}
          />
        ) : (
          <Illustratie
            kleur={tijdperkKleur}
            icoonNaam="image-outline"
            style={styles.afbeeldingTerugval}
          />
        )}
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
      <View style={styles.citaatBlok}>
        {/* Het glyph is het citaat-signaal, niet het randje links: een groot aanhalingsteken in de
            tijdperkkleur plus serif tilt het citaat uit de kolom lopende tekst (B3). */}
        <ThemedText style={[styles.citaatGlyph, { color: withAlpha(tijdperkKleur, 0.5) }]}>
          {'“'}
        </ThemedText>
        <ThemedText type="title" style={styles.citaatTekst}>
          {v(blok.tekst)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          — {v(blok.bron)}
        </ThemedText>
        {/* Een citaat is letterlijk het bloktype waarvoor "deel deze zin" bedoeld is; de
            bronvermelding gaat mee het venster in, zodat de uitspraak niet losraakt van wie hem
            deed. */}
        {verhaalTitel !== undefined && (
          <ShareQuoteButton
            citaat={v(blok.tekst)}
            bron={v(blok.bron)}
            verhaalTitel={verhaalTitel}
            verhaalId={verhaalId}
            accent={tijdperkKleur}
          />
        )}
      </View>
    );
  }

  if (blok.type === 'kop') {
    return (
      <View style={styles.kopBlok}>
        <ThemedText type="subtitle" style={styles.kopTekst}>
          {v(blok.tekst)}
        </ThemedText>
        <View style={[styles.kopStreep, { backgroundColor: tijdperkKleur }]} />
      </View>
    );
  }

  if (blok.type === 'weetje') {
    return (
      <View
        style={[
          styles.weetjeBlok,
          { backgroundColor: withAlpha(tijdperkKleur, 0.12), borderColor: withAlpha(tijdperkKleur, 0.35) },
        ]}>
        <View style={styles.weetjeKop}>
          <Ionicons name="bulb-outline" size={16} color={tijdperkKleur} />
          <ThemedText type="caption" style={{ color: tijdperkKleur }}>
            {t((s) => s.blok.weetjeLabel)}
          </ThemedText>
        </View>
        <ThemedText type="small" style={styles.weetjeTekst}>
          {v(blok.tekst)}
        </ThemedText>
      </View>
    );
  }

  if (blok.type === 'sleutelmoment') {
    return (
      <View style={styles.sleutelmomentBlok}>
        <View style={styles.sleutelmomentKantlijn}>
          <ThemedText type="smallBold" style={{ color: tijdperkKleur }}>
            {t((s) => s.blok.jaarLabel)(blok.jaar)}
          </ThemedText>
        </View>
        <View style={[styles.sleutelmomentStreep, { backgroundColor: withAlpha(tijdperkKleur, 0.4) }]} />
        <ThemedText type="small" style={styles.sleutelmomentTekst} themeColor="textSecondary">
          {v(blok.tekst)}
        </ThemedText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  tekstBlok: {
    gap: Spacing.one,
  },
  tekst: {
    lineHeight: 26,
  },
  afbeeldingBlok: {
    gap: Spacing.two,
  },
  afbeelding: {
    width: '100%',
    // 16:9 — een scène is een filmische onderbreking in de leestekst; 3:4 duwt op een telefoon de
    // hele alinea eronder uit beeld. De 3:4-verhouding geldt alleen voor de portretkaarten.
    aspectRatio: 16 / 9,
    borderRadius: Radii.card,
  },
  afbeeldingTerugval: {
    height: 180,
    borderRadius: Radii.card,
  },
  bijschrift: {
    textAlign: 'center',
  },
  citaatBlok: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  citaatGlyph: {
    fontFamily: Fonts.serif,
    fontSize: 56,
    lineHeight: 56,
    // Het glyph hangt aan de bovenkant van zijn regel; deze marge trekt het citaat er weer tegenaan.
    marginBottom: -Spacing.four,
  },
  citaatTekst: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    lineHeight: 32,
  },
  kopBlok: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  kopTekst: {
    letterSpacing: 0.2,
  },
  kopStreep: {
    height: 2,
    width: 32,
    borderRadius: 1,
  },
  weetjeBlok: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  weetjeKop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  weetjeTekst: {
    lineHeight: 22,
  },
  sleutelmomentBlok: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  sleutelmomentKantlijn: {
    // Vaste breedte, zodat opeenvolgende sleutelmomenten een echte kantlijn vormen in plaats van
    // een rafelrand die met de lengte van het jaartal meebeweegt.
    width: 64,
    alignItems: 'flex-end',
    paddingTop: 1,
  },
  sleutelmomentStreep: {
    width: 2,
    alignSelf: 'stretch',
    borderRadius: 1,
  },
  sleutelmomentTekst: {
    flex: 1,
    lineHeight: 22,
  },
});
