import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { APP_VERSIE } from '@/constants/app-info';
import { notificaties, zorgVoorKanalen } from '@/constants/notificaties';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { leesLading, push, type PushLading } from '@/lib/push';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useNotificatieStore } from '@/store/notificatie-store';

/**
 * Alles rond push-notificaties op één plek, net als `useAuth()`, `useVoortgangSync()` en
 * `useAnalytics()`. **Mount dit één keer, in de root layout.**
 *
 * Vier taken, en ze horen bij elkaar omdat ze allemaal aan hetzelfde token hangen:
 *
 * 1. Het toestel registreren in `public.user_devices` zodra er een sessie én toestemming is.
 * 2. Luisteren of FCM het token vernieuwt (dat gebeurt uit zichzelf).
 * 3. Een push tonen die binnenkomt terwijl de app open staat — Android doet dat niet vanzelf.
 * 4. Een tik op een melding omzetten in een navigatie, uit alle drie de toestanden waarin dat
 *    kan gebeuren (voorgrond, achtergrond, en app helemaal gesloten).
 *
 * **Zonder `google-services.json` doet dit niets en klaagt het niet.** `lib/push.ts` geeft dan
 * `beschikbaar: false` en elke stap hieronder valt stil. Dat is opzet: de app moet volledig
 * werken zonder Firebase, precies zoals bij analytics.
 */

/** Waar een melding heen mag sturen. Alleen paden binnen de app, nooit een externe URL. */
function veiligPad(pad: string | undefined): string | null {
  if (!pad) return null;
  // Een `pad` uit een push is data van buiten. Zonder deze controle kan een verkeerd (of
  // kwaadwillend) samengesteld bericht de app naar een willekeurige URL sturen — `//evil.com`
  // is een geldige waarde die als protocol-relatieve URL wordt gelezen.
  if (!pad.startsWith('/') || pad.startsWith('//')) return null;
  return pad;
}

export function usePushRegistratie(): void {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const terugkeerAan = useNotificatieStore((state) => state.terugkeerAan);
  const aanbevelingenAan = useNotificatieStore((state) => state.aanbevelingenAan);
  const navigatieKlaar = useRootNavigationState()?.key !== undefined;

  /**
   * Een melding die binnenkwam voordat de navigator er was.
   *
   * Bij een koude start uit een push is dit de normale gang van zaken: `getInitialNotification()`
   * antwoordt meteen, de routeboom staat pas een paar frames later. Zonder deze wachtkamer gaat
   * `router.push` verloren met "Attempted to navigate before mounting the Root Layout".
   */
  const wachtendPad = useRef<string | null>(null);

  const meldGeopend = useCallback((lading: PushLading) => {
    logStoryEvent(ANALYTICS_EVENTS.NOTIFICATION_OPENED, {
      soort: lading.soort ?? 'onbekend',
      pad: lading.pad,
    });
    // Terugmelden dat hij geopend is. Via de RPC en niet met een `update`: op
    // `notifications_sent` staat bewust geen update-policy, zodat de lezer zijn eigen logboek
    // niet kan herschrijven (zie de migratie `push_notificaties`).
    if (lading.melding_id) {
      void supabase.rpc('markeer_melding_geopend', { melding_id: lading.melding_id }).then(
        ({ error }) => {
          if (error) console.warn('[push] melding markeren mislukt:', error.message);
        }
      );
    }
  }, []);

  const openLading = useCallback(
    (lading: PushLading) => {
      meldGeopend(lading);
      const pad = veiligPad(lading.pad);
      if (!pad) return;
      if (!navigatieKlaar) {
        wachtendPad.current = pad;
        return;
      }
      // `as never` omdat `typedRoutes` een letterlijk pad wil en dit er pas op het toestel een
      // wordt. De vorm is afgedwongen door `veiligPad` hierboven.
      router.push(pad as never);
    },
    [meldGeopend, navigatieKlaar]
  );

  // --- De wachtkamer legen zodra de navigator er is ---
  useEffect(() => {
    if (!navigatieKlaar || !wachtendPad.current) return;
    const pad = wachtendPad.current;
    wachtendPad.current = null;
    router.push(pad as never);
  }, [navigatieKlaar]);

  // --- De Android-kanalen ---
  //
  // Moeten bestaan vóórdat er een push binnenkomt die naar `channel_id: 'terugkeer'` verwijst.
  // Idempotent, dus één keer bij het opstarten is genoeg.
  useEffect(() => {
    void zorgVoorKanalen();
  }, []);

  // --- Registreren ---
  useEffect(() => {
    if (!userId || !push.beschikbaar) return;
    let afgebroken = false;

    async function registreer() {
      // Geen toestemming = geen bruikbaar token, en het venster openen mag hier niet: dat is één
      // keer per installatie en gebeurt na het eerste afgeronde hoofdstuk
      // (`biedHerinneringAan`). Een registratie die stilletjes de toestemmingsvraag opbrandt bij
      // het opstarten is precies wat `constants/notificaties.ts` vermijdt.
      const mag = await notificaties.heeftToestemming();
      if (afgebroken || !mag) return;

      // iOS wil daarnaast nog een APNs-registratie; op Android is dit een no-op.
      if (Platform.OS === 'ios') await push.vraagToestemming();

      const token = await push.haalToken();
      if (afgebroken || !token) return;

      const store = useNotificatieStore.getState();
      // Niets veranderd? Dan alleen `last_seen` bijwerken zou ook nog een schrijfactie zijn.
      // Een token wisselt zelden; dit scheelt een upsert bij elke start van de app.
      if (store.fcmToken === token) return;

      const { error } = await supabase.from('user_devices').upsert(
        {
          user_id: userId,
          fcm_token: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          device_name: Device.modelName ?? null,
          app_versie: APP_VERSIE,
          enabled: true,
          last_seen: new Date().toISOString(),
        },
        // Op `fcm_token` en niet op `user_id`: het token identificeert een *installatie*. Zo
        // verhuist een toestel netjes naar het account dat er nu op ingelogd is, in plaats van
        // een tweede rij te maken die dezelfde melding nog een keer bezorgt.
        { onConflict: 'fcm_token' }
      );

      if (error) {
        console.warn('[push] toestel registreren mislukt:', error.message);
        return;
      }

      if (afgebroken) return;
      store.setFcmToken(token);
      logStoryEvent(ANALYTICS_EVENTS.PUSH_REGISTERED, { platform: Platform.OS });
    }

    void registreer();
    return () => {
      afgebroken = true;
    };
  }, [userId]);

  // --- Token vernieuwd ---
  //
  // FCM doet dit uit zichzelf (herinstallatie, gewiste app-data, af en toe zomaar). Wie er niet
  // naar luistert houdt een dood token in de database en merkt dat pas als er weken niets aankomt.
  useEffect(() => {
    if (!userId || !push.beschikbaar) return;
    return push.opTokenVernieuwd((token) => {
      void (async () => {
        const { error } = await supabase.from('user_devices').upsert(
          {
            user_id: userId,
            fcm_token: token,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
            device_name: Device.modelName ?? null,
            app_versie: APP_VERSIE,
            enabled: true,
            last_seen: new Date().toISOString(),
          },
          { onConflict: 'fcm_token' }
        );
        if (!error) useNotificatieStore.getState().setFcmToken(token);
      })();
    });
  }, [userId]);

  // --- Alles uit? Dan ook echt onbereikbaar ---
  //
  // De serverkant kijkt al naar de voorkeuren, maar een toestel dat "uit" staat en tóch bereikbaar
  // blijft, is één serverbug verwijderd van een melding die de lezer heeft afgezegd. De rij gaat
  // dus uit zodra beide servercategorieën uit staan.
  useEffect(() => {
    if (!userId || !push.beschikbaar) return;
    const token = useNotificatieStore.getState().fcmToken;
    if (!token) return;
    const bereikbaar = terugkeerAan || aanbevelingenAan;
    void supabase
      .from('user_devices')
      .update({ enabled: bereikbaar })
      .eq('fcm_token', token)
      .then(({ error }) => {
        if (error) console.warn('[push] toestel bijwerken mislukt:', error.message);
      });
  }, [userId, terugkeerAan, aanbevelingenAan]);

  // --- Push binnen terwijl de app open staat ---
  //
  // Android toont die niet vanzelf: FCM levert hem alleen aan de code af. Zonder dit lijkt het of
  // de melding niet aankwam.
  useEffect(() => {
    if (!push.beschikbaar) return;
    return push.opVoorgrondBericht((bericht) => {
      const lading = leesLading(bericht.data);
      logStoryEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, { soort: lading.soort ?? 'onbekend' });
      void notificaties.toonNu(
        bericht.notification?.title ?? '',
        bericht.notification?.body ?? '',
        {
          kanaal: 'terugkeer',
          // Als string-map doorgeven, zodat de tik-afhandeling hieronder dezelfde vorm ziet als
          // bij een push die van buiten de app kwam.
          data: Object.fromEntries(
            Object.entries(lading).filter(([, waarde]) => typeof waarde === 'string')
          ) as Record<string, string>,
        }
      );
    });
  }, []);

  // --- Tik op een push, app op de achtergrond ---
  useEffect(() => {
    if (!push.beschikbaar) return;
    return push.opMeldingGeopend((bericht) => openLading(leesLading(bericht.data)));
  }, [openLading]);

  // --- Tik op een push, app was gesloten ---
  //
  // Aparte weg omdat er op dat moment geen luisteraar bestond om aan te roepen: FCM bewaart de
  // melding en je moet er zelf één keer om vragen. Dit vergeten is de reden dat een deeplink uit
  // een push "soms wel en soms niet" werkt.
  useEffect(() => {
    if (!push.beschikbaar) return;
    let afgebroken = false;
    void push.startMelding().then((bericht) => {
      if (afgebroken || !bericht) return;
      openLading(leesLading(bericht.data));
    });
    return () => {
      afgebroken = true;
    };
  }, [openLading]);

  // --- Tik op een lokale melding ---
  //
  // De dagelijkse herinnering en de ontgrendelmelding komen niet van FCM maar van
  // expo-notifications, dus die hebben hun eigen luisteraar. Dezelfde afhandeling erachter, zodat
  // er één plek is die bepaalt wat een tik betekent.
  useEffect(() => {
    if (!notificaties.ondersteund) return;
    const abonnement = Notifications.addNotificationResponseReceivedListener((respons) => {
      openLading(leesLading(respons.notification.request.content.data));
    });
    return () => abonnement.remove();
  }, [openLading]);
}
