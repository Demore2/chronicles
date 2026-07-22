import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemaVoorkeur = 'licht' | 'donker' | 'systeem';

type ThemaState = {
  themaVoorkeur: ThemaVoorkeur;
  setThemaVoorkeur: (voorkeur: ThemaVoorkeur) => void;
};

export const useThemaStore = create<ThemaState>()(
  persist(
    (set) => ({
      themaVoorkeur: 'licht',
      setThemaVoorkeur: (voorkeur) => set({ themaVoorkeur: voorkeur }),
    }),
    {
      name: 'thema-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
