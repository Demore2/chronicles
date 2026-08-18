import { Switch } from 'react-native';

import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import type { Vertalingen } from '@/i18n';
import { push } from '@/lib/push';
import { useNotificatieStore, type PushVoorkeurSleutel } from '@/store/notificatie-store';

/**
 * De push-sectie van Instellingen — kop, schakelaars en de voetnoot.
 *
 * Zelfde vorm als `email-preferences.tsx` en `analytics-preferences.tsx`: het component levert de
 * hele sectie en niet losse regels, omdat `SettingsSectie` zijn scheidingslijnen tussen zijn
 * *directe* kinderen tekent en de voetnoot bij de sectie hoort en niet bij één regel.
 *
 * **Dit staat los van de dagelijkse herinnering.** Die is lokaal en staat in zijn eigen sectie
 * (`daily-reminder-settings.tsx`): hij werkt offline en heeft geen server nodig. Wat hier staat
 * zijn de meldingen die de app *niet* zelf kan bedenken — dat je een week weg bent, of dat er een
 * verhaal is dat je nog niet opende.
 *
 * **De twee servercategorieën verschijnen alleen als push echt kan.** Zonder
 * `google-services.json` (of in een dev-client van vóór deze fase) is `push.beschikbaar` onwaar,
 * en dan is een schakelaar die niets in werking zet erger dan geen schakelaar — precies de
 * afweging van `ad-banner.tsx` en de "Soon"-regels. De streakmelding blijft wél staan: die
 * loopt via expo-notifications en werkt dus altijd.
 */

const ICONEN: Record<PushVoorkeurSleutel, IoniconNaam> = {
  terugkeerAan: 'return-down-back-outline',
  aanbevelingenAan: 'compass-outline',
  streakAan: 'flame-outline',
};

/** Sleutel → i18n-paar. Expliciet, zodat een nieuwe categorie zonder tekst een typefout is. */
const TEKSTEN: Record<
  PushVoorkeurSleutel,
  { label: (s: Vertalingen) => string; uitleg: (s: Vertalingen) => string }
> = {
  terugkeerAan: {
    label: (s) => s.instellingen.pushTerugkeer,
    uitleg: (s) => s.instellingen.pushTerugkeerUitleg,
  },
  aanbevelingenAan: {
    label: (s) => s.instellingen.pushAanbevelingen,
    uitleg: (s) => s.instellingen.pushAanbevelingenUitleg,
  },
  streakAan: {
    label: (s) => s.instellingen.pushStreak,
    uitleg: (s) => s.instellingen.pushStreakUitleg,
  },
};

/** De categorieën die een server nodig hebben, en dus een werkende FCM-koppeling. */
const SERVER_CATEGORIEEN: PushVoorkeurSleutel[] = ['terugkeerAan', 'aanbevelingenAan'];

export function PushVoorkeuren() {
  const { t } = useVertaling();
  const kanPush = push.beschikbaar;

  const sleutels: PushVoorkeurSleutel[] = kanPush
    ? [...SERVER_CATEGORIEEN, 'streakAan']
    : ['streakAan'];

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectiePush)}
      voet={kanPush ? t((s) => s.instellingen.pushVoet) : t((s) => s.instellingen.pushVoetLokaal)}>
      {sleutels.map((sleutel) => (
        <PushVoorkeurRegel key={sleutel} sleutel={sleutel} />
      ))}
    </SettingsSectie>
  );
}

function PushVoorkeurRegel({ sleutel }: { sleutel: PushVoorkeurSleutel }) {
  const theme = useTheme();
  const { t } = useVertaling();
  const aan = useNotificatieStore((state) => state[sleutel]);
  const zetPushVoorkeur = useNotificatieStore((state) => state.zetPushVoorkeur);

  return (
    <SettingsItem
      icoon={ICONEN[sleutel]}
      label={t(TEKSTEN[sleutel].label)}
      uitleg={t(TEKSTEN[sleutel].uitleg)}
      rechts={
        <Switch
          value={aan}
          onValueChange={(nieuw) => zetPushVoorkeur(sleutel, nieuw)}
          trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          thumbColor={theme.background}
        />
      }
    />
  );
}
