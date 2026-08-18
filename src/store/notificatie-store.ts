import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STANDAARD_HERINNERING_MINUUT, STANDAARD_HERINNERING_UUR } from '@/constants/notificaties';

type NotificatieState = {
  /** Wil de gebruiker de dagelijkse herinnering? Los van de systeemtoestemming. */
  herinneringAan: boolean;
  /**
   * Is er al één keer om toestemming gevraagd? Android laat het systeemvenster maar één keer
   * zien; daarna moet de gebruiker naar de instellingen. We vragen het dus precies één keer,
   * op het moment dat het uit te leggen valt (na het eerste afgeronde hoofdstuk).
   */
  toestemmingGevraagd: boolean;
  /**
   * Het tijdstip van de herinnering, lokale tijd. Stond tot deze fase vast op 19:00 in
   * `notificaties.ts`; die constanten zijn nu de *beginwaarde* en niet meer de waarheid.
   *
   * Geen migratie nodig: zustand/persist legt de opgeslagen state over de beginstand heen, dus een
   * installatie van vóór deze wijziging mist deze twee sleutels en houdt gewoon 19:00.
   */
  herinneringUur: number;
  herinneringMinuut: number;
  setHerinnering: (aan: boolean) => void;
  setHerinneringTijd: (uur: number, minuut: number) => void;
  markeerToestemmingGevraagd: () => void;
};

export const useNotificatieStore = create<NotificatieState>()(
  persist(
    (set) => ({
      herinneringAan: false,
      toestemmingGevraagd: false,
      herinneringUur: STANDAARD_HERINNERING_UUR,
      herinneringMinuut: STANDAARD_HERINNERING_MINUUT,
      setHerinnering: (aan) => set({ herinneringAan: aan }),
      // Geen `Notifications.scheduleNotificationAsync` hier: het herplannen doet
      // `useDagelijkseHerinnering`, die het tijdstip als dependency heeft. Eén plek die plant.
      setHerinneringTijd: (uur, minuut) =>
        set({ herinneringUur: uur, herinneringMinuut: minuut }),
      markeerToestemmingGevraagd: () => set({ toestemmingGevraagd: true }),
    }),
    {
      name: 'notificatie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
