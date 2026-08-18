import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STANDAARD_HERINNERING_MINUUT, STANDAARD_HERINNERING_UUR } from '@/constants/notificaties';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

/**
 * De tijdzone van dít toestel als IANA-naam ("Europe/Amsterdam").
 *
 * De server heeft die nodig om 19:00 *lokaal* te kunnen bedoelen. Bewust de naam en niet het
 * minutenverschil: een offset die in maart is opgeslagen klopt in juli niet meer, en dan komt de
 * melding een uur te vroeg. Postgres kent de zomertijdregels, wij hoeven ze niet na te rekenen.
 */
export function huidigeTijdzone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * De drie push-categorieën die de lezer los kan aan- en uitzetten, náást de dagelijkse
 * herinnering.
 *
 * **Twee ervan staan standaard uit**, en dat is dezelfde afweging als bij `email-voorkeur-store`:
 * een win-back of een aanbeveling is een bericht dat de lezer niet gevraagd heeft, en de AVG kent
 * geen geldige toestemming die je al aangevinkt aantreft.
 *
 * `streakAan` staat wél aan, en dat is verdedigbaar om drie redenen: hij gaat over iets dat de
 * lezer zélf heeft opgebouwd, hij vertrekt nooit van het toestel (expo-notifications, geen FCM),
 * en hij kan alleen afgaan als er al toestemming voor meldingen is gegeven — dát is hier de
 * toestemming, niet dit vinkje. Zonder streak gebeurt er sowieso niets.
 */
export const STANDAARD_PUSH_VOORKEUREN = {
  /** Win-back-push vanaf de server: "je hoofdstuk staat nog open". */
  terugkeerAan: false,
  /** Aanbeveling vanaf de server: een verhaal dat je nog niet opende. */
  aanbevelingenAan: false,
  /** Lokale melding als je streak vanavond afloopt. Zie `use-streak-herinnering.ts`. */
  streakAan: true,
} as const;

export type PushVoorkeurSleutel = keyof typeof STANDAARD_PUSH_VOORKEUREN;

type NotificatieState = {
  /** Wil de gebruiker de dagelijkse herinnering? Los van de systeemtoestemming. */
  herinneringAan: boolean;
  /**
   * Is er al één keer om toestemming gevraagd? Android laat het systeemvenster maar één keer
   * zien; daarna moet de gebruiker naar de instellingen. We vragen het dus precies één keer,
   * op het moment dat het uit te leggen valt (na het eerste afgeronde hoofdstuk).
   */
  toestemmingGevraagd: boolean;
  /**
   * Het tijdstip van de herinnering, lokale tijd. Stond tot deze fase vast op 19:00 in
   * `notificaties.ts`; die constanten zijn nu de *beginwaarde* en niet meer de waarheid.
   *
   * Geen migratie nodig: zustand/persist legt de opgeslagen state over de beginstand heen, dus een
   * installatie van vóór deze wijziging mist deze twee sleutels en houdt gewoon 19:00.
   */
  herinneringUur: number;
  herinneringMinuut: number;

  // --- Push (FCM) ---
  terugkeerAan: boolean;
  aanbevelingenAan: boolean;
  streakAan: boolean;
  /**
   * Het laatst bij Supabase geregistreerde FCM-token van dit toestel.
   *
   * Staat hier om één reden: zonder dit doet de app bij élke start een upsert naar
   * `user_devices` met een token dat niet veranderd is. Met dit veld gebeurt dat alleen bij een
   * échte wijziging (eerste registratie, of FCM heeft het token vernieuwd).
   */
  fcmToken: string | null;

  setHerinnering: (aan: boolean) => void;
  setHerinneringTijd: (uur: number, minuut: number) => void;
  markeerToestemmingGevraagd: () => void;
  zetPushVoorkeur: (sleutel: PushVoorkeurSleutel, aan: boolean) => void;
  setFcmToken: (token: string | null) => void;

  // --- Supabase-sync ---
  //
  // Zelfde contract als `voortgang-store`, `story-progress-store` en `character-unlock-store`,
  // zodat deze store gewoon als vierde regel in `SYNC_STORES` past (zie `use-voortgang-sync.ts`).
  isSyncing: boolean;
  syncError: string | null;
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerVoorkeurenSamen: (vanServer: ServerVoorkeuren) => void;
  resetSyncStatus: () => void;
};

export type ServerVoorkeuren = {
  daily_reminder_enabled: boolean;
  daily_reminder_hour: number;
  daily_reminder_minute: number;
  reengagement_enabled: boolean;
  recommendations_enabled: boolean;
  streak_enabled: boolean;
};

const syncPlanner = maakSyncPlanner(() => useNotificatieStore.getState().syncToSupabase());

/** Elke wijziging zet de vlag en schuift de gedeelde timer twee seconden op. */
function gewijzigd() {
  syncPlanner.plan();
  return { heeftOnverzondenWijzigingen: true };
}

export const useNotificatieStore = create<NotificatieState>()(
  persist(
    (set, get) => ({
      herinneringAan: false,
      toestemmingGevraagd: false,
      herinneringUur: STANDAARD_HERINNERING_UUR,
      herinneringMinuut: STANDAARD_HERINNERING_MINUUT,

      ...STANDAARD_PUSH_VOORKEUREN,
      fcmToken: null,

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      setHerinnering: (aan) => set({ herinneringAan: aan, ...gewijzigd() }),
      // Geen `Notifications.scheduleNotificationAsync` hier: het herplannen doet
      // `useDagelijkseHerinnering`, die het tijdstip als dependency heeft. Eén plek die plant.
      setHerinneringTijd: (uur, minuut) =>
        set({ herinneringUur: uur, herinneringMinuut: minuut, ...gewijzigd() }),
      // Bewust *geen* sync: dit is een feit over dit toestel ("het systeemvenster is hier al
      // geweest"), niet een voorkeur van de lezer. Op een tweede telefoon moet het venster wél
      // nog verschijnen.
      markeerToestemmingGevraagd: () => set({ toestemmingGevraagd: true }),
      zetPushVoorkeur: (sleutel, aan) => set({ [sleutel]: aan, ...gewijzigd() }),
      // Ook geen sync: het token gaat naar `user_devices` en niet naar de voorkeurenrij.
      setFcmToken: (token) => set({ fcmToken: token }),

      /**
       * Schrijft de voorkeuren naar `public.notification_preferences`, één rij per gebruiker.
       *
       * De tijdzone gaat elke keer mee. Dat is niet overbodig: hij verandert als de lezer
       * verhuist of op reis is, en de server rekent er zijn doeluur mee uit. Meesturen bij elke
       * push kost niets; hem één keer bij de registratie zetten betekent dat een verhuisde lezer
       * jaren op het verkeerde uur een melding krijgt.
       */
      syncToSupabase: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        if (get().isSyncing) return;

        // Pushen vóórdat AsyncStorage gelezen is uploadt de beginstand en zet de voorkeuren van
        // de lezer terug op de standaardwaarden. Zie `sync-hulp.ts`.
        await wachtOpHydratie(useNotificatieStore);

        set({ isSyncing: true, syncError: null });
        const state = get();

        const { error } = await supabase.from('notification_preferences').upsert(
          {
            user_id: userId,
            daily_reminder_enabled: state.herinneringAan,
            daily_reminder_hour: state.herinneringUur,
            daily_reminder_minute: state.herinneringMinuut,
            reengagement_enabled: state.terugkeerAan,
            recommendations_enabled: state.aanbevelingenAan,
            streak_enabled: state.streakAan,
            tijdzone: huidigeTijdzone(),
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          // De vlag blijft staan, dus de volgende trigger (netwerk terug, app naar de voorgrond)
          // probeert het opnieuw. Niets gaat verloren: dit is één rij, geen groeiende toestand.
          set({ isSyncing: false, syncError: foutTekst(error) });
          return;
        }

        set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
      },

      /**
       * Legt de serverrij over de lokale stand — **behalve** als er lokaal nog iets openstaat.
       *
       * Bij de drie voortgangsstores is samenvoegen een vereniging, want daar groeit de state
       * alleen maar en kan een unie niets verliezen. Voorkeuren zijn geen verzameling: "uit" en
       * "aan" zijn allebei een echte keuze, en er bestaat geen vereniging van die twee. Dus:
       * heeft dit toestel nog niet-verzonden wijzigingen, dan zijn die het nieuwst en blijven ze
       * staan (de sync erna duwt ze omhoog). Anders wint de server, want de voorkeur hoort bij het
       * account en niet bij het toestel.
       */
      voegServerVoorkeurenSamen: (vanServer) => {
        if (get().heeftOnverzondenWijzigingen) return;
        set({
          herinneringAan: vanServer.daily_reminder_enabled,
          herinneringUur: vanServer.daily_reminder_hour,
          herinneringMinuut: vanServer.daily_reminder_minute,
          terugkeerAan: vanServer.reengagement_enabled,
          aanbevelingenAan: vanServer.recommendations_enabled,
          streakAan: vanServer.streak_enabled,
        });
      },

      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null });
      },
    }),
    {
      name: 'notificatie-storage',
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * `isSyncing` mag nooit opgeslagen worden: een bewaarde `true` laat elke volgende sync
       * meteen terugkeren bij de `if (get().isSyncing) return` hierboven, en dan synchroniseert
       * dit toestel nooit meer. Zelfde reden als bij de drie voortgangsstores.
       */
      partialize: (state) => {
        const { isSyncing: _isSyncing, syncError: _syncError, ...rest } = state;
        return rest;
      },
    }
  )
);

/**
 * Haalt de voorkeuren van de server en legt ze over de lokale stand.
 *
 * `maybeSingle()`: een lezer die nog nooit een voorkeur zette heeft geen rij, en dat is geen fout.
 * De eerste sync maakt hem aan.
 */
export async function haalNotificatieVoorkeurenOp(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select(
      'daily_reminder_enabled, daily_reminder_hour, daily_reminder_minute, ' +
        'reengagement_enabled, recommendations_enabled, streak_enabled'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[notificaties] voorkeuren ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  await wachtOpHydratie(useNotificatieStore);
  // Via `unknown`: supabase-js typeert een select met een samengestelde kolomstring niet, en de
  // vorm hierboven is de enige garantie die we hebben.
  useNotificatieStore.getState().voegServerVoorkeurenSamen(data as unknown as ServerVoorkeuren);
}
