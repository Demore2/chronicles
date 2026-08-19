/**
 * De tekst van de algemene voorwaarden en het privacybeleid, zoals ze in de app zelf te lezen
 * zijn (`app/profiel/terms.tsx` en `app/profiel/privacy.tsx`).
 *
 * **Waarom hier en niet in i18n.** De app spreekt vier talen, deze twee documenten spreken er
 * één. Een juridische tekst laten meevertalen betekent dat er straks vier versies zijn waarvan er
 * drie niet nagelezen zijn, en dan is het onduidelijk welke geldt — terwijl juist dát de enige
 * vraag is die een lezer over zo'n document heeft. De schermtitel en de terugknop komen wél uit
 * i18n: dat is chroom, geen inhoud.
 *
 * **Dit is niet hetzelfde bestand als `docs/privacy-policy.html`.** Die pagina is wat er
 * *gepubliceerd* wordt, want Google Play eist een privacybeleid op een publiek bereikbare URL —
 * een scherm in de app telt daar niet voor. Wijzig je hier iets aan wat de app verzamelt, wijzig
 * het daar dan mee; `PRIVACY_BELEID_URL` in `juridisch.ts` blijft de plek waar die URL komt te
 * staan zodra de pagina online staat.
 */

import { SUPPORT_EMAIL } from '@/constants/app-info';

/**
 * De datum onder de titel van beide documenten. Met de hand bijwerken zodra de tekst hierónder
 * verandert — een automatische "vandaag" zou elke dag een nieuwe versie suggereren en is precies
 * het tegenovergestelde van wat "laatst bijgewerkt" moet vertellen.
 */
export const JURIDISCH_BIJGEWERKT = '19 August 2026';

/**
 * Eén alinea. `label` is de vetgedrukte aanhef ("What we collect:"); zonder label is het gewoon
 * een alinea. Bewust geen kopniveaus: deze twee documenten zijn te kort om een inhoudsopgave te
 * verdienen, en een kop per zin leest als een formulier.
 */
export type JuridischeAlinea = {
  label?: string;
  tekst: string;
};

export const VOORWAARDEN_TITEL = 'Terms of Service — Chronicles';

export const VOORWAARDEN_ALINEAS: JuridischeAlinea[] = [
  { tekst: 'By using Chronicles, you agree to these terms.' },
  {
    tekst:
      'Chronicles provides historical stories and educational content, available in a Free tier and an optional Pro subscription with additional features.',
  },
  {
    tekst:
      'You agree not to misuse the app, attempt to reverse-engineer it, or use it in violation of applicable law.',
  },
  {
    tekst:
      'Content in Chronicles (stories, illustrations, text) belongs to Chronicles and may not be redistributed without permission.',
  },
  {
    tekst:
      'Chronicles is provided "as is." We aim for historical accuracy but cannot guarantee the content is error-free.',
  },
  {
    tekst: 'We may update these Terms; continued use after changes means you accept them.',
  },
  { label: 'Questions', tekst: SUPPORT_EMAIL },
];

export const PRIVACY_TITEL = 'Privacy Policy — Chronicles';

export const PRIVACY_ALINEAS: JuridischeAlinea[] = [
  {
    tekst: `Chronicles ("we", "us") is operated by Quinten, contact: ${SUPPORT_EMAIL}.`,
  },
  {
    label: 'What we collect',
    tekst:
      'usage statistics (screens viewed, chapters completed, taps), device type, and country, via Google Firebase. We do not collect or store the text you read or write, or any personal story content.',
  },
  {
    label: 'Account',
    tekst: 'your account is used to sync progress and preferences across devices.',
  },
  {
    label: 'Email',
    tekst:
      'Chronicles has not launched yet and currently sends no emails. Once live, emails are only sent based on your Settings preferences (Monthly letter, New stories, Reading tips, Offers), and every email includes a working unsubscribe link.',
  },
  {
    label: 'Your rights (EU/GDPR)',
    tekst:
      'you can access, correct, or delete your data at any time. Delete your account from Settings, or contact us for other requests.',
  },
  {
    label: 'Third parties',
    tekst: 'usage data is processed by Google Firebase (Google LLC).',
  },
  {
    label: 'Changes',
    tekst: 'we may update this policy; material changes will be shown in-app.',
  },
];
