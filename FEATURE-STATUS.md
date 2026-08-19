# Chronicles — FEATURE STATUS AUDIT

**Audit date:** 19 August 2026 — *revised the same day, see "Changes since the audit" at the bottom.*
**Auditor:** Claude Code
**Method:** every claim checked against three sources — the live Supabase project
(`nxwdhuuouhbmykgykbov`, via MCP: tables, row counts, RLS policies, functions, cron, vault), the
actual source files, and the build tooling (`npx tsc --noEmit`, `npm run lint`,
`npm run validate:content`, `npm run check:push`). Nothing below is taken from CLAUDE.md or
LAUNCH-PLAN.md; where the docs and reality disagree, reality is recorded and the drift is listed
at the bottom.

**Definitions used**

| Status | Means |
|---|---|
| ✅ COMPLETE | Built, wired, and nothing outside the repo has to happen for it to run |
| ⚠️ PARTIAL | Code is finished but a dependency, asset, or manual step is missing — it cannot run as-is |
| ❌ NOT STARTED | No implementation |

Important distinction this audit keeps: **"the code is finished" is not "the feature works."**
Four features are code-complete and non-functional, all four blocked on the same two artefacts
(`google-services.json`, a published privacy-policy URL) plus one Vault secret.

---

## FEATURE STATUS MATRIX

| Feature | Status | Working | Broken / Missing |
|---|---|---|---|
| Interactive Reading | ✅ **COMPLETE** | 5 tables, RLS, `security definer` RPC, 142 seeded rows across 20 stories, 3 components mounted in the reader | Choices do not branch (deliberate); 2 of 20 stories have no choice point |
| Analytics | ⚠️ **PARTIAL** | All 14 events wired to real call sites, 3 user properties, consent locked on, lazy-load guard; now behind `EXPO_PUBLIC_FIREBASE_ENABLED` (`false`) so builds pass | `google-services.json` absent and the flag is off → SDK never loads; zero data has ever reached Firebase. Builds are **no longer blocked** |
| Push Notifications | ⚠️ **PARTIAL** | 3 local notification types work; both edge functions deployed; schema, catalog (20), cron job, client wrapper, preferences UI, 4-language copy all in place | `google-services.json` absent; no Firebase service account; Vault secret `service_role_key` unset → cron inert; `user_devices` **0 rows**, `notifications_sent` **0 rows** — never delivered once |
| Settings & Email | ✅ **COMPLETE** | 6 sections, correct icon size, "Soon" badges, email defaults exactly as specified, usage stats locked on | Push toggles invisible in practice (see note); 4 rows show "Soon" because their flags are `false` |
| Progress Screen | ✅ **COMPLETE** | 4 stat cards from the correct stores, 6 era bars, 14 badges, points total | — |
| Achievements | ✅ **COMPLETE** | 14 DB rows exactly matching `prestaties.ts`, derived unlock logic, modal mounted once, share with honest result handling, all 14 names in EN/NL/FR/DE | `user_achievements` and `achievement_progress` are **0 rows** — the sync path has never been exercised against a real account |
| GDPR | ⚠️ **PARTIAL** | Delete-account edge function deployed and wired; local wipe; data request mailto | **Privacy policy is written but not published** — `PRIVACY_BELEID_URL` is still a placeholder, so Settings hides the link. Play requires a live URL. Terms of service: no document exists at all |
| Supabase Integration | ✅ **COMPLETE** | Auth working, 17 tables all with RLS, 32 policies, 3 edge functions ACTIVE, 5 stores syncing with NetInfo/foreground triggers | — |

**Build health:** `npx tsc --noEmit` clean (exit 0). `npm run validate:content` clean (20 stories,
6 eras). `npm run lint` was **NOT** clean at audit time — 7 errors + 1 warning — and has since
been fixed; it is clean now. Details in "Changes since the audit".

---

## 1. INTERACTIVE READING — ✅ COMPLETE

### What works

**Schema** — five tables, all with RLS enabled:

| Table | Rows | Policies |
|---|---|---|
| `story_quizzes` | 56 | SELECT (authenticated) |
| `story_polls` | 50 | SELECT (authenticated) |
| `story_choices` | 36 | SELECT (authenticated) |
| `poll_responses` | 1 | SELECT + INSERT, both `auth.uid() = user_id` |
| `user_choices` | 1 | SELECT + INSERT, both `auth.uid() = user_id` |

**Coverage** — content exists for every story, verified by distinct `story_id`:
quizzes **20/20 stories**, polls **20/20**, choices **18/20**. The two stories without a choice
point are a content gap, not a code gap.

**The RPC exists and is correct.** `public.hoofdstuk_interactie(p_story_id text, p_chapter_index
integer)` is present with `prosecdef = true` — `security definer`, as the design requires. Poll
tallies are aggregates, so they must not come from client-side counting; the RLS policies on
`poll_responses` correctly return only your own rows, and totals come from the RPC alone.

**Components render and are mounted.** `story-quiz.tsx`, `story-poll.tsx`, `story-choice.tsx` and
`interactie-stem.tsx` are composed by `interactieve-sectie.tsx`, which is mounted at
`src/app/verhaal/[id]/reader.tsx:309` — after the blocks, before the ad slot, and it does not gate
"Mark Complete".

**Validation works.** Unique constraints on `(story_id, chapter_index, question)` and
`(story_id, choice_point_id)` make re-seeding idempotent; a `chapter_index >= 1` check constraint
pins the off-by-one that the column name invites.

### What's deliberately absent (not a defect)

- **Choices do not branch the story, and the UI does not claim they do.**
  `story-choice.tsx:9-13` documents that the copy was changed away from "your choice affects the
  story" precisely because no second version of any chapter exists. What the reader sees after
  choosing is real: how other readers decided, counted from `user_choices`.
- **Quiz answers are not persisted** — there is no `quiz_responses` table. A quiz is a self-test,
  not a grade. The result appears inline rather than in a modal.
- **A failed fetch shows no error.** The app cannot distinguish "network down" from "this chapter
  has no interaction", and most chapters have none.

### Files

`src/lib/interactief.ts` · `src/hooks/use-interactie.ts` · `src/components/interactieve-sectie.tsx`
· `story-quiz.tsx` · `story-poll.tsx` · `story-choice.tsx` · `interactie-stem.tsx` ·
`src/app/verhaal/[id]/reader.tsx` · `scripts/audit-interactive-content.mjs` ·
`scripts/generate-interactive-content.mjs` · `scripts/seed/interactief/`

---

## 2. ANALYTICS — ⚠️ PARTIAL

**The code is finished. It has never run, and in its current state it also blocks every build.**

### What works

- **All 14 events are wired to real call sites** — verified by grepping `ANALYTICS_EVENTS.` across
  `src/`. Not one is defined-but-unused:

  | Event | Call site |
  |---|---|
  | `STORY_READ` (×2, reread/first) | `verhaal/[id]/chapters.tsx` |
  | `LIMIT_REACHED` | `verhaal/[id]/chapters.tsx` |
  | `CHAPTER_COMPLETED`, `STORY_FINISHED`, `CHAR_UNLOCKED` | `verhaal/[id]/reader.tsx` |
  | `QUIZ_ANSWER` | `interactieve-sectie.tsx` |
  | `POLL_VOTE`, `CHOICE_SELECT` | `use-interactie.ts` |
  | `PAYWALL_VIEWED`, `SUBSCRIPTION_ATTEMPT` | `pro-paywall.tsx` |
  | `PUSH_REGISTERED`, `NOTIFICATION_RECEIVED`, `NOTIFICATION_OPENED` | `use-push-registratie.ts` |
  | `ACHIEVEMENT_UNLOCKED` | `use-prestaties.ts` |

  Plus three user properties (`TIER`, `LANGUAGE`, `TOTAL_CHARS`).
- **The safety design holds.** `src/lib/analytics.ts` lazy-`require`s behind a `Platform.OS ===
  'web'` check, caches `sdk = null` on first failure, warns once, and never throws — so the missing
  SDK degrades silently at runtime instead of crashing the app.
- **Consent is locked on.** `analytics-preferences.tsx` renders the row as "Always on"; nothing
  sets `toestemming` to `false`.

### What's missing / broken

- **`google-services.json` is not in the repo.** Confirmed absent from the root.
  `app.json:24` points `expo.android.googleServicesFile` at it and `app.json:78` loads the
  `@react-native-firebase/app` plugin. Consequences, in order of severity:
  1. **`expo prebuild` fails, and therefore every EAS build fails.** This is not a
     degraded-feature problem, it is a hard build blocker.
  2. `analytics.beschikbaar` is `false` in any dev client, so no event is ever sent.
- **No data is visible in the Firebase console, and none can be.** No build has ever shipped with
  a working Firebase config, so the dashboard question cannot be answered "yes" — it is
  structurally empty.
- **The diagnostic screen was removed.** `src/app/profiel/analytics.tsx` is a tombstone. It never
  showed metrics (there is no API for an app to read its own DAU), but it did show whether the
  native module was present in this build — which is exactly the question that will be asked the
  first time nothing appears in Firebase. The replacement is `analytics.beschikbaar` or the single
  warning the module logs.

### Files

`src/lib/analytics.ts` · `src/constants/analytics.ts` · `src/hooks/useAnalytics.ts` ·
`src/store/analytics-store.ts` · `src/components/analytics-preferences.tsx` ·
`src/app/profiel/analytics.tsx` (tombstone) · `app.json` · **missing: `google-services.json`**

---

## 3. PUSH NOTIFICATIONS — ⚠️ PARTIAL

**Everything inside the repo and the database is built and deployed. Delivery has never happened
once, and three artefacts outside the code are why.**

### What works

- **Both edge functions are deployed and ACTIVE**, verified against the live project:
  `send-push` (v1) and `push-sweep` (v2), both with `verify_jwt: true`, both additionally
  requiring the service role in code — `verify_jwt` alone would let any logged-in reader push to
  an arbitrary `userId`.
- **The schema is in place**: `user_devices` (unique on `fcm_token`, so one reader can hold two
  devices), `notification_preferences` (11 columns, including `achievements_enabled` default
  `true` and an IANA `tijdzone` defaulting to `'UTC'`), `notifications_sent` (claim-before-send
  dedupe), `story_catalog` (**20 rows** — in sync with the bundle).
- **`push_kandidaten(doel_uur integer)` exists** as `security definer` and computes the hour in
  each reader's own timezone. `normaliseer_tijdzone()` exists as the trigger that reverts an
  unknown zone name to `'UTC'` rather than letting the whole sweep throw.
- **The cron job exists and is correctly inert.** `cron.job` contains `push-sweep-elk-uur`,
  schedule `0 * * * *`, `active = true` — but the Vault check confirms
  **`service_role_key` is not set (0 secrets total)**, so the job's `where exists (...)` guard
  fires no request. This is working as designed: it is armed, not broken.
- **The three local notifications work without Firebase** — daily reminder
  (`use-dagelijkse-herinnering.ts`), streak warning (`use-streak-herinnering.ts`, scheduled
  forward because the day it must fire is a day without the app), and milestones
  (`use-prestaties.ts`).
- **Achievement announcement is built as designed**: foreground = `PrestatieMelding` strip,
  background = local notification, and tapping the strip opens `AchievementUnlockModal` — both
  mounted once in `src/app/_layout.tsx` (lines 78 and 83).

### What's missing / broken

- **`google-services.json` absent** → `push.beschikbaar` is `false`, so no FCM token is ever
  produced and `use-push-registratie.ts` registers nothing. `npm run check:push` reports this as
  the single missing item; everything else it checks (both Firebase packages at ^26.2.0,
  `expo-notifications` ~57.0.10, `expo-device`, the notification icon, both Supabase env vars)
  passes.
- **No Firebase service account.** `send-push` signs an RS256 JWT for Google's OAuth2 HTTP v1 API
  and needs three secret values that do not exist yet.
- **Vault secret `service_role_key` not created** → the hourly sweep never calls out.
- **`user_devices` = 0 rows and `notifications_sent` = 0 rows.** This is the honest bottom line:
  the FCM half of this feature has never been exercised end-to-end, on any device.
- **Nothing has been tested on real hardware.** An emulator without Play services cannot receive
  FCM, and the milestone strip uses Reanimated, which is unreliable on web — so neither preview
  environment can validate this.

### Files

`src/lib/push.ts` · `src/hooks/use-push-registratie.ts` · `use-dagelijkse-herinnering.ts` ·
`use-streak-herinnering.ts` · `use-melding-toestemming.ts` · `src/constants/notificaties.ts` ·
`src/store/notificatie-store.ts` · `src/components/notification-preferences.tsx` ·
`daily-reminder-settings.tsx` · `supabase/functions/send-push/` · `supabase/functions/push-sweep/`
· `supabase/README-push.md` · `scripts/check-push-setup.mjs`

---

## 4. SETTINGS & EMAIL — ✅ COMPLETE

### What works — each checklist item verified individually

- **Theme icon size reduced** — `settings.tsx:250`, `size={18}`. This is the only explicit icon
  size in the file.
- **App icon shows a "Soon" placeholder** — `settings.tsx:290-297`, with a deliberate deviation
  worth preserving: it does *not* use the generic `nogNiet()` helper. The comment explains why —
  for this row the reader's question is *what* is coming, and a bare "Soon" reads like a broken
  button.
- **Notification toggles** — present, and structured on purpose:
  - `ALTIJD_AAN_SLEUTELS = ['herinneringAan', 'streakAan', 'prestatiesAan']` — daily reminder,
    streak warning and achievements are **locked on**, displayed as "Always on", with every entry
    path (persist `merge`, the v1 migration, `voegServerVoorkeurenSamen`, and guards inside
    `setHerinnering`/`zetPushVoorkeur`) forcing them back to `true`. The reader's way out is
    Android's per-channel control, which the section footnote points at.
  - `SERVER_CATEGORIEEN = ['terugkeerAan', 'aanbevelingenAan']` — real `Switch`es, default off.
  - ⚠️ **Note:** `notification-preferences.tsx:127` returns `null` when `!push.beschikbaar`.
    Since Firebase is not configured, **the two switchable categories are currently invisible** —
    correct behaviour (a switch for something that cannot fire is a lie), but it means the
    settings screen today shows no push toggles at all.
  - Reminder time picker is deliberately not `@react-native-community/datetimepicker` (native +
    absent on web, which is where this project previews).
- **Email preference defaults are exactly as specified** — `email-voorkeur-store.ts:52-56`:
  `nieuwsbrief: true`, `nieuweVerhalen: true`, `tips: true`, `aanbiedingen: false`.
  The store documents the legal weight of that choice: a pre-ticked box is not valid GDPR consent
  (art. 4(11)/7), and the only ground that can carry this default is soft opt-in — own, similar
  content, **with an unsubscribe link in every mail**. That link is a precondition, not a
  nice-to-have. No mail is sent yet and the section footnote says so.
- **Usage statistics always ON** — `analytics-preferences.tsx:35` renders the value as
  `instellingen.altijdAan`; there is no switch and nothing sets consent to `false`.
- **Six sections** render: Account, Weergave, Abonnement, Support, App, Gevaar.

### Caveats (correct behaviour, but visible as "Soon" to a user)

Four rows are gated behind flags that are still `false`, so they render as "Soon" rather than as
dead links — the intended design, but worth knowing before a release build:

| Row | Flag | Value |
|---|---|---|
| Rate app | `APP_IS_GEPUBLICEERD` | `false` |
| Terms of service | `voorwaardenZijnGepubliceerd` | `false` (placeholder URL) |
| Privacy policy | `privacyBeleidIsGepubliceerd` | `false` (placeholder URL) |
| Change password | — | permanent "Soon", no flow exists |

`supportEmailIsIngesteld` is **`true`** (`businessthedemoreagency@gmail.com`), so Contact support
and Request my data are live mailtos.

### Files

`src/app/profiel/settings.tsx` · `src/components/settings-section.tsx` ·
`notification-preferences.tsx` · `daily-reminder-settings.tsx` · `email-preferences.tsx` ·
`analytics-preferences.tsx` · `src/store/email-voorkeur-store.ts` · `src/store/notificatie-store.ts`
· `src/constants/app-info.ts` · `src/constants/juridisch.ts`

---

## 5. PROGRESS SCREEN — ✅ COMPLETE

### What works

`src/app/(tabs)/voortgang.tsx` composes exactly three sections, and each delivers what the
checklist asks:

- **4 stat cards** — `progress-stats-header.tsx` builds a `StatKaart[]` of streak, chapters,
  stories, characters. Zero is treated as an empty state, not a "0": the flame icon switches to
  `flame-outline` and `theme.inactive` when the streak is 0.
- **6 era bars** — `era-progress-bars.tsx:37` maps `getActieveTijdperken()`. All six eras have
  `actief: true`, so all six render.
- **14 badges** — `achievements-grid.tsx:98` maps `PRESTATIES` (14 entries), each tile carrying
  `behaald`, the current counter value, plus a section header with an unlocked count and a points
  total against `MAXIMALE_PUNTEN`.
- **Data comes from the correct stores** — this is where the audit specifically checked for the
  known B6 bug class, and the code is right:
  - chapters use `telVoltooideHoofdstukken(hoofdstukVoortgang)` from `story-progress-store`,
    **not** `voortgangStore.bekekenIds` (which counts stories *opened*);
  - the streak comes from `useStreak()`, **not** the stored `state.streakDagen`, because a streak
    expires by the passage of time rather than by a state change;
  - the achievements grid derives its unlocked set from the live counters
    (`behaaldePrestaties(stand)`), **not** from `achievement-store` — which lags whenever a fresh
    unlock has not yet been pushed, and a points counter that freezes for two seconds after
    completing a chapter reads as a bug.

### What's missing

Nothing identified.

### Files

`src/app/(tabs)/voortgang.tsx` · `src/components/progress-stats-header.tsx` ·
`era-progress-bars.tsx` · `achievements-grid.tsx` · `src/hooks/use-streak.ts` ·
`src/store/story-progress-store.ts`

---

## 6. ACHIEVEMENTS SYSTEM — ✅ COMPLETE

### What works

- **The database matches the code exactly.** `public.achievements` holds **14 rows**;
  `src/constants/prestaties.ts` holds **14 entries**. Every id, category, threshold and point
  value lines up:

  | Category | Achievements |
  |---|---|
  | `hoofdstukken` | 1 (10p), 10 (25p), 25 (50p), 50 (100p), 100 (250p) |
  | `verhalen` | 1 (20p), 5 (75p), 10 (150p) |
  | `personages` | 3 (30p), 10 (100p) |
  | `streak` | 3 (15p), 7 (40p), 30 (150p), 100 (500p) |

  `naam_en` is populated server-side for text the *server* composes; the app never reads that
  column and uses `prestatie.namen` from i18n.
- **Unlock logic is derived, not tracked.** No fifth counter — a milestone is a statement about
  progress that already lives in synced stores. What is persisted is only *which has been
  announced*, plus the `geinitialiseerd` flag, which is the single most important field in the
  feature: without it, a reader who installs this version with 50 chapters behind them gets six
  congratulations on first launch. `meet()` waits for all four stores to hydrate first — measuring
  before AsyncStorage is read would record "zero milestones" as the baseline and hand back the
  reader's entire history as notifications, exactly what the flag prevents. At most one is
  announced per measurement; the rest are written silently.
- **The modal pops up on unlock, and is mounted once.** `AchievementUnlockModal` hangs in
  `src/app/_layout.tsx:83`, driven by `prestatie-store.detailId`, because two entry points lead to
  it (the strip and every grid tile). Two copies could stack.
- **Share works, with honest result handling.** `constants/deel.ts` returns
  `'gedeeld' | 'gekopieerd' | 'afgebroken' | 'niet-mogelijk'` and never throws; on web it falls
  back `navigator.share` → clipboard → nothing. **Only `gedeeld` and `gekopieerd` set the `shared`
  flag** (`achievement-unlock-modal.tsx:113-115`) — a dismissed share sheet is not a share.
  `user_achievements` correctly carries an **UPDATE** policy alongside INSERT; without it the
  upsert of an existing row would touch zero rows *without error* and the flag could never be set.
- **All four languages are complete.** Verified key-by-key: `prestatie.namen` contains all 14 ids
  in `en.ts`, `nl.ts`, `fr.ts` **and** `de.ts` — no language is under-translated here. The type is
  `Record<PrestatieId, string>`, so a milestone without a name is a compile error.
- **`achievement-store` is the fifth entry in `SYNC_STORES`** (`use-voortgang-sync.ts:42`),
  following the same contract as the other four. Merge keeps the **earliest** `unlockedAt` and ORs
  the shared flag.

### What's missing

- **`user_achievements` = 0 rows, `achievement_progress` = 0 rows.** The tables, policies and
  sync code exist, but no account has ever written to them. The merge logic, the earliest-date
  rule and the shared flag round-trip are **unverified against real data**.

### Files

`src/constants/prestaties.ts` · `src/hooks/use-prestaties.ts` · `src/store/prestatie-store.ts` ·
`src/store/achievement-store.ts` · `src/components/achievement-unlock-modal.tsx` ·
`prestatie-melding.tsx` · `prestatie-raster.tsx` · `achievements-grid.tsx` ·
`src/constants/deel.ts` · `src/i18n/{en,nl,fr,de}.ts`

---

## 7. GDPR — ⚠️ PARTIAL

### What works

- **Delete account genuinely deletes.** The `delete-account` edge function is **deployed and
  ACTIVE** with `verify_jwt: true`. `useDeleteAccount.ts` calls
  `supabase.functions.invoke('delete-account')`, then `wisLokaleGebruikersgegevens()`, then
  `signOut({ scope: 'local' })`. The design notes why the obvious client-side version fails
  silently: every table has select/insert/update policies and **no delete policy**, and a
  `.delete()` with no matching policy touches zero rows and returns no error — so a client-side
  implementation would report success while deleting nothing. Confirmed in this audit: of 32
  policies across 17 tables, **not one is a DELETE policy.**
- **One `auth.admin.deleteUser`, the rest cascades** — every FK to `auth.users` is
  `on delete cascade`.
- **The function only ever deletes its caller** — the id comes from `auth.getUser(token)`, never
  from the request body.
- **The local wipe is not optional and is correctly scoped.** Progress stores *merge* local into
  server at the next login, so leaving data behind would let the next account on the device
  inherit the deleted reader's chapters and upload them. Language, theme, the reminder and the
  analytics consent deliberately stay — they describe the device, and silently re-enabling a
  measurement someone turned off would be worse.
- **Data export is a mailto, on purpose** — Settings → Request my data prefills subject and body
  to `SUPPORT_EMAIL`, which **is** configured, so the row is a live link rather than a "Soon"
  badge. What GDPR requires is a route that arrives and an answer within 30 days; these are
  handled by hand.
- **The privacy policy text is up to date** — `docs/privacy-policy.html` covers the account,
  progress sync, poll/choice answers, feedback and Firebase Analytics including the IP-derived
  approximate location. `docs/README.md` carries the matching Data Safety answers.

### What's missing / broken

- **🚩 The privacy policy is not published.** `PRIVACY_BELEID_URL` in
  `src/constants/juridisch.ts` is still
  `https://GITHUB-GEBRUIKERSNAAM.github.io/REPONAAM/privacy-policy.html`, so
  `privacyBeleidIsGepubliceerd` is `false` and Settings renders the row as "Soon" instead of a
  link. **Google Play requires a publicly reachable privacy-policy URL for every app** — this is a
  release blocker, and nothing in the code fails when it is wrong, so it is only ever caught by
  reading it.
- **Terms of service do not exist as a document.** `VOORWAARDEN_URL` is a placeholder too, and
  unlike the privacy policy there is no written page behind it — the text exists only as a
  sentence on the signup screen.
- **The privacy policy does not name Supabase's processing region.** Fill this in before
  publication if an explicit EU-transfer clause is wanted.
- **Analytics consent has no switch, which raises the Data Safety bar.** Because the toggle was
  removed, the three Analytics rows must be declared **Required** rather than Optional. Weigh this
  before an EU release; re-enabling the switch is one component.

### Files

`supabase/functions/delete-account/` · `src/hooks/useDeleteAccount.ts` ·
`src/store/lokale-gegevens.ts` · `src/app/profiel/settings.tsx` · `src/constants/juridisch.ts` ·
`src/constants/app-info.ts` · `docs/privacy-policy.html` · `docs/README.md`

---

## 8. SUPABASE INTEGRATION — ✅ COMPLETE

### What works

- **Auth** — `src/lib/supabase.ts` is the only client; keys come from `.env.local` with the
  required `EXPO_PUBLIC_` prefix (both present and verified by `check:push`). Login and signup work;
  `AuthPoort` in the root layout is a single redirect gate rather than a second navigator, so a
  deeplink into `/verhaal/...` is covered too. Signup with email confirmation correctly yields a
  user but no session, and the store stays empty rather than letting the gate through with every
  query returning 401.
- **All 17 tables exist, and RLS is enabled on all 17** — no exceptions:

  `profiles` · `voortgang` · `story_progress` · `character_unlocks` · `feedback` ·
  `story_quizzes` · `story_polls` · `story_choices` · `poll_responses` · `user_choices` ·
  `user_devices` · `notification_preferences` · `notifications_sent` · `story_catalog` ·
  `achievements` · `user_achievements` · `achievement_progress`

- **32 policies**, and the pattern is right where it matters: write policies on user data are
  `auth.uid() = user_id` rather than `auth.role() = 'authenticated'` — the latter only checks
  *that* you are logged in, not *who* you are, which would have let anyone insert rows under
  someone else's `user_id` and stuff a poll.
- **3 edge functions deployed and ACTIVE** — `delete-account`, `send-push`, `push-sweep` (v2).
- **5 stores sync**, all through the one `SYNC_STORES` list in `use-voortgang-sync.ts`:
  `voortgang-store`, `story-progress-store`, `character-unlock-store`, `notificatie-store`,
  `achievement-store`.
- **Offline sync is wired to real triggers** — NetInfo reconnect, app foreground, and session
  appearance, all driven from that single list. The debounce lives in the stores (one shared 2s
  timer, so eight chapters cost one upsert); the offline queue is one persisted boolean, because
  state only grows and the latest snapshot supersedes every older one. `isSyncing`/`syncError` are
  kept out of storage by `partialize` — a persisted `isSyncing: true` would deadlock every future
  sync.
- **Sync waits for hydration** (`wachtOpHydratie`) — pushing before AsyncStorage is read would
  upload empty state and wipe the server row.
- **Login merges rather than overwrites**, which is what carries pre-signup progress into an
  account.
- **Real data confirms the path works end to end**: `profiles` 1, `voortgang` 1,
  `story_progress` 3, `character_unlocks` 1, `poll_responses` 1, `user_choices` 1, `feedback` 1.

### What's missing

Nothing structural. Coverage is partial by design — language, theme, avatar (`profile-store`),
email preferences (`email-voorkeur-store`) and the daily story counter (`abonnement-store`) remain
device-local. The `profiles` row has `language`/`theme` columns nothing writes yet, and no avatar
or email column at all (a photo avatar would also need Storage for the bytes).

### Files

`src/lib/supabase.ts` · `src/store/auth-store.ts` · `src/hooks/useAuth.ts` ·
`src/hooks/use-voortgang-sync.ts` · `src/store/sync-hulp.ts` · all five syncing stores ·
`src/app/_layout.tsx` · `supabase/functions/`

---

## CROSS-CUTTING FINDINGS

### ~~🚩 `npm run lint` is not clean — 7 errors, 1 warning~~ — **FIXED**

`npx tsc --noEmit` passes (exit 0) and `npm run validate:content` passes, but lint does not:

| File | Issue | Live? |
|---|---|---|
| `src/components/tijdperken-carousel.tsx:39` | "Cannot access refs during render" ×5 + a refs warning at line 42 | **Orphaned** (superseded by `tijdperk-rij.tsx`) |
| `src/hooks/use-color-scheme.web.ts:11` | `react-hooks/set-state-in-effect` — setState synchronously in an effect | **Live** (web only) |
| `src/app/(tabs)/_layout.tsx:21` | `react/display-name` — component definition missing display name | **Live** |
| `src/components/tijdperk-kaart.tsx:11` | `theme` assigned but never used (warning) | **Orphaned** |

All eight are fixed and `npm run lint` now exits clean. The two orphaned files were repaired
rather than suppressed, because the carousel one was a real bug hiding behind a style rule:
`useRef(new Animated.Value(0)).current` allocated a fresh `Animated.Value` on every render and
threw it away. See "Changes since the audit".

### ~~🚩 Documentation drift: the app has 20 stories, not 19~~ — **CORRECTED, and the gap closed**

`npm run validate:content` reports **20 stories across 6 eras**. CLAUDE.md says 19 in four places
(lines 20, 78, 193, 660) and 20 in one (line 868). The twentieth is **`ashoka-maurya`**, in
`src/content/verhalen/oudheid/gegenereerd.ts` — an autogenerated story that is fully live: it is
in the era barrel, in `story_catalog`, and it has seeded interactive content.

At audit time it differed from the other nineteen in three ways. **Two are now closed** (see
"Changes since the audit"); one remains:

- ~~No portrait~~ — generated, wired into `CHARACTER_IMAGES`. 20 files, 20 entries.
- ~~No scene images~~ — eight generated, wired into `SCENE_IMAGES`. 160 files = 20 × 8.
- **English only** — still true. Every `VertaaldVeld` on this story has just an `en` key, so
  `v()` falls back to English in NL, FR and DE.

**One claim in the original audit was wrong and is corrected here:** it said Ashoka had "no rich
block types". It has them — `kop`, `weetje`, `sleutelmoment` and `citaat` all appear across its
eight chapters. That was an inference from "autogenerated", not a reading of the file, and
reading it disproved it.

### 🚩 Three monetisation flags are on while Billing is a stub

Verified in source:

| Flag | File | Value |
|---|---|---|
| `ADS_ENABLED` | `ad-banner.tsx:22` | `false` ✅ |
| `PRO_BANNER_ENABLED` | `pro-access-banner.tsx:27` | **`true`** 🚩 |
| `VERHAAL_LIMIET_ENABLED` | `monetisatie.ts:30` | **`true`** 🚩 |
| `AD_ONDERBREKING_ENABLED` | `monetisatie.ts:40` | **`true`** 🚩 |

`DAGELIJKSE_VERHAAL_LIMIET` is 2. Together these show an offer that cannot be completed *and* gate
content behind it — a limit that can only be lifted by a purchase that does not exist is a wall
with no door. Fine for development; all three must go to `false` before a production AAB unless
Play Billing has landed.

---

## WHAT ACTUALLY BLOCKS A RELEASE

Distilled from the above, in dependency order. The first was the only build failure and is now
resolved; the rest are policy or honesty failures that a Play reviewer catches.

1. ~~**`google-services.json`** — blocks every build~~ — **resolved 19 Aug 2026, without the
   file.** Firebase now sits behind `EXPO_PUBLIC_FIREBASE_ENABLED` in `.env` (`false` for the
   MVP); `app.config.js` drops the `@react-native-firebase/*` plugins and
   `android.googleServicesFile` when it is off, so `expo prebuild --clean` and EAS builds pass.
   The file is still absent, so Analytics and Push still collect nothing — but that is now a
   *feature* gap, not a *build* failure. Flip the flag to `true` once the file exists.
2. **Publish the privacy policy** and put the real URL in `src/constants/juridisch.ts`. Play
   requires it; the page is already written.
3. **Flip `PRO_BANNER_ENABLED`, `VERHAAL_LIMIET_ENABLED`, `AD_ONDERBREKING_ENABLED` to `false`**
   (or ship real Billing).
4. **Recapture the eight store screenshots** — Fase 8 changed the reader's safe-area inset, the
   chapters-done counter and the streak, so `phone-3/4/7` show a header that no longer exists.
5. *(Push delivery only, not a release blocker)* Firebase service account + the Vault secret
   `service_role_key`. Without them the three local notifications still work; the two server
   categories stay hidden.

---

## AUDIT COMMANDS — reproduce this

```bash
npx tsc --noEmit          # exit 0 — clean
npm run lint              # 7 errors + 1 warning (see above)
npm run validate:content  # OK — 20 verhalen across 6 tijdperken, 0 collecties
npm run check:push        # 1 missing (google-services.json), 1 unchecked (server side)
ls google-services.json   # absent
```

Database, via Supabase MCP against `nxwdhuuouhbmykgykbov`:

```sql
-- table + row inventory
select relname, n_live_tup from pg_stat_user_tables where schemaname='public';
-- policy coverage (note: zero DELETE policies, by design)
select tablename, cmd, count(*) from pg_policies where schemaname='public' group by 1,2;
-- interactive content coverage
select count(distinct story_id) from story_quizzes;   -- 20
select count(distinct story_id) from story_polls;     -- 20
select count(distinct story_id) from story_choices;   -- 18
-- achievements catalogue mirror
select count(*) from achievements;                    -- 14
-- push readiness
select jobname, schedule, active from cron.job;       -- push-sweep-elk-uur, 0 * * * *, true
select count(*) from vault.decrypted_secrets;         -- 0 → sweep inert
```

---

## CHANGES SINCE THE AUDIT

Same day, after the audit was delivered. Four pieces of work; every item below was re-verified
against `npx tsc --noEmit`, `npm run lint`, `npm run validate:content`,
`npm run content:read-times -- --check` and the bundle actually served by Metro.

### 1. Chapter blocks are consistent — all 20 stories now have images

`ashoka-maurya` was the only story without a portrait or scene images, so its chapters rendered as
text where the other nineteen opened with a picture, and its chapter tiles stayed flat grey even
once unlocked. Nine images were generated with Replicate and wired in the ordinary way:

- `assets/images/characters/ashoka-maurya.webp` → `CHARACTER_IMAGES` (now 20 files, 20 entries).
- `assets/images/scenes/ashoka-maurya-1..8.webp` → `SCENE_IMAGES` (now **160** files = 20 × 8).
- Each chapter gained an opening `{ type: 'afbeelding' }` block with `alt` + `bijschrift`, plus
  `Chapter.afbeelding` for the tile — the same double use as every other story.

**The story was moved from `oudheid/gegenereerd.ts` to `oudheid/personen.ts`.** This is the part
that matters for anyone editing it later: the header of every `gegenereerd.ts` says the file is
**rewritten in its entirety** by `npm run generate:batch`, so hand-wiring images into it would have
survived exactly until the next batch run. All six `gegenereerd.ts` files are now empty arrays.

**Prompt-writing note, recorded because it cost three attempts.** The pillar scene
(`ashoka-maurya-6`) first came back as a fluted Greco-Roman column, then — after adding
`no domes, no arches, no classical columns` — as a square pier *with domes in the background*.
This model reads a negation as a subject: naming a thing to forbid it is still naming it. The
version that worked describes only what is present (`cylindrical`, `round`, `flat-roofed mud-brick
huts`). The existing note in `generate-scene-images.mjs` about `STIJL` already containing
"no text, no lettering" is the same lesson from the other direction.

### 2. Milestones removed from Profiel

`<PrestatieRaster />` is gone from `(tabs)/profiel.tsx`; the fourteen badges now live only on
Voortgang, in `achievements-grid.tsx`. The two grids did not just duplicate each other — **they
computed their state differently**: the Profiel grid read unlock records, while the Voortgang grid
derives them from the four live counters and therefore does not lag behind a fresh unlock. A
disagreement between two screens reads as a bug in the app rather than as two sources.

`prestatie-raster.tsx` is now **orphaned** and kept per the no-delete convention, with the reason
in its header. Metro confirms the removal: the module no longer appears in the served bundle at
all.

### 3. Notification settings reduced to the daily reminder

`MeldingenSectie` now renders only the permission row (when permission is missing) and the
reminder's two rows. The streak-warning and milestone rows are gone.

**Both notifications are still always on** — `ALTIJD_AAN_SLEUTELS` still forces `streakAan` and
`prestatiesAan` to `true` along every path that lets state in. What disappeared is the row, not the
notification. An "Always on" line with no control is what makes a reader hunt for a switch that is
not there; Android's per-channel setting is the real off switch, and the section footnote points at
it.

**The daily reminder got its switch back**, which was a change in the opposite direction and is the
reason `ALTIJD_AAN_SLEUTELS` is down to two keys:

- `herinneringAan` removed from `ALTIJD_AAN_SLEUTELS` / `ALTIJD_AAN`.
- `setHerinnering(false)` is a valid call again (its `if (!aan) return` guard is gone).
- `voegServerVoorkeurenSamen` reads `daily_reminder_enabled` from the server again — it is a
  preference belonging to the account, like its time.
- `HerinneringRegel` renders a real `Switch`; `HerinneringTijd` returns `null` when the reminder is
  off, after its hooks, so the hook order cannot shift when the switch is thrown.
- The persist `version` stays at **1**: an install on v1 already has `true` and keeps it as its
  starting position, while a pre-v1 install keeps whatever it stored — so a reader who once
  switched the reminder off does not get it back unasked.

The rationale is the asymmetry: the reminder fires *every day* and is the one a reader is most
likely to want gone, so sending them to the OS for it is the wrong trade. The streak and milestone
notes are occasional consequences of their own reading.

`useDagelijkseHerinnering` still does **not** flip the preference off when system permission is
missing — it only cancels the schedule. Changing the reader's stored choice on their behalf turns
a system-level problem into a silent edit of their settings.

### 4. `npm run lint` fixed — now clean

All 7 errors and the 1 warning are gone. Two were live files and two were orphaned; the orphaned
ones were repaired rather than suppressed, because one was a real bug:

| File | Was | Fix |
|---|---|---|
| `components/tijdperken-carousel.tsx` | `useRef(new Animated.Value(0)).current` — read a ref during render **and allocated a throwaway `Animated.Value` every render** | `useState(() => new Animated.Value(0))` |
| `hooks/use-color-scheme.web.ts` | `useState(false)` + `useEffect(() => setHasHydrated(true))` hydration flag | `useSyncExternalStore(subscribe, () => true, () => false)` |
| `app/(tabs)/_layout.tsx` | factory returning an anonymous arrow component | named inner `TabBarIcon` |
| `components/tijdperk-kaart.tsx` | unused `theme` | removed, with its now-unused import |

### Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run lint` | **clean** (was 7 errors + 1 warning) |
| `npm run validate:content` | OK — 20 verhalen, 6 tijdperken |
| `npm run content:read-times -- --check` | OK — all 20 already correct |
| Image coverage | 160 scenes (20×8), 20 portraits — no gaps |
| App boots (headless Chrome, Metro on :8082) | splash renders, no runtime error |
| `prestatie-raster` in served bundle | **absent** — nothing imports it |
| `achievements-grid` in served bundle | present |
| `HerinneringRegel` in served bundle | reads `herinneringAan` + `setHerinnering`, renders a control |
| `VASTE_CATEGORIEEN` in served bundle | an exported constant only — no longer mapped to rows |

**Not verified visually:** the three screens themselves. Everything past the splash sits behind
`AuthPoort`, which needs a login this session did not have, so Voortgang / Profiel / Settings were
confirmed through the source and the served module graph rather than by looking at them. A
logged-in pass is the one step still outstanding.

**Note on the dev server:** a stale Metro from an earlier session still holds port **8081** (node
PID 25064, started 14:34). It was left running rather than killed, and the verification above used
a fresh server on **8082**. That stale server serves an older build — the exact hazard CLAUDE.md
warns about — so it is worth stopping before the next preview.
