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
npm run generate:images:scenes # Replicate scene generation, one per chapter (all 20 stories)
npm run generate:batch         # orchestration-controller.mjs batch content/image runs
npm run generate:store-assets  # store/assets/ icon-512.png + feature-graphic.png (see "Store assets")
npm run generate:notification-icon # assets/images/notification-icon.png (white-on-transparent, 96px)
npm run check:listing          # count store/listing.md copy against Play's limits (--check = dry run)
npm run check:push             # wat de push-kant nog mist (--check = exitcode 1)
npm run eas -- <cmd>           # eas-cli via npx (it is NOT a dependency — see "Release & store assets")
npm run build:android:preview  # EAS APK build for your own device (needs `npm run eas -- login` first)
npm run build:android:prod     # EAS AAB build for Play
npm run submit:android         # eas submit → internal testing track
```

There is no test suite in this repo — don't invent test commands. `npx tsc --noEmit` is the
primary correctness check and should be run before considering a change done. **`npm run lint` is
clean and should stay that way** — it carried 7 errors + 1 warning for a long time and those are
fixed, so a non-zero exit now means your change, not the baseline. What was wrong is worth
knowing, because two of the four come back easily: `useRef(new Animated.Value(0)).current` reads
a ref during render (`react-hooks/refs`) and rebuilds the value every render — use
`useState(() => new Animated.Value(0))`; a `useState(false)` + `useEffect(() => setX(true))`
hydration flag trips `react-hooks/set-state-in-effect` — use `useSyncExternalStore`; a factory
returning an anonymous arrow component trips `react/display-name` — give the inner function a
name. When editing
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

`assets/images/characters/*.webp` holds the 20 story portraits — one per story, no gaps; they
**are** wired up — see "Images" below.

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

Stack screens outside the tab group (`collectie/[id]`, `tijdperk/[id]`, `verhaal/[id]/*`,
`profiel/settings`, `profiel/upload-avatar`) share a custom `AppHeader` (`src/app/_layout.tsx`) but
usually hide its title (`options={{ title: '' }}`) in favour of their own coloured header block, so
the back chevron still comes from `AppHeader`. The two `profiel/*` screens are the exception: they
set a translated `title` from inside the screen with `<Stack.Screen options={{ title }} />`.

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

**There is no `quiz` variant** — `verhaal/[id]/quiz.tsx` and `verhaal/[id]/chapter-quiz.tsx` are
"Quiz verwijderd" tombstone screens, and `scripts/validate-content.mjs` still carries a dead
`case 'quiz'` branch that nothing can trigger. Er is sinds "Interactief lezen" wél weer een quiz,
maar die is **geen `Blok` en geen scherm**: hij komt uit Supabase en staat ónder de blokken. Wat
verwijderd is en verwijderd blijft, is de quiz als route die het volgende hoofdstuk blokkeerde.

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
`oudheid/gebeurtenissen.ts`), with a per-era `<tijdperk-id>/index.ts` barrel. **20 stories total**:
Oudheid has 5, the other five eras 3 each.

The twentieth, **`ashoka-maurya`, was autogenerated and now lives in `oudheid/personen.ts`** like
the rest. It was moved out of `oudheid/gegenereerd.ts` on purpose, and the reason is written at
the top of every `gegenereerd.ts`: **a batch run rewrites those files in their entirety**, so a
story you edit by hand there loses the edit at the next `npm run generate:batch`. All six
`gegenereerd.ts` files are now empty arrays. Anything worth keeping goes to `personen.ts` first.

It still differs from the other nineteen in one way: **it is English-only** — every
`VertaaldVeld` has just an `en` key, so `v()` falls back to English in all four languages. Its
images are no longer a difference (see "Images"), and it does have the rich block types.

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
- Uitloggen staat onderaan **Instellingen** (`/profiel/settings`, was Profiel). It does **not**
  clear local reading progress (that lives in AsyncStorage per device), and the dialog says so;
  don't reword it into a warning that isn't true. `Alert` doesn't exist in react-native-web, so
  every confirm/alert goes through `bevestig()` / `meld()` in **`src/constants/dialoog.ts`**, which
  falls back to `window.confirm` / `window.alert`. Use those, not `Alert.alert` directly.

### Voortgang sync (R8.AUTH deel 3, R8.SYNC-B)

**Three stores mirror themselves into Supabase**, all following the same pattern:

| Store | Tabel | Vorm |
|---|---|---|
| `voortgang-store` | `public.voortgang` | één rij per gebruiker |
| `story-progress-store` | `public.story_progress` | **één rij per verhaal** (`unique (user_id, verhaal_id)`) |
| `character-unlock-store` | `public.character_unlocks` | één rij per gebruiker, collectie als `jsonb` |

Only the preference stores are still device-local — see "Known gaps".

- **The debounce lives in the store, the triggers live in a hook.** Every mutating action calls
  `plandeSync()` / `syncPlanner.plan()`, which pushes one shared 2-second timer forward, so eight
  chapters in a row cost one upsert. `useVoortgangSync()` in the root layout owns the cases where
  nothing changed but a push is still due: a session appears, NetInfo reports a reconnect, or the
  app returns to the foreground. It drives **all three** stores from one `SYNC_STORES` list — add a
  fourth store there, not as a fourth set of listeners. Mount it once, next to `useAuth()`.
- **The shared pieces live in `src/store/sync-hulp.ts`**: `SYNC_DEBOUNCE_MS`, `foutTekst`,
  `wachtOpHydratie(store)` and `maakSyncPlanner()`. They started as private helpers in
  `voortgang-store`; three copies of the hydration guard is three chances to forget one.
- **`story_progress` writes all stories in one `upsert(array, { onConflict: 'user_id,verhaal_id' })`**,
  not a loop of nineteen. A loop is nineteen round-trips and leaves a half-written server state if
  it aborts in the middle.
- **`character_unlocks.unlocked_characters` is `jsonb`, not `text[]`** — the store keeps
  `personageNaam` and `unlockedAt` next to the id, and an array of ids would drop both. It is read
  back through `leesServerOntgrendelingen()`, which filters malformed entries instead of throwing:
  `jsonb` has no shape Postgres enforces.
- **The new tables' columns are snake_case** (`verhaal_id`, `completed_chapters`), unlike
  `voortgang`'s folded-lowercase names. Same rule underneath — see the next bullet.
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
  account. Don't "simplify" it back into an assignment. The other two stores do the same:
  chapters are unioned per story, and a character that exists on both sides keeps the **earliest**
  `unlockedAt`. A story that exists only locally sets the dirty flag, so it still goes up.
- **Sync waits for `persist` to hydrate** (`wachtOpHydratie`). Pushing before AsyncStorage has been
  read uploads the empty initial state and wipes the server row.
- **The offline queue is one boolean**, `heeftOnverzondenWijzigingen`, persisted across restarts.
  A failed sync leaves it set and the next trigger retries; nothing is buffered, because the state
  only grows and the latest stand supersedes every older snapshot. `isSyncing` / `syncError` are
  kept *out* of storage by `partialize` — a persisted `isSyncing: true` would deadlock every future
  sync.
- `SyncIndicator` on Profiel renders the status of **all three stores together** — one store
  reporting "synced just now" while another sits offline is exactly the question the line exists to
  answer. `lastSyncTime` still comes from `voortgang-store`; the three pushes leave together, so one
  timestamp describes them all. Note the selectors are assigned to separate consts before being
  combined: `a() || b()` would skip a hook call and break the hook order.
  It shows amber "offline, will sync later" rather than red: nothing is lost and the retry is
  automatic.

`theme.ts` gained `gevaar` / `waarschuwing` / `succes` for form errors and the strength meter —
use those, not a hardcoded red.

### Reading progress & character unlocks

- `src/store/story-progress-store.ts` + `src/hooks/use-story-progress.ts`: per-chapter progress,
  Zustand + AsyncStorage, persists across restarts, and mirrors to Supabase since R8.SYNC-B (see
  "Voortgang sync"). Chapters unlock sequentially. Read time is derived from word count
  (words ÷ 250).
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

### Profiel & Instellingen

Profiel is opgesplitst: **`(tabs)/profiel.tsx` gaat over voortgang, `profiel/settings.tsx` over
knoppen.** Thema, taal, de dagelijkse herinnering, de synchronisatiestatus, het privacybeleid en
uitloggen zijn verhuisd, niet nagebouwd — verwacht ze niet meer op Profiel zelf.

- **De schermen heten `src/app/profiel/settings.tsx` en `src/app/profiel/upload-avatar.tsx`, niet
  `(tabs)/profiel/…`.** Dat kan niet: `(tabs)/profiel.tsx` mag niet worden verwijderd (zie
  "File deletion") en zou dan samen met een `(tabs)/profiel/index.tsx` dezelfde route `/profiel`
  opeisen. Ze staan dus als stack-scherm naast de tabbladen, net als `verhaal/[id]`, en zijn in
  `src/app/_layout.tsx` geregistreerd (`upload-avatar` als `presentation: 'modal'`).
- **De mijlpalen staan niet meer op Profiel.** `PrestatieRaster` is eruit gehaald en daarmee
  orphaned; de veertien badges staan alleen nog op Voortgang (`achievements-grid.tsx`). Twee
  rasters van dezelfde veertien mijlpalen rekenden hun stand ook nog eens verschillend uit — het
  raster op Profiel las de ontgrendelingen, dat op Voortgang leidt ze af uit de vier tellers en
  loopt dus niet achter op een verse ontgrendeling — en een verschil tussen twee schermen leest
  als een fout in de app in plaats van als twee bronnen.
- Profiel bestaat uit vier componenten: `profile-header.tsx` (avatar, naam, streak),
  `profile-stats.tsx` (de drie tellers), `profile-character-collection.tsx` (kop + teller +
  horizontale rij `character-card.tsx` + aanmoedigingsregel) en `pro-access-banner.tsx`.
  `profile-card-collection.tsx` — het oude 70px-cirkelraster rond `CharacterGrid` — is daarmee
  **orphaned**; `character-grid.tsx` zelf wordt nog wel gebruikt door het avatarscherm.
- **Een vergrendelde `CharacterCard` verklapt niets**: naam, portret en teaser zijn de beloning
  voor het uitlezen, dus die verschijnen pas na het ontgrendelen. Zichtbaar blijven het tijdperk
  en `verhaal.portretKleur`, zodat de rij niet als grijze blokken leest. De volgorde is bewust de
  contentvolgorde en niet ontgrendeld-eerst — een rij die zichzelf herschikt laat je je eigen
  collectie steeds opnieuw zoeken.
- **`PRO_BANNER_ENABLED` (in `pro-access-banner.tsx`) staat nu op `true`** en is de enige
  schakelaar voor het hele Pro-aanbod: de banner, het `pro-paywall.tsx`-venster erachter én de
  regel "Your plan" in Instellingen, die zonder de vlag terugvalt op "Soon". **Zet hem terug op
  `false` vóór een productiebuild zolang Play Billing een stub is** — zelfde afweging als
  `ADS_ENABLED`: een reviewer die een prijs ziet zonder werkende aankoop wijst af. De paywall zelf
  liegt niet (geen "100+ stories" — het aantal komt uit `verhalen.length`, geen proefperiode die
  niet bestaat, en een voorbehoud onder de prijzen), maar eerlijk is niet hetzelfde als toegestaan.
- **Het spreekwolkje op Profiel opent `feedback-modal.tsx`, geen mailto.** Het bericht gaat als rij
  naar `public.feedback` in Supabase (kolommen `soort` `'bug' | 'idee'`, `bericht`, `app_versie`,
  `platform`; RLS staat alleen insert/select op je eigen rijen toe, geen update/delete). Dus geen
  gesimuleerde `setTimeout`-bevestiging: "verzonden" betekent hier verzonden, en mislukt het, dan
  blíjft de getypte tekst staan. Bewust géén offline wachtrij zoals bij de voortgangssync — dit is
  een losse mededeling en geen groeiende toestand. "Contact support" in Instellingen blijft wél een
  mailto: dat is een gesprek, dit is een melding.
- `settings-section.tsx` levert `SettingsSectie` + `SettingsItem`. De sectie zet zelf de
  scheidingslijnen tussen zijn kinderen (`Children.toArray`), dus een voorwaardelijk verborgen
  regel laat geen lijn achter. Een `SettingsItem` zonder `onPress` is informatie en krijgt geen
  chevron; `rechts` vervangt de chevron door bijvoorbeeld een `Switch`.
- `SettingsSectie` heeft sinds de e-mailvoorkeuren een optionele `voet`: een kleine regel *onder*
  de kaart, voor uitleg die bij de hele sectie hoort in plaats van bij één regel.
- **Wat nog niet bestaat draagt een "Soon"-badge en zegt dat ook** (`nogNiet()` → `meld()`) in
  plaats van stilletjes niets te doen. Wachtwoord wijzigen en het app-icoon zijn zulke regels;
  de e-mailvoorkeuren en het abonnement zijn dat sinds deze fase niet meer. Links die er wél zijn
  hangen aan een placeholder-vlag —
  `privacyBeleidIsGepubliceerd`, plus `APP_IS_GEPUBLICEERD`, `supportEmailIsIngesteld` en
  `voorwaardenZijnGepubliceerd` in het nieuwe **`src/constants/app-info.ts`**. Zolang die `false`
  zijn wordt de link niet geopend maar als "binnenkort" getoond, zodat een release nooit een dode
  link bevat. `APP_VERSIE` komt uit `expo-constants`, niet uit een tweede keer overgetypt getal.
- **De avatar (`src/store/profile-store.ts`) heeft twee soorten**: `{ soort: 'personage' }`
  verwijst naar een verhaal-id (bytes zitten in de bundel, overleeft alles) en
  `{ soort: 'foto' }` is een `expo-image-picker`-URI op dít toestel. Een verdwenen fotobestand
  valt in `profile-header.tsx` via `onError` terug op het standaardicoon zónder de keuze te
  wissen. Resolven doe je met `avatarBron(avatar)`, niet met een eigen `if`.
- **`expo-image-picker` is nieuw en native**: na het pullen van deze wijziging is een JS-reload
  niet genoeg, de dev client moet opnieuw gebouwd worden. Het plugin-blok in `app.json` blokkeert
  `CAMERA` en `RECORD_AUDIO` (we openen alleen de galerij) — zie `docs/README.md` voor de
  permissietabel.

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

One daily reminder, **always on**, at a time the user picks (19:00 local to start with). Same
shape as `haptics.ts`: intents, no throwing, no-op on web.

**The streak warning and the milestone note have no in-app switch; the daily reminder does.**
`ALTIJD_AAN_SLEUTELS` in `notificatie-store.ts` is the single list and now holds **two** keys
(`streakAan`, `prestatiesAan`). Every path that lets state in — persist `merge`, the `version: 1`
migration, `voegServerVoorkeurenSamen`, and the guard inside `zetPushVoorkeur` — forces those two
back to `true`.

**`herinneringAan` was in that list and was taken back out.** A daily notification you cannot
switch off inside the app sends the reader to Android's per-channel settings for something
ordinary, and it is the one of the three that fires every single day. So it has a real `Switch`
again, `setHerinnering(false)` is a valid call, and `voegServerVoorkeurenSamen` reads
`daily_reminder_enabled` from the server like any other preference. **The streak and milestone
rows went the other way: they are still always on, and they no longer have a row at all** — an
"Always on" line with no control is exactly what makes a reader hunt for a switch that is not
there. What disappeared is the row, not the notification. Without that a stored
`false` from an older install (or a preferences row synced from a device still on the old build)
would leave a state no screen can show or restore. The reader's way out is Android's own
per-channel control, which the section footnote points at; the two *server* categories (win-back,
recommendations) keep their switches and stay off by default.
`useDagelijkseHerinnering` still does **not** clear the preference when permission is missing (it
just cancels the schedule) — flipping the switch on the reader's behalf turns a system problem
into a silent change of their choice. `biedHerinneringAan()` keys off `toestemmingGevraagd`
alone; the old `|| herinneringAan` guard matches on every install (the default is `true`) and the
permission prompt would never appear. `useMeldingToestemming()` reads the system
permission (re-measured on every foreground) so Settings can show a "Allow notifications" row
instead of a promise the OS is blocking.

- **The time lives in `notificatie-store` (`herinneringUur`/`herinneringMinuut`), not in
  `notificaties.ts`.** `STANDAARD_HERINNERING_UUR/MINUUT` there are only the initial values;
  `planDagelijkseHerinnering(titel, tekst, uur, minuut)` takes the time as a parameter and
  `useDagelijkseHerinnering` has it in its dependencies, so verzetten reschedules exactly like a
  language switch does. No persist migration was needed — zustand lays the stored state over the
  initial one, so an older install simply keeps 19:00.
- The picker is `components/daily-reminder-settings.tsx` (`HerinneringSchakelaar` +
  `HerinneringTijd`), **deliberately not `@react-native-community/datetimepicker`**: that one is
  native (so it needs a dev-client rebuild) and does not exist on web, which is where this project
  previews its screens. The two exports are separate on purpose — `SettingsSectie` draws its
  dividers between its *direct* children, so one component returning two rows would lose the line
  between them.

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

### Push-notificaties (`src/lib/push.ts`, `use-push-registratie.ts`, `supabase/functions/`)

Vier soorten meldingen, en de scheidslijn is: **de server stuurt alleen wat het toestel zelf niet
kan weten.** Het volledige draaiboek staat in `supabase/README-push.md`; hier de regels die code
raken.

| Melding | Vandaan | Bestand |
|---|---|---|
| Dagelijkse herinnering | lokaal | `use-dagelijkse-herinnering.ts` (hierboven) |
| Streak loopt vanavond af | lokaal | `use-streak-herinnering.ts` |
| Win-back ("je hoofdstuk staat nog open") | **server, FCM** | `push-sweep` → `send-push` |
| Aanbeveling ("Spartacus wacht op je") | **server, FCM** | idem |
| Mijlpaal ("Tien hoofdstukken ver") | lokaal | `use-prestaties.ts` (zie hieronder) |

- **De dagelijkse herinnering is en blijft lokaal.** Er lag een plan om hem door een cron elke
  minuut te laten versturen; dat vergelijkt `now().getHours()` (UTC) met een lokaal ingesteld
  "19:00" en stuurt dus iedereen buiten Greenwich op het verkeerde uur een melding. De lokale
  versie werkt offline en op de seconde. Niet omruilen.
- **De streakwaarschuwing wordt vooruit gepland.** Een lokale melding kan alleen gezet worden
  terwijl de app open is, en de dag dat hij moet afgaan is juist een dag zonder app. Dus: heb je
  vandaag gelezen, dan staat hij voor **morgen** 20:30; heb je nog niet gelezen en is het vóór
  20:30, dan voor vanavond. Elke terugkeer naar de voorgrond herberekent. Bewust géén
  `DAILY`-trigger — die gaat ook af op avonden dat je allang gelezen hebt.
- **Er is bewust géén ontgrendelmelding.** Ontgrendelen is een knopdruk in de reader met een modal
  erachter, dus die melding zou altijd verschijnen terwijl de lezer er al naar kijkt.
- **`src/lib/push.ts` heeft exact de vorm van `lib/analytics.ts`**: lui `require` achter een
  `Platform`-controle, nooit gooien, `sdk === null` als "hier is niets". Zonder
  `google-services.json` is `push.beschikbaar` onwaar en valt de hele push-kant stil zonder dat de
  app iets merkt. De typen worden met `ReturnType`/`Parameters` uit de SDK afgeleid —
  `@react-native-firebase/messaging` exporteert zijn interfaces niet vanaf de hoofdingang, en v26
  is **volledig modulair** (`getMessaging()` + losse functies, geen `messaging()`-default).
- **`user_devices` is uniek op `fcm_token`, niet op `user_id`.** Een token identificeert een
  *installatie*: één lezer kan twee toestellen hebben, en op één toestel kunnen na elkaar twee
  accounts inloggen. Uniek op `user_id` gooit het tweede toestel weg; helemaal geen unieke sleutel
  maakt bij elke login een rij bij tot dezelfde melding vijf keer aankomt. Upsert dus met
  `onConflict: 'fcm_token'`.
- **`push_kandidaten(doel_uur)` rekent het uur per lezer uit in diens eigen tijdzone**
  (`now() at time zone np.tijdzone`), en `notification_preferences.tijdzone` is een **IANA-naam**
  en geen minutenverschil — alleen zo klopt het na een zomertijdwissel. Een trigger zet een
  onbekende naam terug naar `'UTC'`, want `at time zone 'Mars/Olympus'` gooit en zou de hele sweep
  laten vallen.
- **De sweep controleert éérst of Firebase is ingesteld, en claimt pas daarna.** Zonder die
  volgorde claimt hij een rij, krijgt een 500 van `send-push` (`firebase_niet_geconfigureerd`) en
  zet diezelfde rij op `failed` — en omdat er bewust niets opnieuw geprobeerd wordt is die lezer
  die dag "bediend" zonder ooit iets ontvangen te hebben. Een cron die aanstaat vóórdat het
  serviceaccount bestaat brandt zo elke dag ieders melding op, stilletjes. Nu is het antwoord een
  200 met `overgeslagen: 'firebase_niet_geconfigureerd'` en is er niets geclaimd.
- **De cron staat ingepland en is inert.** `pg_cron`/`pg_net` zijn aan, de job
  `push-sweep-elk-uur` bestaat, en zijn opdracht eindigt op
  `where exists (select 1 from vault.decrypted_secrets where name = 'service_role_key')`. Zolang
  dat geheim niet bestaat gaat er geen aanroep uit — geen 401 per uur, geen logregel. Eén
  `vault.create_secret(...)` zet hem in werking. **Let op: `pg_net` installeert zichzelf in schema
  `net`**, ongeacht de `with schema` die je meegeeft; `extensions.http_post` bestaat niet.
- **De sweep claimt vóórdat hij verstuurt.** Eerst een rij in `notifications_sent` met een unieke
  `dedupe_sleutel` (`on conflict do nothing` + `select`, dus alleen écht nieuwe rijen komen eruit),
  dan pas FCM. Andersom levert een crash halverwege een dubbele melding op. Er wordt bewust **niets
  opnieuw geprobeerd**: een win-back die een dag later alsnog aankomt is geen win-back.
- **Beide edge functions eisen de service role**, bovenop `verify_jwt`. Die poort laat elk geldig
  token door, dus ook dat van een gewone lezer — zonder de rolcontrole kan iedereen die inlogt een
  push naar een willekeurige `userId` sturen. `send-push` ondertekent zelf een RS256-JWT voor
  Google's OAuth2 (HTTP v1 API); de oude `FCM_API_KEY` is legacy en door Google uitgezet.
- **`public.story_catalog` is afgeleid, geen tweede bron van waarheid.** De server moet weten dát
  Joan of Arc bestaat om haar te kunnen noemen; de verhalen zelf blijven in de bundel. Bijwerken na
  het toevoegen van een verhaal: `npm run sync:verhaalcatalogus` (heeft
  `SUPABASE_SERVICE_ROLE_KEY` nodig, `--dry` om alleen te kijken).
- **`notificatie-store` is de vierde regel in `SYNC_STORES`** (`use-voortgang-sync.ts`), precies
  waar die lijst voor bedoeld was. Eén afwijking t.o.v. de andere drie: voorkeuren worden
  **overschreven** en niet verenigd — "uit" is een keuze en geen leegte. Lokale niet-verzonden
  wijzigingen winnen; anders wint de server.
- **Er zijn drie Android-kanalen** (`dagelijkse-herinnering`, `streak`, `terugkeer`), aangemaakt
  door `zorgVoorKanalen()` bij het opstarten. Een kanaal is de knop waarmee de lezer één sóórt
  melding uitzet; alles op één kanaal betekent dat wie de win-back te veel vindt ook zijn
  dagelijkse herinnering verliest. `terugkeer` moet bestaan vóórdat de eerste push ernaar verwijst.
- **`@react-native-firebase/messaging` is native**: na het pullen hiervan is een JS-reload niet
  genoeg, en `expo prebuild` faalt sowieso zolang `google-services.json` ontbreekt. Controleer na
  de eerste geslaagde prebuild de merged manifest opnieuw op nieuwe permissies (commando in
  `docs/README.md`).

### Mijlpalen (`src/constants/prestaties.ts`, `use-prestaties.ts`, `achievement-store.ts`)

De "achievements" uit het pushplan. Veertien stuks, over vier tellers: afgeronde hoofdstukken,
uitgelezen verhalen, ontgrendelde personages en de streak.

- **Ze worden afgeleid, niet bijgehouden.** Geen tabel, geen teller, geen vijfde sync-store: een
  mijlpaal is een uitspraak over voortgang die al in drie gesynchroniseerde stores staat. Wat
  `prestatie-store` wél bewaart is uitsluitend **welke al is aangekondigd** — plus
  `geinitialiseerd`. Dat laatste veld is het belangrijkste van de hele feature: zonder die vlag
  krijgt iedereen die deze versie installeert met 50 hoofdstukken achter de rug zes felicitaties
  bij de eerste start. De eerste meting schrijft dus alles stil bij. Om dezelfde reden wordt er
  hoogstens **één per meting** aangekondigd en de rest stil bijgeschreven.
- **`meet()` wacht op de hydratie van alle vier de stores.** Meten vóór AsyncStorage gelezen is
  legt "nul mijlpalen" vast als beginstand, waarna de hydratie er vijftig hoofdstukken naast legt
  en de lezer alsnog zijn hele geschiedenis als meldingen terugkrijgt — precies wat
  `geinitialiseerd` moest voorkomen.
- **Voorgrond wordt een strook, achtergrond wordt een melding.** Een mijlpaal wordt bijna altijd
  bereikt terwijl je naar de app kijkt, en een systeemmelding over iets wat je zojuist zelf deed is
  ruis (zelfde afweging als bij de verwijderde ontgrendelmelding). `PrestatieMelding` in de root
  layout is bewust een strook en geen modal: de zware onderbreking is gereserveerd voor het
  ontgrendelde personage, en deze mag daar niet mee botsen — hij blokkeert niets, wacht op geen
  `onClose` en verdwijnt na 4,5 seconde.
- **De schakelaar staat uit-zetbaar in Instellingen** (`prestatiesAan` →
  `notification_preferences.achievements_enabled`, standaard **aan**, zelfde redenering als
  `streakAan`). Uit betekent: geen aankondiging, maar de mijlpaal wordt wél bijgeschreven en staat
  gewoon op Profiel. Een mijlpaal afzeggen is iets anders dan hem niet verdienen.
- **Een vergrendelde tegel in `PrestatieRaster` verklapt zijn naam wél**, anders dan een
  vergrendelde `CharacterCard`. Daar is de naam de beloning; hier is hij het doel.
- Namen staan per mijlpaal in i18n (`prestatie.namen`, getypeerd als `Record<PrestatieId, string>`
  — een mijlpaal zonder naam is dus een compileerfout), de uitleg wordt per categorie samengesteld.
- Eigen Android-kanaal (`prestatie`) en een eigen analytics-gebeurtenis
  (`ACHIEVEMENT_UNLOCKED`), met `tegelijk` erin: structureel meer dan 1 betekent dat de eerste
  meting ergens te vroeg gebeurt.

#### De serverkant (`achievement-store.ts`, `public.achievements`)

**Óf een mijlpaal behaald is blijft afgeleid; de server bewaart alleen wat je niet kunt
terugrekenen.** Dat zijn drie dingen: wánneér hij verdiend is, hoeveel punten hij opleverde, en
of hij gedeeld is. De catalogus zelf staat nog steeds in `prestaties.ts` — een tweede lijst van
veertien mijlpalen in de database zou betekenen dat je een badge kunt zien die geen naam heeft, of
een melding krijgt voor iets dat op Voortgang niet bestaat.

- **Drie tabellen.** `public.achievements` is de spiegel van `PRESTATIES` (id, categorie, drempel,
  icoon, `reward_points`, plus `naam_en` — uitsluitend voor teksten die de *server* opstelt; de
  app leest die kolom nooit en gebruikt `prestatie.namen` uit i18n). `public.user_achievements`
  is één rij per gebruiker per mijlpaal met `unlocked_at`/`shared`/`shared_at`.
  `public.achievement_progress` houdt "3 van de 7" bij — voor **alle** veertien, ook de behaalde.
  Er is geen delete-policy, dus een rij die bij het ontgrendelen op "9 van de 10" blijft staan
  blijft dat voorgoed, en een sweep zou "nog één hoofdstuk" sturen voor iets dat al binnen is.
  Zo leest de tabel zichzelf: behaald is precies `current_value >= target_value`.
  **Wijkt de tabel af van `prestaties.ts`, dan is `prestaties.ts` leidend** — de app leest zijn
  definities nooit van de server, dus een verschil valt anders nergens op.
- **`achievement_progress` is er voor de server, niet voor de client.** De app rekent dezelfde
  voortgang zelf uit de vier tellers uit, offline en actueler; de tabel bestaat zodat een
  push-sweep "nog één hoofdstuk" kan vragen. Hij wordt dus wel geschreven en nooit teruggelezen.
- **`achievement-store` is de vijfde regel in `SYNC_STORES`** en volgt het bekende contract
  (`heeftOnverzondenWijzigingen` / `syncToSupabase` / `resetSyncStatus` + een `haalOp`). Bij het
  samenvoegen wint de **vroegste** `unlockedAt` — een tweede toestel dat vandaag inlogt mag
  "verdiend op 3 maart" niet naar vandaag verzetten — en is `gedeeld` een OF.
- **Het staat náást `prestatie-store` en niet erin, met opzet.** Die bewaart welke aankondiging je
  op *dit toestel* hebt gezien en synchroniseert daarom nooit (zie `geinitialiseerd`); deze bewaart
  een feit over de *lezer* en synchroniseert daarom altijd. Eén store met twee tegengestelde
  sync-regels behandelt de ene helft van zijn velden altijd verkeerd.
- **De eerste meting registreert wél, maar kondigt niets aan.** Anders heeft wie deze versie
  installeert met vijftig hoofdstukken achter de rug badges zonder datum. Het moment is dan "nu";
  de samenvoeging zet het terug zodra de server een eerdere datum blijkt te kennen.
- **Punten zijn een score, geen munteenheid.** Ze staan in `PRESTATIES.punten` (bundel, dus een
  wijziging is één app-update) en zijn gespiegeld in `reward_points`. Er is niets voor te kopen,
  en dat is de reden dat ze lokaal mogen staan; ging er ooit iets mee te betalen, dan moeten ze
  eerst naar de server.
- **De teller op Voortgang rekent met de afgeleide stand, niet met `achievement-store`.** Die
  loopt achter zolang een verse ontgrendeling nog niet gepusht is, en een puntenteller die na het
  afvinken van een hoofdstuk twee seconden blijft hangen leest als een fout.

#### Het venster en delen (`achievement-unlock-modal.tsx`, `constants/deel.ts`)

- **De aankondiging blijft de strook; het venster is een tik verderop.** `PrestatieMelding`
  schuift nog steeds binnen als er iets behaald is, maar is nu een *ingang*: aantikken opent
  `AchievementUnlockModal` in plaats van de strook alleen weg te halen. Zo bestaat de zwaardere
  viering wél, zonder ooit over de `CharacterUnlockModal` in de reader heen te vallen — dezelfde
  afweging die de strook überhaupt een strook maakte.
- **Het venster hangt één keer in de root layout** en wordt gestuurd door
  `prestatie-store.detailId`, omdat er twee ingangen naartoe leiden (de strook en elke tegel in
  het raster). Twee kopieën zouden op elkaar kunnen stapelen. De tegels riepen hiervoor `meld()`
  aan; dat kon niet blijven, want in een systeemvenster past geen deelknop.
- **`constants/deel.ts` is een intent, net als `haptics.ts` en `dialoog.ts`**: hij gooit nooit en
  geeft `'gedeeld' | 'gekopieerd' | 'afgebroken' | 'niet-mogelijk'` terug. Op web is `Share` uit
  react-native niet te vertrouwen, dus daar is het `navigator.share` → klembord → niets. **Alleen
  `gedeeld` en `gekopieerd` zetten de `shared`-vlag** — een weggeklikt deelvenster is geen delen.
- **`user_achievements` heeft een update-policy nodig en niet alleen insert.** Zonder die policy
  raakt de upsert van een bestaande rij nul rijen zonder foutmelding, en kan de `shared`-vlag dus
  nooit gezet worden. Delete-policies zijn er bewust op geen van de drie: verwijderen loopt via de
  `delete-account` edge function en de cascade.

### Aanbevelingen (`src/content/aanbeveling.ts`, `recommendation-store.ts`, `public.story_recommendations`)

Welk verhaal we deze lezer voorstellen, en waarom. **De keuze wordt afgeleid, de uitkomst wordt
bewaard** — zelfde scheiding als bij de mijlpalen.

- **`content/aanbeveling.ts` is de logica en is zuiver**: `detectFavoriteEra(voortgang)` →
  `suggestUnreadStory(voortgang, tijdperkId)` → `bepaalAanbeveling(voortgang)`, met een
  `Leesvoortgang`-type dat de vorm van `story-progress-store.progress` overtypt in plaats van hem
  te importeren (anders is het een importlus, en dan is de logica niet met verzonnen voortgang te
  beproeven).
- **De volgorde is regel voor regel dezelfde als die van `push_kandidaten`** (de CTE's
  `voorkeur_tijdperk` en `aanbeveling`): meest gelezen tijdperk, gelijkspel op tijdperk-id, dan
  ongeopende verhalen op `volgorde` en id. Wie 's avonds een melding over Ashoka krijgt en de app
  opent moet daar niet ineens Joan of Arc aangeraden zien. **Wijzigt de ene kant, wijzig de andere
  mee.** Nevengevolg dat je moet kennen: voor een verse lezer is dat globaal-alfabetisch en dus
  `james-watt`, niet het eerste tijdperk. Dat is wat de push vandaag óók kiest; wil je het
  chronologisch, verander dan beide kanten (de server heeft daarvoor het tijdperknummer in
  `story_catalog` nodig, dat staat er nog niet in).
- **Voorkeur is een voorkeur, geen filter.** Is het favoriete tijdperk uitgelezen, dan wijkt de
  suggestie uit naar de rest (reden `next_up`) in plaats van leeg te blijven.
- **Voorkeur telt verhalen, geen hoofdstukken.** Acht hoofdstukken van één Romeins verhaal wegen
  minder dan één hoofdstuk van elk van drie middeleeuwse: breedte zegt meer over smaak dan diepte,
  want diepte volgt vooral uit waar je toevallig begon.
- **`recommendation-store` is de zesde regel in `SYNC_STORES`** en volgt het bekende contract
  (`heeftOnverzondenWijzigingen` / `syncToSupabase` / `resetSyncStatus` + `haalAanbevelingenOp`).
  Bij het samenvoegen wint de **vroegste** `aangemaaktOp` én de reden die bij dat moment hoorde.
  De publieke kant is `recommend()` / `genereerAanbeveling()` / `loadRecommendations()` /
  `getNext()`.
- **`getNext()` slaat over in plaats van te verwijderen.** Een aanbeveling voor een verhaal waar
  inmiddels een hoofdstuk van af is dooft vanzelf uit; er is bewust geen delete-policy op de tabel
  (zoals overal in dit project), dus opruimen kan niet en hoeft niet.
- **`reason` is een slug en heeft géén check-constraint.** De app toont hem in vier talen, dus de
  zin hoort in i18n; en een constraint zou betekenen dat een appversie met een nieuwe reden bij
  elke sync stukloopt op een vergeten migratie. `leesServerAanbevelingen` filtert onbekende
  redenen er in plaats daarvan bij het lezen uit, net als `leesServerPrestaties` met onbekende
  `achievement_id`s. Er is om dezelfde reden geen foreign key naar `story_catalog`: die tabel is
  afgeleid en met de hand gesynchroniseerd.
- **`RecommendedStoryCard` op Home is de enige aanroeper**, en meet opnieuw zodra `progress`
  wijzigt — een afgerond hoofdstuk levert dus meteen een verse suggestie. De kaart staat direct
  onder de hero: de hero is de redactionele keuze (`uitgelicht`), dit is de keuze op maat. Hij
  navigeert zelf (zoals `VerhaalCarouselKaart`) en krijgt geen props, want er is precies één
  bestemming en die volgt uit het verhaal dat hij toont.
- **De kaart wacht op de hydratie van beide stores voordat hij íets toont.** Zonder dat leest de
  lege staat ("je hebt elk verhaal geopend") een paar frames lang als waarheid en klapt de kaart
  daarna om — en erger: `genereerAanbeveling()` zou dan meten alsof je nooit iets las en dat
  vervolgens synchroniseren. De laadtoestand is bewust een vorm en geen "laden…"-tekst. De
  serverronde heeft géén eigen laadtoestand: die vult alleen aan wat er al staat.
- **`useShallow` in de selector is geen optimalisatie maar een noodzaak.** `getNext()` bouwt elke
  aanroep een nieuw object; een selector die telkens een nieuwe referentie teruggeeft laat
  `useSyncExternalStore` eindeloos hertekenen.
- **De push komt van de server, niet van de kaart.** `push_kandidaten` kiest sinds de migratie
  `push_kandidaten_gebruikt_story_recommendations` éérst een ongeopend verhaal uit
  `story_recommendations` (nieuwste eerst) en valt daarna pas terug op zijn eigen afleiding — dus
  melding en kaart noemen hetzelfde verhaal. **Roep `send-push` niet aan vanuit de app**: die
  weigert een lezerstoken met 403 `alleen_service_role` (zonder die controle kan elke ingelogde
  lezer een melding naar een willekeurige `userId` sturen), en een melding over een aanbeveling
  die op dat moment op het scherm staat is dezelfde ruis als de geschrapte ontgrendelmelding.
- **`RECOMMENDATION_GENERATED` wordt alleen gelogd bij een échte nieuwe aanbeveling.** De kaart
  meet bij elke voortgangswijziging en elke montage opnieuw; zonder die controle telt de
  gebeurtenis hertekeningen. Samen met `notification_opened` en `story_read` vormt hij de
  trechter voorgesteld → aangetikt → geopend.
- De teksten staan onder `aanbeveling` in i18n, met `reden` getypeerd tegen `AanbevelingReden`
  (een reden zonder tekst is een compileerfout, net als bij `prestatie.namen`). Alle drie zijn
  functies met dezelfde handtekening, ook al gebruiken er twee de tijdperknaam niet — dan hoeft
  de kaart niet te weten welke reden een parameter kent.

### Sociaal delen (`constants/deel.ts`, `deel-opties.tsx`, `share-*`, `referral-store.ts`)

Drie dingen zijn deelbaar — een mijlpaal, een fragment uit een hoofdstuk, en een uitnodiging — en
ze lopen allemaal door dezelfde twee lagen: `constants/deel.ts` voor het *hoe*, en
`components/deel-opties.tsx` voor de drie knoppen.

- **`deel.ts` is een intent, net als `haptics.ts` en `dialoog.ts`** en gooit nooit. Naast `deel()`
  (het deelvenster van het toestel) staan er nu `kopieer()`, `deelViaWhatsApp()`, `deelAlsLink()`
  en `deelBerichtMetLink()`. `DeelResultaat` blijft de vier uitkomsten
  (`gedeeld`/`gekopieerd`/`afgebroken`/`niet-mogelijk`), en **alleen `gedeeld` en `gekopieerd`
  markeren iets** — een weggeklikt deelvenster is geen delen.
- **WhatsApp gaat via `Linking.openURL` en bewust níét via `canOpenURL`.** Package visibility op
  Android 11+ raakt `canOpenURL` (dat zonder een `<queries>`-blok altijd `false` geeft en de knop
  op elk modern toestel doodlegt), niet `startActivity`. Twee trappen: `whatsapp://send?text=` →
  `https://wa.me/?text=`. Op web valt de eerste trap weg.
- **`expo-clipboard` is nieuw en native**: na het pullen hiervan is een JS-reload niet genoeg, de
  dev client moet opnieuw gebouwd worden. `Clipboard` uit react-native core bestaat in 0.86 nog,
  maar logt bij elke aanraking een deprecatiewaarschuwing en verdwijnt; `expo-clipboard` heeft
  bovendien een echte webimplementatie, zodat de browserpreview hetzelfde doet als het toestel.
- **`APP_DEEL_LINK` in `constants/app-info.ts` is een placeholder** (`chronicles.app.link`) en
  wordt door `deelBerichtMetLink()` achter élk bericht geplakt — één plek, dus nergens te vergeten.
  **Firebase Dynamic Links is hier géén vervolgstap**: Google heeft die dienst op 25 augustus 2025
  uitgezet. Wat er wél overblijft staat bij de constante: de Play-listing met een
  `referrer`-parameter (Install Referrer API, geen eigen infrastructuur nodig) of een App Link naar
  een eigen domein met `assetlinks.json`.
- **De berichtteksten staan in i18n onder `deel`**, als functies en niet als sjablonen met
  plakhaakjes — elke taal kiest zijn eigen woordvolgorde. De app-link zit er niet in.

#### De drie vensters over één mijlpaal

Er liggen nu drie lagen over een behaalde mijlpaal, en ze beantwoorden elk een andere vraag:

| | Wat het beantwoordt | Wanneer |
|---|---|---|
| `PrestatieMelding` (strook) | "er is iets gebeurd" | zodra hij binnenkomt |
| `AchievementUnlockModal` | "wat is dit, en wanneer verdiende ik het" | een tik verderop |
| `ShareAchievementModal` | "hoe deel ik het" | automatisch, of via de deelknop |

- **`use-prestaties.ts` opent het deelvenster nu zelf** bij een nieuwe mijlpaal op de voorgrond —
  behalve wanneer `prestatie-store.onderbrekingBezet` aan staat. Die vlag wordt door de reader
  gezet zolang `CharacterUnlockModal` of `AdModal` in beeld is, en bestaat om precies één reden:
  een verhaal uitlezen levert bijna altijd tegelijk een mijlpaal op (één verhaal, acht
  hoofdstukken, één personage), en de zwaarste onderbreking is in dit project gereserveerd voor
  het ontgrendelde personage. In dat geval valt de aankondiging terug op de strook, die niets
  blokkeert. **Haal die vlag niet weg** — zonder haar valt een deelvenster over de
  personageviering heen.
- **Alle drie hangen één keer in de root layout** en worden gestuurd door `prestatie-store`
  (`teVieren` / `detailId` / `deelId`). `toonDelen` en `toonDetail` wissen elkaar, dus er staan er
  nooit twee tegelijk open. Geen van de drie staat in `partialize` — een bewaarde mijlpaal zou
  dagen later opnieuw over het scherm schuiven.
- De deelknop in `AchievementUnlockModal` roept niet meer rechtstreeks `deel()` aan maar
  `toonDelen(id)`; het markeren van `shared` in `achievement-store` gebeurt nu in het deelvenster.

#### Citaten delen (`share-quote-button.tsx`)

Een klein deel-icoontje onder elke `tekst`- en elk `citaat`-blok. **Alleen die twee**: een kop, een
weetje of een sleutelmoment leest los van zijn hoofdstuk als een fragment zonder houvast. Het is
bewust een icoon en geen knop met tekst — vijftien blokken maal een knop met "Share this quote"
maakt van een leesscherm een werkbalk.

`BlokWeergave` heeft er twee optionele props voor gekregen (`verhaalTitel`, `verhaalId`), en de
knop verschijnt **alleen als `verhaalTitel` er is** — zonder titel valt het bericht niet te bouwen.
De reader is de enige aanroeper die hem meegeeft.

#### Uitnodigingen (`referral-store.ts`, `types/referral.ts`, `public.referrals`)

- **Dit synchroniseert naar Supabase, niet naar Firestore.** Firestore zit niet in dit project, en
  Firebase staat sinds de MVP volledig uit achter `EXPO_PUBLIC_FIREBASE_ENABLED`. Een tweede
  backend voor één tabel zou twee sessies en twee autorisatiemodellen betekenen. `referral-store`
  is dus de **zevende regel in `SYNC_STORES`** en volgt hetzelfde contract als de andere zes.
- **De code is de eerste acht tekens van het gebruiker-id, in hoofdletters, zonder streepjes**
  (`codeVoor()`). `referral_code` is `unique`, zodat een botsing een fout is en niet twee lezers
  die elkaars vrienden krijgen.
- **`generateReferralCode()` is geen zuivere getter**: hij schrijft bij de eerste aanroep de rij
  aan. Roep hem aan vanuit een effect of een handler, nooit tijdens het renderen.
- **De andere kant bestaat nog niet: een vriend die de code invoert.** Dat kán niet client-side —
  RLS geeft een lezer alleen zijn eigen rij, dus hij kan geen vreemde rij op `referral_code`
  opzoeken (en zou dat ook niet moeten kunnen). Dat wordt een `security definer` RPC, in de trant
  van `hoofdstuk_interactie`. Het scherm zegt dat ook met zoveel woorden
  (`referral.nogNietActief`) in plaats van een teller op nul te laten staan zonder uitleg.
- **De beloningen worden in `abonnement-store` verzilverd**, niet hier: daar woont de vraag "mag
  deze lezer dit verhaal openen". Twee nieuwe velden daar — `bonusVerhalen` (extra *nieuwe*
  verhalen, bewust **niet** aan een dag gebonden, afgeboekt in `registreerVerhaalGeopend` op het
  moment dat de bonus écht een deur opent) en `proTot` (epoch-ms; een tijdelijke Pro-periode
  verloopt door het verstrijken van tijd, dus er wordt niets opgeruimd).
  `isProActief(state, nu)` neemt het peilmoment als parameter zodat een selector niet tijdens het
  renderen de klok afleest; `useAbonnement()` levert het aan met een `useState` + AppState-listener,
  precies zoals `useStreak()`.
- **Het scherm is `src/app/profiel/invite-friends.tsx`, niet `(tabs)/profiel/invite-friends.tsx`.**
  Zelfde reden als bij `profiel/settings` en `profiel/upload-avatar`: `(tabs)/profiel.tsx` mag niet
  worden verwijderd en zou anders dezelfde route `/profiel` opeisen. De ingang is een regel in de
  Account-sectie van Instellingen.
- `public.referrals` heeft RLS met `auth.uid() = user_id` op select/insert/update en **geen
  delete-policy** — verwijderen loopt via de `delete-account` edge function en de cascade op
  `auth.users`. `wisLokaleGebruikersgegevens()` wist de rij ook lokaal, om dezelfde reden als bij
  de personages: anders tilt de samenvoeging bij de volgende login de gegevens van de verwijderde
  lezer naar het nieuwe account.

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
unlocking the next chapter literally reveals a picture. **All 20 stories (160 chapters) have a
scene** — Ashoka's eight closed the last gap — the Oudheid landed in B2, the other 15 in B2b. A chapter without one would just render
text, so nothing breaks if a future story arrives before its images. Generation:
`npm run generate:images:scenes` (`scripts/generate-scene-images.mjs` — same download/`--only`/
`--force` approach as the portrait script, `aspect_ratio: '16:9'`, one shared style suffix, and it
survives a single failed prompt instead of aborting the batch).

All 20 portraits are **local bundled assets** (20 files, 20 `require()` entries, no gaps). `assets/images/characters/<verhaal-id>.webp` — the
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

### Account deletion & data requests (`supabase/functions/delete-account`, `useDeleteAccount.ts`)

Instellingen → *Delete account* → one confirmation, and the account is gone: server and device,
immediately, no mail in between. **This is the only Supabase edge function in the project.**

- **The delete cannot happen in the app, and the obvious version fails silently.** Every table has
  RLS with select/insert/update policies and **no delete policy** — a `.delete()` for which no
  policy exists touches **zero rows and returns no error**, so a client-side version reports
  success while nothing is gone. And `auth.users` is out of reach for a client anyway: leave that
  row and the account still logs in.
- **One `auth.admin.deleteUser`, the rest cascades.** Every FK to `auth.users` is
  `on delete cascade` (checked, all seven tables), so the user row takes `profiles`, `voortgang`,
  `story_progress`, `character_unlocks`, `poll_responses`, `user_choices` and `feedback` with it
  in one transaction. Don't replace it with seven deletes — those can half-fail.
- **The function only ever deletes its caller.** The id comes from `auth.getUser(token)`, never
  from the body; there is no parameter naming a user. `verify_jwt` is on, so an anonymous POST is
  refused by the gateway before the code runs (verified: OPTIONS still passes, so the web preview's
  CORS preflight works).
- **`wisLokaleGebruikersgegevens()` in `src/store/lokale-gegevens.ts` wipes the device too, and it
  is not optional.** The three progress stores *merge* local into server at the next login
  (`voegServerVoortgangSamen`), so leaving the data behind means the next account created on this
  device inherits the deleted reader's chapters, characters and streak — and uploads them. Avatar,
  email preferences and the daily story counter go too; language, theme, the reminder and the
  analytics consent stay, because they describe the device, and resetting the analytics switch to
  its default would silently re-enable a measurement someone turned off. **Do not call this on
  logout** — logout promises the opposite.
- **The screen does not navigate.** `AuthPoort` sees the empty session and goes to `/login`, same
  as logout.
- **`supabase/functions/` is excluded from `tsconfig.json`, `eslint.config.js` and `.easignore`** —
  it is Deno code (`jsr:` imports, `Deno.serve`), so the app's type-check would fail on it and an
  app build has no business shipping it. It also means a fresh Supabase project does **not** have
  the function; deploy it separately.
- **A data copy is a mailto, on purpose.** Instellingen → *Request my data* prefills subject and
  body to `SUPPORT_EMAIL`. An in-app export would be a second edge function plus a file format for
  a handful of rows; what the GDPR requires is a route that arrives and an answer within 30 days,
  and `docs/privacy-policy.html` promises exactly that. Those requests are handled by hand.

### Release & store assets (`eas.json`, `store/`, LAUNCH-PLAN.md A3/A6)

`docs/` holds what gets *published* (the privacy policy); **`store/` holds what gets *uploaded* to
the Play Console** — `listing.md` (all copy plus the answer to every Console field), `README.md`
(the steps that need an Expo login or the Console), `feature-graphic.html` and `assets/`.

- **`eas.json`**: `production` builds an AAB, `preview` an installable APK. `cli.appVersionSource`
  is **`"remote"`**, so EAS owns the versionCode — the counter lives on the server and
  `autoIncrement` bumps it per production build (it stood at **6** after the first AAB).
  **`android.versionCode` is deliberately absent from `app.json`**: eas-cli ignores it under a
  remote source and says so on every build, and a stale number there reads like the truth when it
  isn't. Local `expo run:android` builds fall back to 1, which is fine — they never reach Play.
  Ask EAS for the real number with `npm run eas -- build:version:get --platform android`. Both
  submit profiles are `releaseStatus: "draft"` so an upload never rolls out by itself.
- **`eas-cli` is deliberately *not* a dependency.** It used to sit in `devDependencies`; that broke
  every cloud build. EAS runs `npm ci --include=dev` with **npm 10**, which wants
  `node_modules/eas-cli/node_modules/typescript@5.9.3` for `@expo/require-utils`' optional peer,
  while local **npm 11** leaves it out of the lockfile — so `npm ci` passed here and failed there,
  every time, in the first two seconds. The `build:android:*` / `submit:android*` scripts go
  through `npm run eas --` (`npx eas-cli@^21.4.0`), so nothing about the workflow changed. **Don't
  add it back**, and if you ever change dependencies, sanity-check with
  `npx npm@10 ci --include=dev --dry-run`, not just the local npm.
- **The Supabase keys live on EAS, not in the build.** `.env.local` is ignored, so a cloud build
  has no `EXPO_PUBLIC_SUPABASE_*` and `src/lib/supabase.ts` throws at import — the app would crash
  on its first frame with no clue why. Both values are EAS **project environment variables**
  (plain text, in `development`/`preview`/`production`; the publishable key ships in the bundle
  anyway). Each profile in `eas.json` names its `environment` explicitly. Check with
  `npm run eas -- env:list production`; a new EXPO_PUBLIC_ variable has to be added there too.
- **`.easignore` exists and it *replaces* every `.gitignore`** ("if .easignore exists, .gitignore
  files are not used" — `eas-cli/build/vcs/local.js`), so it is a superset and a rule you add only
  to `.gitignore` has no effect on what gets uploaded. It exists because `.claude/skills/` holds
  symlinks into the ignored `.agents/`, and Windows refuses to copy a symlink without developer
  mode: the upload died on `EPERM: operation not permitted, symlink`.
- `eas config` refuses to run without a logged-in account, so eas.json is validated offline against
  `@expo/eas-json` from `node_modules` instead — same parser eas-cli uses. That only worked while
  eas-cli was installed; use `npm run eas -- config` now that you are logged in.
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

### Interactief lezen (`src/lib/interactief.ts`, `use-interactie.ts`, Supabase)

Quiz, peiling en keuzepunt onder een hoofdstuk. **Dit is de enige laag waar leescontent van de
server komt** — de verhalen zelf zitten in de bundel en werken offline, deze niet.

- Vijf tabellen: `story_quizzes` / `story_polls` / `story_choices` (de vragen, alleen leesbaar) en
  `poll_responses` / `user_choices` (de antwoorden, één rij per gebruiker per vraag).
  **`chapter_index` bevat `Chapter.id` en telt vanaf 1**, niet vanaf 0; een check-constraint
  `>= 1` legt dat vast, want de kolomnaam suggereert het tegendeel.
- **De reader doet één aanroep, niet zes**: de RPC `hoofdstuk_interactie(story_id, chapter_index)`
  geeft de vragen, de uitslagen én je eigen antwoord in één `jsonb` terug. Hij is
  `security definer` omdat een uitslag een *aggregaat* is: client-side tellen zou betekenen dat je
  alle rijen van `poll_responses` mag lezen, en dan lees je meteen wie wat gestemd heeft. De
  RLS-policies daarop geven je dus alleen je **eigen** rijen; aantallen komen uitsluitend uit de
  RPC. `anon` heeft nergens toegang — de hele app zit achter `AuthPoort`.
- **De schrijf-policies zijn `auth.uid() = user_id`, niet `auth.role() = 'authenticated'`.** Die
  tweede controleert alleen dát je ingelogd bent, niet wíe je bent: iedereen kon er een rij met
  andermans `user_id` mee invoegen en een peiling volstemmen. Unique constraints op
  `(poll_id, user_id)` en `(choice_id, user_id)` houden dubbel stemmen tegen; de client schrijft
  met `ignoreDuplicates` (`on conflict do nothing`), zodat daar geen update-policy voor nodig is.
- **Alles is additief en blokkeert niets.** `InteractieveSectie` staat ná de blokken en vóór de
  advertentiebalk, rendert `null` bij laden, mislukken óf een hoofdstuk zonder interactie, en laat
  "Mark Complete" ongemoeid. Een mislukte fetch geeft géén foutmelding: de app kan "netwerk stuk"
  niet onderscheiden van "hier is niets", en de meeste hoofdstukken hebben niets — een melding zou
  offline dus onder vrijwel elk hoofdstuk verschijnen over iets dat er niet was.
- **Quizantwoorden worden niet bewaard** (er is geen `quiz_responses`-tabel): een quiz is een
  zelftest tijdens het lezen, geen cijfer. De uitslag verschijnt **inline**, niet in een modal —
  die zwaarte is voor het ontgrendelde personage en de onderbreking daarna.
- **Een keuzepunt vertakt het verhaal niet, en de tekst belooft dat ook niet.** Hier stond
  "your choice affects the story"; er is geen tweede versie van hoofdstuk 4. Wat je ná je keuze
  ziet is wél echt: hoe andere lezers besloten. Zelfde afweging als bij de paywall.
- Stemmen zijn **optimistisch** en draaien terug als het schrijven mislukt. Bewust geen offline
  wachtrij zoals bij de voortgangssync — een stem is een losse mededeling, geen groeiende
  toestand.
- Seed-data zit in de database, niet in de repo. Alle 20 verhalen hebben nu interactie; de
  Oudheid-vijf (`julius-caesar`, `spartacus`, `rome-rise`, `pompeii-disaster`, `marie-curie`)
  is met de hand geschreven, de andere vijftien komen uit `generate-interactive-content.mjs`
  (zie hieronder). Unique constraints op `(story_id, chapter_index, question)` en
  `(story_id, choice_point_id)` maken opnieuw seeden idempotent.

#### Interactie genereren (`scripts/audit-interactive-content.mjs`, `generate-interactive-content.mjs`)

```bash
npm run audit:interactief                    # wie heeft wel/geen interactie (--json, --check)
npm run generate:interactief -- --only <id>  # schrijven; ook de "template" voor een nieuw verhaal
npm run generate:interactief -- --apply      # na het nalezen: naar Supabase
```

- **Beide scripts hebben `SUPABASE_SERVICE_ROLE_KEY` nodig, en dat is geen luiheid.** De drie
  tabellen hebben precies één policy: `select` voor `authenticated`. Een select met de
  publishable key (rol `anon`) geeft daardoor **nul rijen en geen foutmelding** — een audit die
  dat gelooft meldt dat álle verhalen leeg zijn, ook de vijf die dat niet zijn. `eisLeesbareTelling()`
  in `scripts/interactief-hulp.mjs` weigert daarom conclusies te trekken uit een blinde telling,
  en `--apply` weigert helemaal. De sleutel hoort in `.env.local` en **nooit** achter een
  `EXPO_PUBLIC_`-voorvoegsel: dan bakt babel hem in de app-bundel.
- **Genereren en toepassen zijn twee stappen.** Een quiz heeft een juist antwoord — een
  historische bewering die de app als waar toont. Het script controleert wat een machine kan
  controleren (bestaat het hoofdstuknummer in dít verhaal, valt het antwoord binnen de opties,
  zijn de vragen uniek, passen de aantallen binnen de check-constraints) en legt de rest in
  `scripts/seed/interactief/<id>.json` + `seed.sql` neer om na te lezen. Zonder `--apply` raakt
  het de database niet aan.
- De prompt krijgt de **echte hoofdstuktekst** uit de bundel mee, niet alleen de titel, en de
  geldige hoofdstuknummers. Daar staat ook in dat een keuzepunt niets vertakt — anders schrijft
  het model "your choice changes the story", precies wat hierboven bewust is weggehaald.
- Structured outputs (`output_config.format`) accepteert **geen `minItems` groter dan 1**; de
  aantallen (2-3 quizzen, 4 opties, …) staan daarom in de prompt en worden door de validatie in
  het script afgedwongen, niet door het schema.
- Er is géén admin-knop in de app die dit aanroept, en die moet er ook niet komen: de
  Anthropic-sleutel zou dan in de bundel zitten en de insert zou hoe dan ook op RLS stuklopen.
  Zie `scripts/seed/interactief/README.md`.

### Ads (`src/components/ad-banner.tsx`, LAUNCH-PLAN.md A4)

**`ADS_ENABLED` is `false` and `<AdBanner />` renders `null`.** The banner was a placeholder box
reading "Advertisement", and `useAbonnement()` hardcodes `isPremium: false`, so every user saw it —
a classic Play rejection reason. Per the no-delete convention the component, all four call sites
(`collectie/[id]`, `regio/[id]`, `tijdperk/[id]`, `verhaal/[id]/reader`) and the
`advertentie.label` i18n key all stay put; v1.1 flips one flag alongside a real AdMob integration.
Don't re-enable it while it's still a placeholder.

### Gratis vs Pro (`src/constants/monetisatie.ts`, `abonnement-store.ts`)

Het gratis model is: een beperkt aantal **nieuwe** verhalen per dag, plus één onderbreking aan het
eind van een uitgelezen verhaal. Pro heft beide op. Alle schakelaars staan in
**`src/constants/monetisatie.ts`** — `DAGELIJKSE_VERHAAL_LIMIET` (2), `VERHAAL_LIMIET_ENABLED` en
`AD_ONDERBREKING_ENABLED`, allebei nu `true`.

- **Allebei die vlaggen zijn releaseblokkers zolang Billing een stub is**, en zwaarder dan
  `PRO_BANNER_ENABLED`: een limiet die alleen met een aankoop opgeheven kan worden terwijl er niets
  te kopen valt, is een muur zonder deur. Zet ze op `false` vóór de productiebuild, of lever ze
  samen met een werkende aankoop.
- **`useAbonnement()` telt sinds Fase 2A twee dingen bij elkaar op**: het serverabonnement uit
  `subscription-store` (`isAbonnementActief`) **óf** het lokale tegoed uit `abonnement-store`
  (`isProActief`, de week Pro uit een uitnodiging). Wie één van beide heeft, heeft Pro. Beide
  helften verlopen door tijd, dus het peilmoment komt als parameter binnen — vorm van
  `useStreak()`. Eén bron voor banner, advertenties, de onderbreking in de reader en de regel
  "Your plan". **De `__DEV__`-schakelaar "Simulate Pro" is eruit**: die zette alleen
  `abonnement-store.isPro` en dus een Pro-ervaring die op een tweede toestel niet bestond. Pro
  bekijken doe je nu door in te loggen met het premium testaccount uit `docs/TEST_ACCOUNTS.md`.
  `setPro` staat er nog en is ongebruikt.
- **De dagelijkse limiet kijkt hier sinds de rate limiting óók naar**, via **`heeftProNu()`** in
  `abonnement-store`: dezelfde optelsom als `useAbonnement()`, maar als losse functie voor een
  beslissing op één moment in plaats van als hook voor de weergave. Hier stond dat dit niet kón
  omdat `magVerhaalOpenen` een methode *van* die store is — dat was een ontwerpafspraak en geen
  technische onmogelijkheid; `abonnement-store` importeert nu `isAbonnementActief` uit
  `subscription-store`, en die afhankelijkheid loopt maar één kant op. **Twee antwoorden op "heeft
  deze lezer Pro" is precies de bug die hier stond: wijzig ze samen.**
- **De limiet telt per account, niet per toestel.** `gestarteVerhalen` staat in AsyncStorage, dus
  twee telefoons gaven elk hun eigen dagvoorraad. `src/lib/leeslimiet.ts` schrijft daarom bij elk
  eerste openen een rij in `public.user_daily_reads` en leest vóór de poort terug wat de server
  voor vandaag kent; `voegServerVerhalenSamen` legt dat bij de lokale lijst. **Een vereniging, geen
  vervanging** — zelfde regel als `voegServerVoortgangSamen`, want de insert is fire-and-forget en
  een vervanging zou een zojuist geopend verhaal weer uit de telling wissen.
- **De serverronde faalt open, met een eigen tijdslimiet (2,5s).** `haalVerhalenVandaagOp` geeft
  `null` bij offline, een 401 of traagheid — iets anders dan een lege lijst — en dan beslist de
  lokale stand. Een leeslimiet die dichtklapt zodra het netwerk wegvalt is erger dan een limiet die
  een keer te ruim uitpakt, en dit staat vóór de poort: wachten op een hangende verbinding is een
  scherm dat niet opengaat.
- **De limiet telt verhaal-id's, geen aantallen.** `gestarteVerhalen` + `dagSleutel` (lokale
  datumsleutel, via `vandaagSleutel()` uit `voortgang-store` — dezelfde functie als de streak, niet
  een tweede eigen datumberekening). Een teller die per bezoek ophoogt telt hetzelfde verhaal na
  élk hoofdstuk opnieuw, want de reader gaat met `router.back()` terug naar het overzicht.
- **De dag rolt om bij het schrijven, niet bij het lezen.** `magVerhaalOpenen` is een zuivere
  functie van de state; alleen `registreerVerhaalGeopend` reset de lijst. Een getter die state zet
  is een component die tijdens zijn eigen render muteert.
- **De poort staat in `verhaal/[id]/chapters.tsx`**, de trechter waar elke route naar een verhaal
  doorheen komt — in de reader zou het te laat zijn. Hij wacht eerst op de hydratie van
  `story-progress-store` én `abonnement-store` (`wachtOpHydratie`), want vlak na een koude start
  lijkt een uitgelezen verhaal ongelezen en de teller leeg. **Een uitgelezen verhaal kost geen
  plek** en een verhaal dat vandaag al open ging ook niet: de limiet doseert nieuwe inhoud, hij
  zet je eigen collectie niet op slot.
- `story-limit-modal.tsx` heeft geen kruisje — "Come back tomorrow" sluit én verlaat het verhaal,
  anders staar je naar een overzicht dat je niet mag openen. `ad-modal.tsx` verschijnt ná het
  ontgrendelen van het personage (nooit ertussen) en is een **placeholder die dat ook zegt**; de
  reader beslist zelf of hij komt (`toontOnderbreking`), want een `AdModal` die `null` rendert zou
  het scherm laten wachten op een `onClose` die nooit komt.
#### `subscription-store.ts` — de serverkant (Billing Fase 1)

**Er zijn nu twee stores die over het abonnement gaan, en dat is met opzet tijdelijk.**
`abonnement-store` is device-lokaal (de dagteller `gestarteVerhalen`, `bonusVerhalen`, en het
tegoed `proTot`); **`subscription-store` is de spiegel van `public.user_subscriptions`** — tier,
proefperiode, einddatum, auto-renew.

- **De serverrij wint, en dat is sinds Fase 2A ook zo geregeld.** `useAbonnement()` leest beide en
  geeft Pro zodra één van de twee loopt; het zijn twee verschillende dingen (een abonnement op het
  *account* naast een tegoed op dít *toestel*), dus ze worden opgeteld en niet tegen elkaar
  afgewogen. Enige uitzondering is `magVerhaalOpenen` — zie de waarschuwing hierboven.
- **`isPremium()` is `tier === 'premium'` én een datum die nog loopt.** Een rij die op premium
  blijft staan met verlopen data geeft `false`: een abonnement verloopt door tijd, niet door een
  veldwissel. Zelfde redenering als `proTot` en `useStreak()`.
- **De store wordt niet ge`persist`-eerd, maar cachet de serverrij wél handmatig** onder
  `subscription_<user_id>`. Die cache is er niet om de state te herstellen maar om na een mislukte
  ronde (offline) terug te vallen op de laatst bekende stand — een betalende lezer in de trein
  hoort zijn Pro niet kwijt te raken. `wisAbonnementCache()` ruimt hem op bij accountverwijdering.
- **`loadSubscription` gebruikt `maybeSingle()` en maakt een ontbrekende rij zelf aan.** De
  backfill dekte alleen de gebruikers die er tóén waren; wie zich daarna registreert heeft geen
  rij, en `single()` maakt van dat normale geval een fout. Zelfde aanpak als `maakGebruikersrijen`
  voor `profiles`/`voortgang`. Er is bewust géén trigger op `auth.users` — dit project provisioneert
  gebruikersrijen client-side.
- 🚩 **`setPremium()` is uitgecommentarieerd tot Billing er is** — in de interface én in de store.
  Het was een placeholder met een gat erin: de client schreef rechtstreeks naar zijn eigen rij en
  de update-policy staat dat toe, dus een lezer kon zichzelf premium maken. Hij had geen enkele
  aanroeper, dus uitzetten kostte niets. Bij Billing keert hij terug als aanroep van een edge
  function die de bon bij Google verifieert, en **gaat de update-policy op `user_subscriptions`
  eraf**. **`setTrial()` heeft hetzelfde gat en staat nog wél aan** (ook zonder aanroeper) — die
  moet bij dezelfde stap mee. Premium zetten gebeurt tot die tijd met de hand in Supabase; de twee
  testaccounts en het SQL'tje staan in `docs/TEST_ACCOUNTS.md` (gitignored — `docs/` wordt via
  GitHub Pages publiek geserveerd).
- `public.user_daily_reads` (append-only: select + insert, geen update/delete) **wordt sinds de
  rate limiting geschreven én gelezen**, door `src/lib/leeslimiet.ts`. Er is bewust **geen unique
  constraint** op `(user_id, story_id, dag)`: het is een logboek, dus dubbele rijen zijn geen fout
  en de leeskant telt unieke `story_id`'s in plaats van rijen. De schrijfkant slaat een verhaal
  over dat vandaag al geteld was, anders schrijft elke terugkeer uit de reader (`router.back()`)
  een rij bij. De index `idx_user_daily_reads_user_read_at` dekt precies de vensteropvraging.
- **De dag is de lokale dag van het toestel** (`vandaagSleutel()`, dezelfde als de streak), en de
  grenzen gaan als echte momenten naar Postgres. De valkuil die `dagGrenzen()` vermijdt is
  `setUTCHours(0,0,0,0)`: dat is middernacht in Greenwich. In Amsterdam (UTC+2) valt een verhaal
  dat om 00:30 lokaal opengaat dán buiten het venster — elke nacht een gratis extra verhaal — en
  wordt de eerste lezing van morgen aan vandaag toegerekend. Het einde komt uit de kalender
  (`dag + 1`) en niet uit "+ 24 uur", want de nacht van de klokverzetting duurt 23 of 25 uur.

- **E-mailvoorkeuren** (`email-preferences.tsx` + `email-voorkeur-store.ts`) zijn vier lokale
  schakelaars; er wordt nog geen mail verstuurd en de voetnoot onder de sectie zegt dat. De eerste
  drie (maandbrief, nieuwe verhalen, tips) staan sinds deze fase **standaard aan**, aanbiedingen
  blijven uit. Dat is een keuze met een risico dat in de store staat uitgeschreven: een vooraf
  aangevinkte vlag is voor een EU-lezer geen geldige toestemming (AVG art. 4(11)/7), en de enige
  grond die deze stand kan dragen is de *soft opt-in* — eigen, gelijksoortige inhoud, met een
  afmeldlink in **elke** mail. Die afmeldlink is dus geen nice-to-have maar de voorwaarde, en
  afmelden loopt bewust via die link en niet via een tweede route in de app. Een bestaande
  installatie houdt zijn opgeslagen keuzes (de `merge` legt ze over de standaardwaarden). Gaat
  Chronicles ooit mailen, dan horen ze bij het account en niet bij het toestel — dan is dit de
  store die naar Supabase gaat.

### Firebase-schakelaar (`EXPO_PUBLIC_FIREBASE_ENABLED`, `.env`, `app.config.js`)

**Firebase staat uit voor de MVP, en dat is één vlag op drie plekken.** `google-services.json`
bestaat nog niet; zonder dat bestand faalde `expo prebuild` — en dus élke EAS-build — op de
`@react-native-firebase/app`-plugin. De vlag maakt dat een keuze in plaats van een blokkade.

- **`.env` (gecommit, geen geheim) zet `EXPO_PUBLIC_FIREBASE_ENABLED=false`.** `.gitignore` en
  `.easignore` sluiten alleen `.env*.local` uit, dus dit bestand gaat mee naar de cloudbuild. De
  secrets blijven in `.env.local`. **Zet de vlag niet óók als EAS-projectvariabele** zolang hij
  `false` moet zijn: een variabele op EAS wint van `.env`, en dan staat de schakelaar op twee
  plekken waarvan er één niet in de repo te zien is.
- **`firebase-vlag.js` in de repo-root is de enige lezer van die variabele voor de configuratie.**
  `app.config.js` draait onder de Expo-CLI (die `.env` al heeft ingelezen), `react-native.config.js`
  wordt vanuit Gradle aangeroepen (dat niets van `.env` weet). Het helpertje kijkt daarom zelf naar
  `process.env` → `.env.local` → `.env`, in die volgorde, en valt bij twijfel terug op *uit*.
- **De build deblokkeren kostte twee stappen, niet één.** Dat is de val in deze wijziging.
  1. **`app.config.js`** — een dynamische laag *over* `app.json` (Expo geeft de inhoud daarvan mee
     als `config`, dus `app.json` blijft de basis en hoefde niet omgezet te worden). Staat de vlag
     niet op `'true'`, dan filtert het elke `@react-native-firebase/*`-plugin eruit en laat het
     `android.googleServicesFile` weg. Controleer met `npx expo config --type prebuild --json`.
  2. **`expo.autolinking.exclude` in `package.json`** — want `@react-native-firebase/*` zijn
     gewone **React Native**-modules, geen Expo-modules. Zonder plugin worden ze nog steeds
     geautolinkt en wordt hun manifest nog steeds samengevoegd, en dan faalt de build alsnog:
     `expo-notifications` en `react-native-firebase/messaging` claimen allebei
     `com.google.firebase.messaging.default_notification_color`
     (`@color/notification_icon_color` versus `@color/white`). Alleen stap 1 doen levert dus een
     prebuild op die slaagt en een Gradle-build die op `:app:processDebugMainManifest` sneuvelt.
- **`react-native.config.js` is níét de plek waar dat uitsluiten gebeurt**, hoe logisch dat ook
  lijkt. `expo-modules-autolinking` (SDK 57) laadt het bestand wel, maar zijn
  `dependencies`-overrides bereiken de Android-resolver niet — `platforms: { android: null }` doet
  daar niets. De lijst die het wél leest is `expo.autolinking.exclude` uit `package.json`. Het
  bestand staat er nog, met een comment dat dit vastlegt, voor de CLI-paden die het wel honoreren.
- **En dus bewaakt `app.config.js` die lijst.** `package.json` is statische JSON en kan de vlag
  niet lezen, dus zet je de vlag op `true` terwijl de uitsluitlijst er nog staat, dan krijg je een
  build die slaagt, start, en nooit één meting of push verstuurt. Die combinatie gooit nu een
  foutmelding met de ontbrekende stap erin. Weer aanzetten is daarom: `google-services.json`
  neerzetten, vlag op `true`, **`expo.autolinking.exclude` uit `package.json` halen**, en
  `npx expo prebuild --clean`.
- **`lib/analytics.ts` en `lib/push.ts` hebben dezelfde vlag als eerste regel van hun `laad()`**,
  vóór de `Platform`-controle. Ze konden een ontbrekende SDK al overleven (`sdk === null`), maar
  zonder deze regel zou `getAnalytics()` elke app-start op een niet-geïnitialiseerde Firebase-app
  stuiten — een gevangen fout plus een waarschuwing voor iets dat we bewust hebben uitgezet.
- **De publieke API is niet veranderd.** `analytics.log/logScherm/zetGebruiker/zetEigenschap/…`,
  `useAnalytics()`, `logStoryEvent`, `logInloggen` en de rest bestaan allemaal nog en worden nog
  steeds vanaf elf plekken aangeroepen; ze doen alleen niets meer. Vervang deze module dus **niet**
  door een kleinere stub — dat is een compileerfout op elf plekken en het levert niets op wat de
  vlag niet al doet.
- In `__DEV__` schrijft een uitgezette meting `[Analytics Stub] <naam>: <params>` naar de console
  (`stub()` in `analytics.ts`). Alleen in dev: in een productiebuild is dat ruis. Zo lijkt een
  uitgezette analytics-laag niet op een kapotte.
- De npm-pakketten blijven geïnstalleerd — TypeScript heeft hun typen nodig (`import type` in
  `lib/analytics.ts` en `lib/push.ts`) — maar er wordt geen native code meer van meegebouwd.
- Een JS-reload is niet genoeg om dit door te voeren; het is een native wijziging.

### Analytics (Firebase, `src/lib/analytics.ts`, `hooks/useAnalytics.ts`)

`@react-native-firebase/app` + `/analytics` (v26, **volledig modulair** — er is geen
`analytics()`-default-export meer; het is `getAnalytics()` + losse functies).

- **`src/lib/analytics.ts` is de enige plek die Firebase aanraakt**, en hij gooit nooit. Zelfde
  vorm als `haptics.ts`: bedoelingen, geen API. De module wordt **lui ge`require`d achter een
  `Platform`-controle** — op web bestaat hij niet, en in een dev-client die van vóór deze fase is
  ook niet. Een statische `import` zou de app daar op het eerste frame laten klappen. Mislukt het
  laden één keer, dan wordt het niet opnieuw geprobeerd (`sdk === null`).
- **Namen staan in `src/constants/analytics.ts` (`ANALYTICS_EVENTS` / `USER_PROPERTIES`), nooit
  los in een scherm.** Firebase legt de eerste spelling van een gebeurtenis vast en kan hem daarna
  niet hernoemen of samenvoegen, dus een typefout kost data die je pas maanden later mist. Het
  `as const` is het hele punt: zonder dat is het type `string` en vangt de compiler niets af.
  Tien eigen gebeurtenissen, drie gebruikerseigenschappen — bewust weinig.
- **Firebase verzamelt `login` en `sign_up` NIET vanzelf.** Automatisch verzameld zijn alleen
  `first_open`, `session_start`, `user_engagement`, `app_update`, `os_update` en dergelijke — de
  volledige lijst staat als `ReservedEventNames` in `@react-native-firebase/analytics`, en die
  twee staan er niet in. Het zijn *aanbevolen* events die je zelf logt, waarna Firebase er zijn
  rapporten over nieuwe versus terugkerende lezers mee vult. `logInloggen`/`logRegistreren` in
  `hooks/useAnalytics.ts` doen dat; haal je ze weg, dan is er geen inlog- of registratietrechter.
  `screen_view` gaat via `analytics.logScherm` (→ `logScreenView`), want dát is de weg waarlangs
  het ingebouwde schermrapport en de `screen_class`-dimensie gevuld worden.
- **`useAnalytics()` hoort één keer in de root layout**, net als `useAuth()` en
  `useVoortgangSync()`, en móét ná `useAuth()` staan. Hij past de toestemming toe, zet het
  gebruiker-id (en `null` bij uitloggen), houdt de drie gebruikerseigenschappen bij vanuit de
  stores, en meldt élke schermwissel. Losse gebeurtenissen staan in de schermen zelf.
- **Schermnamen komen uit `useSegments()`, niet uit `usePathname()`.** Het pad bevat het verhaal-id
  (`/verhaal/julius-caesar/reader`), en dan worden negentien verhalen negentien schermen; de
  segmenten houden het patroon vast (`verhaal/[id]/reader`). Groepsmappen (`(tabs)`) vallen weg.
- **`subscription_attempt`, niet `subscription_upgrade` of Firebase' eigen `purchase`.** Billing is
  een stub; een omzetgebeurtenis die geen omzet oplevert vervuilt het omzetrapport blijvend. Er
  gaat om dezelfde reden geen bedrag of valuta in mee, wél `status: 'blocked_no_billing'` en
  `reason`, zodat de rijen uit de stub-periode later te filteren zijn.
- **`ProPaywall` heeft een verplichte `bron`-prop** (`banner` | `settings` | `limit` | `ad`), die
  als `source` in `paywall_viewed` en `subscription_attempt` meegaat. Verplicht en niet optioneel
  met een standaardwaarde: `limit` en `ad` zijn "iemand liep tegen een muur", `banner` en
  `settings` zijn "iemand ging zelf kijken", en dat verschil is de hele conversievraag. Er zijn
  vier aanroepplekken — de compiler wees er twee aan die anders vergeten waren.
- **`story_finished` en `char_unlocked` zijn twee gebeurtenissen**, precies omdat er sinds B4
  een knop tussen zit. Het verschil tussen die aantallen is hoeveel lezers die knop niet indrukken.
- **Toestemming staat in `store/analytics-store.ts` en staat vast aan.** De schakelaar in
  Instellingen → Privacy is eruit: `components/analytics-preferences.tsx` toont de regel nu als
  "Always on" en niets zet `toestemming` nog op `false`. De store blijft bestaan, dus terugdraaien
  is één component. **Weeg dat af vóór een EU-release**: `docs/README.md` had al staan dat
  "Optional" in Data Safety alleen mag zolang de schakelaar bestaat, dus de drie Analytics-rijen
  staan daar nu op **Required**, en `docs/privacy-policy.html` biedt in plaats van een knop een
  bezwaar per e-mail plus accountverwijdering. Bewust device-lokaal: Firebase telt per installatie,
  dus dit hoort *niet* bij de stores die naar Supabase gaan. Wie hem op `false` zet moet ook
  `firebase_analytics_collection_enabled=false` in het manifest zetten: de runtime-schakelaar komt
  te laat om de app-start zelf nog tegen te houden.
- **`src/app/profiel/analytics.tsx` is een grafsteen.** Daar stond een `__DEV__`-dashboard dat
  toonde of de native module in deze build zat, of er toestemming was, het projectid en het
  app-instance-id. Het is eruit gehaald omdat de cijfers in de Firebase Console horen — maar het
  toonde géén cijfers (Firebase heeft geen API waarmee een app zijn eigen DAU opvraagt; dat is de
  Data API met een serviceaccount, dus een sleutel in de bundel). **Wat wegviel is de diagnose:**
  "waarom zie ik niets in Firebase" is bijna altijd "de dev-client is niet opnieuw gebouwd" of "je
  kijkt op web". De vervanging is `analytics.beschikbaar` uit `lib/analytics.ts`, of de
  waarschuwing die die module zelf één keer logt.
- **`google-services.json` hoort in de repo-root en moet gecommit worden**, niet in `android/`:
  die map staat in `.gitignore` én in `.easignore` (EAS draait zijn eigen prebuild), dus een
  bestand daar overleeft geen `prebuild --clean` en bereikt de cloudbuild nooit. `app.json` wijst
  er met `expo.android.googleServicesFile` naar. **Zonder dat bestand faalt `expo prebuild`** —
  bewust luidruchtig, want een build waar Analytics stilletjes uit is gevallen is erger.
- **Native module**: na het pullen van deze wijziging is een JS-reload niet genoeg, de dev client
  moet opnieuw gebouwd worden (`npx expo run:android`). Vergeet je dat, dan blijft `laad()` in
  `lib/analytics.ts` `null` teruggeven en logt hij één waarschuwing — de app werkt gewoon door.
- **Data Safety en de privacypagina zijn bijgewerkt.** `docs/README.md` (inclusief de val
  "approximate location": Firebase leidt land af uit het IP, ook zonder locatiepermissie) én
  `docs/privacy-policy.html`, die nu account, sync, peilingantwoorden, feedback en analytics
  beschrijft in plaats van "Chronicles collects nothing". Wat er nog ontbreekt is de
  verwerkingsregio van Supabase — vul die in vóór publicatie als je een expliciete
  EU-doorgifteclausule wilt.

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
| `components/prestatie-raster.tsx` | mijlpalen alleen nog op Voortgang (`achievements-grid.tsx`) |
| `VasteMeldingRegel` in `components/notification-preferences.tsx` | streak-/mijlpaalregels uit Instellingen gehaald |
| `components/placeholder-screen.tsx` | Voortgang/Profiel are fully built |
| `components/profile-card-collection.tsx` | superseded by `profile-character-collection.tsx` (kaarten i.p.v. cirkelraster) |
| `verhaal/[id]/quiz.tsx`, `verhaal/[id]/chapter-quiz.tsx` | quizzes removed; now tombstone screens |
| `profiel/analytics.tsx` | dev analytics dashboard removed; now a tombstone screen |
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

**`FEATURE-STATUS.md` is its companion and is also current**: LAUNCH-PLAN says what is *planned*,
FEATURE-STATUS says what is *true* — a per-feature audit checked against the live database, the
source and the build tooling, recording for each feature what works, what is only wired up, and
what has never actually run. Where the two disagree, FEATURE-STATUS was measured.

## Current state

**`FEATURE-STATUS.md` in the repo root is a full per-feature audit** (19 Aug 2026) checked against
the live Supabase project, the source, and the build tooling — not against these docs. Read it
before trusting any "done" below; it records what each feature's code does, what has actually
*run*, and what is only wired up. The summary:

### ✅ COMPLETE — built, wired, nothing outside the repo needed

Data model, design system, three tabs, era rows on Home, the chapter reader with persisted
per-chapter progress, bundled portraits and chapter scenes, the six block types, motion + haptics,
character unlock + Profiel collection grid, streaks (local dates, expiring, only a finished chapter
counts), full i18n (en/nl/fr/de) with a language picker, theme picker, email preferences, and:

- **Interactive reading** — 5 tables with RLS, the `security definer` RPC `hoofdstuk_interactie`,
  142 seeded rows; quizzes and polls cover **20/20** stories, choice points **18/20**. Choices
  deliberately do not branch, and the copy does not claim they do.
- **Progress screen** — 4 stat cards, 6 era bars, 14 badges, all reading the *correct* stores
  (`telVoltooideHoofdstukken`, `useStreak()`, derived milestone state — not the lagging
  `achievement-store`).
- **Achievements** — `public.achievements` holds 14 rows matching `prestaties.ts` id-for-id,
  modal mounted once in the root layout, share sets the flag only on `gedeeld`/`gekopieerd`, and
  all 14 names exist in **all four** languages.
- **Settings & email** — six sections; reminder/streak/achievements locked "Always on"; email
  defaults are newsletter/new-stories/tips **on**, offers **off**; usage stats always on.
- **Supabase integration** — 17 tables, RLS on every one, 32 policies (zero DELETE policies, by
  design), 3 edge functions ACTIVE, 5 stores in `SYNC_STORES` with NetInfo + foreground triggers.

### ⚠️ PARTIAL — the code is finished, but it cannot run as-is

**"Code complete" is not "working."** These three are fully written and fully non-functional:

- **Firebase Analytics** — all 14 events are wired to real call sites and 3 user properties are
  maintained, but **`google-services.json` is absent**, so the SDK never loads *and*
  `expo prebuild` — hence every EAS build — fails. No data has ever reached the console, and none
  can until that file exists.
- **Push notifications** — both edge functions deployed, schema + `story_catalog` (20) + the
  `push_kandidaten` RPC + the hourly cron job all in place and verified. But `user_devices` is
  **0 rows** and `notifications_sent` is **0 rows**: the FCM half has never delivered once. Three
  things are missing, all outside the code — `google-services.json`, a Firebase service account,
  and the Vault secret `service_role_key` (whose absence is what keeps the armed cron inert).
  The three *local* notifications (daily reminder, streak, milestones) do work.
- **GDPR** — account deletion genuinely deletes (edge function deployed, cascade verified, local
  wipe correct) and the data-request mailto is live. But the **privacy policy is written and not
  published**: `PRIVACY_BELEID_URL` is still the placeholder, so Settings hides the link. Play
  requires a reachable URL. Terms of service have no document at all.

### ⏳ IN PROGRESS / NOT STARTED

- **Google Play Billing — NOT STARTED.** A stub. `useAbonnement()` reads the server row plus the
  local credit; premium is set by hand in Supabase, and `setPremium()` is disabled.
- **AdMob — NOT STARTED.** `ADS_ENABLED` is `false` and `<AdBanner />` renders `null`; the
  interstitial is a placeholder that says so.
- **Collections — NOT STARTED.** `collecties.ts` exports `[]`.
- **Rich block types outside the Oudheid (B3b)** — deferred to v1.1. No code is missing; it is
  fact-checked writing.
- **Terms of service** — no document exists.

Known gaps:
- **Collections are empty** (`collecties.ts` exports `[]`) — Home's Storylines row and
  `collectie/[id]` show nothing until it's re-curated.
- **`ashoka-maurya` is English-only** — the twentieth story was autogenerated, so every
  `VertaaldVeld` on it has only an `en` key and `v()` falls back to English in NL/FR/DE. Its
  portrait and its eight scenes exist now; the text is the remaining gap.
- **Only the Oudheid has the rich block types** (`kop`/`weetje`/`sleutelmoment`) — the other five
  eras read as a wall of paragraphs. That's **B3b**, deferred to v1.1: no code is missing (types,
  renderer, validation and word count all handle them), it's genuine fact-checked writing.
  ~~Scene images~~ are done — B2b landed all 152 in Fase 6.5, **31 MB** of `assets/images/scenes/`
  (~205 KB each). That is the single biggest thing in the bundle; if the download size ever needs
  to come down, lower the resolution or `output_quality` in `scripts/generate-scene-images.mjs` and
  regenerate, don't recompress files one by one.
- **Most preference stores still don't sync.** `voortgang-store`, `story-progress-store` and
  `character-unlock-store` do since R8.SYNC-B, and **`notificatie-store` joined them** with the
  push work — the reminder, its time and the two push categories now live in
  `public.notification_preferences` and follow the account to a second device. Still device-local:
  language, theme, the **avatar** (`profile-store`), the **email preferences**
  (`email-voorkeur-store`) — the `profiles` row has `language`/`theme` columns that nothing writes
  yet, and no avatar or email column at all (a photo avatar would also need Storage for the bytes,
  not just a column). ~~The daily story counter~~ (`abonnement-store`) is no longer only local:
  it still lives in AsyncStorage, but the rate limiting mirrors each first open into
  `public.user_daily_reads` and merges the server's list back in before the gate, so two devices
  now share one daily allowance. It is deliberately **not** an eighth `SYNC_STORES` entry — the
  traffic runs one way and what comes back is only a correction to the count.
- ~~Account deletion is a mailto~~ — **it deletes now**, via the `delete-account` edge function
  (see "Account deletion & data requests"). What is still handwork is the **data copy**:
  Instellingen → "Request my data" opens a prefilled mail to `SUPPORT_EMAIL`
  (`businessdemore@gmail.com`), and every such request has to be answered by hand within
  30 days. An export the app builds itself is deliberately not built.
- **Push notifications are built and scheduled; delivery waits on Firebase.** Schema, both edge
  functions (`send-push`, `push-sweep`), the story catalog, the client wrapper, the preferences UI,
  the milestones and the four-language copy are all in place and deployed; `push_kandidaten` is
  verified against real data. `pg_cron`/`pg_net` **are** now enabled and the hourly job
  `push-sweep-elk-uur` exists, deliberately inert until the Vault secret `service_role_key` is
  created. Two things are still missing and both are outside the code: `google-services.json`
  (same blocker as Analytics) and a Firebase **service account** whose three values go into the
  edge functions' secrets. Until then `push.beschikbaar` is false, the two server categories are
  hidden from Settings, and the three local notifications (daily reminder, streak, milestones)
  work. `npm run check:push` reports exactly which of these is still open. Full runbook in
  `supabase/README-push.md`. **Nothing has been tested against a real device** — an emulator
  without Play services never receives FCM, and the milestone strip uses Reanimated, which is
  unreliable on web.
- ~~🚩 `google-services.json` blocks every build~~ — **it no longer blocks the build.** Firebase
  now sits behind **`EXPO_PUBLIC_FIREBASE_ENABLED` in `.env`**, and for the MVP it is `false`. See
  "Firebase switch" below. `google-services.json` is still absent, so Analytics and the FCM half
  of Push still collect nothing — but `expo prebuild` and EAS builds now succeed.
- ~~The privacy policy still describes a device-only app~~ — **rewritten.**
  `docs/privacy-policy.html` now covers the account, the progress sync, poll/choice answers,
  feedback and Firebase Analytics (including the opt-out and the IP-derived approximate location),
  and `docs/README.md` carries the matching Data Safety answers. Two things are still open: the
  page is **not published** (`PRIVACY_BELEID_URL` in `src/constants/juridisch.ts` is still the
  placeholder, so Settings hides the link), and it does not name Supabase's processing region —
  fill that in if you want an explicit EU-transfer clause. Nothing in the code fails when the page
  is wrong, so this only gets caught by reading it.
- **Google Play Billing is a stub** — nothing can actually be bought. `useAbonnement()` now reads
  the server row (`subscription-store`) as well as the local credit; premium is set **by hand in
  Supabase** (`docs/TEST_ACCOUNTS.md`), the `__DEV__` "Simulate Pro" switch is gone and
  `setPremium()` is commented out. `ADS_ENABLED`
  in `ad-banner.tsx` is still `false`, but **three other flags are on**: `PRO_BANNER_ENABLED`
  (`pro-access-banner.tsx`), and `VERHAAL_LIMIET_ENABLED` + `AD_ONDERBREKING_ENABLED`
  (`constants/monetisatie.ts`). Together they show an offer that cannot be completed *and* gate
  content behind it. Fine for development, **release blockers all three** — flip them to `false`
  before the next production AAB unless Billing has landed in the meantime.
- **Feedback needs `public.feedback`.** `feedback-modal.tsx` inserts into it, so a fresh Supabase
  project needs that table (see the migration `create_feedback_table`) or the send button fails
  with a policy/relation error. Nothing reads the rows yet — they wait in the dashboard.
- **The privacy policy is written but not published.** `PRIVACY_BELEID_URL` in
  `src/constants/juridisch.ts` is still a placeholder, so Profiel hides the "About" section — see
  "Legal & privacy" below.
- **All eight store screenshots are stale.** Fase 8 fixed the reader's safe-area inset, the
  "chapters done" counter and the streak, so `phone-3/4/7` show a header that no longer looks
  like that and the excluded Profiel/Voortgang shots are now worth taking. Recapture before the
  production build — see `store/listing.md`.
- **The release pipeline is linked**: the project is `@quinten1234/chronicles-app`
  (`extra.eas.projectId` in `app.json`), EAS holds the Android keystore
  (`Build Credentials xHGwqm8DSF`) and the Supabase env vars. What still needs the Play Console —
  developer account, service-account key for `eas submit`, the listing itself — is in
  `store/README.md`. Two keystores exist on EAS: one EAS generated (hex alias) and the **default**
  one, alias `chronicles` — that is the local `chronicles.keystore`, uploaded by hand. It is the
  **upload key**: lose the file and its password and no future build can update the listing, so it
  belongs in a password manager, not only on this machine (`*.keystore` is gitignored on purpose).

Root-level `REFACTOR-PLAN.md`, `subagent-prompts.md`, `AUTONOMOUS-OPS.md`, `INTEGRATION-GUIDE.md`,
`AGENT-ORCHESTRATOR.md`, `R9-*.md`, `prompt.md` are historical planning docs. They describe intent,
not necessarily current behaviour — trust the code over them.
