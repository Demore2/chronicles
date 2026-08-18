import { Switch } from 'react-native';

import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import type { Vertalingen } from '@/i18n';
import {
  EMAIL_VOORKEUR_SLEUTELS,
  useEmailVoorkeurStore,
  type EmailVoorkeurSleutel,
} from '@/store/email-voorkeur-store';

/**
 * De hele e-mailsectie van Instellingen — kop, vier schakelaars en de voetnoot.
 *
 * Het component levert de sectie zelf en niet alleen de regels: `SettingsSectie` tekent zijn
 * scheidingslijnen tussen zijn directe kinderen, en de voetnoot ("we sturen nog niets") hoort bij
 * de sectie als geheel. Zo staat in Instellingen één regel en zit alles wat over e-mail gaat hier.
 *
 * Wat de voorkeuren (nog niet) doen staat in `email-voorkeur-store.ts`.
 */
const ICONEN: Record<EmailVoorkeurSleutel, IoniconNaam> = {
  nieuwsbrief: 'newspaper-outline',
  nieuweVerhalen: 'sparkles-outline',
  tips: 'bulb-outline',
  aanbiedingen: 'pricetag-outline',
};

/** Sleutel → i18n-paar. Expliciet, zodat een nieuwe voorkeur zonder tekst een typefout is. */
const TEKSTEN: Record<
  EmailVoorkeurSleutel,
  { label: (s: Vertalingen) => string; uitleg: (s: Vertalingen) => string }
> = {
  nieuwsbrief: {
    label: (s) => s.instellingen.emailNieuwsbrief,
    uitleg: (s) => s.instellingen.emailNieuwsbriefUitleg,
  },
  nieuweVerhalen: {
    label: (s) => s.instellingen.emailNieuweVerhalen,
    uitleg: (s) => s.instellingen.emailNieuweVerhalenUitleg,
  },
  tips: {
    label: (s) => s.instellingen.emailTips,
    uitleg: (s) => s.instellingen.emailTipsUitleg,
  },
  aanbiedingen: {
    label: (s) => s.instellingen.emailAanbiedingen,
    uitleg: (s) => s.instellingen.emailAanbiedingenUitleg,
  },
};

export function EmailVoorkeuren() {
  const { t } = useVertaling();

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectieEmail)}
      voet={t((s) => s.instellingen.emailUitleg)}>
      {EMAIL_VOORKEUR_SLEUTELS.map((sleutel) => (
        <EmailVoorkeurRegel key={sleutel} sleutel={sleutel} />
      ))}
    </SettingsSectie>
  );
}

function EmailVoorkeurRegel({ sleutel }: { sleutel: EmailVoorkeurSleutel }) {
  const theme = useTheme();
  const { t } = useVertaling();
  const aan = useEmailVoorkeurStore((state) => state.voorkeuren[sleutel]);
  const zetVoorkeur = useEmailVoorkeurStore((state) => state.zetVoorkeur);

  return (
    <SettingsItem
      icoon={ICONEN[sleutel]}
      label={t(TEKSTEN[sleutel].label)}
      uitleg={t(TEKSTEN[sleutel].uitleg)}
      rechts={
        <Switch
          value={aan}
          onValueChange={(nieuw) => zetVoorkeur(sleutel, nieuw)}
          trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          thumbColor={theme.background}
        />
      }
    />
  );
}
