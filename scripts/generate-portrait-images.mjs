#!/usr/bin/env node
/**
 * Genereer portretten voor de verhalen en schrijf ze als asset naar
 * `assets/images/characters/<verhaal-id>.webp`.
 *
 * Usage:
 *   node scripts/generate-portrait-images.mjs              # alleen ontbrekende portretten
 *   node scripts/generate-portrait-images.mjs --force      # ook bestaande overschrijven
 *   node scripts/generate-portrait-images.mjs --only julius-caesar,spartacus
 *   node scripts/generate-portrait-images.mjs --list       # toon status, genereer niets
 *
 * Reads REPLICATE_API_TOKEN from the environment or from .env.local.
 *
 * LAUNCH-PLAN.md B1: de vorige versie zette alleen de tijdelijke `replicate.delivery`-URL in
 * `src/constants/generated-images.ts`. Die URL's verlopen, dus een gepubliceerde build had kapotte
 * portretten. Nu worden de bytes gedownload; `src/constants/character-images.ts` `require()`t het
 * bestand, zodat Metro het meebundelt. De bestandsnaam is altijd exact de `Verhaal.id`-slug —
 * daarom is er hier geen aparte naam-mapping meer.
 *
 * Een nieuw portret toevoegen: prompt hieronder bijschrijven onder de verhaal-id, script draaien,
 * en de regel toevoegen aan `CHARACTER_IMAGES` (die map is met opzet expliciet en niet
 * `require.context`, zodat een ontbrekend bestand een build-fout geeft in plaats van een lege kaart).
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const charactersDir = path.join(projectRoot, 'assets/images/characters');

/**
 * Prompts per verhaal-id. De 15 niet-Oudheid-portretten zijn eerder via
 * orchestration-controller.mjs gemaakt en staan al in assets/; hun prompts zijn niet bewaard, dus
 * die staan hier bewust niet. Het script slaat een verhaal zonder prompt over in plaats van te
 * falen — zonder --force raakt het bestaande bestanden sowieso niet aan.
 */
const storyPrompts = {
  'julius-caesar': {
    name: 'Julius Caesar',
    prompt:
      'Historical portrait of Julius Caesar, Roman general and statesman, circa 50 BC. Wearing Roman toga and laurel wreath. Classical Roman style painting. Dignified, commanding presence, detailed face with piercing eyes. Oil painting style, museum quality.',
  },
  'spartacus': {
    name: 'Spartacus',
    prompt:
      'Historical portrait of Spartacus, Thracian gladiator, circa 70 BC. Strong, muscular build. Wearing gladiator armor and helmet. Fierce expression, determined eyes. Historical accuracy, classical Roman era. Oil painting style, museum quality.',
  },
  'rome-rise': {
    name: "Rome's Rise",
    prompt:
      'Majestic ancient Rome cityscape, the Roman Forum at sunrise. Classical architecture, marble columns, temples. Grandiose Republican era Rome. Golden light, historical accuracy. Wide vista showing the power and scale of Rome. Oil painting style.',
  },
  'pompeii-disaster': {
    name: 'Mount Vesuvius Eruption',
    prompt:
      'Mount Vesuvius erupting over Pompeii, 79 AD. Massive volcanic eruption column, ash cloud, pyroclastic flow. Ancient Roman city below in shadows. Dramatic, catastrophic natural disaster. Historical painting style, detailed geological accuracy.',
  },
  // Het vijfde Oudheid-verhaal. Bewust "South Asian" en "Mauryan" expliciet in de prompt: zonder
  // die woorden vult het model het standaardgeval in en levert het een mediterrane keizer — zelfde
  // les als bij de scèneprompts (zie de kop van generate-scene-images.mjs).
  'ashoka-maurya': {
    name: 'Ashoka',
    prompt:
      'Historical portrait of Ashoka, South Asian Mauryan emperor of ancient India, circa 260 BC. Indian features, dark eyes, beard, wearing draped white cotton robes with heavy gold armbands and a jewelled turban ornament. Grave, contemplative expression, the look of a conqueror turned penitent. Warm Indian light, rich earthy palette. Oil painting style, museum quality.',
  },
};

function loadTokenFromEnvFile() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return undefined;
  const match = fs.readFileSync(envPath, 'utf8').match(/^REPLICATE_API_TOKEN=(.+)$/m);
  return match ? match[1].trim() : undefined;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Replicate throttlet het aanmaken van predictions hard (6/min, burst 1) zolang het saldo onder
 * $5 staat, dus een platte loop 429't gegarandeerd. Zelfde aanpak als generate-app-icon.mjs.
 */
async function withRetry(fn, attempts = 6) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const retryAfter = Number(err?.response?.headers?.get?.('retry-after'));
      const isThrottle = err?.response?.status === 429 || /429|throttled/i.test(err?.message ?? '');
      if (!isThrottle || attempt >= attempts) throw err;
      const waitMs = (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 10 * attempt) * 1000;
      process.stdout.write(`throttled, waiting ${waitMs / 1000}s... `);
      await sleep(waitMs);
    }
  }
}

async function downloadTo(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed (${response.status}) for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, bytes);
  return bytes.length;
}

const assetPath = (storyId) => path.join(charactersDir, `${storyId}.webp`);

function parseArgs(argv) {
  const onlyIndex = argv.indexOf('--only');
  return {
    force: argv.includes('--force'),
    list: argv.includes('--list'),
    only:
      onlyIndex === -1
        ? undefined
        : new Set(
            (argv[onlyIndex + 1] ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          ),
  };
}

async function main() {
  const { force, list, only } = parseArgs(process.argv.slice(2));

  const ids = Object.keys(storyPrompts).filter((id) => !only || only.has(id));
  if (only) {
    for (const id of only) {
      if (!(id in storyPrompts)) console.warn(`! geen prompt bekend voor "${id}" — overgeslagen`);
    }
  }

  if (list) {
    for (const id of Object.keys(storyPrompts)) {
      console.log(`${fs.existsSync(assetPath(id)) ? 'aanwezig ' : 'ONTBREEKT'}  ${id}.webp`);
    }
    return;
  }

  const todo = ids.filter((id) => force || !fs.existsSync(assetPath(id)));
  if (todo.length === 0) {
    console.log('Alle portretten staan al in assets/images/characters/ — niets te doen (--force overschrijft).');
    return;
  }

  const auth = loadTokenFromEnvFile();
  if (!auth) {
    console.error('REPLICATE_API_TOKEN not set (env or .env.local).');
    process.exit(1);
  }

  fs.mkdirSync(charactersDir, { recursive: true });
  const replicate = new Replicate({ auth });

  console.log(`Genereren van ${todo.length} portret(ten)...\n`);

  for (const [index, storyId] of todo.entries()) {
    process.stdout.write(`  ${storyId} (${storyPrompts[storyId].name})... `);

    const output = await withRetry(() =>
      replicate.run('black-forest-labs/flux-1.1-pro', {
        input: {
          prompt: storyPrompts[storyId].prompt,
          aspect_ratio: '3:4', // portret-verhouding van de kaarten (verhaal-carousel-kaart.tsx)
          output_format: 'webp',
          output_quality: 90,
          safety_tolerance: 2,
        },
      })
    );

    const url = typeof output === 'string' ? output : (output?.url?.() ?? output?.[0]);
    const size = await downloadTo(String(url), assetPath(storyId));
    console.log(`opgeslagen (${Math.round(size / 1024)} KB)`);

    if (index < todo.length - 1) await sleep(12000); // blijf onder de 6/min prediction-limiet
  }

  console.log(`\nGeschreven naar ${charactersDir}`);
  console.log('Controleer daarna dat elke id een regel heeft in src/constants/character-images.ts,');
  console.log('en draai: npx tsc --noEmit && npm run validate:content');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
