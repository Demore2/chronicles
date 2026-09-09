#!/usr/bin/env node
/**
 * Rasterise the Histora brand mark.
 *
 *   assets/images/icon-candidates/histora-mark-tile-1024.png
 *       1024x1024, opaque — the source for scripts/derive-icon-variants.mjs,
 *       which turns it into app-icon / app-icon-adaptive / app-favicon.
 *   assets/images/app-splash.png
 *       1024x1024, transparent — the expo-splash-screen image. The beige plate
 *       behind it comes from `backgroundColor` in app.json, so the PNG must not
 *       carry a background of its own.
 *
 * Deliberately headless Chrome + pngjs, not `sharp`. Chrome is already how
 * generate-store-assets.mjs and generate-notification-icon.mjs rasterise, and
 * sharp is a native module — an extra prebuilt binary in devDependencies that
 * has to resolve on this machine and in every future EAS image, for a job three
 * scripts already do without it.
 *
 * The SVG is **inlined into the page** rather than loaded through an <img>: an
 * img is an isolated document (see CLAUDE.md on `currentColor`), and inlining is
 * what the sibling scripts do.
 *
 * Usage:
 *   node scripts/generate-logo.mjs [--only tile|splash]
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const mascotteDir = path.join(projectRoot, 'assets/images/mascotte');

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
  if (!found) throw new Error('no Chrome/Edge found — add its path to BROWSERS');
  return found;
}

const TARGETS = [
  {
    naam: 'tile',
    bron: path.join(mascotteDir, 'histora-mark-tile.svg'),
    doel: path.join(projectRoot, 'assets/images/icon-candidates/histora-mark-tile-1024.png'),
    transparant: false,
  },
  {
    naam: 'splash',
    bron: path.join(mascotteDir, 'histora-mark.svg'),
    doel: path.join(projectRoot, 'assets/images/app-splash.png'),
    transparant: true,
  },
];

const SIZE = 1024;
const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null;

const browser = findBrowser();
const tempPagina = path.join(projectRoot, '.tmp-logo.html');

for (const target of TARGETS) {
  if (only && only !== target.naam) continue;
  if (!fs.existsSync(target.bron)) throw new Error(`missing source: ${target.bron}`);

  fs.mkdirSync(path.dirname(target.doel), { recursive: true });
  fs.writeFileSync(
    tempPagina,
    `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent}
  svg{display:block;width:${SIZE}px;height:${SIZE}px}
</style>
${fs.readFileSync(target.bron, 'utf8')}`,
    'utf8'
  );

  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      // Zonder dit vult Chrome de achtergrond wit op; de splash zou dan een wit
      // vierkant op het beige plaatje zetten.
      ...(target.transparant ? ['--default-background-color=00000000'] : []),
      '--virtual-time-budget=2000',
      `--window-size=${SIZE},${SIZE}`,
      `--screenshot=${target.doel}`,
      pathToFileURL(tempPagina).href,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  if (!fs.existsSync(target.doel)) throw new Error('the browser produced no screenshot');

  // Nameten in plaats van aannemen. Een lege of volledig dekkende uitkomst is
  // het faalgeval dat er goed uitziet in een bestandslijst: 19 KB PNG, niets erin.
  const png = PNG.sync.read(fs.readFileSync(target.doel));
  if (png.width !== SIZE || png.height !== SIZE) {
    throw new Error(`expected ${SIZE}x${SIZE}, got ${png.width}x${png.height}`);
  }
  let dekkend = 0;
  for (let i = 3; i < png.data.length; i += 4) if (png.data[i] > 8) dekkend++;
  const dekking = dekkend / (SIZE * SIZE);
  if (target.transparant && (dekking < 0.1 || dekking > 0.95)) {
    throw new Error(`${Math.round(dekking * 100)}% dekkend — achtergrond mee gerenderd of leeg canvas?`);
  }
  if (!target.transparant && dekking < 0.99) {
    throw new Error(`tegel is maar ${Math.round(dekking * 100)}% dekkend — moet full bleed zijn`);
  }

  console.log(
    `${path.relative(projectRoot, target.doel).split(path.sep).join('/')}  ${SIZE}x${SIZE}  ` +
      `${Math.round(dekking * 100)}% dekkend  ${Math.round(fs.statSync(target.doel).size / 1024)} KB`
  );
}

fs.writeFileSync(tempPagina, '<!-- tijdelijk bestand, mag weg -->', 'utf8');
console.log(`\nrendered with ${path.basename(browser)}`);
