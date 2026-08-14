import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAuthStore } from '@/store/auth-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * Hoe vaak "X minuten geleden" opnieuw wordt uitgerekend.
 *
 * De tekst is afgeleid van een tijdstip, dus zonder tikker staat er na een half uur nog steeds
 * "zojuist". Een halve minuut is fijn genoeg voor een regel die in minuten telt en kost per
 * Profiel-bezoek een handvol renders — een tikker per seconde zou hetzelfde beeld opleveren voor
 * dertig keer het werk.
 */
const TIK_MS = 30_000;

type Status = { sleutel: 'bezig' | 'wachtend' | 'mislukt' | 'klaar'; tekst: string };

/**
 * Statusregel voor de synchronisatie met Supabase (R8.AUTH deel 3).
 *
 * Staat onder het account op Profiel. Hij is er niet om iets te doen — synchroniseren gaat
 * vanzelf en probeert zichzelf opnieuw — maar om de vraag "staat mijn leeswerk wel ergens?"
 * beantwoordbaar te maken zonder de Supabase-dashboard erbij te pakken. Zonder sessie rendert
 * hij niets: er valt dan niets te synchroniseren en een melding daarover zou alleen verwarren.
 */
export function SyncIndicator() {
  const theme = useTheme();
  const { t } = useVertaling();
  const isIngelogd = useAuthStore((state) => state.user !== null);
  const isSyncing = useVoortgangStore((state) => state.isSyncing);
  const syncError = useVoortgangStore((state) => state.syncError);
  const lastSyncTime = useVoortgangStore((state) => state.lastSyncTime);
  const heeftOnverzonden = useVoortgangStore((state) => state.heeftOnverzondenWijzigingen);

  const [nu, setNu] = useState(() => Date.now());
  useEffect(() => {
    const tikker = setInterval(() => setNu(Date.now()), TIK_MS);
    return () => clearInterval(tikker);
  }, []);

  if (!isIngelogd) return null;

  const status = bepaalStatus();
  const kleur = statusKleur(status.sleutel);

  return (
    <View style={styles.rij}>
      {status.sleutel === 'bezig' ? (
        <ActivityIndicator size="small" color={theme.textSecondary} style={styles.spinner} />
      ) : (
        <Ionicons name={statusIcoon(status.sleutel)} size={14} color={kleur} />
      )}
      <ThemedText type="small" style={{ color: kleur }}>
        {status.tekst}
      </ThemedText>
    </View>
  );

  function bepaalStatus(): Status {
    if (isSyncing) return { sleutel: 'bezig', tekst: t((s) => s.sync.bezig) };
    // De fout eerst: er staat dan per definitie ook iets open, en "offline" zegt meer dan
    // "wachtend". De ruwe Supabase-melding tonen we niet — die is Engelstalig, technisch, en de
    // gebruiker kan er niets mee. Hij staat wel in de console voor ons.
    if (syncError) return { sleutel: 'mislukt', tekst: t((s) => s.sync.mislukt) };
    if (heeftOnverzonden) return { sleutel: 'wachtend', tekst: t((s) => s.sync.wachtend) };
    if (lastSyncTime === null) return { sleutel: 'wachtend', tekst: t((s) => s.sync.nooit) };
    return { sleutel: 'klaar', tekst: verstreken(lastSyncTime) };
  }

  function verstreken(tijdstip: number): string {
    const seconden = Math.max(0, Math.round((nu - tijdstip) / 1000));
    if (seconden < 60) return t((s) => s.sync.zojuist);
    const minuten = Math.floor(seconden / 60);
    if (minuten < 60) return t((s) => s.sync.minutenGeleden)(minuten);
    const uren = Math.floor(minuten / 60);
    if (uren < 24) return t((s) => s.sync.urenGeleden)(uren);
    return t((s) => s.sync.langGeleden);
  }

  function statusKleur(sleutel: Status['sleutel']): string {
    // Geen rood bij een mislukking: er is niets kwijt en de app lost het zelf op. Amber zegt
    // "let op, nog niet klaar" zonder te suggereren dat er iets stuk is.
    if (sleutel === 'mislukt') return theme.waarschuwing;
    if (sleutel === 'klaar') return theme.succes;
    return theme.textSecondary;
  }

  function statusIcoon(sleutel: Status['sleutel']): IoniconNaam {
    if (sleutel === 'mislukt') return 'cloud-offline-outline';
    if (sleutel === 'klaar') return 'checkmark-circle-outline';
    return 'cloud-upload-outline';
  }
}

const styles = StyleSheet.create({
  rij: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  spinner: {
    // Zo breed als het icoon dat hij vervangt, anders verspringt de tekst bij elke statuswissel.
    width: 14,
  },
});
