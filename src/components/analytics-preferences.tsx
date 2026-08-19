import { SettingsItem, SettingsSectie } from '@/components/settings-section';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * De privacysectie van Instellingen: één regel over de gebruiksstatistieken.
 *
 * **De schakelaar is eruit.** Het meten hoort bij de app en staat vast aan; wat overblijft is de
 * mededeling dát het gebeurt, met de voetnoot die zegt wát er gemeten wordt.
 *
 * **Waarom die voetnoot langer werd in plaats van korter.** Met een schakelaar erbij was "je kunt
 * dit uitzetten" het antwoord op elke vraag; zonder schakelaar moet er een andere route staan, en
 * die is er: bezwaar per e-mail, of het account verwijderen (twee secties lager, en dat wist ook
 * wat er al gemeten is). "Hier valt niets aan te doen" is geen mededeling die je over gegevens
 * kunt doen — zie `instellingen.analyticsVoet`.
 *
 * **Wat dit betekent voor de EU staat in `docs/README.md` en `docs/privacy-policy.html`**, en het
 * is geen detail: de AVG vraagt voor een meting die aan je account hangt om een weigergrond, en
 * die is met deze wijziging een verzoek geworden in plaats van een knop. `useAnalyticsStore`
 * blijft bestaan en staat op `true`; wie het terugdraait heeft alleen dit component nodig.
 *
 * De tekst zegt bewust niet "anoniem": zodra je bent ingelogd hangt de meting aan je account
 * (`analytics.zetGebruiker`). "Pseudoniem" is het juiste woord.
 */
export function AnalyticsVoorkeuren() {
  const { t } = useVertaling();

  return (
    <SettingsSectie
      titel={t((s) => s.instellingen.sectiePrivacy)}
      voet={t((s) => s.instellingen.analyticsVoet)}>
      <SettingsItem
        icoon="stats-chart-outline"
        label={t((s) => s.instellingen.analytics)}
        uitleg={t((s) => s.instellingen.analyticsUitleg)}
        waarde={t((s) => s.instellingen.altijdAan)}
      />
    </SettingsSectie>
  );
}
