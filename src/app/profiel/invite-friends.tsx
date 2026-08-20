import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { DeelOpties } from '@/components/deel-opties';
import { SettingsSectie } from '@/components/settings-section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ANALYTICS_EVENTS } from '@/constants/analytics';
import { deelBerichtMetLink, kopieer } from '@/constants/deel';
import { meld } from '@/constants/dialoog';
import { haptics } from '@/constants/haptics';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { logStoryEvent } from '@/hooks/useAnalytics';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAuthStore } from '@/store/auth-store';
import { useReferralStore } from '@/store/referral-store';
import { PRO_WEEK_DAGEN, type BeloningSoort } from '@/types/referral';

/**
 * Vrienden uitnodigen (`/profiel/invite-friends`).
 *
 * **De opdracht plaatst dit scherm op `(tabs)/profiel/invite-friends.tsx`, en daar kan het niet
 * staan.** `(tabs)/profiel.tsx` bestaat en mag niet verwijderd worden (zie CLAUDE.md, "File
 * deletion"); een map `(tabs)/profiel/` ernaast zou met een `index.tsx` dezelfde route `/profiel`
 * opeisen en Expo Router laten struikelen. Het staat dus als stack-scherm náást de tabbladen,
 * precies zoals `profiel/settings` en `profiel/upload-avatar`, en is in `src/app/_layout.tsx`
 * geregistreerd.
 *
 * ## Wat hier echt werkt en wat nog niet
 *
 * De code is echt (afgeleid van het gebruiker-id, uniek in `public.referrals`), het delen werkt,
 * en de tellers lezen de gesynchroniseerde stand. Wat ontbreekt is de andere kant: een vriend die
 * de code invoert. Dat kan principieel niet vanaf de client — RLS geeft een lezer alleen zijn
 * eigen rij — en wordt een `security definer` RPC. Daarom staat dat als zin op het scherm
 * (`referral.nogNietActief`) in plaats van als stille afwezigheid: een teller die op nul blijft
 * staan zonder uitleg leest als een kapotte app.
 */
export default function UitnodigenScreen() {
  const theme = useTheme();
  const { t } = useVertaling();

  const userId = useAuthStore((state) => state.user?.id ?? null);
  const data = useReferralStore((state) => state.data);
  const generateReferralCode = useReferralStore((state) => state.generateReferralCode);
  const claimReward = useReferralStore((state) => state.claimReward);
  // Een getal en geen object: zo hertekent het scherm alleen als de stand écht wijzigt.
  const beschikbaar = useReferralStore((state) =>
    state.data === null ? 0 : Math.max(0, state.data.rewardsEarned - state.data.rewardsClaimed),
  );

  /** De terugkoppeling onder de code, nadat die gekopieerd is. `null` = nog niets gedaan. */
  const [codeMelding, setCodeMelding] = useState<string | null>(null);

  /**
   * De rij aanmaken hoort in een effect en niet in de render: `generateReferralCode()` schrijft
   * bij de eerste aanroep de store bij, en een component die tijdens zijn eigen render muteert is
   * de kortste weg naar een oneindige hertekening. Draait opnieuw zodra er een andere lezer
   * inlogt — de code hoort bij het account, niet bij het toestel. De sleutel is `user.id` en niet
   * het hele user-object: supabase-js geeft bij elke token-refresh een nieuw object voor dezelfde
   * persoon, en daarop reageren zou elk uur een overbodige ronde opleveren.
   */
  useEffect(() => {
    if (!userId) return;
    generateReferralCode();
  }, [userId, generateReferralCode]);

  // De rij van een vórige lezer op dit toestel toont geen code: die hoort niet bij deze sessie.
  const code = userId !== null && data?.userId === userId ? data.referralCode : '';
  const vrienden = data?.friendsInvited.length ?? 0;
  const verdiend = data?.rewardsEarned ?? 0;

  const bericht = deelBerichtMetLink(t((s) => s.referral.bericht)(code));

  async function kopieerCode() {
    haptics.tik();
    const gelukt = await kopieer(code);
    if (gelukt) haptics.succes();
    setCodeMelding(gelukt ? t((s) => s.referral.codeGekopieerd) : t((s) => s.deel.nietMogelijk));
  }

  function wisselIn(soort: BeloningSoort) {
    // `claimReward` boekt af én verzilvert; komt er `false` uit, dan was er niets in te wisselen
    // en is er ook niets te melden.
    if (!claimReward(soort)) return;

    haptics.succes();
    logStoryEvent(ANALYTICS_EVENTS.REWARD_CLAIMED, { soort });
    meld(
      t((s) => s.referral.geclaimdTitel),
      soort === 'verhaal'
        ? t((s) => s.referral.geclaimdVerhaal)
        : t((s) => s.referral.geclaimdProWeek)(PRO_WEEK_DAGEN),
      t((s) => s.referral.ok),
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t((s) => s.referral.titel) }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.kop}>
          <View style={[styles.icoonRing, { backgroundColor: withAlpha(theme.accent, 0.15) }]}>
            <Ionicons name="gift-outline" size={30} color={theme.accent} />
          </View>
          <ThemedText type="title" style={styles.gecentreerd}>
            {t((s) => s.referral.kop)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
            {t((s) => s.referral.uitleg)}
          </ThemedText>
        </View>

        {/* De code zelf: groot, in blokletters met ruime letterafstand, want hij wordt voorgelezen
            en overgetypt. Zonder sessie staat er geen streepje maar een zin die zegt waarom. */}
        <View style={styles.codeBlok}>
          <ThemedText type="caption" themeColor="textSecondary">
            {t((s) => s.referral.jouwCode).toUpperCase()}
          </ThemedText>
          {code === '' ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t((s) => s.referral.geenCode)}
            </ThemedText>
          ) : (
            <>
              <View style={[styles.codeKaart, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="display" style={styles.codeTekst}>
                  {code}
                </ThemedText>
              </View>
              <AnimatedPressable
                // `kopieerCode` geeft zelf een tik en bij succes een zwaarder signaal.
                haptisch={false}
                onPress={() => void kopieerCode()}
                accessibilityRole="button"
                accessibilityLabel={t((s) => s.referral.codeKopieren)}
                style={[styles.kopieerKnop, { borderColor: theme.accent }]}>
                <Ionicons name="copy-outline" size={16} color={theme.accent} />
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {t((s) => s.referral.codeKopieren)}
                </ThemedText>
              </AnimatedPressable>
              {codeMelding !== null && (
                <ThemedText type="caption" themeColor="textSecondary">
                  {codeMelding}
                </ThemedText>
              )}
            </>
          )}
        </View>

        {/* Dezelfde drie wegen naar buiten als bij een mijlpaal en een citaat. Zonder code valt er
            niets te versturen — een uitnodiging zonder code is een lege uitnodiging. */}
        {code !== '' && (
          <View style={styles.deelBlok}>
            <ThemedText type="smallBold">{t((s) => s.referral.deelUitnodiging)}</ThemedText>
            <DeelOpties
              bericht={bericht}
              deelTitel={t((s) => s.referral.deelTitel)}
              accent={theme.accent}
              onGedeeld={() => logStoryEvent(ANALYTICS_EVENTS.INVITE_SHARED, {})}
            />
          </View>
        )}

        {/* De twee tellers. Getal en label los, net als de kaarten op Voortgang: het cijfer is het
            antwoord, het label alleen het kopje erboven. */}
        <View style={styles.tellerRij}>
          <Teller waarde={vrienden} label={t((s) => s.referral.vriendenUitgenodigd)} />
          <Teller waarde={verdiend} label={t((s) => s.referral.beloningenVerdiend)} />
        </View>

        <SettingsSectie
          titel={t((s) => s.referral.beloningenKop)}
          voet={
            beschikbaar > 0
              ? t((s) => s.referral.beschikbaar)(beschikbaar)
              : t((s) => s.referral.geenBeloningen)
          }>
          <BeloningRegel
            icoon="book-outline"
            label={t((s) => s.referral.beloningVerhaal)}
            uitleg={t((s) => s.referral.beloningVerhaalUitleg)}
            knop={t((s) => s.referral.claim)}
            actief={beschikbaar > 0}
            onPress={() => wisselIn('verhaal')}
          />
          <BeloningRegel
            icoon="sparkles-outline"
            label={t((s) => s.referral.beloningProWeek)}
            uitleg={t((s) => s.referral.beloningProWeekUitleg)(PRO_WEEK_DAGEN)}
            knop={t((s) => s.referral.claim)}
            actief={beschikbaar > 0}
            onPress={() => wisselIn('pro-week')}
          />
        </SettingsSectie>

        <View style={styles.uitlegBlok}>
          <ThemedText type="smallBold">{t((s) => s.referral.hoeWerktKop)}</ThemedText>
          {[
            t((s) => s.referral.stap1),
            t((s) => s.referral.stap2),
            t((s) => s.referral.stap3),
          ].map((stap, index) => (
            <View key={stap} style={styles.stapRij}>
              <View style={[styles.stapBol, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText type="small" style={styles.stapTekst}>
                {stap}
              </ThemedText>
            </View>
          ))}
          {/* Geen "Soon"-badge maar een hele zin: het scherm werkt wél, alleen de andere kant van
              de uitnodiging nog niet, en dat verschil past niet in vier letters. */}
          <ThemedText type="caption" themeColor="textSecondary" style={styles.voorbehoud}>
            {t((s) => s.referral.nogNietActief)}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Teller({ waarde, label }: { waarde: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.tellerKaart, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="display">{waarde}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.gecentreerd}>
        {label}
      </ThemedText>
    </View>
  );
}

/**
 * Eén in te wisselen beloning.
 *
 * Bewust geen `SettingsItem` met een `onPress`: dan zou de hele regel een knop zijn en zou een
 * per ongeluk aangeraakte regel meteen een beloning opmaken. De knop is de knop; de rest van de
 * regel is uitleg. Zonder beschikbare beloning is hij inert en gedempt in plaats van verborgen —
 * je moet kunnen zien wát je verdient voordat je het verdient.
 */
function BeloningRegel({
  icoon,
  label,
  uitleg,
  knop,
  actief,
  onPress,
}: {
  icoon: 'book-outline' | 'sparkles-outline';
  label: string;
  uitleg: string;
  knop: string;
  actief: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.beloningRegel}>
      <Ionicons name={icoon} size={20} color={actief ? theme.accent : theme.inactive} />
      <View style={styles.beloningTekst}>
        <ThemedText type="body">{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {uitleg}
        </ThemedText>
      </View>
      <AnimatedPressable
        disabled={!actief}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${knop}: ${label}`}
        accessibilityState={{ disabled: !actief }}
        style={[
          styles.claimKnop,
          { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: actief ? theme.background : theme.inactive }}>
          {knop}
        </ThemedText>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  kop: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  icoonRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gecentreerd: {
    textAlign: 'center',
  },
  codeBlok: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  codeKaart: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Radii.card,
  },
  codeTekst: {
    // Ruime letterafstand: deze code wordt overgetypt, en dan is elk teken op zichzelf lezen
    // belangrijker dan een compact woordbeeld.
    letterSpacing: 4,
  },
  kopieerKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
    borderWidth: 1,
  },
  deelBlok: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  tellerRij: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  tellerKaart: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radii.card,
  },
  beloningRegel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 52,
  },
  beloningTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  claimKnop: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
  uitlegBlok: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  stapRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stapBol: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stapTekst: {
    flex: 1,
  },
  voorbehoud: {
    marginTop: Spacing.two,
  },
});
