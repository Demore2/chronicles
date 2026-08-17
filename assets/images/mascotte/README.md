# History Book — het merk

De bron van het app-logo. Open **`preview.html`** in een browser voor het overzicht op echte
UI-formaten.

> De map heet nog `mascotte/` omdat hij als mascotte-verkenning begon. Hernoemen kan hier niet
> (verwijderen is geblokkeerd, zie CLAUDE.md), dus de naam blijft even scheef staan.

## Wat er live is

| Bestand | Waar het wordt gebruikt |
|---|---|
| `history-book.svg` | **In de app.** `src/components/splash-screen.tsx`, met `color={theme.accent}`. |
| `history-book-teal.svg` | **Bron van het app-icoon** — zie de pipeline hieronder. |
| `history-book-compact.svg` | Nog nergens. Klaar voor als het merk klein moet (20–48 px). |
| `01-kroniekschrijver-simpel.svg` | **In de app.** Rechtsboven in het Profiel-scherm, nog zonder functie. |

En wat blijft staan zonder gebruikt te worden: `history-book-goud.svg` (de originele goudvariant),
`01-kroniekschrijver.svg` (mét veer en hand), `history-book-origineel.webp` + `HIstory book` (het
aangeleverde raster; die laatste heeft geen extensie en kan weg).

De `*.png`-bestanden zijn 512×512 previews om naar te kijken. **De SVG is de bron.**

## Kleur

- teal `#3B6E7D` = `Colors.light.accent`, crème `#F7F1E4` = `Colors.light.background`.
- `history-book.svg` is getekend in **`currentColor`**, dus de kleur komt van buiten:
  ```tsx
  import Mark from '@/assets/images/mascotte/history-book.svg';
  <Mark width={132} height={132} color={theme.accent} />
  ```
  Dat is niet cosmetisch: op het donkere thema is `accent` `#6FA8B8`, en `#3B6E7D` zou daar op
  `#1C1A16` te weinig contrast houden.
- **Let op bij het renderen naar PNG:** `currentColor` werkt alleen als de SVG *inline* in de
  pagina staat. Via `<img src="history-book.svg">` krijg je een zwart merk, want die img is een
  eigen document.
- `history-book-teal.svg` en `-compact.svg` staan wél vast op crème-op-teal — een app-icoon heeft
  geen thema.

## Icoon opnieuw genereren

`derive-icon-variants.mjs` verwacht een PNG, dus het is twee stappen:

1. Render `history-book-teal.svg` naar 1024×1024 PNG in `assets/images/icon-candidates/`
   (headless Chrome, zelfde aanpak als `scripts/generate-store-assets.mjs`).
2. `node scripts/derive-icon-variants.mjs assets/images/icon-candidates/<die>.png`
   → `app-icon.png`, `app-icon-adaptive.png`, `app-favicon.png`.
3. `npm run generate:store-assets` → `store/assets/icon-512.png` en de feature graphic volgen
   automatisch; beide leiden af van `app-icon.png`.

De native splash (`app-splash.png`) is apart: dat is `history-book.svg` in teal op transparant,
op een crème achtergrond via `app.json`. Bewust géén teal vlak, zodat de overgang naar de app
(ook crème) naadloos is.

`scripts/generate-app-icon.mjs` is de oude Replicate-prompt en levert het vórige icoon op — niet
draaien.

## Hoe de vector tot stand kwam

Het aangeleverde bestand was raster. De geometrie is pixel voor pixel opgemeten en opnieuw
opgebouwd, en daarbij rechtgetrokken: één lijndikte (32 op een canvas van 1024), exacte
spiegelsymmetrie om `x=512` (stond ~8 px uit het midden) en verticaal gecentreerd (stond ~21 px te
hoog). De originele kleuren, voor de goudvariant: lijnwerk `#FDF4CC`, verloop `#744A26` →
`#C89C59`.

Het lijnwerk is dun: onder ~40 px lopen de dubbele kaftlijn en de pagina's dicht. Daarvoor is
`history-book-compact.svg` — kaftlijn en knopje eruit, de rest 1,26× opgeschaald zodat de
lijndikte meegaat naar 40. In `preview.html` staan beide op 40 / 28 / 20 px naast elkaar.
