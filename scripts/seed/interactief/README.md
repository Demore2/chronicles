# Interactieve content: audit, genereren, toepassen

Quizzen, peilingen en keuzepunten staan **in Supabase**, niet in de repo — zie de sectie
"Interactief lezen" in `CLAUDE.md`. Deze map is de tussenstap: wat de generator schrijft komt
hier terecht en gaat pas naar de database als iemand het heeft nagelezen.

## De drie commando's

```bash
npm run audit:interactief                    # wie heeft wel/geen interactieve content
npm run audit:interactief -- --json          # zelfde, machineleesbaar
npm run audit:interactief -- --check         # exit 1 zodra één verhaal niets heeft

npm run generate:interactief                 # alles wat nog niets heeft
npm run generate:interactief -- --only <id>  # één verhaal (dit is ook "de template")
npm run generate:interactief -- --dry-run    # wel de API bevragen, niets wegschrijven
npm run generate:interactief -- --apply      # ná het nalezen: wegschrijven naar Supabase
```

## Je hebt de servicesleutel nodig

`story_quizzes` / `story_polls` / `story_choices` hebben **één** policy: `select` voor de rol
`authenticated`. Er is geen insert-policy, en `anon` mag nergens bij. Dat betekent twee dingen:

- **Een select met de publishable key geeft nul rijen en géén foutmelding.** Een audit die dat
  gelooft meldt dat alle verhalen leeg zijn, ook de vijf die dat niet zijn. Beide scripts
  weigeren daarom conclusies te trekken uit een blinde telling.
- **Een insert met die sleutel faalt op RLS.** Seeden is geen client-actie.

Zet `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Supabase-dashboard → Project Settings → API
keys → `service_role`). `.env.local` is gitignored; die sleutel hoort daar en nergens anders —
zeker niet achter een `EXPO_PUBLIC_`-voorvoegsel, want dan bakt babel hem in de app-bundel.

Zonder die sleutel werkt genereren gewoon (dat praat alleen met de Anthropic API); alleen
`--apply` en de automatische "wie heeft al iets"-selectie liggen dan stil. `seed.sql` toepassen
als migratie in het dashboard is het alternatief.

## Waarom genereren en toepassen twee stappen zijn

Een quiz heeft een **juist antwoord**. Dat is een historische bewering die de app als waar
presenteert, en die komt hier uit een taalmodel. De generator controleert wat een machine kan
controleren — bestaat het hoofdstuknummer echt in dít verhaal, valt het antwoord binnen de
opties, zijn de vragen uniek, passen de aantallen opties binnen de check-constraints — maar of
Galileo's telescoop nu 20× of 30× vergrootte kan hij niet nakijken. Lees `<verhaal-id>.json`
door voordat je `--apply` draait.

Alles is idempotent (`on conflict do nothing`, op dezelfde unique constraints die de handmatige
seed al gebruikte), dus opnieuw toepassen kan geen kwaad en levert geen dubbele vragen op.

## Een nieuw verhaal toevoegen

Er is geen apart template-bestand: `--only <nieuwe-verhaal-id>` ís de template. De generator
leest de hoofdstukken uit `src/content/verhalen/**`, dus zodra het verhaal in de bundel staat
kent hij de tekst, de hoofdstuknummers en het personage.

1. Schrijf het verhaal (`src/content/verhalen/<tijdperk>/personen.ts`).
2. `npm run validate:content` en `npm run content:read-times`.
3. `npm run generate:interactief -- --only <verhaal-id>`.
4. Lees `scripts/seed/interactief/<verhaal-id>.json` na.
5. `npm run generate:interactief -- --only <verhaal-id> --apply`.

## Wat er in deze map staat

- `<verhaal-id>.json` — de gevalideerde rijen per verhaal, in de kolomnamen van de tabellen.
- `seed.sql` — dezelfde rijen als één toepasbaar SQL-bestand, voor wie liever via een migratie
  werkt dan via `--apply`.

Beide worden bij elke run overschreven. Ze zijn een werkbestand, geen bron van waarheid: de
database is de bron.
