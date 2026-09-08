import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { APP_VERSIE } from '@/constants/app-info';
import { meld } from '@/constants/dialoog';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst } from '@/store/sync-hulp';

/** Gelijk aan de `check`-constraint op `public.feedback.bericht` — één plek zou beter zijn, maar
 *  Postgres kan zijn limiet niet naar de app exporteren, dus staat hij hier expliciet naast. */
const MAX_TEKENS = 2000;

type FeedbackSoort = 'bug' | 'idee';

const SOORTEN: { waarde: FeedbackSoort; icoon: IoniconNaam }[] = [
  { waarde: 'bug', icoon: 'bug-outline' },
  { waarde: 'idee', icoon: 'bulb-outline' },
];

type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Het feedbackvenster achter het spreekwolkje op Profiel.
 *
 * **Het bericht gaat echt weg.** Het belandt als rij in `public.feedback` in Supabase (RLS: je mag
 * alleen je eigen rijen invoegen en lezen), niet in een `setTimeout` die daarna "bedankt!" zegt.
 * Dat onderscheid is hier het hele punt: een bedankje voor een bericht dat nergens aankomt is
 * precies het soort knop-die-doet-alsof waar de rest van dit scherm vanaf is gestapt.
 *
 * Mislukt het versturen, dan blijft de getypte tekst staan en zegt de melding dat ook — niets is
 * frustrerender dan een leeg tekstvak na een timeout. Er is bewust géén offline wachtrij zoals bij
 * de voortgangssync: dit is een losse mededeling, geen groeiende toestand, en een bericht dat een
 * uur later alsnog vertrekt terwijl de gebruiker denkt dat het mislukt is, is verwarrender dan
 * opnieuw op verzenden drukken.
 *
 * De `soort` reist mee als kolom en niet als woord in de tekst, zodat bugmeldingen straks te
 * filteren zijn zonder de berichten te lezen. Appversie en platform gaan mee omdat een bugmelding
 * zonder die twee zelden bruikbaar is.
 */
export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const { height: vensterHoogte } = useWindowDimensions();

  /**
   * Het invoerveld mag meegroeien, maar niet ongelimiteerd: zonder bovengrens duwt een lang bericht
   * de teller en de verzendknop van het scherm af, en omdat dit venster geen ScrollView is kun je
   * er dan niet meer bij — je kunt je eigen feedback niet meer versturen. 2000 tekens zijn
   * toegestaan, dus die toestand is geen randgeval maar het te verwachten gebruik. Boven deze
   * hoogte scrollt het veld intern. De grens schaalt mee met het scherm, zodat er ook op een lage
   * viewport (liggend, of met het toetsenbord open) ruimte overblijft voor de knop.
   */
  const maxInvoerHoogte = Math.max(96, Math.min(200, Math.round(vensterHoogte * 0.25)));
  const user = useAuthStore((state) => state.user);

  const [soort, setSoort] = useState<FeedbackSoort>('bug');
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);

  const soortLabel: Record<FeedbackSoort, string> = {
    bug: t((s) => s.feedback.soortBug),
    idee: t((s) => s.feedback.soortIdee),
  };

  function sluitEnWis() {
    setBericht('');
    setBezig(false);
    onClose();
  }

  async function verstuur() {
    const tekst = bericht.trim();

    if (tekst.length === 0) {
      meld(
        t((s) => s.feedback.leegTitel),
        t((s) => s.feedback.leegTekst),
        t((s) => s.feedback.ok),
      );
      return;
    }

    // De auth-poort laat dit scherm alleen met sessie zien, dus dit is een vangnet en geen pad dat
    // de gebruiker normaal tegenkomt. Zonder `user_id` weigert de RLS-policy de rij toch.
    if (!user) {
      meld(
        t((s) => s.feedback.misluktTitel),
        t((s) => s.feedback.geenSessie),
        t((s) => s.feedback.ok),
      );
      return;
    }

    setBezig(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        soort,
        bericht: tekst,
        app_versie: APP_VERSIE,
        platform: Platform.OS,
      });
      if (error) throw error;

      sluitEnWis();
      meld(
        t((s) => s.feedback.geluktTitel),
        t((s) => s.feedback.geluktTekst),
        t((s) => s.feedback.ok),
      );
    } catch (fout) {
      // De tekst blijft staan: dit is het enige exemplaar ervan.
      setBezig(false);
      console.warn('[feedback] versturen mislukt:', foutTekst(fout));
      meld(
        t((s) => s.feedback.misluktTitel),
        t((s) => s.feedback.misluktTekst),
        t((s) => s.feedback.ok),
      );
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      // Android-hardwareknop; zonder dit blijft het venster hangen bij "terug".
      onRequestClose={bezig ? undefined : onClose}>
      <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.45) }]}>
        {/* Tik naast het venster sluit het, net als een systeem-sheet. Niet tijdens het verzenden:
            dan zou het bericht halverwege zijn eigen versturen verdwijnen. */}
        <Pressable style={styles.buitenkant} onPress={bezig ? undefined : onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.blad}>
          <View style={[styles.venster, { backgroundColor: theme.background }]}>
            <View style={styles.kop}>
              <View style={styles.kopTekst}>
                <ThemedText type="subtitle">{t((s) => s.feedback.titel)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.feedback.ondertitel)}
                </ThemedText>
              </View>
              <Pressable
                onPress={bezig ? undefined : onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t((s) => s.feedback.sluiten)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.soortRij}>
              {SOORTEN.map((optie) => {
                const actief = soort === optie.waarde;
                return (
                  <Pressable
                    key={optie.waarde}
                    onPress={() => setSoort(optie.waarde)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: actief }}
                    style={[
                      styles.soortKnop,
                      { backgroundColor: actief ? theme.accent : theme.backgroundElement },
                    ]}>
                    <Ionicons
                      name={optie.icoon}
                      size={18}
                      color={actief ? theme.background : theme.text}
                    />
                    <ThemedText
                      type="small"
                      style={{ color: actief ? theme.background : theme.text }}>
                      {soortLabel[optie.waarde]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={[
                styles.invoer,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  maxHeight: maxInvoerHoogte,
                },
              ]}
              placeholder={
                soort === 'bug'
                  ? t((s) => s.feedback.plaatshouderBug)
                  : t((s) => s.feedback.plaatshouderIdee)
              }
              placeholderTextColor={theme.textSecondary}
              value={bericht}
              onChangeText={setBericht}
              editable={!bezig}
              multiline
              maxLength={MAX_TEKENS}
              textAlignVertical="top"
              accessibilityLabel={t((s) => s.feedback.titel)}
            />

            <ThemedText type="caption" themeColor="textSecondary" style={styles.teller}>
              {t((s) => s.feedback.tekensOver)(MAX_TEKENS - bericht.length)}
            </ThemedText>

            <AnimatedPressable
              onPress={verstuur}
              disabled={bezig}
              accessibilityRole="button"
              accessibilityState={{ disabled: bezig }}
              style={[
                styles.verstuurKnop,
                { backgroundColor: theme.accent, opacity: bezig ? 0.6 : 1 },
              ]}>
              <ThemedText type="bodyBold" style={{ color: theme.background }}>
                {bezig ? t((s) => s.feedback.verzenden) : t((s) => s.feedback.versturen)}
              </ThemedText>
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buitenkant: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blad: {
    // Alleen het onderste blad beweegt met het toetsenbord mee; de overlay blijft staan.
    justifyContent: 'flex-end',
  },
  venster: {
    gap: Spacing.three,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
  },
  kop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  kopTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  soortRij: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  soortKnop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  invoer: {
    minHeight: 132,
    padding: Spacing.three,
    borderRadius: Radii.button,
    fontSize: 16,
    lineHeight: 24,
  },
  teller: {
    textAlign: 'right',
  },
  verstuurKnop: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
});
