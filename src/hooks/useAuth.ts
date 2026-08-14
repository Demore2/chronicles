import type { Session, User } from '@supabase/supabase-js';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore, type Profiel } from '@/store/auth-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * Auth-acties voor R8.AUTH deel 1.
 *
 * De losse functies staan bewust buiten de hook: ze zijn dan stabiel (geen nieuwe referentie
 * per render), los importeerbaar in een event-handler, en ze praten via `getState()` met de
 * store in plaats van via een closure over verouderde state.
 */

export type AuthResultaat =
  | { ok: true; user: User; bevestigingNodig: boolean }
  | { ok: false; error: string };

/** De kolommen van `profiles` die we uitlezen. */
const PROFIEL_KOLOMMEN = 'id, email, username, language, theme';

/**
 * Haalt de `profiles`-rij op. `maybeSingle()` — een ontbrekend profiel is een lege waarde,
 * geen fout: bij een signup met e-mailbevestiging bestaat de rij nog niet.
 */
async function haalProfiel(userId: string): Promise<Profiel | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFIEL_KOLOMMEN)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // Geen harde fout: zonder profiel kun je nog steeds ingelogd zijn. De UI valt terug
    // op het e-mailadres uit `user`.
    console.warn('[auth] profiel ophalen mislukt:', error.message);
    return null;
  }
  return data as Profiel | null;
}

export async function login(email: string, password: string): Promise<AuthResultaat> {
  const store = useAuthStore.getState();
  store.setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    const bericht = error?.message ?? 'Inloggen mislukt.';
    store.setError(bericht);
    return { ok: false, error: bericht };
  }

  const profiel = await haalProfiel(data.user.id);
  store.setUser(data.user, profiel);
  return { ok: true, user: data.user, bevestigingNodig: false };
}

export async function signup(
  email: string,
  password: string,
  username: string
): Promise<AuthResultaat> {
  const store = useAuthStore.getState();
  store.setLoading(true);

  const genormaliseerdeEmail = email.trim();
  const { data, error } = await supabase.auth.signUp({
    email: genormaliseerdeEmail,
    password,
    // De gebruikersnaam gaat mee in user_metadata, niet alleen naar `profiles`: bij een signup
    // met e-mailbevestiging bestaat de profielrij nog niet, en `herstelSessie` haalt de naam
    // bij de eerste login hier weer op. Zonder dit was de ingetypte naam dan verdwenen.
    options: { data: { username } },
  });

  if (error || !data.user) {
    const bericht = error?.message ?? 'Registreren mislukt.';
    store.setError(bericht);
    return { ok: false, error: bericht };
  }

  // Staat e-mailbevestiging aan in Supabase, dan geeft signUp() wel een user maar géén
  // sessie. Zonder sessie is auth.uid() leeg en weigert RLS beide inserts. De rijen komen
  // dan bij de eerste login alsnog goed (zie herstelSessie), dus dit is geen fout.
  const bevestigingNodig = data.session === null;

  if (bevestigingNodig) {
    // Geen sessie = niet ingelogd. De store hier tóch vullen zou de auth-poort in de root
    // layout (deel 2) binnenlaten terwijl elke query een 401 geeft, en bij de eerstvolgende
    // start zou `getSession()` de gebruiker er weer uit gooien. Het scherm toont in plaats
    // daarvan "check je mail".
    store.setLoading(false);
    return { ok: true, user: data.user, bevestigingNodig };
  }

  await maakGebruikersrijen(data.user.id, genormaliseerdeEmail, username);
  const profiel = await haalProfiel(data.user.id);
  store.setUser(data.user, profiel);
  return { ok: true, user: data.user, bevestigingNodig: false };
}

/**
 * Zet de `profiles`- en `voortgang`-rij klaar. `upsert` in plaats van `insert`, zodat een
 * tweede aanroep (herstelde sessie na e-mailbevestiging, of een half mislukte signup) geen
 * duplicate-key-fout geeft.
 *
 * De voortgang-rij krijgt alleen `user_id` mee — alle andere kolommen hebben een default in het
 * schema, en de eerste sync van `voortgang-store` vult ze meteen daarna.
 */
async function maakGebruikersrijen(
  userId: string,
  email: string,
  username?: string
): Promise<void> {
  const { error: profielFout } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, username: username ?? null }, { onConflict: 'id' });

  if (profielFout) {
    console.warn('[auth] profiel aanmaken mislukt:', profielFout.message);
  }

  // Was een select-dan-insert, omdat `voortgang` geen unieke index op user_id had. Sinds de
  // migratie van deel 3 staat die er wel en kan dit één upsert zijn. `ignoreDuplicates`, want
  // een bestaande rij bevat echte voortgang die we hier niet mogen platslaan met defaults.
  const { error: voortgangFout } = await supabase
    .from('voortgang')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

  if (voortgangFout) {
    console.warn('[auth] voortgang aanmaken mislukt:', voortgangFout.message);
  }
}

export async function logout(): Promise<void> {
  // Laatste kans om openstaande voortgang weg te schrijven: na `signOut()` is er geen token meer
  // en geeft elke upsert een 401. Mislukt hij (offline), dan blijft de vlag lokaal staan en gaat
  // het alsnog omhoog zodra dezelfde gebruiker weer inlogt.
  if (useVoortgangStore.getState().heeftOnverzondenWijzigingen) {
    await useVoortgangStore.getState().syncToSupabase();
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('[auth] uitloggen mislukt:', error.message);
  }
  // Ook bij een fout lokaal uitloggen: de sessie is hier hoe dan ook weggegooid.
  useAuthStore.getState().clearUser();
}

/**
 * Vult de store vanuit een bestaande sessie. Draait bij het opstarten en bij elke wissel
 * die supabase-js meldt (token-refresh, uitloggen op een ander tabblad).
 */
async function herstelSessie(session: Session | null): Promise<void> {
  const store = useAuthStore.getState();

  if (!session?.user) {
    store.clearUser();
    return;
  }

  let profiel = await haalProfiel(session.user.id);

  // Eerste login na een e-mailbevestiging: de signup kon de rijen nog niet schrijven omdat
  // er toen geen sessie was. Nu wel — alsnog aanmaken.
  if (!profiel && session.user.email) {
    await maakGebruikersrijen(
      session.user.id,
      session.user.email,
      session.user.user_metadata?.username as string | undefined
    );
    profiel = await haalProfiel(session.user.id);
  }

  store.setUser(session.user, profiel);
}

/**
 * Houdt de auth-store gelijk met de echte Supabase-sessie.
 *
 * Mount dit één keer hoog in de boom (root layout). Meerdere instanties zijn niet fout —
 * elke instantie ruimt zijn eigen abonnement op — maar ze doen hetzelfde werk dubbel.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const profiel = useAuthStore((state) => state.profiel);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    let actief = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (actief) void herstelSessie(data.session);
      })
      .catch((fout: unknown) => {
        if (!actief) return;
        console.warn('[auth] sessie ophalen mislukt:', fout);
        useAuthStore.getState().clearUser();
      });

    const { data: abonnement } = supabase.auth.onAuthStateChange((_event, session) => {
      if (actief) void herstelSessie(session);
    });

    return () => {
      actief = false;
      abonnement.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profiel,
    isLoading,
    error,
    isIngelogd: user !== null,
    login,
    signup,
    logout,
  };
}

export { useAuthStore };
