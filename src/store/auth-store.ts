import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

/** De `profiles`-rij die bij de ingelogde gebruiker hoort. */
export type Profiel = {
  id: string;
  email: string;
  username: string | null;
  language: string | null;
  theme: string | null;
};

type AuthState = {
  user: User | null;
  profiel: Profiel | null;
  /** Waar zolang de sessie nog niet is gecontroleerd — start op `true`, zie `useAuth`. */
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, profiel?: Profiel | null) => void;
  clearUser: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
};

/**
 * Auth-state in het geheugen (R8.AUTH deel 1).
 *
 * Bewust *niet* `persist`: de sessie zelf ligt al in AsyncStorage bij supabase-js
 * (zie `src/lib/supabase.ts`). Die twee allebei laten opslaan levert twee bronnen van
 * waarheid op die uit elkaar lopen zodra een token verloopt — dan toont de app een
 * ingelogde gebruiker terwijl elke query een 401 geeft. `useAuth` vult deze store bij
 * het opstarten uit de echte sessie.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profiel: null,
  isLoading: true,
  error: null,
  setUser: (user, profiel = null) => set({ user, profiel, error: null, isLoading: false }),
  clearUser: () => set({ user: null, profiel: null, error: null, isLoading: false }),
  setError: (error) => set({ error, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
