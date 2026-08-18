import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/ad-banner';
import { AdModal } from '@/components/ad-modal';
import { AnimatedPressable } from '@/components/animated-pressable';
import { BlokWeergave } from '@/components/blok-weergave';
import { CharacterUnlockModal } from '@/components/character-unlock-modal';
import { InteractieveSectie } from '@/components/interactieve-sectie';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { haptics } from '@/constants/haptics';
import { AD_ONDERBREKING_ENABLED } from '@/constants/monetisatie';
import { Motion, staggerVertraging } from '@/constants/motion';
import { Radii, Spacing } from '@/constants/theme';
import { getTijdperk } from '@/constants/tijdperken';
import { getVerhaal } from '@/content/verhalen';
import { useAbonnement } from '@/hooks/use-abonnement';
import { biedHerinneringAan } from '@/hooks/use-dagelijkse-herinnering';
import { useTheme } from '@/hooks/use-theme';
import { useStoryProgress } from '@/hooks/use-story-progress';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * Hoeveel hele seconden er sinds `start` voorbij zijn, of `undefined` als er geen start is.
 *
 * Staat buiten de component omdat `Date.now()` een onzuivere aanroep is: binnen de component zou
 * de lintregel hem als een klok-aflezing tijdens het renderen zien, ook al draait hij alleen in
 * een handler. `undefined` valt in `lib/analytics.ts` vanzelf uit de parameters weg.
 */
function secondenSinds(start: number | null): number | undefined {
  return start === null ? undefined : Math.round((Date.now() - start) / 1000);
}

export default function ReaderScreen() {
  const { id, chapterId: chapterIdParam } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, v } = useVertaling();
  const characterStore = useCharacterUnlockStore();
  const voortgangStore = useVoortgangStore();
  const { isPremium } = useAbonnement();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  /**
   * Wanneer dit hoofdstuk in beeld kwam, voor `time_spent_seconds` bij het afvinken.
   *
   * Een `useRef` met een effect en geen waarde die bij het monteren wordt gezet: "Next Chapter"
   * gaat via `router.replace`, dus het scherm blijft staan en alleen `chapterId` verandert. Zonder
   * dit effect zou hoofdstuk acht de leestijd van hoofdstuk één rapporteren.
   *
   * Het meet schermtijd, niet leestijd — de app weet niet of de telefoon in een broekzak zat. Voor
   * "hoe lang doet iemand over een hoofdstuk" is het bruikbaar zolang je de mediaan leest en niet
   * het gemiddelde.
   *
   * Begint op `null` en wordt door het effect gevuld: `useRef(Date.now())` zou de klok tijdens het
   * renderen aflezen, en dat is precies wat de `react-hooks`-regel "Cannot call impure function
   * during render" tegenhoudt.
   */
  const hoofdstukGestartOp = useRef<number | null>(null);

  /**
   * Krijgt deze lezer de onderbreking na het uitlezen te zien? De reader beslist dat zelf en laat
   * het niet aan `AdModal` over: die kan `null` renderen, en dan zou het scherm blijven wachten op
   * een `onClose` die nooit komt.
   */
  const toontOnderbreking = AD_ONDERBREKING_ENABLED && !isPremium;

  // Scrollvoortgang leeft op de UI-thread (LAUNCH-PLAN.md B4). Hier stond een `useState` die op
  // elk scroll-event met `scrollEventThrottle={16}` werd gezet — dat rerenderde het hele
  // hoofdstuk op 60fps terwijl alleen een balkje van 3px hoog hoefde te bewegen.
  const scrollVoortgang = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const max = event.contentSize.height - event.layoutMeasurement.height;
    scrollVoortgang.set(max > 0 ? Math.min(1, Math.max(0, event.contentOffset.y / max)) : 0);
  });

  const voortgangsbalkStijl = useAnimatedStyle(() => ({
    width: `${scrollVoortgang.get() * 100}%` as `${number}%`,
  }));

  const verhaal = getVerhaal(id);
  const chapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : 1;
  const chapter = verhaal?.chapters.find((ch) => ch.id === chapterId);
  const progress = useStoryProgress(verhaal?.id ?? '', verhaal?.chapters.length ?? 0);

  useEffect(() => {
    hoofdstukGestartOp.current = Date.now();
  }, [chapterId, id]);

  const allChaptersRead = progress.completedChapters.length === verhaal?.chapters.length;
  const characterUnlocked = verhaal ? characterStore.isCharacterUnlocked(verhaal.id) : false;
  const shouldShowUnlockButton = allChaptersRead && !characterUnlocked;

  // Let op (LAUNCH-PLAN.md B5): hier stond ook een useEffect die het hoofdstuk automatisch
  // afvinkte bij 80% scroll. Samen met de "Mark Complete"-knop waren dat twee mechanismen — de
  // knop veranderde onder je duim in "Next Chapter" voordat je 'm indrukte. De knop is nu de
  // enige trigger; dat is ook de flow die de verificatieprocedure in CLAUDE.md beschrijft.
  // De scrollpositie voedt alleen nog de voortgangsbalk bovenaan (`scrollVoortgang`).

  // Let op (LAUNCH-PLAN.md B4): hier stond een `useEffect` met een `hasAutoUnlockedRef` die het
  // personage automatisch ontgrendelde zodra het laatste hoofdstuk af was. Daardoor verscheen de
  // "Unlock <naam>"-knop in de footer in de praktijk nooit — de modal was er al voordat je 'm kon
  // indrukken. Ontgrendelen is de kernbeloning van de app en hoort een handeling te zijn, dus
  // `handleUnlockCharacter` is nu de enige trigger. `markStoryCompleted` is daarheen verhuisd.

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

  if (!chapter) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: t((s) => s.hoofdstuk.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.hoofdstuk.nietGevondenTitel)}
          beschrijving={t((s) => s.hoofdstuk.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  const tijdperk = getTijdperk(verhaal!.tijdperkId);
  const isLastChapter = chapterId === verhaal!.chapters.length;
  const nextChapterUnlocked = progress.isChapterUnlocked(chapterId + 1);

  function handleCompleteChapter() {
    haptics.succes();

    // De telling gebeurt vóór `completeChapter`, want die zet state en `progress` is binnen deze
    // handler nog de oude waarde. Een `Set` in plaats van "+1": het hoofdstuk kan er al in zitten
    // als de knop op een of andere manier twee keer af gaat.
    const voltooidNa = new Set([...progress.completedChapters, chapterId]).size;
    const totaal = verhaal!.chapters.length;
    const meting = { story_id: verhaal!.id, era: verhaal!.tijdperkId, chapter_count: totaal };

    logStoryEvent(ANALYTICS_EVENTS.CHAPTER_COMPLETED, {
      ...meting,
      chapter_index: chapterId,
      chapters_done: voltooidNa,
      time_spent_seconds: secondenSinds(hoofdstukGestartOp.current),
    });

    // "Uitgelezen" is hier: het laatste hoofdstuk is af. Bewust een andere gebeurtenis dan
    // `char_unlocked` hieronder — tussen die twee zit een knop, en het verschil tussen de
    // aantallen is precies hoeveel lezers die knop niet indrukken.
    if (voltooidNa >= totaal) {
      logStoryEvent(ANALYTICS_EVENTS.STORY_FINISHED, meting);
    }

    progress.completeChapter(chapterId);
    // Een afgerond hoofdstuk is de enige actie die als "vandaag gelezen" telt (B6). Het openen
    // van een verhaal deed dat eerst ook, waardoor je een streak kon opbouwen zonder te lezen.
    voortgangStore.registreerLeesactiviteit();
    // Nú is het moment om naar notificatie-toestemming te vragen: er is net iets afgerond, dus
    // een herinnering betekent iets. Eén keer per installatie; de functie bewaakt dat zelf.
    biedHerinneringAan();
  }

  function handleNextChapter() {
    if (!isLastChapter && nextChapterUnlocked) {
      // `replace`, geen `push`: anders staan er na acht hoofdstukken acht readers op de stack en
      // loopt de terugknop ze allemaal langs in plaats van terug te gaan naar het overzicht.
      router.replace({
        pathname: '/verhaal/[id]/reader',
        params: { id: verhaal!.id, chapterId: String(chapterId + 1) },
      });
    }
  }

  function handleTerugNaarOverzicht() {
    // Terug in plaats van een nieuw overzicht bovenop de stack duwen. Nu "Next Chapter" met
    // `replace` werkt, ligt het hoofdstukoverzicht altijd één stap terug — behalve bij een
    // deeplink rechtstreeks naar de reader, en daar vangt `canGoBack()` het op.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({ pathname: '/verhaal/[id]/chapters', params: { id: verhaal!.id } });
  }

  function handleUnlockCharacter() {
    if (verhaal) {
      voortgangStore.markStoryCompleted(verhaal.id);
      characterStore.unlockCharacter(verhaal.id, verhaal.personage.naam);
      logStoryEvent(ANALYTICS_EVENTS.CHAR_UNLOCKED, {
        story_id: verhaal.id,
        era: verhaal.tijdperkId,
        character_name: verhaal.personage.naam,
        // +1 omdat `unlockCharacter` de state pas na deze render bijwerkt. `getTotalUnlocked()`
        // hier aanroepen zou het aantal van vóór deze ontgrendeling geven.
        total_unlocked: characterStore.getTotalUnlocked() + 1,
      });
      setShowUnlockModal(true);
    }
  }

  function handleCloseUnlockModal() {
    setShowUnlockModal(false);
    // De onderbreking komt ná het ontgrendelen, niet ervoor: het personage is de beloning voor
    // acht hoofdstukken, en daar hoort geen advertentie tussen te staan. Zonder onderbreking (Pro,
    // of de vlag uit) gaat het scherm meteen dicht, precies zoals daarvoor.
    if (toontOnderbreking) {
      setShowAdModal(true);
      return;
    }
    verlaatVerhaal();
  }

  function handleCloseAdModal() {
    setShowAdModal(false);
    verlaatVerhaal();
  }

  function verlaatVerhaal() {
    // Alles wat er voor dit verhaal op de stack ligt afpellen in plaats van Home er bovenop te
    // duwen; anders loopt de terugknop na het ontgrendelen weer door de reader heen.
    if (router.canDismiss()) {
      router.dismissAll();
      return;
    }
    router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/*
        De statusbalk-inset staat hier en niet op een `SafeAreaView`: het scherm heeft
        `headerShown: false`, dus zonder deze padding valt "Back to Chapters" onder de klok en de
        systeem-iconen — zichtbaar in drie van de acht store-screenshots (LAUNCH-PLAN.md, Fase 7).
      */}
      <View
        style={[styles.header, { backgroundColor: theme.background, paddingTop: insets.top + Spacing.three }]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleTerugNaarOverzicht}
            style={[styles.headerButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="arrow-back" size={16} color={theme.text} />
            <ThemedText type="smallBold">{t((s) => s.hoofdstuk.terugNaarOverzicht)}</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={[styles.voortgangsbalkTrack, { backgroundColor: theme.backgroundElement }]}>
        <Animated.View
          style={[
            styles.voortgangsbalkVulling,
            { backgroundColor: tijdperk?.kleur ?? theme.accent },
            voortgangsbalkStijl,
          ]}
        />
      </View>

      {/* Geen `scrollEventThrottle`: Reanimated levert de events zelf op de UI-thread aan. */}
      <Animated.ScrollView onScroll={scrollHandler} contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={styles.scrollHeader}
          entering={FadeInDown.duration(Motion.duration.normaal)}>
          <ThemedText type="small" themeColor="textSecondary">
            {t((s) => s.hoofdstuk.teller)(chapterId, verhaal.chapters.length)}
          </ThemedText>
          <ThemedText type="display">{v(chapter.titel)}</ThemedText>
        </Animated.View>

        <View style={styles.blokken}>
          {chapter.blokken.map((blok, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(staggerVertraging(index + 1)).duration(
                Motion.duration.normaal
              )}>
              <BlokWeergave blok={blok} tijdperkKleur={tijdperk?.kleur ?? theme.inactive} />
            </Animated.View>
          ))}
        </View>

        {/* De quiz, de peiling en het keuzepunt van dit hoofdstuk (Supabase). Staan ná de blokken
            en vóór de banner, en renderen `null` als er niets is of de verbinding ontbreekt — het
            hoofdstuk leest zonder ze precies zoals daarvoor. Ze blokkeren "Mark Complete" niet:
            dat is het verschil met het oude quizscherm, dat er als aparte route tussen stond. */}
        <InteractieveSectie
          verhaalId={verhaal.id}
          chapterId={chapterId}
          accent={tijdperk?.kleur ?? theme.accent}
        />

        <View style={styles.advertentie}>
          <AdBanner />
        </View>
      </Animated.ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        {/* `haptisch={false}` waar de knop zelf al een zwaardere haptic afvuurt (voltooien) of de
            modal dat doet (ontgrendelen) — anders voel je twee tikjes achter elkaar. */}
        {!progress.isChapterCompleted(chapterId) ? (
          <AnimatedPressable
            onPress={handleCompleteChapter}
            haptisch={false}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {t((s) => s.hoofdstuk.markeerVoltooid)}
            </ThemedText>
            <Ionicons name="checkmark-circle" size={16} color={theme.background} />
          </AnimatedPressable>
        ) : shouldShowUnlockButton ? (
          <AnimatedPressable
            onPress={handleUnlockCharacter}
            haptisch={false}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {t((s) => s.hoofdstuk.ontgrendelPersonage)(verhaal!.personage.naam)}
            </ThemedText>
            <Ionicons name="star" size={16} color={theme.background} />
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            onPress={handleNextChapter}
            disabled={isLastChapter}
            style={[
              styles.footerKnop,
              { backgroundColor: tijdperk?.kleur ?? theme.accent, flex: 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              {isLastChapter
                ? t((s) => s.hoofdstuk.allesVoltooid)
                : t((s) => s.hoofdstuk.volgende)}
            </ThemedText>
            <Ionicons
              name={isLastChapter ? 'checkmark-circle' : 'arrow-forward'}
              size={16}
              color={theme.background}
            />
          </AnimatedPressable>
        )}
      </View>

      <Modal visible={showUnlockModal} animationType="fade" transparent={true}>
        <CharacterUnlockModal
          personageNaam={verhaal?.personage.naam ?? 'Character'}
          personageImage={verhaal?.afbeelding}
          onClose={handleCloseUnlockModal}
        />
      </Modal>

      <AdModal visible={showAdModal} onClose={handleCloseAdModal} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  headerTop: {
    gap: Spacing.two,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.one,
  },
  voortgangsbalkTrack: {
    height: 3,
    width: '100%',
  },
  voortgangsbalkVulling: {
    height: 3,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  scrollHeader: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  blokken: {
    gap: Spacing.four,
  },
  advertentie: {
    marginTop: Spacing.four,
    marginHorizontal: -Spacing.four,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
