import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Kroniekschrijver from '@/assets/images/mascotte/01-kroniekschrijver-simpel.svg';
import { CharacterGrid } from '@/components/character-grid';
import { SectieKop } from '@/components/sectie-kop';
import { SyncIndicator } from '@/components/sync-indicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PRIVACY_BELEID_URL, privacyBeleidIsGepubliceerd } from '@/constants/juridisch';
import { notificaties } from '@/constants/notificaties';
import { Radii, Spacing } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { logout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { taalCodes, taalNamen } from '@/i18n/taal-namen';
import { verhalen } from '@/content/verhalen';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { useNotificatieStore } from '@/store/notificatie-store';
import { telVoltooideHoofdstukken, useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';
import { useThemaStore, type ThemaVoorkeur } from '@/store/thema-store';

const THEMA_OPTIES: { waarde: ThemaVoorkeur; icoonNaam: IoniconNaam }[] = [
  { waarde: 'licht', icoonNaam: 'sunny-outline' },
  { waarde: 'donker', icoonNaam: 'moon-outline' },
  { waarde: 'systeem', icoonNaam: 'phone-portrait-outline' },
];

const THEMA_LABEL_SLEUTEL = {
  licht: 'themaLicht',
  donker: 'themaDonker',
  systeem: 'themaSysteem',
} as const;

const SHOW_LANGUAGE_PICKER = false;

export default function ProfielScreen() {
  const theme = useTheme();
  const { t, taal, setTaal } = useVertaling();
  const themaVoorkeur = useThemaStore((state) => state.themaVoorkeur);
  const setThemaVoorkeur = useThemaStore((state) => state.setThemaVoorkeur);
  const characterStore = useCharacterUnlockStore();
  const voortgangStore = useVoortgangStore();
  const hoofdstukVoortgang = useStoryProgressStore((state) => state.progress);
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  const setHerinnering = useNotificatieStore((state) => state.setHerinnering);
  const markeerToestemmingGevraagd = useNotificatieStore((state) => state.markeerToestemmingGevraagd);
  const user = useAuthStore((state) => state.user);
  const authProfiel = useAuthStore((state) => state.profiel);
  const [uitlogBezig, setUitlogBezig] = useState(false);

  const totalCharacters = verhalen.length;
  const charactersUnlocked = characterStore.getTotalUnlocked();
  const unlockedCharacters = characterStore.unlockedCharacters;
  // Was `voortgangStore.bekekenIds.size` — geopende verhalen, niet afgeronde hoofdstukken (B6).
  const chaptersRead = useMemo(() => telVoltooideHoofdstukken(hoofdstukVoortgang), [hoofdstukVoortgang]);
  const storiesCompleted = voortgangStore.completedStories.size;

  async function zetHerinnering(aan: boolean) {
    if (!aan) {
      setHerinnering(false);
      return;
    }
    // Aanzetten kan alleen als het systeem het toestaat. Zegt de gebruiker (of een eerdere
    // weigering) nee, dan blijft de schakelaar uit staan in plaats van iets te beloven wat de
    // app niet kan waarmaken. Het plannen zelf doet `useDagelijkseHerinnering`.
    const toegestaan = await notificaties.vraagToestemming();
    markeerToestemmingGevraagd();
    setHerinnering(toegestaan);
  }

  async function voerUitloggenUit() {
    setUitlogBezig(true);
    await logout();
    // Bewust geen `router.replace` hier: de auth-poort in de root layout ziet `user === null`
    // en stuurt naar /login. Eén plek die dat besluit neemt, anders vechten twee navigaties.
    // `uitlogBezig` blijft staan — dit scherm verdwijnt meteen daarna.
  }

  function bevestigUitloggen() {
    const titel = t((s) => s.auth.uitlogTitel);
    const tekst = t((s) => s.auth.uitlogTekst);

    // react-native-web implementeert `Alert` niet, dus daar zou de knop stil niets doen.
    if (Platform.OS === 'web') {
      if (window.confirm(`${titel}\n\n${tekst}`)) void voerUitloggenUit();
      return;
    }

    Alert.alert(titel, tekst, [
      { text: t((s) => s.auth.annuleren), style: 'cancel' },
      {
        text: t((s) => s.auth.uitloggen),
        style: 'destructive',
        onPress: () => void voerUitloggenUit(),
      },
    ]);
  }

  function openPrivacybeleid() {
    // Zelfde afspraak als bij haptics: een toestel zonder bruikbare browser mag de interactie
    // niet laten klappen.
    WebBrowser.openBrowserAsync(PRIVACY_BELEID_URL).catch(() => {});
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <ThemedText type="display">{t((s) => s.profiel.titel)}</ThemedText>
            {/*
              De Kroniekschrijver staat hier voorlopig zonder functie — dit is de plek
              waar straks de begroeting of de dagelijkse quiz aan komt te hangen. Zijn
              kleuren staan vast (teal/crème/inkt) in plaats van op `useTheme()`: het is
              een illustratie met drie kleuren, net als de portretten, en beide tinten
              houden genoeg contrast op het lichte én het donkere thema.
            */}
            <View style={[styles.mascotte, { backgroundColor: theme.backgroundElement }]}>
              <Kroniekschrijver width={52} height={52} />
            </View>
          </View>

          <View style={[styles.statsBox, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {chaptersRead}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.chaptersRead)(chaptersRead)}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {charactersUnlocked}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.charactersUnlocked)(charactersUnlocked)}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {storiesCompleted}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.storiesCompleted)(storiesCompleted)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={`${t((s) => s.profiel.characterCollection)} (${charactersUnlocked} of ${totalCharacters})`} />
            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <CharacterGrid unlockedCharacters={unlockedCharacters} totalCharacters={totalCharacters} />
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.profiel.instellingen)} />
            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">{t((s) => s.profiel.thema)}</ThemedText>
              <View style={styles.themaRij}>
                {THEMA_OPTIES.map((optie) => {
                  const actief = themaVoorkeur === optie.waarde;
                  return (
                    <Pressable
                      key={optie.waarde}
                      onPress={() => setThemaVoorkeur(optie.waarde)}
                      style={[
                        styles.themaKnop,
                        { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                      ]}>
                      <Ionicons name={optie.icoonNaam} size={20} color={actief ? theme.background : theme.text} />
                      <ThemedText type="small" style={{ color: actief ? theme.background : theme.text }}>
                        {t((s) => s.profiel[THEMA_LABEL_SLEUTEL[optie.waarde]])}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/*
              De dagelijkse herinnering (B6). Alleen op een toestel dat notificaties kan plannen —
              op web bestaat de schakelaar niet, in plaats van een schakelaar die niets doet.
            */}
            {notificaties.ondersteund && (
              <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.schakelaarRij}>
                  <View style={styles.schakelaarTekst}>
                    <ThemedText type="smallBold">{t((s) => s.profiel.herinnering)}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {t((s) => s.profiel.herinneringUitleg)}
                    </ThemedText>
                  </View>
                  <Switch
                    value={herinneringAan}
                    onValueChange={zetHerinnering}
                    trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
                    thumbColor={theme.background}
                  />
                </View>
              </View>
            )}

            {SHOW_LANGUAGE_PICKER && (
              <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">{t((s) => s.profiel.taal)}</ThemedText>
                <View style={styles.taalRij}>
                  {taalCodes.map((code) => {
                    const actief = taal === code;
                    return (
                      <Pressable
                        key={code}
                        onPress={() => setTaal(code)}
                        style={[
                          styles.taalKnop,
                          { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                        ]}>
                        <ThemedText type="small" style={{ color: actief ? theme.background : theme.text }}>
                          {taalNamen[code]}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/*
            Play vereist een privacybeleid-link, ook voor een app die niets verzamelt (A5).
            De sectie blijft verborgen zolang `PRIVACY_BELEID_URL` nog de placeholder is, zodat
            een release nooit een dode link toont.
          */}
          {privacyBeleidIsGepubliceerd && (
            <View style={styles.sectie}>
              <SectieKop titel={t((s) => s.profiel.over)} />
              <Pressable
                onPress={openPrivacybeleid}
                accessibilityRole="link"
                style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.linkRij}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={theme.accent} />
                  <ThemedText type="smallBold" style={styles.linkTekst}>
                    {t((s) => s.profiel.privacybeleid)}
                  </ThemedText>
                  <Ionicons name="open-outline" size={16} color={theme.textSecondary} />
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.privacybeleidUitleg)}
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/*
            Account + uitloggen (R8.AUTH deel 2). Onderaan, want het is de zeldzaamste actie op
            dit scherm — en de enige die je uit de app zet.
          */}
          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.auth.account)} />
            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.accountRij}>
                <View style={[styles.accountAvatar, { backgroundColor: theme.backgroundSelected }]}>
                  <Ionicons name="person-outline" size={20} color={theme.accent} />
                </View>
                <View style={styles.accountTekst}>
                  <ThemedText type="smallBold">
                    {authProfiel?.username ?? user?.email ?? ''}
                  </ThemedText>
                  {authProfiel?.username && user?.email ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {user.email}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
              {/* Synchronisatiestatus (deel 3) — onder het account, want dat is waar de voortgang
                  naartoe gaat, en boven de uitlogknop, zodat je hem ziet vóór je uitlogt. */}
              <SyncIndicator />
              <Pressable
                onPress={bevestigUitloggen}
                disabled={uitlogBezig}
                accessibilityRole="button"
                style={[styles.uitlogKnop, { borderColor: theme.gevaar }]}>
                <Ionicons name="log-out-outline" size={18} color={theme.gevaar} />
                <ThemedText type="smallBold" themeColor="gevaar">
                  {t((s) => s.auth.uitloggen)}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  mascotte: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statsBox: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.three,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectie: {
    gap: Spacing.three,
  },
  kaart: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
    gap: Spacing.three,
  },
  themaRij: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themaKnop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  schakelaarRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  schakelaarTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  taalRij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  taalKnop: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
  linkRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  linkTekst: {
    flex: 1,
  },
  accountRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  uitlogKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
    // Omlijnd in plaats van gevuld: rood vlak trekt op dit scherm meer aandacht dan uitloggen
    // verdient, maar de rand maakt wel duidelijk dat het geen gewone instelling is.
    borderWidth: 1,
  },
});
