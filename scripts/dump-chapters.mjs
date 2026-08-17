// Tijdelijk hulpscript (Fase 6.5): dumpt per verhaal de hoofdstuktitels plus een korte
// tekstsamenvatting, zodat er per hoofdstuk een gerichte scèneprompt geschreven kan worden.
// Draai met: node scripts/dump-chapters.mjs [tijdperk-id]
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import './asset-require-shim.mjs';

register(pathToFileURL('./scripts/ts-content-loader.mjs').href, pathToFileURL('./'));

const { verhalen: alleVerhalen } = await import('../src/content/verhalen/index.ts');

const filter = process.argv[2];

for (const verhaal of alleVerhalen) {
  if (filter && verhaal.tijdperkId !== filter) continue;
  console.log(`\n=== ${verhaal.id}  [${verhaal.tijdperkId}] — ${verhaal.titel.en} (${verhaal.jaar})`);
  console.log(`    ${verhaal.teaser?.en ?? ''}`);
  for (const chapter of verhaal.chapters ?? []) {
    const tekst = chapter.blokken
      .filter((b) => b.type === 'tekst')
      .map((b) => b.inhoud.en)
      .join(' ');
    const woorden = tekst.split(/\s+/).slice(0, 55).join(' ');
    console.log(`  ${chapter.id}. ${chapter.titel.en}`);
    console.log(`     ${woorden}...`);
  }
}
