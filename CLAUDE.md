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
```

There is no test suite in this repo — don't invent test commands. `npx tsc --noEmit` is the
primary correctness check and should be run before considering a change done.

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
AsyncStorage for persistence). Four bottom tabs (`src/app/(tabs)/`): Ontdek (Discover/home),
Kaart (Map), Voortgang (Progress), Profiel (Profile). Stack screens outside the tab group
(`collectie/[id]`, `tijdperk/[id]`, `verhaal/[id]`, `regio/[id]`) use a shared custom
`AppHeader` (`src/app/_layout.tsx`) but usually hide its title (`options={{ title: '' }}`) in
favor of their own colored header block, so that the back chevron still comes from `AppHeader`.

### Data model (`src/constants/types.ts`)

`Continent` → `Regio` (country, tied to the map via `iso2` and `continentId`) → `Tijdperk`
(era) and `Verhaal` (story) are the core content types. A `Verhaal` belongs to one `tijdperkId`
and one or more `regioIds`, and holds an ordered `blokken: Blok[]` array where `Blok` is a
tagged union (`tekst` | `afbeelding` | `citaat` | `quiz`) rendered by
`src/components/blok-weergave.tsx`. `Collectie` is a curated cross-cutting list of `verhaalIds`
(a "storyline"/theme, not tied to era or region). Content lives in `src/content/verhalen.ts` and
`src/content/collecties.ts`; `src/content/queries.ts` has the derived lookups (progress by
region/era, "featured", "next story", etc.) — add new cross-cutting queries there rather than
inline in screens.

All user-visible text fields on these types (`titel`, `naam`, `periode`,
`korteBeschrijving`, `beschrijving`, and every string inside `Blok`) are typed as
`VertaaldVeld = { en: string; nl?; fr?; de? }`, not plain `string`. Resolve them with the `v()`
helper from `useVertaling()`, never by reading `.en` or a language key directly — content is
allowed to have only `en` filled in (real content is still English-only in
`src/content/verhalen.ts`), and `v()` is what falls back to English.

**Do not rename these data-model identifiers** (`Verhaal`, `Tijdperk`, `Blok`, `Collectie`,
`regioIds`, etc.) — internal code stays Dutch by convention (see below); only user-facing
*strings* move through i18n.

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
  by every horizontal row on Ontdek.
- `src/components/tijdperken-carousel.tsx`: centered "peek" carousel (scale/opacity via
  `Animated`, snap-to-card, dot indicator, same >768px arrow convention as `HorizontaleRij` but
  implemented directly since it needs its own scroll-driven animation).

### Orphaned code (present but not wired up — don't delete, per the rm-block above)

- `src/components/continent-map.tsx` + `src/app/continent/[continentId].tsx`: an earlier
  continent-zoom-then-bottom-sheet flow, superseded by `WorldMap` navigating straight to
  `/regio/[id]`.
- `src/components/tijdperk-kaart.tsx`: superseded by `tijdperken-carousel.tsx` on Ontdek.
- `src/components/placeholder-screen.tsx`: unused now that Voortgang/Profiel are fully built.
- `src/app/land/[landId]/...`, `src/components/story-card.tsx`,
  `src/components/tijdperk-section.tsx`: leftovers from the original Land/Categorie content
  model (see `prompt.md`), replaced by Regio/Tijdperk/Verhaal before they were ever wired up.

## Project phasing

Done: data model + design system + 4 tabs + story screens (phases 1–5); Kaart tab with
per-country coloring/progress and direct-to-region navigation (phase 6); Voortgang + streaks,
persisted (phase 7); `useAbonnement()`/`<AdBanner />` placeholders with `TODO`s for Play
Billing/AdMob (phase 8); full i18n (en/nl/fr/de) with a language picker in Profiel; theme picker
(Licht/Donker/Systeem); Ontdek's era section as a carousel.

Not done: real content — `src/content/verhalen.ts`/`collecties.ts` currently hold a minimal
English-only sample set (3 stories, 2 collections) meant only to exercise every screen; only
Europe/4 countries are wired up (`continenten.ts`/`regios.ts` have the rest defined but
`actief: false`); Google Play Billing and AdMob are still stubs.
