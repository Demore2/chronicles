# Push-notificaties — wat er staat, en wat er nog moet

Deze map hoort bij de push-laag: `send-push`, `push-sweep` en de tabellen eromheen. De
app-kant staat in `src/lib/push.ts`, `src/hooks/use-push-registratie.ts` en
`src/store/notificatie-store.ts`.

> `supabase/functions/` is uitgesloten van `tsconfig.json`, `eslint.config.js` en `.easignore` —
> het is Deno-code en hoort niet in een app-build. Een fris Supabase-project heeft deze functies
> dus **niet**; die moeten apart gedeployd worden.

## De verdeling: wat lokaal is en wat via de server gaat

Niet elke melding hoort een push te zijn. De regel hier is: **de server stuurt alleen wat het
toestel zelf niet kan weten.**

| Melding | Waar vandaan | Waarom |
|---|---|---|
| Dagelijkse herinnering (19:00, instelbaar) | **Lokaal**, `expo-notifications` | Werkt offline, staat op de seconde in de tijdzone van het toestel, kost geen infrastructuur |
| Streak loopt vanavond af | **Lokaal**, vooruit gepland | Het toestel kent de streak zelf; zie `use-streak-herinnering.ts` |
| "Je hoofdstuk staat nog open" (win-back) | **Server**, FCM | Het toestel kan geen melding plannen voor een dag waarop de app dicht blijft |
| "Spartacus wacht op je" (aanbeveling) | **Server**, FCM | Vereist kennis van de hele catalogus en van wat je nog niet las |

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

### 4. De cron

`pg_cron` en `pg_net` staan **niet** aan in dit project. De sweep draait dus nog nergens vanzelf.
Zet hem pas aan als stap 1–3 klaar zijn: een cron die elk uur een function aanroept die zonder
Firebase-credentials een 500 teruggeeft, vult alleen je logboek.

De service-role-sleutel hoort in Vault en niet in de cron-regel zelf — `cron.job` is leesbaar
voor wie de database kan lezen.

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Eenmalig: de sleutel in Vault.
select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');

-- Elk uur op het hele uur. De function bepaalt zelf per lezer of het bij hém 19:00 is.
select cron.schedule(
  'push-sweep-elk-uur',
  '0 * * * *',
  $$
  select net.http_post(
    url     := '<PROJECT_URL>/functions/v1/push-sweep',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets
                                      where name = 'service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

Weer uitzetten: `select cron.unschedule('push-sweep-elk-uur');`

**Elk uur en niet elke minuut.** Er is één moment per lezer per dag waarop er iets kan vertrekken,
en de sweep vindt dat moment door het lokale uur te vergelijken. Elke minuut draaien is 1440
aanroepen per dag voor precies dezelfde uitkomst.

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
