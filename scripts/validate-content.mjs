// npm run validate:content
//
// Structural validation for src/content/verhalen/*.ts (REFACTOR-PLAN.md R7). Checks:
//   - every verhaal id is unique across all eras
//   - every verhaal.tijdperkId matches a real Tijdperk
//   - every VertaaldVeld has a non-empty `en`
//   - every Blok union member has its required fields, with the right shape
//   - quiz blocks have a boolean `antwoord`
// Plus one extra check beyond the plan's minimum: every collectie.verhaalId resolves to a real
// verhaal (see CLAUDE.md/REFACTOR-PLAN.md R5 note — a renamed/removed id silently shrinks a
// storyline instead of erroring, which this catches).
//
// See scripts/ts-content-loader.mjs for why this needs a custom loader instead of running the
// .ts content files directly.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(pathToFileURL('./scripts/ts-content-loader.mjs').href, pathToFileURL('./'));

const errors = [];

function isVertaaldVeld(value, path) {
  if (typeof value !== 'object' || value === null) {
    errors.push(`${path}: expected a VertaaldVeld object, got ${JSON.stringify(value)}`);
    return;
  }
  if (typeof value.en !== 'string' || value.en.trim() === '') {
    errors.push(`${path}: missing non-empty "en"`);
  }
}

function validateChapter(chapter, path) {
  if (typeof chapter !== 'object' || chapter === null) {
    errors.push(`${path}: expected a Chapter object`);
    return;
  }
  if (typeof chapter.id !== 'number') {
    errors.push(`${path}.id: expected a number, got ${JSON.stringify(chapter.id)}`);
  }
  isVertaaldVeld(chapter.titel, `${path}.titel`);
  if (!Array.isArray(chapter.blokken) || chapter.blokken.length === 0) {
    errors.push(`${path}.blokken: expected a non-empty array`);
  } else {
    chapter.blokken.forEach((blok, i) => validateBlok(blok, `${path}.blokken[${i}]`));
  }
}

function validateBlok(blok, path) {
  if (typeof blok !== 'object' || blok === null || typeof blok.type !== 'string') {
    errors.push(`${path}: not a valid Blok (missing "type")`);
    return;
  }
  switch (blok.type) {
    case 'tekst':
      isVertaaldVeld(blok.inhoud, `${path}.inhoud`);
      break;
    case 'afbeelding':
      if (typeof blok.bron !== 'string' || blok.bron.trim() === '') {
        errors.push(`${path}.bron: expected a non-empty string`);
      }
      isVertaaldVeld(blok.alt, `${path}.alt`);
      if (blok.bijschrift !== undefined) isVertaaldVeld(blok.bijschrift, `${path}.bijschrift`);
      break;
    case 'citaat':
      isVertaaldVeld(blok.tekst, `${path}.tekst`);
      isVertaaldVeld(blok.bron, `${path}.bron`);
      break;
    case 'quiz':
      isVertaaldVeld(blok.vraag, `${path}.vraag`);
      if (typeof blok.antwoord !== 'boolean') {
        errors.push(`${path}.antwoord: expected a boolean, got ${JSON.stringify(blok.antwoord)}`);
      }
      isVertaaldVeld(blok.uitleg, `${path}.uitleg`);
      break;
    default:
      errors.push(`${path}: unknown Blok type "${blok.type}"`);
  }
}

const { tijdperken } = await import('../src/constants/tijdperken.ts');
const { verhalen } = await import('../src/content/verhalen/index.ts');
const { collecties } = await import('../src/content/collecties.ts');

for (const tijdperk of tijdperken) {
  const path = `tijdperken["${tijdperk.id}"]`;
  isVertaaldVeld(tijdperk.titel, `${path}.titel`);
  isVertaaldVeld(tijdperk.periode, `${path}.periode`);
  isVertaaldVeld(tijdperk.korteBeschrijving, `${path}.korteBeschrijving`);
}
const tijdperkIds = new Set(tijdperken.map((t) => t.id));

const seenIds = new Map();
for (const verhaal of verhalen) {
  const path = `verhalen["${verhaal.id ?? '?'}"]`;

  if (typeof verhaal.id !== 'string' || verhaal.id.trim() === '') {
    errors.push(`${path}: missing a non-empty id`);
  } else if (seenIds.has(verhaal.id)) {
    errors.push(`${path}: duplicate id (also used by a verhaal in ${seenIds.get(verhaal.id)})`);
  } else {
    seenIds.set(verhaal.id, verhaal.tijdperkId ?? '?');
  }

  if (!tijdperkIds.has(verhaal.tijdperkId)) {
    errors.push(`${path}.tijdperkId: "${verhaal.tijdperkId}" does not match any Tijdperk`);
  }

  if (typeof verhaal.portretKleur !== 'string') {
    errors.push(`${path}.portretKleur: missing or not a string`);
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(verhaal.portretKleur)) {
    errors.push(`${path}.portretKleur: "${verhaal.portretKleur}" is geen geldig hex-kleur`);
  }

  if (verhaal.soort !== 'persoon' && verhaal.soort !== 'gebeurtenis') {
    errors.push(`${path}.soort: expected 'persoon' or 'gebeurtenis', got ${JSON.stringify(verhaal.soort)}`);
  }

  isVertaaldVeld(verhaal.titel, `${path}.titel`);
  isVertaaldVeld(verhaal.ondertitel, `${path}.ondertitel`);
  isVertaaldVeld(verhaal.teaser, `${path}.teaser`);

  if (!Array.isArray(verhaal.chapters) || verhaal.chapters.length === 0) {
    errors.push(`${path}.chapters: expected a non-empty array`);
  } else {
    verhaal.chapters.forEach((chapter, i) => validateChapter(chapter, `${path}.chapters[${i}]`));
  }
}

const verhaalIds = new Set(verhalen.map((v) => v.id));
for (const collectie of collecties) {
  for (const verhaalId of collectie.verhaalIds) {
    if (!verhaalIds.has(verhaalId)) {
      errors.push(`collecties["${collectie.id}"].verhaalIds: "${verhaalId}" does not resolve to any verhaal`);
    }
  }
}

if (errors.length > 0) {
  console.error(`validate:content found ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `validate:content OK — ${verhalen.length} verhalen across ${tijdperken.length} tijdperken, ${collecties.length} collecties.`,
);
