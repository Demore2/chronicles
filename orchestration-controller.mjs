#!/usr/bin/env node
/**
 * ORCHESTRATION-CONTROLLER.mjs
 *
 * Genereert nieuwe verhalen per tijdperk met de Anthropic API en schrijft ze naar
 * `src/content/verhalen/<era>/gegenereerd.ts`.
 *
 * Usage:
 *   npm run generate:batch -- --eras oudheid --count 1
 *   npm run generate:batch -- --eras oudheid,middeleeuwen --count 3 --themes trade
 *   npm run generate:batch -- --eras all --count 2 --dry-run
 *
 * Env vars:
 *   ANTHROPIC_API_KEY (verplicht; wordt ook uit .env.local gelezen)
 *   BATCH_MODEL       (default "claude-opus-5")
 *   BATCH_TIMEOUT_MS  (default 600000, per API-call)
 *   BATCH_MAX_RETRIES (default 2)
 *   GIT_COMMIT        (default "false"; "true" om automatisch te committen)
 *
 * ---------------------------------------------------------------------------
 * Waarom dit script er zo uitziet (het is in Fase R7 volledig herschreven):
 *
 * 1. SCHRIJFDOEL. De vorige versie schreef naar `src/content/verhalen/<era>.ts`. Dat pad is
 *    sinds R7 een one-line re-export shim (`export * from './<era>/index'`); overschrijven
 *    daarvan sloopt `src/content/verhalen/index.ts` en dus álle verhalen. We schrijven nu naar
 *    een eigen bestand per tijdperk, `<era>/gegenereerd.ts`, dat dit script volledig bezit.
 *    De handgeschreven `personen.ts` / `gebeurtenissen.ts` worden nooit aangeraakt — geen
 *    string-surgery op CRLF-content met twee verschillende block-layouts.
 *
 * 2. DATAMODEL. De oude prompts vroegen om het pre-R7 model: `blokken` direct op het verhaal,
 *    een `quiz`-blok, `afbeelding` als URL-string, `illustratieKleur`. Niets daarvan bestaat nog.
 *    Nu: `chapters: Chapter[]`, en de blok-types uit `src/constants/types.ts`.
 *
 * 3. GEEN AFBEELDINGEN. `Verhaal.afbeelding` en `Chapter.afbeelding` zijn gebundelde
 *    `require()`-assets (CHARACTER_IMAGES / SCENE_IMAGES). Voor een nieuw verhaal bestaan die
 *    .webp-bestanden nog niet, dus laat een gegenereerd verhaal ze weg en valt de kaart terug op
 *    `portretKleur`. Dat maakt gegenereerde verhalen ook puur JSON-serialiseerbaar, wat stap 4
 *    mogelijk maakt.
 *
 * 4. APPEND ZONDER PARSEN. Bestaande gegenereerde verhalen worden ingeladen via de echte
 *    ts-content-loader en samen met de nieuwe opnieuw geserialiseerd. Het bestand wordt dus
 *    volledig herschreven maar niets gaat verloren, en er komt geen regex aan te pas.
 *
 * 5. ÉÉN CALL PER VERHAAL. Eerst kiest een "subject picker"-call N onderwerpen per tijdperk
 *    (met de bestaande ids erbij, zodat hij niet dubbelt), daarna schrijft één call per
 *    onderwerp de 8 hoofdstukken. De oude versie propte N complete verhalen in één call van
 *    max_tokens 4000 — goed voor ongeveer één hoofdstuk, de rest werd afgekapt.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// `require` bestaat niet in ESM en een .webp is hier niet importeerbaar; de shim stubt het weg
// zodat de content-bestanden inlaadbaar zijn (zie CLAUDE.md, "Node scripts die content laden").
import "./scripts/asset-require-shim.mjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

register(pathToFileURL("./scripts/ts-content-loader.mjs").href, pathToFileURL("./"));

// ---------------------------------------------------------------------------
// Constanten
// ---------------------------------------------------------------------------

const ERAS = [
  {
    id: "oudheid",
    camel: "oudheid",
    label: "Antiquity",
    bereik: "3000 BCE – 500 CE",
    kleur: "#ffd89b",
    scope:
      "Egypt, Mesopotamia, Greece, Rome, Persia, China, India. Historical accuracy prioritised; no anachronisms.",
  },
  {
    id: "middeleeuwen",
    camel: "middeleeuwen",
    label: "Middle Ages",
    bereik: "500 – 1500 CE",
    kleur: "#e8b4a8",
    scope:
      "Feudalism, chivalry, religion, plague, trade networks, early exploration. Humanise both sides of every conflict.",
  },
  {
    id: "vroegmoderne-tijd",
    camel: "vroegmoderneTijd",
    label: "Early Modern",
    bereik: "1500 – 1800 CE",
    kleur: "#d4a574",
    scope:
      "Renaissance, exploration, Reformation, Scientific Revolution, absolute monarchies. Include moral ambiguity: exploration brought knowledge AND colonisation.",
  },
  {
    id: "industriele-revolutie",
    camel: "industrieleRevolutie",
    label: "Industrial Revolution",
    bereik: "1800 – 1900 CE",
    kleur: "#b8956a",
    scope:
      "Mechanisation, urbanisation, ideology, global industrialisation. Humanise both worker and factory owner, coloniser and colonised.",
  },
  {
    id: "twintigste-eeuw",
    camel: "twintigsteEeuw",
    label: "20th Century",
    bereik: "1900 – 2000 CE",
    kleur: "#9b7d5c",
    scope:
      "World wars, ideological struggle, decolonisation, civil rights, scientific breakthroughs. Trauma and hope coexist; avoid simplistic heroism.",
  },
  {
    id: "hedendaags",
    camel: "hedendaags",
    label: "Contemporary",
    bereik: "2000 – present",
    kleur: "#8fa3a8",
    scope:
      "Digital revolution, climate crisis, social movements, pandemics, geopolitical shifts. Recency breeds false certainty — balance hope with ongoing uncertainty, avoid hagiography.",
  },
];

const MODEL = process.env.BATCH_MODEL || "claude-opus-5";
const TIMEOUT_MS = parseInt(process.env.BATCH_TIMEOUT_MS || "600000", 10);
const MAX_RETRIES = parseInt(process.env.BATCH_MAX_RETRIES || "2", 10);

const AANTAL_HOOFDSTUKKEN = 8;

/**
 * De blok-types die een gegenereerd verhaal mag gebruiken. `afbeelding` ontbreekt bewust (zie
 * kopcommentaar punt 3) en `quiz` bestaat niet meer — quizzes zijn uit de app gehaald, en
 * `blok-weergave.tsx` heeft er geen tak voor.
 */
const TOEGESTANE_BLOK_TYPES = ["tekst", "kop", "citaat", "weetje", "sleutelmoment"];

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const SUBJECT_SYSTEM_PROMPT = `You pick subjects for an illustrated history app aimed at curious general readers.

Return ONLY a valid JSON array. No markdown fences, no preamble, no trailing commentary.

Each element:
{
  "id": "kebab-case-slug",          // unique, <40 chars, ASCII only, derived from the subject's name
  "naam": "Cleopatra VII",          // the person's name, or the event's short name
  "titel": "Cleopatra",             // display title, short
  "ondertitel": "Last pharaoh of Egypt",   // one short descriptive line, no final period
  "teaser": "One or two sentences that make a reader want to open this story.",
  "jaar": -30,                      // representative year; NEGATIVE for BCE
  "periodeLabel": "69 BC - 30 BC",  // plain ASCII, hyphen-separated range
  "soort": "persoon",               // "persoon" or "gebeurtenis"
  "themas": ["macht", "egypte"],    // 3-5 lowercase Dutch-ish keyword tags
  "portretKleur": "#8B4513"         // 6-digit hex, warm and readable as a card background
}

Rules:
- Subjects must be genuinely distinct from each other and from the existing ids you are given.
- Prefer subjects with enough documented material to sustain eight chapters.
- "jaar" must fall inside the era's date range.`;

function subjectUserPrompt(era, count, themes, bestaandeIds) {
  return `Pick ${count} subject(s) for the ${era.label} era (${era.bereik}).

Scope: ${era.scope}

Theme emphasis: ${themes.length ? themes.join(", ") : "balanced across the era"}

These story ids already exist in the app — do NOT pick these subjects, and do not reuse these ids:
${bestaandeIds.length ? bestaandeIds.map((id) => `- ${id}`).join("\n") : "- (none yet)"}

Return a JSON array of exactly ${count} object(s).`;
}

const CHAPTERS_SYSTEM_PROMPT = `You write chapters for an illustrated history app. Accurate, vivid, and readable — narrative non-fiction, not an encyclopedia entry.

Return ONLY a valid JSON array of exactly ${AANTAL_HOOFDSTUKKEN} chapter objects. No markdown fences, no preamble.

Chapter shape:
{
  "id": 1,                                  // 1..${AANTAL_HOOFDSTUKKEN}, in order
  "titel": { "en": "The Rise of an Ambitious Youth" },
  "blokken": [ ...blocks... ]
}

A block is exactly one of these five shapes — no other "type" value is allowed:

  { "type": "tekst",  "inhoud": { "en": "A full paragraph of prose." } }
  { "type": "kop",    "tekst":  { "en": "A short subheading" } }
  { "type": "citaat", "tekst":  { "en": "A quotation." }, "bron": { "en": "Attribution" } }
  { "type": "weetje", "tekst":  { "en": "A surprising did-you-know aside." } }
  { "type": "sleutelmoment", "jaar": -60, "tekst": { "en": "One sentence about what happened that year." } }

Hard rules:
- Every text field is an object with an "en" key. Never a bare string. Only "en" — no other languages.
- "sleutelmoment".jaar is a plain number; negative means BCE. Do not write the year into the text as well.
- Do NOT emit an "afbeelding" block. Do NOT emit a "quiz" block. They will be rejected.
- Each chapter: 5-8 blocks, 400-700 words of readable prose, and at least one "tekst" block.
- Across the whole story use at least two "kop", one "citaat", one "weetje" and two "sleutelmoment"
  blocks, so the story does not read as a wall of identical paragraphs.
- Quotations must be real and attributable. If you are not certain of the exact wording, paraphrase
  in a "tekst" block instead of inventing a quote.
- The eight chapters must form one chronological arc: origins, rise, turning point, consequences, legacy.`;

function chaptersUserPrompt(era, subject) {
  return `Write the ${AANTAL_HOOFDSTUKKEN} chapters for this story.

Era: ${era.label} (${era.bereik})
Subject: ${subject.naam}
Title: ${subject.titel} — ${subject.ondertitel}
Type: ${subject.soort === "persoon" ? "a person" : "an event"}
Period: ${subject.periodeLabel}
Teaser: ${subject.teaser}
Themes: ${subject.themas.join(", ")}

Tone: ${era.scope}

Return a JSON array of exactly ${AANTAL_HOOFDSTUKKEN} chapters.`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { eras: "all", count: 1, themes: "", dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--eras" && i + 1 < args.length) opts.eras = args[i + 1];
    if (args[i] === "--count" && i + 1 < args.length) opts.count = parseInt(args[i + 1], 10);
    if (args[i] === "--themes" && i + 1 < args.length) opts.themes = args[i + 1];
    if (args[i] === "--dry-run") opts.dryRun = true;
  }

  const eraIds = opts.eras === "all" ? ERAS.map((e) => e.id) : opts.eras.split(",").map((e) => e.trim());

  const onbekend = eraIds.filter((id) => !ERAS.some((e) => e.id === id));
  if (onbekend.length > 0) {
    throw new Error(
      `Unknown era(s): ${onbekend.join(", ")}. Valid: ${ERAS.map((e) => e.id).join(", ")}`,
    );
  }
  if (!Number.isInteger(opts.count) || opts.count < 1) {
    throw new Error(`--count must be a positive integer, got "${opts.count}"`);
  }

  return {
    eras: ERAS.filter((e) => eraIds.includes(e.id)),
    count: opts.count,
    themes: opts.themes ? opts.themes.split(",").map((t) => t.trim()) : [],
    dryRun: opts.dryRun,
  };
}

/** Zelfde aanpak als scripts/generate-portrait-images.mjs: env-var, anders .env.local. */
function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return undefined;
  const match = fs.readFileSync(envPath, "utf8").match(/^ANTHROPIC_API_KEY=(.+)$/m);
  return match ? match[1].trim() : undefined;
}

function initClient() {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set (environment or .env.local)");
  }
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// API-helpers
// ---------------------------------------------------------------------------

/** Modellen zetten er soms toch een ```json-fence omheen; die halen we eraf voor JSON.parse. */
function parseJsonArray(raw, wat) {
  let tekst = raw.trim();
  const fence = tekst.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  if (fence) tekst = fence[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(tekst);
  } catch (err) {
    throw new Error(`${wat}: response is not valid JSON (${err.message})`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`${wat}: expected a JSON array, got ${typeof parsed}`);
  }
  return parsed;
}

/**
 * Altijd streamen. De SDK weigert een niet-gestreamde request waarvan `max_tokens` impliceert dat
 * hij langer dan 10 minuten kan duren — en een verhaal van 8 hoofdstukken zit ruim in die
 * categorie. De stream geeft meteen ook voortgang, zodat een run van een paar minuten niet als
 * een hang aanvoelt.
 */
async function callModel(client, { system, user, maxTokens, wat, voortgang = false }) {
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    },
    { timeout: TIMEOUT_MS },
  );

  if (voortgang) {
    let tekens = 0;
    let punten = 0;
    stream.on("text", (delta) => {
      tekens += delta.length;
      while (tekens > (punten + 1) * 2000) {
        punten++;
        process.stdout.write(".");
      }
    });
  }

  const response = await stream.finalMessage();

  if (response.stop_reason === "max_tokens") {
    throw new Error(`${wat}: response hit the ${maxTokens}-token cap and was truncated`);
  }
  const content = response.content.find((c) => c.type === "text");
  if (!content) {
    throw new Error(`${wat}: no text block in the response`);
  }
  return content.text;
}

/**
 * Een ongeldige sleutel of een leeg tegoed lost zichzelf niet op door het nog eens te proberen —
 * die gooien we meteen door in plaats van er retries (en wachttijd) aan te verspillen.
 */
function isOnherstelbaar(err) {
  if (err?.status === 401 || err?.status === 403) return true;
  return err?.status === 400 && /credit balance|billing/i.test(err?.message ?? "");
}

async function withRetry(fn, wat) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (isOnherstelbaar(err) || attempt >= MAX_RETRIES) throw err;
      console.warn(`  [retry] ${wat}: attempt ${attempt} failed — ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

// ---------------------------------------------------------------------------
// Validatie van gegenereerde content
// ---------------------------------------------------------------------------

function isVertaaldVeld(value) {
  return typeof value === "object" && value !== null && typeof value.en === "string" && value.en.trim() !== "";
}

function controleerSubject(subject, era, bestaandeIds, fouten) {
  const p = `subject "${subject?.id ?? "?"}"`;
  if (typeof subject?.id !== "string" || !/^[a-z0-9-]+$/.test(subject.id)) {
    fouten.push(`${p}: id must be kebab-case ASCII`);
  } else if (bestaandeIds.includes(subject.id)) {
    fouten.push(`${p}: id collides with an existing story`);
  }
  for (const veld of ["naam", "titel", "ondertitel", "teaser", "periodeLabel"]) {
    if (typeof subject?.[veld] !== "string" || subject[veld].trim() === "") {
      fouten.push(`${p}.${veld}: missing`);
    }
  }
  if (typeof subject?.jaar !== "number" || !Number.isFinite(subject.jaar)) {
    fouten.push(`${p}.jaar: expected a number`);
  }
  if (subject?.soort !== "persoon" && subject?.soort !== "gebeurtenis") {
    fouten.push(`${p}.soort: expected 'persoon' or 'gebeurtenis'`);
  }
  if (!Array.isArray(subject?.themas) || subject.themas.length === 0) {
    fouten.push(`${p}.themas: expected a non-empty array`);
  }
  if (typeof subject?.portretKleur !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(subject.portretKleur)) {
    fouten.push(`${p}.portretKleur: expected a 6-digit hex colour`);
  }
  void era;
}

/**
 * Spiegelt scripts/validate-content.mjs, maar dan vóór het wegschrijven — zo faalt een run op de
 * generator in plaats van op een half weggeschreven contentbestand.
 */
function controleerChapters(chapters, fouten) {
  if (!Array.isArray(chapters) || chapters.length !== AANTAL_HOOFDSTUKKEN) {
    fouten.push(`chapters: expected exactly ${AANTAL_HOOFDSTUKKEN}, got ${chapters?.length ?? 0}`);
    return;
  }
  chapters.forEach((chapter, i) => {
    const p = `chapters[${i}]`;
    if (chapter?.id !== i + 1) fouten.push(`${p}.id: expected ${i + 1}, got ${JSON.stringify(chapter?.id)}`);
    if (!isVertaaldVeld(chapter?.titel)) fouten.push(`${p}.titel: missing non-empty "en"`);
    if (!Array.isArray(chapter?.blokken) || chapter.blokken.length === 0) {
      fouten.push(`${p}.blokken: expected a non-empty array`);
      return;
    }
    chapter.blokken.forEach((blok, j) => {
      const bp = `${p}.blokken[${j}]`;
      if (!TOEGESTANE_BLOK_TYPES.includes(blok?.type)) {
        fouten.push(`${bp}: disallowed Blok type ${JSON.stringify(blok?.type)}`);
        return;
      }
      switch (blok.type) {
        case "tekst":
          if (!isVertaaldVeld(blok.inhoud)) fouten.push(`${bp}.inhoud: missing non-empty "en"`);
          break;
        case "citaat":
          if (!isVertaaldVeld(blok.tekst)) fouten.push(`${bp}.tekst: missing non-empty "en"`);
          if (!isVertaaldVeld(blok.bron)) fouten.push(`${bp}.bron: missing non-empty "en"`);
          break;
        case "sleutelmoment":
          if (!isVertaaldVeld(blok.tekst)) fouten.push(`${bp}.tekst: missing non-empty "en"`);
          if (typeof blok.jaar !== "number" || !Number.isFinite(blok.jaar)) {
            fouten.push(`${bp}.jaar: expected a number`);
          }
          break;
        default: // kop, weetje
          if (!isVertaaldVeld(blok.tekst)) fouten.push(`${bp}.tekst: missing non-empty "en"`);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Content inladen
// ---------------------------------------------------------------------------

async function loadBestaandeIds() {
  const { verhalen } = await import("./src/content/verhalen/index.ts");
  return verhalen.map((v) => v.id);
}

/**
 * De al eerder gegenereerde verhalen van één tijdperk. Deze zijn puur JSON (geen require()-assets),
 * dus we kunnen ze inladen en samen met de nieuwe opnieuw serialiseren — geen tekstuele append.
 */
async function loadBestaandeGegenereerd(era) {
  const spec = `./src/content/verhalen/${era.id}/gegenereerd.ts`;
  if (!fs.existsSync(path.join(projectRoot, spec))) return [];
  const mod = await import(spec);
  const arr = mod[`${era.camel}Gegenereerd`];
  return Array.isArray(arr) ? arr : [];
}

// ---------------------------------------------------------------------------
// Wegschrijven
// ---------------------------------------------------------------------------

const BESTAND_KOP = `// AUTOGEGENEREERD door orchestration-controller.mjs — niet met de hand bewerken.
//
// Dit bestand wordt bij elke \`npm run generate:batch\`-run in zijn geheel herschreven vanuit
// de bestaande inhoud + de nieuwe stories. Wil je een gegenereerd verhaal houden en zelf
// verder redigeren, verplaats het dan naar personen.ts — daar blijft het buiten schot.
//
// Gegenereerde verhalen hebben bewust geen \`afbeelding\` en geen \`afbeelding\`-blokken: die
// verwijzen naar gebundelde require()-assets (CHARACTER_IMAGES / SCENE_IMAGES) die voor een
// nieuw verhaal nog niet bestaan. De kaart valt terug op \`portretKleur\`. Draai
// \`npm run generate:images:r9\` en \`npm run generate:images:scenes\` om ze alsnog te maken.
import type { Verhaal } from '@/constants/types';
`;

async function schrijfEra(era, verhalen) {
  const body = `${BESTAND_KOP}
export const ${era.camel}Gegenereerd: Verhaal[] = ${JSON.stringify(verhalen, null, 2)};
`;
  // De contentbestanden in deze repo zijn CRLF (zie CLAUDE.md); dit bestand volgt dat, anders
  // levert elke run een diff op die elke regel aanraakt.
  const bestandsPad = path.join(projectRoot, "src", "content", "verhalen", era.id, "gegenereerd.ts");
  await fsp.writeFile(bestandsPad, body.replace(/\r?\n/g, "\r\n"), "utf8");
  return path.relative(projectRoot, bestandsPad).replace(/\\/g, "/");
}

// ---------------------------------------------------------------------------
// Checkpoints
// ---------------------------------------------------------------------------

function runCheck(label, command) {
  process.stdout.write(`[${label}] ${command} ... `);
  try {
    execSync(command, { encoding: "utf-8", stdio: "pipe", cwd: projectRoot });
    console.log("OK");
    return true;
  } catch (err) {
    console.log("FAILED");
    console.error(err.stdout?.toString() || err.message);
    return false;
  }
}

function commitIfRequested(summary) {
  if (process.env.GIT_COMMIT !== "true") {
    console.log('[Git] Skipping commit (set GIT_COMMIT=true to auto-commit)');
    return;
  }
  try {
    execSync("git add src/content/verhalen", { stdio: "pipe", cwd: projectRoot });
    const message = `Generate ${summary.generated} story/stories across ${summary.eraCount} era(s)`;
    execSync(`git commit -m "${message}"`, { stdio: "pipe", cwd: projectRoot });
    console.log(`[Git] Committed: ${message}`);
  } catch (err) {
    console.warn("[Git] Commit failed (non-fatal):", err.message);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function genereerVerhaal(client, era, subject, berekenLeestijd) {
  const raw = await withRetry(
    () =>
      callModel(client, {
        system: CHAPTERS_SYSTEM_PROMPT,
        user: chaptersUserPrompt(era, subject),
        maxTokens: 32000,
        wat: `${subject.id} chapters`,
        voortgang: true,
      }),
    `${subject.id} chapters`,
  );

  const chapters = parseJsonArray(raw, `${subject.id} chapters`);
  const fouten = [];
  controleerChapters(chapters, fouten);
  if (fouten.length > 0) {
    throw new Error(`${subject.id}: generated chapters are invalid:\n    - ${fouten.join("\n    - ")}`);
  }

  return {
    id: subject.id,
    titel: { en: subject.titel },
    ondertitel: { en: subject.ondertitel },
    teaser: { en: subject.teaser },
    jaar: subject.jaar,
    periodeLabel: subject.periodeLabel,
    soort: subject.soort,
    // afbeelding: bewust weggelaten — zie kopcommentaar punt 3.
    portretKleur: subject.portretKleur,
    uitgelicht: false,
    tijdperkId: era.id,
    themas: subject.themas,
    // Niet aan het model gevraagd: leestijd komt uit dezelfde functie die de app gebruikt, zodat
    // hij per definitie klopt met wat de hoofdstuktegels tonen.
    leestijdMinuten: berekenLeestijd(chapters, (veld) => veld.en),
    personage: { naam: subject.naam },
    chapters,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("    ORCHESTRATION CONTROLLER: story generation");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const opts = parseArgs();
  const client = initClient();
  const { berekenVerhaalLeestijdMinuten } = await import("./src/content/leestijd.ts");

  console.log(`Model:   ${MODEL}`);
  console.log(`Eras:    ${opts.eras.map((e) => e.id).join(", ")}`);
  console.log(`Count:   ${opts.count} per era`);
  console.log(`Themes:  ${opts.themes.join(", ") || "(balanced)"}`);
  if (opts.dryRun) console.log("Dry run: nothing will be written\n");

  const bestaandeIds = await loadBestaandeIds();
  console.log(`\n[Content] ${bestaandeIds.length} existing stories loaded\n`);

  const summary = { generated: 0, failed: 0, eraCount: 0, bestanden: [] };
  // Groeit tijdens de run mee, zodat tijdperk 2 niet hetzelfde id kiest als tijdperk 1.
  const gereserveerdeIds = [...bestaandeIds];

  for (const era of opts.eras) {
    console.log(`── ${era.label} (${era.id})`);

    let subjects;
    try {
      const raw = await withRetry(
        () =>
          callModel(client, {
            system: SUBJECT_SYSTEM_PROMPT,
            user: subjectUserPrompt(era, opts.count, opts.themes, gereserveerdeIds),
            maxTokens: 4000,
            wat: `${era.id} subjects`,
          }),
        `${era.id} subjects`,
      );
      subjects = parseJsonArray(raw, `${era.id} subjects`);

      const fouten = [];
      subjects.forEach((s) => controleerSubject(s, era, gereserveerdeIds, fouten));
      if (fouten.length > 0) {
        throw new Error(`invalid subjects:\n    - ${fouten.join("\n    - ")}`);
      }
    } catch (err) {
      console.error(`  ✗ subject selection failed: ${err.message}`);
      summary.failed += opts.count;
      continue;
    }

    console.log(`  subjects: ${subjects.map((s) => s.id).join(", ")}`);

    const nieuwe = [];
    for (const subject of subjects) {
      process.stdout.write(`  writing ${subject.id} ... `);
      try {
        const verhaal = await genereerVerhaal(client, era, subject, berekenVerhaalLeestijdMinuten);
        nieuwe.push(verhaal);
        gereserveerdeIds.push(verhaal.id);
        console.log(`OK (${verhaal.chapters.length} chapters, ${verhaal.leestijdMinuten} min)`);
      } catch (err) {
        console.log("FAILED");
        console.error(`    ${err.message}`);
        summary.failed++;
      }
    }

    if (nieuwe.length === 0) continue;

    if (opts.dryRun) {
      console.log(`  [dry-run] would write ${nieuwe.length} story/stories to ${era.id}/gegenereerd.ts`);
      summary.generated += nieuwe.length;
      summary.eraCount++;
      continue;
    }

    const bestaand = await loadBestaandeGegenereerd(era);
    const bestand = await schrijfEra(era, [...bestaand, ...nieuwe]);
    console.log(`  wrote ${nieuwe.length} story/stories to ${bestand} (${bestaand.length + nieuwe.length} total)`);
    summary.generated += nieuwe.length;
    summary.eraCount++;
    summary.bestanden.push(bestand);
  }

  if (opts.dryRun) {
    console.log(`\nDry run complete — ${summary.generated} generated, ${summary.failed} failed.`);
    return;
  }

  if (summary.generated === 0) {
    console.error("\n❌ Nothing was generated.");
    process.exitCode = 1;
    return;
  }

  console.log("\n[Checkpoints]");
  // Lint draait bewust alleen over de zojuist geschreven bestanden, niet over de hele repo:
  // `npm run lint` faalt op dit moment al op bestaande code (o.a. de orphaned tijdperk-kaart.tsx
  // en use-color-scheme.web.ts), en die schuld mag een verder prima batch niet laten terugdraaien.
  const ok =
    runCheck("Validate", "npm run validate:content") &&
    runCheck("TypeCheck", "npx tsc --noEmit") &&
    runCheck("Lint", `npx eslint ${summary.bestanden.map((b) => `"${b}"`).join(" ")}`);

  if (!ok) {
    console.error(
      `\n❌ Checks failed. The generated content is in:\n   ${summary.bestanden.join("\n   ")}\n` +
        `   Fix it there, or revert with: git checkout -- ${summary.bestanden.join(" ")}`,
    );
    process.exitCode = 1;
    return;
  }

  commitIfRequested(summary);

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("✅ BATCH COMPLETE");
  console.log(`   Generated: ${summary.generated} story/stories`);
  console.log(`   Failed:    ${summary.failed}`);
  // De twee image-scripts werken met handgeschreven prompt-maps per verhaal-id; een nieuw id
  // staat daar nog niet in en wordt stilzwijgend overgeslagen. Eerst prompts bijschrijven.
  console.log("   Next:      1. add prompts for the new id(s) to scripts/generate-portrait-images.mjs");
  console.log("                 and scripts/generate-scene-images.mjs");
  console.log("              2. npm run generate:images:r9 -- --only <new-ids>");
  console.log("                 npm run generate:images:scenes -- --only <new-ids>");
  console.log("              3. wire the .webp files into CHARACTER_IMAGES / SCENE_IMAGES and");
  console.log("                 point the story's afbeelding at them");
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n❌ FATAL:", err.message);
  process.exit(1);
});
