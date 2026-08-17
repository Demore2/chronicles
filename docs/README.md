# docs/ — publieke pagina's

Deze map bevat één ding: **`privacy-policy.html`**, het privacybeleid dat Google Play voor élke
app verplicht stelt — ook voor een app zonder accounts, zonder tracking en zonder advertenties
(LAUNCH-PLAN.md A5).

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

| Vraag | Antwoord |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | n.v.t. (er wordt niets verzonden) |
| Do you provide a way for users to request that their data is deleted? | n.v.t. — app-data wissen of de app verwijderen volstaat |

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
notificaties. De app vraagt nooit een pushtoken op en er is geen `google-services.json`, dus er
gaat niets naar Google — maar de permissie stáát in het manifest en dat moet de privacypagina
eerlijk uitleggen (dat doet ze).

**Twintig launcher-badge-permissies zijn er wél uitgehaald.** `expo-notifications` brengt
ShortcutBadger mee, dat voor elke fabrikant een eigen `...permission.READ_SETTINGS` /
`BADGE_COUNT_WRITE` declareert. De app zet nooit een badge (`shouldSetBadge: false`), dus die
staan in `android.blockedPermissions` in `app.json`. Zonder dat toont de Play-listing dertig
permissieregels voor een app die er vijf gebruikt.

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
