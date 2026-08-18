import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { LegeStaat } from '@/components/lege-staat';
import { ThemedView } from '@/components/themed-view';

/**
 * Grafsteen — het analytics-dashboard is eruit gehaald.
 *
 * Hier stond een `__DEV__`-scherm dat vier dingen toonde: of de native Firebase-module in deze
 * build zat, of de lezer toestemming had gegeven, het projectid uit `google-services.json` en het
 * app-instance-id (om je eigen toestel in DebugView terug te vinden). Het toonde bewust géén
 * cijfers: Firebase heeft geen API waarmee een app zijn eigen DAU kan opvragen — dat loopt via de
 * Google Analytics Data API met een serviceaccount, en die sleutel hoort niet in een bundel.
 *
 * Het is verwijderd omdat de cijfers in de Firebase Console horen. **Let op wat daarmee wegvalt:**
 * de vraag "waarom zie ik niets in Firebase?" wordt in verreweg de meeste gevallen beantwoord met
 * "de dev-client is nog niet opnieuw gebouwd na het toevoegen van Firebase" of "je kijkt op web",
 * en dat is precies wat dit scherm in één regel liet zien. Zonder scherm is de vervanging:
 * `analytics.beschikbaar` uit `src/lib/analytics.ts` in een console-regel, of de waarschuwing die
 * die module zelf één keer logt.
 *
 * Het bestand blijft staan omdat verwijderen in dit project geblokkeerd is (zie CLAUDE.md,
 * "File deletion"); het is dezelfde grafsteen-afspraak als `verhaal/[id]/quiz.tsx`.
 */
export default function AnalyticsDashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics verwijderd' }} />
      <LegeStaat
        titel="Analytics verwijderd"
        beschrijving="De cijfers staan in de Firebase Console."
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
