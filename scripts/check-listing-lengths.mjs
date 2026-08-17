#!/usr/bin/env node
/**
 * Check the Play Store listing copy in store/listing.md against Play's character
 * limits, and rewrite the "(n/limit)" counts underneath each block.
 *
 * Usage:
 *   node scripts/check-listing-lengths.mjs            # rewrite the counts
 *   node scripts/check-listing-lengths.mjs --check    # verify only, exit 1 if off
 *
 * Play counts characters, not bytes and not lines, so CRLF is normalised away
 * first — otherwise a file saved on Windows reports a longer description than
 * the console will.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const listingFile = path.join(__dirname, '..', 'store/listing.md');

/** Heading prefix -> Play's limit for that field. */
const FIELDS = [
  { heading: '## App name', limit: 30 },
  { heading: '## Short description', limit: 80 },
  { heading: '## Full description', limit: 4000 },
];

const checkOnly = process.argv.includes('--check');

const raw = fs.readFileSync(listingFile, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let text = raw;
let failed = false;

for (const { heading, limit } of FIELDS) {
  const start = text.indexOf(heading);
  if (start === -1) throw new Error(`heading not found: ${heading}`);

  const open = text.indexOf('```', start);
  const bodyStart = text.indexOf('\n', open) + 1;
  const close = text.indexOf('```', bodyStart);
  if (open === -1 || close === -1) throw new Error(`no fenced block under ${heading}`);

  const body = text.slice(bodyStart, close).replace(/\r\n/g, '\n').replace(/\n$/, '');
  const length = [...body].length;
  const over = length > limit;
  if (over) failed = true;

  const label = `${length.toLocaleString('nl-NL')}/${limit}`;
  console.log(`${over ? 'OVER  ' : 'ok    '}${heading.replace('## ', '').padEnd(20)} ${label}`);

  // Refresh the "(n/limit)." line that follows the block, if there is one.
  const after = text.indexOf('\n', close);
  const tail = text.slice(after);
  const counted = tail.replace(
    /^(\s*)\(\d[\d.,]*\/\d+\.?\)/,
    (_m, ws) => `${ws}(${label}.)`
  );
  if (counted !== tail) text = text.slice(0, after) + counted;
}

if (!checkOnly && text !== raw) {
  fs.writeFileSync(listingFile, text.replace(/\r?\n/g, eol));
  console.log('\nstore/listing.md counts updated.');
} else if (checkOnly && text !== raw) {
  console.error('\nThe "(n/limit)" counts in store/listing.md are stale — run without --check.');
  failed = true;
}

if (failed) process.exit(1);
