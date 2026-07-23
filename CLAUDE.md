# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # install dependencies
npx expo start                 # dev server (press w/a/i, or use one of the scripts below)
npm run web                    # dev server, web target
npm run android                # dev server, Android
npm run ios                    # dev server, iOS
npx tsc --noEmit                # type-check the whole project — run this after any change
npm run lint                    # expo lint
npm run generate:map-data       # regenerate src/constants/map-data.ts from Natural Earth data
npm run validate:content         # structural check of src/content/verhalen/**, collecties.ts
```

There is no test suite in this repo — don't invent test commands. `npx tsc --noEmit` is the
primary correctness check and should be run before considering a change done. When editing
content (`src/content/verhalen/*.ts`, `collecties.ts`), also run `npm run validate:content` — see
`CONTENT-SCHEMA.md` for the schema/style rules it checks against.

**Content verification procedure** (after writing new stories):
1. Run `npx tsc --noEmit` (all types must pass)
2. Run `npm run validate:content` (all content must validate)
3. Start dev server (`npm run web`)
4. Test story flow in browser: Navigate to each new story → verify all 8 chapters load → click through at least 3 chapters → verify: "Mark Complete" button works → "Take Quiz" button appears → quiz can be answered → "Continue" button navigates to next chapter → repeat for at least one more chapter. Do NOT consider content "done" until chapter navigation is verified end-to-end.

Web preview quirk: **`experiments.reactCompiler` in `app.json` is deliberately set to `false`.**
It was `true` originally, but it miscompiles custom hooks that return more than one plain
function value — `useVertaling()` returns `{ t, v, ... }` and calling `v(...)` threw
`TypeError: v is not a function` at runtime (TypeScript was clean; this only showed up in the
browser). Reproduce with `npx expo start --web --clear` before re-enabling it, and re-test the
hook-heavy screens (Ontdek, Voortgang) if you ever flip it back on.

File deletion (`rm`, `Remove-Item`) is blocked by `.claude/settings.json` in this project. Dead
code from superseded features is left in place rather than deleted (see "Orphaned code" below) —
follow that convention rather than fighting the block.

## Architecture

Expo Router app (file-based routing under `src/app`, TypeScript, Zustand for state,
AsyncStorage for persistence). Three bottom tabs (`src/app/(tabs)/`): Ontdek (route file kept,
tab label "Home"), Voortgang (Progress), Profiel (Profile) — the Kaart tab was dropped in
REFACTOR-PLAN.md phase R1, see "Orphaned code" below. Live stack screens outside the tab group
(`collectie/[id]`, `tijdperk/[id]`, `verhaal/[id]`) use a shared custom `AppHeader`
(`src/app/_layout.tsx`) but usually hide its title (`options={{ title: '' }}`) in favor of their
own colored header block, so that the back chevron still comes from `AppHeader`. `regio/[id]`
still exists but is orphaned as of phase R2 (see "Orphaned code" below) — no live screen links to
it anymore.

### Data model (`src/constants/types.ts`)

`Continent` → `Regio` (country, tied to the map via `iso2` and `continentId`) → `Tijdperk`
(era) and `Verhaal` (story) are the core content types. Since REFACTOR-PLAN.md phase R2,
`Regio`/`Continent` are no longer part of the UX, and `Tijdperk` is the only structural grouping
live screens use. `Tijdperk` gained `actief: boolean` in R4 (same convention as the old
`Regio`/`Continent.actief`) — only eras with real content are `actief: true`, and only those show
a row on Home (`getActieveTijdperken()` in `src/constants/tijdperken.ts`); flip an era to `actief:
true` there once R7 fills in its content file. `Verhaal.regioIds` was dropped for real in R3 (was
`optional`/`@deprecated` since R2) — `Verhaal` is now the figure/event itself, with `afbeelding`
(portrait/cover image source — still unused for real rendering; every screen still shows a
solid-color `Illustratie` placeholder instead, same as before R4) plus optional `uitgelicht` (Home
hero eligibility) and `volgorde` (display order within its `tijdperk`, used since R4 by
`getUitgelichteVerhalenVoorTijdperk` in `src/content/queries.ts` to pick the ~5 figures shown per
era row on Home). A `Verhaal` belongs to one `tijdperkId` and holds an ordered `blokken: Blok[]`
array where
`Blok` is a tagged union (`tekst` | `afbeelding` | `citaat` | `quiz`) rendered by
`src/components/blok-weergave.tsx`. `Collectie` is a curated cross-cutting list of `verhaalIds`
(a "storyline"/theme, not tied to era or region).

Content lives in `src/content/verhalen/<tijdperk-id>.ts` (one file per era, each exporting a
`verhalen: Verhaal[]`) plus an index barrel (`src/content/verhalen/index.ts`) that concatenates
them and exposes `getVerhaal`/`getVerhalenByTijdperk` — this split (REFACTOR-PLAN.md R3) is what
lets R7 give each era its own agent without merge conflicts. `src/content/verhalen.ts` (the old
single file) still exists only as a one-line `export * from './verhalen/index'` re-export — it
couldn't be deleted (rm-block, see above), and Node/TS module resolution picks a file over a
same-named directory, so `@/content/verhalen` imports actually resolve to this shim, which
forwards to the real barrel. Import from `@/content/verhalen` as before; don't import the
directory path directly except when adding a new per-era file. `src/content/collecties.ts` is
unsplit (small, cross-cutting, not era-partitioned). `src/content/queries.ts` has the derived
lookups (progress by era, "featured", "next story", etc. — the region-based `getRegioVoortgang`
was removed in R2) — add new cross-cutting queries there rather than inline in screens.

All user-visible text fields on these types (`titel`, `naam`, `periode`,
`korteBeschrijving`, `beschrijving`, and every string inside `Blok`) are typed as
`VertaaldVeld = { en: string; nl?; fr?; de? }`, not plain `string`. Resolve them with the `v()`
helper from `useVertaling()`, never by reading `.en` or a language key directly — content is
allowed to have only `en` filled in (real content is still English-only in
`src/content/verhalen/`), and `v()` is what falls back to English.

**Do not rename these data-model identifiers** (`Verhaal`, `Tijdperk`, `Blok`, `Collectie`, etc.)
— internal code stays Dutch by convention (see below); only user-facing *strings* move through
i18n.

### i18n (`src/i18n/`, `src/hooks/use-vertaling.ts`)

Two independent translation concerns, both driven by `useVertaling()`:

- **UI strings** live in `src/i18n/{en,nl,fr,de}.ts`, all shaped like `en.ts` (the source of
  truth — add new keys there first). `en.ts` uses `as const`; the other three are typed
  `DeepPartial<Vertalingen>` so they can under-translate without breaking the build, and
  `src/i18n/index.ts` deep-merges each language over `en` at read time so a missing key always
  falls back to English (never a blank string or the raw key). Parametrized/pluralized strings
  are **functions**, not template strings (e.g. `voortgang.streak: (n) => ...`), so every
  language can pick its own word order/plural rule. Access via `t(s => s.section.key)`, calling
  the result if it's a function: `t(s => s.verhaal.minLeestijd)(n)`.
- **Content fields** (the `VertaaldVeld`s described above) are resolved with `v(veld)`.

Language preference is `src/store/taal-store.ts` (Zustand + AsyncStorage), seeded once from
`expo-localization` (`en`/`nl`/`fr`/`de` if the system locale matches, else `en`) and then
sticky. Theme preference (`src/store/thema-store.ts`) follows the identical
persisted-Zustand-store pattern but is unrelated to language — see below.

### Theming (`src/constants/theme.ts`, `src/hooks/use-theme.ts`)

Flat beige design system, **light mode is the default** (not system-detected by default).
`Colors.light`/`Colors.dark` in `theme.ts` are the only place colors are defined; the dark
palette is a warm dark brown, not neutral black — keep it that way if you touch it. Theme choice
is Licht/Donker/Systeem via `thema-store.ts`; `useEffectieveKleurenSchema()` resolves the actual
light/dark to render (used by both `useTheme()` and the root layout's navigation `ThemeProvider`,
so native chrome and app content never disagree). Don't read `useColorScheme()` directly in
screens — always go through `useTheme()`.

### Map (`src/components/world-map.tsx`, `src/constants/map-data.ts`)

`map-data.ts` is generated (`npm run generate:map-data`) from Natural Earth 110m data via
`scripts/generate-map-data.mjs` — don't hand-edit it, edit the script and regenerate. Countries
are matched to app `Regio`s by `iso2`; a country with no matching `Regio` (or a `Regio` with no
`Verhaal`s) renders grey/inactive. `WorldMap` measures its own container via `onLayout` and sets
an explicit numeric `width`/`height` on the SVG (derived from `MAP_VIEWBOX`'s aspect ratio) —
don't go back to percentage-based `Svg` sizing, it collapses to the browser's default 300×150 on
web.

### Reusable interaction patterns

- `src/components/horizontale-rij.tsx` (`HorizontaleRij`): horizontal `FlatList` wrapper with
  optional edge arrows (only >768px wide, hidden at scroll start/end, one-item-width step). Used
  by every horizontal row on Ontdek, including inside `TijdperkRij` below.
- `src/components/tijdperk-rij.tsx` (`TijdperkRij`, added R4): one full-width Home section per
  active era — title + `korteBeschrijving` subtitle + "Discover more" link to `tijdperk/[id]`,
  above a `HorizontaleRij` of that era's `VerhaalKaart`s (reused as-is, not a new card type).
  Ontdek (`(tabs)/index.tsx`) renders one per `getActieveTijdperken()` entry, in chronological
  (`nummer`) order.

### Orphaned code (present but not wired up — don't delete, per the rm-block above)

- `src/app/(tabs)/kaart.tsx`, `src/components/world-map.tsx`, `src/constants/map-data.ts`,
  `scripts/generate-map-data.mjs`: Kaart tab dropped in REFACTOR-PLAN.md phase R1 (no more
  Regio/Continent in the UX). The tab route is still registered in `(tabs)/_layout.tsx` with
  `href: null` (same pattern as the orphaned `ontdek` route) so Expo Router doesn't auto-surface
  it. The `generate:map-data` script stays in `package.json` — harmless, and consistent with the
  no-delete convention.
- `src/components/continent-map.tsx` + `src/app/continent/[continentId].tsx`: an earlier
  continent-zoom-then-bottom-sheet flow, superseded by `WorldMap` navigating straight to
  `/regio/[id]`.
- `src/app/regio/[id].tsx`: orphaned in REFACTOR-PLAN.md phase R2 (Regio/land dropped from the
  UX). No live screen routes to it anymore — `(tabs)/voortgang.tsx` no longer has a "by country"
  section, `tijdperk/[id].tsx` no longer has continent filter chips, and `verhaal/[id].tsx` no
  longer shows a country caption. The file still compiles (still imports `getRegio`/
  `getVerhalenByRegio` directly, not through `queries.ts`) but is unreachable from navigation.
  Since R3 dropped `Verhaal.regioIds` for real, `getVerhalenByRegio` (and `world-map.tsx`'s and
  `continent/[continentId].tsx`'s calls to it) now always returns `[]` — it's kept only as a
  no-op so these three orphaned files still compile; don't try to make it filter again without
  reintroducing a region-to-story mapping first.
- `src/components/flag.tsx`: only consumer left is orphaned code (`world-map.tsx`,
  `regio/[id].tsx`) as of R2 — not deleted since it still compiles and may be reused if
  Regio/Continent ever comes back.
- `src/components/tijdperk-kaart.tsx`: superseded by `tijdperken-carousel.tsx` on Ontdek.
- `src/components/tijdperken-carousel.tsx`: superseded in R4 by `tijdperk-rij.tsx` (one row per
  active era, instead of one swipeable carousel of all eras). Still compiles; unwired from
  `(tabs)/index.tsx`.
- `src/components/placeholder-screen.tsx`: unused now that Voortgang/Profiel are fully built.
- `src/app/land/[landId]/...`, `src/components/story-card.tsx`,
  `src/components/tijdperk-section.tsx`: leftovers from the original Land/Categorie content
  model (see `prompt.md`), replaced by Regio/Tijdperk/Verhaal before they were ever wired up.

## Project phasing

Done: data model + design system + 4 tabs + story screens (phases 1–5); Kaart tab with
per-country coloring/progress and direct-to-region navigation (phase 6); Voortgang + streaks,
persisted (phase 7); `useAbonnement()`/`<AdBanner />` placeholders with `TODO`s for Play
Billing/AdMob (phase 8); full i18n (en/nl/fr/de) with a language picker in Profiel; theme picker
(Licht/Donker/Systeem); Ontdek's era section as a carousel (superseded in R4, see below).

Regio/Continent phased out of the live UX (REFACTOR-PLAN.md phase R2): Voortgang shows progress
by era only, `tijdperk/[id]` has no continent filter, `verhaal/[id]` shows no country caption;
`regio/[id].tsx`, `continent/[continentId].tsx`, `world-map.tsx`, `continent-map.tsx`, `flag.tsx`
are all orphaned (see above).

Content model + file split done (REFACTOR-PLAN.md phase R3): `Verhaal.regioIds` dropped for
real; `Verhaal` gained `afbeelding`/`uitgelicht`/`volgorde` (not yet read by any screen — that's
R4); `src/content/verhalen.ts` split into `src/content/verhalen/<tijdperk-id>.ts` + index barrel
(see "Data model" above for the shim-file mechanics). No screen behaviour changed in this phase.

Home / era-rows UI done (REFACTOR-PLAN.md phase R4): `Tijdperk` gained `actief`; the "Per
tijdperk" carousel section was replaced by one `TijdperkRij` per active era (Middle Ages, Early
Modern Period, 20th Century — the three eras with content), each showing up to 5 stories ordered
by `volgorde` with a "Discover more" link into `tijdperk/[id]`. The hero/"Featured" block,
"Storylines" (collecties) row, and "Newly added" row were deliberately kept as-is — the plan's
literal composition line would have dropped them, but doing so would have orphaned the only
Home entry point into Collecties, so only the carousel section was swapped. `tijdperk/[id]`
already matched "full list of every story in that era" with no changes needed.
`tijdperken-carousel.tsx` is now orphaned (see above). `ontdek.perTijdperk` (the old carousel
section's i18n heading) was removed in the R6 copy sweep, along with the other dead i18n keys
(`tabs.kaart`, `voortgang.perLand`/`legeLandenTitel`/`legeLandenBeschrijving`, and the whole
`kaart`/`regio`/`continent` sections) — see REFACTOR-PLAN.md's R6 note for what stayed and why.

Real content done (REFACTOR-PLAN.md phase R7): every `src/content/verhalen/<tijdperk-id>.ts` now
holds 6 real, historically-accurate stories (36 total), written by one subagent per era per the
plan's "one agent per era, one file each" design — see `CONTENT-SCHEMA.md` for the schema/style
rules those agents (and any future content work) should follow, and `npm run validate:content`
(`scripts/validate-content.mjs`) for the structural checks (unique ids, valid `tijdperkId`, every
`VertaaldVeld` has `en`, every `Blok` variant well-formed, `quiz.antwoord` boolean, plus every
`collecties.ts` verhaalId still resolving). The `TIJDELIJK` placeholder stories and comments from
the post-R4 addendum are gone; all six `Tijdperk.actief` flags stay `true` since every era now has
real content. `collecties.ts` still holds only its original 2 collections (re-curated in R5 — see
below), just re-pointed at real story ids instead of placeholders.

Not done: `continenten.ts`/`regios.ts` still hold the old country data but it's now only read by
orphaned code; Google Play Billing and AdMob are still stubs.

Chapter reader system done (R8, 2026-07-22): `src/app/verhaal/[id]/reader.tsx`, 
`src/app/verhaal/[id]/chapters.tsx`, `src/store/story-progress-store.ts`, 
`src/hooks/use-story-progress.ts`. Full reading flow with progress persistence:
- Progress tracked per-chapter (Zustand + AsyncStorage), persists across app restarts
- Chapter unlocking: sequential (must read chapter 1 before 2, etc.)
- Read time calculated from word count (words ÷ 250 = minutes)
- Chapter tiles show: Roman numeral + title + read time (48% width, 2-column grid)
- Reader header: "← Back to Chapters" button (navigation); footer: "Mark Complete" or "Next Chapter" (action)
- Chapters overview: elegant "Home" button (chevron-back + text) top-left in linkerbovenhoek
- Progress shown as X/8 chapters + progress bar + visual checkmarks on completed tiles

Profile redesign & UI cleanup done (R8c, 2026-07-23):
- **Profile screen:** Top stats box showing 3 key metrics (chaptersRead, charactersUnlocked, storiesCompleted), character collection with circular tiles (Optie A: initials + checkmarks for unlocked, grey with "?" for locked)
- **Character circles:** All verhalen displayed as 70px circles in 3-column grid, unlocked = teal with checkmark, locked = grey with "Locked" label. Click unlocked circles to navigate to story.
- **Home screen:** Individual character cards in era sections no longer have "Discover more" buttons; only one "Discover more" button per era section at bottom.
- **Story chapters screen:** Minimalist design with elegant "Home" button (chevron-back + text) positioned absolutely in top-left corner (`position: absolute`, `top: Spacing.three`, `left: Spacing.four`, `zIndex: 10`). No header bar, clean layout.
- **UI principles:** Prefer minimalist, elegant button placements over full-width bars. Character interactions use circles with visual feedback (checkmarks). Section-level CTAs (like "Discover more") go at section bottom, not per-item.

Not done: Google Play Billing and AdMob are still stubs.
