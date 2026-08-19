import type { ReactNode } from 'react';
import { Switch } from 'react-native';

import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import type { IoniconNaam } from '@/constants/types';
import { useMeldingToestemming } from '@/hooks/use-melding-toestemming';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import type { Vertalingen } from '@/i18n';
import { push } from '@/lib/push';
import { useNotificatieStore, type PushVoorkeurSleutel } from '@/store/notificatie-store';

/**
 * De meldingsvoorkeuren van Instellingen, in twee secties.
 *
 * **`MeldingenSectie` — wat bij het lezen hoort, zonder schakelaar.** De dagelijkse herinnering,
 * de streakwaarschuwing en de mijlpalen staan vast aan (`ALTIJD_AAN_SLEUTELS` in
 * `notificatie-store.ts`). Ze zijn alle drie lokaal, gaan over iets dat de lezer zelf opbouwt, en
 * hebben elk hun eigen Android-kanaal — dáár zit de uitknop, en de voetnoot wijst erheen. Een
 * regel zonder schakelaar krijgt "Always on" als waarde in plaats van niets: een rij die er
 * hetzelfde uitziet als een informatieregel maar wél iets doet, laat je zoeken naar de knop.
 *
 * **`PushVoorkeuren` — wat van de server komt, met schakelaar.** Win-back en aanbevelingen zijn
 * berichten die de lezer niet gevraagd heeft; die blijven een keuze, en ze staan standaard uit.
 * Zelfde afweging als bij de e-mailvoorkeuren.
 *
 * Beide leveren hun eigen kop en voetnoot in plaats van losse regels, want `SettingsSectie` tekent
 * zijn scheidingslijnen tussen zijn *directe* kinderen en een voetnoot hoort bij de sectie als
 * geheel — zelfde vorm als `email-preferences.tsx` en `analytics-preferences.tsx`.
 *
 * **De servercategorieën verschijnen alleen als push echt kan.** Zonder `google-services.json`
 * (of in een dev-client van vóór die fase) is `push.beschikbaar` onwaar, en dan is een schakelaar
 * die niets in werking zet erger dan geen schakelaar — precies de afweging van `ad-banner.tsx` en
 * de "Soon"-regels. De hele sectie valt dan weg; de drie lokale meldingen blijven staan.
 */

const ICONEN: Record<PushVoorkeurSleutel, IoniconNaam> = {
  terugkeerAan: 'return-down-back-outline',
  aanbevelingenAan: 'compass-outline',
  streakAan: 'flame-outline',
  prestatiesAan: 'ribbon-outline',
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
  prestatiesAan: {
    label: (s) => s.instellingen.pushPrestaties,
    uitleg: (s) => s.instellingen.pushPrestatiesUitleg,
  },
};

/** De categorieën die een server nodig hebben, en dus een werkende FCM-koppeling. */
const SERVER_CATEGORIEEN: PushVoorkeurSleutel[] = ['terugkeerAan', 'aanbevelingenAan'];

/** De categorieën die het toestel zelf plant en die geen schakelaar meer hebben. */
const VASTE_CATEGORIEEN: PushVoorkeurSleutel[] = ['streakAan', 'prestatiesAan'];

/**
 * De meldingssectie: toestemming (als die ontbreekt), de dagelijkse herinnering met zijn tijdstip,
 * en de twee vaste categorieën.
 *
 * De herinnering zelf komt als `children` binnen en niet uit dit bestand — die twee regels wonen
 * in `daily-reminder-settings.tsx`, bij de tijdkiezer die erachter hangt. Ze staan bovenaan omdat
 * de herinnering de enige van de drie is waar nog iets aan te bedienen valt.
 */
export function MeldingenSectie({ children }: { children: ReactNode }) {
  const { t } = useVertaling();
  const { toestemming, vraagAan } = useMeldingToestemming();

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectieMeldingen)}
      voet={t((s) => s.instellingen.meldingenVoet)}>
      {/* Alleen bij een gemeten "nee". Zolang `toestemming` nog `undefined` is verschijnt hier
          niets — een regel die één frame lang om toestemming vraagt en dan wegspringt leest als
          een storing. */}
      {toestemming === false ? (
        <SettingsItem
          icoon="alert-circle-outline"
          label={t((s) => s.instellingen.meldingenToestemming)}
          uitleg={t((s) => s.instellingen.meldingenToestemmingUitleg)}
          onPress={() => void vraagAan()}
        />
      ) : null}
      {children}
      {VASTE_CATEGORIEEN.map((sleutel) => (
        <VasteMeldingRegel key={sleutel} sleutel={sleutel} />
      ))}
    </SettingsSectie>
  );
}

/** Eén categorie zonder schakelaar: label, uitleg en "Always on" aan de rechterkant. */
function VasteMeldingRegel({ sleutel }: { sleutel: PushVoorkeurSleutel }) {
  const { t } = useVertaling();

  return (
    <SettingsItem
      icoon={ICONEN[sleutel]}
      label={t(TEKSTEN[sleutel].label)}
      uitleg={t(TEKSTEN[sleutel].uitleg)}
      waarde={t((s) => s.instellingen.altijdAan)}
    />
  );
}

export function PushVoorkeuren() {
  const { t } = useVertaling();

  // Zonder FCM is er niets te kiezen: beide categorieën in deze sectie komen van de server. De
  // sectie verdwijnt dan in zijn geheel, kop en voetnoot incluis.
  if (!push.beschikbaar) return null;

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectiePush)}
      voet={t((s) => s.instellingen.pushVoet)}>
      {SERVER_CATEGORIEEN.map((sleutel) => (
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
