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

/**
 * Wacht tot vaststaat óf er een sessie is, en geeft dan het gebruiker-id (of `null`).
 *
 * `isLoading` begint op `true` en gaat pas uit als `setUser` of `clearUser` is aangeroepen, dus
 * dat is precies het onderscheid dat hier nodig is: "we weten het nog niet" tegenover "er is
 * niemand". `useAuthStore.getState().user?.id` zonder deze wachtstap geeft vlak na een koude start
 * `null` terug, en dat leest als uitgelogd.
 *
 * **Waarom dit bestaat:** de poort in `verhaal/[id]/chapters.tsx` draait in een effect bij het
 * monteren. Komt de lezer via een deeplink of een koude start rechtstreeks in een verhaal terecht,
 * dan herstelt `AuthPoort` de sessie nog terwijl dat effect al loopt — het verhaal werd dan wel
 * lokaal geteld maar nooit naar `public.user_daily_reads` geschreven, en de serverronde die de
 * telling over twee toestellen sluit werd overgeslagen. Zo krijgt een koude start stilzwijgend een
 * gratis extra verhaal. Dit is met een browsertoets vastgesteld: de limietmelding verscheen wel,
 * maar de tabel bleef leeg.
 *
 * De tijdslimiet is er zodat een blijvende `isLoading` de poort niet laat hangen; hij faalt naar
 * `null`, en dan telt de lokale stand — dezelfde afweging als in `leeslimiet.ts`.
 */
export function wachtOpSessie(timeoutMs = 5000): Promise<string | null> {
  const huidig = useAuthStore.getState();
  if (!huidig.isLoading) return Promise.resolve(huidig.user?.id ?? null);

  return new Promise((resolve) => {
    let klaar = false;
    const rond = (id: string | null) => {
      if (klaar) return;
      klaar = true;
      clearTimeout(teller);
      unsubscribe();
      resolve(id);
    };

    const teller = setTimeout(() => rond(null), timeoutMs);
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (!state.isLoading) rond(state.user?.id ?? null);
    });
  });
}
