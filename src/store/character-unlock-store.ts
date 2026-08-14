import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { foutTekst, maakSyncPlanner, wachtOpHydratie } from '@/store/sync-hulp';

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

  // --- Supabase-sync (R8.SYNC-B) ---
  isSyncing: boolean;
  syncError: string | null;
  /** Er staat lokaal een ontgrendeling die de server nog niet heeft. Overleeft een herstart. */
  heeftOnverzondenWijzigingen: boolean;
  syncToSupabase: () => Promise<void>;
  voegServerOntgrendelingenSamen: (vanServer: UnlockedCharacter[]) => void;
  resetSyncStatus: () => void;
};

/**
 * Leest de `jsonb`-kolom uit.
 *
 * Bewust wantrouwig: `jsonb` heeft geen vorm die Postgres afdwingt, dus een rij uit een oudere
 * appversie (of een handmatige bewerking in het dashboard) kan van alles bevatten. Eén kapot
 * element mag niet de hele collectie van een gebruiker onbruikbaar maken, dus we filteren in
 * plaats van te gooien.
 */
export function leesServerOntgrendelingen(waarde: unknown): UnlockedCharacter[] {
  if (!Array.isArray(waarde)) return [];
  return waarde.filter((item): item is UnlockedCharacter => {
    if (typeof item !== 'object' || item === null) return false;
    const kandidaat = item as Partial<UnlockedCharacter>;
    return (
      typeof kandidaat.verhaalId === 'string' &&
      typeof kandidaat.personageNaam === 'string' &&
      typeof kandidaat.unlockedAt === 'number'
    );
  });
}

/** Zet de sync twee seconden vooruit. Aangeroepen door `unlockCharacter`. */
const syncPlanner = maakSyncPlanner(() => useCharacterUnlockStore.getState().syncToSupabase());

export const useCharacterUnlockStore = create<CharacterUnlockState>()(
  persist(
    (set, get) => ({
      unlockedCharacters: [],

      isSyncing: false,
      syncError: null,
      heeftOnverzondenWijzigingen: false,

      unlockCharacter: (verhaalId, personageNaam) => {
        // Al ontgrendeld: niets wijzigt, dus ook geen sync inplannen.
        if (get().isCharacterUnlocked(verhaalId)) return;
        set((state) => ({
          unlockedCharacters: [
            ...state.unlockedCharacters,
            { verhaalId, personageNaam, unlockedAt: Date.now() },
          ],
          heeftOnverzondenWijzigingen: true,
        }));
        syncPlanner.plan();
      },

      isCharacterUnlocked: (verhaalId) =>
        get().unlockedCharacters.some((c) => c.verhaalId === verhaalId),

      getTotalUnlocked: () => get().unlockedCharacters.length,

      /**
       * Duwt de hele collectie naar `public.character_unlocks` — één rij per gebruiker, dus één
       * upsert op `user_id`. De lijst gaat er in zijn geheel in: hij groeit alleen, dus de laatste
       * stand bevat per definitie alles wat een eerdere stand ook bevatte.
       */
      syncToSupabase: async () => {
        await wachtOpHydratie(useCharacterUnlockStore);

        const { isSyncing, unlockedCharacters } = get();
        const user = useAuthStore.getState().user;

        if (isSyncing || !user) return;

        set({ isSyncing: true });

        try {
          const { error } = await supabase.from('character_unlocks').upsert(
            {
              user_id: user.id,
              unlocked_characters: unlockedCharacters,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );

          if (error) throw error;

          set({ isSyncing: false, syncError: null, heeftOnverzondenWijzigingen: false });
        } catch (fout) {
          set({ isSyncing: false, syncError: foutTekst(fout), heeftOnverzondenWijzigingen: true });
          console.warn('[character-unlock] sync mislukt:', foutTekst(fout));
        }
      },

      /**
       * Voegt de serverlijst samen met de lokale. Aangeroepen zodra er een sessie is.
       *
       * Samenvoegen, niet overschrijven: een personage wordt nooit *ver*grendeld, dus de vereniging
       * verliest niets — en zij is het pad waarlangs personages die je vóór het inloggen verdiende
       * in je account belanden. Bij een dubbel `verhaalId` wint de vroegste `unlockedAt`, want dát
       * is het moment waarop je hem echt vrijspeelde.
       */
      voegServerOntgrendelingenSamen: (vanServer) => {
        set((state) => {
          const perVerhaal = new Map<string, UnlockedCharacter>();
          for (const personage of [...vanServer, ...state.unlockedCharacters]) {
            const bestaand = perVerhaal.get(personage.verhaalId);
            if (!bestaand || personage.unlockedAt < bestaand.unlockedAt) {
              perVerhaal.set(personage.verhaalId, personage);
            }
          }

          const samen = Array.from(perVerhaal.values()).sort((a, b) => a.unlockedAt - b.unlockedAt);

          return {
            unlockedCharacters: samen,
            heeftOnverzondenWijzigingen:
              state.heeftOnverzondenWijzigingen || samen.length > vanServer.length,
          };
        });
      },

      /** Statusvelden terug naar nul bij uitloggen; de collectie zelf blijft op het toestel staan. */
      resetSyncStatus: () => {
        syncPlanner.annuleer();
        set({ isSyncing: false, syncError: null });
      },
    }),
    {
      name: 'character-unlock-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Zie story-progress-store: een bewaarde `isSyncing: true` zou de sync permanent blokkeren.
      partialize: (state) => ({
        unlockedCharacters: state.unlockedCharacters,
        heeftOnverzondenWijzigingen: state.heeftOnverzondenWijzigingen,
      }),
    },
  ),
);

/**
 * Haalt de ontgrendelde personages op en voegt ze samen met de lokale collectie.
 *
 * `maybeSingle()` — een ontbrekende rij is geen fout maar een lege waarde: bij een verse account
 * bestaat hij nog niet, en de eerste push maakt hem alsnog aan.
 */
export async function haalOntgrendelingenOp(userId: string): Promise<void> {
  await wachtOpHydratie(useCharacterUnlockStore);

  const { data, error } = await supabase
    .from('character_unlocks')
    .select('unlocked_characters')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[character-unlock] ophalen mislukt:', error.message);
    return;
  }
  if (!data) return;

  useCharacterUnlockStore
    .getState()
    .voegServerOntgrendelingenSamen(leesServerOntgrendelingen(data.unlocked_characters));
}
