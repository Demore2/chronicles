#!/usr/bin/env node
/**
 * Generate the Chronicles app icon at store-ready resolution.
 *
 * Usage:
 *   node scripts/generate-app-icon.mjs            # generate 3 candidates
 *   node scripts/generate-app-icon.mjs --pick 2   # promote candidate 2 to app-icon.png
 *
 * Unlike scripts/generate-portrait-images.mjs (which only records the temporary
 * replicate.delivery URL), this DOWNLOADS the bytes into assets/images/ so the
 * icon is bundled and cannot expire.
 *
 * Reads REPLICATE_API_TOKEN from the environment or from .env.local.
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const imagesDir = path.join(projectRoot, 'assets/images');
const candidatesDir = path.join(imagesDir, 'icon-candidates');

/** Brand colours, mirrored from src/constants/theme.ts (Colors.light). */
const CREAM = '#F7F1E4';

/**
 * The mark must sit inside Android's adaptive-icon safe zone (inner ~66%), so
 * the prompt asks for a generous flat margin. The background is deliberately
 * flat cream and edge-to-edge: app.json declares the same colour as
 * adaptiveIcon.backgroundColor, so the circular/squircle mask never reveals a
 * seam and we avoid the "icon inside an icon" look the old 240x240 logo had.
 */
const PROMPT = [
  'A flat vector app icon logo, perfectly centered on a completely flat solid cream background (#F7F1E4).',
  'The mark: an elegant letter C formed from an unrolled parchment scroll, with a minimalist analogue clock face nested inside the curve of the C, and a quill pen crossing diagonally over it.',
  'Colours: deep teal (#2E6E6B) for the scroll and letterform, warm terracotta (#B4653C) for the clock hands and quill.',
  'Style: clean flat vector illustration, bold confident line weights, no gradients, no shading, no texture, no drop shadow.',
  'Composition: the mark occupies roughly 55 percent of the frame, centered, with generous empty cream margin on all four sides.',
  'Square 1:1 format, edge-to-edge flat cream background with no border, no frame, no rounded rectangle card, no outer shape.',
].join(' ');

function loadTokenFromEnvFile() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return undefined;
  const match = fs.readFileSync(envPath, 'utf8').match(/^REPLICATE_API_TOKEN=(.+)$/m);
  return match ? match[1].trim() : undefined;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Replicate throttles prediction creation hard (6/min, burst 1) while the
 * account balance is under $5, so a plain loop reliably 429s. Honour the
 * server's retry_after and back off.
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

async function generate() {
  const auth = loadTokenFromEnvFile();
  if (!auth) {
    console.error('REPLICATE_API_TOKEN not set (env or .env.local).');
    process.exit(1);
  }

  fs.mkdirSync(candidatesDir, { recursive: true });
  const replicate = new Replicate({ auth });

  console.log(`Generating 3 icon candidates on ${CREAM}...\n`);

  for (let i = 1; i <= 3; i++) {
    process.stdout.write(`  candidate ${i}... `);
    const output = await withRetry(() =>
      replicate.run('black-forest-labs/flux-1.1-pro', {
        input: {
          prompt: PROMPT,
          aspect_ratio: '1:1',
          output_format: 'png',
          output_quality: 100,
          prompt_upsampling: false,
          safety_tolerance: 2,
        },
      })
    );

    const url = typeof output === 'string' ? output : (output?.url?.() ?? output?.[0]);
    const dest = path.join(candidatesDir, `candidate-${i}.png`);
    const size = await downloadTo(String(url), dest);
    console.log(`saved (${Math.round(size / 1024)} KB)`);
    if (i < 3) await sleep(12000); // stay under the 6/min prediction limit
  }

  console.log(`\nCandidates written to ${candidatesDir}`);
  console.log('Review them, then promote one with:');
  console.log('  node scripts/generate-app-icon.mjs --pick <1|2|3>');
}

function pick(n) {
  const source = path.join(candidatesDir, `candidate-${n}.png`);
  if (!fs.existsSync(source)) {
    console.error(`candidate-${n}.png not found — run without --pick first.`);
    process.exit(1);
  }
  const dest = path.join(imagesDir, 'app-icon.png');
  fs.copyFileSync(source, dest);
  console.log(`Promoted candidate ${n} -> assets/images/app-icon.png`);
  console.log('Next: node scripts/derive-icon-variants.mjs');
}

const pickArg = process.argv.indexOf('--pick');
if (pickArg !== -1) {
  pick(process.argv[pickArg + 1]);
} else {
  generate().catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
