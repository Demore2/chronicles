import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STANDAARD_ANALYTICS_TOESTEMMING } from '@/constants/analytics';
import { analytics } from '@/lib/analytics';

/**
 * Of deze lezer gebruiksstatistieken deelt.
 *
 * **Waarom dit een store is en geen constante.** Firebase Analytics verzamelt een
 * app-instance-id, toestelgegevens en bij benadering de locatie (via het IP-adres), en
 * `analytics.zetGebruiker()` koppelt dat aan het Supabase-account. Voor een app die in het
 * Nederlands, Frans en Duits verschijnt betekent dat de AVG, en die eist minstens dat je het
 * kunt uitzetten. De schakelaar staat in Instellingen onder Privacy.
 *
 * **Waarom hij standaard aan staat, anders dan de e-mailvoorkeuren.** Die gaan over marketing:
 * daarvoor bestaat geen geldige toestemming die je al aangevinkt aantreft. Statistiek over je
 * eigen app is een andere afweging — zie `STANDAARD_ANALYTICS_TOESTEMMING`, waar ook staat wat
 * er tegen die keuze pleit en hoe je hem omdraait.
 *
 * **Bewust device-lokaal**, net als thema, taal en de e-mailvoorkeuren. Toestemming voor meten
 * gaat over dít toestel: Firebase telt per installatie, dus een keuze op de telefoon zegt niets
 * over de tablet. Hij hoort daarmee *niet* in de lijst stores die naar Supabase gaan.
 */
type AnalyticsState = {
  toestemming: boolean;
  zetToestemming: (toestemming: boolean) => void;
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      toestemming: STANDAARD_ANALYTICS_TOESTEMMING,

      zetToestemming: (toestemming) => {
        set({ toestemming });
        // Meteen doorgeven, niet wachten tot de volgende start. Wie de schakelaar omzet verwacht
        // dat het dán stopt; `useAnalytics()` in de root layout zet hem bij elke start opnieuw,
        // zodat de opgeslagen keuze ook een herstart overleeft.
        analytics.zetVerzamelenAan(toestemming);
      },
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
