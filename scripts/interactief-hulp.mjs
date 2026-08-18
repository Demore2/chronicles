// Gedeelde onderdelen van de twee interactief-scripts (audit + generator).
//
// Waarom een apart bestand: het laden van de content (via de ESM-loader), het lezen van
// .env.local en het aanmaken van de Supabase-client zijn in beide scripts identiek, en een
// tweede kopie van de RLS-waarschuwing hieronder is een tweede kans om hem te vergeten.
//
// Draai deze scripts altijd via de npm-scripts, niet met een kaal `node` — de loader
// hieronder wordt geregistreerd met `pathToFileURL('./')` als basis en verwacht dus de
// projectroot als working directory (zelfde aanname als validate-content.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import './asset-require-shim.mjs';

register(pathToFileURL('./scripts/ts-content-loader.mjs').href, pathToFileURL('./'));

export const projectRoot = process.cwd();

/**
 * Leest een variabele uit de omgeving, met .env.local als terugval.
 *
 * Bewust geen dotenv-dependency: generate-scene-images.mjs doet hetzelfde met een regex, en
 * één regel per sleutel is alles wat dit bestand bevat. Aanhalingstekens en CRLF worden
 * weggehaald, want .env.local is op deze machine CRLF (net als de contentbestanden).
 */
export function leesEnv(naam) {
  if (process.env[naam]) return process.env[naam].trim();
  const envPad = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPad)) return undefined;
  const regel = fs
    .readFileSync(envPad, 'utf8')
    .split(/\r?\n/)
    .find((r) => r.startsWith(`${naam}=`));
  if (!regel) return undefined;
  const waarde = regel.slice(naam.length + 1).trim();
  return waarde.replace(/^["']|["']$/g, '') || undefined;
}

/** Alle 19 verhalen, met hun echte hoofdstukken. */
export async function laadVerhalen() {
  const { verhalen } = await import('../src/content/verhalen/index.ts');
  return verhalen;
}

/**
 * De leesbare tekst van één hoofdstuk, als platte string.
 *
 * `afbeelding` levert alleen een alt en een bijschrift op en zegt niets over de inhoud, dus die
 * gaat er niet in; `kop`, `weetje` en `sleutelmoment` wél — dat is precies waar een quizvraag
 * over gaat. `.en` is hier goed: de content is Engels en dit is een Node-script, dus er is geen
 * `v()` uit useVertaling() om mee te resolven (zelfde afspraak als in leestijd.ts).
 */
export function hoofdstukTekst(chapter) {
  const stukken = [];
  for (const blok of chapter.blokken ?? []) {
    switch (blok.type) {
      case 'tekst':
        stukken.push(blok.inhoud.en);
        break;
      case 'kop':
      case 'weetje':
        stukken.push(blok.tekst.en);
        break;
      case 'sleutelmoment':
        stukken.push(`[${blok.jaar}] ${blok.tekst.en}`);
        break;
      case 'citaat':
        stukken.push(`"${blok.tekst.en}" — ${blok.bron.en}`);
        break;
      default:
        break; // afbeelding: geen inhoudelijke tekst
    }
  }
  return stukken.join('\n\n');
}

/**
 * Maakt de Supabase-client en zegt erbij wat voor sleutel het is.
 *
 * **Dit is het addertje van deze hele klus.** `story_quizzes` / `story_polls` / `story_choices`
 * hebben precies één policy: `select` voor de rol `authenticated`. Er is géén insert-policy en
 * `anon` heeft nergens toegang. Gevolg:
 *
 *   - met de publishable key (rol `anon`) geeft een select **nul rijen en geen fout** — een
 *     audit die dat gelooft rapporteert dat álle verhalen leeg zijn, ook de vijf die het niet
 *     zijn;
 *   - een insert met die sleutel faalt op RLS.
 *
 * Seeden is dan ook geen client-actie: het is redactiewerk dat langs de servicesleutel of langs
 * een migratie hoort te gaan. Zet `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Project Settings →
 * API keys → `service_role` / secret key) in .env.local of in de omgeving.
 */
export function maakSupabase() {
  const url = leesEnv('NEXT_PUBLIC_SUPABASE_URL') ?? leesEnv('EXPO_PUBLIC_SUPABASE_URL');
  if (!url) throw new Error('Geen Supabase-URL gevonden (NEXT_PUBLIC_SUPABASE_URL in .env.local).');

  const geheim = leesEnv('SUPABASE_SERVICE_ROLE_KEY') ?? leesEnv('SUPABASE_SECRET_KEY');
  const publiek =
    leesEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ?? leesEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  const sleutel = geheim ?? publiek;
  if (!sleutel) throw new Error('Geen Supabase-sleutel gevonden in .env.local.');

  const client = createClient(url, sleutel, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { client, soort: geheim ? 'secret' : 'publishable' };
}

/**
 * Stopt zodra de telling niet te vertrouwen is.
 *
 * Nul rijen met een anon-sleutel betekent "ik mag niets zien", niet "er staat niets" — zie
 * maakSupabase(). Beide scripts leunen op die telling (de audit rapporteert hem, de generator
 * beslist er mee welke verhalen nog aan de beurt zijn), dus beide moeten hem controleren.
 */
export function eisLeesbareTelling(soort, totaal) {
  if (soort === 'secret' || totaal > 0) return;
  console.error(
    [
      'Nul rijen gevonden met de publishable key.',
      '',
      'story_quizzes/story_polls/story_choices hebben alleen een select-policy voor de rol',
      '`authenticated`; een anon-sleutel ziet daar niets en krijgt geen foutmelding. Deze uitslag',
      'is dus betekenisloos, niet leeg.',
      '',
      'Zet SUPABASE_SERVICE_ROLE_KEY in .env.local (Dashboard -> Project Settings -> API keys)',
      'en draai opnieuw.',
    ].join('\n')
  );
  process.exit(2);
}

/** De drie contenttabellen, met per tabel wat de audit erover moet weten. */
export const INTERACTIE_TABELLEN = [
  { tabel: 'story_quizzes', label: 'quiz', maxOpties: 6 },
  { tabel: 'story_polls', label: 'poll', maxOpties: 6 },
  { tabel: 'story_choices', label: 'keuze', maxOpties: 4 },
];

/**
 * Telt per verhaal-id hoeveel rijen er in de drie tabellen staan.
 *
 * Eén select per tabel over álle rijen, niet één per verhaal per tabel: dat laatste is 19 × 3 =
 * 57 losse verzoeken voor iets wat in drie past. De tabellen bevatten tientallen rijen, geen
 * miljoenen — alles ophalen en in JS groeperen is hier goedkoper dan 57 round-trips.
 */
export async function telInteractie(client) {
  const perVerhaal = new Map();
  let totaal = 0;

  for (const { tabel, label } of INTERACTIE_TABELLEN) {
    const { data, error } = await client.from(tabel).select('story_id, chapter_index');
    if (error) throw new Error(`${tabel}: ${error.message}`);

    for (const rij of data ?? []) {
      const bestaand = perVerhaal.get(rij.story_id) ?? { quiz: 0, poll: 0, keuze: 0, hoofdstukken: new Set() };
      bestaand[label] += 1;
      bestaand.hoofdstukken.add(rij.chapter_index);
      perVerhaal.set(rij.story_id, bestaand);
      totaal += 1;
    }
  }

  return { perVerhaal, totaal };
}
