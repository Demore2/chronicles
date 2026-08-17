#!/usr/bin/env node
/**
 * Build the Android notification icon (LAUNCH-PLAN.md B6):
 *
 *   assets/images/notification-icon.png   96x96, all-white PNG with transparency
 *
 * Android draws this icon as a **silhouette**: every non-transparent pixel is
 * repainted in the tint colour, whatever colour it had. So the source has to be
 * white-on-transparent, and any detail that relies on two colours disappears.
 * That is why this renders `history-book-compact.svg` and not the full mark: the
 * compact variant already drops the outer cover line and the clasp, which merge
 * into mush at 96px, and it carries a heavier line weight.
 *
 * Same approach as generate-store-assets.mjs — the SVG is the source of truth,
 * headless Chrome does the rasterising. The markup is **inlined into the page**
 * rather than loaded through an <img>: an img is an isolated document, so the
 * white recolouring below would not reach it (see CLAUDE.md, `currentColor`).
 *
 * Usage:
 *   node scripts/generate-notification-icon.mjs
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const SIZE = 96;
const source = path.join(projectRoot, 'assets/images/mascotte/history-book-compact.svg');
const target = path.join(projectRoot, 'assets/images/notification-icon.png');
const tempPagina = path.join(projectRoot, '.tmp-notification-icon.html');

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

// De compacte variant is crème-op-teal; voor een silhouet moet alles wit worden
// en de achtergrond weg. Vandaar de vervanging in plaats van een tweede SVG-bestand.
const svg = fs
  .readFileSync(source, 'utf8')
  .replace(/<rect width="1024" height="1024" fill="#3B6E7D"\/>\s*/, '')
  .replace(/#F7F1E4/g, '#FFFFFF');

fs.writeFileSync(
  tempPagina,
  `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent}
  svg{display:block;width:${SIZE}px;height:${SIZE}px}
</style>
${svg}`,
  'utf8'
);

const browser = findBrowser();
execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    // Zonder dit vult Chrome de achtergrond wit op en levert een dichte vierkante tegel.
    '--default-background-color=00000000',
    '--virtual-time-budget=2000',
    `--window-size=${SIZE},${SIZE}`,
    `--screenshot=${target}`,
    pathToFileURL(tempPagina).href,
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

if (!fs.existsSync(target)) throw new Error('the browser produced no screenshot');

const png = PNG.sync.read(fs.readFileSync(target));
if (png.width !== SIZE || png.height !== SIZE) {
  throw new Error(`expected ${SIZE}x${SIZE}, got ${png.width}x${png.height}`);
}

// Nameten in plaats van aannemen: alles wat zichtbaar is moet wit zijn, en er moet
// een substantieel transparant deel overblijven — een volledig dekt icoon betekent
// dat de achtergrond toch is meegerenderd en Android een blanco vierkant toont.
let dekkend = 0;
let nietWit = 0;
for (let i = 0; i < png.data.length; i += 4) {
  if (png.data[i + 3] < 8) continue;
  dekkend++;
  if (png.data[i] < 200 || png.data[i + 1] < 200 || png.data[i + 2] < 200) nietWit++;
}
const dekking = dekkend / (SIZE * SIZE);
if (nietWit > 0) throw new Error(`${nietWit} zichtbare pixels zijn niet wit`);
if (dekking > 0.6) throw new Error(`icoon is ${Math.round(dekking * 100)}% dekkend — achtergrond mee gerenderd?`);

fs.writeFileSync(tempPagina, '<!-- tijdelijk bestand, mag weg -->', 'utf8');
console.log(
  `assets/images/notification-icon.png  ${SIZE}x${SIZE}  ` +
    `${Math.round(dekking * 100)}% dekkend, alle zichtbare pixels wit  ` +
    `${Math.round(fs.statSync(target).size / 1024)} KB`
);
