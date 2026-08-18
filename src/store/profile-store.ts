import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getVerhaal } from '@/content/verhalen';

/**
 * De avatar op Profiel.
 *
 * Twee soorten, want ze komen ergens anders vandaan en overleven iets anders. Een **personage**
 * is een verwijzing naar een verhaal-id: de bytes zitten al in de bundel (`CHARACTER_IMAGES`),
 * dus die avatar kan niet verdwijnen en gaat straks probleemloos mee naar een tweede toestel.
 * Een **foto** is een pad naar een bestand op dít toestel, gekozen met `expo-image-picker` — dat
 * pad zegt op een ander toestel niets, en kan zelfs hier verlopen als Android de cache opruimt.
 * Vandaar de `onError`-terugval in `profile-header.tsx`.
 */
export type Avatar =
  | { soort: 'personage'; verhaalId: string }
  | { soort: 'foto'; uri: string };

type ProfileState = {
  avatar: Avatar | null;
  kiesPersonage: (verhaalId: string) => void;
  kiesFoto: (uri: string) => void;
  wisAvatar: () => void;
};

/**
 * De avatarkeuze, lokaal op het toestel.
 *
 * `persist` doet het inlezen — daarom is er geen `loadAvatar()` die een scherm bij het monteren
 * moet aanroepen. Elke andere store in dit project werkt zo (`thema-store`, `taal-store`,
 * `notificatie-store`), en een handmatige laadaanroep is precies het soort ding dat je op één
 * scherm vergeet.
 *
 * **Deze store synchroniseert (nog) niet met Supabase.** De `profiles`-tabel heeft geen
 * avatarkolom, en een foto zou pas iets betekenen op een tweede toestel als de bytes mee gaan —
 * dat is Storage, geen kolom. Hij hoort daarmee in hetzelfde rijtje als taal, thema en de
 * herinnering: apparaatvoorkeur. Zie "Known gaps" in CLAUDE.md.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      avatar: null,
      kiesPersonage: (verhaalId) => set({ avatar: { soort: 'personage', verhaalId } }),
      kiesFoto: (uri) => set({ avatar: { soort: 'foto', uri } }),
      wisAvatar: () => set({ avatar: null }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * De avatar als bron voor `expo-image` — of `null` als er geen (bruikbare) keuze is.
 *
 * Een personage-avatar van een verhaal dat niet meer bestaat levert bewust `null` op in plaats
 * van een lege afbeelding: het scherm valt dan terug op de standaardcirkel, net alsof er nooit
 * iets is gekozen.
 */
export function avatarBron(avatar: Avatar | null): ImageSourcePropType | null {
  if (!avatar) return null;
  if (avatar.soort === 'foto') return { uri: avatar.uri };
  return getVerhaal(avatar.verhaalId)?.afbeelding ?? null;
}
