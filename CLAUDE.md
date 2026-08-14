# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # install dependencies
npx expo start                 # dev server (press w/a/i, or use one of the scripts below)
npm run web                    # dev server, web target
npm run android                # dev server, Android
npm run ios                    # dev server, iOS
npx tsc --noEmit               # type-check the whole project — run this after any change
npm run lint                   # expo lint
npm run validate:content       # structural check of src/content/verhalen/**, collecties.ts
npm run content:read-times     # rewrite Verhaal.leestijdMinuten from the real word count
npm run content:read-times -- --check   # same, dry run — exits 1 if any story is stale
npm run generate:map-data      # regenerate src/constants/map-data.ts (orphaned feature, see below)
npm run generate:images:r9     # Replicate portrait generation (R9, not wired into the app yet)
npm run generate:images:scenes # Replicate scene generation, one per chapter (all 19 stories)
npm run generate:batch         # orchestration-controller.mjs batch content/image runs
npm run generate:store-assets  # store/assets/ icon-512.png + feature-graphic.png (see "Store assets")
npm run generate:notification-icon # assets/images/notification-icon.png (white-on-transparent, 96px)
npm run check:listing          # count store/listing.md copy against Play's limits (--check = dry run)
npm run build:android:preview  # EAS APK build for your own device (needs `npx eas login` first)
npm run build:android:prod     # EAS AAB build for Play
npm run submit:android         # eas submit → internal testing track
```

There is no test suite in this repo — don't invent test commands. `npx tsc --noEmit` is the
primary correctness check and should be run before considering a change done. When editing
content (`src/content/verhalen/**`, `collecties.ts`), also run `npm run validate:content` — see
`CONTENT-SCHEMA.md` for the schema/style rules it checks against.

**Content verification procedure** (after writing new stories):
1. `npx tsc --noEmit` (all types must pass)
2. `npm run validate:content` (all content must validate)
3. Start the dev server (`npm run web`)
4. Navigate to each new story → chapters overview lists all 8 chapters → open chapter 1 → read to
   the end → "Mark Complete" → next chapter tile unlocks → open it and repeat for at least one
   more chapter. Content is not "done" until chapter navigation is verified end-to-end.
   (There is no quiz step — quizzes were removed from the app; see "Data model".)

**Metro's file watcher does not fire on this project.** The repo lives on `G:`, and edits made
while `expo start` is running are not picked up — the dev server keeps serving the bundle it built
at startup, so you verify your change and see the *old* code. It looks exactly like your edit
didn't work. Restart with `npx expo start --web --clear` after every edit you want to see, and if
a result surprises you, confirm what is actually being served before believing it:

```bash
curl "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.routerRoot=src%2Fapp" | grep <something-you-just-wrote>
```

Also check the port: `expo start` silently falls back ("Port 8081 is being used by another
process… Skipping dev server" under `CI=1`), and a stale server from an earlier session will
answer on 8081 and serve a completely different build.

Web preview quirk: **`experiments.reactCompiler` in `app.json` is deliberately set to `false`.**
It was `true` originally, but it miscompiles custom hooks that return more than one plain
function value — `useVertaling()` returns `{ t, v, ... }` and calling `v(...)` threw
`TypeError: v is not a function` at runtime (TypeScript was clean; this only showed up in the
browser). Reproduce with `npx expo start --web --clear` before re-enabling it, and re-test the
hook-heavy screens (Ontdek, Voortgang) if you ever flip it back on.

**File deletion (`rm`, `Remove-Item`) is blocked by `.claude/settings.json`.** Superseded code is
therefore left in place rather than deleted, usually as a one-line re-export shim or a stub with a
comment. This convention is load-bearing — see "Shim files" and "Orphaned code" below.

## Assets & Media

Image assets live in **`assets/images/`**. Use paths like `./assets/images/app-icon.png` (NOT
`./src/assets/logo/`). `app.json` references four of them: `app-icon.png` (`icon` + `ios.icon`),
`app-icon-adaptive.png` (Android adaptive foreground), `app-favicon.png` (web) and
`app-splash.png` (the `expo-splash-screen` plugin).

`assets/images/characters/*.webp` holds the 19 story portraits; they **are** wired up — see
"Images" below.

Unreferenced by any code or config right now: `chronicles-logo.webp`, `icon.png`, `favicon.png`,
`splash-icon.png`, `logo.svg`, `android-icon-*.png`, `assets/expo.icon/**` and `assets/flags/*.svg`
(only consumer is orphaned `flag.tsx`).

### Brand mark (`assets/images/mascotte/`)

**The logo is a hand-built SVG, not generated art.** `assets/images/mascotte/` holds the source —
an open book with an `H` — plus a `preview.html` that shows every variant at real UI sizes, and
its own README with the full story. The three that matter:

- `history-book.svg` — mark only, **drawn in `currentColor`**, so it follows the theme. This is
  the one the app imports (`splash-screen.tsx`), with `color={theme.accent}`.
- `history-book-teal.svg` — cream on a teal tile, full bleed. The **icon** source.
- `history-book-compact.svg` — same drawing minus the outer cover line and the clasp, scaled up so
  the line weight survives below ~40 px. Nothing uses it yet; it exists for when the mark lands
  next to a button.

`react-native-svg-transformer` is wired up in `metro.config.js` and `src/types/svg.d.ts` declares
`*.svg`, so `import Mark from '@/assets/images/mascotte/history-book.svg'` yields an
`FC<SvgProps>`. `@/assets/*` maps to `./assets/*` (a second tsconfig path, separate from `@/*` →
`./src/*`).

**Regenerating the icon** is a two-step pipeline, because `derive-icon-variants.mjs` takes a PNG:

1. Render `history-book-teal.svg` to a 1024×1024 PNG (headless Chrome, same approach as
   `generate-store-assets.mjs`) into `assets/images/icon-candidates/`.
2. `node scripts/derive-icon-variants.mjs assets/images/icon-candidates/<that>.png` — writes
   `app-icon.png`, `app-icon-adaptive.png` and `app-favicon.png`, sampling the flat teal
   background from the corners.
3. `npm run generate:store-assets` — `store/assets/icon-512.png` is a 2× downscale of
   `app-icon.png`, and `store/feature-graphic.html` embeds `app-icon.png`, so both follow.

`scripts/generate-app-icon.mjs` (the Replicate prompt that produced the *old* icon) is now dead
weight — the icon is vector-sourced. Don't run it expecting the current mark.

**`currentColor` only resolves when the SVG is inlined.** Rendering `history-book.svg` through an
`<img src>` gives you a black mark, because the img is an isolated document. Any script that
renders it to PNG has to inline the markup into the page and set `color` on a wrapper.

## Architecture

Expo Router app (file-based routing under `src/app`, TypeScript, Zustand for state,
AsyncStorage for persistence). Three bottom tabs (`src/app/(tabs)/`): index (label "Home"),
Voortgang (Progress), Profiel (Profile). The `ontdek` and `kaart` routes are still registered in
`(tabs)/_layout.tsx` with `href: null` so Expo Router doesn't surface them.

Stack screens outside the tab group (`collectie/[id]`, `tijdperk/[id]`, `verhaal/[id]/*`) share a
custom `AppHeader` (`src/app/_layout.tsx`) but usually hide its title (`options={{ title: '' }}`)
in favour of their own coloured header block, so the back chevron still comes from `AppHeader`.

**`src/app/verhaal/[id].tsx` is a redirect, not a screen** — it marks the story as seen and
`router.replace`s to `/verhaal/[id]/chapters`. The real screens are `verhaal/[id]/chapters.tsx`
(chapter grid) and `verhaal/[id]/reader.tsx` (chapter reader).

### Data model (`src/constants/types.ts`)

`Tijdperk` (era) is the only structural grouping the live UX uses. `Continent`/`Regio` still exist
as types and data but are read only by orphaned code.

`Tijdperk` has `actief: boolean` — only eras with content show a row on Home
(`getActieveTijdperken()` in `src/constants/tijdperken.ts`). All six are currently `true`.

`Verhaal` is the figure or event itself:
- `soort: 'persoon' | 'gebeurtenis'`, `personage: { naam }`, `jaar`, `periodeLabel`, `themas`,
  `leestijdMinuten`
- `titel` / `ondertitel` / `teaser` (all `VertaaldVeld`)
- `afbeelding?` (portrait URL — **is** rendered, see "Images") with `portretKleur` as the
  solid-colour fallback
- `uitgelicht?` (Home hero eligibility), `volgorde?` (order within its era, used by
  `getUitgelichteVerhalenVoorTijdperk`)
- `tijdperkId` — a story belongs to exactly one era
- **`chapters: Chapter[]`** — this is where the content lives. `Verhaal` has no `blokken` field.

`Chapter` = `{ id: number; titel: VertaaldVeld; afbeelding?: ImageSourcePropType; blokken: Blok[] }`,
8 chapters per story by convention. `Chapter.afbeelding` **is** read — `HoofdstukTegel` draws it
behind the Roman numeral, but only once the chapter is unlocked (see "Images").

`Blok` is a tagged union of **`tekst` | `afbeelding` | `citaat` | `kop` | `weetje` |
`sleutelmoment`**, rendered by `src/components/blok-weergave.tsx`. The last three were added in
LAUNCH-PLAN.md B3 (subheading, "did you know" callout, year-in-the-margin). **Adding a variant
touches four places**: `types.ts`, a branch in `blok-weergave.tsx`, a `case` in
`scripts/validate-content.mjs` (its `default` errors on unknown types, deliberately), and
`telWoordenInBlok` in `src/content/leestijd.ts` if the block shows readable text — otherwise its
words silently vanish from the read time.

`{ type: 'afbeelding' }` carries **`bron: ImageSourcePropType`** (a bundled `require()`, not a
URL) plus `alt` and an optional `bijschrift`. `sleutelmoment` carries a plain `jaar: number`;
negative means BC, and the "753 BC" / "753 v.Chr." formatting lives in i18n (`blok.jaarLabel`),
not in the component.

**There is no `quiz` variant** — quizzes were removed from the app; `verhaal/[id]/quiz.tsx` and
`verhaal/[id]/chapter-quiz.tsx` are "Quiz verwijderd" tombstone screens, and
`scripts/validate-content.mjs` still carries a dead `case 'quiz'` branch that nothing can trigger.

`Collectie` is a curated cross-cutting list of `verhaalIds`. **`src/content/collecties.ts`
currently exports an empty array**, so Home's "Storylines" row and `collectie/[id]` render nothing.

All user-visible text fields (`titel`, `naam`, `periode`, `korteBeschrijving`, `teaser`,
`ondertitel`, and every string inside `Blok`) are typed `VertaaldVeld = { en: string; nl?; fr?;
de? }`, not plain `string`. Resolve them with `v()` from `useVertaling()`, never by reading `.en`
or a language key directly — real content is still English-only, and `v()` is the fallback.

**Do not rename data-model identifiers** (`Verhaal`, `Tijdperk`, `Blok`, `Chapter`, `Collectie`,
…) — internal code stays Dutch by convention; only user-facing *strings* go through i18n.

### Content files & shim files

Real story content lives in **`src/content/verhalen/<tijdperk-id>/personen.ts`** (plus
`oudheid/gebeurtenissen.ts`), with a per-era `<tijdperk-id>/index.ts` barrel. 19 stories total:
Oudheid has 4, the other five eras 3 each.

Two layers of shims sit on top, both artefacts of the no-delete rule. Node/TS resolve a file
before a same-named directory, so:

- `src/content/verhalen.ts` → one line, `export * from './verhalen/index'`
- `src/content/verhalen/<tijdperk-id>.ts` → one line, `export * from './<tijdperk-id>/index'`

**Editing `middeleeuwen.ts` edits a one-line re-export, not content.** Write content in
`middeleeuwen/personen.ts`. Import from `@/content/verhalen` as normal — it resolves through both
shims to `src/content/verhalen/index.ts`, which concatenates the eras and exposes
`getVerhaal`/`getVerhalenByTijdperk`.

`src/content/leestijd.ts` is the single source of truth for word counts and read time (250 wpm).
Both the chapter tiles (`chapters.tsx`) and `scripts/recalculate-read-times.mjs` use it, so
`Verhaal.leestijdMinuten` can never drift from the tiles again. It takes a `VeldResolver` argument
rather than reading `.en` itself — pass `v()` from `useVertaling()` in the app, `(veld) => veld.en`
in Node scripts. **After adding or editing chapter text, run `npm run content:read-times`.**

**The content files are CRLF.** A script that rewrites them (or inserts blocks) must detect and
reuse the file's line ending — writing `\n` into `oudheid/personen.ts` leaves a file with mixed
endings and a diff that touches every line you added. `oudheid/gebeurtenissen.ts` also puts a whole
chapter on one line while `personen.ts` spreads each block over several, so anything doing string
surgery has to handle both layouts.

`src/content/queries.ts` holds derived lookups (`getUitgelichtVerhaal`, `getNieuwToegevoegd`,
`getVolgendVerhaal`, `getTijdperkVoortgang`, `getUitgelichteVerhalenVoorTijdperk`, collection
queries) — add cross-cutting queries there rather than inline in screens.

### Auth (Supabase, R8.AUTH)

`src/lib/supabase.ts` is the only client; the keys come from `.env.local` and **need the
`EXPO_PUBLIC_` prefix** (babel inlines only those). Missing keys throw at import, on purpose.

- `src/store/auth-store.ts` holds `user`/`profiel`/`isLoading`/`error` **in memory** — deliberately
  not `persist`ed, because supabase-js already keeps the session in AsyncStorage and two copies
  drift apart the moment a token expires.
- `src/hooks/useAuth.ts` exports the standalone `login` / `signup` / `logout` **and** the
  `useAuth()` hook. The hook also mounts the `onAuthStateChange` listener, so **it is called once,
  in the root layout** — screens import the loose functions instead, or read `useAuthStore`
  directly.
- **Signup with e-mailbevestiging aan gives a user but no session.** `signup()` then leaves the
  store empty (`bevestigingNodig: true`) and the screen shows "check your mail"; filling the store
  would let the gate through with every query returning 401. The username rides along in
  `user_metadata` so `herstelSessie` can still create the `profiles`/`voortgang` rows at the first
  real login.
- **`AuthPoort` in `src/app/_layout.tsx` is the gate**: it renders nothing and only `replace`s to
  `/login` (no session, off the auth screens) or `/` (session, on them). One redirect instead of
  two navigators — the route tree is file-based, so a second `<Stack>` would re-register the same
  files, and this way a deeplink into `/verhaal/...` is covered too. While `isLoading` is true a
  full-screen `SessieLaadscherm` sits over the Stack so Home never flashes before the redirect.
- `src/app/login.tsx` / `src/app/signup.tsx` share `auth-veld.tsx`, `auth-knop.tsx` and
  `constants/auth-validatie.ts` (min. 6 chars, strength = length only). "Forgot password?" is a
  stub — no `resetPasswordForEmail` flow yet.
- Uitloggen staat onderaan Profiel. It does **not** clear local reading progress (that lives in
  AsyncStorage per device), and the dialog says so; don't reword it into a warning that isn't true.
  `Alert` doesn't exist in react-native-web, so the handler falls back to `window.confirm`.

### Voortgang sync (R8.AUTH deel 3)

`voortgang-store` mirrors itself into `public.voortgang`. Everything else still lives only on the
device — see "Known gaps".

- **The debounce lives in the store, the triggers live in a hook.** Every mutating action calls
  `plandeSync()`, which pushes one shared 2-second timer forward, so eight chapters in a row cost
  one upsert. `useVoortgangSync()` in the root layout owns the cases where nothing changed but a
  push is still due: a session appears, NetInfo reports a reconnect, or the app returns to the
  foreground. Mount it once, next to `useAuth()`.
- **Column names are lowercase** (`bekekenids`, `gelezenids`, `completedstories`,
  `laatsteactiviteitdatum`). Postgres folded the camelCase identifiers when the table was created,
  and supabase-js quotes whatever you type, so `bekekenIds` is a "column does not exist" error.
  `streakstartdate` is a leftover from deel 1 and is **not** `laatsteActiviteitDatum` — nothing
  reads it.
- `voortgang` now has a **unique index on `user_id`**, so writes are one `upsert(…, { onConflict:
  'user_id' })`. Without it Postgres cannot do `on conflict` at all and two racing syncs leave two
  rows.
- **Login merges, it does not overwrite.** `voegServerVoortgangSamen` unions the three sets and
  keeps the streak with the most recent `laatsteActiviteitDatum`. The sets only ever grow, so a
  union can't lose anything — and it is what carries progress made *before* signing in into the
  account. Don't "simplify" it back into an assignment.
- **Sync waits for `persist` to hydrate** (`wachtOpHydratie`). Pushing before AsyncStorage has been
  read uploads the empty initial state and wipes the server row.
- **The offline queue is one boolean**, `heeftOnverzondenWijzigingen`, persisted across restarts.
  A failed sync leaves it set and the next trigger retries; nothing is buffered, because the state
  only grows and the latest stand supersedes every older snapshot. `isSyncing` / `syncError` are
  kept *out* of storage by `partialize` — a persisted `isSyncing: true` would deadlock every future
  sync.
- `SyncIndicator` on Profiel renders the status. It shows amber "offline, will sync later" rather
  than red: nothing is lost and the retry is automatic.

`theme.ts` gained `gevaar` / `waarschuwing` / `succes` for form errors and the strength meter —
use those, not a hardcoded red.

### Reading progress & character unlocks

- `src/store/story-progress-store.ts` + `src/hooks/use-story-progress.ts`: per-chapter progress,
  Zustand + AsyncStorage, persists across restarts. Chapters unlock sequentially. Read time is
  derived from word count (words ÷ 250).
- `src/store/character-unlock-store.ts` + `src/components/character-unlock-modal.tsx`: finishing a
  story unlocks its `personage`; the modal announces it with a spring-in portrait, glow ring,
  radial pulse and a haptic. **Unlocking is an explicit action, not automatic** — completing the
  last chapter turns the reader footer into an "Unlock &lt;name&gt;" button, and
  `handleUnlockCharacter` is the only thing that calls `unlockCharacter` +
  `voortgangStore.markStoryCompleted`. The auto-unlock effect that used to pre-empt that button
  was removed in B4; the comment where it stood explains why.
- `src/components/character-grid.tsx`: the Profiel collection grid — 70px circles, 3 columns,
  unlocked = teal + checkmark (tappable, navigates to the story), locked = grey "?".
- `src/store/voortgang-store.ts` is the older story-level seen/streak store; still live and
  separate from `story-progress-store`.
- **`telVoltooideHoofdstukken(progress)`** in `story-progress-store.ts` is the only correct source
  for "chapters done". `voortgangStore.bekekenIds` counts *stories opened* — that mix-up was the
  B6 bug on Profiel.

### Streak (`voortgang-store.ts`, `use-streak.ts`, LAUNCH-PLAN.md B6)

Three rules, all of them the fix for a real bug:

- **Only a finished chapter counts.** `registreerLeesactiviteit()` is called from
  `handleCompleteChapter` in the reader. `markeerAlsBekeken` (opening a story) deliberately does
  *not* touch the streak — you could otherwise build one without reading a word.
- **Dates are local, never UTC.** `datumSleutel()` uses `getFullYear/getMonth/getDate`;
  `toISOString().slice(0,10)` made "tomorrow" start at 22:00 in UTC+2.
- **A streak expires by the passage of time, not by a state change**, so the stored `streakDagen`
  is not what you render. **Read it through `useStreak()`**, which runs `berekenHuidigeStreak()`
  (alive only if the last read day was today or yesterday) and re-evaluates on every return to the
  foreground. A streak of 0 is an empty state, not a "0": Home hides the flame badge and Voortgang
  shows `streakLeeg`.

The store is `persist` **version 1**; the `migrate` clears the phantom `streakDagen: 1` that v0
seeded for users who never read anything.

### Notifications (`src/constants/notificaties.ts`, `use-dagelijkse-herinnering.ts`, B6)

One optional daily reminder at 19:00 local, **off by default**. Same shape as `haptics.ts`:
intents, no throwing, no-op on web.

- **Permission is asked after the first completed chapter**, never at startup — `biedHerinneringAan()`
  from the reader, guarded by `toestemmingGevraagd` in `notificatie-store.ts`. Android shows that
  dialog once per install; spending it on a cold start wastes it.
- **`useDagelijkseHerinnering()` in the root layout is the only thing that schedules or cancels.**
  The notification text is baked in at scheduling time, so the hook depends on the translated
  strings and reschedules on a language switch. It also turns the preference back off if the
  system permission was revoked outside the app.
- One fixed `HERINNERING_ID`, so a re-schedule overwrites instead of stacking a second reminder.
- **The alarm is inexact** (`window=+1h`): `expo-notifications` only uses an exact alarm when
  `SCHEDULE_EXACT_ALARM` is granted, and we deliberately don't request it — that permission needs
  a separate Play declaration.
- **`expo-notifications` drags in Firebase Cloud Messaging and ShortcutBadger** even for purely
  local notifications. The 20 vendor badge permissions are stripped again through
  `android.blockedPermissions` in `app.json` (we never set a badge); FCM's
  `c2dm.permission.RECEIVE` stays and is explained in the privacy policy. **After upgrading the
  package, re-check the merged release manifest** — the command is in `docs/README.md`.
- The notification icon is a **silhouette**: Android repaints every non-transparent pixel. Source
  is `history-book-compact.svg` → `npm run generate:notification-icon`, wired up through the
  `expo-notifications` plugin block in `app.json`. It is a native change, so it needs a prebuild
  plus a rebuild, not a JS reload.

### Images (portretten + scènes — gebundeld, LAUNCH-PLAN.md B1/B2)

Two separate image sets, same pattern: an explicit `require()` map in `src/constants/`, files
named after the id, no remote URLs anywhere in `src/`.

**Portraits** — one per story, `assets/images/characters/<verhaal-id>.webp` →
`CHARACTER_IMAGES` (details below).

**Scenes** — one per chapter, `assets/images/scenes/<verhaal-id>-<chapter-id>.webp` →
`SCENE_IMAGES` in `src/constants/scene-images.ts`. Each scene is used **twice**: as the chapter's
opening `{ type: 'afbeelding' }` block (16:9 `expo-image` with caption) and as
`Chapter.afbeelding`, which `hoofdstuk-tegel.tsx` draws behind the Roman numeral under a 45%
scrim. The tile only shows it when the chapter is **unlocked** — a locked tile stays flat grey, so
unlocking the next chapter literally reveals a picture. **All 19 stories (152 chapters) now have a
scene** — the Oudheid landed in B2, the other 15 in B2b. A chapter without one would just render
text, so nothing breaks if a future story arrives before its images. Generation:
`npm run generate:images:scenes` (`scripts/generate-scene-images.mjs` — same download/`--only`/
`--force` approach as the portrait script, `aspect_ratio: '16:9'`, one shared style suffix, and it
survives a single failed prompt instead of aborting the batch).

All 19 portraits are **local bundled assets**. `assets/images/characters/<verhaal-id>.webp` — the
filename is always exactly the `Verhaal.id` slug — is `require()`d by
`src/constants/character-images.ts`, and every story sets
`afbeelding: CHARACTER_IMAGES['<its-id>']`. `Verhaal.afbeelding` is typed `ImageSourcePropType`,
not `string`. There are no remote image URLs left in `src/`.

Consumers (`verhaal-kaart.tsx`, `verhaal-carousel-kaart.tsx`, `character-grid.tsx`,
`character-unlock-modal.tsx`) render with **`expo-image`** (`contentFit`/`transition`, not RN
`Image`/`resizeMode`), falling back to a `portretKleur` block or `Illustratie` when `afbeelding`
is absent.

`src/constants/generated-images.ts` is now a re-export shim for `CHARACTER_IMAGES` (the 4
expiring `replicate.delivery` URLs are gone); import `CHARACTER_IMAGES` in new code.

Adding a portrait: drop `assets/images/characters/<verhaal-id>.webp`, add the `require()` line to
`CHARACTER_IMAGES` (the map is deliberately explicit, not `require.context`, so a missing file is
a build error rather than a blank card), then point the story's `afbeelding` at it. Generation:
`npm run generate:images:r9` (`scripts/generate-portrait-images.mjs` — downloads the bytes into
`assets/`, supports `--list` / `--only <ids>` / `--force`) and `orchestration-controller.mjs`.

**Node scripts that load the content need `scripts/asset-require-shim.mjs`** — `require()` does
not exist in Node's ESM scope and a `.webp` isn't importable there, so the shim stubs `require` to
return the path. `validate-content.mjs` and `recalculate-read-times.mjs` already import it; any new
content-loading script must too.

### i18n (`src/i18n/`, `src/hooks/use-vertaling.ts`)

Two independent translation concerns, both from `useVertaling()`:

- **UI strings** in `src/i18n/{en,nl,fr,de}.ts`. `en.ts` is the source of truth (`as const`) — add
  new keys there first. The other three are typed `DeepPartial<Vertalingen>` so they can
  under-translate without breaking the build, and `src/i18n/index.ts` (`diepeMerge`) merges each
  language over `en` at read time, so a missing key falls back to English, never a blank or a raw
  key. Parametrized/pluralized strings are **functions**, not template strings, so each language
  picks its own word order: `t(s => s.verhaal.minLeestijd)(n)`.
- **Content fields** (`VertaaldVeld`) resolve with `v(veld)`.

Language preference is `src/store/taal-store.ts` (Zustand + AsyncStorage), seeded once from
`expo-localization` and then sticky.

### Theming (`src/constants/theme.ts`, `src/hooks/use-theme.ts`)

Flat beige design system, **light mode is the default** (not system-detected by default).
`Colors.light`/`Colors.dark` in `theme.ts` are the only place colours are defined; the dark
palette is a warm dark brown, not neutral black — keep it that way. Theme choice is
Licht/Donker/Systeem via `thema-store.ts`; `useEffectieveKleurenSchema()` resolves the actual
scheme (used by both `useTheme()` and the root layout's navigation `ThemeProvider`, so native
chrome and app content never disagree). Never read `useColorScheme()` directly in screens — always
go through `useTheme()`.

### Motion & haptics (`src/constants/motion.ts`, `src/constants/haptics.ts`, LAUNCH-PLAN.md B4)

`react-native-reanimated` (4.5.0) is in use since B4; `expo-haptics` was added there too.

- **`motion.ts` is to duration/springs what `theme.ts` is to colour** — the only place they're
  defined. `Motion.duration.{snel,normaal,traag}`, `Motion.spring.{zacht,stuiter,druk}`,
  `Motion.drukSchaal`, and `staggerVertraging(index)` (caps at `maxStaggerStappen` so a 15-block
  chapter doesn't take a second to finish entering). Don't hardcode a duration in a screen.
- **`haptics.ts` exposes intents, not APIs**: `haptics.tik()` / `.succes()` / `.ontgrendeld()`.
  On Android it routes to `performAndroidHapticsAsync` (system `HapticFeedbackConstants`, feels
  like the rest of the device) and on iOS to `impactAsync`/`notificationAsync`; on web it doesn't
  fire at all. Everything is fire-and-forget with a swallowed `catch` — a device without a
  vibrator must never break an interaction. **Note: `expo-haptics` merges the `VIBRATE`
  permission into the manifest**, so it shows up in the Play listing (normal permission, no
  runtime prompt, nothing to declare in Data Safety).
- **Always use `sharedValue.get()` / `.set()`, never `.value =`.** The `react-hooks/immutability`
  rule in eslint-plugin-react-hooks flags `.value =` as mutating something React considers
  immutable; `.get()`/`.set()` is both the current Reanimated API and the only lint-clean form.
- **`expo-haptics` is a native module**, so after pulling these changes a JS-only reload is not
  enough — the dev client needs a rebuild (`npx expo run:android`).
- Reanimated is unreliable on web (see LAUNCH-PLAN.md); verify motion work on the Android
  emulator, not in the browser.

### Legal & privacy (`src/constants/juridisch.ts`, `docs/`, LAUNCH-PLAN.md A5)

The privacy policy is a project file, not just a Play Console field: **`docs/privacy-policy.html`**
is one self-contained page (no build, no CDN, no external fonts) in the app's beige palette with a
`prefers-color-scheme: dark` variant. `docs/README.md` holds the GitHub Pages steps *and* the exact
Data Safety answers, so the page and the form can't drift apart. If you change what the app stores,
change both.

`PRIVACY_BELEID_URL` is the single place the URL lives. **It is still a placeholder** — the repo has
no git remote yet, so the page isn't published. `privacyBeleidIsGepubliceerd` derives from it, and
Profiel's "About" section renders only when it's true, so an unpublished URL can never ship as a
dead link. Filling in the real URL is the only step; nothing else needs enabling.

### Release & store assets (`eas.json`, `store/`, LAUNCH-PLAN.md A3/A6)

`docs/` holds what gets *published* (the privacy policy); **`store/` holds what gets *uploaded* to
the Play Console** — `listing.md` (all copy plus the answer to every Console field), `README.md`
(the steps that need an Expo login or the Console), `feature-graphic.html` and `assets/`.

- **`eas.json`**: `production` builds an AAB, `preview` an installable APK. `cli.appVersionSource`
  is **`"remote"`**, so EAS owns the versionCode after the first build — `android.versionCode` in
  `app.json` is only the seed value and the source for local `expo run:android` builds. Both submit
  profiles are `releaseStatus: "draft"` so an upload never rolls out by itself.
- `eas-cli` is a **devDependency**, not global, so the `build:android:*` scripts work as-is.
- `eas config` refuses to run without a logged-in account, so eas.json is validated offline against
  `@expo/eas-json` from `node_modules` instead — same parser eas-cli uses.
- **The feature graphic has a source file.** `store/feature-graphic.html` is rendered to PNG by
  `npm run generate:store-assets` (headless Chrome). Edit the HTML, re-run the script, never touch
  the PNG. Play **rejects a feature graphic with an alpha channel**, so the script flattens the
  browser's RGBA output to colour type 2; the 512×512 icon keeps its (fully opaque) alpha because
  Play wants a 32-bit PNG there.
- **Phone screenshots must be 9:16 or 16:9.** The Pixel_8 emulator is 1080×2400 (9:20), so capture
  with `adb shell wm size 1080x1920` and `wm size reset` afterwards. `adb exec-out screencap -p >
  file` **corrupts the PNG in PowerShell 5.1** (BOM + text encoding) — use `adb shell screencap -p
  /sdcard/x.png` followed by `adb pull`.
- `npm run check:listing` counts the copy in `listing.md` against Play's 30/80/4000 limits and
  rewrites the `(n/limit)` lines; `-- --check` is the dry run.
- Anything claimed in the listing copy must be checked against the content first — the
  "every chapter opens with an illustrated scene" line is backed by 152 `afbeelding` blocks, not by
  assumption.

### Ads (`src/components/ad-banner.tsx`, LAUNCH-PLAN.md A4)

**`ADS_ENABLED` is `false` and `<AdBanner />` renders `null`.** The banner was a placeholder box
reading "Advertisement", and `useAbonnement()` hardcodes `isPremium: false`, so every user saw it —
a classic Play rejection reason. Per the no-delete convention the component, all four call sites
(`collectie/[id]`, `regio/[id]`, `tijdperk/[id]`, `verhaal/[id]/reader`) and the
`advertentie.label` i18n key all stay put; v1.1 flips one flag alongside a real AdMob integration.
Don't re-enable it while it's still a placeholder.

### Reusable interaction patterns

- `animated-pressable.tsx` (`AnimatedPressable`): `Pressable` that springs inward on touch and
  fires `haptics.tik()`. Use it where a touch leads to a reward or navigation (chapter tile,
  reader footer, character circle) — not on every button, or the feedback becomes noise. Pass
  `haptisch={false}` when the handler already fires a heavier haptic. `disabled` keeps locked
  items completely inert (no scale, no haptic), which is why `character-grid` and the chapter
  tiles use `disabled` rather than an `if` inside `onPress`.
- `hoofdstuk-tegel.tsx` (`HoofdstukTegel`): one tile on the chapters screen. Lives outside
  `chapters.tsx` because each tile needs its own shared values and hooks can't go in a `.map()`.
  Staggered `FadeInDown` entry, spring pop on a real not-completed→completed transition (guarded
  by a `wasVoltooid` shared value, otherwise the whole grid bounces every time you open a
  half-finished story), animated opacity on unlock, and a delayed pulse on the `isVolgende`
  tile — the first unlocked-but-unfinished chapter. That pulse is deliberately mount-driven:
  navigation here is `router.push`, so the screen remounts and a "locked → unlocked" state
  transition would almost never be seen.
- `horizontale-rij.tsx` (`HorizontaleRij`): horizontal `FlatList` wrapper with optional edge
  arrows (only >768px wide, hidden at scroll start/end, one-item-width step).
- `tijdperk-rij.tsx` (`TijdperkRij`): one full-width Home section per active era — title +
  `korteBeschrijving` + a `HorizontaleRij` of that era's `VerhaalCarouselKaart`s, with a single
  "Discover more" link to `tijdperk/[id]` at the section bottom. Home renders one per
  `getActieveTijdperken()` entry in `nummer` order.

**UI principles:** prefer minimalist, elegant button placement over full-width bars. Section-level
CTAs go at the section bottom, not on every card. Character interactions use circles with visual
feedback (checkmarks). The chapters screen has no header bar — just an absolutely-positioned
"Home" button (chevron-back + text) top-left.

## Orphaned code

Present, still compiles, referenced by no live screen. Not deleted because `rm` is blocked — don't
delete it, and don't wire it back up without reading why it was dropped.

| Path | Dropped in |
|---|---|
| `(tabs)/kaart.tsx`, `components/world-map.tsx`, `constants/map-data.ts`, `scripts/generate-map-data.mjs` | R1 — Kaart tab / Regio+Continent removed from UX |
| `(tabs)/ontdek.tsx` (redirects to `/`) | superseded by `(tabs)/index.tsx` |
| `app/regio/[id].tsx` | R2 — no live screen routes to it |
| `components/continent-map.tsx`, `app/continent/[continentId].tsx` | superseded by the old WorldMap flow |
| `components/flag.tsx` | R2 — only consumers are orphaned |
| `components/tijdperk-kaart.tsx`, `components/tijdperken-carousel.tsx` | superseded by `tijdperk-rij.tsx` (R4) |
| `components/placeholder-screen.tsx` | Voortgang/Profiel are fully built |
| `verhaal/[id]/quiz.tsx`, `verhaal/[id]/chapter-quiz.tsx` | quizzes removed; now tombstone screens |
| `app/land/[landId]/**`, `components/story-card.tsx`, `components/tijdperk-section.tsx`, `constants/stub-data.ts` | pre-Regio/Tijdperk content model; last three are empty stubs |

`getVerhalenByRegio()` in `content/verhalen/index.ts` always returns `[]` — `Verhaal.regioIds` was
removed in R3. It survives only so the orphaned files above still compile; don't try to make it
filter again without reintroducing a region-to-story mapping first.

`constants/continenten.ts` / `constants/regios.ts` still hold the old country data, read only by
orphaned code.

## Launch plan (active work)

**`LAUNCH-PLAN.md` in the repo root is the live plan for shipping v1.0 to Google Play.** Unlike the
historical planning docs listed at the bottom of this file, it *is* current and *is* maintained.
Read it before starting any work on this repo. It is executed one phase at a time, each phase in a
fresh session; the "Voortgang" table and "Handover" section at the top say which phase is next and
what the previous phase left behind. Update both at the end of every phase.

## Current state

Built and working: data model, design system, three tabs, era rows on Home, story chapter reader
with persisted per-chapter progress, bundled portraits and chapter scenes, the six block types,
motion + haptics, character unlock + Profiel collection grid, streaks (local dates, expiring, only
a finished chapter counts), an optional daily reminder notification, full i18n (en/nl/fr/de)
with a language picker, theme picker.

Known gaps:
- **Collections are empty** (`collecties.ts` exports `[]`) — Home's Storylines row and
  `collectie/[id]` show nothing until it's re-curated.
- **Only the Oudheid has the rich block types** (`kop`/`weetje`/`sleutelmoment`) — the other five
  eras read as a wall of paragraphs. That's **B3b**, deferred to v1.1: no code is missing (types,
  renderer, validation and word count all handle them), it's genuine fact-checked writing.
  ~~Scene images~~ are done — B2b landed all 152 in Fase 6.5, **31 MB** of `assets/images/scenes/`
  (~205 KB each). That is the single biggest thing in the bundle; if the download size ever needs
  to come down, lower the resolution or `output_quality` in `scripts/generate-scene-images.mjs` and
  regenerate, don't recompress files one by one.
- **Only `voortgang-store` syncs.** `story-progress-store` (which chapters are done),
  `character-unlock-store` and the preference stores are still device-local, so a second device
  shows a story as *seen* but back at 0/8 chapters. Each needs a column or a table of its own; the
  sync plumbing (debounce, retry, merge) is written to be reused as-is.
- **The privacy policy still describes a device-only app** — an account and now reading progress
  live on a server. `docs/privacy-policy.html`, the Data Safety answers in `docs/README.md` and
  `src/constants/juridisch.ts` all predate auth and must be updated before the production build.
  Nothing in the code fails when they are wrong.
- **Google Play Billing is a stub** — `useAbonnement()` is a placeholder that always returns
  `{ isPremium: false }`.
- **The privacy policy is written but not published.** `PRIVACY_BELEID_URL` in
  `src/constants/juridisch.ts` is still a placeholder, so Profiel hides the "About" section — see
  "Legal & privacy" below.
- **All eight store screenshots are stale.** Fase 8 fixed the reader's safe-area inset, the
  "chapters done" counter and the streak, so `phone-3/4/7` show a header that no longer looks
  like that and the excluded Profiel/Voortgang shots are now worth taking. Recapture before the
  production build — see `store/listing.md`.
- **The release pipeline exists but nothing is linked yet**: `eas.json` and the whole `store/`
  folder are ready, `app.json` has no `extra.eas.projectId` and there is no keystore, because both
  need an interactive `eas login`. Steps in `store/README.md`.

Root-level `REFACTOR-PLAN.md`, `subagent-prompts.md`, `AUTONOMOUS-OPS.md`, `INTEGRATION-GUIDE.md`,
`AGENT-ORCHESTRATOR.md`, `R9-*.md`, `prompt.md` are historical planning docs. They describe intent,
not necessarily current behaviour — trust the code over them.
