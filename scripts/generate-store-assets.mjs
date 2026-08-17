#!/usr/bin/env node
/**
 * Build the two graphical assets the Play Store listing requires (LAUNCH-PLAN.md A6):
 *
 *   store/assets/icon-512.png        512x512, 32-bit PNG with alpha  — hi-res icon
 *   store/assets/feature-graphic.png 1024x500, 24-bit PNG, no alpha  — feature graphic
 *
 * The icon is a straight 2x box-downscale of assets/images/app-icon.png (1024x1024),
 * so it can never drift from the launcher icon.
 *
 * The feature graphic is rendered from store/feature-graphic.html by headless
 * Chrome/Edge — that HTML is the source of truth, not the PNG. Same reasoning as
 * docs/privacy-policy.html: one self-contained file, no build step, editable by hand.
 *
 * Usage:
 *   node scripts/generate-store-assets.mjs [--only icon|feature]
 *
 * Play's format rules are not cosmetic: the feature graphic is rejected if it has
 * an alpha channel, so the browser's RGBA output is flattened onto the page
 * background before writing.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'store/assets');

/** Background the feature graphic is flattened onto — Colors.light.background. */
const FLATTEN_RGB = [0xf7, 0xf1, 0xe4];

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null;

fs.mkdirSync(outDir, { recursive: true });

const report = (file) =>
  console.log(
    `${path.relative(projectRoot, file).replace(/\\/g, '/')}  ` +
      `${Math.round(fs.statSync(file).size / 1024)} KB`
  );

// ---------------------------------------------------------------- hi-res icon

/** Exact 2x box average: 1024 -> 512 lands on whole pixels, so no resampling blur. */
function halve(src) {
  const out = new PNG({ width: src.width / 2, height: src.height / 2 });
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const o = (out.width * y + x) << 2;
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            sum += src.data[((src.width * (y * 2 + dy) + (x * 2 + dx)) << 2) + c];
          }
        }
        out.data[o + c] = Math.round(sum / 4);
      }
    }
  }
  return out;
}

function buildIcon() {
  const source = path.join(projectRoot, 'assets/images/app-icon.png');
  const src = PNG.sync.read(fs.readFileSync(source));
  if (src.width !== 1024 || src.height !== 1024) {
    throw new Error(`expected a 1024x1024 source icon, got ${src.width}x${src.height}`);
  }
  const out = halve(src);
  // Play wants a 32-bit PNG here, so keep the alpha channel — but make it fully
  // opaque, because a masked launcher icon with holes looks broken in a listing.
  for (let i = 3; i < out.data.length; i += 4) out.data[i] = 255;
  const file = path.join(outDir, 'icon-512.png');
  fs.writeFileSync(file, PNG.sync.write(out));
  report(file);
}

// ----------------------------------------------------------- feature graphic

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

function findBrowser() {
  const found = BROWSERS.find((b) => fs.existsSync(b));
  if (!found) {
    throw new Error(
      'no Chrome/Edge found — set one of the paths in BROWSERS, or open ' +
        'store/feature-graphic.html in a browser and screenshot it at 1024x500 by hand'
    );
  }
  return found;
}

/** Drop the alpha channel by compositing onto the page background. */
function flatten(png) {
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3] / 255;
    for (let c = 0; c < 3; c++) {
      png.data[i + c] = Math.round(png.data[i + c] * a + FLATTEN_RGB[c] * (1 - a));
    }
    png.data[i + 3] = 255;
  }
  return png;
}

function buildFeatureGraphic() {
  const html = path.join(projectRoot, 'store/feature-graphic.html');
  if (!fs.existsSync(html)) throw new Error(`missing source page: ${html}`);

  const browser = findBrowser();
  const file = path.join(outDir, 'feature-graphic.png');

  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      // Give the webp/png subresources a beat to decode; a 0ms capture has been
      // observed to land on an empty page.
      '--virtual-time-budget=4000',
      '--window-size=1024,500',
      `--screenshot=${file}`,
      pathToFileURL(html).href,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  if (!fs.existsSync(file)) throw new Error('the browser produced no screenshot');

  const shot = PNG.sync.read(fs.readFileSync(file));
  if (shot.width !== 1024 || shot.height !== 500) {
    throw new Error(`expected 1024x500, got ${shot.width}x${shot.height}`);
  }
  // colorType 2 = truecolour without alpha; Play rejects a feature graphic that
  // carries an alpha channel at all, opaque or not.
  fs.writeFileSync(file, PNG.sync.write(flatten(shot), { colorType: 2 }));
  console.log(`rendered with ${path.basename(browser)}`);
  report(file);
}

if (!only || only === 'icon') buildIcon();
if (!only || only === 'feature') buildFeatureGraphic();
