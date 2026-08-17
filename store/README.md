# store/ — alles voor de Google Play-release

Deze map is het tegenhangertje van `docs/`: `docs/` bevat wat *gepubliceerd* wordt (het
privacybeleid), `store/` bevat wat je in de **Play Console** invult en uploadt.

| Bestand | Wat het is |
|---|---|
| `listing.md` | Alle listing-teksten en de antwoorden op elk Console-veld, klaar om te kopiëren |
| `feature-graphic.html` | **Bron** van de feature graphic — geen PNG met de hand bewerken |
| `assets/icon-512.png` | Hi-res icoon, 512×512 |
| `assets/feature-graphic.png` | Feature graphic, 1024×500, gerenderd uit de HTML |
| `assets/screenshots/` | Phone-screenshots, 1080×1920 |

Regenereren: `npm run generate:store-assets` (icoon + feature graphic) en
`npm run check:listing` (hertelt de tekenlimieten in `listing.md`).

---

## Wat al klaar staat in de repo

- `eas.json` met drie build-profielen en twee submit-profielen. `production` levert een **AAB**
  (`buildType: "app-bundle"`), `preview` een installeerbare **APK** voor je eigen toestel.
- `runtimeVersion: { "policy": "appVersion" }` in `app.json`, zodat OTA-updates later kunnen zonder
  dat de eerste release al de verkeerde runtime vastlegt.
- npm-scripts: `build:android:preview`, `build:android:prod`, `submit:android`,
  `submit:android:prod`.
- `eas-cli` staat **bewust niet** in `package.json` — als devDependency liet hij elke cloud-build
  stuklopen op `npm ci` (zie CLAUDE.md, "Release & store assets"). De scripts draaien hem via
  `npx`; losse commando's geef je als `npm run eas -- <…>`.
- De Supabase-sleutels staan als **EAS project-environmentvariabelen** in `development`, `preview`
  en `production` (`npm run eas -- env:list production`). `.env.local` wordt niet meegestuurd, dus
  zonder die variabelen crasht de build bij de eerste render.
- `.easignore` bepaalt wat er wordt geüpload en **vervangt** alle `.gitignore`-bestanden. Een regel
  die je alleen in `.gitignore` zet, doet niets voor de build.

**Versienummers worden op de EAS-server bijgehouden** (`cli.appVersionSource: "remote"`). Bij de
eerste productiebuild neemt EAS `android.versionCode` uit `app.json` (= 1) over als startwaarde;
daarna hoogt `autoIncrement` hem elke build zelf op. Dat is bewust: "version code already used" is
de meest voorkomende afwijzing bij handmatig tellen. Het getal in `app.json` blijft staan voor
lokale `expo run:android`-builds, maar is voor EAS vanaf dat moment niet meer leidend.

---

## Wat jij moet doen

Alles hieronder vraagt om inloggen of om de Play Console — dat kan Claude niet voor je doen.

### 0. Blocker: publiceer het privacybeleid

Zonder URL geen listing. Stappenplan staat in `docs/README.md`. Vul de URL daarna in op **twee**
plekken: `PRIVACY_BELEID_URL` in `src/constants/juridisch.ts` **en** Play Console → Store settings.

De code is er al op voorbereid: zolang de placeholder er staat verbergt Profiel de "About"-sectie,
zodat er nooit een dode link meegaat in een build.

### 1. Expo-account koppelen

```bash
npx eas login          # bestaand account of gratis aanmaken
npx eas init           # schrijft extra.eas.projectId + owner in app.json
```

`eas init` is het enige dat nog aan `app.json` ontbreekt. Commit die wijziging.

### 2. Upload-keystore laten genereren

```bash
npx eas credentials -p android
```

Kies het `production`-profiel → **Keystore: Set up a new keystore** en laat EAS hem genereren en
bewaren. Dit vervangt de debug-signing waar `android/app/build.gradle` nu nog op staat — niet
handmatig patchen, `android/` is gitignored prebuild-output die EAS zelf opnieuw genereert.

Dit is je **upload**-sleutel, niet de sleutel waarmee Play je app uiteindelijk ondertekent: met
Play App Signing houdt Google de echte app-signing key. Raak je de upload-key kwijt, dan kun je via
Play een reset aanvragen — raak je hem kwijt *zonder* Play App Signing, dan kun je nooit meer
updaten. Zet Play App Signing dus aan (standaard voor nieuwe apps).

Back-up: `npx eas credentials` → *Download keystore*. Bewaar dat bestand buiten de repo;
`*.jks`/`*.p12` staan in `.gitignore`, en dat moet zo blijven.

### 3. Preview-build en die zelf doorlopen

```bash
npm run build:android:preview
```

Levert een APK-download. Installeer die op een **echt toestel** (niet alleen de emulator) en loop de
volledige flow door: verhaal openen → 8 hoofdstukken → "Mark Complete" → volgende tegel ontgrendelt
→ personage ontgrendelen → Profiel. Dit is de laatste kans om iets te vinden vóór er een AAB naar
Play gaat.

Controleer op die build ook het openstaande punt uit Fase 6: **de dev-launcher hoort er niet in te
zitten**. Het `preview`-profiel zet `developmentClient: false`, dus de app hoort meteen te starten
zonder Metro en zonder dev-menu.

### 4. Play-developeraccount

Eenmalig **$25**, en Google verifieert je identiteit — dat duurt dagen tot weken. Begin hier vroeg
mee; het staat helemaal los van de content.

> ⚠️ **Reken op de 12-testers-regel.** Voor persoonlijke developeraccounts eist Google een
> **closed test met minimaal 12 testers die 14 dagen aaneengesloten meedoen** voordat je toegang
> tot productie krijgt. **Internal testing telt daar niet voor** — dat is een aparte track. Google
> sleutelt regelmatig aan deze regel, dus check de exacte eis in je eigen Console onder
> *Dashboard → Publishing overview*. Plan hem in: het is de langste doorlooptijd in het hele
> traject, langer dan de review zelf.

### 5. App aanmaken en de listing vullen

Play Console → **Create app**: naam uit `listing.md`, taal Engels (US), type App, gratis.

Vul daarna in deze volgorde, alles staat in `listing.md`:

1. **Store listing** — naam, korte + volledige beschrijving, icoon, feature graphic, screenshots.
2. **Store settings** — categorie, tags, contactgegevens, **privacy policy-URL**.
3. **App content** — Data Safety ("no data collected", antwoorden in `docs/README.md`),
   IARC-vragenlijst, target audience 13+, ads: nee, news app: nee, government app: nee.

### 6. Eerste upload

De **eerste** release upload je met de hand in de Console (Internal testing → Create new release →
AAB uploaden). `eas submit` kan pas zinvol daarna, want de app moet al bestaan.

```bash
npm run build:android:prod     # AAB
```

Voeg jezelf en je testers toe onder *Internal testing → Testers* (e-mailadressen of een Google
Groep) en deel de opt-in-link.

### 7. Latere uploads automatiseren (optioneel)

Play Console → *Setup → API access* → koppel een Google Cloud-project → maak een service-account met
de rol *Release manager* → download de JSON als **`play-service-account.json`** in de projectroot.
Dat bestand staat in `.gitignore` en mag daar nooit uit.

```bash
npm run submit:android         # internal track
npm run submit:android:prod    # production track
```

Beide submit-profielen staan op `releaseStatus: "draft"`, zodat een upload nooit per ongeluk direct
uitrolt. Zet dat op `"completed"` in `eas.json` zodra je dat wél wilt.

---

## Checklist vóór je op "Send for review" drukt

- [ ] Privacy policy-URL is live en staat in `src/constants/juridisch.ts` **en** in de Console
- [ ] Preview-APK op een echt toestel doorlopen, zonder dev-launcher
- [ ] `npx tsc --noEmit`, `npm run validate:content`, `npm run content:read-times -- --check` schoon
- [ ] Data Safety en IARC ingevuld, allebei kloppend met wat de app werkelijk doet
- [ ] Screenshots tonen de app zoals ze nú is (geen features die er nog niet zijn)
- [ ] De regel over scènebeelden in de volledige beschrijving klopt met de werkelijkheid
      (zie "Na Fase 6.5" in `listing.md`)
