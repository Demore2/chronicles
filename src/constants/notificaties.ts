import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';

// Dagelijkse leesherinnering (LAUNCH-PLAN.md B6). Zelfde afspraak als `haptics.ts`: dit bestand
// spreekt in bedoelingen ("plan de herinnering", "zet 'm uit"), niet in expo-notifications-API,
// en niets hierin mag een interactie kunnen breken.
//
// Drie dingen die de vorm bepalen:
//
// 1. **Web heeft dit niet.** `expo-notifications` levert daar geen planbare notificaties, dus
//    alle functies zijn daar een no-op die `false` teruggeeft in plaats van te gooien.
// 2. **Toestemming vragen is een moment, geen opstartstap.** Android 13+ vraagt POST_NOTIFICATIONS
//    aan de gebruiker, en dat mag je maar één keer nuttig doen: wie bij de eerste start weigert,
//    zie je niet meer terug. Daarom vraagt de app het pas ná het eerste afgeronde hoofdstuk —
//    zie `use-dagelijkse-herinnering.ts`.
// 3. **Eén vaste identifier.** Zonder identifier plant elke aanroep een tweede herinnering erbij;
//    met deze constante overschrijft een nieuwe planning de vorige. Dat is wat je wilt als de
//    gebruiker van taal wisselt en de tekst opnieuw gezet moet worden.

const ondersteund = Platform.OS === 'ios' || Platform.OS === 'android';

// Zonder handler laat het systeem een notificatie die binnenkomt terwijl de app open staat
// stilletjes vallen. Onwaarschijnlijk voor een herinnering om 19:00, maar "hij kwam niet" is
// precies de conclusie die je bij het testen trekt als dit ontbreekt. Geen geluid: dit is een
// zacht duwtje, geen alarm.
if (ondersteund) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Identifier van de geplande herinnering — één per toestel, altijd overschrijfbaar. */
export const HERINNERING_ID = 'dagelijkse-leesherinnering';

/** Android-kanaal. Verschijnt in de systeeminstellingen, dus de naam is gebruikerstekst. */
const KANAAL_ID = 'dagelijkse-herinnering';

/**
 * 19:00 lokale tijd — de **beginwaarde**, niet meer het vaste tijdstip.
 *
 * Bewust 's avonds: de app is een leesapp, en dit is het moment waarop je nog een hoofdstuk kunt
 * lezen vóór de dag (en de streak) om is. Wie er anders over denkt verzet hem in Instellingen; het
 * gekozen tijdstip staat in `notificatie-store` en komt via `useDagelijkseHerinnering` hier binnen.
 */
export const STANDAARD_HERINNERING_UUR = 19;
export const STANDAARD_HERINNERING_MINUUT = 0;

/** Oude namen, nog gebruikt door code van vóór het instelbare tijdstip. */
export const HERINNERING_UUR = STANDAARD_HERINNERING_UUR;
export const HERINNERING_MINUUT = STANDAARD_HERINNERING_MINUUT;

/** Het rooster van de kiezer: uren 0–23, minuten in stappen van vijf. */
export const HERINNERING_MINUUT_STAP = 5;

async function zorgVoorKanaal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(KANAAL_ID, {
    name: 'Daily reading reminder',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: Colors.light.accent,
    vibrationPattern: [0, 250],
  });
}

export const notificaties = {
  ondersteund,

  /** Is er al toestemming, zonder er een dialoog voor te openen? */
  async heeftToestemming(): Promise<boolean> {
    if (!ondersteund) return false;
    try {
      const status = await Notifications.getPermissionsAsync();
      return status.granted;
    } catch {
      return false;
    }
  },

  /**
   * Vraagt toestemming als die er nog niet is. Geeft terug of we uiteindelijk mogen sturen.
   * Roep dit alleen aan op een moment dat de gebruiker begrijpt waaróm het gevraagd wordt.
   */
  async vraagToestemming(): Promise<boolean> {
    if (!ondersteund) return false;
    try {
      const bestaand = await Notifications.getPermissionsAsync();
      if (bestaand.granted) return true;
      // `canAskAgain: false` betekent dat de gebruiker definitief geweigerd heeft; dan blijft het
      // systeemvenster leeg en zou de aanroep alleen maar tijd kosten.
      if (!bestaand.canAskAgain) return false;
      const gevraagd = await Notifications.requestPermissionsAsync();
      return gevraagd.granted;
    } catch {
      return false;
    }
  },

  /**
   * Plant (of herplant) de dagelijkse herinnering op het gegeven tijdstip. Geeft terug of het
   * gelukt is.
   *
   * Het tijdstip is een parameter en geen constante: de gebruiker kiest het in Instellingen. Door
   * de vaste `HERINNERING_ID` overschrijft elke nieuwe planning de vorige, dus een verzet tijdstip
   * levert geen tweede melding op — precies zoals bij een taalwissel.
   */
  async planDagelijkseHerinnering(
    titel: string,
    tekst: string,
    uur: number = STANDAARD_HERINNERING_UUR,
    minuut: number = STANDAARD_HERINNERING_MINUUT
  ): Promise<boolean> {
    if (!ondersteund) return false;
    try {
      await zorgVoorKanaal();
      await Notifications.scheduleNotificationAsync({
        identifier: HERINNERING_ID,
        content: { title: titel, body: tekst },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: KANAAL_ID,
          hour: uur,
          minute: minuut,
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  /** Zet de herinnering uit. Faalt stil — er is niets aan de hand als er niets gepland stond. */
  async annuleerDagelijkseHerinnering(): Promise<void> {
    if (!ondersteund) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(HERINNERING_ID);
    } catch {
      // Geen geplande notificatie met deze identifier: precies de gewenste eindtoestand.
    }
  },
};
