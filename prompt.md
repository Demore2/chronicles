Ik wil een educatieve geschiedenis-app bouwen. Bouw dit als een lokaal
draaiend prototype dat later naar de Google Play Store kan.

## Tech stack
- React Native met Expo (TypeScript) — zodat ik later met EAS Build een
  Android APK/AAB kan maken
- expo-router voor navigatie
- Zustand voor state management
- Lokale JSON/TypeScript databestanden voor content (nog geen backend)
- AsyncStorage voor voortgang van de gebruiker

Als je iets anders adviseert, leg dan eerst kort uit waarom voordat je begint.

## Navigatiestructuur
1. Home: keuze uit 7 continenten (Europa, Azië, Afrika, Noord-Amerika,
   Zuid-Amerika, Oceanië, Antarctica). Alleen Europa is nu actief, de rest
   toont "Binnenkort beschikbaar".
2. Continent-pagina: lijst/grid van landen met vlag en naam. Start met
   Nederland volledig uitgewerkt, andere landen als placeholder.
3. Land-pagina: twee grote keuzekaarten:
   - "50 belangrijkste gebeurtenissen"
   - "50 belangrijkste personen"
4. Overzichtspagina: lijst van 50 items, genummerd, met jaartal/periode,
   titel, korte teaser en een vinkje als het item gelezen is.
5. Detailpagina ("verhaal"): een scrollbaar verhaal met afwisselend
   illustraties (cartoon-stijl) en tekstblokken. Onderaan: "Volgende" en
   "Vorige" knoppen, plus knop "Markeer als gelezen".

## Datamodel
Maak deze types en houd ze strikt aan:

Continent { id, naam, actief: boolean }
Land { id, continentId, naam, vlagEmoji, korteBeschrijving }
Categorie = 'gebeurtenissen' | 'personen'
Item {
  id, landId, categorie, nummer (1-50), titel,
  periode (bv "1568-1648"), teaser (1 zin),
  blokken: Blok[]
}
Blok = { type: 'tekst', inhoud: string }
     | { type: 'afbeelding', bron: string, alt: string, bijschrift?: string }
     | { type: 'citaat', tekst: string, bron: string }

Content staat in /content/nl/gebeurtenissen.ts en /content/nl/personen.ts.
Vul voor nu 5 volledig uitgewerkte items per categorie in als voorbeeld,
en de overige 45 als stubs met alleen titel/periode/teaser, zodat ik zie
hoe ik het aanvul.

Voor afbeeldingen: gebruik nu placeholders (gekleurde blokken met de alt-
tekst erin) via een <Illustratie> component, zodat ik later echte cartoon-
illustraties kan inladen zonder de rest aan te passen.

## Design
- Vriendelijk en toegankelijk, geschikt vanaf ~10 jaar
- Ruime kaarten met afgeronde hoeken, duidelijke typografie
- Kleuraccent per continent
- Light + dark mode
- Alle UI-teksten in het Nederlands, maar via een centraal
  /i18n/nl.ts bestand zodat vertalen later makkelijk is

## Nu al voorbereiden (nog niet bouwen)
- Een `useAbonnement()` hook die nu altijd { isPremium: false } teruggeeft.
  Alle plekken waar later advertenties of premium-content komen, roepen
  deze hook aan.
- Een <AdBanner /> component die nu een grijze placeholder toont en niets
  rendert wanneer isPremium true is. Plaats deze onderaan de overzichts-
  en detailpagina's.
- Maak duidelijk in de code met // TODO: waar Google Play Billing en
  AdMob later ingeplugd worden.

## Aanpak
Bouw dit stap voor stap. Begin met de projectstructuur en navigatie,
laat me dat testen, en ga daarna pas door met content en styling.
Geef bij elke stap de commando's die ik moet draaien.