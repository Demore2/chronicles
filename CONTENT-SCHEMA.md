# CONTENT-SCHEMA.md

Reference for anyone writing `Verhaal` content (REFACTOR-PLAN.md phase R7). Read this together
with `src/constants/types.ts`, which is the source of truth if the two ever disagree.

## File ownership

One file per era: `src/content/verhalen/<tijdperk-id>.ts`, each exporting a single
`verhalen: Verhaal[]` array. **Only edit your own era's file.** Never touch another era's file,
the index barrel (`src/content/verhalen/index.ts`), `src/content/verhalen.ts`, or
`src/constants/tijdperken.ts`. Cross-cutting fixes (id collisions across eras, `collecties.ts`
references, the Home hero pick in `queries.ts`) are the reviewing agent's job, not yours.

Valid `tijdperkId` values (must match `src/constants/tijdperken.ts` exactly): `oudheid`,
`middeleeuwen`, `vroegmoderne-tijd`, `industriele-revolutie`, `twintigste-eeuw`, `hedendaags`.

## `Verhaal` fields

```ts
{
  id: string;               // kebab-case, unique across ALL eras, stable (don't rename once other files reference it)
  titel: VertaaldVeld;       // story title
  ondertitel: VertaaldVeld;  // one-line subtitle
  teaser: VertaaldVeld;      // one sentence, shown on cards — hook, not summary
  jaar: number;              // negative for BC/BCE (e.g. -1754 for 1754 BC)
  periodeLabel: string;      // plain display string, e.g. '1754 BC', '800', 'c. 1440' — NOT a VertaaldVeld
  afbeelding: string;        // not yet rendered anywhere; use 'placeholder'
  uitgelicht?: boolean;      // eligible for the Home hero slot — optional, most stories omit this
  volgorde?: number;         // display order within the era row (1, 2, 3, ...); stories without it sort last
  tijdperkId: string;        // must be this file's era id
  themas: string[];          // free-form lowercase tags, e.g. ['power', 'law']
  leestijdMinuten: number;   // integer, realistic for the actual blokken word count (usually 2-4)
  blokken: Blok[];           // ordered content, see below — at least one block
}
```

- `id` is kebab-case derived from an evocative phrase, not the figure's name (matches existing
  style: `crown-for-new-empire`, `a-library-for-the-world`), so it stays a spoiler-free URL/route
  segment.
- Every `VertaaldVeld` needs at least `en` (real content stays English-only — do not add
  `nl`/`fr`/`de` unless asked).

## `Blok` union (`src/components/blok-weergave.tsx` renders these)

```ts
| { type: 'tekst'; inhoud: VertaaldVeld }
| { type: 'afbeelding'; bron: string; alt: VertaaldVeld; bijschrift?: VertaaldVeld }
| { type: 'citaat'; tekst: VertaaldVeld; bron: VertaaldVeld }
| { type: 'quiz'; vraag: VertaaldVeld; antwoord: boolean; uitleg: VertaaldVeld }
```

- `tekst`: a short narrative paragraph (2-5 sentences), present tense, written like the existing
  placeholders — vivid and concrete, not a textbook summary.
- `afbeelding`: `bron` is always `'placeholder'` for now (no real image assets exist yet); still
  write a real `alt` and `bijschrift` as if the image existed.
- `citaat`: use a real, well-attested quote where one exists; otherwise a plausible paraphrase
  attributed to a role/source, not invented and attributed to a named person as if verbatim.
- `quiz`: `vraag` is a true/false statement (not multiple choice — `antwoord` is a `boolean`),
  `uitleg` explains the answer in 1-2 sentences.

A typical story has 1-4 blocks: at least one `tekst`, and optionally one each of `afbeelding`,
`citaat`, `quiz` for variety (not every story needs every type — see the placeholder content for
the range currently in use).

## Historical accuracy

Stick to well-established, uncontroversial history — the kind found in any general encyclopedia.
Don't invent events, dates, or quotes. Prefer figures/events with enough documented detail to
support 2-3 concrete sentences without padding. Avoid framing a story around a country or region
as the subject (REFACTOR-PLAN.md's "no more countries" goal) — center it on a person, moment, or
event instead.

## Validation

`npm run validate:content` checks structural correctness (unique ids, valid `tijdperkId`, every
`VertaaldVeld` has `en`, every block variant has its required fields, `quiz.antwoord` is a
boolean). It does **not** check historical accuracy, writing quality, or cross-file references
like `collecties.ts` — those are manual review.
