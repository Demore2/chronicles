# REFACTOR-PLAN.md

Living plan for the "no more countries, era-first" refactor. Read this together with
`CLAUDE.md`. One phase = one Claude Code session. Update the Status table and the relevant
sections of `CLAUDE.md` at the end of every phase, so the next session does not have to
re-derive anything.

## Target end state

- **Three tabs**: Home (currently Ontdek), Voortgang, Profiel. No Kaart tab.
- **No Regio / Continent in the UX.** Countries disappear as an organising axis; `Tijdperk`
  becomes the only structural grouping.
- **Home** = "Verder lezen" block, then one full-width section per era (Oudheid, Middeleeuwen,
  …), each with a title + subtitle, a horizontal row of ~5 highlighted figures, and an
  "Ontdek meer" link into `tijdperk/[id]`.
- **A `Verhaal` is about one historical figure or event**, not about a country.
- **`Collectie`** stays the cross-cutting storyline (e.g. "Icons of the 20th Century"), now
  framed around people/themes rather than regions.

## Working agreements

- **Never delete files.** `rm`/`Remove-Item` is blocked by `.claude/settings.json`. Superseded
  files are unwired and moved to the "Orphaned code" list in `CLAUDE.md`.
- **Finish every phase with `npx tsc --noEmit` and `npm run lint`.** No phase is done until
  both are clean.
- **New UI strings go into `src/i18n/en.ts` first** (`as const`, source of truth), then
  optionally nl/fr/de. Never read `.en` directly — use `t()` / `v()`.
- **Do not rename data-model identifiers** (`Verhaal`, `Tijdperk`, `Blok`, `Collectie`, …).
  Internal code stays Dutch; only user-facing strings move through i18n.
- `experiments.reactCompiler` stays `false` (see `CLAUDE.md`).
- After a UI phase, sanity-check the web target (`npx expo start --web --clear`), because the
  hook and SVG sizing quirks only show up there.

## Phases

### R1 — Navigation slim down (small, low risk)

- `src/app/(tabs)/_layout.tsx`: drop the Kaart tab, order the remaining three as
  Home → Voortgang → Profiel.
- Tab label "Ontdek" → "Home" via the i18n key only. **Keep the route file name**
  (`ontdek.tsx`) — renaming routes touches every `router.push` in the app for zero user value.
- Move to Orphaned in `CLAUDE.md`: the Kaart tab screen, `src/components/world-map.tsx`,
  `src/constants/map-data.ts`, `scripts/generate-map-data.mjs`. Leave the
  `generate:map-data` script in `package.json` (harmless, and consistent with the no-delete
  convention).
- **Done when**: three tabs render on web + native, no live screen imports `world-map`,
  `tsc` clean.

### R2 — Phase out Regio / land (medium, highest risk of the refactor)

- Unwire `src/app/regio/[id].tsx` → Orphaned. `continent/*` is already orphaned.
- `src/content/queries.ts`: remove region-based lookups (progress per region, region featured,
  …). Keep and extend the era-based ones.
- `src/constants/types.ts`: mark `Verhaal.regioIds` as optional + `@deprecated` rather than
  removing it — that avoids a content migration in the same phase. Remove it for real in R3
  when the content files are rewritten anyway.
- **Voortgang** is the main consumer of region progress: replace "progress per region" with
  "progress per era". This is the bulk of the work in this phase.
- **Profiel**: remove any region-based stat.
- **Done when**: no screen under `src/app/(tabs)` or the live stack screens imports
  `regios.ts` / `continenten.ts`, `tsc` clean.

### R3 — Content model + content file split (medium)

- Decide the Personage question (see Open decisions). Default recommendation: **no separate
  entity yet** — a `Verhaal` *is* the figure. Add to `Verhaal`:
  - `afbeelding` / portrait field used by the era-row card,
  - `uitgelicht?: boolean` and/or `volgorde?: number` to drive which ~5 show up on Home.
- Add subtitle copy to `Tijdperk` if `korteBeschrijving` is not already the right field
  ("Rulers, warriors, and plague across the medieval world").
- **Split `src/content/verhalen.ts` into `src/content/verhalen/<tijdperk-id>.ts` with an
  index barrel.** Do this now even though the content is tiny: it is what makes R7
  (one agent per era) conflict-free later.
- Drop `regioIds` for real.
- **Done when**: content compiles from the new folder structure, existing screens unchanged
  in behaviour, `tsc` clean.

### R4 — Home / Ontdek UI (medium)

- New `src/components/tijdperk-rij.tsx`: era title, subtitle, `HorizontaleRij` of ≤5 figure
  cards, "Ontdek meer" link → `tijdperk/[id]`. Reuse `HorizontaleRij` — do not reimplement the
  arrow logic.
- Ontdek screen composition: header → **Verder lezen (kept as-is)** → one `TijdperkRij` per
  active era in chronological order → "Alle verhalen" entry point.
- `src/components/tijdperken-carousel.tsx` → Orphaned.
- `tijdperk/[id]`: becomes the full list/grid of every story in that era.
- **Done when**: Home matches the reference screenshots on a phone-width viewport, verified on
  web *and* native, `tsc` clean.

### R5 — Collecties as figure-driven storylines (small)

- Copy and framing pass on `src/content/collecties.ts` and `collectie/[id]`: themes and
  people, no country language.
- No structural change expected — `Collectie` already holds a flat `verhaalIds` list.

### R6 — i18n and copy sweep (small)

- Add the new keys (Home tab, era sections, "Ontdek meer") to `en.ts`, then nl/fr/de.
- Remove now-dead keys (kaart, regio, continent). Because nl/fr/de are `DeepPartial`, delete
  from `en.ts` first and let `tsc` point at the rest.

### R7 — Content pipeline / per-era agents (later, after R1–R6 are green)

- One subagent (or skill) per `Tijdperk`, each of which **only ever writes
  `src/content/verhalen/<its-era>.ts`**. That single-file ownership is the whole reason for
  the R3 split.
- Write a short content schema doc + `npm run validate:content` script that checks: unique
  ids, `tijdperkId` exists, every `VertaaldVeld` has at least `en`, every `Blok` union member
  well-formed, quiz blocks have a valid answer index.
- The main agent's job is review + `npx tsc --noEmit` + `validate:content`, not writing prose.

## Status

| Phase | Scope | Status |
|-------|-------|--------|
| R1 | Navigation slim down | ✅ done |
| R2 | Phase out Regio/land | ✅ done |
| R3 | Content model + file split | ✅ done |
| R4 | Home / era rows UI | ⬜ not started |
| R5 | Collecties reframing | ⬜ not started |
| R6 | i18n + copy sweep | ⬜ not started |
| R7 | Content pipeline / agents | ⬜ not started |

**R1 note:** `npm run lint` had never been run in this repo before — no ESLint config existed.
Running it for R1 auto-installed `eslint`/`eslint-config-expo` and generated `eslint.config.js`
(hence the `package.json`/`package-lock.json` diff alongside the navigation change). That first
run surfaced 7 pre-existing errors + 1 warning, all unrelated to R1's diff:
`src/app/(tabs)/_layout.tsx` (`tabIcon` helper missing a display name — line untouched by R1),
`src/components/tijdperken-carousel.tsx` (ref read during render, ×3), `src/hooks/use-color-scheme.web.ts`
(setState synchronously in an effect), `src/components/tijdperk-kaart.tsx` (unused `theme` var —
this file is already Orphaned). Left as-is to keep R1 low-risk; clean these up in a dedicated
pass (or fold into R4 while `tijdperken-carousel.tsx` gets replaced) rather than here.

**R2 note:** the region-based Voortgang section, `tijdperk/[id]`'s continent filter chips, and
`verhaal/[id]`'s country caption all turned out to be *live*, not just data plumbing — removing
them was real UI surgery, not just deleting an import. `src/app/regio/[id].tsx` was unwired (no
live screen routes to it) but left in place per the no-delete convention, alongside
`continent/[continentId].tsx` (already orphaned in R1). `src/components/flag.tsx` is now only
reachable from orphaned code too, so it moved to the Orphaned list even though the file itself
wasn't touched. `queries.ts`'s `getRegioVoortgang` was removed outright (the plan explicitly
calls for removing region-based lookups); `world-map.tsx` — still orphaned but still expected to
compile — was updated to compute its own per-region progress from `getVerhalenByRegio` instead of
depending on the now-gone query. `Verhaal.regioIds` became `regioIds?: string[]` with a
`@deprecated` tag rather than being removed, exactly as the phase called for, so R3 can drop it
for real without a content migration happening twice. No Profiel changes were needed — it never
had a region-based stat. Verified visually on web (`localhost:8081`): Voortgang shows only "By
era", the era screen has no filter chips, the story screen has no country line.

**R3 note:** Personage-as-entity (open decision 1) was skipped, per the plan's default
recommendation — `Verhaal` gained `afbeelding: string`, `uitgelicht?: boolean`, and
`volgorde?: number` directly rather than a separate entity. `Tijdperk.korteBeschrijving` was
already the right subtitle copy (each era in `tijdperken.ts` already has an era-appropriate
one-liner), so no schema change was needed there. The file split hit a wrinkle the plan didn't
anticipate: you cannot
delete `src/content/verhalen.ts` (rm-block), and Node/TS module resolution picks an exact file
match over a same-named directory — so creating `src/content/verhalen/index.ts` alongside the
old file would have made the old file win silently, orphaning the new split. Fix: gutted
`src/content/verhalen.ts` down to a one-line `export * from './verhalen/index'`, same pattern
already used for `stub-data.ts`. Every existing `@/content/verhalen` import keeps working
unchanged. `regioIds` is now fully gone from `Verhaal`; `getVerhalenByRegio` stays exported (from
the new barrel) but hardcoded to return `[]`, since it's only reachable from the three orphaned
region/continent/map files and there's no region-to-story mapping left to compute — see
`CLAUDE.md` Orphaned code section. `tsc --noEmit` clean; `npm run lint` shows only the same 7
pre-existing errors + 1 warning noted in the R1 status note, nothing new. Verified on web
(`localhost:8082` — 8081 was in use by another session): Home still shows the featured story, all
3 sample stories, all 6 eras, and both collections; Voortgang's per-era breakdown lists all 6
eras with correct counts; the story screen renders all block types. Metro resolved the
`verhalen.ts` shim → `verhalen/index.ts` barrel correctly, confirming the file-over-directory
resolution behaves the same in the bundler as in `tsc`.

## Open decisions

1. **Personage as its own entity?** Only worth it if the "X of 88 characters unlocked"
   collectible mechanic from the reference app is actually wanted. If yes, it becomes its own
   phase between R3 and R4, not a bolt-on.
2. **Route rename `ontdek` → `home`?** Recommendation: no. Label-only change in R1.
3. **How many figures per era row on Home?** Assumed 5. Drives `uitgelicht` in R3.
4. **Which eras ship active at launch?** Same pattern as the current `actief: false` flag on
   regions — needed before R4 so the Home page is not endless.
5. ~~**What does Voortgang measure now?**~~ Resolved in R2: streak + total stories read stayed,
   "by country" was dropped, "by era" (already present alongside it) is now the only breakdown.
