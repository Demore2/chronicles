import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TaalCode } from '@/constants/types';
import { taalCodes } from '@/i18n/taal-namen';

type TaalState = {
  taal: TaalCode;
  setTaal: (taal: TaalCode) => void;
};

function bepaalStandaardTaal(): TaalCode {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase();
    if (code && (taalCodes as string[]).includes(code)) {
      return code as TaalCode;
    }
  }
  return 'en';
}

export const useTaalStore = create<TaalState>()(
  persist(
    (set) => ({
      taal: bepaalStandaardTaal(),
      setTaal: (taal) => set({ taal }),
    }),
    {
      name: 'taal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
