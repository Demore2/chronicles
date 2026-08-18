import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AnalyticsVoorkeuren } from '@/components/analytics-preferences';
import { HerinneringSchakelaar, HerinneringTijd } from '@/components/daily-reminder-settings';
import { EmailVoorkeuren } from '@/components/email-preferences';
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

  function mailSupport() {
    const onderwerp = encodeURIComponent(t((s) => s.instellingen.contactOnderwerp));
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${onderwerp}`).catch(() => {});
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
   * Accountverwijdering. Play eist voor elke app met accounts een route om er vanaf te komen, en
   * die route mag ook een e-mail zijn — maar dan wel eentje die aankomt. Zonder ingesteld
   * supportadres tonen we daarom geen knop die naar niemand mailt.
   */
  function bevestigVerwijderen() {
    if (!supportEmailIsIngesteld) {
      nogNiet(t((s) => s.instellingen.accountVerwijderen));
      return;
    }
    bevestig({
      titel: t((s) => s.instellingen.accountVerwijderenTitel),
      tekst: t((s) => s.instellingen.accountVerwijderenTekst),
      bevestigTekst: t((s) => s.instellingen.accountVerwijderenMail),
      annuleerTekst: t((s) => s.auth.annuleren),
      destructief: true,
      onBevestig: mailSupport,
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
              supportEmailIsIngesteld ? mailSupport : () => nogNiet(t((s) => s.instellingen.contact))
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
          {/* De enige ingang naar `/profiel/analytics`. Alleen in ontwikkeling, om dezelfde reden
              als "Simulate Pro" hierboven: het scherm bestaat om te controleren of Firebase iets
              doorkrijgt, en linkt naar de console. Hardgecodeerd Engels, want geen lezer ziet het. */}
          {__DEV__ ? (
            <SettingsItem
              icoon="stats-chart-outline"
              label="Analytics dashboard (dev)"
              uitleg="Firebase status, event list and console links."
              onPress={() => router.push('/profiel/analytics')}
            />
          ) : null}
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
            isGevaar
            onPress={bevestigVerwijderen}
          />
        </SettingsSectie>
      </ScrollView>

      <ProPaywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
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
