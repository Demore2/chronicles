# docs/ — publieke pagina's

Deze map bevat één ding: **`privacy-policy.html`**, het privacybeleid dat Google Play voor élke
app verplicht stelt (LAUNCH-PLAN.md A5). Die zin luidde hier ooit "ook voor een app zonder
accounts, zonder tracking en zonder advertenties" — dat was waar toen de pagina geschreven werd en
is het sinds R8.AUTH en Firebase Analytics niet meer. **De pagina zelf is nog niet bijgewerkt**;
zie "Wat de privacypagina nog mist" hieronder.

De pagina is bewust één zelfstandig HTML-bestand: geen build, geen externe CSS, geen fonts van een
CDN. Ze volgt het beige palet van de app en heeft een `prefers-color-scheme: dark`-variant.

## Publiceren via GitHub Pages

Deze repo heeft nog **geen remote**. Eenmalig:

1. Maak een repository aan op GitHub (bijvoorbeeld `chronicles-app`) en push `master`:
   ```bash
   git remote add origin https://github.com/<gebruikersnaam>/<repo>.git
   git push -u origin master
   ```
2. GitHub → **Settings → Pages** → *Source*: `Deploy from a branch`, *Branch*: `master`,
   *Folder*: **`/docs`** → Save.
3. Na een minuut staat de pagina op:
   ```
   https://<gebruikersnaam>.github.io/<repo>/privacy-policy.html
   ```
4. Zet die URL op **twee** plekken:
   - `src/constants/juridisch.ts` → `PRIVACY_BELEID_URL`. Zodra de placeholder weg is, wordt
     `privacyBeleidIsGepubliceerd` vanzelf `true` en verschijnt de link op Profiel — er is verder
     niets aan te zetten.
   - Play Console → **Store settings → Privacy policy**.

Werkt de repo liever privé? Dan werkt GitHub Pages niet op een gratis account; gebruik dan een
andere statische host (Netlify Drop, Cloudflare Pages, eigen domein) en zet die URL op dezelfde
twee plekken.

## Bij het invullen van het Data Safety-formulier

De pagina en het formulier moeten hetzelfde zeggen. Wat hier staat, en dus wat je in de Play
Console aankruist:

> **Deze tabel is verouderd en moet vóór de productiebuild opnieuw worden ingevuld.** Ze is
> geschreven voor een app die niets verstuurde. Daarna kwamen er een account (R8.AUTH), een
> voortgangssync (R8.SYNC-B), interactief lezen en nu Firebase Analytics bij. De regels hieronder
> zijn de nieuwe antwoorden; `privacy-policy.html` is intussen bijgeschreven en zegt hetzelfde —
> zie "De privacypagina".

| Vraag | Antwoord |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** — Supabase en Firebase gaan allebei over HTTPS |
| Do you provide a way for users to request that their data is deleted? | **Yes** — Instellingen → Delete account. Kruis **"Users can request that their data is deleted"** én **"Users can delete their account in the app"** aan: het verwijderen gebeurt in de app zelf, meteen, via de edge function `delete-account` (zie hieronder). Play vraagt daarnaast om een publieke *account deletion*-URL in de listing; die staat op de privacypagina onder "Your rights" |

Per gegevenstype, zoals het formulier het uitvraagt:

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| Email address | Ja (Supabase Auth) | Nee | Account management | Verplicht |
| User IDs | Ja (Supabase user-id; gaat óók naar Firebase via `analytics.zetGebruiker`) | Ja — Google (Firebase) | Account management, Analytics | Verplicht |
| App interactions | Ja (Firebase Analytics: schermweergaven en de gebeurtenissen uit `src/constants/analytics.ts`) | Ja — Google (Firebase) | Analytics | **Optioneel** — Instellingen → Privacy |
| Crash logs / diagnostics | Nee | Nee | — | — |
| Approximate location | **Ja, indirect** | Ja — Google (Firebase) | Analytics | Optioneel, zelfde schakelaar |
| Device or other IDs | Ja (Firebase app-instance-id; **plus het FCM-registratietoken** in `user_devices` zodra push aan staat) | Ja — Google (Firebase) | Analytics, **App functionality** (bezorgen van meldingen) | Optioneel — Analytics via Privacy, push via Instellingen → Pushmeldingen |
| Photos | Nee — de avatar blijft op het toestel (`profile-store`, AsyncStorage) | Nee | — | — |

**Push-notificaties voegen één regel toe aan dit formulier en één aan de bestaande.** Zodra een
lezer "Nudge me back" of "Story suggestions" aanzet, bewaart `public.user_devices` het
FCM-registratietoken van zijn installatie plus toestelmodel, tijdzone en app-versie, en houdt
`public.notifications_sent` bij wat er gestuurd is en of erop getikt is. Dat is een **Device ID**
met als doel *App functionality*, niet Analytics — het token bezorgt een bericht, het meet niets.
Allebei de categorieën staan **standaard uit**, dus voor een lezer die er niet aan komt verzamelt
de app hier niets. De twee lokale meldingen (dagelijkse herinnering, streak) verlaten het toestel
nooit en horen dus in geen enkele rij thuis.

**"Approximate location" is de val in dit formulier.** De app vraagt geen enkele locatiepermissie,
maar Firebase leidt land en regio af uit het IP-adres van elk verzoek. Dat telt voor Play als
verzamelde bij-benadering-locatie. Wie hier "No" invult terwijl Analytics aan staat, vult het
formulier onjuist in.

**"Optional" mag alleen aangekruist worden zolang de schakelaar er is.** Instellingen → Privacy →
*Usage statistics* zet `analytics.zetVerzamelenAan(false)`; verdwijnt die regel, dan verandert het
antwoord in "Required".

### Accountverwijdering (`supabase/functions/delete-account`)

Play eist voor elke app met accounts een in-app route om het account weer kwijt te raken, en de
AVG eist dat die route ook echt iets verwijdert. Beide lopen via één knop: Instellingen →
*Delete account* → één bevestiging.

- **Het wissen gebeurt in een edge function, niet in de app.** Dat is geen voorkeur maar
  noodzaak. Op `profiles`, `voortgang`, `story_progress`, `character_unlocks`, `poll_responses`,
  `user_choices` en `feedback` staat RLS aan met alleen select-, insert- en update-policies; een
  `delete` waarvoor geen policy bestaat raakt **nul rijen en geeft geen foutmelding**. Een
  client-side verwijdering zou dus "verwijderd" melden terwijl alles er nog staat. En `auth.users`
  is voor een client sowieso onbereikbaar: zonder die rij weg te halen kun je meteen weer
  inloggen.
- **Eén `deleteUser`, de rest cascadeert.** Elke foreign key naar `auth.users` staat op
  `on delete cascade`, dus de zeven tabellen lopen mee in dezelfde transactie. Zeven losse
  deletes zouden bij een fout halverwege een half account achterlaten.
- **De function verwijdert alleen de aanroeper.** Het gebruiker-id komt uit het geverifieerde
  token (`auth.getUser(token)`), nooit uit de request-body; er is geen parameter waarmee je
  iemand anders opgeeft. `verify_jwt` staat aan, dus een verzoek zonder token wordt al door de
  gateway geweigerd.
- **Het toestel wordt óók leeggemaakt** (`src/store/lokale-gegevens.ts`). Moet wel: de drie
  voortgangsstores *verenigen* bij de volgende login lokaal met server in plaats van te
  overschrijven, dus zonder die stap erft het volgende account op dit toestel de hoofdstukken,
  personages en streak van de verwijderde lezer — en zet die keurig terug op de server. Taal,
  thema, de herinnering en de analytics-toestemming blijven staan: toestelinstellingen, geen
  persoonsgegevens.
- **Uitrollen doe je apart van de app.** De function staat in `supabase/functions/` en is via
  Supabase uitgerold (versie 1, actief); `.easignore` en `tsconfig.json` sluiten die map uit,
  want het is Deno-code en geen app-code. Een nieuw Supabase-project heeft hem dus niet vanzelf.

### Gegevenskopie (AVG art. 15/20)

Instellingen → *Request my data* opent een mailtje naar `SUPPORT_EMAIL` met onderwerp en tekst al
ingevuld. **Bewust geen exportknop:** dat zou een tweede edge function plus een bestandsformaat
zijn, en er staat per account te weinig om dat vandaag te rechtvaardigen. Wat de AVG eist is een
route die aankomt en een antwoord binnen 30 dagen — beide staan zo ook in `privacy-policy.html`.
**Elk verzoek komt dus met de hand in die mailbox binnen**; het verwijderverzoek niet meer.

### Firebase Analytics in het bijzonder

- **Toestemming staat standaard aan** (`STANDAARD_ANALYTICS_TOESTEMMING` in
  `src/constants/analytics.ts`). Dat is een keuze en geen natuurwet: voor EU-lezers is
  "gerechtvaardigd belang" als grondslag voor niet-essentiële statistiek een standpunt dat de
  EDPB betwist. Wil je op zeker spelen, zet die constante dan op `false` — en zet er dan ook
  `firebase_analytics_collection_enabled=false` in het Android-manifest bij, want de runtime-
  schakelaar komt te laat om de app-start zelf nog tegen te houden.
- **`google-services.json` hoort in de repo-root**, niet in `android/`. Die map is genegeerd én
  uitgesloten in `.easignore` (EAS draait zijn eigen `expo prebuild`), dus een bestand daar
  overleeft geen `prebuild --clean` en bereikt de cloudbuild nooit. `app.json` wijst er met
  `expo.android.googleServicesFile` naar.
- **De permissietabel hieronder verandert niet.** Firebase Analytics declareert geen nieuwe
  permissies: `INTERNET` en `ACCESS_NETWORK_STATE` stonden er al, en de
  `com.google.android.c2dm.permission.RECEIVE` die hieronder aan `expo-notifications` wordt
  toegeschreven kwam altijd al van dezelfde Firebase-bibliotheken. Meet het na met het commando
  onderaan deze pagina.

### De privacypagina

`privacy-policy.html` is **herschreven** en beschrijft nu wat de app echt doet: het account, de
voortgangssync, de antwoorden op peilingen en keuzepunten, de feedback, en Firebase Analytics met
de opt-outschakelaar en de verwerking door Google. Ze opende eerst met "Chronicles collects
nothing"; die zin was waar toen ze geschreven werd en al onjuist sinds R8.AUTH.

Twee dingen blijven open:

1. **De pagina is nog niet gepubliceerd.** `PRIVACY_BELEID_URL` in `src/constants/juridisch.ts` is
   nog de placeholder, dus Instellingen verbergt de link (zie boven, "Publiceren via GitHub
   Pages"). De constante verandert niet mee met de inhoud — daar staat alleen de URL.
2. **De verwerkingsregio van Supabase staat er niet in.** Wil je een expliciete
   EU-doorgifteclausule, vul die dan in vóór publicatie; ik heb geen regio verzonnen.

Geen enkele permissie is een Data Safety-onderwerp (dat formulier gaat over *verzamelde gegevens*,
niet over permissies), maar ze staan wél in de listing en de privacypagina moet ze kloppend
noemen. Dit is de **release**-set, nagemeten aan de merged manifest:

| Permissie | Herkomst | Type |
|---|---|---|
| `INTERNET`, `ACCESS_NETWORK_STATE` | React Native / Expo | normal |
| `VIBRATE` | `expo-haptics` | normal — geen prompt |
| `POST_NOTIFICATIONS` | `expo-notifications` | **runtime** — Android 13+ vraagt het aan de gebruiker, ná het eerste afgeronde hoofdstuk |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | `expo-notifications` | normal — herstelt en bezorgt de geplande herinnering |
| `com.google.android.c2dm.permission.RECEIVE` | firebase-messaging, via `expo-notifications` | normal — zie hieronder |
| `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE`, finsky `BIND_GET_INSTALL_REFERRER_SERVICE` | Expo-template, al vóór B6 | normal |

**`expo-notifications` sleept Firebase Cloud Messaging mee**, ook al plannen we alleen lokale
notificaties. De app vraagt nooit een pushtoken op, dus er gaat via die weg niets naar Google.
Hier stond ook "en er is geen `google-services.json`": **dat klopt niet meer** — sinds Firebase
Analytics staat dat bestand in de repo-root en is de app wel degelijk aan een Firebase-project
gekoppeld. De permissie zelf verandert er niet door, maar de privacypagina legt nu iets uit dat
achterhaald is.

**Twintig launcher-badge-permissies zijn er wél uitgehaald.** `expo-notifications` brengt
ShortcutBadger mee, dat voor elke fabrikant een eigen `...permission.READ_SETTINGS` /
`BADGE_COUNT_WRITE` declareert. De app zet nooit een badge (`shouldSetBadge: false`), dus die
staan in `android.blockedPermissions` in `app.json`. Zonder dat toont de Play-listing dertig
permissieregels voor een app die er vijf gebruikt.

**`expo-image-picker` (de profielavatar) voegt geen zichtbare permissie toe.** De bibliotheek
declareert zelf `CAMERA`, `RECORD_AUDIO` en `READ/WRITE_EXTERNAL_STORAGE` (die laatste twee met
`maxSdkVersion="32"`, en ze stonden er al). De app opent alleen de galerij — nooit de camera, nooit
video — dus `cameraPermission: false` en `microphonePermission: false` in het plugin-blok in
`app.json` blokkeren de eerste twee. Op Android 13+ loopt het kiezen via de systeem-fotokiezer, die
de app alleen het gekozen bestand geeft: er is dus ook geen runtime-vraag. De gekozen foto blijft
op het toestel (`profile-store`, AsyncStorage) en gaat nergens heen — het Data Safety-antwoord
hierboven blijft daarmee kloppen. **Wordt de avatar ooit gesynchroniseerd, dan verandert dat.**

**Er is géén `SCHEDULE_EXACT_ALARM`.** Dat is de permissie waarvoor Play een aparte
verklaring eist. `expo-notifications` vraagt `canScheduleExactAlarms()` en valt terug op een
inexacte alarm als het antwoord nee is (`ExpoSchedulingDelegate.kt`), dus de permissie staat niet
in het manifest en er is niets te declareren.

Controleer dit alles na élke upgrade van `expo-notifications` opnieuw — het is één commando:

```bash
./android/gradlew -p android :app:processReleaseMainManifest
grep -o 'android:name="[A-Za-z0-9._]*[Pp]ermission[A-Za-z0-9._]*"' \
  android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml \
  | sort -u
```

**Let op:** zodra advertenties of een abonnement erbij komen (v1.1, zie `ADS_ENABLED` in
`src/components/ad-banner.tsx`), klopt zowel deze pagina als het Data Safety-formulier niet meer.
Werk ze dan bij *vóórdat* die versie wordt gepubliceerd.
