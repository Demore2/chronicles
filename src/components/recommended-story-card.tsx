import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useRecommendationStore } from '@/store/recommendation-store';
import { useStoryProgressStore } from '@/store/story-progress-store';

/**
 * "Recommended for you" op Home: één verhaal, met de reden erbij.
 *
 * ## Waarom hier een laadtoestand zit terwijl er niets van het netwerk hoeft te komen
 *
 * De suggestie komt uit `recommendation-store` en die staat in AsyncStorage, dus vlak na een
 * koude start is hij nog leeg — niet omdat er niets is, maar omdat de opslag nog niet gelezen is.
 * Zonder de hydratiecontrole toont deze kaart in die milliseconden de lege staat ("je hebt elk
 * verhaal geopend") en klapt daarna om naar een verhaal. Dat is dezelfde val als bij de
 * verhaallimiet in `chapters.tsx`, en de oplossing is dezelfde: eerst wachten tot beide stores
 * gehydrateerd zijn.
 *
 * De serverronde (`loadRecommendations`) heeft géén eigen laadtoestand. Die vult alleen aan wat
 * hier al staat, en een spinner tonen boven een antwoord dat je al hebt maakt de kaart trager dan
 * hij is.
 *
 * ## De kaart navigeert zelf
 *
 * Zoals `VerhaalCarouselKaart`, en anders dan `VerhaalKaart`: er is precies één bestemming en die
 * volgt uit het verhaal dat de kaart toont, dus een `onPress`-prop zou alleen een doorgeefluik
 * zijn dat elke aanroeper hetzelfde invult.
 */

/**
 * Zijn beide stores klaar met lezen uit AsyncStorage?
 *
 * `useSyncExternalStore` en niet `useState` + `useEffect`: dat tweede patroon is precies wat
 * `react-hooks/set-state-in-effect` afkeurt (zie `use-color-scheme.web.ts`). `persist` biedt
 * hier bovendien letterlijk de twee functies die deze hook nodig heeft.
 */
function abonneerOpHydratie(herteken: () => void): () => void {
  const stopAanbevelingen = useRecommendationStore.persist.onFinishHydration(herteken);
  const stopVoortgang = useStoryProgressStore.persist.onFinishHydration(herteken);
  return () => {
    stopAanbevelingen();
    stopVoortgang();
  };
}

function isGehydrateerd(): boolean {
  return (
    useRecommendationStore.persist.hasHydrated() && useStoryProgressStore.persist.hasHydrated()
  );
}

/** Op de server (web-prerender) is er geen AsyncStorage, dus daar is niets gehydrateerd. */
function opDeServer(): boolean {
  return false;
}

export function RecommendedStoryCard() {
  const theme = useTheme();
  const router = useRouter();
  const { t, v } = useVertaling();

  const gehydrateerd = useSyncExternalStore(abonneerOpHydratie, isGehydrateerd, opDeServer);
  const voortgang = useStoryProgressStore((state) => state.progress);

  /**
   * `useShallow` is hier geen optimalisatie maar een noodzaak: `getNext()` bouwt bij elke aanroep
   * een nieuw object, en een selector die telkens een nieuwe referentie teruggeeft laat
   * `useSyncExternalStore` eindeloos hertekenen. De velden zijn primitieven plus een `Verhaal` uit
   * de bundel (een vaste referentie), dus een ondiepe vergelijking is hier precies goed.
   */
  const volgende = useRecommendationStore(useShallow((state) => state.getNext(voortgang)));

  // Ophalen wat de server weet. Eén keer per montage; de sync-hook doet dit ook bij het inloggen,
  // maar Home kan ook geopend worden zonder dat er net een sessie ontstond.
  useEffect(() => {
    void useRecommendationStore.getState().loadRecommendations();
  }, []);

  /**
   * En daarna: zelf een suggestie uitrekenen.
   *
   * Dit is de aanleiding die in fase 1 nog ontbrak. Hij hangt aan `voortgang`, dus een afgerond
   * hoofdstuk levert meteen een verse suggestie op. `recommend()` is idempotent op verhaal + reden,
   * dus opnieuw meten kost niets als er niets veranderde.
   *
   * De hydratiecontrole is niet cosmetisch: meten vóórdat de voortgang gelezen is levert de
   * suggestie op van iemand die nog nooit iets las, en die wordt dan ook nog naar de server
   * gestuurd.
   */
  useEffect(() => {
    if (!gehydrateerd) return;
    useRecommendationStore.getState().genereerAanbeveling();
  }, [gehydrateerd, voortgang]);

  const randStijl = { borderColor: withAlpha(theme.accent, 0.35) };
  const kaartStijl = [styles.kaart, { backgroundColor: theme.backgroundElement }, randStijl];

  if (!gehydrateerd) {
    return (
      <View style={styles.container}>
        <View style={kaartStijl}>
          <ThemedText type="caption" themeColor="accent">
            {t((s) => s.aanbeveling.kop)}
          </ThemedText>
          {/* Bewust vormen en geen tekst: "laden…" laat je iets lezen dat meteen weer weg is. */}
          <View style={styles.rij}>
            <View style={[styles.portret, { backgroundColor: theme.backgroundSelected }]} />
            <View style={styles.rijTekst}>
              <View style={[styles.balk, styles.balkTitel, { backgroundColor: theme.backgroundSelected }]} />
              <View style={[styles.balk, { backgroundColor: theme.backgroundSelected }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!volgende) {
    return (
      <View style={styles.container}>
        <View style={kaartStijl}>
          <ThemedText type="caption" themeColor="accent">
            {t((s) => s.aanbeveling.kop)}
          </ThemedText>
          <ThemedText type="subtitle">{t((s) => s.aanbeveling.leegTitel)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.aanbeveling.leegTekst)}
          </ThemedText>
        </View>
      </View>
    );
  }

  const { verhaal, reden } = volgende;
  const tijdperk = getTijdperk(verhaal.tijdperkId);
  const tijdperkNaam = tijdperk ? v(tijdperk.titel) : '';

  return (
    <View style={styles.container}>
      <View style={kaartStijl}>
        <ThemedText type="caption" themeColor="accent">
          {t((s) => s.aanbeveling.kop)}
        </ThemedText>

        <View style={styles.rij}>
          <View style={[styles.portret, { backgroundColor: verhaal.portretKleur }]}>
            {verhaal.afbeelding ? (
              <Image
                source={verhaal.afbeelding}
                style={styles.portretAfbeelding}
                contentFit="cover"
                transition={200}
                accessibilityLabel={v(verhaal.titel)}
              />
            ) : (
              <ThemedText style={styles.initiaal}>
                {v(verhaal.titel).charAt(0).toUpperCase()}
              </ThemedText>
            )}
          </View>

          <View style={styles.rijTekst}>
            <ThemedText type="subtitle" numberOfLines={2}>
              {v(verhaal.titel)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {t((s) => s.aanbeveling.reden[reden])(tijdperkNaam)}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
          {v(verhaal.teaser)}
        </ThemedText>

        <AnimatedPressable
          onPress={() => router.push({ pathname: '/verhaal/[id]', params: { id: verhaal.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${t((s) => s.aanbeveling.startLezen)}: ${v(verhaal.titel)}`}
          style={[styles.knop, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {t((s) => s.aanbeveling.startLezen)}
          </ThemedText>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // De marge zit op de buitenste View en niet op de kaart zelf, zodat Home hem als gewone sectie
  // in zijn `gap` kan zetten — net als de hero erboven.
  container: {
    paddingHorizontal: Spacing.four,
  },
  kaart: {
    padding: Spacing.four,
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  rij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  portret: {
    width: 72,
    aspectRatio: 3 / 4,
    borderRadius: Radii.small,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portretAfbeelding: {
    width: '100%',
    height: '100%',
  },
  initiaal: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  // `flex: 1` en niet een vaste breedte: de kaart is zo breed als het scherm min de gutters, dus
  // de tekst moet de rest opvullen en zelf afbreken.
  rijTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  knop: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
  balk: {
    height: 12,
    borderRadius: Radii.small,
  },
  balkTitel: {
    height: 18,
    width: '70%',
  },
});
