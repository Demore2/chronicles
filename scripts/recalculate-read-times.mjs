// npm run content:read-times        — herschrijft Verhaal.leestijdMinuten in de content-files
// npm run content:read-times -- --check  — rapporteert alleen, schrijft niets (exit 1 bij verschil)
//
// Achtergrond (LAUNCH-PLAN.md B5): elk verhaal claimde 40-48 minuten leestijd terwijl de
// werkelijke tekst ~11-16 minuten is bij 250 wpm. De waarde stond met de hand ingevuld in de
// content en liep daardoor uit de pas met de tekst. Dit script leidt hem af uit de daadwerkelijke
// woordtelling, met exact dezelfde helper die de app gebruikt voor de leestijd per hoofdstuk
// (src/content/leestijd.ts) — zo kan het verhaal-totaal nooit meer van de tegels afwijken.
//
// De vervanging is tekstueel in plaats van via een AST: elke `  leestijdMinuten: N,` hoort bij de
// dichtstbijzijnde `  id: '<slug>'` erboven op hetzelfde inspringniveau (elk verhaal is een
// top-level object literal). Zie scripts/ts-content-loader.mjs voor waarom .ts-imports hier een
// eigen resolve-hook nodig hebben.
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import './asset-require-shim.mjs';

register(pathToFileURL('./scripts/ts-content-loader.mjs').href, pathToFileURL('./'));

const CHECK_ONLY = process.argv.includes('--check');
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'verhalen');

const { verhalen } = await import('../src/content/verhalen/index.ts');
const { berekenVerhaalLeestijdMinuten, telWoordenInChapters } = await import(
  '../src/content/leestijd.ts'
);

// In Node kennen we geen taalvoorkeur; 'en' is de bron van waarheid voor alle content.
const resolveEn = (veld) => veld.en;

const verwacht = new Map();
for (const verhaal of verhalen) {
  verwacht.set(verhaal.id, {
    minuten: berekenVerhaalLeestijdMinuten(verhaal.chapters, resolveEn),
    woorden: telWoordenInChapters(verhaal.chapters, resolveEn),
    huidig: verhaal.leestijdMinuten,
  });
}

function contentFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return contentFiles(full);
      return entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts' ? [full] : [];
    });
}

const ID_REGEX = /^ {2}id: '([^']+)',$/;
const LEESTIJD_REGEX = /^( {2}leestijdMinuten: )(\d+)(,)$/;

const gewijzigd = [];
const afwijkend = [];
const nietGevonden = new Set(verwacht.keys());

for (const file of contentFiles(CONTENT_DIR)) {
  const bytes = fs.readFileSync(file);
  const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const bron = bytes.toString('utf8').slice(hasBom ? 1 : 0);
  const regels = bron.split('\n');

  let huidigeId = null;
  let aangepast = false;

  for (let i = 0; i < regels.length; i++) {
    const idMatch = ID_REGEX.exec(regels[i].replace(/\r$/, ''));
    if (idMatch) {
      huidigeId = idMatch[1];
      continue;
    }
    const leesMatch = LEESTIJD_REGEX.exec(regels[i].replace(/\r$/, ''));
    if (!leesMatch) continue;

    if (!huidigeId || !verwacht.has(huidigeId)) {
      console.error(`  ! ${path.relative(process.cwd(), file)}:${i + 1}: geen bijbehorend verhaal-id`);
      process.exitCode = 1;
      continue;
    }

    nietGevonden.delete(huidigeId);
    const { minuten, woorden, huidig } = verwacht.get(huidigeId);
    if (Number(leesMatch[2]) === minuten) continue;

    const regel = { id: huidigeId, van: huidig, naar: minuten, woorden };
    afwijkend.push(regel);
    if (!CHECK_ONLY) {
      const eol = regels[i].endsWith('\r') ? '\r' : '';
      regels[i] = `${leesMatch[1]}${minuten}${leesMatch[3]}${eol}`;
      aangepast = true;
      gewijzigd.push(regel);
    }
  }

  if (aangepast) {
    const uit = regels.join('\n');
    fs.writeFileSync(file, hasBom ? '﻿' + uit : uit, 'utf8');
  }
}

for (const id of nietGevonden) {
  console.error(`  ! verhaal "${id}" heeft geen leestijdMinuten-regel in de content-files`);
  process.exitCode = 1;
}

if (afwijkend.length === 0) {
  console.log(`content:read-times OK — alle ${verwacht.size} verhalen kloppen al.`);
} else {
  for (const r of afwijkend) {
    console.log(`  ${r.id.padEnd(26)} ${String(r.van).padStart(3)} -> ${String(r.naar).padStart(3)} min  (${r.woorden} woorden)`);
  }
  if (CHECK_ONLY) {
    console.error(`\ncontent:read-times: ${afwijkend.length} verhaal/verhalen staan scheef. Draai zonder --check.`);
    process.exitCode = 1;
  } else {
    console.log(`\ncontent:read-times — ${gewijzigd.length} verhaal/verhalen bijgewerkt.`);
  }
}
