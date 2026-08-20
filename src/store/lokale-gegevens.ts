import { useAbonnementStore } from '@/store/abonnement-store';
import { useAchievementStore } from '@/store/achievement-store';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { STANDAARD_EMAIL_VOORKEUREN, useEmailVoorkeurStore } from '@/store/email-voorkeur-store';
import { useNotificatieStore } from '@/store/notificatie-store';
import { usePrestatieStore } from '@/store/prestatie-store';
import { useProfileStore } from '@/store/profile-store';
import { useRecommendationStore } from '@/store/recommendation-store';
import { useReferralStore } from '@/store/referral-store';
import { useStoryProgressStore } from '@/store/story-progress-store';
import { useVoortgangStore } from '@/store/voortgang-store';

/**
 * Wist alles wat dít toestel over de ingelogde lezer bewaart.
 *
 * **Alleen voor accountverwijdering, niet voor uitloggen.** Uitloggen belooft juist het
 * tegenovergestelde ("your reading progress stays on this device"), en de serverrij is dan de
 * kopie voor de volgende keer. Hier is er geen serverrij meer om naar terug te keren.
 *
 * Waarom dit móét gebeuren, en niet alleen netjes is: de drie voortgangsstores **verenigen** bij
 * de eerstvolgende login lokaal met server (`voegServerVoortgangSamen`) in plaats van te
 * overschrijven. Blijft de voortgang staan, dan erft het volgende account dat op dit toestel
 * wordt aangemaakt de hoofdstukken, personages en streak van de verwijderde lezer — en zet die
 * vervolgens keurig op de server. Dan is er dus een kopie van precies de gegevens die net
 * "voorgoed verwijderd" heetten.
 *
 * Wat blijft staan, met opzet: taal, thema, de dagelijkse herinnering en de toestemming voor
 * gebruiksstatistieken. Dat zijn instellingen van het *toestel*, geen geschiedenis van de
 * persoon — en de analytics-schakelaar terugzetten op zijn standaard zou een uitgezette meting
 * stilletjes weer aanzetten.
 */
export function wisLokaleGebruikersgegevens(): void {
  // Eerst de geplande syncs afblazen. Zonder dit vertrekt twee seconden na een laatste
  // afgevinkt hoofdstuk alsnog een upsert — naar een account dat niet meer bestaat.
  useVoortgangStore.getState().resetSyncStatus();
  useStoryProgressStore.getState().resetSyncStatus();
  useCharacterUnlockStore.getState().resetSyncStatus();
  useAchievementStore.getState().resetSyncStatus();
  useRecommendationStore.getState().resetSyncStatus();
  useReferralStore.getState().resetSyncStatus();
  // De notificatievoorkeuren zélf blijven staan — dat is een instelling van dit toestel, net als
  // taal en thema. Wat wél weg moet is een openstaande sync: die zou de voorkeuren van de
  // verwijderde lezer naar het volgende account op dit toestel duwen.
  useNotificatieStore.getState().resetSyncStatus();
  useNotificatieStore.setState({ heeftOnverzondenWijzigingen: false });

  useVoortgangStore.setState({
    gelezenIds: new Set(),
    bekekenIds: new Set(),
    completedStories: new Set(),
    streakDagen: 0,
    laatsteActiviteitDatum: null,
    lastSyncTime: null,
    // De vlag zegt "dit toestel loopt voor op de server". Er is geen server meer om op voor te
    // lopen, en een openstaande vlag zou de volgende lezer een lege push laten doen.
    heeftOnverzondenWijzigingen: false,
  });

  useStoryProgressStore.setState({ progress: {}, heeftOnverzondenWijzigingen: false });

  // De mijlpalen zijn afgeleid en verdwijnen dus vanzelf met de voortgang hierboven. Wat hier weg
  // moet is het lijstje "hier heb je de melding al voor gehad": blijft dat staan, dan haalt de
  // volgende lezer op dit toestel zijn eerste tien hoofdstukken zonder ooit een mijlpaal te zien.
  // `geinitialiseerd` gaat mee terug op `false`, zodat die lezer een schone eerste meting krijgt.
  usePrestatieStore.getState().reset();
  // En de serverkant ervan: de ontgrendeldata en deelstatus horen bij de verwijderde lezer.
  // Blijven die staan, dan neemt de samenvoeging bij de volgende login ze mee omhoog naar het
  // nieuwe account — een kopie van precies de gegevens die net "voorgoed verwijderd" heetten.
  useAchievementStore.setState({
    ontgrendeld: [],
    stand: null,
    heeftOnverzondenWijzigingen: false,
  });
  useCharacterUnlockStore.setState({ unlockedCharacters: [], heeftOnverzondenWijzigingen: false });

  // De aanbevelingen zijn afgeleid uit voortgang die hierboven net is gewist, dus ze zeggen niets
  // meer — maar ze zijn wél een lijstje verhaal-id's van de verwijderde lezer, en de samenvoeging
  // bij de volgende login zou ze naar het nieuwe account tillen. Zelfde reden als bij de
  // personages hierboven.
  useRecommendationStore.setState({ aanbevelingen: [], heeftOnverzondenWijzigingen: false });

  // De avatar: een personage-avatar verwijst naar een verhaal dat je niet meer hebt ontgrendeld,
  // een foto-avatar is een bestand van de vorige lezer.
  useProfileStore.getState().wisAvatar();
  useEmailVoorkeurStore.setState({ voorkeuren: { ...STANDAARD_EMAIL_VOORKEUREN } });

  // `gestarteVerhalen` is een lijst verhaal-id's van vandaag — leesgedrag, dus het gaat mee. Dat
  // geeft de volgende aanmelding op dit toestel wel een verse dagteller; die uitruil is bewust,
  // want een dagteller doseert nieuwe inhoud en is geen gegeven dat we mogen bewaren.
  useAbonnementStore.setState({
    isPro: false,
    proTot: null,
    dagSleutel: null,
    gestarteVerhalen: [],
    // Een tegoed dat met de uitnodigingen van de verwijderde lezer is verdiend hoort niet bij het
    // volgende account op dit toestel terecht te komen — zelfde redenering als bij de personages.
    bonusVerhalen: 0,
  });

  // De uitnodigingsrij: de code is afgeleid van een gebruiker-id dat niet meer bestaat, en de
  // lijst uitgenodigde vrienden is een gegeven over de verwijderde lezer. Zou hij blijven staan,
  // dan tilt de samenvoeging bij de volgende login hem naar het nieuwe account — een kopie van
  // precies de gegevens die net "voorgoed verwijderd" heetten.
  useReferralStore.setState({ data: null, heeftOnverzondenWijzigingen: false });
}
