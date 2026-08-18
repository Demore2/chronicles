import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ANALYTICS_EIGENSCHAP, ANALYTICS_GEBEURTENIS } from '@/constants/analytics';
import { Spacing } from '@/constants/theme';
import { analytics } from '@/lib/analytics';
import { useAnalyticsStore } from '@/store/analytics-store';

/**
 * Het analytics-dashboard (`/profiel/analytics`) — **een ontwikkelaarsscherm**.
 *
 * Twee dingen die het bewust *niet* is:
 *
 * 1. **Geen cijfers.** Firebase heeft geen API waarmee een app zijn eigen DAU of retentie kan
 *    opvragen; dat loopt via de Google Analytics Data API, die een serviceaccount vereist en dus
 *    een sleutel in de bundel zou betekenen. Dezelfde afweging als bij het genereren van
 *    interactieve content (zie `scripts/seed/interactief/README.md`). Wat dit scherm wél kan is
 *    de vraag beantwoorden die je hier komt stellen: *komt er iets aan, en zo nee, waarom niet?*
 * 2. **Geen scherm voor lezers.** Het staat achter `__DEV__`, net als de "Simulate Pro"-schakelaar
 *    — een lijst met console.firebase.google.com-links hoort niet in een release. Om die reden
 *    staat de tekst hier ook hardgecodeerd in het Engels en niet in `src/i18n`: er is geen lezer
 *    die dit vertaald moet krijgen.
 *
 * De route is in `_layout.tsx` geregistreerd; de enige ingang is de dev-regel onderaan
 * Instellingen.
 */
export default function AnalyticsDashboardScreen() {
  const toestemming = useAnalyticsStore((state) => state.toestemming);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  const beschikbaar = analytics.beschikbaar;
  const projectId = analytics.projectId;

  useEffect(() => {
    let afgebroken = false;
    analytics.instanceId().then((id) => {
      if (!afgebroken) setInstanceId(id);
    });
    return () => {
      afgebroken = true;
    };
  }, []);

  function openConsole(pad: string) {
    const basis = projectId
      ? `https://console.firebase.google.com/project/${projectId}`
      : 'https://console.firebase.google.com';
    WebBrowser.openBrowserAsync(`${basis}${projectId ? pad : ''}`).catch(() => {});
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics (dev)' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* De diagnose staat bovenaan omdat dit de vraag is waarvoor je hier komt. "Available"
            is `false` op web en in elke dev-client die van vóór de Firebase-toevoeging is —
            precies de twee gevallen waarin je anders naar een leeg dashboard zit te kijken en
            de fout in de code gaat zoeken. */}
        <SettingsSectie
          titel="Status"
          voet={
            beschikbaar
              ? 'Events reach Firebase from this build. The console lags 1-2 minutes in DebugView and up to 24h in the standard reports.'
              : 'The native Firebase module is not in this build. On web that is expected; on a device it means the dev client predates the Firebase install and needs `npx expo run:android` again.'
          }>
          <SettingsItem
            icoon={beschikbaar ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            label="Native module"
            waarde={beschikbaar ? 'Available' : 'Not available'}
            isGevaar={!beschikbaar}
          />
          <SettingsItem
            icoon="shield-checkmark-outline"
            label="Collection consent"
            uitleg="The reader's switch under Settings › Privacy."
            waarde={toestemming ? 'On' : 'Off'}
          />
          <SettingsItem icoon="cube-outline" label="Firebase project" waarde={projectId ?? '—'} />
          <SettingsItem
            icoon="finger-print-outline"
            label="App instance ID"
            uitleg="Match this against DebugView to find your own device."
            waarde={instanceId ?? '—'}
          />
        </SettingsSectie>

        <SettingsSectie
          titel="Console"
          voet={
            projectId
              ? undefined
              : 'Without a project ID these open the console root — pick the project by hand.'
          }>
          <SettingsItem
            icoon="pulse-outline"
            label="Realtime"
            onPress={() => openConsole('/analytics/app/android:com.chronicles.historyapp/realtime')}
          />
          <SettingsItem
            icoon="bug-outline"
            label="DebugView"
            uitleg="Needs `adb shell setprop debug.firebase.analytics.app com.chronicles.historyapp`."
            onPress={() => openConsole('/analytics/app/android:com.chronicles.historyapp/debugview')}
          />
          <SettingsItem
            icoon="list-outline"
            label="Events"
            onPress={() => openConsole('/analytics/app/android:com.chronicles.historyapp/events')}
          />
          <SettingsItem
            icoon="people-outline"
            label="Retention"
            onPress={() => openConsole('/analytics/app/android:com.chronicles.historyapp/retention')}
          />
        </SettingsSectie>

        {/* Wat er verstuurd wordt, uit de constantentabel zelf gelezen. Een overgetypte lijst zou
            uit de pas gaan lopen met `constants/analytics.ts` op de dag dat er een gebeurtenis
            bijkomt, en dan is dit scherm erger dan geen scherm. */}
        <SettingsSectie
          titel={`Events (${Object.keys(ANALYTICS_GEBEURTENIS).length})`}
          voet="Plus Firebase's own `login`, `sign_up` and `screen_view`, which are reserved names.">
          {Object.values(ANALYTICS_GEBEURTENIS).map((naam) => (
            <SettingsItem key={naam} icoon="ellipse-outline" label={naam} />
          ))}
        </SettingsSectie>

        <SettingsSectie titel="User properties">
          {Object.values(ANALYTICS_EIGENSCHAP).map((naam) => (
            <SettingsItem key={naam} icoon="pricetag-outline" label={naam} />
          ))}
        </SettingsSectie>

        <ThemedText type="small" themeColor="textSecondary" style={styles.voetnoot}>
          DAU, retention curves and session length are computed by Firebase itself and are only
          readable in the console — the app has no key to query them with, on purpose.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  voetnoot: {
    paddingHorizontal: Spacing.four,
  },
});
