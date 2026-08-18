import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { SettingsItem } from '@/components/settings-section';
import { ThemedText } from '@/components/themed-text';
import { haptics } from '@/constants/haptics';
import { HERINNERING_MINUUT_STAP, notificaties } from '@/constants/notificaties';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useNotificatieStore } from '@/store/notificatie-store';

/**
 * De dagelijkse herinnering in Instellingen: een schakelaar en, zodra die aan staat, het tijdstip.
 *
 * Twee losse exports in plaats van één component, omdat `SettingsSectie` zijn scheidingslijnen
 * tussen zijn *directe* kinderen tekent (`Children.toArray`). Eén component dat twee regels
 * teruggeeft telt daar als één kind, en dan valt de lijn ertussen weg. Het tijdstip is bovendien
 * voorwaardelijk, en de sectie kan een `null`-kind wél netjes wegfilteren.
 *
 * **Bewust geen `@react-native-community/datetimepicker`.** Die is native, dus hij vraagt na het
 * pullen om een nieuwe dev client, en hij bestaat niet op web — precies de plek waar dit project
 * zijn schermen bekijkt. De kiezer hieronder is gewone React Native, werkt overal hetzelfde, en
 * volgt het palet in plaats van dat van het systeem.
 */
export function HerinneringSchakelaar() {
  const theme = useTheme();
  const { t } = useVertaling();
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  const setHerinnering = useNotificatieStore((state) => state.setHerinnering);
  const markeerToestemmingGevraagd = useNotificatieStore((state) => state.markeerToestemmingGevraagd);

  async function zetHerinnering(aan: boolean) {
    if (!aan) {
      setHerinnering(false);
      return;
    }
    // Aanzetten kan alleen als het systeem het toestaat. Zegt de gebruiker (of een eerdere
    // weigering) nee, dan blijft de schakelaar uit staan in plaats van iets te beloven wat de app
    // niet kan waarmaken. Het plannen zelf doet `useDagelijkseHerinnering`.
    const toegestaan = await notificaties.vraagToestemming();
    markeerToestemmingGevraagd();
    setHerinnering(toegestaan);
  }

  return (
    <SettingsItem
      icoon="notifications-outline"
      label={t((s) => s.profiel.herinnering)}
      uitleg={t((s) => s.profiel.herinneringUitleg)}
      rechts={
        <Switch
          value={herinneringAan}
          onValueChange={zetHerinnering}
          trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          thumbColor={theme.background}
        />
      }
    />
  );
}

/** De tijdregel eronder. Toon hem alleen als de herinnering aan staat. */
export function HerinneringTijd() {
  const { t } = useVertaling();
  const uur = useNotificatieStore((state) => state.herinneringUur);
  const minuut = useNotificatieStore((state) => state.herinneringMinuut);
  const setHerinneringTijd = useNotificatieStore((state) => state.setHerinneringTijd);
  const [kiezerOpen, setKiezerOpen] = useState(false);

  return (
    <>
      <SettingsItem
        icoon="time-outline"
        label={t((s) => s.instellingen.herinneringTijd)}
        waarde={t((s) => s.instellingen.tijdWaarde)(uur, minuut)}
        onPress={() => setKiezerOpen(true)}
      />
      <TijdKiezer
        visible={kiezerOpen}
        uur={uur}
        minuut={minuut}
        onClose={() => setKiezerOpen(false)}
        onOpslaan={(nieuwUur, nieuwMinuut) => {
          setHerinneringTijd(nieuwUur, nieuwMinuut);
          setKiezerOpen(false);
        }}
      />
    </>
  );
}

type TijdKiezerProps = {
  visible: boolean;
  uur: number;
  minuut: number;
  onClose: () => void;
  onOpslaan: (uur: number, minuut: number) => void;
};

function TijdKiezer({ visible, uur, minuut, onClose, onOpslaan }: TijdKiezerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withAlpha('#000000', 0.6) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* De inhoud bestaat alleen zolang het venster open staat. Dat is niet alleen zuiniger:
            het is ook hoe de kiezer bij elke opening weer op het ópgeslagen tijdstip begint. Een
            `useEffect` die de stand terugzet zou hetzelfde doen met een extra render erbij, en is
            precies wat de `react-hooks/set-state-in-effect`-regel afkeurt. */}
        {visible ? (
          <TijdKiezerInhoud uur={uur} minuut={minuut} onClose={onClose} onOpslaan={onOpslaan} />
        ) : null}
      </View>
    </Modal>
  );
}

type TijdKiezerInhoudProps = Omit<TijdKiezerProps, 'visible'>;

function TijdKiezerInhoud({ uur, minuut, onClose, onOpslaan }: TijdKiezerInhoudProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [gekozenUur, setGekozenUur] = useState(uur);
  const [gekozenMinuut, setGekozenMinuut] = useState(minuut);

  return (
    <View style={[styles.venster, { backgroundColor: theme.background }]}>
      <View style={styles.kopTekst}>
        <ThemedText type="subtitle">{t((s) => s.instellingen.tijdKiezerTitel)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.gecentreerd}>
          {t((s) => s.instellingen.tijdKiezerUitleg)}
        </ThemedText>
      </View>

      <ThemedText type="display" themeColor="accent">
        {t((s) => s.instellingen.tijdWaarde)(gekozenUur, gekozenMinuut)}
      </ThemedText>

      <View style={styles.wielen}>
        <Stapper
          label={t((s) => s.instellingen.uur)}
          waarde={String(gekozenUur).padStart(2, '0')}
          onOmhoog={() => setGekozenUur((huidig) => (huidig + 1) % 24)}
          onOmlaag={() => setGekozenUur((huidig) => (huidig + 23) % 24)}
        />
        <Stapper
          label={t((s) => s.instellingen.minuut)}
          waarde={String(gekozenMinuut).padStart(2, '0')}
          onOmhoog={() => setGekozenMinuut((huidig) => (huidig + HERINNERING_MINUUT_STAP) % 60)}
          onOmlaag={() =>
            setGekozenMinuut((huidig) => (huidig + 60 - HERINNERING_MINUUT_STAP) % 60)
          }
        />
      </View>

      <AnimatedPressable
        onPress={() => onOpslaan(gekozenUur, gekozenMinuut)}
        accessibilityRole="button"
        style={[styles.hoofdKnop, { backgroundColor: theme.accent }]}>
        <ThemedText type="bodyBold" style={{ color: theme.background }}>
          {t((s) => s.instellingen.tijdOpslaan)}
        </ThemedText>
      </AnimatedPressable>

      <Pressable onPress={onClose} accessibilityRole="button" style={styles.annuleerKnop}>
        <ThemedText type="link" themeColor="textSecondary">
          {t((s) => s.auth.annuleren)}
        </ThemedText>
      </Pressable>
    </View>
  );
}

type StapperProps = {
  label: string;
  waarde: string;
  onOmhoog: () => void;
  onOmlaag: () => void;
};

/**
 * Eén kolom van de kiezer. De waarden lopen rond (23 → 00), zodat je vanuit elke stand met een
 * paar tikken bij het gewenste getal bent en er geen doodlopend einde is.
 */
function Stapper({ label, waarde, onOmhoog, onOmlaag }: StapperProps) {
  const theme = useTheme();

  function stap(actie: () => void) {
    haptics.tik();
    actie();
  }

  return (
    <View style={styles.stapper}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label.toUpperCase()}
      </ThemedText>
      <Pressable
        onPress={() => stap(onOmhoog)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${label} +`}>
        <Ionicons name="chevron-up" size={24} color={theme.accent} />
      </Pressable>
      <View style={[styles.waardeVak, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="title">{waarde}</ThemedText>
      </View>
      <Pressable
        onPress={() => stap(onOmlaag)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${label} -`}>
        <Ionicons name="chevron-down" size={24} color={theme.accent} />
      </Pressable>
    </View>
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
    maxWidth: 360,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  kopTekst: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  gecentreerd: {
    textAlign: 'center',
  },
  wielen: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  stapper: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  waardeVak: {
    minWidth: 72,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.button,
  },
  hoofdKnop: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  annuleerKnop: {
    paddingVertical: Spacing.one,
  },
});
