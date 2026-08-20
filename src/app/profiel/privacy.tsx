import { Stack } from 'expo-router';

import { JuridischePagina } from '@/components/juridische-pagina';
import { PRIVACY_BELEID_URL, privacyBeleidIsGepubliceerd } from '@/constants/juridisch';
import { PRIVACY_ALINEAS, PRIVACY_TITEL } from '@/constants/juridische-teksten';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Het privacybeleid (`/profiel/privacy`), geopend vanuit Instellingen.
 *
 * **Dit vervangt de Play-eis niet.** Google Play wil een privacybeleid op een publiek bereikbare
 * URL, en een scherm in de app is dat niet: `docs/privacy-policy.html` blijft de pagina die
 * gepubliceerd moet worden en `PRIVACY_BELEID_URL` in `constants/juridisch.ts` de plek waar die
 * URL komt te staan. Wat dit scherm wél doet is de lezer een antwoord geven zonder browser, en
 * zonder af te hangen van een link die er nog niet is.
 *
 * Het draagt sinds deze wijziging ook twee alinea's die eerder als voetnoot onder Instellingen
 * stonden: wát er gemeten wordt (was `instellingen.analyticsVoet`) en dat elke mail een
 * afmeldlink heeft (was `instellingen.emailUitleg`). Die eerste is de weigergrond bij een meting
 * zonder schakelaar, de tweede de voorwaarde onder standaard aangezette e-mailvoorkeuren — dit is
 * nu de enige plek in de app waar ze staan.
 */
export default function PrivacyScreen() {
  const { t } = useVertaling();

  return (
    <>
      <Stack.Screen options={{ title: t((s) => s.profiel.privacybeleid) }} />
      <JuridischePagina
        titel={PRIVACY_TITEL}
        alineas={PRIVACY_ALINEAS}
        webUrl={privacyBeleidIsGepubliceerd ? PRIVACY_BELEID_URL : undefined}
      />
    </>
  );
}
