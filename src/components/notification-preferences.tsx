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
 * **`MeldingenSectie` — alleen de dagelijkse herinnering.** Die is het enige waar nog iets aan te
 * bedienen valt: een schakelaar en een tijdstip, en beide regels komen als `children` binnen uit
 * `daily-reminder-settings.tsx`.
 *
 * **De streakwaarschuwing en de mijlpalen staan vast aan en hebben sinds deze fase géén regel
 * meer.** Ze stonden er als "Always on"-regels zonder schakelaar, en dat is precies het soort rij
 * dat je laat zoeken naar een knop die er niet is: drie regels waarvan er één werkt leest als een
 * scherm waar iets stuk is. Ze zijn en blijven aan (`ALTIJD_AAN_SLEUTELS` in
 * `notificatie-store.ts` dwingt dat af langs elke weg waarlangs state binnenkomt), ze zijn lokaal,
 * en ze hebben elk hun eigen Android-kanaal — dáár zit de uitknop, en de voetnoot van de sectie
 * wijst erheen. Wat verdween is de regel, niet de melding.
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

/**
 * De categorieën die het toestel zelf plant, vast aan staan en **geen regel meer krijgen**.
 *
 * Blijft staan als documentatie van wat er stilletjes aan is: `ALTIJD_AAN_SLEUTELS` in
 * `notificatie-store.ts` is de plek die het afdwingt, deze lijst is de plek waar je ziet dat dat
 * bewust niet in beeld komt. Zie de kop van dit bestand.
 */
export const VASTE_CATEGORIEEN: PushVoorkeurSleutel[] = ['streakAan', 'prestatiesAan'];

/**
 * De meldingssectie: toestemming (als die ontbreekt) en de dagelijkse herinnering met zijn
 * tijdstip. Verder niets.
 *
 * De herinnering zelf komt als `children` binnen en niet uit dit bestand — die twee regels wonen
 * in `daily-reminder-settings.tsx`, bij de tijdkiezer die erachter hangt.
 */
export function MeldingenSectie({ children }: { children: ReactNode }) {
  const { t } = useVertaling();
  const { toestemming, vraagAan } = useMeldingToestemming();

  // Geen `voet` meer. Die legde uit waar de vaste meldingen dan wél uit kunnen, maar sinds de
  // streak- en mijlpaalregels hier verdwenen bestaat de sectie enkel nog uit de herinnering en
  // zijn tijdstip — allebei bedienbaar. Een alinea onder twee werkende regels legt iets uit wat
  // er niet meer staat. `instellingen.meldingenVoet` blijft in i18n bestaan.
  return (
    <SettingsSectie titel={t((s) => s.instellingen.sectieMeldingen)}>
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
      {/* Hier stonden de regels voor de streakwaarschuwing en de mijlpalen, allebei met "Always
          on" als waarde. Ze zijn weg omdat ze niets te bedienen gaven; de meldingen zelf staan
          onveranderd aan. Zie de kop van dit bestand. */}
    </SettingsSectie>
  );
}

/**
 * Eén categorie zonder schakelaar: label, uitleg en "Always on" aan de rechterkant.
 *
 * **ORPHANED** sinds de streak- en mijlpaalregels uit `MeldingenSectie` verdwenen — er is geen
 * vaste categorie meer die in beeld komt. Blijft staan omdat verwijderen hier geblokkeerd is
 * (CLAUDE.md, "File deletion") en `export` zodat een ongebruikte functie geen lintmelding wordt.
 */
export function VasteMeldingRegel({ sleutel }: { sleutel: PushVoorkeurSleutel }) {
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
