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

/** Idem voor de streakwaarschuwing. Apart, zodat de twee elkaar niet overschrijven. */
export const STREAK_HERINNERING_ID = 'streak-loopt-af';

/**
 * Het tijdstip van de streakwaarschuwing: 20:30 lokale tijd.
 *
 * Later dan de standaard dagelijkse herinnering (19:00) en met opzet: dit is het *laatste* duwtje
 * van de dag, niet het eerste. Wie om 19:00 al een herinnering kreeg en toen niet las, heeft om
 * half negen nog anderhalf uur — genoeg voor een hoofdstuk van vijf minuten, en niet zo laat dat
 * de melding iemand uit zijn slaap houdt.
 */
export const STREAK_HERINNERING_UUR = 20;
export const STREAK_HERINNERING_MINUUT = 30;

/**
 * Android-kanalen. Ze verschijnen in de systeeminstellingen, dus de namen zijn gebruikerstekst.
 *
 * **Drie kanalen en niet één**, omdat een kanaal precies de knop is waarmee de lezer één sóórt
 * melding uitzet zonder de rest te verliezen. Alles op één kanaal betekent: wie de win-back-push
 * te veel vindt, verliest ook zijn dagelijkse herinnering.
 *
 * `KANAAL_TERUGKEER` moet bestaan vóórdat er een FCM-push aankomt die ernaar verwijst
 * (`channel_id: 'terugkeer'` in `supabase/functions/send-push`). Android maakt een onbekend
 * kanaal niet aan maar valt terug op het standaardkanaal, en dát kanaal kan de lezer niet apart
 * uitzetten. Vandaar `zorgVoorKanalen()` bij het opstarten.
 */
const KANAAL_ID = 'dagelijkse-herinnering';
const KANAAL_STREAK = 'streak';
const KANAAL_TERUGKEER = 'terugkeer';

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

/**
 * Maakt alle drie de kanalen aan. Roep dit één keer aan bij het opstarten (root layout).
 *
 * Idempotent: `setNotificationChannelAsync` werkt een bestaand kanaal bij in plaats van een
 * tweede aan te maken. Let op dat Android wijzigingen aan de *importance* van een bestaand kanaal
 * negeert zodra de lezer er zelf aan gezeten heeft — dat is opzet, niet een bug hier.
 */
export async function zorgVoorKanalen(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await zorgVoorKanaal();
    await Notifications.setNotificationChannelAsync(KANAAL_STREAK, {
      name: 'Streak reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: Colors.light.accent,
      vibrationPattern: [0, 120, 80, 120],
    });
    await Notifications.setNotificationChannelAsync(KANAAL_TERUGKEER, {
      name: 'Reading suggestions',
      // Bewust LOW: dit is de enige categorie die de lezer niet zelf heeft aangevraagd, dus hij
      // komt binnen zonder geluid. Wie hem toch te veel vindt zet het kanaal uit; wie hem waardeert
      // merkt het verschil niet.
      importance: Notifications.AndroidImportance.LOW,
      lightColor: Colors.light.accent,
    });
  } catch {
    // Kanalen zijn een vriendelijkheid, geen voorwaarde. Mislukt het, dan gebruikt Android zijn
    // standaardkanaal en werkt alles verder gewoon.
  }
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

  /**
   * Plant de streakwaarschuwing op één bepaald moment.
   *
   * **Waarom dit een losse datum is en geen dagelijkse trigger.** Een `DAILY`-trigger gaat élke
   * avond af, ook op de avonden dat je allang gelezen hebt — precies het soort melding waarna
   * mensen alle meldingen uitzetten. Deze wordt dus per keer gezet en weer weggehaald zodra de
   * streak veilig is; `use-streak-herinnering.ts` rekent uit wanneer dat is.
   *
   * De vaste `STREAK_HERINNERING_ID` doet hetzelfde als bij de dagelijkse herinnering: een nieuwe
   * planning overschrijft de vorige, dus herhaald herplannen stapelt niets op.
   *
   * Ligt `wanneer` in het verleden, dan plant expo-notifications hem meteen af — vandaar de
   * controle hier: een waarschuwing dat je streak "vanavond" afloopt hoort niet om drie uur
   * 's nachts alsnog binnen te komen.
   */
  async planStreakHerinnering(titel: string, tekst: string, wanneer: Date): Promise<boolean> {
    if (!ondersteund) return false;
    if (wanneer.getTime() <= Date.now()) return false;
    try {
      await zorgVoorKanalen();
      await Notifications.scheduleNotificationAsync({
        identifier: STREAK_HERINNERING_ID,
        content: { title: titel, body: tekst, data: { soort: 'streak' } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: KANAAL_STREAK,
          date: wanneer,
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  /** Haalt de streakwaarschuwing weg. Faalt stil als er niets gepland stond. */
  async annuleerStreakHerinnering(): Promise<void> {
    if (!ondersteund) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(STREAK_HERINNERING_ID);
    } catch {
      // Niets gepland is precies de gewenste eindtoestand.
    }
  },

  /**
   * Toont nu meteen een melding, zonder server en zonder FCM.
   *
   * De aanroeper is `use-push-registratie.ts`, voor een FCM-push die binnenkomt terwijl de app
   * open staat: Android toont die zelf niet, FCM levert hem alleen aan de code af. Zonder dit
   * lijkt het of de melding niet aankwam terwijl hij netjes bezorgd is.
   */
  async toonNu(
    titel: string,
    tekst: string,
    opties?: { kanaal?: 'streak' | 'terugkeer'; data?: Record<string, string> }
  ): Promise<boolean> {
    if (!ondersteund) return false;
    try {
      await zorgVoorKanalen();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titel,
          body: tekst,
          data: opties?.data ?? {},
          ...(Platform.OS === 'android'
            ? { channelId: opties?.kanaal ?? KANAAL_STREAK }
            : {}),
        },
        // `null` = nu. Geen trigger-object met een tijd van 0: dat is een *geplande* notificatie
        // met een lege planning, en expo-notifications behandelt dat niet als "meteen".
        trigger: null,
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
