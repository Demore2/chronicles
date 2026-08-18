#!/usr/bin/env node
// npm run audit:interactief
//
// Leest alle 19 verhalen uit de bundel en zet er de rijen uit `story_quizzes` /`story_polls` /
// `story_choices` naast: welk verhaal heeft interactieve content, welk niet, en op welke
// hoofdstukken zit het. Schrijft niets.
//
// Vlaggen:
//   --json        machineleesbare uitvoer (voor generate-interactive-content.mjs of CI)
//   --check       exit 1 zodra één verhaal niets heeft (voor een pre-release check)
//
// `chapter_index` in de database is `Chapter.id` uit de content en telt vanaf 1 — zie de
// check-constraint op de tabellen en de toelichting in src/lib/interactief.ts.
import { eisLeesbareTelling, laadVerhalen, maakSupabase, telInteractie } from './interactief-hulp.mjs';

const argv = process.argv.slice(2);
const alsJson = argv.includes('--json');
const alsCheck = argv.includes('--check');

function log(...args) {
  if (!alsJson) console.log(...args);
}

const verhalen = await laadVerhalen();
const { client, soort } = maakSupabase();
const { perVerhaal, totaal } = await telInteractie(client);

eisLeesbareTelling(soort, totaal);

const rapport = { totaalVerhalen: verhalen.length, metContent: 0, zonderContent: [], regels: [] };

for (const verhaal of verhalen) {
  const telling = perVerhaal.get(verhaal.id);
  const aantal = telling ? telling.quiz + telling.poll + telling.keuze : 0;
  const hoofdstukken = verhaal.chapters?.length ?? 0;

  const regel = {
    id: verhaal.id,
    titel: verhaal.titel.en,
    tijdperkId: verhaal.tijdperkId,
    hoofdstukken,
    quiz: telling?.quiz ?? 0,
    poll: telling?.poll ?? 0,
    keuze: telling?.keuze ?? 0,
    totaal: aantal,
  };
  rapport.regels.push(regel);

  if (aantal > 0) {
    rapport.metContent += 1;
    const opHoofdstukken = [...telling.hoofdstukken].sort((a, b) => a - b).join(', ');
    log(
      `  OK   ${verhaal.id.padEnd(24)} ${String(aantal).padStart(2)} items ` +
        `(${regel.quiz}q ${regel.poll}p ${regel.keuze}k)  hoofdstuk ${opHoofdstukken}`
    );
  } else {
    rapport.zonderContent.push(regel);
    log(`  --   ${verhaal.id.padEnd(24)}  geen interactieve content (${hoofdstukken} hoofdstukken)`);
  }
}

if (alsJson) {
  console.log(JSON.stringify(rapport, null, 2));
} else {
  log('');
  log(`  Verhalen:        ${rapport.totaalVerhalen}`);
  log(`  Met content:     ${rapport.metContent}`);
  log(`  Zonder content:  ${rapport.zonderContent.length}`);
  if (rapport.zonderContent.length > 0) {
    log('');
    log('  Ontbreekt bij:');
    for (const r of rapport.zonderContent) log(`    ${r.id}  (${r.titel})`);
    log('');
    log('  Genereren:  npm run generate:interactief -- --only <verhaal-id>');
  }
}

if (alsCheck && rapport.zonderContent.length > 0) process.exit(1);
