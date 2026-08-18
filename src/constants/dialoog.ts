/**
 * Bevestigings- en meldingsvensters die ook op web werken.
 *
 * `react-native-web` implementeert `Alert` niet: daar doet `Alert.alert(...)` stilletjes niets,
 * en dat is precies het soort knop-die-niets-doet dat je pas in de browser ontdekt. Deze twee
 * functies vallen op web terug op `window.confirm` / `window.alert`. Op Instellingen hangen er
 * een stuk of tien knoppen aan, dus de check hoort één keer hier te staan en niet per scherm.
 *
 * Zelfde afspraak als `haptics.ts`: intents, geen platform-API's, en niets dat kan gooien.
 */

import { Alert, Platform } from 'react-native';

export type BevestigOpties = {
  titel: string;
  tekst: string;
  /** Tekst op de knop die doorzet. */
  bevestigTekst: string;
  annuleerTekst: string;
  /** Rood in het systeemvenster (iOS). Voor uitloggen en verwijderen. */
  destructief?: boolean;
  onBevestig: () => void;
};

export function bevestig({
  titel,
  tekst,
  bevestigTekst,
  annuleerTekst,
  destructief = false,
  onBevestig,
}: BevestigOpties): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titel}\n\n${tekst}`)) onBevestig();
    return;
  }

  Alert.alert(titel, tekst, [
    { text: annuleerTekst, style: 'cancel' },
    { text: bevestigTekst, style: destructief ? 'destructive' : 'default', onPress: onBevestig },
  ]);
}

/** Eén mededeling met één OK-knop. */
export function meld(titel: string, tekst: string, okTekst: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${titel}\n\n${tekst}`);
    return;
  }

  Alert.alert(titel, tekst, [{ text: okTekst }]);
}
