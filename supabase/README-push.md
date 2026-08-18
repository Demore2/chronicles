# Push-notificaties — wat er staat, en wat er nog moet

Deze map hoort bij de push-laag: `send-push`, `push-sweep` en de tabellen eromheen. De
app-kant staat in `src/lib/push.ts`, `src/hooks/use-push-registratie.ts` en
`src/store/notificatie-store.ts`.

> `supabase/functions/` is uitgesloten van `tsconfig.json`, `eslint.config.js` en `.easignore` —
> het is Deno-code en hoort niet in een app-build. Een fris Supabase-project heeft deze functies
> dus **niet**; die moeten apart gedeployd worden.

## Eerst dit: `npm run check:push`

```bash
npm run check:push          # wat staat er, wat ontbreekt er
npm run check:push -- --check   # exitcode 1 als er iets mist
```

Loopt alles langs wat de push-kant nodig heeft: `google-services.json` (**inclusief de controle
dat het pakket erin overeenkomt met `app.json`** — komt dat niet overeen, dan slaagt de build en
levert FCM alsnog nooit iets af), de vier native pakketten, het notificatie-icoon, de
Supabase-variabelen en — als `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` staat — de vier tabellen,
de verhaalcatalogus en of de Firebase-secrets op de edge functions gezet zijn.

Wat het zonder die sleutel niet kan zien, meldt het als `??` in plaats van als goed. Dat is
dezelfde regel als bij `audit:interactief`: een blinde telling met de publishable key geeft nul
rijen zonder foutmelding, en daar mag geen conclusie uit getrokken worden.

## De verdeling: wat lokaal is en wat via de server gaat

Niet elke melding hoort een push te zijn. De regel hier is: **de server stuurt alleen wat het
toestel zelf niet kan weten.**

| Melding | Waar vandaan | Waarom |
|---|---|---|
| Dagelijkse herinnering (19:00, instelbaar) | **Lokaal**, `expo-notifications` | Werkt offline, staat op de seconde in de tijdzone van het toestel, kost geen infrastructuur |
| Streak loopt vanavond af | **Lokaal**, vooruit gepland | Het toestel kent de streak zelf; zie `use-streak-herinnering.ts` |
| "Je hoofdstuk staat nog open" (win-back) | **Server**, FCM | Het toestel kan geen melding plannen voor een dag waarop de app dicht blijft |
| "Spartacus wacht op je" (aanbeveling) | **Server**, FCM | Vereist kennis van de hele catalogus en van wat je nog niet las |
| Mijlpaal bereikt ("Tien hoofdstukken ver") | **Lokaal**, vooruit niets | Af te leiden uit voortgang die op het toestel staat; zie `constants/prestaties.ts` |

Dit is bewust anders dan het oorspronkelijke plan, dat óók de dagelijkse herinnering via een
cron elke minuut wilde versturen. Twee redenen: die cron vergelijkt `now().getHours()` (UTC) met
een lokaal ingesteld "19:00" en stuurt dus elke lezer buiten Greenwich op het verkeerde uur een
melding, en een lokale herinnering die al werkt inruilen voor een netwerkafhankelijke is een
achteruitgang.

## Wat er al staat

- **Tabellen**: `user_devices`, `notification_preferences`, `notifications_sent`, `story_catalog`
  (migraties `push_notificaties`, `push_verhaalcatalogus_en_kandidaten`,
  `push_streak_in_plaats_van_ontgrendeling`, `push_functies_vaste_search_path`).
- **RPC's**: `push_kandidaten(doel_uur)` (service role only) en `markeer_melding_geopend(uuid)`.
- **Edge functions**: `send-push` en `push-sweep`, allebei `verify_jwt: true` **plus** een eigen
  controle dat de aanroeper de service role is.
- **Catalogus**: 20 verhalen, gevuld. Bijwerken met `npm run sync:verhaalcatalogus`
  (heeft `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` nodig; `--dry` om alleen te kijken).
- **Cron**: `push-sweep-elk-uur` staat ingepland en is inert tot het Vault-geheim er is (zie
  stap 4).
- **Mijlpalen**: veertien stuks, afgeleid uit de voortgang (`src/constants/prestaties.ts`), met
  een eigen Android-kanaal, een schakelaar in Instellingen (`achievements_enabled`) en een
  `achievement_unlocked`-gebeurtenis in Analytics. Volledig lokaal — er is geen tabel bij gekomen.

## Wat er nog moet — in volgorde

### 1. `google-services.json` (blokkeert alles)

Nog steeds afwezig in de repo-root. Zonder dat bestand faalt `expo prebuild`, faalt elke
EAS-build, en geeft `src/lib/push.ts` altijd `beschikbaar: false`. Firebase Console →
projectinstellingen → Android-app met package `com.chronicles.historyapp` → downloaden → in de
**repo-root** zetten (niet in `android/`, die map staat in `.gitignore` én `.easignore`).

### 2. Een service account voor FCM

Firebase Console → Projectinstellingen → **Service accounts** → *Generate new private key*.
Dat levert een JSON. Er is **geen** "FCM API key" meer nodig: de legacy API
(`Authorization: key=...`) is door Google uitgezet, en `send-push` gebruikt de HTTP v1 API met
een OAuth2-token dat het zelf ondertekent.

Zet daarna drie secrets op de edge functions (Dashboard → Edge Functions → Secrets):

```
FIREBASE_PROJECT_ID   = <project_id uit de JSON>
FIREBASE_CLIENT_EMAIL = <client_email uit de JSON>
FIREBASE_PRIVATE_KEY  = <private_key uit de JSON, inclusief BEGIN/END-regels>
```

De private key mag met echte regeleindes óf met letterlijke `\n` — `pemNaarDer()` in
`send-push` accepteert allebei, want dat scheelt een half uur zoeken naar "invalid keyData".

### 3. De dev client opnieuw bouwen

`@react-native-firebase/messaging` is een **native** module. Na het pullen van deze wijziging is
een JS-reload niet genoeg:

```bash
npx expo prebuild --clean     # lukt pas als google-services.json er staat
npx expo run:android
```

(Zie ook de bekende val: een shell die in `android/` staat, of een draaiende Gradle-daemon,
blokkeert `prebuild` met EBUSY.)

### 4. De cron — staat al ingepland, wacht op één regel

`pg_cron` en `pg_net` zijn aangezet en de job **`push-sweep-elk-uur`** bestaat (migraties
`push_cron_sweep`, `push_cron_sweep_net_schema`). Hij doet alleen nog niets, en dat is met opzet:

```sql
select net.http_post(...)
where exists (select 1 from vault.decrypted_secrets where name = 'service_role_key');
```

Zolang dat geheim niet bestaat gaat er geen aanroep uit — geen 401 per uur, geen logregel. Eén
regel zet hem in werking:

```sql
select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
```

De sleutel hoort in Vault en niet in de cron-regel zelf: `cron.job` is leesbaar voor wie de
database kan lezen.

**Dit mag vóórdat Firebase klaar is.** `push-sweep` controleert sinds versie 2 zelf of de drie
Firebase-secrets bestaan en geeft anders een 200 terug **zonder iets te claimen**. Dat was eerder
een echte bug: de sweep claimde eerst een rij in `notifications_sent`, kreeg dan een 500 van
`send-push` en zette diezelfde rij op `failed` — en omdat er bewust niets opnieuw geprobeerd
wordt, was die lezer die dag "bediend" zonder ooit iets ontvangen te hebben. Een cron die aanstond
vóór het serviceaccount had dus elke dag stilletjes ieders melding opgebrand.

Weer uitzetten: `select cron.unschedule('push-sweep-elk-uur');`

**Elk uur en niet elke minuut.** Er is één moment per lezer per dag waarop er iets kan vertrekken,
en de sweep vindt dat moment door het lokale uur te vergelijken. Elke minuut draaien is 1440
aanroepen per dag voor precies dezelfde uitkomst.

Nakijken of hij loopt:

```sql
select jobname, schedule, active from cron.job;
select status, return_message, start_time from cron.job_run_details
order by start_time desc limit 10;
```

## Testen zonder een dag te wachten

`push-sweep` heeft twee query-parameters, allebei alleen voor dit doel:

```bash
# Wie zou er NU aan de beurt zijn als het doeluur 14 was? Claimt niets, stuurt niets.
curl -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "$PROJECT_URL/functions/v1/push-sweep?uur=14&drooglopen=1"

# Echt versturen voor dat uur.
curl -X POST -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  "$PROJECT_URL/functions/v1/push-sweep?uur=14"
```

Eén los bericht naar één toestel, om de FCM-koppeling te controleren:

```bash
curl -X POST "$PROJECT_URL/functions/v1/send-push" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","tokens":["<fcm-token>"],"titel":"Test","bericht":"Hallo","pad":"/"}'
```

**Een emulator zonder Google Play-services krijgt geen FCM.** Test de push-kant op een echt
toestel; de lokale meldingen (dagelijks + streak) werken wél op de emulator.

Een handige controle onderweg — wat is er verstuurd, en is erop getikt?

```sql
select soort, status, titel, sent_at, opened_at
from public.notifications_sent order by created_at desc limit 20;
```

## Dingen die makkelijk misgaan

- **De sweep claimt vóórdat hij verstuurt.** Een rij in `notifications_sent` met een unieke
  `dedupe_sleutel` is het slot. Draai dat nooit om: eerst sturen en dan loggen levert bij een
  crash een dubbele melding op, en dát is de fout die een lezer je niet vergeeft.
- **`user_devices` is uniek op `fcm_token`, niet op `user_id`.** Een upsert op `user_id` gooit het
  tweede toestel van dezelfde lezer weg; helemaal geen unieke sleutel maakt bij elke login een rij
  bij, tot dezelfde melding vijf keer aankomt.
- **Het kanaal `terugkeer` moet in de app bestaan** vóórdat er een push binnenkomt die ernaar
  verwijst. `zorgVoorKanalen()` maakt hem aan bij het opstarten. Bestaat hij niet, dan valt
  Android terug op een standaardkanaal dat de lezer niet apart kan uitzetten.
- **Een push die aankomt terwijl de app op de voorgrond staat toont Android niet zelf.**
  `usePushRegistratie` vangt dat op en toont hem alsnog lokaal; zonder die stap lijkt het of de
  melding niet aankwam.
- **`getInitialNotification()` is een aparte weg.** Tikt iemand op een melding terwijl de app
  helemaal dicht is, dan bestond er geen luisteraar om aan te roepen. Vergeet je die aanroep, dan
  werkt de deeplink "soms wel en soms niet".
