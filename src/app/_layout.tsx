import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  router,
  useRootNavigationState,
  useSegments,
} from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppHeader } from '@/components/app-header';
import { SplashScreen } from '@/components/splash-screen';
import { AchievementUnlockModal } from '@/components/achievement-unlock-modal';
import { PrestatieMelding } from '@/components/prestatie-melding';
import { useDagelijkseHerinnering } from '@/hooks/use-dagelijkse-herinnering';
import { usePrestaties } from '@/hooks/use-prestaties';
import { usePushRegistratie } from '@/hooks/use-push-registratie';
import { useStreakHerinnering } from '@/hooks/use-streak-herinnering';
import { useEffectieveKleurenSchema, useTheme } from '@/hooks/use-theme';
import { useVoortgangSync } from '@/hooks/use-voortgang-sync';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';

/** De routes die je zonder sessie mag zien. Alles daarbuiten stuurt de poort naar /login. */
const AUTH_ROUTES = ['login', 'signup'];

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const kleurenSchema = useEffectieveKleurenSchema();

  // Eén plek die de dagelijkse herinnering plant of annuleert (B6). Hij vraagt hier niets aan de
  // gebruiker — dat gebeurt pas na het eerste afgeronde hoofdstuk.
  useDagelijkseHerinnering();

  // De enige `useAuth()` van de app: hij zet de sessie-listener op en houdt de auth-store gelijk
  // met Supabase. De schermen gebruiken de losse `login`/`signup`/`logout` functies.
  const { isLoading } = useAuth();

  // Even zo: de enige plek die voortgang met Supabase synchroniseert (deel 3). Hij haalt op bij
  // een nieuwe sessie en probeert het opnieuw zodra het netwerk of de app terugkomt.
  useVoortgangSync();

  // En de enige plek die Firebase Analytics aanstuurt: hij past de opgeslagen toestemming toe,
  // koppelt de metingen aan de ingelogde gebruiker en meldt elke schermwissel. Losse
  // gebeurtenissen staan in de schermen zelf. Hij moet ná `useAuth()` staan, zodat de sessie al
  // in de store zit wanneer hij het gebruiker-id doorgeeft.
  useAnalytics();

  // De laatste twee bewoners van de root layout, om dezelfde reden als de vier hierboven: er is
  // per taak precies één plek die hem uitvoert.
  //
  // `useStreakHerinnering()` plant de lokale waarschuwing dat je reeks vanavond afloopt — geen
  // server, geen FCM. `usePushRegistratie()` doet de FCM-kant: het toestel registreren, luisteren
  // of het token vernieuwt, en een tik op een melding omzetten in een navigatie. Zonder
  // `google-services.json` doet die tweede niets en klaagt hij niet (zie `lib/push.ts`).
  useStreakHerinnering();
  usePushRegistratie();

  // En de mijlpalen: hij meet de vier tellers en kondigt een nieuwe mijlpaal aan — als strook in
  // de app wanneer je kijkt, als melding wanneer je dat niet doet. Staat ná `usePushRegistratie()`
  // omdat die de Android-kanalen aanmaakt, en `prestatie` is er daar één van.
  usePrestaties();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={kleurenSchema === 'dark' ? DarkTheme : DefaultTheme}>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        {/* Zolang de sessie nog niet is gecontroleerd mag er niets van de app te zien zijn: anders
            flitst Home voorbij voordat de poort naar /login stuurt. */}
        {!showSplash && isLoading && <SessieLaadscherm />}
        <AuthPoort />
        {/* Boven de Stack, zodat de strook op elk scherm kan verschijnen. Hij vangt zelf geen
            aanrakingen buiten zijn eigen kader (`pointerEvents="box-none"`). */}
        <PrestatieMelding />
        {/* Het venster achter de strook en achter elke tegel in het raster op Voortgang. Het staat
            hier en niet in het raster, omdat de strook — die hierboven hangt — er ook naartoe
            leidt; twee kopieën zouden op elkaar kunnen stapelen. Het rendert `null` zolang er
            niets is aangetikt. */}
        <AchievementUnlockModal />
        <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          {/* Instellingen en de avatarkiezer horen bij de Profiel-tab, maar staan als
              stack-scherm *naast* de tabbladen — net als `verhaal/[id]`. Ze konden geen
              `(tabs)/profiel/settings.tsx` worden: dan zou `(tabs)/profiel.tsx` (dat niet
              verwijderd mag worden, zie CLAUDE.md) dezelfde route `/profiel` opeisen.
              De titels zetten de schermen zelf, zodat ze vertaald meebewegen. */}
          <Stack.Screen name="profiel/settings" />
          <Stack.Screen name="profiel/upload-avatar" options={{ presentation: 'modal' }} />
          {/* Grafsteen: het dev-dashboard is eruit gehaald. Niets linkt hierheen; de route blijft
              bestaan omdat het bestand blijft bestaan (zie CLAUDE.md, "File deletion"). */}
          <Stack.Screen name="profiel/analytics" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * De auth-poort (R8.AUTH deel 2).
 *
 * Rendert niets — hij kijkt alleen of de huidige route bij de sessie past en corrigeert met een
 * `replace`. Bewust een omleiding en geen twee losse navigators: Expo Router is file-based, dus
 * de routeboom staat al vast; een tweede `<Stack>` naast deze zou dezelfde bestanden nog een keer
 * registreren. Zo blijft ook een deeplink naar /verhaal/... afgeschermd.
 */
function AuthPoort() {
  // Leest de store rechtstreeks in plaats van `useAuth()`: die hook zet ook de sessie-listener
  // op en die hoort maar één keer te draaien (hierboven, in RootLayout).
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const segments = useSegments();
  // Zonder gemonteerde navigator gooit `replace()` "Attempted to navigate before mounting the
  // Root Layout component" — deze key is er pas als de boom staat.
  const navigatieKlaar = useRootNavigationState()?.key !== undefined;

  useEffect(() => {
    if (isLoading || !navigatieKlaar) return;

    const opAuthScherm = AUTH_ROUTES.includes(segments[0] ?? '');
    if (!user && !opAuthScherm) {
      router.replace('/login');
    } else if (user && opAuthScherm) {
      router.replace('/');
    }
  }, [user, isLoading, navigatieKlaar, segments]);

  return null;
}

/** Effen scherm over de app terwijl `getSession()` uit AsyncStorage leest. */
function SessieLaadscherm() {
  const theme = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, styles.laadscherm, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  laadscherm: {
    alignItems: 'center',
    justifyContent: 'center',
    // Boven de Stack, onder de splash.
    zIndex: 1,
  },
});
