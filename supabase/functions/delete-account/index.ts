/**
 * `delete-account` — verwijdert het account van de aanroeper, en al zijn gegevens.
 *
 * **Waarom dit een edge function is en geen `.delete()` in de app.**
 *
 * 1. De client kan `auth.users` niet aanraken. `supabase.auth.admin.deleteUser()` eist de
 *    service-role-sleutel, en die mag nooit in een app-bundel: wie hem eruit peutert kan elk
 *    account van elke lezer verwijderen. Hij bestaat alleen hier, als omgevingsvariabele.
 * 2. Rijen wissen vanuit de app zou sowieso niets doen. Op `profiles`, `voortgang`,
 *    `story_progress`, `character_unlocks`, `poll_responses` en `user_choices` staat RLS aan
 *    met alleen select/insert/update-policies. Een `delete` zonder policy raakt **nul rijen en
 *    geeft geen fout** — de app zou "verwijderd" melden terwijl alles er nog staat.
 * 3. Het hoeft ook niet: elke foreign key naar `auth.users` staat op `on delete cascade`.
 *    Eén `deleteUser` haalt de gebruiker én alle zes de tabellen leeg, in één transactie.
 *    Zes losse deletes zouden bij een fout halverwege een half account achterlaten.
 *
 * De function verwijdert **uitsluitend de aanroeper zelf**: het id komt uit het geverifieerde
 * token, nooit uit de request-body. Er is dus geen parameter waarmee je iemand anders opgeeft.
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

Deno.serve(async (req: Request) => {
  // De browser stuurt een preflight voordat hij de POST met een Authorization-header doet.
  // Op Android bestaat die stap niet, maar de webpreview van deze app wel.
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return antwoord(405, { error: 'method_not_allowed' });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    // Kan alleen bij een verkeerd geconfigureerd project. Luidruchtig falen: stilzwijgend
    // "gelukt" antwoorden op een verwijderverzoek is het ergste dat deze function kan doen.
    console.error('[delete-account] SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt');
    return antwoord(500, { error: 'server_niet_geconfigureerd' });
  }

  const header = req.headers.get('Authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return antwoord(401, { error: 'geen_token' });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // `getUser(token)` laat GoTrue het token controleren — handtekening, vervaldatum en of de
  // gebruiker nog bestaat. Zelf de payload uitlezen zou een vervalst token accepteren.
  const { data: gebruiker, error: tokenFout } = await admin.auth.getUser(token);
  if (tokenFout || !gebruiker.user) {
    return antwoord(401, { error: 'ongeldig_token' });
  }

  const { error: verwijderFout } = await admin.auth.admin.deleteUser(gebruiker.user.id);
  if (verwijderFout) {
    console.error('[delete-account] verwijderen mislukt:', verwijderFout.message);
    return antwoord(500, { error: 'verwijderen_mislukt', details: verwijderFout.message });
  }

  return antwoord(200, { ok: true });
});
