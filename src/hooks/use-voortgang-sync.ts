import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@/store/auth-store';
import { haalOntgrendelingenOp, useCharacterUnlockStore } from '@/store/character-unlock-store';
import { haalNotificatieVoorkeurenOp, useNotificatieStore } from '@/store/notificatie-store';
import { haalHoofdstukVoortgangOp, useStoryProgressStore } from '@/store/story-progress-store';
import { haalVoortgangOp, useVoortgangStore } from '@/store/voortgang-store';

/**
 * Alle aanleidingen om te synchroniseren, op één plek (R8.AUTH deel 3, uitgebreid in R8.SYNC-B).
 *
 * De *debounce* zit in de stores zelf — elke muterende actie schuift daar een timer van twee
 * seconden op. Wat hier hangt zijn de gevallen waarin er níets is gewijzigd maar er tóch iets moet
 * gebeuren: er komt een sessie, het netwerk komt terug, of de app komt terug naar de voorgrond.
 *
 * Mount dit één keer, in de root-layout, naast `useAuth()`. Twee instanties zetten twee
 * NetInfo-abonnementen op die precies hetzelfde werk doen.
 */

/**
 * De drie stores die synchroniseren, met per store hoe je hem ophaalt.
 *
 * Als lijst en niet als drie losse aanroepen, zodat een vierde store (voorkeuren, ooit) één regel
 * is en niet vier plekken die uit elkaar kunnen lopen. De drie contracten zijn met opzet identiek:
 * `heeftOnverzondenWijzigingen` / `syncToSupabase` / `resetSyncStatus` plus een `haalOp`.
 */
const SYNC_STORES = [
  { store: useVoortgangStore, haalOp: haalVoortgangOp },
  { store: useStoryProgressStore, haalOp: haalHoofdstukVoortgangOp },
  { store: useCharacterUnlockStore, haalOp: haalOntgrendelingenOp },
  // De vierde, precies zoals de kop hierboven voorspelde. Notificatievoorkeuren horen bij het
  // account en niet bij het toestel: wie op zijn tablet de win-back-push uitzet bedoelt dat niet
  // alleen daar. Eén afwijking t.o.v. de andere drie staat in `voegServerVoorkeurenSamen` —
  // voorkeuren worden overschreven en niet verenigd, want "uit" is een keuze en geen leegte.
  { store: useNotificatieStore, haalOp: haalNotificatieVoorkeurenOp },
] as const;

/** Duwt alles wat openstaat omhoog. Een store zonder wijzigingen kost niets. */
function verstuurOpenstaandeWijzigingen() {
  for (const { store } of SYNC_STORES) {
    const { heeftOnverzondenWijzigingen, syncToSupabase } = store.getState();
    if (heeftOnverzondenWijzigingen) void syncToSupabase();
  }
}

export function useVoortgangSync() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  // Onthoudt of we voor déze gebruiker al hebben opgehaald. Zonder dit zou een remount de
  // serverrijen opnieuw binnenhalen; dat is niet fout (samenvoegen is idempotent) maar wel een
  // ronde netwerkverkeer per keer.
  const opgehaaldVoor = useRef<string | null>(null);

  /**
   * Binnenhalen bij een sessie, dan meteen terugduwen.
   *
   * De sleutel is `user.id` en niet het hele user-object: supabase-js geeft bij elke
   * token-refresh een nieuw object voor dezelfde persoon, en daarop reageren zou elk uur een
   * overbodige ronde opleveren.
   *
   * De push direct na het ophalen is er voor de eerste keer inloggen op een toestel waar al
   * gelezen was: de merge merkt dan dat lokaal meer weet dan de server en zet de vlag, en deze
   * aanroep brengt dat omhoog.
   *
   * De drie stores gaan parallel: ze raken verschillende tabellen en hebben geen volgorde ten
   * opzichte van elkaar, dus achter elkaar wachten zou alleen de eerste render vertragen.
   */
  useEffect(() => {
    if (!userId) {
      // Alleen opruimen als er écht iemand *was*. Bij de eerste render is `userId` ook null —
      // de sessie komt pas na een ronde langs AsyncStorage — en op dat moment de status legen
      // zou de "nog niet gesynchroniseerd"-vlag wissen die een vorige offline sessie achterliet.
      if (opgehaaldVoor.current !== null) {
        opgehaaldVoor.current = null;
        for (const { store } of SYNC_STORES) store.getState().resetSyncStatus();
      }
      return;
    }
    if (opgehaaldVoor.current === userId) return;
    opgehaaldVoor.current = userId;

    void Promise.all(
      SYNC_STORES.map(async ({ store, haalOp }) => {
        await haalOp(userId);
        await store.getState().syncToSupabase();
      }),
    );
  }, [userId]);

  /**
   * Terug online → alsnog versturen.
   *
   * `isInternetReachable` is expres alleen als hárde nee behandeld: op een emulator en achter een
   * captive portal blijft die waarde soms `null` (nog onbekend) terwijl er wel degelijk verkeer
   * doorheen kan. Een sync die onnodig start is een mislukte upsert die de vlag laat staan; een
   * sync die onnodig *niet* start is voortgang die nooit boven komt.
   */
  useEffect(() => {
    const abonnement = NetInfo.addEventListener((status) => {
      const online = status.isConnected === true && status.isInternetReachable !== false;
      if (!online) return;
      verstuurOpenstaandeWijzigingen();
    });

    return abonnement;
  }, []);

  /**
   * Terug naar de voorgrond → alsnog versturen.
   *
   * Dit is het vangnet onder NetInfo. Android levert een netwerkwissel die tijdens een gedode of
   * bevroren app plaatsvond niet altijd na; bovendien overleeft de vlag een herstart en is dit de
   * eerste gelegenheid om hem dan te legen. Kost een upsert bij het openen van de app, en alleen
   * als er echt iets openstaat.
   */
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      verstuurOpenstaandeWijzigingen();
    });

    return () => abonnement.remove();
  }, []);
}
