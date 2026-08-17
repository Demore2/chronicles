# Play Store listing — Chronicles v1.0

Alle tekst die de Play Console vraagt, klaar om te kopiëren. **Engels**, want de verhalen zelf zijn
Engels (de UI is en/nl/fr/de, de content niet — zie LAUNCH-PLAN.md B5). Voeg later gerust extra
listing-talen toe; dat kan zonder nieuwe build.

De tekens tussen haakjes zijn getelde lengtes tegen de limiet van Play. Herteld je iets? Draai
`node scripts/check-listing-lengths.mjs`.

---

## App name (max 30)

```
Chronicles: History Stories
```

(27/30.) De **launcher**-naam blijft `Chronicles` — die staat in `app.json` en hoeft niet gelijk te
zijn aan de storenaam. Wil je puur merk, gebruik dan `Chronicles` (10/30); de suffix is er alleen
omdat "Chronicles" op zichzelf niets over de inhoud zegt in een zoekresultaat.

## Short description (max 80)

```
Six eras, 19 stories, eight chapters each. Finish one, unlock the figure.
```

(72/80.)

Alternatieven binnen de limiet, mocht je willen A/B'en:

- `History as short stories. 19 lives and events, eight chapters each. No ads.` (75)
- `Read history one chapter at a time. 19 stories, six eras, no ads.` (65)

## Full description (max 4000)

> De regel "Every chapter opens with an illustrated scene" is gecontroleerd tegen de content, niet
> aangenomen: 152 `{ type: 'afbeelding' }`-blokken en 152 × `Chapter.afbeelding` over 19 verhalen ×
> 8 hoofdstukken (Fase 6.5). Verandert dat, pas dan deze zin aan — een listing die meer belooft dan
> de app doet is precies waar reviews en Play-meldingen over gaan.

```
Chronicles turns history into something you actually finish.

Every figure and every event is one story, split into eight short chapters. Read one on the bus, one before bed. A chapter takes a few minutes; a whole story takes about ten.

WHAT'S INSIDE

Nineteen stories across six eras, from the founding of Rome to the present day.

Antiquity — Julius Caesar, Spartacus, the rise of Rome, the eruption of Vesuvius
Middle Ages — Joan of Arc, Charlemagne, Richard the Lionheart
Early Modern Period — Leonardo da Vinci, Galileo Galilei, Catherine the Great
Industrial Revolution — James Watt, Florence Nightingale, Thomas Edison
20th Century — Marie Curie, Winston Churchill, Martin Luther King Jr.
Contemporary Era — Nelson Mandela, Steve Jobs, Malala Yousafzai

HOW IT READS

Chapters unlock one at a time, so you never have to remember where you left off. Every chapter opens with an illustrated scene, and quotes, key dates and short "did you know" notes break the text up instead of burying you in it.

COLLECT THE PEOPLE

Finish a story and its figure joins your collection. Nineteen circles, filled in one at a time — a quiet reason to come back for the next one.

BUILT TO STAY OUT OF THE WAY

No ads.
No account. There is nothing to sign up for.
No tracking and no analytics.
Works offline. Every story and every image is inside the app.
Your reading progress stays on your device.
One optional reminder a day, off unless you switch it on.

The interface is available in English, Dutch, French and German. The stories themselves are in English. Light and dark themes, and a reading streak if you want one.

Chronicles is free.
```

(1.633/4000.)

---

## Categorisatie & overige velden

| Veld | Waarde | Toelichting |
|---|---|---|
| App or game | **App** | |
| Category | **Books & Reference** | Education is een verdedigbaar alternatief; het is lezen, geen cursus. |
| Tags | history, stories, reading, education | Max 5, Play stelt zelf een lijst voor. |
| Contact e-mail | quintenraats@gmail.com | Verplicht en **publiek zichtbaar** in de listing. Wil je dat niet, maak dan een apart adres aan. |
| Website | — | Optioneel. Als je `docs/` via GitHub Pages publiceert kun je die repo-pagina gebruiken. |
| Phone | — | Optioneel, laat leeg. |
| Privacy policy | ⬜ **nog te vullen** | De URL van `docs/privacy-policy.html`. Zie `docs/README.md`. **Harde blocker.** |
| Ads | **No, my app does not contain ads** | Klopt: `ADS_ENABLED = false` in `src/components/ad-banner.tsx`. |
| In-app purchases | **No** | `useAbonnement()` is een stub die altijd `isPremium: false` geeft; er is geen Billing-integratie. |
| Content rating | IARC-vragenlijst, zie hieronder | |
| Target audience | **13+** | Bewust niet onder 13: dan val je onder het Families-programma met een eigen set eisen. |
| App access | **All functionality is available without special access** | Geen login, geen gated content. |
| News app | **No** | |
| Government app | **No** | |
| Financial features | **None** | |
| Data safety | zie `docs/README.md` | "No data collected". |

### IARC-vragenlijst

Antwoord gewoon eerlijk; de app komt dan op *Everyone* of *Everyone 10+* (PEGI 3 of 7) uit. Let op
deze twee, want ze zijn níét vanzelfsprekend "nee":

- **Geweld** — de verhalen beschrijven oorlog, slavernij, executies en moord (Caesar, Spartacus,
  Churchill, MLK) en de scènebeelden tonen legers, veldslagen en een brandende stad. Dat is *references to*
  of *mild depictions of* geweld in een historische, niet-interactieve context, geen realistisch of
  verheerlijkt geweld.
- **Gebruikersinteractie** — **nee**. Geen chat, geen delen, geen user-generated content, geen
  locatie. Dit is de vraag die anders in één klap een hogere rating oplevert.

Een uitkomst van *Everyone 10+* is geen probleem en geen reden om de vragenlijst te "verzachten" —
een onjuiste rating is wél een reden voor verwijdering.

---

## Grafische assets

Alles staat in `store/assets/`, gegenereerd met `npm run generate:store-assets`.

| Asset | Bestand | Eis van Play | Status |
|---|---|---|---|
| Hi-res icon | `assets/icon-512.png` | 512×512, 32-bit PNG | ✅ 512×512, alpha volledig opaak |
| Feature graphic | `assets/feature-graphic.png` | 1024×500, 24-bit PNG zonder alpha of JPEG | ✅ 1024×500, alfakanaal verwijderd |
| Phone screenshots | `assets/screenshots/phone-*.png` | min. 2, 9:16 of 16:9, zijden 320–3840 px | ✅ 8 stuks, 1080×1920 |
| Tablet screenshots | — | optioneel | Niet gemaakt; alleen nodig als je tablets wilt targeten |
| Promo video | — | optioneel | Geen |

De feature graphic is **geen** PNG die je met de hand bewerkt: de bron is `store/feature-graphic.html`
en het script rendert die met headless Chrome. Wijzig de HTML en draai het script opnieuw.

⚠️ De feature graphic zegt letterlijk **"19 STORIES · 6 ERAS · NO ADS"**. Verandert een van die drie
(v1.1 met advertenties, extra verhalen), pas dan de HTML aan en render opnieuw.

### Screenshot-volgorde

De volgorde in de Play Console is de volgorde waarin ze geswipet worden; de eerste twee zijn de
enige die de meeste mensen zien. Upload deze acht in deze volgorde:

1. `phone-1-home.png` — Home: uitgelicht verhaal + "Continue reading"
2. `phone-2-chapters.png` — hoofdstukoverzicht, hoofdstuk I open met beeld, de rest op slot
3. `phone-3-reader-scene.png` — hoofdstuk 1 van Caesar: scènebeeld met bijschrift
4. `phone-4-reader-blocks.png` — sleutelmoment "60 BC" in de kantlijn
5. `phone-5-unlock-cta.png` — laatste hoofdstuk, footer "Unlock Malala Yousafzai"
6. `phone-6-unlock-modal.png` — "Character Unlocked!"
7. `phone-7-reader-dark.png` — reader in donker thema, met tussenkop
8. `phone-8-home-dark.png` — Home in donker thema

Alle acht zijn **1080×1920** (9:16), uit de **release-APK** op de Pixel_8-emulator, met de
statusbalk in SystemUI-demomode (vaste klok 9:00, volle batterij, geen meldingen).

**Twee opnames zijn er wél maar gingen bewust níét mee**, omdat ze een verkeerd beeld gaven:

- `extra-profile.png` — de personagecollectie. De teller "chapters done" telde geopende *verhalen*
  in plaats van hoofdstukken, en het rooster staat vol met "?"-cirkels.
- `extra-progress.png` — Voortgang. Zes lege balken en "1 day streak" bij een gebruiker die nog
  niets had gelezen.

> **Beide B6-bugs zijn in Fase 8 opgelost** — de teller leest nu `story-progress-store` en de
> streak begint op 0 met een eigen "No streak yet"-staat. **Alle acht de screenshots moeten
> opnieuw** vóór de productie-build, want in dezelfde fase kreeg de reader-header zijn
> safe-area-inset: `phone-3`, `phone-4` en `phone-7` toonden de klok bovenop de beige headerbalk.
> Maak bij die ronde meteen een Profiel- en een Voortgang-opname met echte voortgang; die zijn nu
> wél representatief en de set kan naar tien.
