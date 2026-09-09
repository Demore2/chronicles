import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HistoraMark from '@/assets/images/mascotte/histora-mark.svg';
import { AuthKnop } from '@/components/auth-knop';
import { AuthVeld } from '@/components/auth-veld';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  MIN_WACHTWOORD_LENGTE,
  isGeldigEmail,
  wachtwoordSterkte,
  type Wachtwoordsterkte,
} from '@/constants/auth-validatie';
import { Radii, Spacing } from '@/constants/theme';
import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { logRegistreren } from '@/hooks/useAnalytics';
import { signup } from '@/hooks/useAuth';
import type { Vertalingen } from '@/i18n';

/** De meter leent de semantische kleuren uit `theme.ts`; hier staat alleen de koppeling. */
const STERKTE_KLEUR: Record<Wachtwoordsterkte, ThemeColor> = {
  zwak: 'gevaar',
  gemiddeld: 'waarschuwing',
  sterk: 'succes',
};

const STERKTE_LABEL: Record<Wachtwoordsterkte, (s: Vertalingen) => string> = {
  zwak: (s) => s.auth.sterkteZwak,
  gemiddeld: (s) => s.auth.sterkteGemiddeld,
  sterk: (s) => s.auth.sterkteSterk,
};

export default function SignupScreen() {
  const theme = useTheme();
  const { t } = useVertaling();

  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [gebruikersnaam, setGebruikersnaam] = useState('');
  const [akkoord, setAkkoord] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const sterkte = wachtwoordSterkte(wachtwoord);

  async function handleSignup() {
    if (!email.trim() || !wachtwoord || !gebruikersnaam.trim()) {
      setFout(t((s) => s.auth.foutAlleVelden));
      return;
    }
    if (!isGeldigEmail(email)) {
      setFout(t((s) => s.auth.foutEmailOngeldig));
      return;
    }
    if (wachtwoord.length < MIN_WACHTWOORD_LENGTE) {
      setFout(t((s) => s.auth.foutWachtwoordKort));
      return;
    }
    if (!akkoord) {
      setFout(t((s) => s.auth.foutVoorwaarden));
      return;
    }

    setFout(null);
    setMelding(null);
    setBezig(true);
    const resultaat = await signup(email, wachtwoord, gebruikersnaam.trim());
    setBezig(false);

    if (!resultaat.ok) {
      setFout(resultaat.error);
      return;
    }
    // Ook wanneer de bevestigingsmail nog moet worden geopend: het account bestáát op dit moment
    // (`signup()` gaf een user terug), en dat is wat `sign_up` meet. Pas hierna meten zou de
    // registraties structureel te laag zetten met precies de lezers die hun mail nooit openen —
    // en dat is nu juist het gat dat je wilt kunnen zien.
    logRegistreren('email');
    if (resultaat.bevestigingNodig) {
      // E-mailbevestiging staat aan in Supabase: er is nog geen sessie, dus doorsturen zou
      // een lege app opleveren. De gebruiker blijft hier met de instructie in beeld.
      setMelding(t((s) => s.auth.bevestigMail)(email.trim()));
      return;
    }
    router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.kop}>
              <HistoraMark width={40} height={40} />
              <ThemedText type="title">{t((s) => s.auth.signupTitel)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t((s) => s.auth.signupOndertitel)}
              </ThemedText>
            </View>

            {fout !== null && (
              <View style={[styles.berichtvak, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.gevaar} />
                <ThemedText type="small" themeColor="gevaar" style={styles.berichtTekst}>
                  {fout}
                </ThemedText>
              </View>
            )}

            {melding !== null && (
              <View style={[styles.berichtvak, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="mail-outline" size={18} color={theme.succes} />
                <ThemedText type="small" themeColor="succes" style={styles.berichtTekst}>
                  {melding}
                </ThemedText>
              </View>
            )}

            <AuthVeld
              label={t((s) => s.auth.gebruikersnaam)}
              value={gebruikersnaam}
              onChangeText={setGebruikersnaam}
              placeholder={t((s) => s.auth.gebruikersnaamPlaceholder)}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              textContentType="username"
              editable={!bezig}
              returnKeyType="next"
            />

            <AuthVeld
              label={t((s) => s.auth.email)}
              value={email}
              onChangeText={setEmail}
              placeholder={t((s) => s.auth.emailPlaceholder)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!bezig}
              returnKeyType="next"
            />

            <AuthVeld
              label={t((s) => s.auth.wachtwoord)}
              value={wachtwoord}
              onChangeText={setWachtwoord}
              placeholder={t((s) => s.auth.wachtwoordPlaceholder)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!bezig}
              returnKeyType="go"
              onSubmitEditing={() => void handleSignup()}
              hint={
                wachtwoord.length > 0 ? (
                  <View style={styles.sterkteRij}>
                    <View
                      style={[styles.sterkteStip, { backgroundColor: theme[STERKTE_KLEUR[sterkte]] }]}
                    />
                    <ThemedText type="caption" themeColor="textSecondary">
                      {t((s) => s.auth.sterkte)}:{' '}
                      <ThemedText type="caption" themeColor={STERKTE_KLEUR[sterkte]}>
                        {t(STERKTE_LABEL[sterkte])}
                      </ThemedText>
                    </ThemedText>
                  </View>
                ) : undefined
              }
            />

            <Pressable
              onPress={() => setAkkoord((huidig) => !huidig)}
              disabled={bezig}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: akkoord }}
              style={styles.akkoordRij}>
              <Ionicons
                name={akkoord ? 'checkbox' : 'square-outline'}
                size={20}
                color={akkoord ? theme.accent : theme.inactive}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.akkoordTekst}>
                {t((s) => s.auth.voorwaarden)}
              </ThemedText>
            </Pressable>

            <AuthKnop
              label={t((s) => s.auth.registreren)}
              onPress={() => void handleSignup()}
              bezig={bezig}
            />

            <View style={styles.wisselRij}>
              <ThemedText type="small" themeColor="textSecondary">
                {t((s) => s.auth.welAccount)}
              </ThemedText>
              <Pressable
                onPress={() => router.replace('/login')}
                accessibilityRole="link"
                disabled={bezig}>
                <ThemedText type="linkPrimary">{t((s) => s.auth.naarLogin)}</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  kop: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  berichtvak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.small,
    marginBottom: Spacing.three,
  },
  berichtTekst: {
    flex: 1,
  },
  sterkteRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sterkteStip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  akkoordRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  akkoordTekst: {
    flex: 1,
  },
  wisselRij: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
