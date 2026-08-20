# docs/ — publieke pagina's

Deze map bevat de drie pagina's die Chronicles **publiceert**, los van de app:

| Bestand | Wat het is |
|---|---|
| `index.html` | Landingspagina. Bestaat vooral zodat de site-root geen 404 is en de twee documenten hieronder één vindbare ingang hebben. |
| `privacy-policy.html` | Het privacybeleid dat Google Play voor élke app verplicht stelt (LAUNCH-PLAN.md A5). |
| `terms-of-service.html` | De algemene voorwaarden. |

Alle drie zijn bewust één zelfstandig HTML-bestand: geen build, geen externe CSS, geen fonts van
een CDN. Ze volgen het beige palet van de app en hebben een `prefers-color-scheme: dark`-variant.

**Deze pagina's zijn niet dezelfde tekst als de schermen in de app.** `app/profiel/privacy.tsx` en
`app/profiel/terms.tsx` tonen de kortere versie uit `src/constants/juridische-teksten.ts`, die in
de bundel zit en offline werkt; deze map is de uitgebreidere gepubliceerde versie, waar Play en de
lezer buiten de app naartoe gaan. **Wijzigt er iets aan wat de app verzamelt of belooft, wijzig dan
allebei.** De schermen linken naar deze pagina's (de regel "View this page online" onder de tekst),
niet andersom.

## Publiceren via GitHub Pages

De doel-URL is **`https://demore2.github.io/chronicles/`**. Zo staat hij ingevuld in
`src/constants/juridisch.ts` (`PRIVACY_BELEID_URL`) en `src/constants/app-info.ts`
(`VOORWAARDEN_URL`), en zo hoort hij in de Play Console.

Deze repo heeft nog **geen remote**. Eenmalig, en dit is handwerk — er is geen `gh` op deze
machine:

1. Maak op GitHub het account **`Demore2`** aan, als dat er nog niet is, en daaronder een
   **publieke** repository met de naam **`chronicles`**. De naam bepaalt het pad in de URL, dus
   die twee moeten letterlijk kloppen. Let op het verschil in hoofdletters: de repo-URL houdt de
   schrijfwijze van het account aan (`github.com/Demore2/…`), de Pages-URL is altijd kleine
   letters (`demore2.github.io/…`).
2. Koppel en push:
   ```bash
   git remote add origin https://github.com/Demore2/chronicles.git
   git push -u origin master
   ```
3. GitHub → **Settings → Pages** → *Source*: `Deploy from a branch`, *Branch*: `master`,
   *Folder*: **`/docs`** → Save.
4. Na ongeveer een minuut staan de pagina's op:
   ```
   https://demore2.github.io/chronicles/
   https://demore2.github.io/chronicles/privacy-policy.html
   https://demore2.github.io/chronicles/terms-of-service.html
   ```
   **Controleer alle drie in een browser voordat je verder gaat.** Een Pages-site die nog aan het
   bouwen is geeft een 404 die op een foute URL lijkt.
5. Zet de privacy-URL ook in de Play Console → **Store settings → Privacy policy**. In de app
   hoeft niets meer aangezet te worden: `privacyBeleidIsGepubliceerd` en
   `voorwaardenZijnGepubliceerd` zijn afgeleid van de URL's en zijn dus al `true`.

**De repository moet publiek zijn.** GitHub Pages werkt op een gratis account niet vanuit een
private repo. Wil je de code toch privé houden, zet deze map dan op een andere statische host
(Netlify Drop, Cloudflare Pages, eigen domein) en pas de twee constanten hierboven aan — ze zijn
de enige plek waar de URL staat.

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
| App interactions | Ja (Firebase Analytics: schermweergaven en de gebeurtenissen uit `src/constants/analytics.ts`) | Ja — Google (Firebase) | Analytics | **Verplicht** — de schakelaar is eruit |
| Crash logs / diagnostics | Nee | Nee | — | — |
| Approximate location | **Ja, indirect** | Ja — Google (Firebase) | Analytics | **Verplicht**, zelfde reden |
| Device or other IDs | Ja (Firebase app-instance-id; **plus het FCM-registratietoken** in `user_devices` zodra push aan staat) | Ja — Google (Firebase) | Analytics, **App functionality** (bezorgen van meldingen) | Deels — het Analytics-id is **verplicht**, het FCM-token optioneel via Instellingen → Pushmeldingen |
| Photos | Nee — de avatar blijft op het toestel (`profile-store`, AsyncStorage) | Nee | — | — |

**Push-notificaties voegen één regel toe aan dit formulier en één aan de bestaande.** Zodra een
lezer "Nudge me back" of "Story suggestions" aanzet, bewaart `public.user_devices` het
FCM-registratietoken van zijn installatie plus toestelmodel, tijdzone en app-versie, en houdt
`public.notifications_sent` bij wat er gestuurd is en of erop getikt is. Dat is een **Device ID**
met als doel *App functionality*, niet Analytics — het token bezorgt een bericht, het meet niets.
Allebei de categorieën staan **standaard uit** en houden hun schakelaar, dus voor een lezer die er
niet aan komt verzamelt de app hier niets. De **drie** lokale meldingen (dagelijkse herinnering,
streak, mijlpalen) staan sinds deze wijziging vast aan en hebben géén schakelaar meer in de app —
Android's kanaalinstelling is hun uitknop. Ze verlaten het toestel nooit en horen dus nog steeds in
geen enkele rij thuis — de mijlpalen worden op het
toestel zelf afgeleid uit voortgang die er al staat, dus ook zij voegen geen categorie toe. Het
enige wat er voor hen naar de server gaat is de aan/uit-schakelaar zelf
(`notification_preferences.achievements_enabled`), die net als de andere voorkeuren onder de
bestaande regel voor de accountgegevens valt.

**"Approximate location" is de val in dit formulier.** De app vraagt geen enkele locatiepermissie,
maar Firebase leidt land en regio af uit het IP-adres van elk verzoek. Dat telt voor Play als
verzamelde bij-benadering-locatie. Wie hier "No" invult terwijl Analytics aan staat, vult het
formulier onjuist in.

**"Optional" kán hier niet meer aangekruist worden — die schakelaar is eruit.** Instellingen →
Privacy toont *Usage statistics* nu als "Always on" en zet niets meer; `analytics-store` blijft
bestaan en staat vast op `true`. Dat is precies het geval dat hierboven al voorzien was, dus de
drie Analytics-rijen staan op **Required**. Komt de schakelaar terug (één component:
`components/analytics-preferences.tsx`), dan gaan ze weer op Optional.

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

- **Meten staat vast aan en er is geen schakelaar meer.** `STANDAARD_ANALYTICS_TOESTEMMING` in
  `src/constants/analytics.ts` is nog steeds `true`, maar `components/analytics-preferences.tsx`
  toont sinds deze wijziging alleen nog de mededeling — niemand zet hem meer op `false`.
  **Dat is de zwaarste openstaande AVG-vraag van dit project**: voor EU-lezers is
  "gerechtvaardigd belang" als grondslag voor niet-essentiële statistiek al een betwist standpunt
  (de EDPB deelt het niet), en zonder weigermogelijkheid ín de app valt dat argument helemaal weg.
  Wat er in de plaats kwam is een route per e-mail (privacypagina, "Your rights") plus
  accountverwijdering; dat is een bezwaarrecht op papier en geen opt-out in de hand.
  Wil je op zeker spelen, dan is de terugweg één component: zet de `Switch` terug en de rijen
  hierboven weer op Optional. Zet je de meting helemaal uit, dan hoort er ook
  `firebase_analytics_collection_enabled=false` in het Android-manifest bij — de runtime-
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
voortgangssync, de antwoorden op peilingen en keuzepunten, de feedback, en Firebase Analytics en
de verwerking door Google. Ze opende eerst met "Chronicles collects nothing"; die zin was waar
toen ze geschreven werd en al onjuist sinds R8.AUTH.

Sindsdien is ze op drie punten bijgewerkt, allemaal omdat de app veranderde en de pagina niet:

- **De meting heeft geen schakelaar meer** — de pagina bood er eerst een aan, en zegt nu dat het
  bezwaar per e-mail loopt. Dat is dezelfde regel als in `docs/README.md` en in Data Safety
  (Analytics staat daar op **Required**).
- **De dagelijkse herinnering hééft wél een schakelaar**, de streakwaarschuwing en de
  mijlpaalmelding niet. De pagina zei eerst dat geen van de drie er een had.
- **De meldingsvoorkeuren staan op de server**, niet alleen op het toestel — `notificatie-store`
  synchroniseert sinds het pushwerk naar `public.notification_preferences`, dus ze horen in de
  lijst "wat er tegen je account bewaard wordt" en niet in "alleen op je toestel".

Eén ding blijft open: **de verwerkingsregio van Supabase staat er niet in.** Wil je een expliciete
EU-doorgifteclausule, vul die dan in vóór publicatie; ik heb geen regio verzonnen.

### De voorwaardenpagina

`terms-of-service.html` is nieuw en is de gepubliceerde tegenhanger van `app/profiel/terms.tsx`.
Ze zegt hetzelfde als de zeven alinea's in `src/constants/juridische-teksten.ts`, uitgeschreven,
plus wat een gepubliceerde versie wél moet noemen en een scherm van zeven regels niet kwijt kan:
de accountplicht en de leeftijdsgrens, dat er in deze versie **niets te kopen valt**, wat er met
peilingantwoorden en feedback gebeurt, hoe je ermee stopt, en het toepasselijk recht (Nederland).

Twee dingen die de tekst bewust **niet** doet: geen aansprakelijkheidsuitsluiting die verder gaat
dan de wet toestaat (consumentenrechten en letselschade staan er expliciet buiten), en geen belofte
over ononderbroken beschikbaarheid. Verandert het aanbod — werkende Billing, echte advertenties —
dan is dit één van de plekken die mee moet, samen met de app-tekst en de privacypagina.

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
