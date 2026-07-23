import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UnlockedCharacter = {
  verhaalId: string;
  personageNaam: string;
  unlockedAt: number;
};

export type CharacterUnlockState = {
  unlockedCharacters: UnlockedCharacter[];
  unlockCharacter: (verhaalId: string, personageNaam: string) => void;
  isCharacterUnlocked: (verhaalId: string) => boolean;
  getTotalUnlocked: () => number;
};

export const useCharacterUnlockStore = create<CharacterUnlockState>()(
  persist(
    (set, get) => ({
      unlockedCharacters: [],

      unlockCharacter: (verhaalId, personageNaam) => {
        if (get().isCharacterUnlocked(verhaalId)) return;
        set((state) => ({
          unlockedCharacters: [
            ...state.unlockedCharacters,
            { verhaalId, personageNaam, unlockedAt: Date.now() },
          ],
        }));
      },

      isCharacterUnlocked: (verhaalId) =>
        get().unlockedCharacters.some((c) => c.verhaalId === verhaalId),

      getTotalUnlocked: () => get().unlockedCharacters.length,
    }),
    {
      name: 'character-unlock-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
