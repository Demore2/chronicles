import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type VoortgangState = {
  gelezenIds: Set<string>;
  bekekenIds: Set<string>;
  streakDagen: number;
  laatsteActiviteitDatum: string | null;
  markeerAlsGelezen: (verhaalId: string) => void;
  markeerAlsBekeken: (verhaalId: string) => void;
};

function vandaag(): string {
  return new Date().toISOString().slice(0, 10);
}

function gisteren(): string {
  const datum = new Date();
  datum.setDate(datum.getDate() - 1);
  return datum.toISOString().slice(0, 10);
}

function bijgewerkteStreak(laatsteActiviteitDatum: string | null, streakDagen: number) {
  const vandaagStr = vandaag();
  if (laatsteActiviteitDatum === vandaagStr) {
    return { streakDagen, laatsteActiviteitDatum: vandaagStr };
  }
  const nieuweStreak = laatsteActiviteitDatum === gisteren() ? streakDagen + 1 : 1;
  return { streakDagen: nieuweStreak, laatsteActiviteitDatum: vandaagStr };
}

type SerializedSet = { __type: 'Set'; values: string[] };

function isSerializedSet(value: unknown): value is SerializedSet {
  return typeof value === 'object' && value !== null && (value as { __type?: unknown }).__type === 'Set';
}

export const useVoortgangStore = create<VoortgangState>()(
  persist(
    (set) => ({
      gelezenIds: new Set<string>(),
      bekekenIds: new Set(['the-long-way-around']),
      streakDagen: 1,
      laatsteActiviteitDatum: null,
      markeerAlsGelezen: (verhaalId) =>
        set((state) => ({
          gelezenIds: new Set(state.gelezenIds).add(verhaalId),
          ...bijgewerkteStreak(state.laatsteActiviteitDatum, state.streakDagen),
        })),
      markeerAlsBekeken: (verhaalId) =>
        set((state) => ({
          bekekenIds: new Set(state.bekekenIds).add(verhaalId),
          ...bijgewerkteStreak(state.laatsteActiviteitDatum, state.streakDagen),
        })),
    }),
    {
      name: 'voortgang-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        replacer: (_key, value) => (value instanceof Set ? { __type: 'Set', values: Array.from(value) } : value),
        reviver: (_key, value) => (isSerializedSet(value) ? new Set(value.values) : value),
      }),
    }
  )
);
