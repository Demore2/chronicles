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
npm run eas -- <cmd>           # eas-cli via npx (it is NOT a dependency — see "Release & store assets")
npm run build:android:preview  # EAS APK build for your own device (needs `npm run eas -- login` first)
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

One optional daily reminder, **off by default**, at a time the user picks (19:00 local to start
with). Same shape as `haptics.ts`: intents, no throwing, no-op on web.

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
- **`useAbonnement()` leest sinds deze fase `abonnement-store`** in plaats van hardcoded `false`
  terug te geven. `isPro` wordt alleen gezet door de **`__DEV__`-schakelaar onderaan Instellingen**
  ("Simulate Pro"), want er is geen Play Billing. Eén bron voor banner, advertenties, limiet en de
  regel "Your plan".
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
- **E-mailvoorkeuren** (`email-preferences.tsx` + `email-voorkeur-store.ts`) zijn vier lokale
  schakelaars; er wordt nog geen mail verstuurd en de voetnoot onder de sectie zegt dat. Ze staan
  **standaard uit**: de AVG kent geen geldige toestemming die je al aangevinkt aantreft. Gaat
  Chronicles ooit mailen, dan horen ze bij het account en niet bij het toestel — dan is dit de
  store die naar Supabase gaat.

### Analytics (Firebase, `src/lib/analytics.ts`, `hooks/useAnalytics.ts`)

`@react-native-firebase/app` + `/analytics` (v26, **volledig modulair** — er is geen
`analytics()`-default-export meer; het is `getAnalytics()` + losse functies).

- **`src/lib/analytics.ts` is de enige plek die Firebase aanraakt**, en hij gooit nooit. Zelfde
  vorm als `haptics.ts`: bedoelingen, geen API. De module wordt **lui ge`require`d achter een
  `Platform`-controle** — op web bestaat hij niet, en in een dev-client die van vóór deze fase is
  ook niet. Een statische `import` zou de app daar op het eerste frame laten klappen. Mislukt het
  laden één keer, dan wordt het niet opnieuw geprobeerd (`sdk === null`).
- **Namen staan in `src/constants/analytics.ts`, nooit los in een scherm.** Firebase legt de
  eerste spelling van een gebeurtenis vast en kan hem daarna niet hernoemen of samenvoegen, dus
  een typefout kost data die je pas maanden later mist. Sleutels Nederlands, waarden Engels — de
  waarde is wat er in het dashboard staat.
- **`login`, `sign_up` en `screen_view` zijn gereserveerd** en gaan níét via `logEvent` (die
  weigert ze). Daarvoor zijn `logInloggen` / `logRegistreren` / `analytics.logScherm`.
- **`useAnalytics()` hoort één keer in de root layout**, net als `useAuth()` en
  `useVoortgangSync()`, en móét ná `useAuth()` staan. Hij past de toestemming toe, zet het
  gebruiker-id (en `null` bij uitloggen), houdt de drie gebruikerseigenschappen bij vanuit de
  stores, en meldt élke schermwissel. Losse gebeurtenissen staan in de schermen zelf.
- **Schermnamen komen uit `useSegments()`, niet uit `usePathname()`.** Het pad bevat het verhaal-id
  (`/verhaal/julius-caesar/reader`), en dan worden negentien verhalen negentien schermen; de
  segmenten houden het patroon vast (`verhaal/[id]/reader`). Groepsmappen (`(tabs)`) vallen weg.
- **`paywall_upgrade_pressed`, niet `subscription_upgrade` of `purchase`.** Billing is een stub;
  een omzetgebeurtenis die geen omzet oplevert vervuilt het omzetrapport blijvend. Er gaat om
  dezelfde reden geen bedrag of valuta in mee.
- **`story_completed` en `character_unlocked` zijn twee gebeurtenissen**, precies omdat er sinds B4
  een knop tussen zit. Het verschil tussen die aantallen is hoeveel lezers die knop niet indrukken.
- **Toestemming staat in `store/analytics-store.ts`, standaard aan**, met een schakelaar in
  Instellingen → Privacy (`components/analytics-preferences.tsx`). Bewust device-lokaal: Firebase
  telt per installatie, dus dit hoort *niet* bij de stores die naar Supabase gaan. Andere afweging
  dan bij de e-mailvoorkeuren (die staan uit) — de redenering staat bij
  `STANDAARD_ANALYTICS_TOESTEMMING`, inclusief wat ertegen pleit. Wie hem op `false` zet moet ook
  `firebase_analytics_collection_enabled=false` in het manifest zetten: de runtime-schakelaar komt
  te laat om de app-start zelf nog tegen te houden.
- **`src/app/profiel/analytics.tsx` is een `__DEV__`-scherm** en toont geen cijfers — Firebase heeft
  geen API waarmee een app zijn eigen DAU kan opvragen (dat is de Data API, met een serviceaccount,
  dus een sleutel in de bundel). Wat het wél beantwoordt is "komt er iets aan, en zo nee waarom
  niet": native module beschikbaar, toestemming, projectid, app-instance-id. Tekst hardgecodeerd in
  het Engels, zoals de "Simulate Pro"-regel — geen lezer ziet het. Zelfde reden als bij
  `(tabs)/profiel.tsx` staat het als stack-scherm naast de tabbladen.
- **`google-services.json` hoort in de repo-root en moet gecommit worden**, niet in `android/`:
  die map staat in `.gitignore` én in `.easignore` (EAS draait zijn eigen prebuild), dus een
  bestand daar overleeft geen `prebuild --clean` en bereikt de cloudbuild nooit. `app.json` wijst
  er met `expo.android.googleServicesFile` naar. **Zonder dat bestand faalt `expo prebuild`** —
  bewust luidruchtig, want een build waar Analytics stilletjes uit is gevallen is erger.
- **Native module**: na het pullen van deze wijziging is een JS-reload niet genoeg, de dev client
  moet opnieuw gebouwd worden (`npx expo run:android`). Het dev-dashboard zegt dat ook als je het
  vergeet.
- **Data Safety en de privacypagina moeten mee.** `docs/README.md` is bijgewerkt (inclusief de val
  "approximate location": Firebase leidt land af uit het IP, ook zonder locatiepermissie);
  `docs/privacy-policy.html` nog niet — zie "Known gaps".

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
| `components/profile-card-collection.tsx` | superseded by `profile-character-collection.tsx` (kaarten i.p.v. cirkelraster) |
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
a finished chapter counts), an optional daily reminder notification at a time you pick, email
preferences, the free/Pro model (daily story limit + one placeholder interstitial, both behind
flags), interactief lezen (quiz/peiling/keuzepunt per hoofdstuk, uit Supabase), full i18n
(en/nl/fr/de) with a language picker, theme picker, Firebase Analytics (opt-out, schakelaar in Instellingen → Privacy).

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
- **The preference stores don't sync.** `voortgang-store`, `story-progress-store` and
  `character-unlock-store` all do since R8.SYNC-B, so a second device gets the same chapters and
  the same collection. Language, theme, the reminder setting (now including its **time**), the
  **avatar** (`profile-store`), the **email preferences** (`email-voorkeur-store`) and the
  **daily story counter** (`abonnement-store`) are all still device-local (the `profiles` row has
  `language`/`theme` columns that nothing writes yet, and no avatar or email column at all — a
  photo avatar would also need Storage for the bytes, not just a column). The story counter being
  local means two devices each get their own daily allowance; that is a Billing-era problem, not a
  today problem.
- **Account deletion is a mailto, not a button that deletes.** Play requires an in-app route for
  apps with accounts; Instellingen offers one and it now works — `SUPPORT_EMAIL` is filled in
  (`businessthedemoreagency@gmail.com`), so "Contact support" and "Delete account" open a real
  mail instead of showing "Soon". **Every deletion request therefore lands in that inbox and has to
  be handled by hand**; an edge function that does it in-app is still open.
- **Firebase Analytics needs `google-services.json` in the repo root.** It is not in the repo —
  create the Firebase project, add an Android app with package `com.chronicles.historyapp`, and
  drop the file there. Until then `expo prebuild` and every EAS build fail on the
  `@react-native-firebase/app` plugin. See "Analytics".
- **The privacy policy still describes a device-only app** — an account and now reading progress
  live on a server. `docs/privacy-policy.html`, the Data Safety answers in `docs/README.md` and
  `src/constants/juridisch.ts` all predate auth and must be updated before the production build.
  Nothing in the code fails when they are wrong.
- **Google Play Billing is a stub** — nothing can actually be bought; `useAbonnement()` now reads
  `abonnement-store`, whose `isPro` only moves via the `__DEV__` "Simulate Pro" switch. `ADS_ENABLED`
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
