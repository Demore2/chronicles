// npm run check:push
//
// Zegt precies waar de push-kant nu op wacht.
//
// **Waarom dit script bestaat.** De push-laag faalt overal stil, en dat is met opzet: `lib/push.ts`
// geeft `beschikbaar: false` zonder te klagen, `push-sweep` slaat zichzelf over zonder Firebase,
// en de twee servercategorieën verdwijnen dan gewoon uit Instellingen. Dat is het juiste gedrag
// voor een lezer — de app moet volledig werken zonder Firebase — maar het maakt "waarom komt er
// niets aan?" een vraag met acht mogelijke antwoorden, waarvan er zes buiten de code liggen.
// Dit script loopt ze allemaal langs.
//
// Het raakt niets aan en heeft geen sleutels nódig: wat het zonder `SUPABASE_SERVICE_ROLE_KEY`
// niet kan controleren, meldt het als "niet gecontroleerd" in plaats van als "goed".
//
// Vlaggen:
//   --check   exitcode 1 zodra er iets ontbreekt (voor een pre-build controle)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { leesEnv } from './interactief-hulp.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strikt = process.argv.slice(2).includes('--check');

/** Eén controleregel. `status` is 'ok' | 'ontbreekt' | 'onbekend'. */
const regels = [];
function meld(status, wat, uitleg) {
  regels.push({ status, wat, uitleg });
}

function bestaat(relatiefPad) {
  return fs.existsSync(path.join(projectRoot, relatiefPad));
}

// --------------------------------------------------------------------------------------------
// 1. google-services.json — de blokkade waar alles achter zit
// --------------------------------------------------------------------------------------------

const appJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf8'));
const pakket = appJson?.expo?.android?.package;

if (bestaat('google-services.json')) {
  const gs = JSON.parse(fs.readFileSync(path.join(projectRoot, 'google-services.json'), 'utf8'));
  const pakketten = (gs.client ?? []).map((c) => c?.client_info?.android_client_info?.package_name);
  if (pakketten.includes(pakket)) {
    meld('ok', 'google-services.json', `Firebase-project ${gs?.project_info?.project_id ?? '?'}`);
  } else {
    // Dit is de val die je pas op het toestel merkt: de build slaagt, maar FCM levert nooit iets
    // af omdat het pakket in het bestand niet dat van de app is.
    meld(
      'ontbreekt',
      'google-services.json',
      `bevat ${pakketten.join(', ') || 'geen enkel pakket'}, maar app.json zegt ${pakket}`
    );
  }
} else {
  meld(
    'ontbreekt',
    'google-services.json',
    `moet in de repo-root staan (niet in android/), met een Android-app voor ${pakket}`
  );
}

// --------------------------------------------------------------------------------------------
// 2. De app-kant: staat alles wat de code nodig heeft er?
// --------------------------------------------------------------------------------------------

const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

for (const naam of ['@react-native-firebase/app', '@react-native-firebase/messaging', 'expo-notifications', 'expo-device']) {
  if (deps[naam]) meld('ok', naam, deps[naam]);
  else meld('ontbreekt', naam, 'niet geïnstalleerd');
}

const icoon = appJson?.expo?.plugins
  ?.find((p) => Array.isArray(p) && p[0] === 'expo-notifications')?.[1]?.icon;
if (icoon && bestaat(icoon.replace(/^\.\//, ''))) {
  meld('ok', 'notificatie-icoon', icoon);
} else {
  meld('ontbreekt', 'notificatie-icoon', 'npm run generate:notification-icon');
}

// --------------------------------------------------------------------------------------------
// 3. Supabase
// --------------------------------------------------------------------------------------------

const url = leesEnv('EXPO_PUBLIC_SUPABASE_URL');
const publishable = leesEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
const serviceKey = leesEnv('SUPABASE_SERVICE_ROLE_KEY');

meld(url ? 'ok' : 'ontbreekt', 'EXPO_PUBLIC_SUPABASE_URL', url ? url : 'in .env.local zetten');
meld(
  publishable ? 'ok' : 'ontbreekt',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  publishable ? 'gezet' : 'in .env.local zetten'
);

if (!serviceKey) {
  // Bewust 'onbekend' en niet 'ontbreekt': de app heeft deze sleutel niet nodig, alleen de
  // beheerscripts. Zonder sleutel kan dit script de serverkant niet inzien, en dan is
  // "ik zie niets" geen bewijs dat er niets is — zie `eisLeesbareTelling()` in interactief-hulp.
  meld('onbekend', 'serverkant', 'zonder SUPABASE_SERVICE_ROLE_KEY niet te controleren');
} else if (!url) {
  meld('onbekend', 'serverkant', 'geen EXPO_PUBLIC_SUPABASE_URL om te bevragen');
} else {
  await controleerServer(url, serviceKey);
}

async function controleerServer(basis, sleutel) {
  const kop = { apikey: sleutel, Authorization: `Bearer ${sleutel}` };

  async function telRijen(tabel) {
    const respons = await fetch(`${basis}/rest/v1/${tabel}?select=*`, {
      headers: { ...kop, Prefer: 'count=exact', Range: '0-0' },
    });
    if (!respons.ok) return null;
    const bereik = respons.headers.get('content-range') ?? '';
    const totaal = Number(bereik.split('/')[1]);
    return Number.isFinite(totaal) ? totaal : null;
  }

  for (const tabel of ['user_devices', 'notification_preferences', 'notifications_sent', 'story_catalog']) {
    const aantal = await telRijen(tabel);
    if (aantal === null) meld('ontbreekt', `tabel ${tabel}`, 'niet leesbaar — migratie gedraaid?');
    else meld('ok', `tabel ${tabel}`, `${aantal} rijen`);
  }

  const catalogus = await telRijen('story_catalog');
  const { verhalen } = await import('../src/content/verhalen/index.ts');
  if (catalogus !== null && catalogus < verhalen.length) {
    // De aanbeveling kan alleen verhalen noemen die de server kent.
    meld(
      'ontbreekt',
      'verhaalcatalogus',
      `${catalogus} van ${verhalen.length} verhalen — npm run sync:verhaalcatalogus`
    );
  }

  // Draait de sweep? Dat is aan `push-sweep` zelf te vragen: `drooglopen=1` claimt niets en
  // verstuurt niets, en zegt in het antwoord of de Firebase-secrets gezet zijn.
  const droog = await fetch(`${basis}/functions/v1/push-sweep?drooglopen=1&uur=19`, {
    headers: kop,
  }).catch(() => null);

  if (!droog) {
    meld('onbekend', 'edge function push-sweep', 'niet bereikbaar');
  } else if (droog.status === 404) {
    meld('ontbreekt', 'edge function push-sweep', 'niet gedeployd');
  } else {
    const body = await droog.json().catch(() => ({}));
    meld('ok', 'edge function push-sweep', `antwoordt (${droog.status})`);
    meld(
      body.firebase_ingesteld ? 'ok' : 'ontbreekt',
      'Firebase-secrets op de edge functions',
      body.firebase_ingesteld
        ? 'FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY gezet'
        : 'serviceaccount aanmaken en de drie secrets zetten — zie supabase/README-push.md'
    );
  }
}

// --------------------------------------------------------------------------------------------
// Uitvoer
// --------------------------------------------------------------------------------------------

const teken = { ok: '  ok  ', ontbreekt: ' MIST ', onbekend: '  ??  ' };
console.log('\nPush-notificaties — stand van zaken\n');
for (const regel of regels) {
  console.log(`[${teken[regel.status]}] ${regel.wat.padEnd(42)} ${regel.uitleg}`);
}

const ontbreekt = regels.filter((r) => r.status === 'ontbreekt');
const onbekend = regels.filter((r) => r.status === 'onbekend');

console.log('');
if (ontbreekt.length === 0 && onbekend.length === 0) {
  console.log('Alles staat klaar. Vergeet de cron niet: het Vault-geheim `service_role_key`');
  console.log('zet de uurlijkse sweep in werking (supabase/README-push.md).');
} else {
  if (ontbreekt.length > 0) console.log(`${ontbreekt.length} ding(en) ontbreken nog.`);
  if (onbekend.length > 0) console.log(`${onbekend.length} niet gecontroleerd.`);
  console.log('Het volledige draaiboek staat in supabase/README-push.md.');
}

if (strikt && ontbreekt.length > 0) process.exitCode = 1;
