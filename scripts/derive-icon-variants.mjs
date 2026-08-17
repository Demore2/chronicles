#!/usr/bin/env node
/**
 * Derive the app-icon variants app.json needs from a single generated source.
 *
 * Usage:
 *   node scripts/derive-icon-variants.mjs [sourcePng]
 *
 * Source defaults to assets/images/icon-candidates/candidate-1-fixed.png.
 * Writes, all with a flat edge-to-edge background sampled from the source:
 *
 *   assets/images/app-icon.png            1024x1024  store + iOS icon, mark recentred
 *   assets/images/app-icon-adaptive.png   1024x1024  Android adaptive foreground,
 *                                                    mark shrunk into the inner 66% safe zone
 *   assets/images/app-favicon.png          196x196   web favicon
 *
 * Pure JS via pngjs so there is no sharp/ImageMagick dependency. Only ever
 * downscales, so a box/bilinear resample is good enough.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const imagesDir = path.join(projectRoot, 'assets/images');

/**
 * Fraction of the canvas the mark may occupy in the adaptive foreground.
 * Android masks a 108dp canvas down to a 72dp visible area (66%), and the mask
 * can be a circle, so anything at the theoretical limit loses its extremes.
 * 0.56 keeps the whole mark inside every mask shape.
 */
const SAFE_ZONE = 0.56;
/** Diameter of the visible area, as a fraction of the 108dp canvas. */
const MASK_DIAMETER = 72 / 108;

/**
 * `coverage` scales the mark's *longest side*, but a circular mask cuts on
 * radius — so what actually has to fit is the bounding box's **diagonal**.
 * A wide mark (the book is 544x479) at a flat 0.56 keeps its width inside the
 * circle and loses its bottom corners; measured on a Pixel launcher, not
 * assumed. Square-ish marks are unaffected, because for them the diagonal
 * limit lands above SAFE_ZONE and the min() keeps the old value.
 */
function adaptiveCoverage(bounds) {
  const longest = Math.max(bounds.width, bounds.height);
  const diagonal = Math.hypot(bounds.width, bounds.height);
  return Math.min(SAFE_ZONE, (MASK_DIAMETER * longest) / diagonal);
}
/**
 * Summed per-channel distance from the background before a pixel counts as
 * "mark". Generated art has a soft vignette and dithering, so this has to be
 * well above zero or every edge pixel reads as mark.
 */
const BG_TOLERANCE = 48;
/**
 * A row/column only counts as containing the mark once this fraction of it is
 * mark pixels — kills the remaining speckle without eroding real strokes.
 */
const MIN_RUN = 0.004;

const readPng = (file) => PNG.sync.read(fs.readFileSync(file));

function writePng(png, file) {
  fs.writeFileSync(file, PNG.sync.write(png));
  return `${path.relative(projectRoot, file)}  ${png.width}x${png.height}  ${Math.round(fs.statSync(file).size / 1024)} KB`;
}

const at = (png, x, y) => (png.width * y + x) << 2;

/** Median of the four corner patches — robust against a stray antialiased pixel. */
function sampleBackground(png) {
  const patch = 12;
  const corners = [
    [0, 0],
    [png.width - patch, 0],
    [0, png.height - patch],
    [png.width - patch, png.height - patch],
  ];
  const channels = [[], [], []];
  for (const [ox, oy] of corners) {
    for (let y = oy; y < oy + patch; y++) {
      for (let x = ox; x < ox + patch; x++) {
        const i = at(png, x, y);
        channels[0].push(png.data[i]);
        channels[1].push(png.data[i + 1]);
        channels[2].push(png.data[i + 2]);
      }
    }
  }
  return channels.map((c) => c.sort((a, b) => a - b)[c.length >> 1]);
}

/** Bounding box of the mark, ignoring rows/columns that are only speckle. */
function markBounds(png, bg) {
  const rows = new Uint32Array(png.height);
  const cols = new Uint32Array(png.width);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = at(png, x, y);
      const diff =
        Math.abs(png.data[i] - bg[0]) +
        Math.abs(png.data[i + 1] - bg[1]) +
        Math.abs(png.data[i + 2] - bg[2]);
      if (diff > BG_TOLERANCE) {
        rows[y]++;
        cols[x]++;
      }
    }
  }

  const span = (counts, limit) => {
    const threshold = Math.max(2, Math.round(limit * MIN_RUN));
    let lo = 0;
    let hi = counts.length - 1;
    while (lo < counts.length && counts[lo] < threshold) lo++;
    while (hi >= 0 && counts[hi] < threshold) hi--;
    return [lo, hi];
  };

  const [minX, maxX] = span(cols, png.height);
  const [minY, maxY] = span(rows, png.width);
  if (maxX < minX || maxY < minY) throw new Error('no mark found — source looks like a blank canvas');
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function filled(size, bg) {
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = bg[0];
    png.data[i + 1] = bg[1];
    png.data[i + 2] = bg[2];
    png.data[i + 3] = 255;
  }
  return png;
}

/**
 * Bilinear-sample the source rectangle into the destination rectangle.
 * Everything outside the source clamps to the edge, which is background, so
 * the seam stays invisible.
 */
function drawScaled(src, srcRect, dst, dstRect) {
  const scaleX = srcRect.width / dstRect.width;
  const scaleY = srcRect.height / dstRect.height;
  for (let dy = 0; dy < dstRect.height; dy++) {
    const sy = srcRect.y + (dy + 0.5) * scaleY - 0.5;
    const y0 = Math.max(0, Math.min(src.height - 1, Math.floor(sy)));
    const y1 = Math.max(0, Math.min(src.height - 1, y0 + 1));
    const fy = Math.max(0, Math.min(1, sy - y0));
    for (let dx = 0; dx < dstRect.width; dx++) {
      const sx = srcRect.x + (dx + 0.5) * scaleX - 0.5;
      const x0 = Math.max(0, Math.min(src.width - 1, Math.floor(sx)));
      const x1 = Math.max(0, Math.min(src.width - 1, x0 + 1));
      const fx = Math.max(0, Math.min(1, sx - x0));

      const targetX = dstRect.x + dx;
      const targetY = dstRect.y + dy;
      if (targetX < 0 || targetY < 0 || targetX >= dst.width || targetY >= dst.height) continue;

      const o = at(dst, targetX, targetY);
      for (let c = 0; c < 3; c++) {
        const top =
          src.data[at(src, x0, y0) + c] * (1 - fx) + src.data[at(src, x1, y0) + c] * fx;
        const bottom =
          src.data[at(src, x0, y1) + c] * (1 - fx) + src.data[at(src, x1, y1) + c] * fx;
        dst.data[o + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
      dst.data[o + 3] = 255;
    }
  }
}

/** Place the source's mark, scaled to `coverage` of the canvas, dead centre. */
function compose(src, bounds, bg, size, coverage) {
  const out = filled(size, bg);
  const scale = (size * coverage) / Math.max(bounds.width, bounds.height);
  const width = Math.round(bounds.width * scale);
  const height = Math.round(bounds.height * scale);
  drawScaled(
    src,
    { x: bounds.minX, y: bounds.minY, width: bounds.width, height: bounds.height },
    out,
    { x: Math.round((size - width) / 2), y: Math.round((size - height) / 2), width, height }
  );
  return out;
}

const source = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(imagesDir, 'icon-candidates/candidate-1-fixed.png');

if (!fs.existsSync(source)) {
  console.error(`source not found: ${source}`);
  process.exit(1);
}

const src = readPng(source);
const bg = sampleBackground(src);
const bounds = markBounds(src, bg);
const hex = `#${bg.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

console.log(`source     ${path.relative(projectRoot, source)}  ${src.width}x${src.height}`);
console.log(`background ${hex}`);
console.log(
  `mark bbox  ${bounds.width}x${bounds.height} at (${bounds.minX},${bounds.minY}) ` +
    `= ${Math.round((Math.max(bounds.width, bounds.height) / src.width) * 100)}% of canvas\n`
);

// Full-bleed store icon: keep the mark's original size, just recentre it.
const coverage = Math.max(bounds.width, bounds.height) / src.width;
console.log(writePng(compose(src, bounds, bg, 1024, coverage), path.join(imagesDir, 'app-icon.png')));
const adaptive = adaptiveCoverage(bounds);
console.log(
  writePng(compose(src, bounds, bg, 1024, adaptive), path.join(imagesDir, 'app-icon-adaptive.png')) +
    `  (coverage ${adaptive.toFixed(3)})`
);
console.log(writePng(compose(src, bounds, bg, 196, coverage), path.join(imagesDir, 'app-favicon.png')));

console.log(`\nSet adaptiveIcon.backgroundColor and the splash backgroundColor to ${hex}.`);
