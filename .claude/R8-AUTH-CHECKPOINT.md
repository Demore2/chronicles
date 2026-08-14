# R8.AUTH — checkpoint after DEEL 3

Started 2026-08-13 after DEEL 2, extended 2026-08-14 at the end of DEEL 3. What exists, what it
does, and what it deliberately does *not* do.

Trust this file over `subagent-prompts.md` / `REFACTOR-PLAN.md` (historical), but trust the code
over this file if they ever disagree.

---

## 1. Status

| Part | Scope | State |
|---|---|---|
| DEEL 1 | Supabase client, `profiles`/`voortgang` tables + RLS, auth store, `useAuth` | done |
| DEEL 2 | Login + signup screens, auth gate in the root layout, sign-out on Profiel | done, tested on the emulator |
| DEEL 3 | Voortgang → Supabase sync, debounce, offline retry, merge on login, sync indicator | done, tested on the emulator (§8) |

`npx tsc --noEmit` clean. `npx eslint` clean on every file listed in §2. `npm run lint` still
reports 7 pre-existing errors in files neither part touched (`(tabs)/_layout.tsx` display-name,
`tijdperken-carousel.tsx` refs, `use-color-scheme.web.ts` setState-in-effect) — those were there
before R8.AUTH and are not ours to fix here.

---

## 2. Files

New:

| File | What it is |
|---|---|
| `src/lib/supabase.ts` | the one client; throws at import if the env vars are missing |
| `src/store/auth-store.ts` | `user` / `profiel` / `isLoading` / `error`, **in memory only** |
| `src/hooks/useAuth.ts` | `login` / `signup` / `logout` (loose functions) + `useAuth()` (session listener) |
| `src/app/login.tsx` | e-mail + password, error box, "Forgot password?" (stub) |
| `src/app/signup.tsx` | username + e-mail + password, strength meter, ToS checkbox |
| `src/components/auth-veld.tsx` | labelled `TextInput`, focus ring |
| `src/components/auth-knop.tsx` | primary button, spinner inside the button |
| `src/constants/auth-validatie.ts` | `MIN_WACHTWOORD_LENGTE`, `wachtwoordSterkte()`, `isGeldigEmail()` |
| `src/hooks/use-voortgang-sync.ts` | DEEL 3 — pull on sign-in, retry on reconnect/foreground |
| `src/components/sync-indicator.tsx` | DEEL 3 — sync status line on Profiel |

Modified:

| File | Change |
|---|---|
| `src/app/_layout.tsx` | mounts `useAuth()` once, adds `AuthPoort` + `SessieLaadscherm`, registers `login`/`signup`; DEEL 3 mounts `useVoortgangSync()` |
| `src/store/voortgang-store.ts` | DEEL 3 — `syncToSupabase`, merge, dirty flag, `partialize`, `haalVoortgangOp` |
| `src/hooks/useAuth.ts` | DEEL 3 — flush before `signOut()`, `maakGebruikersrijen` now upserts `voortgang` |
| `src/i18n/{en,nl,fr,de}.ts` | DEEL 3 — the `sync.*` block |
| `package.json` | DEEL 3 — `@react-native-community/netinfo` 12.0.1 (native, needs a rebuild) |
| `src/app/(tabs)/profiel.tsx` | Account section at the bottom: username/e-mail + "Sign out" with a confirm dialog |
| `src/constants/theme.ts` | `gevaar` / `waarschuwing` / `succes` in both palettes |
| `src/i18n/{en,nl,fr,de}.ts` | the `auth.*` block, all four languages |
| `CLAUDE.md` | "Auth (Supabase, R8.AUTH)" section |

`.env.local` holds `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and the
old `NEXT_PUBLIC_*` names, which Node scripts still read). Not in git.

---

## 3. Database (project `nxwdhuuouhbmykgykbov`)

```
public.profiles                       public.voortgang
  id          uuid  PK → auth.users     id                     uuid PK  default gen_random_uuid()
  email       text  unique              user_id                uuid UNIQUE → auth.users
  username    text  null                bekekenids             text[]  default '{}'
  language    text  default 'nl'        gelezenids             text[]  default '{}'   (deel 3)
  theme       text  default 'systeem'   completedstories       text[]  default '{}'   (deel 3)
  created_at  timestamptz               streak                 int     default 0
  updated_at  timestamptz               laatsteactiviteitdatum text    null           (deel 3)
                                        streakstartdate        text    null   ← unused, deel 1 leftover
                                        updated_at             timestamptz
```

Migration applied in DEEL 3: `voortgang_sync_columns_and_unique_user`.

RLS is on for both, with the same three policies each (SELECT / INSERT / UPDATE, all
`auth.uid() = id` resp. `auth.uid() = user_id`, `with check` on INSERT and UPDATE). **There is no
DELETE policy** — nothing in the app deletes a row, and adding one is a decision, not an oversight
to fix in passing.

Two traps that already cost time:

- **The camelCase columns folded to lowercase.** Unquoted identifiers in Postgres do that:
  `bekekenIds` → `bekekenids`, `streakStartDate` → `streakstartdate`. supabase-js must use the
  lowercase names; the app-side stores keep their camelCase and need mapping. The new deel 3
  columns follow the same convention on purpose, so the whole table reads one way.
- ~~**`voortgang` has no unique index on `user_id`**~~ — fixed in deel 3
  (`voortgang_user_id_key`). Both `maakGebruikersrijen` and `syncToSupabase` now `upsert` on
  `onConflict: 'user_id'`; `maakGebruikersrijen` passes `ignoreDuplicates` so it can never flatten
  a real row back to defaults.
- **There is still no DELETE policy** on either table, and account deletion is unimplemented.
  Play's data-deletion requirement is an open item, not an oversight.

---

## 4. How the pieces behave (don't break these)

- **`useAuth()` runs exactly once**, in `src/app/_layout.tsx`. It owns `getSession()` and
  `onAuthStateChange`. Screens import the loose `login`/`signup`/`logout` or read `useAuthStore`
  directly — a second `useAuth()` mounts a second listener that does the same work twice.
- **`auth-store` is not persisted.** The session already lives in AsyncStorage via supabase-js;
  a second copy drifts the moment a token expires and then the app shows a logged-in user whose
  every query 401s.
- **`AuthPoort` is the only thing that redirects.** No session and not on `/login` or `/signup` →
  `replace('/login')`; session and on one of them → `replace('/')`. It waits for
  `useRootNavigationState()?.key` (navigating before the root layout mounts throws) and for
  `isLoading === false`. `SessieLaadscherm` covers the Stack while that check runs so Home never
  flashes.
- **Signup with e-mail confirmation on gives a user but no session.** `signup()` then returns
  `bevestigingNodig: true` and leaves the store empty on purpose; the screen shows "open the
  confirmation link". The username rides along in `user_metadata`, and `herstelSessie()` creates
  the `profiles` + `voortgang` rows at the first real login. Verified: the row came out with
  `username = 'TestLezer'`.
- **Sign-out does not clear local reading progress** and the dialog says so. Don't "fix" the
  copy into a scarier warning that isn't true — if DEEL 3 ever *does* clear local state on
  logout, change the behaviour and the copy together.
- `Alert` does not exist in react-native-web, so the sign-out handler falls back to
  `window.confirm` on web.
- Login/signup navigate with `router.replace('/')`, not `/(tabs)/ontdek` — `ontdek` is an orphan
  that redirects to `/` anyway.

---

## 5. Tested on the emulator (Pixel_8, dev client)

Cold start logged out → login screen · empty form → "All fields are required" · short password →
length error · unticked ToS → ToS error · strength meter Weak/Medium/Strong in red/amber/green ·
signup → account created, "check your mail" · wrong password → "Invalid login credentials" ·
correct password → Home · story + chapter overview still work · force-stop + relaunch → still
signed in · Profiel → Sign out → dialog → login screen · cold start logged out again → login.

Screenshots from that run are in the session scratchpad, not in the repo.

---

## 6. What DEEL 3 built, and the decisions inside it

Only **`voortgang-store`** syncs. The other stores are untouched (see §9).

**Push.** Every mutating action calls `plandeSync()`, a single module-level 2-second timer, so a
burst of chapter completions costs one `upsert`. `syncToSupabase` writes the whole store — the
three sets plus the streak — as one row on `onConflict: 'user_id'`.

**Pull + merge.** `haalVoortgangOp` runs once per sign-in from `useVoortgangSync`, keyed on
`user.id` and not on the user object (supabase-js hands out a fresh object at every token refresh).
`voegServerVoortgangSamen` then **unions** the sets and keeps the streak belonging to the most
recent `laatsteActiviteitDatum`.

The original plan said to overwrite local state with the server row. It merges instead, and that
was a deliberate change: overwriting erases everything read before signing in and everything read
offline on this device while another device synced. The three sets only ever grow, so the union
cannot lose anything — and it makes item 3 of the old §6 (local progress not migrated into the
account) disappear rather than becoming a separate migration step.

**Offline.** The plan's `pendingSyncs: { bekekenIds, timestamp }[]` became one persisted boolean,
`heeftOnverzondenWijzigingen`. A queue of snapshots of monotonically growing state is redundant —
every older entry is a subset of the current one, so a retry sends the latest stand regardless. On
failure the flag stays set and `useVoortgangSync` retries on a NetInfo reconnect or on return to
the foreground.

**Two races that had to be closed:**

1. `persist` hydrates asynchronously. A push before hydration uploads the *empty* initial state and
   wipes the server row; a merge before hydration is overwritten a tick later by AsyncStorage. Both
   entry points now `await wachtOpHydratie()`. In practice storage always beats the network — which
   is exactly why this would have failed rarely and silently.
2. `partialize` keeps `isSyncing` and `syncError` out of storage. A persisted `isSyncing: true`
   (app killed mid-upsert) would hit the `if (isSyncing) return` guard forever and kill sync for
   good. `heeftOnverzondenWijzigingen` *is* persisted — it is the queue.

`resetSyncStatus()` (on sign-out) deliberately leaves the dirty flag alone: it describes the gap
between device and server, not the session.

---

## 7. Still open after DEEL 3

1. **Only `voortgang-store` syncs.** `story-progress-store` (which chapters are done) and
   `character-unlock-store` are device-local, so a second device shows a story as *seen* but at
   0/8 chapters and with the character still locked. This is the obvious next job; the debounce,
   retry and merge machinery is written to be reused. Chapter progress is a `Record<id, number[]>`
   — a `jsonb` column or a `hoofdstuk_voortgang` table, and the merge is a per-story union.
2. **"Forgot password?" is a stub** — logs a TODO. Needs `supabase.auth.resetPasswordForEmail()`
   plus a reset screen and a deep link back into the app.
3. **No sign-in with Apple/Google**, no anonymous accounts. Play does not require them.
4. **`profiles.language` / `profiles.theme` are never read or written** by the app; `taal-store`
   and `thema-store` remain the source of truth.
5. **The privacy policy still describes a device-only app**, and now it is wronger than it was:
   reading progress leaves the device too. `docs/privacy-policy.html`, `docs/README.md` (the Data
   Safety answers) and `src/constants/juridisch.ts` all predate auth. Must be updated before the
   production build, and easy to forget because nothing in the code fails when it is wrong.
6. **No account deletion and no DELETE policy.** Play requires a data-deletion route for accounts.
7. **`useAbonnement()` still hardcodes `{ isPremium: false }`** — unrelated to auth, but it is the
   other thing a `profiles` row would naturally carry.
8. **A conflict is resolved by union, never by "latest wins".** That is right for sets and it is a
   guess for the streak. If a future field can *decrease* (a setting, a bookmark position), this
   merge is the wrong shape for it and needs per-field timestamps.

---

## 8. Tested on the emulator — DEEL 3 (Pixel_8, dev client, 2026-08-14)

Run against `r8test@chronicles.app`, watching `public.voortgang` from the Supabase side after each
step:

| # | Test | Result |
|---|---|---|
| 1 | Sign in on a device that already had local progress | row went from empty to `['julius-caesar']`, streak 1 / 2026-08-13 — pre-login progress landed in the account |
| 2 | Open a second story online | `spartacus` appeared within seconds of the 2s debounce |
| 3 | Airplane mode on, open a third story | row unchanged; Profiel showed amber "Offline — your progress will sync later" |
| 4 | Airplane mode off | `joan-of-arc` pushed automatically, no interaction; indicator turned green "Progress synced just now" |
| 5 | Sign out, add `marie-curie` + streak 5 / today server-side, sign in again | Home's flame went 1 → 5 (server streak won on the later date) |
| 6 | Open a fourth story after that | push contained **all five** ids including `marie-curie` — proof the store merged the server row instead of overwriting it |
| 7 | Mark a chapter complete | `updated_at` moved; streak stayed 5 (already counted today), which is the B6 rule |

Test 5 in the DEEL 3 brief ("break the Supabase URL to force an error") was covered by tests 3–4
instead: the offline path is the same `catch`, and it exercised `syncError` → indicator → automatic
retry end to end. Breaking the URL would have needed a rebuild anyway, because `EXPO_PUBLIC_*` is
inlined at bundle time.

Screenshots from that run are in the session scratchpad, not in the repo.

---

## 9. Test recipe

Account already in the project: `r8test@chronicles.app` / `abcde1234567`, `username = TestLezer`,
confirmed by hand.

Supabase's default SMTP only delivers to team members, so a confirmation mail to a test address
never arrives. Confirm a fresh test user with SQL instead:

```sql
update auth.users set email_confirmed_at = now() where email = '<address>';
```

Emulator (see also the project memory notes):

```bash
emulator -avd Pixel_8 -no-snapshot-load     # the quick-boot snapshot hangs
npx expo run:android                        # gradle build ≈ 2 min when warm
adb shell screencap -p /sdcard/x.png && adb pull /sdcard/x.png   # exec-out corrupts the PNG in PS 5.1
```

**`@react-native-community/netinfo` is a native module**, so a JS reload does not pick it up — a
dev client from before DEEL 3 needs `npx expo run:android` again or `NetInfo.addEventListener`
throws on mount, in the root layout, i.e. the whole app.

Metro from `expo run:android` keeps running after the command returns and will answer on 8081 in
the *next* session with a stale bundle. Kill whatever owns port 8081 before starting a dev server,
and remember the repo's watcher doesn't fire (`--clear`, restart after every edit).
