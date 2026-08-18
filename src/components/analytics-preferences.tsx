import { Switch } from 'react-native';

import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAnalyticsStore } from '@/store/analytics-store';

/**
 * De privacysectie van Instellingen: één schakelaar voor gebruiksstatistieken.
 *
 * Zelfde vorm als `email-preferences.tsx` — het component levert de hele sectie inclusief kop en
 * voetnoot, want de uitleg gaat over de schakelaar én over wat er zonder die schakelaar gebeurt,
 * en dat past niet in een regel.
 *
 * **De voetnoot zegt wat er verzameld wordt, niet dat het "anoniem" is.** Dat laatste zou niet
 * kloppen: zodra je bent ingelogd hangt het app-instance-id aan je account (zie
 * `analytics.zetGebruiker`). "Pseudoniem" is het juiste woord en "we koppelen het aan je account"
 * is de eerlijke zin.
 */
export function AnalyticsVoorkeuren() {
  const theme = useTheme();
  const { t } = useVertaling();
  const toestemming = useAnalyticsStore((state) => state.toestemming);
  const zetToestemming = useAnalyticsStore((state) => state.zetToestemming);

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectiePrivacy)}
      voet={t((s) => s.instellingen.analyticsVoet)}>
      <SettingsItem
        icoon="stats-chart-outline"
        label={t((s) => s.instellingen.analytics)}
        uitleg={t((s) => s.instellingen.analyticsUitleg)}
        rechts={
          <Switch
            value={toestemming}
            onValueChange={zetToestemming}
            trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
            thumbColor={theme.background}
          />
        }
      />
    </SettingsSectie>
  );
}
