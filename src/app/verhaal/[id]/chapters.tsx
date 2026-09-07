import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/animated-pressable';
import { HoofdstukTegel } from '@/components/hoofdstuk-tegel';
import { LegeStaat } from '@/components/lege-staat';
import { StoryLimitModal } from '@/components/story-limit-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { DAGELIJKSE_VERHAAL_LIMIET } from '@/constants/monetisatie';
import { Motion } from '@/constants/motion';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { berekenLeestijdMinuten } from '@/content/leestijd';
import { getVerhaal } from '@/content/verhalen';
import { haalVerhalenVandaagOp, logVerhaalGeopend } from '@/lib/leeslimiet';
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAbonnementStore, verhalenVanVandaag } from '@/store/abonnement-store';
import { wachtOpSessie } from '@/store/auth-store';
import { useStoryProgressStore } from '@/store/story-progress-store';
import { wachtOpHydratie } from '@/store/sync-hulp';

export default function ChaptersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t, v } = useVertaling();

  const verhaal = getVerhaal(id);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  // Zonder verhaal is `progressPercentage` een NaN (0/0) — die mag niet in een animatie belanden.
  const voortgangPercentage = Number.isFinite(progress.progressPercentage)
    ? progress.progressPercentage
    : 0;
  const voortgangBreedte = useSharedValue(0);

  useEffect(() => {
    // Start op 0 en loop vol. Dit scherm wordt via `router.push` steeds opnieuw gemonteerd, dus
    // een overgang tussen twee waardes zou je nooit zien; het vollopen bij openen wel.
    voortgangBreedte.set(
      withDelay(
        Motion.duration.normaal,
        withTiming(voortgangPercentage, { duration: Motion.duration.traag })
      )
    );
  }, [voortgangPercentage, voortgangBreedte]);

  const voortgangStijl = useAnimatedStyle(() => ({
    width: `${voortgangBreedte.get()}%` as `${number}%`,
  }));

  // --- Dagelijkse leeslimiet (gratis lezers) ---
  //
  // Dit scherm is de trechter waar élke route naar een verhaal doorheen komt (`verhaal/[id].tsx`
  // stuurt hierheen door), dus hier wordt geteld en hier wordt tegengehouden. In de reader zou het
  // te laat zijn: dan staat de lezer al in hoofdstuk één.
  const [limietBereikt, setLimietBereikt] = useState(false);
  const verhaalId = verhaal?.id;
  const tijdperkId = verhaal?.tijdperkId;
  const aantalHoofdstukken = verhaal?.chapters.length ?? 0;

  useEffect(() => {
    if (!verhaalId) return;
    let afgebroken = false;

    // Eerst wachten tot beide stores uit AsyncStorage gelezen zijn. Zonder die garantie kijken we
    // vlak na een koude start naar lege beginwaarden: een uitgelezen verhaal lijkt dan ongelezen,
    // en de teller van vandaag lijkt op nul te staan.
    Promise.all([
      wachtOpHydratie(useStoryProgressStore),
      wachtOpHydratie(useAbonnementStore),
    ]).then(async () => {
      if (afgebroken) return;

      // Een verhaal dat je al helemaal uit hebt kost geen plek: de limiet doseert nieuwe inhoud,
      // hij zet je eigen boekenkast niet op slot. Zonder deze regel kun je met de teller vol geen
      // hoofdstuk teruglezen dat je gisteren al las.
      const gelezen = useStoryProgressStore.getState().getChapterProgress(verhaalId);
      const isUitgelezen =
        aantalHoofdstukken > 0 && gelezen.completedChapters.length >= aantalHoofdstukken;
      // Dit effect is ook de plek waar het openen geteld wordt (Firebase). Niet in
      // `verhaal/[id].tsx`: dat is een omleiding die een deeplink rechtstreeks naar dit scherm
      // overslaat, en dan zou de bovenkant van de trechter systematisch te laag uitvallen.
      const meting = { story_id: verhaalId, era: tijdperkId, chapter_count: aantalHoofdstukken };

      if (isUitgelezen) {
        setLimietBereikt(false);
        logStoryEvent(ANALYTICS_EVENTS.STORY_READ, { ...meting, is_reread: true });
        return;
      }

      // Wat de server voor vandaag kent erbij leggen, vóór de poort. De teller staat in
      // AsyncStorage en hoort dus bij dit toestel, terwijl de limiet bij het account hoort —
      // zonder deze ronde krijgt een tweede telefoon zijn eigen dagvoorraad.
      //
      // De opvraging heeft een eigen tijdslimiet en `null` betekent "de server weet het even
      // niet". Dan telt de lokale stand, want een leeslimiet die dichtklapt zodra het netwerk
      // wegvalt is erger dan een limiet die een keer te ruim uitpakt.
      // `wachtOpSessie()` en niet `getState().user?.id`: bij een koude start of een deeplink
      // rechtstreeks in een verhaal herstelt `AuthPoort` de sessie nog terwijl dit effect al
      // loopt. Dan leest een directe uitlezing `null`, wordt er niets naar `user_daily_reads`
      // geschreven en blijft de serverronde uit — precies de koude start die daardoor een gratis
      // extra verhaal zou opleveren.
      const userId = await wachtOpSessie();
      if (afgebroken) return;
      if (userId) {
        const server = await haalVerhalenVandaagOp(userId);
        if (afgebroken) return;
        if (server) {
          useAbonnementStore
            .getState()
            .voegServerVerhalenSamen(server.dagSleutel, server.verhaalIds);
        }
      }

      const abonnement = useAbonnementStore.getState();
      if (abonnement.magVerhaalOpenen(verhaalId)) {
        const wasAlGeteld = verhalenVanVandaag(abonnement).includes(verhaalId);
        abonnement.registreerVerhaalGeopend(verhaalId);
        // Alleen de eerste keer vandaag een rij schrijven. `registreerVerhaalGeopend` is idempotent
        // binnen de dag, maar de tabel is een append-only logboek zonder unique constraint: elke
        // terugkeer uit de reader (`router.back()`) zou anders een rij bijschrijven.
        if (userId && !wasAlGeteld) logVerhaalGeopend(userId, verhaalId);
        setLimietBereikt(false);
        logStoryEvent(ANALYTICS_EVENTS.STORY_READ, { ...meting, is_reread: false });
        return;
      }
      setLimietBereikt(true);
      // Het directe signaal voor het gratis/Pro-model: hoe vaak loopt een lezer tegen de muur,
      // en bij welk verhaal? Dat is niet af te leiden uit `story_read`, want die blijft hier
      // juist uit.
      logStoryEvent(ANALYTICS_EVENTS.LIMIT_REACHED, {
        ...meting,
        daily_limit: DAGELIJKSE_VERHAAL_LIMIET,
      });
    });

    return () => {
      afgebroken = true;
    };
  }, [verhaalId, tijdperkId, aantalHoofdstukken]);

  if (!verhaal) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.verhaal.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.verhaal.nietGevondenTitel)}
          beschrijving={t((s) => s.verhaal.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal.tijdperkId);

  // Het eerste hoofdstuk dat open staat maar nog niet af is — daar was de lezer gebleven.
  const volgendHoofdstukId = verhaal.chapters.find(
    (chapter) => progress.isChapterUnlocked(chapter.id) && !progress.isChapterCompleted(chapter.id)
  )?.id;

  function handleChapterPress(chapterId: number) {
    // Vangnet: de melding ligt over het scherm, dus hier komt normaal geen tik doorheen.
    if (limietBereikt) return;
    if (progress.isChapterUnlocked(chapterId)) {
      router.push({
        pathname: '/verhaal/[id]/reader',
        params: { id: verhaal!.id, chapterId: String(chapterId) },
      });
    }
  }

  /**
   * "Tot morgen" sluit niet alleen het venster maar verlaat ook het verhaal — anders kijk je naar
   * een hoofdstukoverzicht dat je niet mag openen, en dat leest als een kapotte app in plaats van
   * als een limiet.
   */
  function handleLimietSluiten() {
    setLimietBereikt(false);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerBar}>
        <AnimatedPressable
          onPress={() => router.push('/')}
          style={[styles.homeButton, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold">{t((s) => s.tabs.ontdek)}</ThemedText>
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="display">{v(verhaal.titel)}</ThemedText>
        <ThemedText themeColor="textSecondary">{v(verhaal.ondertitel)}</ThemedText>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: tijdperk?.kleur ?? theme.accent },
                voortgangStijl,
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.hoofdstuk.voortgang)(progress.completedChapters.length, verhaal.chapters.length)}
          </ThemedText>
        </View>

        <View style={styles.chaptersGrid}>
          {verhaal.chapters.map((chapter, index) => (
            <HoofdstukTegel
              key={chapter.id}
              nummer={chapter.id}
              titel={v(chapter.titel)}
              afbeelding={chapter.afbeelding}
              leestijdMinuten={berekenLeestijdMinuten(chapter.blokken, v)}
              isUnlocked={progress.isChapterUnlocked(chapter.id)}
              isCompleted={progress.isChapterCompleted(chapter.id)}
              isVolgende={chapter.id === volgendHoofdstukId}
              tijdperkKleur={tijdperk?.kleur ?? theme.accent}
              index={index}
              onPress={() => handleChapterPress(chapter.id)}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
          <ThemedText type="small" style={styles.infoText}>
            {t((s) => s.hoofdstuk.volgordeUitleg)}
          </ThemedText>
        </View>
      </ScrollView>

      <StoryLimitModal visible={limietBereikt} onClose={handleLimietSluiten} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
  },
  homeButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  progressSection: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  // De tegelstijlen (chapterTile/tileImage/tileContent/lockIcon/checkIcon) staan nu in
  // `components/hoofdstuk-tegel.tsx`, samen met de tegel zelf.
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
    marginTop: Spacing.three,
  },
  infoText: {
    flex: 1,
  },
});
