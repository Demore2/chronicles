import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AnalyticsVoorkeuren } from '@/components/analytics-preferences';
import { HerinneringSchakelaar, HerinneringTijd } from '@/components/daily-reminder-settings';
import { EmailVoorkeuren } from '@/components/email-preferences';
import { PushVoorkeuren } from '@/components/notification-preferences';
import { PRO_BANNER_ENABLED } from '@/components/pro-access-banner';
import { ProPaywall } from '@/components/pro-paywall';
import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import { SyncIndicator } from '@/components/sync-indicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  APP_IS_GEPUBLICEERD,
  APP_VERSIE,
  PLAY_STORE_URL,
  SUPPORT_EMAIL,
  supportEmailIsIngesteld,
  VOORWAARDEN_URL,
  voorwaardenZijnGepubliceerd,
} from '@/constants/app-info';
import { bevestig, meld } from '@/constants/dialoog';
import { PRIVACY_BELEID_URL, privacyBeleidIsGepubliceerd } from '@/constants/juridisch';
import { DAGELIJKSE_VERHAAL_LIMIET, VERHAAL_LIMIET_ENABLED } from '@/constants/monetisatie';
import { notificaties } from '@/constants/notificaties';
import { Radii, Spacing } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useAbonnement } from '@/hooks/use-abonnement';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { logout } from '@/hooks/useAuth';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { taalCodes, taalNamen } from '@/i18n/taal-namen';
import { useAbonnementStore, useVerhalenVandaag } from '@/store/abonnement-store';
import { useAuthStore } from '@/store/auth-store';
import { useNotificatieStore } from '@/store/notificatie-store';
import { useThemaStore, type ThemaVoorkeur } from '@/store/thema-store';

const THEMA_OPTIES: { waarde: ThemaVoorkeur; icoonNaam: IoniconNaam }[] = [
  { waarde: 'licht', icoonNaam: 'sunny-outline' },
  { waarde: 'donker', icoonNaam: 'moon-outline' },
  { waarde: 'systeem', icoonNaam: 'phone-portrait-outline' },
];

const THEMA_LABEL_SLEUTEL = {
  licht: 'themaLicht',
  donker: 'themaDonker',
  systeem: 'themaSysteem',
} as const;

/**
 * De taalkiezer blijft verborgen zolang de inhoud alleen in het Engels bestaat — de UI zou dan
 * in het Frans staan boven een Engels hoofdstuk. Stond eerder met dezelfde vlag op Profiel.
 */
const SHOW_LANGUAGE_PICKER = false;

/**
 * Instellingen (`/profiel/settings`).
 *
 * Alles wat vroeger onderaan Profiel stond, plus de regels die tot v1.1 nog niets doen. Die
 * laatste dragen bewust een "Soon"-label en zeggen bij aanraking dat ze er nog niet zijn: een
 * knop die stilletjes niets doet, of erger, doet alsof, is precies waarop Play-reviews
 * struikelen — dezelfde afweging als bij `ad-banner.tsx`.
 *
 * Wat wél werkt, werkt hier echt: thema, de dagelijkse herinnering, de synchronisatiestatus,
 * het privacybeleid en uitloggen. Die zijn verplaatst, niet nagebouwd.
 */
export default function InstellingenScreen() {
  const theme = useTheme();
  const { t, taal, setTaal } = useVertaling();

  const user = useAuthStore((state) => state.user);
  const authProfiel = useAuthStore((state) => state.profiel);
  const themaVoorkeur = useThemaStore((state) => state.themaVoorkeur);
  const setThemaVoorkeur = useThemaStore((state) => state.setThemaVoorkeur);
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  const { isPremium } = useAbonnement();
  const setPro = useAbonnementStore((state) => state.setPro);
  const verhalenVandaag = useVerhalenVandaag();
  const [uitlogBezig, setUitlogBezig] = useState(false);
  const { verwijderAccount, isBezig: verwijderBezig } = useDeleteAccount();
  const [paywallOpen, setPaywallOpen] = useState(false);

  /** Eén melding voor alles wat nog niet bestaat, met het onderwerp erin. */
  function nogNiet(onderwerp: string) {
    meld(
      t((s) => s.instellingen.binnenkortTitel),
      t((s) => s.instellingen.binnenkortTekst)(onderwerp),
      t((s) => s.instellingen.ok),
    );
  }

  function openLink(url: string) {
    // Zelfde afspraak als bij haptics: een toestel zonder bruikbare browser mag de interactie
    // niet laten klappen.
    WebBrowser.openBrowserAsync(url).catch(() => {});
  }

  /**
   * Opent een mailtje naar support. De tekst is optioneel: bij "Contact support" schrijft de lezer
   * zelf, bij een gegevensverzoek staat de vraag al klaar zodat hij herkenbaar binnenkomt en de
   * lezer niet hoeft te bedenken wat hij moet vragen.
   */
  function mailSupport(onderwerp: string, tekst?: string) {
    const query = `subject=${encodeURIComponent(onderwerp)}`;
    const body = tekst ? `&body=${encodeURIComponent(tekst)}` : '';
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${query}${body}`).catch(() => {});
  }

  function mailContact() {
    mailSupport(t((s) => s.instellingen.contactOnderwerp));
  }

  /**
   * Een gegevenskopie (AVG art. 15/20) loopt via de mail en niet via een knop die een bestand
   * bouwt: dat zou een tweede edge function plus een exportformaat zijn, en er staat te weinig
   * per account om dat vandaag te rechtvaardigen. Wat er wél moet zijn is een route die aankomt.
   */
  function mailGegevensVerzoek() {
    mailSupport(
      t((s) => s.instellingen.gegevensVerzoekOnderwerp),
      t((s) => s.instellingen.gegevensVerzoekBody),
    );
  }

  // `zetHerinnering` stond hier; die logica woont sinds het instelbare tijdstip in
  // `daily-reminder-settings.tsx`, bij de schakelaar zelf.

  function bevestigUitloggen() {
    bevestig({
      titel: t((s) => s.auth.uitlogTitel),
      tekst: t((s) => s.auth.uitlogTekst),
      bevestigTekst: t((s) => s.auth.uitloggen),
      annuleerTekst: t((s) => s.auth.annuleren),
      destructief: true,
      onBevestig: () => {
        setUitlogBezig(true);
        // Bewust geen `router.replace` hier: de auth-poort in de root layout ziet `user === null`
        // en stuurt naar /login. Eén plek die dat besluit neemt, anders vechten twee navigaties.
        void logout();
      },
    });
  }

  /**
   * Accountverwijdering. Play eist voor elke app met accounts een in-app route om er vanaf te
   * komen; dit was er een naar de mailbox en is sinds de edge function `delete-account` een knop
   * die het ook echt doet — server én toestel, meteen.
   *
   * Eén bevestiging, geen tweede "typ DELETE"-scherm: het dialoog zegt wat er weggaat en dat het
   * niet terug te draaien is, en de handeling zit al drie schermen diep achter een rode regel.
   *
   * Bij een fout blijft de lezer waar hij is en zegt de melding dat er níéts is verwijderd. Dat
   * is de enige vraag die er op dat moment toe doet — een half verwijderd account zou erger zijn
   * dan geen, en de function verwijdert daarom in één cascade of niet.
   */
  function bevestigVerwijderen() {
    bevestig({
      titel: t((s) => s.instellingen.accountVerwijderenTitel),
      tekst: t((s) => s.instellingen.accountVerwijderenTekst),
      bevestigTekst: t((s) => s.instellingen.accountVerwijderenBevestig),
      annuleerTekst: t((s) => s.auth.annuleren),
      destructief: true,
      onBevestig: () => {
        void (async () => {
          const resultaat = await verwijderAccount();
          if (resultaat.ok) {
            // Geen `router.replace`: `AuthPoort` ziet de lege sessie en stuurt naar /login,
            // net als bij uitloggen. Twee navigaties om hetzelfde besluit vechten anders.
            meld(
              t((s) => s.instellingen.accountVerwijderdTitel),
              t((s) => s.instellingen.accountVerwijderdTekst),
              t((s) => s.instellingen.ok),
            );
            return;
          }
          meld(
            t((s) => s.instellingen.accountVerwijderenMisluktTitel),
            t((s) => s.instellingen.accountVerwijderenMisluktTekst)(SUPPORT_EMAIL),
            t((s) => s.instellingen.ok),
          );
        })();
      },
    });
  }

  const binnenkortBadge = t((s) => s.instellingen.binnenkort);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t((s) => s.instellingen.titel) }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SettingsSectie titel={t((s) => s.instellingen.sectieAccount)}>
          <SettingsItem
            icoon="mail-outline"
            label={t((s) => s.instellingen.ingelogdAls)}
            waarde={user?.email ?? ''}
          />
          <SettingsItem
            icoon="person-outline"
            label={t((s) => s.instellingen.gebruikersnaam)}
            waarde={authProfiel?.username ?? t((s) => s.instellingen.geenGebruikersnaam)}
          />
          <SettingsItem
            icoon="lock-closed-outline"
            label={t((s) => s.instellingen.wachtwoordWijzigen)}
            badge={binnenkortBadge}
            onPress={() => nogNiet(t((s) => s.instellingen.wachtwoordWijzigen))}
          />
          {/* De synchronisatiestatus stond op Profiel onder het account; hij hoort bij het
              account, niet bij de voortgangscijfers. Zonder sessie rendert hij niets. */}
          <View style={styles.blok}>
            <ThemedText type="smallBold">{t((s) => s.instellingen.synchronisatie)}</ThemedText>
            <SyncIndicator />
          </View>
        </SettingsSectie>

        <SettingsSectie titel={t((s) => s.instellingen.sectieWeergave)}>
          <View style={styles.blok}>
            <ThemedText type="smallBold">{t((s) => s.profiel.thema)}</ThemedText>
            <View style={styles.keuzeRij}>
              {THEMA_OPTIES.map((optie) => {
                const actief = themaVoorkeur === optie.waarde;
                return (
                  <Pressable
                    key={optie.waarde}
                    onPress={() => setThemaVoorkeur(optie.waarde)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: actief }}
                    style={[
                      styles.themaKnop,
                      { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                    ]}>
                    <Ionicons
                      name={optie.icoonNaam}
                      size={20}
                      color={actief ? theme.background : theme.text}
                    />
                    <ThemedText type="small" style={{ color: actief ? theme.background : theme.text }}>
                      {t((s) => s.profiel[THEMA_LABEL_SLEUTEL[optie.waarde]])}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {SHOW_LANGUAGE_PICKER ? (
            <View style={styles.blok}>
              <ThemedText type="smallBold">{t((s) => s.profiel.taal)}</ThemedText>
              <View style={styles.keuzeRij}>
                {taalCodes.map((code) => {
                  const actief = taal === code;
                  return (
                    <Pressable
                      key={code}
                      onPress={() => setTaal(code)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: actief }}
                      style={[
                        styles.taalKnop,
                        { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{ color: actief ? theme.background : theme.text }}>
                        {taalNamen[code]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <SettingsItem
            icoon="apps-outline"
            label={t((s) => s.instellingen.appIcoon)}
            badge={binnenkortBadge}
            onPress={() => nogNiet(t((s) => s.instellingen.appIcoon))}
          />
        </SettingsSectie>

        {/* De hele sectie alleen op een toestel dat notificaties kan plannen — op web bestaat de
            schakelaar niet, in plaats van een schakelaar die niets doet. De sectie zit mee in de
            voorwaarde omdat er sinds de e-mailvoorkeuren een eigen kop is: zonder dat zou er op
            web een lege kaart met kop overblijven. Het tijdstip verschijnt pas als de herinnering
            aan staat, en die voorwaarde staat hier en niet in het component, zodat
            `SettingsSectie` het kind kan wegfilteren en er geen lijn zonder regel overblijft. */}
        {notificaties.ondersteund ? (
          <SettingsSectie titel={t((s) => s.instellingen.sectieMeldingen)}>
            <HerinneringSchakelaar />
            {herinneringAan ? <HerinneringTijd /> : null}
          </SettingsSectie>
        ) : null}

        {/* Los van de sectie hierboven: die gaat over de herinnering die de app zélf plant, deze
            over meldingen die van de server komen (plus de streakwaarschuwing, die lokaal is maar
            wél iets anders belooft dan "elke dag om 19:00"). Het component levert zijn eigen kop
            en voetnoot, net als `EmailVoorkeuren` en `AnalyticsVoorkeuren`. */}
        {notificaties.ondersteund ? <PushVoorkeuren /> : null}

        <EmailVoorkeuren />

        {/* Privacy staat bewust vóór het abonnement en niet onderaan bij "Account": het is een
            keuze over gegevens, geen gevaarlijke handeling. */}
        <AnalyticsVoorkeuren />

        {/* Zolang het Pro-aanbod aan staat opent deze regel het aanbodvenster in plaats van de
            binnenkort-melding: het is dezelfde vraag ("wat heb ik, en wat kan ik krijgen?"), en
            twee plekken die daar verschillend op antwoorden is er één te veel. Gaat de vlag uit,
            dan valt de regel vanzelf terug op "Soon" — er is geen tweede plek om te wijzigen. */}
        <SettingsSectie titel={t((s) => s.instellingen.sectieAbonnement)}>
          <SettingsItem
            icoon="card-outline"
            label={t((s) => s.instellingen.abonnement)}
            waarde={
              isPremium
                ? t((s) => s.instellingen.abonnementPro)
                : t((s) => s.instellingen.abonnementGratis)
            }
            badge={PRO_BANNER_ENABLED ? undefined : binnenkortBadge}
            onPress={
              PRO_BANNER_ENABLED
                ? () => setPaywallOpen(true)
                : () => nogNiet(t((s) => s.instellingen.abonnement))
            }
          />
          {/* Wat de limiet vandaag nog toestaat. Informatie, geen knop: hij telt zichzelf vol en
              er valt hier niets aan te bedienen. Voor Pro staat er "Unlimited" in plaats van een
              teller die nooit iets doet. */}
          {VERHAAL_LIMIET_ENABLED ? (
            <SettingsItem
              icoon="book-outline"
              label={t((s) => s.instellingen.dagelijkseLimiet)}
              waarde={
                isPremium
                  ? t((s) => s.instellingen.onbeperkt)
                  : t((s) => s.instellingen.verhalenVandaag)(
                      verhalenVandaag,
                      DAGELIJKSE_VERHAAL_LIMIET
                    )
              }
            />
          ) : null}
          {/* Alleen in ontwikkeling: Google Play Billing bestaat nog niet, dus zonder deze
              schakelaar is de Pro-kant van de app niet te bekijken. `__DEV__` is in een
              productiebundel `false`, dus dit kan niet meeliften naar Play. */}
          {__DEV__ ? (
            <SettingsItem
              icoon="construct-outline"
              label="Simulate Pro (dev)"
              uitleg="Development only — replaces the Play Billing check."
              rechts={
                <Switch
                  value={isPremium}
                  onValueChange={setPro}
                  trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
                  thumbColor={theme.background}
                />
              }
            />
          ) : null}
        </SettingsSectie>

        <SettingsSectie titel={t((s) => s.instellingen.sectieSupport)}>
          <SettingsItem
            icoon="star-outline"
            label={t((s) => s.instellingen.beoordeel)}
            badge={APP_IS_GEPUBLICEERD ? undefined : binnenkortBadge}
            onPress={
              APP_IS_GEPUBLICEERD
                ? () => openLink(PLAY_STORE_URL)
                : () => nogNiet(t((s) => s.instellingen.beoordeel))
            }
          />
          <SettingsItem
            icoon="help-buoy-outline"
            label={t((s) => s.instellingen.contact)}
            waarde={supportEmailIsIngesteld ? SUPPORT_EMAIL : undefined}
            badge={supportEmailIsIngesteld ? undefined : binnenkortBadge}
            onPress={
              supportEmailIsIngesteld ? mailContact : () => nogNiet(t((s) => s.instellingen.contact))
            }
          />
          {/* Het recht op een kopie (AVG art. 15/20). Staat hier en niet bij "Account", omdat het
              een vraag aan ons is en geen handeling aan je account — en zeker geen buurman van de
              verwijderknop. */}
          <SettingsItem
            icoon="download-outline"
            label={t((s) => s.instellingen.gegevensVerzoek)}
            uitleg={t((s) => s.instellingen.gegevensVerzoekUitleg)}
            badge={supportEmailIsIngesteld ? undefined : binnenkortBadge}
            onPress={
              supportEmailIsIngesteld
                ? mailGegevensVerzoek
                : () => nogNiet(t((s) => s.instellingen.gegevensVerzoek))
            }
          />
          <SettingsItem
            icoon="document-text-outline"
            label={t((s) => s.instellingen.voorwaarden)}
            badge={voorwaardenZijnGepubliceerd ? undefined : binnenkortBadge}
            onPress={
              voorwaardenZijnGepubliceerd
                ? () => openLink(VOORWAARDEN_URL)
                : () => nogNiet(t((s) => s.instellingen.voorwaarden))
            }
          />
          {/* Play vereist een privacybeleid-link. Zolang `PRIVACY_BELEID_URL` de placeholder is
              wordt hij niet geopend maar als "binnenkort" getoond — een dode link is erger dan
              een eerlijke melding (LAUNCH-PLAN.md A5). */}
          <SettingsItem
            icoon="shield-checkmark-outline"
            label={t((s) => s.profiel.privacybeleid)}
            badge={privacyBeleidIsGepubliceerd ? undefined : binnenkortBadge}
            onPress={
              privacyBeleidIsGepubliceerd
                ? () => openLink(PRIVACY_BELEID_URL)
                : () => nogNiet(t((s) => s.profiel.privacybeleid))
            }
          />
        </SettingsSectie>

        <SettingsSectie titel={t((s) => s.instellingen.sectieApp)}>
          <SettingsItem
            icoon="information-circle-outline"
            label={t((s) => s.instellingen.versie)}
            waarde={APP_VERSIE}
          />
        </SettingsSectie>

        <SettingsSectie titel={t((s) => s.instellingen.sectieGevaar)}>
          <SettingsItem
            icoon="log-out-outline"
            label={t((s) => s.auth.uitloggen)}
            onPress={uitlogBezig ? undefined : bevestigUitloggen}
          />
          <SettingsItem
            icoon="trash-outline"
            label={t((s) => s.instellingen.accountVerwijderen)}
            waarde={verwijderBezig ? t((s) => s.instellingen.accountVerwijderenBezig) : undefined}
            isGevaar
            onPress={verwijderBezig ? undefined : bevestigVerwijderen}
          />
        </SettingsSectie>
      </ScrollView>

      <ProPaywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} bron="settings" />
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
  blok: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  keuzeRij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  themaKnop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  taalKnop: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
