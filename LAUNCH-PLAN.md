# Chronicles — Launch Plan (Google Play v1.0)

> **Werkwijze:** dit plan wordt **fase voor fase** uitgevoerd, elke fase in een **nieuwe chat**
> (om contextvervuiling te voorkomen). Aan het eind van elke fase werkt Claude de sectie
> **Voortgang** en **Handover** hieronder bij. Start een nieuwe sessie met:
>
> ```
> Lees LAUNCH-PLAN.md en voer Fase <N> uit.
> ```

---

## Voortgang

| Fase | Inhoud | Status |
|---|---|---|
| 1 | A1 + A2 — `app.json` icoon/identiteit, `prebuild --clean` | ✅ Afgerond 2026-07-28 |
| 2 | B5 — content-bugs (leestijd, mojibake, i18n in reader) | ✅ Afgerond 2026-07-28 |
| 3 | B1 — beeld-pipeline naar lokale assets | ✅ Afgerond 2026-07-28 |
| 4 | B4 — motion + haptics | ✅ Afgerond 2026-07-28 |
| 5 | B2 + B3 — hoofdstuk-beelden + nieuwe blok-types | ✅ Afgerond 2026-07-28 |
| 6 | A4 + A5 — AdBanner uit, deps opschonen, privacybeleid | ✅ Afgerond 2026-07-28 |
| 6.5 | B2b — scènebeelden voor de overige 15 verhalen (120 hoofdstukken) | ✅ Afgerond 2026-07-28 |
| 7 | A3 + A6 — EAS, keystore, store listing, internal testing | 🟡 Repo-werk afgerond 2026-07-28; wacht op jouw Expo-login + Play Console |
| L | Logo — History Book als merk, icoon + splash + Kroniekschrijver | ✅ Afgerond 2026-07-28 |
| 8 | B6 — streak-fixes + notificaties | ✅ Afgerond 2026-08-13 |
| 1.1 | B3b — rijke blokken (`kop`/`weetje`/`sleutelmoment`) voor 120 hoofdstukken | ⬜ Ná launch |

> **Fase 6.5 en 7 mogen door elkaar lopen.** Een nieuw Play-developeraccount moet geverifieerd
> worden en de eerste review duurt vaak dagen tot weken; dat staat volledig los van de content.
> Start Fase 7 dus gewoon (account, keystore, listing, **internal testing** — die track is gratis en
> onbeperkt) en draai Fase 6.5 ondertussen. Alleen de build die naar de **productie**-track gaat
> hoort alle beelden te bevatten.

## Handover — laatste stand

**Datum:** 2026-08-13
**Laatst afgeronde fase:** Fase 8 (B6). **Alle codefases van dit plan zijn nu afgerond.** Wat
overblijft vóór v1.0 vereist jouw Expo-login en Play Console (Fase 7, zie verderop), plus één
ronde nieuwe screenshots.

> ### Fase 8 — streaks + dagelijkse herinnering (B6)
>
> **De streak was op drie manieren stuk, en alle drie zijn ze gerepareerd:**
> - **Hij begon op 1.** Een verse gebruiker die nog niets had gelezen zag "1 day streak" — dat
>   stond zelfs in `extra-progress.png`. `streakDagen` begint nu op **0**, en de persist-store
>   staat op **version 1** met een `migrate` die dat spookgetal weghaalt bij bestaande
>   installaties.
> - **De datums waren UTC.** In UTC+2 begon "morgen" om 22:00. `datumSleutel()` leest nu de
>   lokale kalender.
> - **Een verlopen streak bleef staan.** De opgeslagen waarde verandert alleen bij een leesactie,
>   dus na twee stille dagen stond het oude getal er nog. Nieuw: **`useStreak()`**
>   (`src/hooks/use-streak.ts`) rekent de werkelijke streak uit met `berekenHuidigeStreak()` en
>   doet dat opnieuw bij elke terugkeer naar de voorgrond. Home en Voortgang lezen die hook, niet
>   de store.
>
> **En één inhoudelijke keuze:** de streak loopt nu alleen op van een **afgerond hoofdstuk**
> (`registreerLeesactiviteit()` in `handleCompleteChapter`). Het *openen* van een verhaal telde
> mee, dus je kon een streak opbouwen zonder één zin te lezen. `streakBeschrijving` zegt dat nu
> ook in alle vier de talen. Bij 0 is het geen teller maar een uitnodiging: Home verbergt het
> vlammetje en Voortgang toont "No streak yet — Finish a chapter today to start one."
>
> **De "chapters done"-teller klopt.** `telVoltooideHoofdstukken()` in `story-progress-store.ts`
> is nu de bron; Profiel las `voortgangStore.bekekenIds.size` (geopende verhalen). Op de emulator:
> 1 afgerond hoofdstuk → **"1 chapter done"**. Dat *enkelvoud* is ook nieuw — de drie statlabels
> op Profiel zijn functies van `n` geworden en vertaald in nl/fr/de, want "1 chapters done" stond
> in de screenshot die de listing zou halen.
>
> **Dagelijkse herinnering, 19:00, standaard uit.** `expo-notifications` (57.0.10) plus twee
> nieuwe modules in de stijl van `haptics.ts`: `src/constants/notificaties.ts` (bedoelingen, nooit
> fataal, no-op op web) en `src/hooks/use-dagelijkse-herinnering.ts`. Toestemming wordt gevraagd
> **ná het eerste afgeronde hoofdstuk**, niet bij de eerste start — Android geeft je dat venster
> maar één keer. De schakelaar staat op Profiel onder Instellingen. Plannen en annuleren gebeurt
> op precies één plek (de hook in de root-layout), die ook opnieuw plant na een taalwissel en de
> voorkeur terugzet als de toestemming buiten de app is ingetrokken.
>
> **Drie kleine dingen die al sinds Fase 4 open stonden, zijn meegenomen:**
> - **De reader-header heeft zijn `useSafeAreaInsets()`-padding.** "Back to Chapters" zat onder de
>   statusbalk en was daardoor zichtbaar fout in drie store-screenshots. De footer heeft nu ook een
>   bottom-inset.
> - **"Next Chapter" doet `router.replace`.** Na acht hoofdstukken stonden er acht readers op de
>   stack. Geverifieerd: hoofdstuk 1 → Next → **één** keer terug landt op het hoofdstukoverzicht.
>   "Back to Chapters" gaat nu ook echt terug (`canGoBack()`, anders `replace`), en de
>   ontgrendel-modal doet `dismissAll()` in plaats van Home erbovenop te duwen.
>
> **Wat dit voor de store betekent — lees dit vóór de productie-build:**
> - **Alle acht screenshots moeten opnieuw.** De reader-header ziet er anders uit, en de twee
>   opnames die om B6-redenen buiten de set bleven (`extra-profile`, `extra-progress`) zijn nu wél
>   representatief. De set kan naar tien. Staat ook in `store/listing.md`.
> - **`expo-notifications` sleept Firebase Cloud Messaging én ShortcutBadger mee**, ook al plannen
>   we alleen lokale notificaties. Dat leverde in de merged release-manifest **twintig extra
>   launcher-badge-permissies** op, in een listing die "no tracking" belooft. Ze staan nu in
>   `android.blockedPermissions` in `app.json` (de app zet nooit een badge). Wat overblijft is
>   `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` en FCM's
>   `c2dm.permission.RECEIVE` — die laatste is niet weg te halen zonder de FCM-receiver te breken
>   en wordt in het privacybeleid uitgelegd in plaats van verzwegen.
> - **Er is géén `SCHEDULE_EXACT_ALARM`** (de permissie waarvoor Play een aparte verklaring eist).
>   Gevolg: het alarm is inexact, `window=+1h`. Voor een leesherinnering prima, maar weet dat hij
>   niet op de seconde komt.
> - **`docs/privacy-policy.html` en `docs/README.md` zijn bijgewerkt** met een sectie
>   Notifications, de volledige permissielijst en het commando om die na een pakket-upgrade
>   opnieuw na te meten. De policydatum staat nu op 13 augustus 2026. `store/listing.md` heeft één
>   regel erbij ("One optional reminder a day, off unless you switch it on", 1.633/4000).
>
> **Verificatie — alles gedraaid, alles groen:**
> - `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
>   `npm run content:read-times -- --check` OK; `npm run check:listing` OK.
> - `npm run lint`: **exact dezelfde 8 bestaande problemen** (7 errors, 1 warning) in exact
>   dezelfde vier bestanden als sinds Fase 3. Niets uit deze fase staat ertussen.
> - **`npx expo prebuild --clean` + `expo run:android` → BUILD SUCCESSFUL**, geïnstalleerd op de
>   Pixel_8.
> - **De permissielijst is nagemeten op de merged *release*-manifest**, niet op de debug-build:
>   `:app:processReleaseMainManifest` vóór en ná `blockedPermissions`, 30 → 11 regels.
> - **De melding is echt afgegaan, niet alleen ingepland.** Eerst hard gecontroleerd dat er een
>   `RTC_WAKEUP`-alarm stond op `2026-08-13 19:00:00` met tag
>   `expo.modules.notifications.NOTIFICATION_EVENT`; daarna de trigger tijdelijk op 60 seconden
>   gezet en de notificatie in de schaduw zien verschijnen met de juiste titel, tekst en het
>   boek-icoon in teal. **De trigger staat weer op `DAILY` 19:00** (gecontroleerd na afloop).
> - **Volledige doorloop op een lege installatie** (`pm clear`): Home zonder vlammetje → Voortgang
>   "No streak yet" → Profiel "0 chapters done", schakelaar uit → schakelaar aan geeft het
>   Android-toestemmingsvenster → Caesar hoofdstuk 1 → "Mark Complete" → **het
>   toestemmingsvenster verschijnt op precies dat moment** → Next Chapter → één keer terug landt op
>   1/8 met tegel II ontgrendeld → Voortgang "1 day streak" → Profiel "1 chapter done".
> - **Donker thema doorlopen** op de streakkaart en de herinnering-schakelaar: beide houden
>   contrast. Thema staat aan het eind weer op **Licht** (geverifieerd op het scherm).
>
> **Openstaande aandachtspunten na Fase 8:**
> - **De emulator-app is meerdere keren `pm clear`'d** in deze sessie. De leesvoortgang die er nu
>   op staat is één hoofdstuk van Caesar en een aangezette herinnering, geen echte teststand.
> - **De 16:9-portretten in de 3:4-carousel-kaart** op Home zijn nog steeds niet aangepakt
>   (staat open sinds Fase 3). Dit is het enige zichtbare punt dat nog vóór de screenshots hoort.
> - **Er staat een dagelijkse herinnering gepland op de emulator.** Wil je dat niet, zet de
>   schakelaar uit op Profiel.
> - Onveranderd open: **`PRIVACY_BELEID_URL` is nog een placeholder** (harde blocker voor Fase 7),
>   **nl/fr/de content**, **B3b** (rijke blokken voor 120 hoofdstukken, v1.1), **lege
>   `collecties.ts`**, en de **naamkwestie HISTORY/Chronicles** uit Fase L.

> ### Fase L — nieuw logo (History Book)
>
> Het merk is nu een **open boek met een `H`**, handgebouwd als SVG in
> `assets/images/mascotte/` (die map heet nog zo omdat hij als mascotte-verkenning begon).
> Aangeleverd als raster-WebP, opgemeten en opnieuw als vector opgebouwd. De README daar heeft het
> volledige verhaal; CLAUDE.md heeft de pipeline.
>
> **Wat er is veranderd:**
> - `app-icon.png`, `app-icon-adaptive.png`, `app-favicon.png` opnieuw afgeleid uit
>   `history-book-teal.svg` (crème op teal). `store/assets/icon-512.png` en de feature graphic zijn
>   meegegaan via `npm run generate:store-assets`.
> - `app.json`: `adaptiveIcon.backgroundColor` `#FAEDD8` → **`#3B6E7D`** (het icoonvlak is nu teal,
>   dus de mask mag geen crème rand meer tonen). Splash: `backgroundColor` `#FAEDD8` → **`#F7F1E4`**
>   en `image` → **`app-splash.png`** (het merk in teal op transparant). Bewust géén teal
>   splashvlak: de app opent op crème, en teal → crème zou flitsen.
> - `src/components/splash-screen.tsx`: zandloper eruit, `history-book.svg` erin met
>   `color={theme.accent}`. Dat bestand is getekend in `currentColor`, dus het volgt het thema.
> - `src/app/(tabs)/profiel.tsx`: de **vereenvoudigde Kroniekschrijver** staat rechtsboven in de
>   header, in een cirkel van `backgroundElement`. **Nog zonder functie** — dat is de plek voor de
>   begroeting of de dagelijkse quiz.
>
> **Wat open blijft:**
> - **De in-app splash zegt nog "HISTORY", de app heet "Chronicles"** (`app.json`,
>   `store/listing.md`). Dat is nu de enige plek waar de oude naam nog staat. Bewust niet
>   aangeraakt — een naamwijziging is geen logowijziging. Beslis dit vóór de productie-build.
> - `scripts/generate-app-icon.mjs` is dood gewicht geworden (Replicate-prompt voor het vórige
>   icoon). Niet verwijderd, wel gemarkeerd in CLAUDE.md.
> - Het icoon is **niet op een toestel gezien** — alleen in de browser en als PNG. De adaptive-icon
>   mask (rond/squircle) is per constructie goed (`SAFE_ZONE` 0,56) maar niet visueel bevestigd.
>   Doe dat bij de eerstvolgende `build:android:preview`.
>
> **Werkwijze-vondst die veel tijd kost als je hem niet weet:** *Metro's file-watcher werkt niet op
> deze G:-schijf.* Een draaiende `expo start` blijft de bundel serveren die hij bij het opstarten
> bouwde, dus je verifieert je wijziging en ziet de óude code. Herstart met `--clear`, en check bij
> twijfel wat er écht wordt uitgeleverd (commando staat in CLAUDE.md). Twee keer in deze sessie
> een verkeerde conclusie op gebaseerd.
**Volgende actie:** de handmatige stappen uit **`store/README.md`** — privacybeleid publiceren,
`npx eas login` + `eas init`, keystore, preview-build op een echt toestel, Play-account. Daarnaast
ligt **Fase 8 (B6)** klaar en die is inhoudelijk zwaarder geworden, zie de aandachtspunten.

> ⚠️ **Fase 7 kan niet "af" zonder jou.** Alles wat zonder inloggen kon is gedaan; wat overblijft
> vereist een Expo-account en de Play Console. Het volledige stappenplan staat in
> **`store/README.md`** — begin bij stap 0.
>
> 1. **`PRIVACY_BELEID_URL` in `src/constants/juridisch.ts` is nog een placeholder.** Publiceer
>    `docs/` via GitHub Pages (stappenplan in `docs/README.md`) en vul de URL in op twee plekken.
>    Harde blocker: zonder privacybeleid-URL kun je de listing niet indienen.
> 2. **Reken op de 12-testers-regel.** Google eist voor persoonlijke developeraccounts een
>    **closed test met minimaal 12 testers, 14 dagen aaneengesloten**, vóór productietoegang.
>    **Internal testing telt daar niet voor.** Dit is de langste doorlooptijd in het hele traject —
>    langer dan de review — dus begin er vroeg mee. Check de exacte eis in je eigen Console, Google
>    sleutelt er regelmatig aan.

**Wat Fase 7 heeft opgeleverd:**

*A3 — build-pipeline (alles wat zonder login kan):*
- **`eas.json`** met `development` / `preview` / `production` en twee submit-profielen. `production`
  levert een **AAB** (`buildType: "app-bundle"`), `preview` een APK voor je eigen toestel. Beide
  submit-profielen staan op `releaseStatus: "draft"`, zodat een upload nooit per ongeluk uitrolt.
- **Versienummers staan op `appVersionSource: "remote"`** met `autoIncrement` op productie. EAS
  neemt bij de eerste build `android.versionCode` uit `app.json` (= 1) als startwaarde over en hoogt
  daarna zelf op. Bewust: "version code already used" is de meest voorkomende afwijzing bij
  handmatig tellen. Het getal in `app.json` blijft staan voor lokale `expo run:android`-builds.
- **`runtimeVersion: { "policy": "appVersion" }`** in `app.json`, zodat OTA-updates later kunnen.
- **`eas-cli` staat in `devDependencies`** (niet globaal), zodat `npm run build:android:preview`
  werkt zonder installatie-instructies. Nieuwe scripts: `build:android:preview`,
  `build:android:prod`, `submit:android`, `submit:android:prod`.
- **`play-service-account.json` toegevoegd aan `.gitignore`** — dat is de sleutel waarmee
  `eas submit` naar Play uploadt en die mag nooit in de repo.
- **`eas.json` is offline gevalideerd** met `@expo/eas-json` uit `node_modules`, dus met exact de
  parser die eas-cli zelf gebruikt. Dat moest, want `eas config` weigert zonder ingelogd account —
  je komt er anders pas achter op het moment dat je je eerste build start.

*A6 — store listing:*
- **`store/listing.md`** — app-naam, korte en volledige beschrijving, plus een tabel met het
  antwoord op élk Console-veld (categorie, target audience 13+, ads: nee, IARC-aandachtspunten).
  Nieuw script **`npm run check:listing`** telt de teksten tegen Play's limieten en herschrijft de
  "(n/limiet)"-regels; `--check` geeft exit 1. Nu 27/30, 75/80 en 1.575/4000.
- **`store/README.md`** — het stappenplan voor alles wat login of Console vereist, met een
  checklist vóór "Send for review".
- **`store/assets/icon-512.png`** (512×512, 32-bit) en **`store/assets/feature-graphic.png`**
  (1024×500, **24-bit zonder alfakanaal** — Play weigert een feature graphic mét alpha). Allebei uit
  het nieuwe `npm run generate:store-assets`; de PNG-headers zijn nagemeten, niet aangenomen.
- **De feature graphic heeft een bron**: `store/feature-graphic.html`, één zelfstandig bestand in
  het palet uit `theme.ts`, gerenderd door headless Chrome. Zelfde afspraak als
  `docs/privacy-policy.html`: bewerk de HTML, draai het script, raak de PNG niet aan.
- **8 phone-screenshots**, 1080×1920 (9:16 — Play's eis, terwijl de Pixel_8 standaard 1080×2400 is;
  vandaar `adb shell wm size 1080x1920`), met de statusbalk in SystemUI-demomode zodat er geen
  toevallige klok of meldingsicoon in de listing staat.

**Drie dingen die deze fase hard heeft gemaakt in plaats van aangenomen:**
1. **De dev-launcher zit níét in een release-build.** Dat stond sinds Fase 6 open. De release-APK
   bevat **0** `dev-launcher`-entries, en de app start zonder Metro. Dat is ook per ongeluk
   *tegenbewezen* getest: toen er even een debug-build overheen stond, opende de app op
   "Chronicles — Development Build / Connect to a development server". Zo ziet het eruit als het
   fout gaat, en zo ziet het er dus níét uit.
2. **Alle 152 scènebeelden zitten in de release-APK**: 186 webp-entries, samen 33 MB, opgeslagen als
   `res/*.webp` met verkorte namen (AAPT2). Dat komt overeen met de ~35 MB die dit plan schatte.
3. **De screenshots komen uit de release-APK**, niet uit een dev-build met Metro ernaast.

**Openstaande aandachtspunten na Fase 7:**
- **De "Back to Chapters"-knop overlapt de statusbalk** — dit stond al open sinds Fase 4, maar het
  is nu **zichtbaar in drie van de acht store-screenshots**: de klok en het schild-icoon staan
  bovenop de beige headerbalk. Daarmee is het van een schoonheidsfoutje een listing-probleem
  geworden. Eén `useSafeAreaInsets()`-padding in de reader-header lost het op; doe dat vóór de
  productie-build en maak `phone-3`, `phone-4` en `phone-7` opnieuw.
- **De "chapters done"-teller op Profiel is nog steeds fout** (B6). Na 8 afgeronde hoofdstukken
  stond er `2` — het aantal *geopende verhalen*. Daarom gaat `extra-profile.png` bewust niet mee in
  de listing; zodra B6 gefixt is is dat een goede screenshot en hoort hij er alsnog bij.
- **De 16:9-beelden in de 3:4-carousel-kaart vallen op in de era-rijen op Home.** Caesar's kaart
  toont zijn borstplaat zonder hoofd. Daarom staat er geen screenshot van een era-rij in de set. Dit
  is nog steeds het aandachtspunt uit Fase 3 en het is nu een reden om er iets aan te doen: het is
  het eerste wat iemand ziet als hij op Home naar beneden scrolt.
- ~~**De in-app splash is inmiddels wél het Chronicles-icoon**~~ — **dit klopte niet.** De
  *native* splash was vervangen, maar `src/components/splash-screen.tsx` (die 2,5 s ná de native
  splash overheen ligt) toonde nog steeds het handgebouwde zandloper-logo. Opgelost in fase L.
- **Emulator-state**: de leesvoortgang op Pixel_8 is meerdere keren gewist (door beide sessies) en
  de release-APK staat er nu op. Wil je weer met Metro werken, draai dan `npm run android`.
  `wm size`/`wm density` en de SystemUI-demomode zijn teruggezet naar normaal, thema staat op
  **Licht** (geverifieerd).
- Onveranderd open: **"Next Chapter" doet `router.push`** in plaats van `replace`, de
  **streak-bugs** (B6, de "1 day streak" is zichtbaar in `extra-progress.png`), **nl/fr/de content**,
  en **B3b** (rijke blokken voor de 120 niet-Oudheid hoofdstukken, v1.1).

**Verificatie (alles gedraaid):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times -- --check` OK; `npm run check:listing` OK.
- `npm run lint`: **exact dezelfde 8 bestaande problemen** (7 errors, 1 warning) uit Fase 3/4/5/6.
  Niets uit Fase 7 staat ertussen.
- **`npx expo run:android --variant release` → BUILD SUCCESSFUL in 3m 5s**, APK geïnstalleerd en
  koud gestart **zonder draaiende Metro**. Dat is de kern van de bewijsvoering hierboven.
- **APK-inhoud gecontroleerd op bytes** (zip-entries), niet op vertrouwen: 0× dev-launcher,
  186 webp's / 33 MB, `assets/index.android.bundle` 4,3 MB.
- **Alle 10 PNG's in `store/assets/` zijn op hun IHDR nagemeten**: icoon 512×512 kleurtype 6,
  feature graphic 1024×500 kleurtype 2 (geen alpha), screenshots 1080×1920 met ratio 0,563.
- **Donker thema doorlopen** op Home en reader (`phone-7`, `phone-8`); thema staat aan het eind weer
  op **Licht**.

**Eén ding dat je uit deze sessie niet moet concluderen:** halverwege leek de leesvoortgang van een
uitgelezen verhaal spontaan te verdwijnen (hoofdstukken weer op slot). Dat was **geen bug** maar de
`adb shell pm clear` van de parallelle Fase 6.5-sessie. De persistentie is daarna wél getest: thema
op Donker gezet, app force-stopped, koud herstart → nog steeds donker, en "Continue reading" stond
er ook nog. AsyncStorage doet in de release-build gewoon zijn werk.

**Wat Fase 6.5 heeft opgeleverd:**
- **152 van de 152 hoofdstukken hebben nu een scènebeeld.** De 120 ontbrekende prompts zijn
  bijgeschreven in `scripts/generate-scene-images.mjs`, de run is in **één keer volledig geslaagd**
  (0 mislukkingen), er zijn 120 regels toegevoegd aan `SCENE_IMAGES`, en alle 120 hoofdstukken in de
  vijf niet-Oudheid content-files hebben een `{ type: 'afbeelding' }`-blok vooraan én
  `Chapter.afbeelding`. `STIJL` is niet aangeraakt — de nieuwe beelden staan in dezelfde serie als
  de Oudheid.
- **Elk beeld heeft een met de hand geschreven `alt` en `bijschrift`.** Het bijschrift is
  bewust géén herhaling van de alinea eronder maar een extra feit — "381 days of walking. The bus
  company lost roughly three-quarters of its riders", "Her notebooks are still radioactive. They
  are kept in lead-lined boxes". Daarmee doet het hetzelfde werk als de `weetje`-blokken uit B3, en
  leest de reader in de andere vijf tijdperken al minder vlak vooruitlopend op B3b.
- **Bundel: 31 MB voor 152 beelden** (gemiddeld ~205 KB). Dat is onder de ~35 MB die dit plan
  schatte, dus er is niets aan resolutie of kwaliteit veranderd — `output_quality: 90` en de
  16:9-verhouding staan nog zoals in B2.

**Vier correcties die het plan niet voorzag — en die de moeite van het onthouden waard zijn:**
1. **De vijf niet-Oudheid content-files zijn LF, geen CRLF.** `CLAUDE.md` waarschuwt voor CRLF, maar
   dat geldt alleen voor de Oudheid-bestanden. Een script dat deze files herschrijft moet de
   regelafsluiting **per bestand** detecteren; blind `\r\n` schrijven vervuilt de diff net zo hard
   als blind `\n`.
2. **Zonder expliciete beschrijving vult het model het standaardgeval in.** De eerste
   `nelson-mandela-6` liet een **wit echtpaar** de gevangenis uitlopen. Dat is precies het soort
   fout dat in een gepubliceerde app pijnlijk is. Alle scènes met herkenbare mensen zeggen nu
   expliciet "Black South African", "Pashtun", "African American" enzovoort. Vijf Mandela-, drie
   King- en vier Malala-beelden zijn hierop opnieuw gegenereerd en stuk voor stuk nagekeken.
3. **20e-eeuwse scènes kunnen zwart-wit terugkomen.** `martin-luther-king-jr-7` las "1968 +
   demonstratie" als persfoto en leverde monochroom op, wat de hele serie breekt. Een kleurwoord
   in de prompt ("full colour", "olive-green", "warm brown brick") lost het op.
4. **Twee losse missers, allebei hersteld:** `leonardo-da-vinci-4` gaf de tekenende Leonardo een
   **modern polshorloge** (plus een nogal bloederige ontlede arm) — opnieuw geformuleerd zonder
   lichaamsdeel en met lange mouwen. `florence-nightingale-3` leverde een **lege** ziekenzaal op
   terwijl de gewonden juist het hoofdstuk zijn; de herformulering met "wounded" en "bandages"
   sloeg vervolgens het **NSFW-filter** aan, dus het staat er nu als "resting soldiers under grey
   blankets". Dat is de tweede keer dat blijkt dat het filter op woorden reageert, niet op scènes.

**Verificatie (alles gedraaid, alles groen):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times` bijgewerkt (7 verhalen +1 min door de bijschriften) en daarna
  `-- --check` schoon.
- `npm run lint`: terug op **exact dezelfde 8 bestaande problemen** (7 errors, 1 warning) uit
  Fase 3/4/5/6. Niets uit deze fase staat ertussen.
- **Steekproef van 14 beelden visueel nagekeken** over alle zes de tijdperken, met nadruk op de
  drie moderne biografieën (het hoogste risico). Alle gevonden fouten staan hierboven en zijn
  opnieuw gegenereerd en opnieuw bekeken.
- **Volledige doorloop op de Pixel_8-emulator na `pm clear` + `expo start --clear`** (screenshots in
  de scratchpad van deze sessie): Home → Malala → hoofdstukoverzicht toont **0/8, tegel I met
  scènebeeld, II t/m VIII vlak grijs met hangslot** → hoofdstuk 1: scènebeeld met bijschrift boven
  de tekst → "Mark Complete" → terug: **1/8, tegel I in tijdperkkleur met vinkje, tegel II
  ontgrendeld en toont nú zijn scène**, III+ nog op slot. Precies het beloonde-ontgrendeling-effect
  waar B2b op mikte, nu voor alle 19 verhalen.
- **Donker thema doorlopen** op Home en in de reader: tekst, sleutelmoment-kantlijn en footer
  houden contrast, de beelden vallen niet uit de toon. Thema staat aan het eind van de sessie weer
  op **Licht** (geverifieerd op het scherm).

**Openstaande aandachtspunten na Fase 6.5:**
- **Eén dev-cache-observatie, geen bug:** vóór het legen van de caches toonde de app nog de
  *oude* `malala-yousafzai-3` terwijl het bestand op schijf al de gecorrigeerde versie was —
  `expo-image` en Metro cachen een asset die je onder hun voeten vervangt. Na `pm clear` +
  `expo start --clear` klopte het. Een productie-build bundelt vanaf schijf en heeft dit niet, maar
  **regenereer je een beeld tijdens ontwikkeling, leeg dan beide caches voordat je concludeert dat
  het niet werkte.**
- **`scripts/dump-chapters.mjs` is nieuw** en blijft staan (no-delete): dumpt per verhaal de
  hoofdstuktitels plus een tekstfragment. Dat was nodig om 120 gerichte prompts te kunnen schrijven
  en is bij B3b opnieuw handig. Het eenmalige insert-script staat in de scratchpad, niet in de repo.
- **B3b (rijke blokken) is en blijft v1.1.** De bijschriften vullen dat gat gedeeltelijk maar niet
  helemaal: `kop`, `weetje` en `sleutelmoment` ontbreken nog in 120 hoofdstukken.
- Onveranderd open: **`PRIVACY_BELEID_URL` is nog een placeholder** (harde blocker voor Fase 7), de
  **"chapters done"-teller op Profiel** telt geopende verhalen (B6), de **"Back to Chapters"-knop
  zonder safe-area-inset**, **"Next Chapter" doet `router.push`** in plaats van `replace`, de
  **in-app splash met het oude HISTORY-logo**, de **16:9-portretten in een 3:4-kaart**, en
  **nl/fr/de content**.

**Wat Fase 6 heeft opgeleverd:**
- **Het "Advertisement"-blok is weg** (A4). `ad-banner.tsx` heeft nu een module-brede
  **`ADS_ENABLED = false`** en returnt `null` vóór het `isPremium`-pad. Conform de no-delete-regel
  blijft het component én blijven alle vier de call-sites (`collectie/[id]`, `regio/[id]`,
  `tijdperk/[id]`, `verhaal/[id]/reader`) staan, zodat v1.1 alleen de vlag hoeft om te zetten. De
  i18n-sleutel `advertentie.label` is ook bewust blijven staan. Omdat het één component met één
  constante is, bewijst één geverifieerde call-site alle vier.
- **Dependencies opgeschoond.** `@supabase/supabase-js` + `@supabase/ssr` eruit (nergens in `src/`
  geïmporteerd), `expo-dev-client` van `dependencies` → **`devDependencies`**. `npm install`
  gedraaid; `package-lock.json` bijgewerkt en `expo-dev-client` staat daar nu met `"dev": true`.
- **Privacybeleid geschreven en gebundeld als project-bestand**: `docs/privacy-policy.html`. Eén
  zelfstandig HTML-bestand — geen build, geen CDN, geen externe fonts — in het beige palet van de
  app mét `prefers-color-scheme: dark`. Inhoud: geen accounts, geen analytics, geen advertenties,
  geen tracking; alleen lokale AsyncStorage-opslag (hoofdstukken, personages, streak, thema, taal),
  plus een aparte alinea over de enige permissie in het manifest (`VIBRATE`, uit `expo-haptics`).
- **`docs/README.md`** met het GitHub-Pages-stappenplan én — belangrijker — een tabel met de exacte
  antwoorden voor het **Data Safety-formulier**, zodat pagina en formulier niet uit elkaar kunnen
  lopen. Data Safety en de IARC-vragenlijst zelf zijn Play Console-werk en horen bij **Fase 7**.
- **`src/constants/juridisch.ts`** — `PRIVACY_BELEID_URL` plus een afgeleide
  `privacyBeleidIsGepubliceerd`. Die tweede is de truc die voorkomt dat er ooit een dode link
  meegaat in een release: Profiel toont de "About"-sectie alleen als de placeholder weg is. Er is
  dus **niets aparts om aan te zetten** — de URL invullen is genoeg.
- **Nieuwe "About"-sectie op Profiel** met een schild-icoon, "Privacy Policy", een
  `open-outline`-icoon rechts en één regel uitleg eronder. Opent via **`expo-web-browser`**
  (`openBrowserAsync`) in een in-app custom tab, met een gesmoorde `catch` — zelfde afspraak als
  bij haptics: een toestel zonder bruikbare browser mag de interactie niet laten klappen.
- **Drie nieuwe i18n-sleutels** (`profiel.over`, `.privacybeleid`, `.privacybeleidUitleg`),
  volledig vertaald in nl/fr/de.

**Eén constatering die het plan corrigeert:** A4 noemt "`collecties.ts` exporteert `[]` → sectie
verbergen". Dat was **al gedaan** — `(tabs)/index.tsx:24` heeft al een `SHOW_STORYLINES = false`.
Er viel hier niets te repareren; het punt is alleen geverifieerd.

**Verificatie (alles gedraaid, alles groen):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times -- --check` OK.
- `npm run lint`: terug op **exact dezelfde 8 bestaande problemen** (7 errors, 1 warning) uit
  Fase 3/4/5. Niets uit Fase 6 staat ertussen.
- **`npx expo export --platform android` als harde bundel-test**: de Hermes-bundel bevat **0×**
  `supabase` en **0×** `expo-dev-client`. (`Advertisement` staat er nog 2× in — dat is de
  i18n-string die bewust blijft staan; het component kan hem niet meer renderen.)
- **Doorloop op de Pixel_8-emulator** (screenshots in de scratchpad van deze sessie): Caesar →
  hoofdstuk 1 → naar de bodem gescrold → de tekst loopt nu **direct door naar de "Next
  Chapter"-footer, zonder advertentievakje**. Profiel: geen "About"-sectie zolang de placeholder-URL
  staat.
- **Het verborgen-tenzij-ingevuld-mechanisme is echt getest, niet alleen beredeneerd**: tijdelijk
  een geldige URL ingevuld → "About"-sectie verschijnt correct → erop getikt → Chrome opent →
  URL teruggedraaid naar de placeholder → na een koude herstart is de sectie weer weg.
- **De HTML-pagina zelf** is via een lokale server (`10.0.2.2:8099`) in Chrome op de emulator
  geopend: layout, kaart, koppen, opsommingen en het beige palet kloppen. De **lettertekens waren
  daar vervormd** — dat is de bekende font-render-glitch van Chrome op deze AVD, niet de pagina:
  het bestand is geverifieerd als valide UTF-8 zónder BOM, met sluitende tags (h1 1/1, h2 9/9,
  p 13/13, ul 2/2, li 9/9) en precies één niet-ASCII teken (de em-dash in `<title>`).
- **Donker thema doorlopen** op de nieuwe About-sectie: schild-icoon en tekst houden contrast.
  Thema staat aan het eind van de sessie weer op **Licht** (geverifieerd).

**Openstaande aandachtspunten na Fase 6:**
- **`PRIVACY_BELEID_URL` is nog een placeholder** — zie de waarschuwing bovenaan. Dit is het enige
  échte restpunt van deze fase.
- **Controleer in Fase 7 dat de dev-launcher niet in de productie-AAB zit.** `expo-dev-client` naar
  `devDependencies` verplaatsen is de door Expo aanbevolen zet, maar EAS installeert devDependencies
  standaard óók. Het `production`-profiel zet `developmentClient: false`, dus het hoort goed te
  gaan; verifieer het op de echte AAB in plaats van erop te vertrouwen.
- **`.env.local` exporteert nog `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `NEXT_PUBLIC_SUPABASE_URL`**
  (zichtbaar bij elke `npm run`-aanroep). De packages zijn weg, deze variabelen zijn restanten.
  Niet blocking, wel rommel — en `.env*.local` is gitignored, dus het gaat nergens mee naartoe.
- De export-map **`.tmp-export-check-f6/`** blijft staan (no-delete-regel); ze valt onder het
  bestaande `.tmp-export-check*`-patroon in `.gitignore`.
- Onveranderd open uit eerdere fases: de **"chapters done"-teller op Profiel** telt geopende
  verhalen (B6), de **"Back to Chapters"-knop zonder safe-area-inset**, **"Next Chapter" doet
  `router.push`** in plaats van `replace`, de **in-app splash met het oude HISTORY-logo**, de
  **16:9-portretten in een 3:4-kaart**, en **nl/fr/de content**.
- Dat **scènebeelden en rijke blokken alleen in de Oudheid zitten** staat niet langer los in deze
  lijst: het is opgesplitst en ingepland als **B2b (Fase 6.5, vóór de productie-build)** en
  **B3b (v1.1, ná launch)**.

**Wat Fase 5 heeft opgeleverd:**
- **Het `afbeelding`-blok rendert eindelijk zijn bron.** `blok-weergave.tsx` tekende een
  `<Illustratie>`-placeholder en negeerde `blok.bron` volledig; dat is nu een `expo-image` op
  **16:9** met afgeronde hoeken, bijschrift eronder en `accessibilityLabel` uit `alt`. De
  illustratie is alleen nog de terugval als er geen bron is. `Blok.bron` is meegetypeerd van
  `string` naar `ImageSourcePropType` — net als `Verhaal.afbeelding` in Fase 3, en om dezelfde
  reden: het moet een gebundeld `require()` zijn, geen URL.
- **32 scènebeelden gegenereerd en gebundeld** (1 per hoofdstuk voor de vier Oudheid-verhalen, de
  proef die het plan voorstelt). `assets/images/scenes/<verhaal-id>-<hoofdstuk-id>.webp`, 7,4 MB
  totaal, via het nieuwe **`scripts/generate-scene-images.mjs`** (`npm run generate:images:scenes`)
  — zelfde opzet als het portretscript (bytes downloaden, `--list`/`--only`/`--force`,
  429-backoff), maar met `aspect_ratio: '16:9'` en één gedeelde STIJL-suffix zodat 32 losse
  generaties als één serie ogen. Nieuw t.o.v. het portretscript: **één mislukte prompt breekt de
  run niet af**, aan het eind volgt een lijst met een kant-en-klare `--only`-regel. Alle 32 zijn in
  één run geslaagd.
- **`src/constants/scene-images.ts`** — `SCENE_IMAGES`, een expliciete `require()`-map met sleutel
  `<verhaal-id>-<hoofdstuk-id>`, precies zoals `character-images.ts`.
- **`Chapter.afbeelding` wordt eindelijk uitgelezen** (stond open sinds B4): `HoofdstukTegel`
  tekent het scènebeeld achter het Romeinse cijfer, met een sluier van 45% (tijdperkkleur als het
  hoofdstuk af is, zwart als het open maar onafgerond is) en wit cijfer. **Alleen bij een
  ontgrendeld hoofdstuk** — een tegel op slot blijft vlak grijs, zodat het opengaan van het
  volgende hoofdstuk letterlijk een beeld oplevert. Op de emulator geverifieerd: Rome's Rise 0/8 →
  tegel I met beeld, II t/m VIII vlak grijs → hoofdstuk 1 afronden → tegel II toont zijn scène.
- **Drie nieuwe blok-types** (B3), elk met een tak in `blok-weergave.tsx`, een case in
  `validate-content.mjs` en een regel in `telWoordenInBlok`:
  - `kop` — tussenkop met een streepje van 32px in de tijdperkkleur eronder.
  - `weetje` — callout met gloeilamp-icoon en label, achtergrond 12% / rand 35% tijdperkkleur.
  - `sleutelmoment` — jaartal in een **kantlijn van vaste 64px** met een verticale streep ernaast.
    Die vaste breedte is bewust: bij een meebewegende breedte vormen opeenvolgende sleutelmomenten
    geen kantlijn maar een rafelrand.
- **Het jaartal is een i18n-functie, geen string.** Nieuwe sectie **`blok`** in `en.ts`
  (`weetjeLabel`, `jaarLabel`), volledig vertaald in nl/fr/de. `jaarLabel` zet negatieve jaren om
  naar "753 BC" / "753 v.Chr." en gebruikt **"AD" alleen onder het jaar 1000** — "AD 1969" leest
  raar, maar zonder "AD 79" is Pompeii niet van 79 BC te onderscheiden.
- **Citaten opgewaardeerd**: het randje links is weg, ervoor in de plaats een groot serif
  aanhalingsteken in de tijdperkkleur en de citaattekst zelf in `Fonts.serif` cursief. Daarmee is
  `Fonts.serif` uit `theme.ts` voor het eerst ergens in gebruik.
- **96 blokken in de content** (32 hoofdstukken × beeld + tussenkop + weetje/sleutelmoment).
  Elk hoofdstuk opent nu met zijn scène en heeft één inhoudelijke onderbreking. De weetjes en
  sleutelmomenten zijn echte feiten, geen vulling (het jaar van 445 dagen, decimatie bij Crassus,
  de 11.000 graffiti van Pompeii).
- **De leestijden zijn opnieuw berekend** na die contentwijziging: Oudheid 6-9 → **8-10 min**.

**Verificatie (alles gedraaid, alles groen):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times` uitgevoerd (4 verhalen bijgewerkt) en daarna schoon.
- `npm run lint`: terug op **exact de 8 bestaande problemen** (7 errors, 1 warning) uit Fase 3/4.
  Eén nieuwe warning die deze fase opleverde (ongebruikte `useTheme` in `blok-weergave.tsx`, want
  elk blok kleurt nu met `tijdperkKleur`) is meteen opgeruimd.
- **Volledige doorloop op de Pixel_8-emulator** (screenshots in de scratchpad van deze sessie):
  Home → Caesar → hoofdstukoverzicht met 8 beeldtegels → hoofdstuk 1: scènebeeld met bijschrift,
  tussenkop met streepje, sleutelmoment "60 BC" in de kantlijn → hoofdstuk 2: weetje-callout en
  het opgewaardeerde citaat → Rome's Rise 0/8 voor de vergrendelde-tegel-check → "Mark Complete" →
  tegel II ontgrendelt mét beeld.
- **Donker thema doorlopen** op reader en hoofdstukoverzicht: weetje-callout, kantlijn en citaat
  houden contrast. Thema staat aan het eind van de sessie weer op **Licht** (geverifieerd).

**Openstaande aandachtspunten na Fase 5:**
- **De overige 15 verhalen hebben nog geen scènebeelden** (120 hoofdstukken, ~$5 aan Replicate en
  ~35 min doorlooptijd). Prompts bijschrijven in `scripts/generate-scene-images.mjs`, regels
  toevoegen aan `SCENE_IMAGES`, en de content aanvullen. Bewust nog niet gedaan: eerst meten of
  deze stijl bevalt. **Let op de bundelgroei**: 32 beelden zijn 7,4 MB, alle 152 zouden ~35 MB
  zijn. Dat past nog binnen Play's AAB-limiet, maar het is het moment om over resolutie of
  compressie na te denken.
- **De nieuwe blok-types zitten alleen in de Oudheid.** De andere vijf tijdperken lezen nog als
  een muur alinea's. Dat is contentwerk, geen code — de types, validatie en rendering staan er.
- Onveranderd open: de **"chapters done"-teller op Profiel** telt geopende verhalen (B6), de
  **"Back to Chapters"-knop zit in de statusbalk-band** zonder safe-area-inset (viel deze sessie
  opnieuw op: adb-taps op die hoogte worden door de systeembalk opgeslokt), **"Next Chapter" doet
  `router.push`** in plaats van `replace`, het **"Advertisement"-blok** (A4, Fase 6), de **in-app
  splash met het oude HISTORY-logo**, de **16:9-portretten in een 3:4-kaart** en **nl/fr/de
  content**.

**Wat Fase 4 heeft opgeleverd:**
- **`expo-haptics` geïnstalleerd** (57.0.1) en twee nieuwe basismodules:
  - **`src/constants/motion.ts`** — wat `theme.ts` voor kleur is, is dit voor beweging: de enige
    plek met duur (`snel/normaal/traag`), veercurves (`zacht/stuiter/druk`), `drukSchaal` en
    `staggerVertraging(index)`. Die laatste top af op `maxStaggerStappen` (8), zodat een hoofdstuk
    met 15 blokken niet bijna een seconde staat in te lopen.
  - **`src/constants/haptics.ts`** — `haptics.tik() / .succes() / .ontgrendeld()`, dus bedoelingen
    in plaats van API-aanroepen. Op **Android via `performAndroidHapticsAsync`** (de
    systeem-`HapticFeedbackConstants`; Expo raadt dat aan boven de `Vibrator`-simulatie van
    `impactAsync`), op iOS via `impactAsync`/`notificationAsync`, op web niet. Alles
    fire-and-forget met gesmoorde `catch` — een toestel zonder trilmotor mag geen interactie
    breken.
- **Nieuw component `AnimatedPressable`** (`components/animated-pressable.tsx`): veert in onder je
  duim en geeft een lichte haptische tik. Bewust niet overal toegepast — alleen waar de aanraking
  een beloning of navigatie inleidt (hoofdstuktegel, reader-footer, Home-knop, personagecirkel).
  `haptisch={false}` waar de handler zelf al een zwaarder signaal afvuurt. `disabled` houdt
  vergrendelde items volledig stil, daarom gebruiken `character-grid` en de tegels nu `disabled`
  in plaats van een `if` in `onPress`.
- **Reader** (`verhaal/[id]/reader.tsx`): de voortgangsbalk loopt via een shared value +
  `useAnimatedScrollHandler`. **De `useState` op elk scroll-event met `scrollEventThrottle={16}`
  is weg** — die rerenderde het hele hoofdstuk op 60fps voor een balkje van 3px. Blokken komen
  gestagger'd binnen met `FadeInDown`, en "Mark Complete" vuurt `haptics.succes()`.
- **Hoofdstuktegels** zijn uit `chapters.tsx` gelicht naar **`components/hoofdstuk-tegel.tsx`**
  (elke tegel heeft eigen shared values, en hooks mogen niet in een `.map()`): entree-stagger,
  spring-pop bij een échte niet-voltooid→voltooid overgang (afgeschermd met een `wasVoltooid`
  shared value, anders stuitert het hele rooster elke keer dat je een half afgerond verhaal
  opent), geanimeerde opacity bij ontgrendelen en een `ZoomIn`-checkmark. De voortgangsbalk op dat
  scherm loopt bij openen vol vanaf 0.
  - Eén ontwerpkeuze die niet vanzelf spreekt: **de achtergrondkleur van een tegel springt
    bewust ongeanimeerd om.** Voltooid = tijdperkkleur met lichte tekst; een kleurovergang van
    een halve seconde zou lichte tekst op een lichte achtergrond laten zien.
  - **De ontgrendel-puls is mount-gedreven** (`isVolgende` = het eerste open maar onafgeronde
    hoofdstuk). Navigatie hierheen is `router.push`, dus het scherm monteert opnieuw en een
    "locked → unlocked"-statusovergang zou je in de praktijk vrijwel nooit zien. Op de terugweg
    met de hardware-terugknop is het scherm wél nog gemonteerd en vuurt de overgang echt — dat is
    ook zo getest.
- **Character-unlock is het beloningsmoment geworden** (`character-unlock-modal.tsx`): `ZoomIn` op
  de kaart, spring-in van het portret, een ademende gloed-ring en twee radiale pulsringen met een
  halve periode verschil, plus `haptics.ontgrendeld()` bij openen. De drie hardcoded Engelse
  strings zijn naar i18n verhuisd (**nieuwe sectie `personage`** in `en.ts`, volledig vertaald in
  nl/fr/de).
- **De auto-unlock is eruit.** De `useEffect` met `hasAutoUnlockedRef` ontgrendelde het personage
  zodra het laatste hoofdstuk af was, waardoor de "Unlock &lt;naam&gt;"-knop in de footer nooit
  verscheen (stond open sinds Fase 2). `handleUnlockCharacter` is nu de enige trigger en
  `voortgangStore.markStoryCompleted` is daarheen verhuisd. Op de emulator geverifieerd: de knop
  verschijnt na hoofdstuk 8, en Profiel telt daarna 1 personage én 1 voltooid verhaal.
- **Overal `sharedValue.get()`/`.set()`, nooit `.value =`.** De `react-hooks/immutability`-regel
  van eslint-plugin-react-hooks ziet een `.value`-toewijzing als het muteren van iets dat React
  onveranderlijk acht (3 errors bij de eerste lint-run). `.get()`/`.set()` is óók de huidige
  Reanimated-API. Dit staat in `CLAUDE.md` — nieuwe animatiecode moet het volgen.

**Verificatie (alles gedraaid, alles groen):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times -- --check` OK.
- `npm run lint`: terug op **exact de 8 bestaande problemen** (7 errors, 1 warning) uit Fase 3,
  allemaal in files die deze fase niet raakte. Niets uit Fase 4 staat ertussen.
- **`expo-haptics` is een native module, dus een JS-reload is niet genoeg.**
  `npx expo run:android` → BUILD SUCCESSFUL in 1m28s. Dat de autolinking klopt is hard
  gecontroleerd: `adb shell dumpsys package com.chronicles.historyapp` geeft
  `android.permission.VIBRATE: granted=true` (die permissie komt uit het manifest van
  `expo-haptics` zelf).
- **Volledige doorloop op de Pixel_8-emulator** (screenshots in de scratchpad van deze sessie):
  Julius Caesar op 1/8 → hoofdstuk 2 geopend (een screenshot ving de stagger halverwege: blok 1
  staand, blok 2 nog aan het invaden) → gescrold, voortgangsbalk loopt vol → "Mark Complete" →
  footer wordt "Next Chapter" → hardware-terug naar het nog gemonteerde overzicht: 2/8, tegel II
  terracotta met vinkje, tegel III ontgrendeld, IV+ op slot → hoofdstukken 3 t/m 8 afgerond →
  **"Unlock Julius Caesar" verschijnt** → modal met portret, gloed en puls → "Continue to Home" →
  Profiel: "Character Collection (1 of 19)", Caesar met vinkje, "1 stories completed".
- **Donker thema doorlopen** op het hoofdstukoverzicht en in de reader. De voortgangsbalk leek
  daar op het oog leeg; met een pixel-sample nagemeten: `#B8735A` over de volle breedte, dus 100%
  correct. Thema staat aan het eind van de sessie weer op **Licht** (geverifieerd: achtergrond
  `#F7F1E4`).

**Openstaande aandachtspunten na Fase 4:**
- **De "chapters done"-teller op Profiel is fout.** `profiel.tsx:44` gebruikt
  `voortgangStore.bekekenIds.size` — dat zijn *geopende verhalen*, geen hoofdstukken. Na 8
  afgeronde hoofdstukken stond er `3` (= drie geopende verhalen). De juiste bron is
  `useStoryProgressStore`: som van `progress[*].completedChapters.length`. Buiten B4-scope gelaten
  omdat het een stats-vraag is; hoort bij **B6**.
- **De "Back to Chapters"-knop in de reader zit in de statusbalk-band.** De header heeft geen
  safe-area-inset, dus de knop staat visueel onder de systeembalk en adb-taps op die hoogte worden
  door de systeembalk opgeslokt. Met een vinger werkt het waarschijnlijk net, maar dit hoort een
  `useSafeAreaInsets()`-padding te krijgen. Klein, zichtbaar, nog niet gedaan.
- **"Next Chapter" doet `router.push`, geen `replace`.** Na acht hoofdstukken staan er dus acht
  readers op de stack en loopt de terugknop ze allemaal langs. Niet nieuw en niet blocking, maar
  het viel deze sessie op tijdens het testen.
- **`Chapter.afbeelding` wordt nog steeds nergens uitgelezen.** B4 noemde "beeld per
  hoofdstuk-tegel", maar er bestaat nog geen enkel hoofdstukbeeld — dat is precies B2 (Fase 5).
  Bewust daar gelaten; `HoofdstukTegel` is de plek waar het straks in moet.
- Onveranderd open uit Fase 3: de **16:9-beelden in een 3:4-kaart**, het **"Advertisement"-blok**
  (A4, Fase 6), de **in-app splash met het oude HISTORY-logo**, en **nl/fr/de content**.

**Wat Fase 3 heeft opgeleverd:**
- **Alle 19 portretten zijn lokale, gebundelde assets.** `assets/images/characters/<verhaal-id>.webp`
  — de bestandsnaam is nu exact de `Verhaal.id`-slug. De 15 Title-Case-bestanden zijn hernoemd
  (`Richard the Lionheart.webp` → `richard-the-lionheart.webp`, `Martin Luther King Jr.webp` →
  `martin-luther-king-jr.webp`).
- **De 4 ontbrekende Oudheid-beelden zijn niet opnieuw gegenereerd maar gedownload.** De
  `replicate.delivery`-URL's in `generated-images.ts` bleken nog te resolven (HTTP 200), dus de
  bytes zijn opgehaald — geen Replicate-credits verbruikt, en de beelden zijn identiek aan wat de
  app tot nu toe toonde. **Dit venster is nu dicht**: die URL's staan nergens meer, dus als ze
  alsnog verlopen maakt het niet meer uit.
- **`character-images.ts` is een `require()`-map** met alle 19 id's, getypeerd als
  `Record<PortretId, ImageSourcePropType>`. Bewust expliciet en niet `require.context`: een
  ontbrekend bestand geeft nu een build-fout in plaats van een lege kaart. De `via.placeholder.com`-
  stubs zijn weg. De imports in de drie content-files die deze module al importeerden maar niet
  gebruikten, zijn eindelijk zinvol.
- **`Verhaal.afbeelding` is `ImageSourcePropType`** in plaats van `string`, en de 19 inline
  replicate-URL's in de content zijn `CHARACTER_IMAGES['<id>']` geworden.
  `src/constants/generated-images.ts` is conform de no-delete-regel een re-export-shim
  (`export { CHARACTER_IMAGES as GENERATED_IMAGES }`) met een `@deprecated`-comment.
- **Alle vier de consumenten over op `expo-image`** (`verhaal-kaart`, `verhaal-carousel-kaart`,
  `character-grid`, `character-unlock-modal`): `source={verhaal.afbeelding}`,
  `contentFit="cover"`, `transition={200}`. `character-unlock-modal`'s prop `personageImage` is
  meegetypeerd naar `ImageSourcePropType`.
- **`scripts/generate-portrait-images.mjs` herschreven**: downloadt nu de bytes naar
  `assets/images/characters/<id>.webp` in plaats van een tijdelijke URL in een TS-file te zetten.
  Met `--list` (status), `--only <ids>`, `--force`, 429-backoff en `.env.local`-token, dezelfde
  aanpak als `generate-app-icon.mjs`. Slaat standaard bestaande bestanden over.
- **Nieuw: `scripts/asset-require-shim.mjs`.** Node draait de content-files als ESM; daar bestaat
  `require` niet en is een `.webp` niet importeerbaar, dus `npm run validate:content` klapte meteen
  op de nieuwe map. De shim zet een globale `require` neer die het pad teruggeeft. Geïmporteerd
  door `validate-content.mjs` en `recalculate-read-times.mjs` — **elk nieuw script dat content
  laadt moet dit ook doen.**

**Verificatie (alles gedraaid, alles groen):**
- `npx tsc --noEmit` schoon; `npm run validate:content` OK (19 verhalen, 6 tijdperken);
  `npm run content:read-times -- --check` OK.
- `npm run lint`: **13 → 8 problemen** (7 errors, 1 warning). Twee dode variabelen opgeruimd in
  files die deze fase toch al aangeraakt werden (`getTijdperk`/`tijdperk` in `verhaal-kaart.tsx`,
  ongebruikte `useTheme` in `verhaal-carousel-kaart.tsx`). De 8 die overblijven staan allemaal in
  files die deze fase niet raakte: `(tabs)/_layout.tsx` (display-name), het verweesde
  `tijdperken-carousel.tsx` (5× `react-hooks/refs`), `use-color-scheme.web.ts`
  (`set-state-in-effect`) en het verweesde `tijdperk-kaart.tsx` (ongebruikte `theme`).
- **`npx expo export --platform android` als harde bundel-test:** alle 19 webp's zitten in de
  export en zijn **MD5-identiek** aan de bronbestanden. De Hermes-bundel bevat **0×**
  `replicate.delivery`, **0×** `via.placeholder` en **0×** `placeholder.com`.
- **Doorlopen op de Pixel_8-emulator via adb** (screenshots in de scratchpad van die sessie):
  Home toont echte portretten in de hero-rij én de era-carousels; Julius Caesar → 8 tegels →
  hoofdstuk 1 → "Mark Complete" → footer wordt "Next Chapter" → hoofdstuk 2 opent → terug naar het
  overzicht toont **1/8, tegel I terracotta met vinkje, tegel II ontgrendeld, III+ nog op slot**.
  Dit vinkt meteen de doorloop af die Fase 2 open had staan.
- **De doorslaggevende vliegtuigmodus-test uit dit plan is gedaan**: airplane mode aan, app
  force-stopped, koud herstart → alle portretten laden nog steeds. Ze komen uit de bundel.
  (Airplane mode is daarna weer uitgezet.)

**Openstaande aandachtspunten na Fase 3:**
- **Alle 19 beelden zijn 1344×752 (16:9), terwijl `verhaal-carousel-kaart.tsx` een 3:4-container
  is.** Met `contentFit: cover` wordt er dus ~58% van de breedte weggesneden. Op de emulator pakt
  dat voor de gecentreerde portretten verrassend goed uit (Caesar staat er vol in), maar bij
  Spartacus valt het onderwerp uit het midden en `rome-rise`/`pompeii-disaster` zijn juist wijde
  vergezichten die door de crop hun compositie verliezen. Twee opties, allebei buiten B1: de kaart
  naar 16:9 trekken, of die vier beelden opnieuw genereren op `aspect_ratio: '3:4'` (het script
  vraagt daar nu al om voor nieuwe generaties).
- De app draaide deze sessie in **donker thema** (per ongeluk aangezet via de dev-tools-overlay) —
  dat is meteen de dark-mode-controle die het plan vraagt: reader, chapters en Home zien er goed
  uit en de portretten vallen niet uit de toon.
- Het **"Advertisement"-placeholderblok** is in de reader zichtbaar bevestigd. Dat is precies de
  afwijsreden uit A4 — staat gepland voor Fase 6.
- Bij het opstarten toont de app nog een **in-app splash met het oude "HISTORY"-logo** (het
  zandloper-mark, niet het Chronicles-icoon uit Fase 1). Niet blocking, maar inconsistent met de
  nieuwe identiteit; meenemen wanneer een fase toch aan het opstartpad zit.
- `character-unlock-modal` wordt nog steeds automatisch getoond door het `hasAutoUnlockedRef`-effect
  (overgenomen uit Fase 2, nog steeds open). **Fase 4 raakt precies dit scherm — daar meenemen.**
- `nl`/`fr`/`de` **content** blijft ontbreken. Bewust buiten v1.0-scope.

**Wat Fase 2 heeft opgeleverd:**
- **Nieuwe module `src/content/leestijd.ts`** — één plek voor woordtelling en leestijd
  (`WOORDEN_PER_MINUUT = 250`, `telWoordenInBlok/Blokken/Chapters`, `berekenLeestijdMinuten`,
  `berekenVerhaalLeestijdMinuten`). Neemt een `VeldResolver` als argument, zodat de app `v()` uit
  `useVertaling()` doorgeeft en Node-scripts `(veld) => veld.en` — de module kent zelf geen taal.
- **`calculateReadTime` in `chapters.tsx` weg**, vervangen door `berekenLeestijdMinuten(…, v)`.
  De oude versie was `any[]`-getypeerd en las `blok.tekst`/`blok.citaat` terwijl tekst-blokken
  `inhoud` gebruiken en citaten `tekst` — hij telde dus altijd 0 woorden.
- **`leestijdMinuten` van alle 19 verhalen herberekend**: 40-48 min → **5-9 min**. Nieuw script
  `scripts/recalculate-read-times.mjs` + npm-script **`content:read-times`** (met `-- --check` als
  dry-run die exit 1 geeft bij afwijking). Draai die na élke contentwijziging.
- **Mojibake weg**: 119× `â€”` → `—` (33 in `oudheid/gebeurtenissen.ts`, 39 in
  `industriele-revolutie/personen.ts`, 47 in `vroegmoderne-tijd/personen.ts`) en 1× `Ã©` → `é`
  ("coup d'état", vroegmoderne-tijd). Van diezelfde drie files is ook de **UTF-8 BOM** gestript
  (eslint `unicode-bom`; scheelde 3 warnings). Een scan over heel `src/` laat nu alleen nog
  legitieme accenten en dashes zien.
- **Hardcoded strings uit reader + chapters** naar i18n: nieuwe sectie **`hoofdstuk`** in
  `src/i18n/en.ts` (`nietGevondenTitel/-Beschrijving`, `tegelTitel`, `teller`, `voortgang`,
  `volgordeUitleg`, `terugNaarOverzicht`, `markeerVoltooid`, `volgende`, `allesVoltooid`,
  `ontgrendelPersonage`), **volledig vertaald in nl/fr/de**. De Nederlandse fallbacks
  ("Niet gevonden", "Dit chapter bestaat niet") zijn weg; `grep` op hardcoded UI-tekst in die twee
  schermen is schoon.
- **Dubbel voltooi-mechanisme opgelost**: de `useEffect` die het hoofdstuk bij 80% scroll afvinkte
  is verwijderd (met comment op de plek waar hij stond). **"Mark Complete" is nu de enige trigger** —
  dat is ook de flow die `CLAUDE.md` als verificatieprocedure voorschrijft. `scrollPercentage`
  voedt alleen nog de voortgangsbalk. Geen doodlopende weg: `isChapterUnlocked` geeft hoofdstuk 1
  altijd vrij en de rest op `completedChapters.includes(id - 1)`.

**Twee constateringen die het plan corrigeren:**
1. Het plan schatte Caesar op *3.127 woorden ≈ 13 min*. De werkelijke telling is **1.497 woorden**;
   over alle content **31.297 woorden / 152 hoofdstukken / 347 blokken** (333 tekst, 14 citaat,
   0 afbeelding) — die laatste cijfers kloppen wél met het plan. De per-verhaal schatting zat er
   dus een factor 2 naast; de echte leestijden zijn 5-9 min per verhaal.
2. Daardoor blijft **"1 min read" op de meeste hoofdstuktegels staan** — maar nu terecht: een
   hoofdstuk is ~200 woorden. De bug was echt (0 woorden geteld), de zichtbare winst zit vooral in
   de verhaal-kaarten (40-48 → 5-9 min). Als de tegels gevarieerder moeten lezen, is dat een
   **content**-vraag (langere hoofdstukken), geen berekening.

**Openstaande aandachtspunten:**
- **De interactieve doorloop uit `CLAUDE.md` is níét afgevinkt.** Deze sessie kon de dev-server wel
  starten en de bundel valideren (`entry.bundle` met `lazy=false`, HTTP 200, 9,0 MB, bevat
  `berekenLeestijdMinuten` en de nieuwe `hoofdstuk`-keys, en géén `calculateReadTime` meer), maar
  niet klikken. **Doe dit aan het begin van Fase 3:** verhaal openen → 8 tegels → hoofdstuk 1 →
  "Mark Complete" → tegel 2 ontgrendelt → hoofdstuk 2 openen.
- **`npm run lint` geeft 13 problemen (7 errors, 6 warnings) — allemaal van vóór deze fase**, in
  `(tabs)/_layout.tsx` (display-name), het verweesde `tijdperken-carousel.tsx` (5× `react-hooks/refs`)
  en `use-color-scheme.web.ts` (`set-state-in-effect`). Niets uit Fase 2 staat ertussen.
- **Schijfruimte — opgelost in dezelfde sessie.** C: stond op 0 bytes vrij, waardoor élk `npm run …`
  met `ENOSPC` faalde terwijl npm zijn eigen debug-log schreef. Verplaatst naar G: (~13,8 GB, C: nu
  14,6 GB vrij): de stale duplicaten `C:\Users\Quinten\.gradle` en `.android\avd` → geparkeerd in
  `G:\_c-drive-parked\`, npm-cache → `G:\dev-cache\npm-cache` (vastgelegd in `~/.npmrc`), en
  user-scope `TEMP`/`TMP` → `G:\dev-temp`. **De Android SDK (12 GB) staat bewust nog op C:** omdat
  Android Studio daar een eigen instelling voor heeft. `npm run …` werkt weer zonder workaround;
  emulator en `adb devices` zijn na de verhuizing geverifieerd. Twee restpunten: `G:\_c-drive-parked\`
  mag weg zodra alles goed draait (12,1 GB terug op G:), en ~0,65 GB oude rommel in
  `C:\...\AppData\Local\Temp` is blijven staan omdat Studio/emulator daar bestanden open hadden.
- `character-unlock-modal` wordt nog steeds automatisch getoond door de `hasAutoUnlockedRef`-effect,
  waardoor de "Unlock <naam>"-knop in de footer in de praktijk nooit verschijnt. Buiten B5-scope,
  maar Fase 4 (B4) raakt precies dit scherm — daar meenemen.
- `nl`/`fr`/`de` **content** blijft ontbreken (0 vertaalde velden); de UI-strings van de reader zijn
  nu wel compleet vertaald. Bewust buiten v1.0-scope.

**Wat Fase 1 heeft opgeleverd:**
- Nieuw app-icoon gegenereerd via Replicate (flux-1.1-pro) en **lokaal opgeslagen**:
  `assets/images/app-icon.png` (1024², store/iOS), `app-icon-adaptive.png` (Android foreground,
  mark op 56% voor de safe zone), `app-favicon.png` (196²). Bron-kandidaten staan in
  `assets/images/icon-candidates/`; `candidate-1-fixed.png` is de gekozen bron.
- Twee nieuwe scripts: `scripts/generate-app-icon.mjs` (genereert 3 kandidaten, downloadt de bytes,
  met 429-backoff omdat Replicate hard throttlet onder $5 tegoed) en
  `scripts/derive-icon-variants.mjs` (leidt alle varianten af via `pngjs`, detecteert de
  achtergrondkleur en het mark-bounding-box zelf). npm-scripts: `generate:app-icon`,
  `derive:icon-variants`. `pngjs` toegevoegd aan devDependencies.
- `app.json`: icon/adaptiveIcon/favicon/splash wijzen naar de nieuwe bestanden,
  `supportsTabletMode` → `supportsTablet`, `userInterfaceStyle` → `automatic`,
  `android.versionCode: 1`, dode top-level `splash`-blok verwijderd, `imageWidth` 76 → 200,
  achtergrondkleuren op `#FAEDD8` (de werkelijke kleur van het icoon).
- `npx expo prebuild --clean --platform android` gedraaid. Geverifieerd op de emulator:
  `applicationId` = `com.chronicles.historyapp` ✅, `app_name` = `Chronicles` ✅, launcher toont het
  Chronicles-icoon ✅. `npx tsc --noEmit` en `npm run validate:content` schoon.

**Openstaande aandachtspunten:**
- **Release-signing staat nog op `signingConfigs.debug`** in `android/app/build.gradle`. Dat is het
  normale Expo-template voor lokale builds; EAS vervangt het door de beheerde upload-keystore.
  Wordt opgelost in **Fase 7** — niet handmatig patchen.
- Het mark leest op launcher-formaat iets bescheiden. Optionele tweak: `SAFE_ZONE` in
  `scripts/derive-icon-variants.mjs` van `0.56` naar `~0.64`, dan `npm run derive:icon-variants` en
  `npx expo prebuild --clean --platform android`.
- Er is nog **geen `monochromeImage`** voor Material You (Android tint het icoon dan niet mee).
  Vereist een silhouet op transparant; niet blocking voor release.
- De app is wél gebouwd en geïnstalleerd, maar **niet end-to-end doorlopen** in deze fase (dat
  hoort bij Fase 2). De build is een dev-client build en heeft Metro nodig (`npm run android`).

---

## Context

De app is functioneel af: datamodel, designsysteem, drie tabs, era-rijen op Home, hoofdstuk-reader
met persistente voortgang, character-unlocks, streaks, i18n (en/nl/fr/de) en een thema-picker
werken allemaal. Wat ontbreekt is (a) alles wat een build *publiceerbaar* maakt, en (b) alles wat
lezen *leuk* maakt.

Uit de codebase-scan kwamen twee harde constateringen:

1. **Er kan op dit moment geen store-build gemaakt worden.** Geen `eas.json`, geen EAS project-id,
   het app-icoon is een 240x240 WebP (Play wil 512x512 PNG), de native `applicationId` staat nog op
   `com.anonymous.historyapp`, de launcher-naam is `history-app` en de release-build wordt met de
   **debug-keystore** gesigneerd — Play weigert dat botweg. Dit is precies waarom je in de emulator
   nog het standaard-blauwe icoon ziet.
2. **De content is 96% platte tekst.** In 32.086 woorden over 152 hoofdstukken staan **333**
   tekst-blokken, **14** citaten en **0** afbeeldingen. Erger: `blok-weergave.tsx` kán helemaal geen
   afbeelding renderen — de `afbeelding`-tak negeert `blok.bron` en tekent een gekleurd vierkantje
   met een icoon. En alle 19 portretten hangen aan **verlopende `replicate.delivery`-URL's** die in
   een gepubliceerde build simpelweg kapot zijn. `react-native-reanimated` 4.5.0 staat geïnstalleerd
   en wordt **nergens** gebruikt; `expo-haptics` is niet eens geïnstalleerd. *(Beide opgelost in
   Fase 4 — zie B4.)*

**Gekozen koers:** Android eerst (Google Play), gratis app **zonder** advertenties in v1.0,
AI-gegenereerde beelden lokaal gebundeld, en beeld + motion samen aanpakken.

**Twee hoofddoelen:**
- **Doel A — Shipbaar:** een gesigneerde AAB met een echt icoon, echte package-naam en een
  privacybeleid, die door Play-review komt.
- **Doel B — Meeslepend:** hoofdstukken met echte beelden, beweging en een unlock-moment dat voelt
  als een beloning in plaats van een grijze kaart.

---

# Doel A — Shipbaar maken

## A1. App-identiteit & icoon (dit lost het blauwe icoon op) — ✅ afgerond

> **Let op — val niet in deze val.** De eerste versie van dit plan stelde voor om
> `assets/images/icon.png` (1024x1024) en de `android-icon-*.png`-set te gebruiken "want die
> bestaan al". Dat is **fout**: dat zijn allemaal het **Expo-standaard blauwe icoon**.
> `splash-icon.png` is leeg/wit, `favicon.png` is de default, en `logo.svg` is een oud
> "HISTORY"-zandloperlogo met andere branding. Het enige echte Chronicles-logo was
> `chronicles-logo.webp` (240x240, met ingebakken donkere rand). Controleer bij assets altijd de
> *inhoud*, niet alleen de afmetingen.

Uitgevoerd: nieuw icoon gegenereerd (zie Handover). `app.json` wijst nu naar `app-icon.png`,
`app-icon-adaptive.png` en `app-favicon.png`; verder `supportsTabletMode` → `supportsTablet`,
`userInterfaceStyle` → `automatic`, `android.versionCode: 1`, dode top-level `splash` weg,
`imageWidth` 76 → 200, achtergrondkleuren `#FAEDD8`.

`expo.extra.eas.projectId` ontbreekt nog — wordt gezet door `eas init` in Fase 7.

## A2. Native Android-config resetten — ✅ afgerond

`android/` is prebuild-output en staat **in `.gitignore`** (regel 43). Daar zitten drie blockers in
(`android/app/build.gradle:90-92` → `com.anonymous.historyapp`; `:112-115` → release gesigneerd met
`signingConfigs.debug`; `android/app/src/main/res/values/strings.xml:2` → `app_name` is
`history-app`).

**Niet handmatig patchen.** Omdat de map gitignored is, uploadt EAS Build 'm niet en prebuilt EAS
vers vanuit `app.json` — dan zijn alle drie automatisch correct. Lokaal: `npx expo prebuild --clean`
ná het corrigeren van `app.json`. (Conform de no-delete-regel wordt hier niets weggegooid;
`prebuild --clean` regenereert de map zelf.)

## A3. EAS build-pipeline — 🟡 repo-werk klaar, login nog te doen

Stap 2, 4 en 5 zijn in Fase 7 gedaan: **`eas.json`** staat er (handgeschreven in plaats van via
`eas build:configure`, want dat commando vereist ook al een account) en is offline gevalideerd met
`@expo/eas-json`; `runtimeVersion` staat op `appVersion`; de npm-scripts zijn er, plus
`submit:android:prod`. `eas-cli` staat in `devDependencies` zodat die scripts zonder globale
installatie werken.

Stap 1 (`eas login` + `eas init` → `extra.eas.projectId`) en stap 3 (`eas credentials` →
upload-keystore) **vereisen een ingelogd Expo-account** en staan daarom in `store/README.md`.
`.gitignore` sluit `*.jks`/`*.p12` al uit; daar is nu ook `play-service-account.json` bij gekomen.

## A4. Store-blockers in de app zelf — ✅ afgerond

Uitgevoerd in Fase 6; zie Handover. `ad-banner.tsx` returnt `null` achter `ADS_ENABLED = false`
(component en alle vier de call-sites blijven staan), `@supabase/*` is uit `dependencies` en
`expo-dev-client` is naar `devDependencies` verhuisd. Bundel-test: 0× `supabase`, 0×
`expo-dev-client` in de Hermes-bundel.

Eén punt uit dit lijstje bleek **al gedaan**: de "Storylines"-sectie op Home stond al achter
`SHOW_STORYLINES = false` (`(tabs)/index.tsx:24`). Alleen geverifieerd, niets aan veranderd.

## A5. Privacy & juridisch (Play vereist dit, ook zonder ads) — 🟡 code klaar, URL nog te vullen

Uitgevoerd in Fase 6, op één handeling na die buiten de code ligt:

- ✅ Privacybeleid geschreven: **`docs/privacy-policy.html`**, één zelfstandig bestand in het palet
  van de app. `docs/README.md` bevat het GitHub-Pages-stappenplan.
- ✅ Link toegevoegd aan `(tabs)/profiel.tsx` — nieuwe "About"-sectie, opent via `expo-web-browser`.
  De sectie **verbergt zichzelf** zolang `PRIVACY_BELEID_URL` in `src/constants/juridisch.ts` nog
  de placeholder is, zodat een release nooit een dode link toont.
- ⬜ **De pagina publiceren en de echte URL invullen.** Dit kan Claude niet doen: de repo heeft geen
  remote. Zie de waarschuwing bovenaan de Handover.
- ⬜ **Data Safety-formulier** ("no data collected" — nu waar, want A4 is gedaan) en de
  ⬜ **IARC-vragenlijst** (wordt PEGI 3 / Everyone). Allebei Play Console-werk → **Fase 7**. De
  exacte antwoorden staan klaar in `docs/README.md`, zodat formulier en pagina niet uit elkaar lopen.

## A6. Store listing — ✅ afgerond

Alles staat in de nieuwe map **`store/`**: `listing.md` (teksten + het antwoord op elk Console-veld),
`README.md` (de handmatige stappen), `feature-graphic.html` (bron) en `assets/` met het 512×512
icoon, de 1024×500 feature graphic en 8 phone-screenshots van 1080×1920.

Twee dingen die dit plan niet noemde maar wel bepalend waren:
1. **Play wil 9:16 of 16:9 voor phone-screenshots**, en de Pixel_8-emulator is 1080×2400 (9:20).
   Zonder `adb shell wm size 1080x1920` levert elke opname een afgekeurde verhouding.
2. **De feature graphic mag geen alfakanaal hebben.** Een headless-Chrome-screenshot is standaard
   RGBA, dus het script plat hem expliciet naar kleurtype 2.

---

# Doel B — De verhalen meeslepend maken

## B1. Beeld-pipeline repareren — ✅ afgerond

Alle vijf de stappen zijn in Fase 3 uitgevoerd; zie Handover voor het detail. Eén afwijking van
het plan: stap 2 (de 4 Oudheid-portretten opnieuw genereren) was niet nodig — de bestaande
`replicate.delivery`-URL's resolveden nog, dus de bytes zijn simpelweg gedownload. Het script is
wél uitgebreid zodat het voortaan naar `assets/` schrijft.

Eén punt dat het plan niet voorzag en **open blijft**: de beelden zijn 16:9, de carousel-kaart is
3:4. Zie het aandachtspunt in de Handover.

## B2. Afbeeldingen in hoofdstukken (`afbeelding`-blok echt renderen) — ✅ afgerond

Uitgevoerd in Fase 5; zie Handover. De renderer is een `expo-image` op 16:9 geworden, en er zijn
32 scènebeelden (1 per hoofdstuk voor de vier Oudheid-verhalen — de proef die dit plan voorstelt)
gegenereerd met het nieuwe `scripts/generate-scene-images.mjs` en gebundeld via
`src/constants/scene-images.ts`.

Twee dingen die dit plan niet voorzag:
1. **`Blok.bron` moest van `string` naar `ImageSourcePropType`** — precies dezelfde correctie als
   `Verhaal.afbeelding` in B1, want ook een scènebeeld hoort een gebundeld `require()` te zijn.
2. **Hetzelfde beeld doet dubbel werk**: het is ook `Chapter.afbeelding` en vult daarmee de
   hoofdstuktegel, wat het openstaande punt uit B4 afsluit. Vergrendelde tegels tonen het niet.

**Blijft open:** de overige 15 verhalen (120 hoofdstukken). Dat is nu **B2b hieronder**, ingepland
als Fase 6.5.

## B2b. Scènebeelden voor de overige 15 verhalen (Fase 6.5) — ✅ afgerond

Uitgevoerd in Fase 6.5; zie Handover voor het detail en voor de vier correcties die dit plan niet
voorzag (LF in plaats van CRLF, het standaardgeval dat het model invult als je niet zegt wie er te
zien is, monochrome 20e-eeuwse scènes, en het NSFW-filter dat op woorden reageert). Alle 152
beelden zitten erin voor **31 MB**, onder de schatting hieronder.

De oorspronkelijke planning stond hieronder en klopt verder:

De proef uit B2 is geslaagd en de stijl is goedgekeurd, dus de rem die daar op stond is eraf. Dit
is de klus met de beste verhouding tussen moeite en resultaat die er nog ligt: elk beeld doet
**dubbel werk** (blok ín het hoofdstuk én achtergrond van de hoofdstuktegel), dus hiermee gaat
meteen het overzichtsscherm van álle 19 verhalen er beter uitzien in plaats van alleen die vier.

**Omvang:** 15 verhalen × 8 hoofdstukken = **120 beelden**. De vier Oudheid-verhalen zijn al klaar.

**Werk, in volgorde:**
1. **120 prompts schrijven** in `scenePrompts` in `scripts/generate-scene-images.mjs`. Dit is het
   echte werk — de generatie zelf is een druk op de knop. Sleutel is `<verhaal-id>-<hoofdstuk-id>`;
   houd de bestaande Oudheid-prompts als maat voor lengte en detailniveau, en raak **`STIJL` niet
   aan** — die ene gedeelde suffix is precies waarom 32 losse generaties als één serie ogen.
2. `npm run generate:images:scenes` (~$5 aan Replicate, ~35 min). Het script slaat bestaande
   bestanden over, dus de Oudheid wordt niet opnieuw gegenereerd. Eén mislukte prompt breekt de run
   niet af; aan het eind volgt een kant-en-klare `--only`-regel om de restanten over te doen.
3. **120 regels toevoegen aan `SCENE_IMAGES`** in `src/constants/scene-images.ts`. Bewust expliciet
   en niet `require.context` — een ontbrekend bestand hoort een build-fout te geven.
4. **Per hoofdstuk een `{ type: 'afbeelding' }`-blok vooraan** en `Chapter.afbeelding` zetten, in
   `src/content/verhalen/<tijdperk-id>/personen.ts`. Let op de CRLF-regel en op het feit dat
   `oudheid/gebeurtenissen.ts` een hoofdstuk op één regel zet terwijl `personen.ts` het over meer
   regels spreidt — zie CLAUDE.md.
5. `npm run content:read-times` (afbeeldingsblokken hebben een `alt`/`bijschrift` dat meetelt),
   daarna `npx tsc --noEmit`, `npm run validate:content` en `npm run lint`.

**Let op de bundelgroei.** De 32 huidige beelden zijn 7,4 MB (gemiddeld 237 KB per stuk), dus 152
beelden worden **~35 MB**. Dat past ruim binnen Play's limieten, maar het is wél de
downloadgrootte van je app. Als dat te veel wordt: verlaag de resolutie of de webp-kwaliteit in
`downloadTo`/de generatiestap — niet achteraf per bestand handmatig.

**Buiten scope van deze fase:** de rijke blokken (`kop`, `weetje`, `sleutelmoment`) voor diezelfde
120 hoofdstukken. Dat is geen generatiewerk maar **schrijfwerk** — de Oudheid-weetjes zijn echte
feiten, geen vulling — en het is meerdere sessies. Zie B3b.

## B3. Blok-types uitbreiden — ✅ afgerond

Uitgevoerd in Fase 5: `kop`, `weetje` en `sleutelmoment` zitten in `types.ts`,
`blok-weergave.tsx`, `validate-content.mjs` én `telWoordenInBlok` (die vierde plek stond niet in
dit plan, maar zonder die regel telt een hoofdstuk de nieuwe tekst niet mee in zijn leestijd).

Het citaat is opgewaardeerd zoals hier beschreven — groot aanhalingsteken-glyph plus `Fonts.serif`,
dat daarmee voor het eerst ergens gebruikt wordt.

Eén ding dat dit plan niet voorzag: **het jaartal van een sleutelmoment is een i18n-functie**
(`blok.jaarLabel`), geen opmaak in de component. "753 BC" en "753 v.Chr." zijn geen
formatteringsverschil maar een vertaling.

De blokken zijn toegepast op de 32 Oudheid-hoofdstukken; de andere vijf tijdperken zijn nog puur
tekst — dat is contentwerk. Zie B3b.

## B3b. Rijke blokken voor de overige 120 hoofdstukken (ná launch, v1.1)

De types, de rendering, de validatie en de woordtelling staan er allemaal al — er hoeft geen regel
code bij. Wat ontbreekt is **inhoud**: per hoofdstuk een tussenkop en één inhoudelijke onderbreking
(`weetje` of `sleutelmoment`).

**Bewust ná de 1.0-launch.** Dit is echt schrijfwerk, geen generatie: de Oudheid-weetjes zijn
gecontroleerde feiten (het jaar van 445 dagen, decimatie bij Crassus, de 11.000 graffiti van
Pompeii), geen vulling. 120 hoofdstukken op dat niveau kost meerdere sessies, en het is geen
Play-blocker — de andere vijf tijdperken lezen dan wat vlakker, maar ze lezen prima.

Updates naar Play zijn gratis en onbeperkt na de eenmalige accountkosten, dus dit is precies het
soort werk dat een 1.1 verdient: iets om bestaande gebruikers mee terug te halen.

## B4. Motion & haptics — ✅ afgerond

Uitgevoerd in Fase 4; zie Handover voor het detail. Reanimated is niet langer ongebruikt en
`expo-haptics` staat erin. Twee dingen die dit plan niet voorzag:

1. **Een motion- en een haptics-tokenmodule** (`constants/motion.ts`, `constants/haptics.ts`) in
   plaats van losse duur-waardes en `impactAsync`-aanroepen door de schermen heen. Op Android gaat
   haptiek via `performAndroidHapticsAsync`, niet via `notificationAsync(Success)` zoals hier
   stond — dat simuleert met de `Vibrator`-API, terwijl de eerste de systeem-haptiek gebruikt.
2. **`sharedValue.get()`/`.set()` in plaats van `.value =`**, want de
   `react-hooks/immutability`-regel van eslint-plugin-react-hooks keurt een `.value`-toewijzing af.

Eén punt uit dit lijstje is **niet** gedaan en bewust doorgeschoven: **beeld per hoofdstuk-tegel**.
`Chapter.afbeelding` blijft ongelezen omdat er nog geen enkel hoofdstukbeeld bestaat — dat is B2
(Fase 5). De unlock-animatie wanneer de volgende tegel opengaat zit er wél in.

## B5. Content-bugs die je nu al kunt zien — ✅ afgerond

Alle vijf de punten hieronder zijn in Fase 2 opgelost; zie Handover voor het detail en voor twee
correcties op de cijfers in dit plan.

- ~~**`calculateReadTime`** (`chapters.tsx:17-29`) leest `blok.tekst` en `blok.citaat`, maar
  tekst-blokken zetten hun inhoud in **`blok.inhoud`** en citaten in `blok.tekst`.~~ → verplaatst
  naar `src/content/leestijd.ts`, correct getypeerd op `Blok[]`.
- ~~**`leestijdMinuten` klopt 3,5x niet**~~ → herberekend uit de woordtelling; 40-48 → 5-9 min.
  Bewaak het met `npm run content:read-times -- --check`. (De schatting "Caesar = 3.127 woorden"
  in dit plan was fout — het zijn er 1.497.)
- ~~**Mojibake**~~ → 119× `â€”` → `—` plus 1× `Ã©` → `é`; BOM's van dezelfde drie files gestript.
- ~~**Hardcoded strings in `reader.tsx`**~~ → nieuwe `hoofdstuk`-sectie in `src/i18n/en.ts`,
  vertaald in nl/fr/de; `chapters.tsx` is in dezelfde beweging meegenomen.
- ~~**Dubbel voltooi-mechanisme**~~ → de 80%-scroll-`useEffect` is weg, "Mark Complete" is de enige
  trigger.
- **`nl`/`fr`/`de` komen 0 keer voor** in alle content — niet-Engelse gebruikers krijgen Engelse
  verhalen terwijl de UI wél vertaald is. Buiten v1.0-scope, maar bewust maken (taal-picker blijft
  gated zoals nu, `profiel.tsx:31`). **Blijft open.**

## B6. Retentie (klein maar hoog rendement) — ✅ afgerond (Fase 8)

- ~~**Streak-bugs** in `voortgang-store.ts`~~ → begint op 0 (met persist-migratie), lokale datums
  in plaats van UTC, en een verlopen streak wordt echt 0 doordat `useStreak()` hem afleidt in
  plaats van uitleest. Bovendien telt alleen een **afgerond hoofdstuk** nog als leesactiviteit.
- ~~**`expo-notifications` is niet geïnstalleerd**~~ → dagelijkse herinnering om 19:00, standaard
  uit, toestemming pas ná het eerste afgeronde hoofdstuk, schakelaar op Profiel. Eén detail dat
  het plan niet voorzag: de tekst wordt mét de planning meegegeven, dus een taalwissel moet
  opnieuw plannen — dat doet de hook in de root-layout.
- **Wat het plan óók niet voorzag:** dit pakket sleept FCM en twintig launcher-badge-permissies
  mee. Zie de handover bovenaan; `android.blockedPermissions` ruimt het grootste deel op.

---

## Verificatie (elke fase)

1. `npx tsc --noEmit` — moet schoon zijn.
2. `npm run validate:content` — na elke content- of `Blok`-type-wijziging (nieuwe varianten hebben
   een case in `scripts/validate-content.mjs` nodig, anders faalt validatie).
3. `npm run lint`.

Content/reader-verificatie (conform `CLAUDE.md`): dev-server starten → verhaal openen →
hoofdstukoverzicht toont alle 8 hoofdstukken → hoofdstuk 1 openen → tot het eind lezen →
"Mark Complete" → volgende tegel ontgrendelt → herhalen voor minstens één hoofdstuk.

Fase-specifiek:
- **Fase 1 (icoon):** `npx expo prebuild --clean` → `npm run android` → controleer op het
  emulator-startscherm dat het launcher-icoon Chronicles is en het label "Chronicles"
  (niet "history-app").
- **Fase 3 (beelden):** zet het toestel in vliegtuigmodus en open Home + Profiel — als portretten
  nog steeds laden, komen ze uit de bundel en niet van een verlopende URL. Doorslaggevende test.
- **Fase 4 (motion):** Reanimated werkt niet betrouwbaar op web; test op de Android-emulator, niet
  in de browser. Let op de `reactCompiler: false`-quirk uit `CLAUDE.md` — niet omzetten.
- **Donker thema:** na `userInterfaceStyle: "automatic"` beide schema's doorlopen (Profiel →
  thema-picker Licht/Donker/Systeem) op reader, chapters en Home.
- **Fase 7 (build):** `eas build --profile preview --platform android` → APK op eigen toestel
  installeren en de volledige flow doorlopen vóór een AAB naar de internal testing track gaat.

## Buiten scope voor v1.0 (expliciet)

iOS/App Store, echte AdMob-integratie, premium-abonnement via Play Billing, NL/FR/DE
**content**vertaling (UI is al wel vertaald), het weer aansluiten van de verweesde Kaart/Regio/
Continent-schermen, en het cureren van `collecties.ts`.
