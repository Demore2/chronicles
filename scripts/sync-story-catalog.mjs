// npm run sync:verhaalcatalogus
//
// Schrijft `public.story_catalog` bij vanuit de bundel.
//
// **Waarom deze tabel bestaat, terwijl de verhalen in de app zitten.** De verhalen zelf blijven
// in `src/content/verhalen/**` en werken offline; daar verandert niets aan. Maar `push-sweep`
// wil "Joan of Arc wacht op je" kunnen sturen, en een server die alleen `story_progress` ziet
// weet niet wélke verhalen er bestaan, laat staan hoe ze heten. Zonder deze tabel kan de
// aanbeveling alleen een id versturen met een lege zin eromheen.
//
// Het is dus een **afgeleide** tabel en geen tweede bron van waarheid. Er staat niets in wat de
// lezer niet allang in de app ziet: id, titel, tijdperk, personage. Geen hoofdstuktekst.
//
// **De service-role-sleutel is verplicht**, om dezelfde reden als bij de interactief-scripts:
// `story_catalog` heeft één policy (`select` voor `authenticated`), dus schrijven met de
// publishable key doet niets. Anders dan bij een select is dat hier wél een zichtbare fout, maar
// de controle staat er zodat je hem niet pas na een lege sweep ontdekt.
//
// Vlaggen:
//   --dry     laat zien wat er zou gebeuren, schrijft niets
//   --prune   zet rijen die niet meer in de bundel zitten op `actief = false`

import { laadVerhalen, leesEnv, maakSupabase } from './interactief-hulp.mjs';

const argumenten = process.argv.slice(2);
const droog = argumenten.includes('--dry');
const opruimen = argumenten.includes('--prune');

/** De Engelse tekst uit een VertaaldVeld. Node heeft geen `v()` — zelfde afspraak als leestijd.ts. */
function en(veld) {
  if (!veld) return '';
  return typeof veld === 'string' ? veld : (veld.en ?? '');
}

async function main() {
  const verhalen = await laadVerhalen();
  const { tijdperken } = await import('../src/constants/tijdperken.ts');

  // `Tijdperk` heeft `titel`, niet `naam` — dit is de tekst die de lezer op Home ziet
  // ("Antiquity"), en dus de tekst die in "A story from … you have not opened yet" hoort.
  const tijdperkNaam = new Map(tijdperken.map((t) => [t.id, en(t.titel) || t.id]));

  const rijen = verhalen.map((verhaal, index) => ({
    verhaal_id: verhaal.id,
    titel: en(verhaal.titel) || verhaal.id,
    tijdperk_id: verhaal.tijdperkId,
    tijdperk_naam: tijdperkNaam.get(verhaal.tijdperkId) ?? verhaal.tijdperkId,
    // Het personage is wat de aanbeveling noemt ("Joan of Arc wacht op je"); bij een
    // gebeurtenis-verhaal is er geen, en dan valt `push-sweep` terug op de titel.
    personage_naam: en(verhaal.personage?.naam) || null,
    // `volgorde` bepaalt welk ongelezen verhaal als eerste wordt aangeboden binnen een tijdperk.
    // Valt terug op de positie in de bundel, zodat er altijd een deterministische volgorde is.
    volgorde: typeof verhaal.volgorde === 'number' ? verhaal.volgorde : index,
    actief: true,
    updated_at: new Date().toISOString(),
  }));

  const ontbrekend = rijen.filter((r) => !r.titel || !r.tijdperk_id);
  if (ontbrekend.length > 0) {
    console.error('Verhalen zonder titel of tijdperk:', ontbrekend.map((r) => r.verhaal_id));
    process.exit(1);
  }

  console.log(`${rijen.length} verhalen uit de bundel:`);
  for (const rij of rijen) {
    console.log(
      `  ${rij.verhaal_id.padEnd(28)} ${String(rij.volgorde).padStart(3)}  ` +
        `${rij.tijdperk_naam} — ${rij.personage_naam ?? rij.titel}`
    );
  }

  if (droog) {
    console.log('\n--dry: er is niets geschreven.');
    return;
  }

  const geheim = leesEnv('SUPABASE_SERVICE_ROLE_KEY') ?? leesEnv('SUPABASE_SECRET_KEY');
  if (!geheim) {
    console.error(
      '\nSUPABASE_SERVICE_ROLE_KEY ontbreekt in .env.local.\n' +
        'story_catalog heeft alleen een select-policy, dus schrijven lukt niet met de\n' +
        'publishable key. Zet de sleutel erin — zonder EXPO_PUBLIC_-voorvoegsel, anders bakt\n' +
        'babel hem in de app-bundel.'
    );
    process.exit(1);
  }

  const { client } = maakSupabase();

  const { error } = await client
    .from('story_catalog')
    .upsert(rijen, { onConflict: 'verhaal_id' });

  if (error) {
    console.error('\nSchrijven mislukt:', error.message);
    process.exit(1);
  }
  console.log(`\n${rijen.length} rijen weggeschreven.`);

  if (opruimen) {
    // Op inactief zetten en niet verwijderen: een verhaal dat tijdelijk uit de bundel is gehaald
    // hoort niet aanbevolen te worden, maar de rijen in `notifications_sent` die ernaar verwijzen
    // blijven wel iets betekenen.
    const ids = rijen.map((r) => r.verhaal_id);
    const { data, error: pruneFout } = await client
      .from('story_catalog')
      .update({ actief: false })
      .not('verhaal_id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`)
      .select('verhaal_id');

    if (pruneFout) {
      console.error('Opruimen mislukt:', pruneFout.message);
      process.exit(1);
    }
    console.log(`--prune: ${data?.length ?? 0} rijen op inactief gezet.`);
  }
}

main().catch((fout) => {
  console.error(fout);
  process.exit(1);
});
