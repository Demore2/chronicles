import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { SettingsItem } from '@/components/settings-section';
import { ThemedText } from '@/components/themed-text';
import { haptics } from '@/constants/haptics';
import { HERINNERING_MINUUT_STAP } from '@/constants/notificaties';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useNotificatieStore } from '@/store/notificatie-store';

/**
 * De dagelijkse herinnering in Instellingen: een schakelaar, en eronder het tijdstip.
 *
 * **De schakelaar is terug.** Hij is een tijd lang weg geweest — de herinnering stond toen vast
 * aan via `ALTIJD_AAN_SLEUTELS` — en dat is teruggedraaid: een melding die elke dag afgaat en die
 * je binnen de app niet uit kunt zetten, verwijst de lezer voor iets alledaags naar de
 * Android-instellingen. De streakwaarschuwing en de mijlpalen staan nog wél vast aan en hebben
 * juist gééń regel meer; zie de kop van `notification-preferences.tsx` voor dat onderscheid.
 *
 * **De tijdregel verdwijnt als de herinnering uit staat.** Een tijdstip kiezen voor een melding
 * die niet komt is een instelling zonder gevolg. `SettingsSectie` tekent zijn lijnen tussen zijn
 * kinderen met `Children.toArray`, dus een weggelaten regel laat geen zwevende scheidingslijn
 * achter.
 *
 * Het vragen om toestemming zit hier niet: dat doet de reader na het eerste afgeronde hoofdstuk
 * (`biedHerinneringAan`), en ontbreekt de toestemming, dan zet `notification-preferences.tsx` er
 * een regel voor bovenaan de sectie.
 *
 * Twee losse exports in plaats van één component, omdat `SettingsSectie` zijn scheidingslijnen
 * tussen zijn *directe* kinderen tekent (`Children.toArray`). Eén component dat twee regels
 * teruggeeft telt daar als één kind, en dan valt de lijn ertussen weg.
 *
 * **Bewust geen `@react-native-community/datetimepicker`.** Die is native, dus hij vraagt na het
 * pullen om een nieuwe dev client, en hij bestaat niet op web — precies de plek waar dit project
 * zijn schermen bekijkt. De kiezer hieronder is gewone React Native, werkt overal hetzelfde, en
 * volgt het palet in plaats van dat van het systeem.
 */
export function HerinneringRegel() {
  const theme = useTheme();
  const { t } = useVertaling();
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  const setHerinnering = useNotificatieStore((state) => state.setHerinnering);

  return (
    <SettingsItem
      icoon="notifications-outline"
      label={t((s) => s.profiel.herinnering)}
      uitleg={t((s) => s.profiel.herinneringUitleg)}
      rechts={
        <Switch
          value={herinneringAan}
          onValueChange={setHerinnering}
          trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          thumbColor={theme.background}
        />
      }
    />
  );
}

/**
 * De tijdregel eronder. Rendert `null` zolang de herinnering uit staat — zie de kop: een tijdstip
 * voor een melding die niet komt.
 */
export function HerinneringTijd() {
  const { t } = useVertaling();
  const herinneringAan = useNotificatieStore((state) => state.herinneringAan);
  const uur = useNotificatieStore((state) => state.herinneringUur);
  const minuut = useNotificatieStore((state) => state.herinneringMinuut);
  const setHerinneringTijd = useNotificatieStore((state) => state.setHerinneringTijd);
  const [kiezerOpen, setKiezerOpen] = useState(false);

  // Ná de hooks, niet ervoor: een vroege return boven `useState` zou de hookvolgorde laten
  // verspringen op het moment dat de schakelaar omgaat.
  if (!herinneringAan) return null;

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
