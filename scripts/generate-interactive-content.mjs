#!/usr/bin/env node
// npm run generate:interactief [-- vlaggen]
//
// Schrijft per verhaal een quiz/peiling/keuzepunt-set op basis van de échte hoofdstuktekst uit
// de bundel, valideert die tegen zowel de content als de constraints op de tabellen, en legt het
// resultaat neer als JSON + SQL in scripts/seed/interactief/.
//
// Vlaggen:
//   --only <ids>   alleen deze verhalen (komma's), i.p.v. alles wat nog niets heeft
//   --force        ook verhalen die al content hebben (de SQL blijft idempotent, zie onder)
//   --apply        de gegenereerde rijen meteen wegschrijven naar Supabase
//   --dry-run      wél de API bevragen, niets naar schijf schrijven
//   --model <id>   ander model (standaard claude-opus-5)
//
// **Genereren en toepassen zijn met opzet twee stappen.** Wat hier uit komt zijn historische
// beweringen met een "juist antwoord" eronder, en dat is redactiewerk: het hoort nagelezen te
// worden vóórdat het in de app staat. Zonder --apply raakt dit script de database niet aan.
//
// De SQL is idempotent: `on conflict do nothing` sluit aan op de unique constraints
// `(story_id, chapter_index, question)` (quiz/poll) en `(story_id, choice_point_id)` (keuze),
// dus twee keer toepassen levert geen dubbele vragen op.
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import {
  eisLeesbareTelling,
  hoofdstukTekst,
  laadVerhalen,
  leesEnv,
  maakSupabase,
  projectRoot,
  telInteractie,
} from './interactief-hulp.mjs';

const argv = process.argv.slice(2);
function vlagWaarde(naam) {
  const i = argv.indexOf(naam);
  return i >= 0 ? argv[i + 1] : undefined;
}

const alleenIds = (vlagWaarde('--only') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const forceren = argv.includes('--force');
const toepassen = argv.includes('--apply');
const droogLopen = argv.includes('--dry-run');
const MODEL = vlagWaarde('--model') ?? 'claude-opus-5';

const UITVOER_MAP = path.join(projectRoot, 'scripts', 'seed', 'interactief');

// ── Wat we van het model terug willen ────────────────────────────────────────────────────────
//
// Een json_schema-outputformaat in plaats van "geef alleen JSON terug" in de prompt: dat laatste
// levert vroeg of laat een ```json-hek of een verontschuldigende zin op, en dan struikelt
// JSON.parse. `additionalProperties: false` houdt verzonnen extra velden buiten de deur.
const ANTWOORD_SCHEMA = {
  type: 'object',
  properties: {
    quizzes: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          chapter: { type: 'integer' },
          question: { type: 'string' },
          options: { type: 'array', minItems: 1, items: { type: 'string' } },
          correct_answer: { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['chapter', 'question', 'options', 'correct_answer', 'explanation'],
        additionalProperties: false,
      },
    },
    polls: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          chapter: { type: 'integer' },
          question: { type: 'string' },
          options: { type: 'array', minItems: 1, items: { type: 'string' } },
        },
        required: ['chapter', 'question', 'options'],
        additionalProperties: false,
      },
    },
    choices: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          chapter: { type: 'integer' },
          choice_point_id: { type: 'string' },
          prompt: { type: 'string' },
          options: { type: 'array', minItems: 1, items: { type: 'string' } },
        },
        required: ['chapter', 'choice_point_id', 'prompt', 'options'],
        additionalProperties: false,
      },
    },
  },
  required: ['quizzes', 'polls', 'choices'],
  additionalProperties: false,
};

const SYSTEEM = `You write the interactive elements that sit under a chapter in Histora, a history reading app.

Three kinds, and they are not interchangeable:

QUIZ — a factual self-test. The answer must be verifiable from the chapter text you are given,
not from general knowledge about the period. Exactly one option is right; the other three are
plausible to someone who skimmed, never absurd. The explanation is one or two sentences that
add something the chapter did not spell out — a consequence, a detail, a grudge — not a restatement
of the answer. Nothing is scored or stored: this is a reader checking themselves, not an exam.

POLL — an opinion or a judgement call, with no right answer. It asks the reader what they think
happened, or what they would have done. Never phrase it so that one option is obviously correct.

CHOICE — the same thing in the second person: "in their place, what would you do?".
**The story does not branch.** There is no alternative chapter behind either option, so the text
must never promise consequences, a different path, or that the story changes. What the reader
gets afterwards is real, but it is only this: how other readers decided.

Rules that come from the database and the app:
- Every "chapter" value must be one of the chapter numbers listed in the request. Nothing else.
- Spread the items across different chapters, and prefer the middle of the story over chapter 1.
- Two items of the same kind may not share a chapter, and no two questions may be identical.
- choice_point_id is kebab-case, unique within the story, and describes the decision
  (e.g. "cross-the-rubicon"), not its position.
- Write in English, in the register of the story itself: plain, concrete, no exclamation marks,
  no second-person hype, no "Did you know?!".
- Options are short — a few words each, not sentences.

Counts, which the output schema cannot enforce for you — hold to them yourself:
- 2 or 3 quizzes, each with exactly 4 options.
- 2 or 3 polls, each with exactly 3 options.
- 1 or 2 choices, each with 2 or 3 options.`;

/** Eén stijlanker per soort, overgenomen uit de bestaande seed (Oudheid). */
const VOORBEELD = `Examples of the register, from stories already in the app:

Quiz — "Which Roman commander finally defeated Spartacus in 71 BC?"
  options: ["Pompey", "Marcus Licinius Crassus", "Sulla", "Cato the Younger"], correct: 1
  explanation: "Crassus broke the revolt in Lucania. Pompey caught the fleeing survivors and
  claimed the credit in Rome — a grudge that outlasted the war."

Poll — "The rebels reached the Alps and freedom — then turned back south. Why do you think they
turned?" options: ["They wanted to strike Rome itself", "They could not agree on a plan",
"There was nowhere safe beyond the mountains"]

Choice — "Caesar chose civil war over standing trial in Rome. In his place, what would you have
done?" options: ["Cross the river and fight", "Disband the legions and face the Senate",
"Stay in Gaul and wait them out"]`;

function bouwPrompt(verhaal) {
  const hoofdstukken = verhaal.chapters ?? [];
  const nummers = hoofdstukken.map((c) => c.id);

  const tekst = hoofdstukken
    .map((c) => `--- Chapter ${c.id}: ${c.titel.en} ---\n${hoofdstukTekst(c)}`)
    .join('\n\n');

  return `Story: "${verhaal.titel.en}" — ${verhaal.ondertitel.en}
Central figure: ${verhaal.personage.naam}
Period: ${verhaal.periodeLabel} (${verhaal.jaar})
Valid chapter numbers: ${nummers.join(', ')}

${VOORBEELD}

Write 2-3 quizzes, 2-3 polls and 1-2 choices for this story, using only what the chapters below
actually say.

${tekst}`;
}

// ── Validatie ────────────────────────────────────────────────────────────────────────────────
//
// Het model levert schema-geldige JSON; dat is iets anders dan bruikbare content. Deze laag
// controleert wat het schema niet kan: bestaan de hoofdstuknummers écht in dít verhaal, valt
// het juiste antwoord binnen de opties, zijn de vragen uniek. Alles wat hier sneuvelt wordt
// overgeslagen en gemeld — één slechte vraag mag de andere zeventien niet meenemen.
function schoon(waarde) {
  return typeof waarde === 'string' ? waarde.trim().replace(/\s+/g, ' ') : '';
}

function valideer(verhaal, data) {
  const geldigeHoofdstukken = new Set((verhaal.chapters ?? []).map((c) => c.id));
  const problemen = [];
  const uit = { quizzes: [], polls: [], choices: [] };

  const gezien = { quiz: new Set(), poll: new Set(), keuzeId: new Set() };

  const hoofdstukOk = (item, soort) => {
    if (!geldigeHoofdstukken.has(item.chapter)) {
      problemen.push(`${soort}: hoofdstuk ${item.chapter} bestaat niet in ${verhaal.id}`);
      return false;
    }
    return true;
  };

  const optiesOk = (opties, soort, min, max) => {
    const schoongemaakt = (opties ?? []).map(schoon).filter(Boolean);
    if (schoongemaakt.length < min || schoongemaakt.length > max) {
      problemen.push(`${soort}: ${schoongemaakt.length} opties, verwacht ${min}-${max}`);
      return null;
    }
    if (new Set(schoongemaakt).size !== schoongemaakt.length) {
      problemen.push(`${soort}: dubbele opties`);
      return null;
    }
    return schoongemaakt;
  };

  for (const quiz of data.quizzes ?? []) {
    const vraag = schoon(quiz.question);
    if (!vraag) { problemen.push('quiz: lege vraag'); continue; }
    if (!hoofdstukOk(quiz, 'quiz')) continue;
    const opties = optiesOk(quiz.options, 'quiz', 2, 6);
    if (!opties) continue;
    // De check-constraint `correct_answer < array_length(options, 1)` weigert dit ook, maar dan
    // pas bij het invoegen — en leesQuiz() in interactief.ts gooit zo'n vraag stilletjes weg.
    if (!Number.isInteger(quiz.correct_answer) || quiz.correct_answer < 0 || quiz.correct_answer >= opties.length) {
      problemen.push(`quiz h${quiz.chapter}: correct_answer ${quiz.correct_answer} valt buiten de opties`);
      continue;
    }
    const sleutel = `${quiz.chapter}|${vraag.toLowerCase()}`;
    if (gezien.quiz.has(sleutel)) { problemen.push(`quiz h${quiz.chapter}: dubbele vraag`); continue; }
    gezien.quiz.add(sleutel);

    uit.quizzes.push({
      story_id: verhaal.id,
      chapter_index: quiz.chapter,
      question: vraag,
      options: opties,
      correct_answer: quiz.correct_answer,
      explanation: schoon(quiz.explanation) || null,
    });
  }

  for (const poll of data.polls ?? []) {
    const vraag = schoon(poll.question);
    if (!vraag) { problemen.push('poll: lege vraag'); continue; }
    if (!hoofdstukOk(poll, 'poll')) continue;
    const opties = optiesOk(poll.options, 'poll', 2, 6);
    if (!opties) continue;
    const sleutel = `${poll.chapter}|${vraag.toLowerCase()}`;
    if (gezien.poll.has(sleutel)) { problemen.push(`poll h${poll.chapter}: dubbele vraag`); continue; }
    gezien.poll.add(sleutel);

    uit.polls.push({
      story_id: verhaal.id,
      chapter_index: poll.chapter,
      question: vraag,
      options: opties,
    });
  }

  for (const keuze of data.choices ?? []) {
    const vraag = schoon(keuze.prompt);
    if (!vraag) { problemen.push('keuze: lege prompt'); continue; }
    if (!hoofdstukOk(keuze, 'keuze')) continue;
    // story_choices staat maximaal 4 opties toe, één minder dan quiz en poll.
    const opties = optiesOk(keuze.options, 'keuze', 2, 4);
    if (!opties) continue;

    const id = schoon(keuze.choice_point_id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!id) { problemen.push('keuze: onbruikbare choice_point_id'); continue; }
    if (gezien.keuzeId.has(id)) { problemen.push(`keuze: dubbele choice_point_id "${id}"`); continue; }
    gezien.keuzeId.add(id);

    uit.choices.push({
      story_id: verhaal.id,
      chapter_index: keuze.chapter,
      choice_point_id: id,
      prompt: vraag,
      options: opties,
    });
  }

  return { uit, problemen };
}

// ── SQL ──────────────────────────────────────────────────────────────────────────────────────
const q = (waarde) => (waarde === null ? 'null' : `'${String(waarde).replace(/'/g, "''")}'`);
const arr = (opties) => `array[${opties.map(q).join(', ')}]::text[]`;

function naarSql(set) {
  const regels = [];
  for (const r of set.quizzes) {
    regels.push(
      `insert into public.story_quizzes (story_id, chapter_index, question, options, correct_answer, explanation) values\n` +
        `  (${q(r.story_id)}, ${r.chapter_index}, ${q(r.question)}, ${arr(r.options)}, ${r.correct_answer}, ${q(r.explanation)})\n` +
        `  on conflict (story_id, chapter_index, question) do nothing;`
    );
  }
  for (const r of set.polls) {
    regels.push(
      `insert into public.story_polls (story_id, chapter_index, question, options) values\n` +
        `  (${q(r.story_id)}, ${r.chapter_index}, ${q(r.question)}, ${arr(r.options)})\n` +
        `  on conflict (story_id, chapter_index, question) do nothing;`
    );
  }
  for (const r of set.choices) {
    regels.push(
      `insert into public.story_choices (story_id, chapter_index, choice_point_id, prompt, options) values\n` +
        `  (${q(r.story_id)}, ${r.chapter_index}, ${q(r.choice_point_id)}, ${q(r.prompt)}, ${arr(r.options)})\n` +
        `  on conflict (story_id, choice_point_id) do nothing;`
    );
  }
  return regels.join('\n\n');
}

// ── Uitvoeren ────────────────────────────────────────────────────────────────────────────────
const apiKey = leesEnv('ANTHROPIC_API_KEY');
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY niet gevonden (omgeving of .env.local).');
  process.exit(1);
}
const anthropic = new Anthropic({ apiKey });

const verhalen = await laadVerhalen();
const { client, soort } = maakSupabase();

if (toepassen && soort !== 'secret') {
  console.error(
    [
      '--apply heeft SUPABASE_SERVICE_ROLE_KEY nodig.',
      '',
      'De drie contenttabellen hebben alleen een select-policy; met de publishable key faalt',
      'elke insert op RLS. Zet de secret key in .env.local, of pas de gegenereerde SQL toe via',
      'een migratie in het Supabase-dashboard.',
    ].join('\n')
  );
  process.exit(1);
}

const { perVerhaal, totaal: bekendTotaal } = await telInteractie(client);

let doelen = verhalen;
if (alleenIds.length > 0) {
  const bekend = new Set(verhalen.map((v) => v.id));
  const onbekend = alleenIds.filter((id) => !bekend.has(id));
  if (onbekend.length > 0) {
    console.error(`Onbekende verhaal-id(s): ${onbekend.join(', ')}`);
    process.exit(1);
  }
  doelen = verhalen.filter((v) => alleenIds.includes(v.id));
} else if (!forceren) {
  // Alleen hier beslist de telling wat er gebeurt, dus alleen hier moet hij te vertrouwen zijn:
  // een blinde selectie merkt de vijf handmatig geseede verhalen niet op en legt er een tweede
  // set bovenop. Met --only kiest de aanroeper zelf en doet de telling er niet toe.
  eisLeesbareTelling(soort, bekendTotaal);
  doelen = verhalen.filter((v) => !perVerhaal.has(v.id));
}

if (doelen.length === 0) {
  console.log('Niets te doen — elk verhaal heeft al interactieve content. (--force om opnieuw te genereren.)');
  process.exit(0);
}

console.log(`Model: ${MODEL}`);
console.log(`Verhalen: ${doelen.length}${droogLopen ? '  (dry run — niets wordt geschreven)' : ''}\n`);

if (!droogLopen) fs.mkdirSync(UITVOER_MAP, { recursive: true });

const alles = { quizzes: [], polls: [], choices: [] };
let gelukt = 0;
const mislukt = [];

for (const verhaal of doelen) {
  process.stdout.write(`  ${verhaal.id.padEnd(24)} `);
  try {
    // Streamen omdat een verhaal van acht hoofdstukken plus adaptief denken een lange
    // generatie is; met .finalMessage() blijft de rest van de code identiek aan een gewone
    // create() en lopen we niet tegen de HTTP-timeout aan.
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEEM,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema', schema: ANTWOORD_SCHEMA } },
      messages: [{ role: 'user', content: bouwPrompt(verhaal) }],
    });
    const bericht = await stream.finalMessage();

    if (bericht.stop_reason === 'refusal') {
      throw new Error(`geweigerd (${bericht.stop_details?.category ?? 'onbekend'})`);
    }
    const tekstBlok = bericht.content.find((b) => b.type === 'text');
    if (!tekstBlok) throw new Error('geen tekstblok in het antwoord');

    const { uit, problemen } = valideer(verhaal, JSON.parse(tekstBlok.text));
    const aantal = uit.quizzes.length + uit.polls.length + uit.choices.length;
    if (aantal === 0) throw new Error(`niets bruikbaars (${problemen.join('; ')})`);

    alles.quizzes.push(...uit.quizzes);
    alles.polls.push(...uit.polls);
    alles.choices.push(...uit.choices);

    if (!droogLopen) {
      fs.writeFileSync(path.join(UITVOER_MAP, `${verhaal.id}.json`), JSON.stringify(uit, null, 2) + '\n', 'utf8');
    }

    console.log(`${uit.quizzes.length}q ${uit.polls.length}p ${uit.choices.length}k` + (problemen.length ? `  (${problemen.length} overgeslagen)` : ''));
    for (const p of problemen) console.log(`      ! ${p}`);
    gelukt += 1;
  } catch (fout) {
    console.log(`MISLUKT — ${fout.message}`);
    mislukt.push(verhaal.id);
  }
}

const totaal = alles.quizzes.length + alles.polls.length + alles.choices.length;
console.log(`\n  Gelukt: ${gelukt}/${doelen.length}   rijen: ${totaal}`);
if (mislukt.length > 0) console.log(`  Mislukt: ${mislukt.join(', ')}`);

if (droogLopen || totaal === 0) process.exit(mislukt.length > 0 ? 1 : 0);

const sqlPad = path.join(UITVOER_MAP, 'seed.sql');
fs.writeFileSync(sqlPad, `-- Gegenereerd door scripts/generate-interactive-content.mjs\n-- Idempotent: on conflict do nothing.\n\n${naarSql(alles)}\n`, 'utf8');
console.log(`  Geschreven: ${path.relative(projectRoot, sqlPad)}`);

if (!toepassen) {
  console.log('\n  Nagelezen? Toepassen met --apply, of draai de SQL als migratie.');
  process.exit(mislukt.length > 0 ? 1 : 0);
}

// Per tabel één insert met de hele lijst — niet één per rij. `ignoreDuplicates` maakt er
// `on conflict do nothing` van, zodat opnieuw toepassen niets stukmaakt (zelfde afweging als
// bij bewaarPollStem in src/lib/interactief.ts).
const schrijfOpdrachten = [
  ['story_quizzes', alles.quizzes, 'story_id,chapter_index,question'],
  ['story_polls', alles.polls, 'story_id,chapter_index,question'],
  ['story_choices', alles.choices, 'story_id,choice_point_id'],
];

for (const [tabel, rijen, onConflict] of schrijfOpdrachten) {
  if (rijen.length === 0) continue;
  const { error } = await client.from(tabel).upsert(rijen, { onConflict, ignoreDuplicates: true });
  if (error) {
    console.error(`  ${tabel}: ${error.message}`);
    process.exit(1);
  }
  console.log(`  ${tabel}: ${rijen.length} rijen toegepast`);
}

process.exit(mislukt.length > 0 ? 1 : 0);
