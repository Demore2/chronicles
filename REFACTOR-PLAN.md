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
| R4 | Home / era rows UI | ✅ done |
| R5 | Collecties reframing | ✅ done |
| R6 | i18n + copy sweep | ✅ done |
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

**R4 note:** before writing code, asked the user how to reconcile the plan's literal Home
composition line (header → Verder lezen → era rows → "Alle verhalen" entry point) with the three
existing sections it doesn't mention (hero/"Featured", "Storylines"/collecties, "Newly added") —
dropping them would have orphaned the only Home entry point into Collecties, with no replacement
specified anywhere in the plan. User chose the low-risk option: keep those three sections as-is,
and only replace the "Per tijdperk" carousel section. So no "Alle verhalen" entry point was
built (every era already has its own "Discover more" → `tijdperk/[id]` full-list link; a
cross-era "browse everything" screen didn't exist before and wasn't requested). `Tijdperk` gained
`actief: boolean` (open decision 4, resolved below) — `true` for the three eras that currently
have content (Middle Ages, Early Modern Period, 20th Century), `false` for the three still-empty
ones (Antiquity, Industrial Revolution, Contemporary Era). New: `src/components/tijdperk-rij.tsx`
(`TijdperkRij`) reuses `HorizontaleRij` + the existing `VerhaalKaart` (no new card component —
`VerhaalKaart` already renders the `Illustratie` color-placeholder + title + period label that
counts as a "figure card"; `Verhaal.afbeelding` still isn't read anywhere, since there are no real
image assets yet) and `getUitgelichteVerhalenVoorTijdperk()` (new, in `queries.ts`) sorts by
`volgorde` (falling back to the end for stories without one) instead of by `jaar`, capped at 5.
`tijdperk/[id]` needed no changes — it already rendered every story in the era, chronologically,
with no other grouping. `tijdperken-carousel.tsx` is now orphaned (unwired from `(tabs)/index.tsx`
only — not deleted, per the no-delete convention). The old "Per tijdperk" section heading
(`ontdek.perTijdperk` i18n key) is now dead — left in `en.ts` for R6 to remove, since R6 is
explicitly the copy-sweep phase. `tsc --noEmit` clean; `npm run lint` shows only the same
pre-existing baseline noted in R1/R3 (now including `tijdperken-carousel.tsx`'s ref-during-render
errors, since that file is unreachable from any live screen but still compiles and still lints).
Verified on web (`localhost:8082` — 8081 was in use by another session): Home shows the three
active-era rows in chronological order, each with its one sample story and a working "Discover
more" link into that era's full list; a direct visit to an inactive era's `tijdperk/[id]` (e.g.
`oudheid`) still renders correctly with the existing "No stories" empty state, confirming inactive
eras are simply not linked from Home rather than being broken.

**Post-R4 addendum:** at the user's request, 2 short placeholder stories were added to each of
the three still-empty era files (Antiquity, Industrial Revolution, Contemporary Era), and all six
`Tijdperk.actief` flags were set to `true` — purely to preview the full Home layout with every era
row populated. These are marked `TIJDELIJK` in each era file and are explicitly **not** R7 content;
the user asked for them to be replaced when R7 starts. R7's per-era agents should overwrite their
era's placeholder stories rather than add to them.

**R5 note:** `collecties.ts` copy already had no country language going in (no `Regio`/`land`
references in either `beschrijving`, and `collectie/[id].tsx` shows no country caption — that
screen needed no changes). What R5 actually fixed: both collections leaned on the same 3 sample
stories that existed before R4's placeholder expansion, including `rebuilding-after-the-war`
appearing in *both* "Power and Conflict" and "Trade and Progress" — an odd overlap for two
supposedly distinct storylines, and it under-used the fact that every era now has (placeholder)
content. Re-curated using each story's `themas` tags: "Power and Conflict" is now
`crown-for-new-empire` (middeleeuwen) → `storming-a-fortress-for-liberty` (vroegmoderne-tijd) →
`rebuilding-after-the-war` (twintigste-eeuw); "Trade and Progress" is now
`a-library-for-the-world` (oudheid) → `the-company-sets-sail` (vroegmoderne-tijd) →
`steam-power-takes-the-rails` (industriele-revolutie) — no more overlap, and each storyline now
spans 3 eras instead of 2. Descriptions were reworded from era/event language ("Empires, wars...",
"Merchants, journeys...") to person/role language ("Kings, crowds...", "Scholars, merchants...")
per the target end state's "framed around people/themes" goal — kept to role nouns (king, crowd,
scholar) rather than named individuals, since the underlying stories are still anonymous
`TIJDELIJK` placeholders with no named figures yet. Added a code comment to `collecties.ts` noting
that `verhaalIds` currently point at placeholder story ids, and that `getVerhalenVoorCollectie()`
silently drops ids that stop resolving — so R7 agents replacing an era's placeholder stories should
double-check these two lists don't quietly shrink. No change to the `Collectie` type or
`collectie/[id].tsx`, per the plan's "no structural change expected". `tsc --noEmit` clean;
`npm run lint` shows only the same pre-existing baseline from R1/R3/R4 (unrelated files). Verified
on web (`localhost:8083` — 8081/8082 were in use by other sessions, so `.claude/launch.json`'s web
config was given an explicit `--port 8083` since `expo start` prompts interactively on a port
conflict instead of honoring `autoPort`): Home's "Verhaallijnen" row still shows both storyline
cards, and both `/collectie/<id>` screens show the new description and all 3 re-curated stories in
era order with no duplicates.

**R6 note:** the "add new keys" half of this phase turned out to already be done — `tabs.ontdek`
("Home"), `ontdek.verhaallijnen`/`ontdekMeer` and friends were all added incrementally in R1/R4
as those features landed, and all four languages (en/nl/fr/de) already had full parity for every
live key (no missing nl/fr/de translations to backfill). So R6 was really just the "remove
now-dead keys" half. Removed from all four `src/i18n/*.ts` files: `tabs.kaart` (never actually
read — the Kaart `Tabs.Screen` has no `title` option, `href: null` alone hides it),
`ontdek.perTijdperk` (flagged dead in the R4 note — superseded by the per-era `TijdperkRij`
sections), `voortgang.perLand`/`legeLandenTitel`/`legeLandenBeschrijving` (region-based Voortgang
section removed in R2, these three keys were the only leftover), and the entire `kaart`/`regio`/
`continent` top-level sections. Deleted from `en.ts` first and let `tsc` point at the rest, per
the plan's instruction — nl/fr/de had matching entries for all of them (nothing was already
partially-missing there). The `kaart`/`regio`/`continent` keys were still *read*, just only by the
three orphaned screens (`(tabs)/kaart.tsx`, `regio/[id].tsx`, `continent/[continentId].tsx`) that
CLAUDE.md's Orphaned-code section commits to keeping compilable — removing the keys without
touching those screens would have broken that invariant. Followed the precedent set in R2 (where
`world-map.tsx` was patched to keep compiling after `getRegioVoortgang` was removed) and inlined
literal English strings in those three files in place of the removed `t((s) => s.kaart.titel)` /
`s.regio.*` / `s.continent.*` lookups, dropping the now-unused `t` destructure from each
(`v(...)` calls for content fields stayed, since those keys weren't touched). No i18n keys were
harmed that are reachable from a live screen. `tsc --noEmit` clean; `npm run lint` shows only the
same pre-existing baseline from R1/R3/R4/R5 (unrelated files). Verified on web (`localhost:8083`):
Home, Voortgang (era breakdown only, no country section), Profiel, and both `/collectie/<id>`
screens all render unchanged.

## Open decisions

1. **Personage as its own entity?** Only worth it if the "X of 88 characters unlocked"
   collectible mechanic from the reference app is actually wanted. If yes, it becomes its own
   phase between R3 and R4, not a bolt-on.
2. **Route rename `ontdek` → `home`?** Recommendation: no. Label-only change in R1.
3. **How many figures per era row on Home?** Assumed 5. Drives `uitgelicht` in R3.
4. ~~**Which eras ship active at launch?**~~ Resolved in R4: added `Tijdperk.actief: boolean`,
   same pattern as the old `Regio`/`Continent.actief`. Currently `true` for the three eras with
   content (Middle Ages, Early Modern Period, 20th Century), `false` for the three still empty
   (Antiquity, Industrial Revolution, Contemporary Era) — flip to `true` in `tijdperken.ts` as R7
   fills in each era's content file.
5. ~~**What does Voortgang measure now?**~~ Resolved in R2: streak + total stories read stayed,
   "by country" was dropped, "by era" (already present alongside it) is now the only breakdown.
