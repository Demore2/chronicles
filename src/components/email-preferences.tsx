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
 * De hele e-mailsectie van Instellingen — kop en vier schakelaars.
 *
 * Het component levert de sectie zelf en niet alleen de regels, zodat in Instellingen één regel
 * staat en alles wat over e-mail gaat hier zit.
 *
 * **De voetnoot is eruit.** Die zei twee dingen: er gaat nog geen mail uit, en onderaan elke mail
 * staat een afmeldlink. Dat tweede is geen bijzaak maar de voorwaarde waaronder deze schakelaars
 * standaard aan mogen staan (zie `email-voorkeur-store.ts` voor de soft opt-in) — het staat nu
 * in het privacybeleid, dat sinds deze wijziging een eigen scherm in de app is
 * (`app/profiel/privacy.tsx`) en niet langer een "binnenkort"-melding. Verdwijnt die tekst dáár,
 * dan staat hij nergens meer.
 *
 * Wat de voorkeuren (nog niet) doen staat in `email-voorkeur-store.ts`.
 */
const ICONEN: Record<EmailVoorkeurSleutel, IoniconNaam> = {
  nieuwsbrief: 'newspaper-outline',
  nieuweVerhalen: 'sparkles-outline',
  tips: 'bulb-outline',
  aanbiedingen: 'pricetag-outline',
};

/**
 * Sleutel → label. Expliciet, zodat een nieuwe voorkeur zonder tekst een typefout is.
 *
 * **Alleen het label.** De vier regels droegen elk een zin uitleg; vier schakelaars met vier
 * verklaringen eronder leest als een formulier in plaats van als een rij keuzes, en "Monthly
 * letter" of "Offers" zegt al wat het is. De `…Uitleg`-sleutels blijven in i18n staan.
 */
const LABELS: Record<EmailVoorkeurSleutel, (s: Vertalingen) => string> = {
  nieuwsbrief: (s) => s.instellingen.emailNieuwsbrief,
  nieuweVerhalen: (s) => s.instellingen.emailNieuweVerhalen,
  tips: (s) => s.instellingen.emailTips,
  aanbiedingen: (s) => s.instellingen.emailAanbiedingen,
};

export function EmailVoorkeuren() {
  const { t } = useVertaling();

  return (
    <SettingsSectie titel={t((s) => s.instellingen.sectieEmail)}>
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
      label={t(LABELS[sleutel])}
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
