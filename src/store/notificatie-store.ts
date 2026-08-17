import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type NotificatieState = {
  /** Wil de gebruiker de dagelijkse herinnering? Los van de systeemtoestemming. */
  herinneringAan: boolean;
  /**
   * Is er al één keer om toestemming gevraagd? Android laat het systeemvenster maar één keer
   * zien; daarna moet de gebruiker naar de instellingen. We vragen het dus precies één keer,
   * op het moment dat het uit te leggen valt (na het eerste afgeronde hoofdstuk).
   */
  toestemmingGevraagd: boolean;
  setHerinnering: (aan: boolean) => void;
  markeerToestemmingGevraagd: () => void;
};

export const useNotificatieStore = create<NotificatieState>()(
  persist(
    (set) => ({
      herinneringAan: false,
      toestemmingGevraagd: false,
      setHerinnering: (aan) => set({ herinneringAan: aan }),
      markeerToestemmingGevraagd: () => set({ toestemmingGevraagd: true }),
    }),
    {
      name: 'notificatie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
