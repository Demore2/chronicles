/**
 * `push-sweep` — beslist wie er een push krijgt, en waarover.
 *
 * Draait elk uur (pg_cron, zie `supabase/README-push.md`). Elke ronde vraagt hij de database wie
 * er *in zijn eigen tijdzone* op het doeluur staat en aan de voorwaarden voldoet, claimt per
 * lezer een regel in `notifications_sent`, en geeft de hele lijst in één aanroep aan `send-push`.
 *
 * Drie dingen die bewust zo zijn:
 *
 * 1. **Het uur wordt in SQL bepaald, niet hier.** `new Date().getHours()` in een edge function is
 *    UTC. Wie daarop filtert stuurt elke lezer buiten Greenwich op het verkeerde moment een
 *    melding — en dat is precies het soort fout dat je niet ziet omdat jij zelf wél op tijd je
 *    testmelding krijgt. `push_kandidaten()` rekent per lezer met `at time zone`.
 * 2. **Eerst claimen, dan sturen.** De regel in `notifications_sent` wordt aangemaakt vóórdat er
 *    iets de deur uit gaat, met een unieke `dedupe_sleutel`. Draait de cron dubbel of valt deze
 *    function halverwege om, dan botst de tweede poging op de unieke index. Andersom (eerst
 *    sturen, dan loggen) levert bij een crash een dubbele melding op, en dat is de ene fout die
 *    een lezer je niet vergeeft.
 * 3. **Er wordt niets herhaald.** Mislukt een push, dan blijft de regel op `failed` staan en komt
 *    er die dag niets meer. Een win-back die een dag later alsnog aankomt is geen win-back meer.
 *    Dit is bewust anders dan de voortgangssync, waar de state groeit en de laatste stand telt.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*' };

function antwoord(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/** Het uur (lokale tijd van de lezer) waarop de sweep standaard mikt. */
const STANDAARD_DOEL_UUR = 19;

type Kandidaat = {
  user_id: string;
  soort: 'reengagement' | 'recommendation';
  tokens: string[];
  dedupe_sleutel: string;
  verhaal_id: string | null;
  verhaal_titel: string | null;
  tijdperk_naam: string | null;
  personage_naam: string | null;
  dagen_stil: number;
};

// --------------------------------------------------------------------------------------------
// Teksten
// --------------------------------------------------------------------------------------------
//
// De app is in vier talen; een melding is UI, dus die hoort mee te bewegen. De taal komt uit
// `profiles.language` — het toestel kan de server niet vertellen wat er in `taal-store` staat.
// Onbekend of leeg: Engels, dezelfde terugval als `src/i18n/index.ts`.
//
// Bewust géén getallen in de tekst ("je bent 5 dagen weg"): dat leest als een verwijt, en het is
// de reden dat de dagelijkse herinnering in `i18n/en.ts` ook geen streakgetal noemt.

type Taal = 'en' | 'nl' | 'fr' | 'de';

const TEKSTEN: Record<Taal, {
  terugkeerTitel: string;
  terugkeerTekst: string;
  aanbevelingTitel: (naam: string) => string;
  aanbevelingTekst: (tijdperk: string) => string;
}> = {
  en: {
    terugkeerTitel: 'Your chapter is still open',
    terugkeerTekst: 'History waited this long already. A few minutes is all it takes.',
    aanbevelingTitel: (naam) => `${naam} is waiting`,
    aanbevelingTekst: (tijdperk) => `A story from ${tijdperk} you have not opened yet.`,
  },
  nl: {
    terugkeerTitel: 'Je hoofdstuk staat nog open',
    terugkeerTekst: 'De geschiedenis wachtte al zo lang. Een paar minuten is genoeg.',
    aanbevelingTitel: (naam) => `${naam} wacht op je`,
    aanbevelingTekst: (tijdperk) => `Een verhaal uit ${tijdperk} dat je nog niet geopend hebt.`,
  },
  fr: {
    terugkeerTitel: 'Votre chapitre est resté ouvert',
    terugkeerTekst: "L'histoire a déjà tant attendu. Quelques minutes suffisent.",
    aanbevelingTitel: (naam) => `${naam} vous attend`,
    aanbevelingTekst: (tijdperk) => `Une histoire de ${tijdperk} que vous n'avez pas encore ouverte.`,
  },
  de: {
    terugkeerTitel: 'Dein Kapitel ist noch offen',
    terugkeerTekst: 'Die Geschichte hat schon so lange gewartet. Ein paar Minuten genügen.',
    aanbevelingTitel: (naam) => `${naam} wartet auf dich`,
    aanbevelingTekst: (tijdperk) => `Eine Geschichte aus ${tijdperk}, die du noch nicht geöffnet hast.`,
  },
};

function taalVan(waarde: unknown): Taal {
  return waarde === 'nl' || waarde === 'fr' || waarde === 'de' ? waarde : 'en';
}

/** Titel, tekst en bestemming voor één kandidaat. */
function stelSamen(kandidaat: Kandidaat, taal: Taal) {
  const teksten = TEKSTEN[taal];

  if (kandidaat.soort === 'recommendation' && kandidaat.verhaal_id) {
    const naam = kandidaat.personage_naam ?? kandidaat.verhaal_titel ?? '';
    return {
      titel: teksten.aanbevelingTitel(naam),
      bericht: teksten.aanbevelingTekst(kandidaat.tijdperk_naam ?? ''),
      // Het hoofdstukoverzicht en niet de reader: daar begint een verhaal, en de dagelijkse
      // limiet wordt daar gecontroleerd (zie `verhaal/[id]/chapters.tsx`).
      pad: `/verhaal/${kandidaat.verhaal_id}/chapters`,
    };
  }

  return {
    titel: teksten.terugkeerTitel,
    bericht: teksten.terugkeerTekst,
    pad: '/',
  };
}

// --------------------------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return antwoord(500, { error: 'server_niet_geconfigureerd' });

  // Alleen de service role (cron, of jij met de sleutel in de hand). Zelfde reden als bij
  // `send-push`: de kandidatenlijst is de lijst van wie er stil is, en die gaat niemand aan.
  const header = req.headers.get('Authorization') ?? '';
  const jwt = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  let rol = '';
  try {
    rol = JSON.parse(atob(jwt.split('.')[1] ?? '')).role ?? '';
  } catch {
    rol = '';
  }
  if (rol !== 'service_role') return antwoord(403, { error: 'alleen_service_role' });

  // `?uur=` en `?drooglopen=1` zijn er om te testen zonder een dag te wachten. Drooglopen claimt
  // niets en stuurt niets — het laat alleen zien wie er nu aan de beurt zou zijn.
  const params = new URL(req.url).searchParams;
  const doelUur = Number(params.get('uur') ?? STANDAARD_DOEL_UUR);
  const droogLopen = params.get('drooglopen') === '1';

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: kandidaten, error: kandidaatFout } = await admin.rpc('push_kandidaten', {
    doel_uur: Number.isFinite(doelUur) ? doelUur : STANDAARD_DOEL_UUR,
  });

  if (kandidaatFout) {
    console.error('[push-sweep] kandidaten ophalen mislukt:', kandidaatFout.message);
    return antwoord(500, { error: 'kandidaten_mislukt', details: kandidaatFout.message });
  }

  const lijst = (kandidaten ?? []) as Kandidaat[];
  if (lijst.length === 0) return antwoord(200, { ok: true, kandidaten: 0, verzonden: 0 });

  // Talen in één query in plaats van één per lezer.
  const { data: profielen } = await admin
    .from('profiles')
    .select('id, language')
    .in('id', lijst.map((k) => k.user_id));

  const taalPerLezer = new Map<string, Taal>(
    (profielen ?? []).map((p) => [p.id as string, taalVan(p.language)])
  );

  const samengesteld = lijst.map((kandidaat) => ({
    kandidaat,
    inhoud: stelSamen(kandidaat, taalPerLezer.get(kandidaat.user_id) ?? 'en'),
  }));

  if (droogLopen) {
    return antwoord(200, {
      ok: true,
      drooglopen: true,
      kandidaten: samengesteld.map(({ kandidaat, inhoud }) => ({
        user_id: kandidaat.user_id,
        soort: kandidaat.soort,
        dagen_stil: kandidaat.dagen_stil,
        toestellen: kandidaat.tokens.length,
        ...inhoud,
      })),
    });
  }

  // --- Claimen ---
  //
  // `ignoreDuplicates` maakt hier `on conflict do nothing` van, en `.select()` geeft daarna
  // uitsluitend de rijen terug die écht zijn aangemaakt. Dat is precies het slot dat we nodig
  // hebben: wie er niet uit komt is vandaag al bediend.
  const { data: geclaimd, error: claimFout } = await admin
    .from('notifications_sent')
    .upsert(
      samengesteld.map(({ kandidaat, inhoud }) => ({
        user_id: kandidaat.user_id,
        soort: kandidaat.soort,
        titel: inhoud.titel,
        bericht: inhoud.bericht,
        pad: inhoud.pad,
        dedupe_sleutel: kandidaat.dedupe_sleutel,
        status: 'claimed',
      })),
      { onConflict: 'user_id,dedupe_sleutel', ignoreDuplicates: true }
    )
    .select('id, user_id, soort, titel, bericht, pad');

  if (claimFout) {
    console.error('[push-sweep] claimen mislukt:', claimFout.message);
    return antwoord(500, { error: 'claim_mislukt', details: claimFout.message });
  }

  const tokensPerLezer = new Map(lijst.map((k) => [k.user_id, k.tokens]));

  const berichten = (geclaimd ?? []).map((rij) => ({
    userId: rij.user_id as string,
    tokens: tokensPerLezer.get(rij.user_id as string) ?? [],
    titel: rij.titel as string,
    bericht: rij.bericht as string,
    pad: (rij.pad as string) ?? undefined,
    soort: rij.soort as string,
    meldingId: rij.id as string,
  }));

  if (berichten.length === 0) {
    return antwoord(200, { ok: true, kandidaten: lijst.length, verzonden: 0, reden: 'al_bediend' });
  }

  // Eén aanroep voor de hele batch: `send-push` haalt dan één OAuth-token op in plaats van één
  // per lezer.
  const respons = await fetch(`${url}/functions/v1/send-push`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ berichten }),
  });

  const resultaat = await respons.json().catch(() => ({}));

  if (!respons.ok) {
    // De geclaimde regels op `failed` zetten, anders staan ze voor eeuwig op `claimed` en is niet
    // te zien dat er iets misging.
    await admin
      .from('notifications_sent')
      .update({ status: 'failed', fout: `send-push ${respons.status}` })
      .in('id', berichten.map((b) => b.meldingId));

    console.error('[push-sweep] send-push mislukt:', respons.status, resultaat);
    return antwoord(502, { error: 'send_push_mislukt', status: respons.status, resultaat });
  }

  return antwoord(200, {
    ok: true,
    kandidaten: lijst.length,
    geclaimd: berichten.length,
    ...resultaat,
  });
});
