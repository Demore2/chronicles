import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { meld } from '@/constants/dialoog';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { logStoryEvent } from '@/hooks/useAnalytics';
// `useSubscriptionStore` is hier bewust wég. Het venster las er `setTrial` en `loading` uit; de
// eerste is het gat dat hierboven beschreven staat, de tweede diende alleen om de knop tijdens
// het activeren te blokkeren. Nevengevolg: dit venster staat op vier plekken permanent
// gemonteerd en hertekent nu niet meer bij elke wijziging in die store.

/**
 * Vanwaar het venster geopend is.
 *
 * **Verplicht en geen optionele string met een standaardwaarde**, want het verschil tussen deze
 * vier is precies wat `paywall_viewed` interessant maakt. `banner` en `settings` zijn iemand die
 * uit zichzelf gaat kijken; `limit` en `ad` zijn iemand die tegen een muur liep. Als de conversie
 * ergens vandaan komt, komt hij van die laatste twee — en zonder deze parameter zie je dat niet.
 * Een vijfde ingang moet daarom een keuze maken in plaats van in een `undefined` te vallen.
 */
export type PaywallBron = 'banner' | 'settings' | 'limit' | 'ad';

type ProPaywallProps = {
  visible: boolean;
  onClose: () => void;
  bron: PaywallBron;
};

/**
 * Het aanbodvenster achter de Pro-banner en achter "Your plan" in Instellingen.
 *
 * **Er wordt hier niets verkocht, en de knop doet dat ook niet meer alsof.** Google Play Billing
 * bestaat nog niet, dus de hoofdknop staat uitgeschakeld en opent een melding die zegt waarom.
 *
 * 🚩 **Hier zat een gat.** De knop riep tot deze wijziging `setTrial(7)` aan, en die schrijft
 * rechtstreeks naar `public.user_subscriptions` — waar de update-policy `auth.uid() = user_id`
 * geen kolommen beperkt. Eén tik gaf dus `tier = 'premium'` met `auto_renew = true`, zonder bon,
 * zonder betaling, server-side bewaard. Dat is exact het gat waarvoor `setPremium()` al
 * uitgecommentarieerd stond; `setTrial()` had alleen nog geen aanroeper en kreeg er in FASE 3 één.
 * **Zet deze knop pas terug aan samen met een edge function die de Google-bon verifieert, en haal
 * bij diezelfde stap de update-policy van de tabel af.**
 *
 * Drie dingen volgen daaruit, en ze zijn allemaal bewust:
 *
 * 1. De prijzen dragen een voorbehoud en komen uit i18n. Een bedrag tonen mag; doen alsof er
 *    vandaag iets af te rekenen valt niet — dus geen "Renews monthly" onder een bedrag dat nooit
 *    wordt afgeschreven.
 * 2. De proefperiode wordt aangekondigd, niet aangeboden: "zeven dagen zodra Pro er is", zonder
 *    "cancel anytime" of "no credit card needed" — dat zijn allebei uitspraken over een
 *    afrekening die niet bestaat.
 * 3. **De voordelenlijst noemt alleen wat de build vandaag afdwingt.** Dat zijn er precies twee
 *    (de dagelijkse leeslimiet en de onderbreking, allebei uit `constants/monetisatie.ts`); de
 *    vijf regels die er stonden waren stuk voor stuk dingen die een gratis lezer óók krijgt. Zie
 *    de toelichting bij `pro` in `i18n/en.ts`.
 *
 * Zie `pro-access-banner.tsx` voor de vlag die het hele aanbod aan- en uitzet.
 */
export function ProPaywall({ visible, onClose, bron }: ProPaywallProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Twee echte verschillen plus één eerlijke reden. De eerste twee komen letterlijk uit
  // `monetisatie.ts` en staan met dezelfde woorden in `StoryLimitModal` — wie de limietmelding
  // zag, moet hier hetzelfde teruglezen in plaats van vijf andere beloften.
  const voordelen: { icoon: IoniconNaam; tekst: string }[] = [
    { icoon: 'infinite-outline', tekst: t((s) => s.pro.voordeelOnbeperkt) },
    { icoon: 'eye-off-outline', tekst: t((s) => s.pro.voordeelGeenOnderbreking) },
    { icoon: 'heart-outline', tekst: t((s) => s.pro.voordeelSupport) },
  ];

  // Het venster is een `Modal` die altijd gemonteerd staat, dus "getoond" is `visible` dat op
  // `true` springt — niet het monteren. Zonder deze voorwaarde zou elk scherm dat de paywall
  // klaarzet er meteen een weergave voor tellen.
  useEffect(() => {
    if (visible) {
      logStoryEvent(ANALYTICS_EVENTS.PAYWALL_VIEWED, { tier: 'pro', source: bron });
    }
  }, [visible, bron]);

  // Sluiten zet de plankeuze terug op de standaard, zodat het venster bij een volgende opening
  // niet met de vorige keuze begint. Dat gebeurt hier en niet in het effect hierboven: een
  // `setState` in een effect op `visible` is een extra render-ronde voor iets wat de aanleiding
  // (de tik waarmee je sluit) zelf al weet.
  function sluit() {
    setSelectedPlan('yearly');
    onClose();
  }

  /**
   * Wat de hoofdknop doet zolang er geen Billing is: uitleggen dat er niets te kopen valt.
   *
   * De knop staat `disabled`, dus dit loopt alleen via de toetsenbord- en
   * schermlezerroute — vandaar dat het geen no-op is. Hier stond `setTrial(7)`; zie de 🚩 in de
   * componentbeschrijving hierboven voor waarom dat weg moest en wat er moet gebeuren voordat het
   * terugkomt.
   *
   * De gebeurtenis wordt nog steeds gelogd, met **`status: 'blocked_no_billing'`** en niet met
   * `'trial_started'`. Dat is de bestaande afspraak uit `constants/analytics.ts`: rijen uit de
   * stubperiode moeten later te filteren zijn, en een "gestart" dat nooit een aankoop kon worden
   * vervuilt de trechter blijvend. Er gaat om dezelfde reden geen bedrag of valuta in mee.
   */
  function toonBillingNietBeschikbaar() {
    // Fire-and-forget: `logStoryEvent` gaat naar `analytics.log`, die nooit gooit en niets
    // teruggeeft. Er valt hier dus niets te awaiten en niets te vangen.
    logStoryEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ATTEMPT, {
      tier: 'pro',
      source: bron,
      status: 'blocked_no_billing',
      plan: selectedPlan,
    });

    // `nogNietTitel` / `nogNietTekst` bestonden al in alle vier de talen en raakten in FASE 3
    // ongebruikt toen de proefperiodeknop hun plaats innam. Ze zeggen precies wat hier nodig is
    // ("er is niets afgeschreven"), dus hergebruikt in plaats van een tweede set sleutels die
    // hetzelfde zegt.
    meld(
      t((s) => s.pro.nogNietTitel),
      t((s) => s.pro.nogNietTekst),
      t((s) => s.instellingen.ok),
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={sluit}>
      <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.6) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={sluit} />

        <View style={[styles.venster, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={sluit}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t((s) => s.pro.sluiten)}
            style={styles.sluitKnop}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </Pressable>

          {/* Scrollbaar: vijf voordelen plus prijzen passen op een kleine telefoon in landschap
              niet zonder. */}
          <ScrollView contentContainerStyle={styles.inhoud} showsVerticalScrollIndicator={false}>
            <View style={[styles.merkCirkel, { backgroundColor: withAlpha(theme.accent, 0.14) }]}>
              <Ionicons name="star" size={32} color={theme.accent} />
            </View>

            <View style={styles.kopTekst}>
              <ThemedText type="title">{t((s) => s.pro.paywallTitel)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
                {t((s) => s.pro.paywallOndertitel)}
              </ThemedText>
            </View>

            <View style={styles.voordelen}>
              {voordelen.map((voordeel) => (
                <View key={voordeel.tekst} style={styles.voordeel}>
                  <Ionicons name={voordeel.icoon} size={20} color={theme.accent} />
                  <ThemedText type="small" style={styles.voordeelTekst}>
                    {voordeel.tekst}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Plan selection */}
            <View style={styles.planSelectie}>
              <Pressable
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.planButton,
                  {
                    backgroundColor:
                      selectedPlan === 'monthly' ? theme.accent : theme.backgroundElement,
                    borderWidth: selectedPlan === 'monthly' ? 0 : 1,
                    borderColor: theme.textSecondary,
                  },
                ]}>
                <ThemedText
                  type="bodyBold"
                  style={{
                    color: selectedPlan === 'monthly' ? theme.background : theme.text,
                    textAlign: 'center',
                  }}>
                  {t((s) => s.pro.prijsMaand)}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selectedPlan === 'monthly' ? theme.background : theme.textSecondary,
                    textAlign: 'center',
                  }}>
                  {t((s) => s.pro.prijsMaandNoot)}
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setSelectedPlan('yearly')}
                style={[
                  styles.planButton,
                  {
                    backgroundColor:
                      selectedPlan === 'yearly' ? theme.accent : theme.backgroundElement,
                    borderWidth: selectedPlan === 'yearly' ? 0 : 1,
                    borderColor: theme.textSecondary,
                  },
                ]}>
                <ThemedText
                  type="bodyBold"
                  style={{
                    color: selectedPlan === 'yearly' ? theme.background : theme.text,
                    textAlign: 'center',
                  }}>
                  {t((s) => s.pro.prijsJaar)}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selectedPlan === 'yearly' ? theme.background : theme.textSecondary,
                    textAlign: 'center',
                  }}>
                  {t((s) => s.pro.prijsJaarNoot)}
                </ThemedText>
              </Pressable>
            </View>

            {/* Trial info box */}
            <View style={[styles.trialBox, { backgroundColor: withAlpha(theme.accent, 0.1) }]}>
              <Ionicons name="gift-outline" size={20} color={theme.accent} />
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyBold" themeColor="accent">
                  {t((s) => s.pro.trialOffer)}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {t((s) => s.pro.trialOfferDescription)}
                </ThemedText>
              </View>
            </View>

            {/* Uitgeschakeld tot Billing er is. `theme.inactive` in plaats van `theme.accent`,
                zodat de knop er ook uitziet zoals hij werkt — een uitgeschakelde knop in
                accentkleur leest als een knop die het doet en die je tik negeert. Zelfde vorm als
                `AuthKnop`. `accessibilityState` zegt het ook tegen de schermlezer. */}
            <AnimatedPressable
              onPress={toonBillingNietBeschikbaar}
              disabled
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityHint={t((s) => s.pro.nogNietTekst)}
              style={[styles.hoofdKnop, { backgroundColor: theme.inactive }]}>
              {/* `theme.text` en niet `theme.background` zoals op de actieve knop: dat laatste
                  geeft 2,15:1 op `inactive` en is nauwelijks te lezen. De gedempte vúlling zegt
                  al dat de knop uit staat; het label hoeft daar niet in mee te verdwijnen. Een
                  kort uitgeschakelde knop mag onleesbaar zijn (WCAG 1.4.3 zondert inactieve
                  elementen uit), maar deze staat uit tot Billing er is. */}
              <ThemedText type="bodyBold" style={{ color: theme.text }}>
                {t((s) => s.pro.startTrialComingSoon)}
              </ThemedText>
            </AnimatedPressable>

            <Pressable onPress={sluit} accessibilityRole="button" style={styles.laterKnop}>
              <ThemedText type="link" themeColor="textSecondary">
                {t((s) => s.pro.misschienLater)}
              </ThemedText>
            </Pressable>

            <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
              {t((s) => s.pro.voorbehoud)}
            </ThemedText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  venster: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: Radii.card,
  },
  sluitKnop: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    // Boven de ScrollView, anders vangt die de tik op.
    zIndex: 1,
  },
  inhoud: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    paddingTop: Spacing.five,
  },
  merkCirkel: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kopTekst: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  voordelen: {
    width: '100%',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  voordeel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  voordeelTekst: {
    flex: 1,
  },
  prijsVak: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radii.button,
  },
  hoofdKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  laterKnop: {
    paddingVertical: Spacing.one,
  },
  planSelectie: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  planButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  trialBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.button,
  },
});
