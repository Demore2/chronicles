# Histora — het merk

De bron van het app-logo. Open **`preview.html`** in een browser voor het overzicht op echte
UI-formaten.

> De map heet nog `mascotte/` omdat hij als mascotte-verkenning begon. Hernoemen kan hier niet
> (verwijderen is geblokkeerd, zie CLAUDE.md), dus de naam blijft even scheef staan.

## Wat er live is

Het merk is sinds de logo-herziening een **blauwe schijf met een witte H**. De boekvariant
(open boek met een H) is vervangen; de bestanden blijven staan, maar niets importeert ze nog.

| Bestand | Waar het wordt gebruikt |
|---|---|
| `histora-mark.svg` | **In de app.** `splash-screen.tsx` (96 px), `login.tsx` en `signup.tsx` (40 px). |
| `histora-mark-tile.svg` | **Bron van het app-icoon** — full bleed, geen schijf. Zie de pipeline hieronder. |
| `histora-mark-compact.svg` | **Bron van het meldingsicoon.** Ring in plaats van schijf, zie "Silhouet". |
| `01-kroniekschrijver-simpel.svg` | **In de app.** Rechtsboven in het Profiel-scherm, nog zonder functie. |

Vervangen en niet meer geïmporteerd: `history-book.svg`, `history-book-teal.svg`,
`history-book-compact.svg`, `history-book-goud.svg`. Verder staat er zonder gebruik
`01-kroniekschrijver.svg` (mét veer en hand) en `history-book-origineel.webp` + `HIstory book`
(het aangeleverde raster; die laatste heeft geen extensie).

De `*.png`-bestanden zijn 512×512 previews om naar te kijken. **De SVG is de bron.**

## Kleur

- Blauw `#0EA5E9`, wit `#FFFFFF`. De halo rond de schijf is hetzelfde blauw op 15%.
- **Vaste kleuren, géén `currentColor`.** Het boekmerk volgde `theme.accent`; dit merk niet.
  Een merkteken is in beide thema's één kleur, en `#0EA5E9` draagt zowel op het beige `#F7F1E4`
  als op het donkerbruine `#1C1A16` — `preview.html` zet ze naast elkaar. De aanroepen geven dus
  geen `color` meer mee:
  ```tsx
  import Mark from '@/assets/images/mascotte/histora-mark.svg';
  <Mark width={96} height={96} />
  ```
- **De H is geometrie, geen `<text>`.** `react-native-svg` zoekt een `font-family` op tegen wat
  het toestel heeft — "Arial, sans-serif" is op Android Roboto — dus een letter als tekst rendert
  per platform anders breed. Drie rechthoeken renderen overal hetzelfde, op elk formaat.
- **Er zit geen `feGaussianBlur` in.** De diepte komt van de halo. SVG-filters zijn de zwakste
  hoek van `react-native-svg`, en een gloed die op één platform stilletjes wegvalt is erger dan
  geen gloed.
- **Let op bij het renderen naar PNG:** een SVG via `<img src>` is een eigen document. Voor de
  vaste kleuren maakt dat nu niet meer uit, maar de scripts inlinen de markup nog steeds — houd
  dat zo als er ooit weer `currentColor` in komt.

## Silhouet (meldingsicoon)

Android hertekent élke niet-transparante pixel van een meldingsicoon in de tintkleur. Een gevulde
schijf met een witte H wordt daardoor één witte vlek en de H verdwijnt mee. `histora-mark-compact.svg`
tekent daarom een **ring** in plaats van een schijf; ring en letter overleven het platslaan samen
als één leesbare vorm. `npm run generate:notification-icon` strippt het achtergrondvlak en zet
crème om naar wit — en meet na dat er niets zwarts en niet te veel dekking overblijft.

## Icoon opnieuw genereren

`derive-icon-variants.mjs` verwacht een PNG, dus het is drie stappen:

1. `npm run generate:logo` → `assets/images/icon-candidates/histora-mark-tile-1024.png` (de
   icoonbron) én `assets/images/app-splash.png` (het merk op transparant).
2. `node scripts/derive-icon-variants.mjs assets/images/icon-candidates/histora-mark-tile-1024.png`
   → `app-icon.png`, `app-icon-adaptive.png`, `app-favicon.png`.
3. `npm run generate:store-assets` → `store/assets/icon-512.png` en de feature graphic volgen
   automatisch; beide leiden af van `app-icon.png`.

De tegel heeft bewust géén schijf: een launcher-icoon wordt zelf al tot een cirkel of squircle
gemaskeerd, dus een tweede cirkel erin verkleint alleen de letter. De H staat daar om dezelfde
reden groter (400×520 in plaats van 276×360).

De native splash (`app-splash.png`) is het merk mét schijf op **transparant**, met een crème
achtergrond via `app.json`. Bewust géén blauw vlak, zodat de overgang naar de app (ook crème)
naadloos is.

`scripts/generate-app-icon.mjs` is de oude Replicate-prompt en levert een nóg ouder icoon op —
niet draaien.

## Hoe de boekvector tot stand kwam (historie)

Geldt voor `history-book*.svg`, die niet meer in de app zitten.

Het aangeleverde bestand was raster. De geometrie is pixel voor pixel opgemeten en opnieuw
opgebouwd, en daarbij rechtgetrokken: één lijndikte (32 op een canvas van 1024), exacte
spiegelsymmetrie om `x=512` (stond ~8 px uit het midden) en verticaal gecentreerd (stond ~21 px te
hoog). De originele kleuren, voor de goudvariant: lijnwerk `#FDF4CC`, verloop `#744A26` →
`#C89C59`.

Het lijnwerk is dun: onder ~40 px lopen de dubbele kaftlijn en de pagina's dicht. Daarvoor is
`history-book-compact.svg` — kaftlijn en knopje eruit, de rest 1,26× opgeschaald zodat de
lijndikte meegaat naar 40. In `preview.html` staan beide op 40 / 28 / 20 px naast elkaar.
