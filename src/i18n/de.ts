import type { DeepPartial } from './deep-partial';
import type { Vertalingen } from './en';

const de: DeepPartial<Vertalingen> = {
  tabs: {
    ontdek: 'Entdecken',
    voortgang: 'Fortschritt',
    profiel: 'Profil',
  },
  ontdek: {
    uitgelicht: 'Empfohlen',
    leesNu: 'Jetzt lesen',
    verderLezen: 'Weiterlesen',
    verderLezenLegeTitel: 'Noch nichts begonnen',
    verderLezenLegeBeschrijving: 'Geschichten, die du öffnest, erscheinen hier.',
    verhaallijnen: 'Erzählstränge',
    ontdekMeer: 'Mehr entdecken',
    nieuwToegevoegd: 'Neue heiße Themen',
    toonAlles: 'Alle anzeigen',
  },
  splash: {
    ondertitel: 'Entdecke die Geschichten, die unsere Welt geprägt haben',
  },
  aanbeveling: {
    kop: 'Für dich',
    startLezen: 'Lesen beginnen',
    reden: {
      favorite_era: (tijdperk: string): string =>
        `Mehr aus ${tijdperk}, deiner meistgelesenen Epoche`,
      next_up: (): string => 'Das Nächste auf deinem Weg',
      first_story: (): string => 'Ein guter Anfang',
    },
    leegTitel: 'Du hast jede Geschichte geöffnet',
    leegTekst: 'Nichts mehr vorzuschlagen — beende eine begonnene oder lies eine Lieblingsgeschichte erneut.',
  },
  voortgang: {
    titel: 'Fortschritt',
    streak: (n: number) => `${n} Tag${n === 1 ? '' : 'e'} in Folge`,
    streakBeschrijving: 'Schließe jeden Tag ein Kapitel ab, um deine Serie fortzusetzen.',
    streakLeeg: 'Noch keine Serie',
    streakLeegBeschrijving: 'Schließe heute ein Kapitel ab, um zu starten.',
    verhalenGelezen: 'Gelesene Geschichten',
    perTijdperk: 'Nach Epoche',
    aantalVerhalen: (gelezen: number, totaal: number) => `${gelezen}/${totaal} Geschichten`,
    byEra: 'Nach Epoche',
    storiesOfEra: (completed: number, total: number) => `${completed} von ${total} Geschichten`,
    noMoreStories: 'Alle Geschichten entdeckt! Sieh sie dir alle über Mehr entdecken an.',
    statStreak: 'Serie',
    statStreakEenheid: (n: number): string => (n === 1 ? 'Tag' : 'Tage'),
    statHoofdstukken: 'Kapitel',
    statHoofdstukkenEenheid: 'gelesen',
    statVerhalen: 'Geschichten',
    statVerhalenEenheid: 'beendet',
    statPersonages: 'Figuren',
    statPersonagesEenheid: 'freigeschaltet',
    eraPercentage: (procent: number): string => `${procent} %`,
  },
  profiel: {
    titel: 'Profil',
    characterCollection: 'Figurensammlung',
    chaptersRead: (n: number) => (n === 1 ? 'Kapitel gelesen' : 'Kapitel gelesen'),
    charactersUnlocked: (n: number) => (n === 1 ? 'Figur freigeschaltet' : 'Figuren freigeschaltet'),
    storiesCompleted: (n: number) => (n === 1 ? 'Geschichte beendet' : 'Geschichten beendet'),
    unlockedCounter: (count: number, total: number) => `${count} von ${total} freigeschaltet`,
    personageVergrendeld: 'Noch verborgen',
    personageVergrendeldUitleg:
      'Lies diese Geschichte zu Ende, um das Porträt deiner Sammlung hinzuzufügen.',
    nogTeOntgrendelen: (n: number): string =>
      n === 1
        ? 'Nur noch eine Geschichte bis zur vollständigen Sammlung.'
        : `Lies weiter und schalte ${n} weitere Figuren frei.`,
    collectieCompleet: 'Deine Sammlung ist vollständig. Alle Figuren freigeschaltet.',
    instellingen: 'Einstellungen',
    thema: 'Design',
    themaLicht: 'Hell',
    themaDonker: 'Dunkel',
    themaSysteem: 'System',
    taal: 'Sprache',
    herinnering: 'Tägliche Erinnerung',
    herinneringUitleg: 'Ein leiser Anstoß für dein nächstes Kapitel.',
    over: 'Über',
    privacybeleid: 'Datenschutzerklärung',
    privacybeleidUitleg: 'Chronicles speichert deinen Fortschritt nur auf diesem Gerät und erhebt keine personenbezogenen Daten.',
    instellingenOpenen: 'Einstellungen öffnen',
    feedbackOpenen: 'Feedback senden',
    avatarWijzigen: 'Avatar ändern',
    naamloos: 'Leser',
  },
  avatar: {
    titel: 'Dein Avatar',
    ondertitel: 'Trage eine freigespielte Figur oder ein eigenes Bild.',
    fotoKiezen: 'Foto auswählen',
    fotoUitleg: 'Bleibt auf diesem Gerät.',
    fotoMislukt: 'Dieses Bild konnte nicht geöffnet werden.',
    personages: 'Freigespielte Figuren',
    personagesLeeg: 'Schließe eine Geschichte ab, um hier ein Porträt tragen zu können.',
    verwijderen: 'Avatar entfernen',
    huidige: 'Aktueller Avatar',
  },
  instellingen: {
    titel: 'Einstellungen',
    sectieAccount: 'Konto',
    sectieWeergave: 'Darstellung',
    sectieMeldingen: 'Mitteilungen',
    sectieAbonnement: 'Abo',
    sectieSupport: 'Hilfe & Feedback',
    sectieApp: 'Über die App',
    sectieGevaar: 'Konto',

    binnenkort: 'Bald',
    binnenkortTitel: 'Noch nicht verfügbar',
    binnenkortTekst: (onderwerp: string): string =>
      `${onderwerp} ist in dieser Version von Chronicles noch nicht enthalten.`,
    ok: 'OK',

    altijdAan: 'Immer an',

    ingelogdAls: 'Angemeldet als',
    gebruikersnaam: 'Benutzername',
    geenGebruikersnaam: 'Nicht festgelegt',
    wachtwoordWijzigen: 'Passwort ändern',
    uitnodigen: 'Freunde einladen',
    uitnodigenUitleg: 'Teile deinen Code und verdiene Belohnungen.',
    synchronisatie: 'Synchronisierung',

    appIcoon: 'App-Symbol',
    appIcoonUitleg: 'Andere Symbole für deinen Startbildschirm.',
    appIcoonBinnenkortTekst:
      'In einer späteren Version kannst du das Chronicles-Symbol auf deinem Startbildschirm gegen ein anderes tauschen — eine helle und eine dunkle Variante sowie eines je Epoche. In der App selbst ändert sich nichts. In dieser Version ist es noch nicht enthalten.',
    abonnement: 'Dein Tarif',
    abonnementGratis: 'Kostenlos',
    abonnementPro: 'Pro',
    abonnementUpgrade: 'Auf Pro upgraden',
    abonnementProVoordelen: 'Keine Unterbrechungen · Unbegrenzt lesen',
    dagelijkseLimiet: 'Heute gelesen',
    verhalenVandaag: (gebruikt: number, limiet: number): string =>
      `${gebruikt}/${limiet} Geschichten heute`,
    onbeperkt: 'Unbegrenzt',

    meldingenVoet:
      'Sie gehören zum Lesen mit Chronicles, deshalb gibt es hier keinen Schalter dafür. Android hat einen: Halte eine Benachrichtigung gedrückt oder öffne Einstellungen → Apps → Chronicles → Benachrichtigungen, um eine Art stummzuschalten, ohne die anderen zu verlieren.',
    meldingenToestemming: 'Benachrichtigungen erlauben',
    meldingenToestemmingUitleg:
      'Benachrichtigungen sind für Chronicles ausgeschaltet, deshalb kann keine davon ankommen. Tippe, um sie einzuschalten.',
    herinneringTijd: 'Uhrzeit',
    tijdWaarde: (uur: number, minuut: number): string =>
      `${String(uur).padStart(2, '0')}:${String(minuut).padStart(2, '0')} Uhr`,
    tijdKiezerTitel: 'Wann sollen wir dich anstupsen?',
    tijdKiezerUitleg: 'Eine Erinnerung pro Tag, zu dieser Uhrzeit. Jederzeit änderbar.',
    tijdOpslaan: 'Uhrzeit speichern',
    uur: 'Stunde',
    minuut: 'Minute',

    sectieEmail: 'E-Mail',
    emailVoorkeuren: 'E-Mail-Einstellungen',
    emailUitleg:
      'Chronicles verschickt noch keine E-Mails. Jede E-Mail, die wir senden, trägt unten einen Abmeldelink, und der gilt endgültig.',
    emailNieuwsbrief: 'Monatsbrief',
    emailNieuwsbriefUitleg: 'Eine E-Mail im Monat, über unsere eigene Lektüre.',
    emailNieuweVerhalen: 'Neue Geschichten',
    emailNieuweVerhalenUitleg: 'Eine Nachricht, wenn eine Geschichte oder Epoche dazukommt.',
    emailTips: 'Lesetipps',
    emailTipsUitleg: 'Ab und zu eine Idee, mehr aus einem Kapitel zu holen.',
    emailAanbiedingen: 'Angebote',
    emailAanbiedingenUitleg: 'Rabatte auf Chronicles Pro. Selten, versprochen.',

    // --- Privacy ---
    sectiePrivacy: 'Datenschutz',
    analytics: 'Nutzungsstatistiken',
    analyticsUitleg: 'So machen wir Chronicles besser.',
    analyticsVoet:
      'Chronicles zählt Bildschirme, abgeschlossene Kapitel und Tipps auf Schaltflächen, dazu Gerätetyp und Land — nie, was du selbst schreibst. Es ist mit deinem Konto verknüpft und läuft über Google Firebase; um zu widersprechen oder es löschen zu lassen, schreib uns oder lösche unten dein Konto.',

    sectiePush: 'Push-Benachrichtigungen',
    pushVoet:
      'Um diese zu senden, registriert Chronicles dieses Gerät bei Google Firebase und merkt sich, wann du zuletzt gelesen hast. Schalte beide aus, und das Gerät wird wieder abgemeldet.',
    pushVoetLokaal:
      'Diese Erinnerung entsteht auf deinem Gerät und verlässt es nie. Vorschläge zur Rückkehr gibt es in dieser Version nicht.',
    pushTerugkeer: 'Erinnere mich',
    pushTerugkeerUitleg: 'Ein leiser Anstoß, wenn ein paar Tage ohne Lesen vergehen.',
    pushAanbevelingen: 'Geschichtenvorschläge',
    pushAanbevelingenUitleg:
      'Ab und zu eine Geschichte aus einer Epoche, die dir liegt und die du noch nicht geöffnet hast.',
    pushStreak: 'Serie in Gefahr',
    pushStreakUitleg: 'Abends ein Hinweis, wenn deine Serie heute reißen würde.',
    pushPrestaties: 'Meilensteine',
    pushPrestatiesUitleg: 'Eine Nachricht, wenn du einen Meilenstein erreichst, während die App geschlossen ist.',

    beoordeel: 'Chronicles bewerten',
    contact: 'Support kontaktieren',
    contactOnderwerp: 'Chronicles Support',
    voorwaarden: 'Nutzungsbedingungen',
    bekijkOnline: 'Diese Seite online ansehen',

    versie: 'Version',

    accountVerwijderen: 'Konto löschen',
    accountVerwijderenTitel: 'Konto löschen?',
    accountVerwijderenTekst:
      'Damit verschwinden dein Konto, dein Lesefortschritt, deine Figuren und deine Antworten — auf unseren Servern und auf diesem Gerät. Es geschieht sofort und lässt sich nicht rückgängig machen.',
    accountVerwijderenBevestig: 'Endgültig löschen',
    accountVerwijderenBezig: 'Wird gelöscht…',
    accountVerwijderdTitel: 'Konto gelöscht',
    accountVerwijderdTekst:
      'Alles ist weg, auch auf diesem Gerät. Danke, dass du mit uns gelesen hast.',
    accountVerwijderenMisluktTitel: 'Löschen fehlgeschlagen',
    accountVerwijderenMisluktTekst: (adres: string): string =>
      `Es wurde nichts gelöscht — dein Konto ist unverändert. Prüfe deine Verbindung und versuche es erneut, oder schreib an ${adres}.`,
    accountVerwijderenMail: 'Schreib uns',

    gegevensVerzoek: 'Meine Daten anfordern',
    gegevensVerzoekUitleg: 'Eine Kopie von allem, was zu deinem Konto gespeichert ist, per E-Mail.',
    gegevensVerzoekOnderwerp: 'Chronicles Datenanfrage',
    gegevensVerzoekBody:
      'Hallo,\n\nich hätte gern eine Kopie der Daten, die zu meinem Chronicles-Konto gespeichert sind.\n\nBitte sendet sie an die Adresse, von der ich schreibe.\n\nVielen Dank.',
  },
  pro: {
    titel: 'Pro-Zugang',
    ondertitel: 'Alle Epochen, ohne Unterbrechung.',
    knop: 'Tarife ansehen',

    paywallTitel: 'Chronicles Pro',
    paywallOndertitel: 'Mehr Geschichte, weniger Unterbrechungen.',
    sluiten: 'Schließen',

    // Siehe die Erläuterung bei `pro` in en.ts: nur die ersten drei werden angezeigt.
    // Duzform wie im Rest dieser Datei — die FASE-3-Zeilen siezten als Einzige.
    voordeelOnbeperkt: 'Lies so viele Geschichten, wie du möchtest',
    voordeelGeenOnderbreking: 'Keine Unterbrechung zwischen den Geschichten',
    voordeelSupport: 'Unterstütze die Entwicklung von Chronicles',

    // Bewusst nicht in Verwendung.
    voordeelVerhalen: 'Geschichten aus sechs Epochen',
    voordeelPersonages: 'Jedes Charakterporträt in deiner Sammlung',
    voordeelVroeg: 'Neue Geschichten zuerst, sobald sie erscheinen',
    voordeelOffline: 'Offline lesen, überall',
    voordeelGeenAds: 'Keine Werbung',

    prijsMaand: '4,99 € / Monat',
    prijsJaar: '49,99 € / Jahr',
    prijsMaandNoot: 'Monatsabo',
    prijsJaarNoot: '17 % günstiger',
    abonneer: 'Abonnieren',
    misschienLater: 'Vielleicht später',

    // Trial messaging (FASE 3)
    trialOffer: '7 Tage kostenlos',
    trialOfferDescription:
      'Sieben Tage voller Zugriff, sobald Pro da ist. Bezahlen ist noch nicht möglich.',
    startTrial: 'Kostenlos testen',
    startingTrial: 'Test wird gestartet…',
    startTrialComingSoon: 'Bald verfügbar',
    trialStartedTitel: 'Testphase gestartet!',
    trialStartedTekst:
      'Deine sieben Tage Chronicles Pro haben begonnen. Es wurde nichts abgebucht und nichts verlängert sich von selbst.',
    trialFailedTitel: 'Testphase konnte nicht gestartet werden',
    trialFailedTekst: 'Es ist ein Fehler aufgetreten. Überprüfe deine Verbindung und versuche es erneut.',

    voorbehoud:
      'Abonnements werden von Google Play verwaltet. Weitere Details finden Sie in unserer Datenschutzrichtlinie.',
    nogNietTitel: 'Noch nicht verfügbar',
    nogNietTekst:
      'Abonnements kommen mit einer späteren Version von Chronicles. Es wurde nichts abgebucht.',
  },
  limiet: {
    titel: 'Das war heute',
    tekst: (n: number): string =>
      n === 1
        ? 'Chronicles öffnet für kostenlose Leser eine neue Geschichte pro Tag. Alles Gelesene bleibt erhalten — die nächste wartet morgen.'
        : `Chronicles öffnet für kostenlose Leser ${n} neue Geschichten pro Tag. Alles Gelesene bleibt erhalten — die nächste wartet morgen.`,
    verderUitleg: 'Heute bereits geöffnete Geschichten bleiben offen.',
    voordeelOnbeperkt: 'Lies so viele Geschichten, wie du magst',
    voordeelGeenAds: 'Keine Werbung zwischen den Kapiteln',
    voordeelAlles: 'Jede Epoche, jede Figur',
    upgrade: 'Chronicles Pro ansehen',
    morgen: 'Bis morgen',
  },
  feedback: {
    titel: 'Feedback senden',
    ondertitel: 'Was ist schiefgelaufen, oder was wünschst du dir?',
    soortBug: 'Fehler melden',
    soortIdee: 'Idee',
    plaatshouderBug: 'Was ist passiert, und was hast du stattdessen erwartet?',
    plaatshouderIdee: 'Was soll Chronicles können?',
    versturen: 'Feedback senden',
    verzenden: 'Wird gesendet…',
    sluiten: 'Schließen',
    tekensOver: (n: number): string => `Noch ${n} Zeichen`,
    leegTitel: 'Noch nichts zu senden',
    leegTekst: 'Schreib zuerst ein oder zwei Zeilen.',
    geluktTitel: 'Danke!',
    geluktTekst:
      'Dein Feedback ist angekommen. Wir lesen alles, auch wenn wir nicht auf jede Nachricht antworten können.',
    misluktTitel: 'Senden fehlgeschlagen',
    misluktTekst: 'Deine Nachricht ist noch da — prüfe deine Verbindung und versuch es erneut.',
    geenSessie: 'Melde dich an, um Feedback zu senden.',
    ok: 'OK',
  },
  notificatie: {
    titel: 'Dein nächstes Kapitel wartet',
    tekst: 'Ein paar Minuten Geschichte, bevor der Tag vorbei ist.',
    streakTitel: 'Deine Serie endet heute Abend',
    streakTekst: (dagen: number): string =>
      `${dagen} Tag${dagen === 1 ? '' : 'e'} in Folge. Ein Kapitel hält sie am Leben.`,
  },
  prestatie: {
    sectie: 'Meilensteine',
    telling: (behaald: number, totaal: number): string => `${behaald} von ${totaal}`,
    meldingTitel: 'Meilenstein erreicht',
    nogNiet: 'Noch nicht',
    leeg: 'Lies ein Kapitel zu Ende, dann ist der erste deiner.',
    namen: {
      'hoofdstuk-1': 'Erste Seite',
      'hoofdstuk-10': 'Zehn Kapitel weit',
      'hoofdstuk-25': 'Belesen',
      'hoofdstuk-50': 'Tief im Archiv',
      'hoofdstuk-100': 'Zenturio',
      'verhaal-1': 'Ein Leben gelesen',
      'verhaal-5': 'Fünf Leben',
      'verhaal-10': 'Zehn Leben',
      'personage-3': 'Gute Gesellschaft',
      'personage-10': 'Eine Runde',
      'streak-3': 'Drei Tage in Folge',
      'streak-7': 'Eine ganze Woche',
      'streak-30': 'Ein Monat Geschichte',
      'streak-100': 'Hundert Tage',
    },
    uitleg: {
      hoofdstukken: (n: number): string => `${n} Kapitel gelesen.`,
      verhalen: (n: number): string => `${n} Geschichte${n === 1 ? '' : 'n'} ganz gelesen.`,
      personages: (n: number): string => `${n} Figur${n === 1 ? '' : 'en'} in deiner Sammlung.`,
      streak: (n: number): string => `${n} Tag${n === 1 ? '' : 'e'} in Folge.`,
    },
    voortgangKort: (huidig: number, doel: number): string => `${huidig}/${doel}`,
    voortgangRegel: (huidig: number, doel: number): string => `Fortschritt: ${huidig} von ${doel}`,
    behaald: 'Freigeschaltet',
    ok: 'OK',
    sluiten: 'Schließen',
    punten: (n: number): string => `+${n} Punkte`,
    puntenTotaal: (behaald: number, totaal: number): string => `${behaald} / ${totaal} Punkte`,
    ontgrendeldOp: (datum: string): string => `Erreicht am ${datum}`,
    deel: 'Teilen',
    deelOpnieuw: 'Erneut teilen',
    deelTitel: 'Chronicles-Meilenstein',
    deelBericht: (naam: string, uitleg: string): string =>
      `Ich habe gerade „${naam}“ in Chronicles freigeschaltet — ${uitleg}`,
    deelGelukt: 'Geteilt.',
    deelGekopieerd: 'In die Zwischenablage kopiert.',
    deelNietMogelijk: 'Teilen ist hier nicht möglich.',
  },
  deel: {
    whatsapp: 'Über WhatsApp teilen',
    alsLink: 'Als Link teilen',
    kopieerTekst: 'Text kopieren',
    sluiten: 'Schließen',
    gelukt: 'Geteilt.',
    gekopieerd: 'In die Zwischenablage kopiert.',
    nietMogelijk: 'Teilen ist hier nicht möglich.',
    prestatieKop: 'Meilenstein erreicht',
    prestatieBericht: (naam: string): string =>
      `${naam} 🏆 In Chronicles freigeschaltet! Geschichte, Kapitel für Kapitel.`,
    citaatKnop: 'Diese Stelle teilen',
    citaatKop: 'Diese Stelle teilen',
    citaatTitel: 'Eine Stelle aus Chronicles',
    citaatBericht: (citaat: string, verhaal: string): string =>
      `„${citaat}“ — aus ${verhaal} 📖 über Chronicles`,
  },
  referral: {
    titel: 'Freunde einladen',
    kop: 'Gib einem Freund einen Vorsprung',
    uitleg: 'Teile deinen Code. Jeder Freund, der damit mitmacht, bringt dir eine Belohnung.',
    jouwCode: 'Dein Einladungscode',
    codeKopieren: 'Code kopieren',
    codeGekopieerd: 'Code kopiert.',
    deelUitnodiging: 'Einladung teilen',
    deelTitel: 'Mach mit bei Chronicles',
    bericht: (code: string): string =>
      `Mach mit bei Chronicles! Geschichte, Kapitel für Kapitel. Code: ${code} für 1 kostenlose Geschichte.`,
    vriendenUitgenodigd: 'Freunde eingeladen',
    beloningenVerdiend: 'Belohnungen verdient',
    beloningenKop: 'Deine Belohnungen',
    beschikbaar: (n: number): string =>
      n === 1 ? '1 Belohnung zum Einlösen' : `${n} Belohnungen zum Einlösen`,
    geenBeloningen: 'Noch keine Belohnungen zum Einlösen.',
    beloningVerhaal: '1 Geschichte extra',
    beloningVerhaalUitleg: 'Öffne heute eine neue Geschichte mehr als das Tageslimit erlaubt.',
    beloningProWeek: 'Eine Woche Pro',
    beloningProWeekUitleg: (dagen: number): string =>
      `${dagen} Tage ohne Tageslimit und ohne Unterbrechungen.`,
    claim: 'Einlösen',
    geclaimdTitel: 'Belohnung eingelöst',
    geclaimdVerhaal: 'Du kannst heute noch eine neue Geschichte öffnen.',
    geclaimdProWeek: (dagen: number): string => `Pro gehört dir für die nächsten ${dagen} Tage.`,
    ok: 'OK',
    geenCode: 'Melde dich an, um deinen Einladungscode zu erhalten.',
    hoeWerktKop: 'So funktioniert es',
    stap1: 'Teile deinen Code mit einem Freund.',
    stap2: 'Er gibt ihn bei der Anmeldung ein.',
    stap3: 'Ihr bekommt beide eine Belohnung.',
    nogNietActief:
      'Einen Code einzugeben ist noch nicht möglich, deshalb bringt Einladen heute noch keine Belohnungen. Dein Code ist echt und schon deiner — er funktioniert, sobald das Einlösen kommt.',
  },
  collectie: {
    nietGevondenTitel: 'Erzählstrang nicht gefunden',
    nietGevondenBeschrijving: 'Dieser Erzählstrang existiert nicht mehr.',
  },
  tijdperkScherm: {
    titel: 'Epoche',
    nietGevondenTitel: 'Epoche nicht gefunden',
    nietGevondenBeschrijving: 'Diese Epoche existiert nicht mehr.',
    alle: 'Alle',
    geenVerhalenTitel: 'Keine Geschichten',
    geenVerhalenBeschrijving: 'Keine Geschichten für diesen Filter.',
  },
  verhaal: {
    nietGevondenTitel: 'Geschichte nicht gefunden',
    nietGevondenBeschrijving: 'Diese Geschichte existiert nicht mehr.',
    minLeestijd: (n: number) => `${n} Min. Lesezeit`,
    gelezen: 'Gelesen',
    markeerAlsGelezen: 'Als gelesen markieren',
    volgendVerhaal: 'Nächste Geschichte',
    waar: 'Wahr',
    nietWaar: 'Falsch',
    goedGeraden: 'Richtig geraten!',
    tochNietHelemaal: 'Nicht ganz.',
  },
  hoofdstuk: {
    nietGevondenTitel: 'Kapitel nicht gefunden',
    nietGevondenBeschrijving: 'Dieses Kapitel existiert nicht mehr.',
    tegelTitel: (nummer: number, titel: string) => `Kapitel ${nummer}: ${titel}`,
    teller: (huidig: number, totaal: number) => `Kapitel ${huidig} von ${totaal}`,
    voortgang: (voltooid: number, totaal: number) => `${voltooid} / ${totaal} Kapitel`,
    volgordeUitleg: 'Schließe die Kapitel der Reihe nach ab, um das nächste freizuschalten.',
    terugNaarOverzicht: 'Zurück zu den Kapiteln',
    markeerVoltooid: 'Als abgeschlossen markieren',
    volgende: 'Nächstes Kapitel',
    allesVoltooid: 'Alle Kapitel abgeschlossen',
    ontgrendelPersonage: (naam: string) => `${naam} freischalten`,
  },
  blok: {
    weetjeLabel: 'Wusstest du schon?',
    jaarLabel: (jaar: number) =>
      jaar < 0 ? `${Math.abs(jaar)} v. Chr.` : jaar < 1000 ? `${jaar} n. Chr.` : `${jaar}`,
  },
  interactief: {
    quizKop: 'Kurz geprüft',
    quizControleer: 'Antwort prüfen',
    quizGoedTitel: 'Richtig',
    quizGoedTekst: 'Du hast aufgepasst.',
    quizFoutTitel: 'Knapp daneben',
    quizJuisteAntwoord: (antwoord: string): string => `Die Antwort lautet ${antwoord}.`,
    quizVerder: 'Weiterlesen',
    optieLabel: (letter: string, tekst: string): string => `Option ${letter}: ${tekst}`,
    pollKop: 'Was meinst du?',
    pollVoor: 'Antworte, um zu sehen, wofür sich andere entschieden haben.',
    pollStemmen: (n: number): string =>
      n === 1 ? '1 Person hat geantwortet' : `${n} Personen haben geantwortet`,
    pollEerste: 'Du antwortest als Erste oder Erster.',
    keuzeKop: 'Deine Entscheidung',
    keuzeVoor: 'Was hättest du getan?',
    keuzeNa: 'Die Geschichte nahm ihren eigenen Lauf — so haben andere entschieden.',
  },
  personage: {
    ontgrendeldTitel: 'Figur freigeschaltet!',
    ontgrendeldBeschrijving:
      'Du hast eine neue Figur freigeschaltet! Deine Sammlung findest du im Tab Profil.',
    naarHome: 'Weiter zur Startseite',
  },
  advertentie: {
    label: 'Werbung',
    plaatshouder: 'Hier stünde eine gesponserte Anzeige.',
    overslaanIn: (n: number): string => `Überspringen in ${n} s`,
    overslaan: 'Überspringen',
    proKnop: 'Werbung entfernen mit Pro',
  },
  auth: {
    loginTitel: 'Willkommen zurück',
    loginOndertitel: 'Melde dich an und lies dort weiter, wo du aufgehört hast.',
    signupTitel: 'Konto erstellen',
    signupOndertitel: 'So bleibt dein Fortschritt auf jedem Gerät erhalten.',
    email: 'E-Mail',
    emailPlaceholder: 'du@beispiel.de',
    wachtwoord: 'Passwort',
    wachtwoordPlaceholder: 'Mindestens 6 Zeichen',
    gebruikersnaam: 'Benutzername',
    gebruikersnaamPlaceholder: 'Der Name auf deinem Profil',
    inloggen: 'Anmelden',
    registreren: 'Konto erstellen',
    wachtwoordVergeten: 'Passwort vergessen?',
    wachtwoordVergetenTitel: 'Passwort zurücksetzen ist noch nicht möglich',
    /**
     * De knop deed niets — zie `handleWachtwoordVergeten` in `app/login.tsx`. Dit is de
     * eerlijke versie: geen herstelmail, wel een adres dat gelezen wordt.
     */
    wachtwoordVergetenTekst: (email: string): string =>
      `Wir können noch keinen Link zum Zurücksetzen verschicken. Schreib an ${email} von der Adresse, mit der du dich angemeldet hast, dann helfen wir dir wieder hinein.`,
    /** Zonder ingevuld supportadres valt de mailroute weg en blijft de mededeling over. */
    wachtwoordVergetenTekstZonderSupport: 'Wir können noch keinen Link zum Zurücksetzen verschicken. Melde dich bei uns, dann helfen wir dir wieder hinein.',
    geenAccount: 'Noch kein Konto?',
    welAccount: 'Schon ein Konto?',
    naarSignup: 'Registrieren',
    naarLogin: 'Anmelden',
    sterkte: 'Passwortstärke',
    sterkteZwak: 'Schwach',
    sterkteGemiddeld: 'Mittel',
    sterkteSterk: 'Stark',
    voorwaarden: 'Ich stimme den Nutzungsbedingungen und der Datenschutzerklärung zu.',
    bevestigMail: (email: string): string =>
      `Fast geschafft — öffne den Bestätigungslink an ${email} und melde dich dann an.`,
    foutVeldenLeeg: 'E-Mail und Passwort sind erforderlich.',
    foutAlleVelden: 'Alle Felder sind erforderlich.',
    foutEmailOngeldig: 'Das sieht nicht nach einer E-Mail-Adresse aus.',
    foutWachtwoordKort: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    foutVoorwaarden: 'Du musst zuerst den Nutzungsbedingungen zustimmen.',
    account: 'Konto',
    uitloggen: 'Abmelden',
    uitlogTitel: 'Abmelden?',
    uitlogTekst:
      'Dein Lesefortschritt bleibt auf diesem Gerät. Zum Zugriff auf dein Konto musst du dich neu anmelden.',
    annuleren: 'Abbrechen',
  },
  sync: {
    bezig: 'Wird synchronisiert…',
    wachtend: 'Wartet auf Synchronisierung',
    mislukt: 'Offline — dein Fortschritt wird später synchronisiert',
    nooit: 'Noch nicht synchronisiert',
    zojuist: 'Fortschritt gerade synchronisiert',
    minutenGeleden: (minuten: number): string =>
      `Fortschritt vor ${minuten} ${minuten === 1 ? 'Minute' : 'Minuten'} synchronisiert`,
    urenGeleden: (uren: number): string =>
      `Fortschritt vor ${uren} ${uren === 1 ? 'Stunde' : 'Stunden'} synchronisiert`,
    langGeleden: 'Fortschritt zuvor synchronisiert',
  },
};

export default de;
