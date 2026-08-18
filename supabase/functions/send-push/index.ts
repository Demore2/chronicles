/**
 * `send-push` — het enige stuk code dat met Firebase Cloud Messaging praat.
 *
 * **Transport, geen beleid.** Deze function bedenkt niet wíe iets moet krijgen of waaróm; hij
 * krijgt een lijst kant-en-klare berichten mét tokens en levert ze af. Het beleid staat in
 * `push-sweep`. Die scheiding is er omdat de twee om verschillende redenen kapotgaan: hier gaat
 * het over OAuth, dode tokens en HTTP-fouten, daar over "is deze lezer drie dagen weg".
 *
 * **Alleen de service role mag hier aankloppen.** Een function die op `userId` een push stuurt en
 * openstaat voor elke ingelogde lezer is een spamkanaal: dan stuurt iedereen elkaar meldingen.
 * `verify_jwt` houdt anonieme aanroepen bij de poort tegen, en de rolcontrole hieronder houdt
 * gewone lezers tegen.
 *
 * **Waarom hier zoveel code voor een toegangstoken staat.** De HTTP v1 API van FCM wil een OAuth2
 * bearer token. Dat token krijg je niet door je service-account-gegevens naar het token-endpoint
 * te sturen — je bouwt zelf een JWT, ondertekent hem met RS256 met de private key, en wisselt die
 * assertie in (`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`). De oude weg (een
 * `FCM_API_KEY` als `Authorization: key=...`) was de legacy API en die is door Google uitgezet.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function antwoord(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

type Bericht = {
  /** Alleen voor het logboek en voor het uitschakelen van dode tokens. */
  userId: string;
  tokens: string[];
  titel: string;
  bericht: string;
  /** Routepad binnen de app, bijv. `/verhaal/joan-of-arc/chapters`. */
  pad?: string;
  soort?: string;
  /** De rij in `notifications_sent` die bij dit bericht hoort; wordt bijgewerkt. */
  meldingId?: string;
};

// --------------------------------------------------------------------------------------------
// Google OAuth2: JWT bouwen, ondertekenen, inwisselen
// --------------------------------------------------------------------------------------------

/**
 * Het toegangstoken is een uur geldig. Eén per isolate hergebruiken scheelt bij een sweep van
 * honderd lezers negenennegentig rondjes naar Google — en Google beperkt hoe vaak je er een mag
 * halen. Vandaar dat `push-sweep` alle berichten in één aanroep aanlevert.
 */
let tokenCache: { token: string; verlooptOp: number } | null = null;

function base64url(bytes: Uint8Array): string {
  let binair = '';
  for (const byte of bytes) binair += String.fromCharCode(byte);
  return btoa(binair).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlTekst(waarde: string): string {
  return base64url(new TextEncoder().encode(waarde));
}

/**
 * PEM naar DER. De private key komt als omgevingsvariabele binnen, en dan is hij bijna altijd op
 * één van twee manieren geschreven: met echte regeleindes, of met letterlijke backslash-n erin
 * omdat hij uit een JSON-bestand geknipt is. Allebei accepteren is één regel en scheelt een half
 * uur zoeken naar "invalid keyData".
 */
function pemNaarDer(pem: string): Uint8Array {
  const schoon = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binair = atob(schoon);
  const uit = new Uint8Array(binair.length);
  for (let i = 0; i < binair.length; i++) uit[i] = binair.charCodeAt(i);
  return uit;
}

async function haalToegangstoken(): Promise<string> {
  const nu = Math.floor(Date.now() / 1000);
  // Een minuut marge: een token dat tijdens de vlucht verloopt geeft een 401 op de laatste push
  // van de batch, en dat is precies het soort fout dat je één keer per duizend keer ziet.
  if (tokenCache && tokenCache.verlooptOp > nu + 60) return tokenCache.token;

  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY');
  if (!clientEmail || !privateKey) {
    throw new Error('FIREBASE_CLIENT_EMAIL of FIREBASE_PRIVATE_KEY ontbreekt');
  }

  const header = base64urlTekst(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64urlTekst(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: nu,
      exp: nu + 3600,
    })
  );

  const sleutel = await crypto.subtle.importKey(
    'pkcs8',
    pemNaarDer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const handtekening = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    sleutel,
    new TextEncoder().encode(`${header}.${claims}`)
  );
  const assertie = `${header}.${claims}.${base64url(new Uint8Array(handtekening))}`;

  const respons = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertie,
    }),
  });

  const data = await respons.json();
  if (!respons.ok || !data.access_token) {
    throw new Error(`OAuth mislukt (${respons.status}): ${JSON.stringify(data)}`);
  }

  tokenCache = { token: data.access_token, verlooptOp: nu + (data.expires_in ?? 3600) };
  return tokenCache.token;
}

// --------------------------------------------------------------------------------------------
// FCM
// --------------------------------------------------------------------------------------------

/** Fouten waarna het token nooit meer gaat werken; de rij in `user_devices` gaat dan uit. */
const DOOD_TOKEN = new Set(['UNREGISTERED', 'INVALID_ARGUMENT', 'SENDER_ID_MISMATCH']);

type Aflevering = { token: string; ok: boolean; dood: boolean; fout?: string };

async function stuurNaarToken(
  projectId: string,
  toegangstoken: string,
  token: string,
  bericht: Bericht
): Promise<Aflevering> {
  // Elke waarde in `data` moet een string zijn — FCM weigert het hele bericht bij een getal.
  const data: Record<string, string> = {};
  if (bericht.pad) data.pad = bericht.pad;
  if (bericht.soort) data.soort = bericht.soort;
  if (bericht.meldingId) data.melding_id = bericht.meldingId;

  const respons = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${toegangstoken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: bericht.titel, body: bericht.bericht },
          data,
          android: {
            // `normal` en niet `high`: dit is een duwtje, geen alarm. Met `high` mag Android hem
            // uit Doze halen en de telefoon van een slapende lezer wekken.
            priority: 'normal',
            notification: {
              // Moet bestaan in de app, anders valt Android terug op een kanaal dat de lezer niet
              // apart kan uitzetten. `constants/notificaties.ts` maakt hem aan bij het opstarten.
              channel_id: 'terugkeer',
              sound: 'default',
            },
          },
          apns: { headers: { 'apns-priority': '5' } },
        },
      }),
    }
  );

  if (respons.ok) return { token, ok: true, dood: false };

  const tekst = await respons.text();
  let foutcode = '';
  try {
    const body = JSON.parse(tekst);
    foutcode =
      body?.error?.details?.find((d: Record<string, unknown>) => typeof d.errorCode === 'string')
        ?.errorCode ??
      body?.error?.status ??
      '';
  } catch {
    // Geen JSON terug: dan is de statuscode alles wat we hebben.
  }
  // 404 zonder herkenbare code is bij FCM ook "dit token bestaat niet meer".
  const dood = DOOD_TOKEN.has(foutcode) || respons.status === 404;
  return { token, ok: false, dood, fout: `${respons.status} ${foutcode || tekst.slice(0, 200)}` };
}

// --------------------------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return antwoord(405, { error: 'method_not_allowed' });

  // --- Alleen de service role ---
  //
  // **Dit staat vóór elke andere controle, en dat is geen stijlkwestie.** De poort (`verify_jwt`)
  // laat elk geldig token door, dus ook dat van een gewone lezer; zonder deze controle zou
  // iedereen die inlogt een push naar een willekeurige `userId` kunnen sturen. Stond de
  // configuratiecontrole hierboven, dan vertelt deze function aan een willekeurige aanroeper of
  // Firebase al is ingesteld — een gratis blik op de serverstatus, en precies de volgorde die je
  // in een test niet opmerkt zolang die configuratie nog ontbreekt.
  const header = req.headers.get('Authorization') ?? '';
  const jwt = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  let rol = '';
  try {
    rol = JSON.parse(atob(jwt.split('.')[1] ?? '')).role ?? '';
  } catch {
    rol = '';
  }
  if (rol !== 'service_role') return antwoord(403, { error: 'alleen_service_role' });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  if (!url || !serviceKey) return antwoord(500, { error: 'server_niet_geconfigureerd' });
  if (!projectId) {
    // Luidruchtig, want dit is de meest waarschijnlijke reden dat er niets aankomt.
    console.error('[send-push] FIREBASE_PROJECT_ID ontbreekt');
    return antwoord(500, { error: 'firebase_niet_geconfigureerd' });
  }

  let berichten: Bericht[];
  try {
    const body = await req.json();
    // Eén bericht of een lijst — de sweep stuurt een lijst, een handmatige test één.
    berichten = Array.isArray(body?.berichten) ? body.berichten : [body];
  } catch {
    return antwoord(400, { error: 'ongeldige_body' });
  }

  const bruikbaar = berichten.filter(
    (b) => b && typeof b.userId === 'string' && Array.isArray(b.tokens) && b.tokens.length > 0
  );
  if (bruikbaar.length === 0) return antwoord(400, { error: 'geen_berichten' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  let toegangstoken: string;
  try {
    toegangstoken = await haalToegangstoken();
  } catch (fout) {
    console.error('[send-push] toegangstoken mislukt:', fout);
    return antwoord(500, { error: 'oauth_mislukt', details: String(fout) });
  }

  const dodeTokens: string[] = [];
  const resultaten: Record<string, unknown>[] = [];

  for (const bericht of bruikbaar) {
    const afleveringen = await Promise.all(
      bericht.tokens.map((token) => stuurNaarToken(projectId, toegangstoken, token, bericht))
    );
    for (const a of afleveringen) if (a.dood) dodeTokens.push(a.token);

    // Eén toestel dat het haalt is genoeg om dit bericht geslaagd te noemen: de lezer heeft hem
    // gezien. Alleen als géén enkel toestel het haalde is het een mislukking.
    const geslaagd = afleveringen.some((a) => a.ok);

    if (bericht.meldingId) {
      await admin
        .from('notifications_sent')
        .update({
          status: geslaagd ? 'sent' : 'failed',
          sent_at: geslaagd ? new Date().toISOString() : null,
          fout: geslaagd
            ? null
            : afleveringen
                .map((a) => a.fout)
                .filter(Boolean)
                .join('; ')
                .slice(0, 500),
        })
        .eq('id', bericht.meldingId);
    }

    resultaten.push({
      userId: bericht.userId,
      geslaagd,
      afgeleverd: afleveringen.filter((a) => a.ok).length,
      totaal: afleveringen.length,
    });
  }

  // Dode tokens uitzetten in plaats van verwijderen: dat het toestel ooit bestond is nuttig, en
  // de rij komt bij een herinstallatie toch weer langs met een nieuw token.
  if (dodeTokens.length > 0) {
    await admin.from('user_devices').update({ enabled: false }).in('fcm_token', dodeTokens);
  }

  return antwoord(200, {
    ok: true,
    verzonden: resultaten.filter((r) => r.geslaagd).length,
    mislukt: resultaten.filter((r) => !r.geslaagd).length,
    tokens_uitgezet: dodeTokens.length,
    resultaten,
  });
});
