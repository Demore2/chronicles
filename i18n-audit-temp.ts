import en from './src/i18n/en';
import nl from './src/i18n/nl';
import fr from './src/i18n/fr';
import de from './src/i18n/de';

function paths(o: unknown, p = ''): string[] {
  if (o === null || typeof o !== 'object') return [p];
  const out: string[] = [];
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    const np = p ? `${p}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) out.push(...paths(v, np));
    else out.push(np);
  }
  return out;
}
const E = paths(en);
for (const [naam, taal] of [['nl', nl], ['fr', fr], ['de', de]] as const) {
  const T = new Set(paths(taal));
  const mis = E.filter((k) => !T.has(k));
  console.log(`\n===== ${naam.toUpperCase()}: ${E.length - mis.length}/${E.length} (${mis.length} ontbreken) =====`);
  mis.forEach((k) => console.log('  MISSING ' + k));
}
console.log('\nTOTAL EN KEYS: ' + E.length);
