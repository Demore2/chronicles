import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * De enige Supabase-client van de app (R8.AUTH deel 1).
 *
 * De waarden komen uit `.env.local` en moeten het `EXPO_PUBLIC_` voorvoegsel dragen:
 * babel-preset-expo vervangt alleen díe namen tijdens het bundelen. Een `NEXT_PUBLIC_*`
 * naam overleeft de bundel niet en levert hier `undefined` op.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  // Bewust hard falen: een client zonder sleutels geeft pas veel later een vage 401,
  // en dan sta je in het inlogscherm te zoeken in plaats van in je .env.local.
  throw new Error(
    'Supabase is niet geconfigureerd. Zet EXPO_PUBLIC_SUPABASE_URL en ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local en herstart de dev-server ' +
      '(env-waarden worden bij het bundelen ingebakken, niet bij een reload).'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Sessie overleeft een herstart via AsyncStorage — dezelfde opslag als de Zustand-stores.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Alleen het web kan een OAuth-callback uit de URL lezen; op native bestaat er geen URL
    // om te parsen en zet dit alleen maar een onnodige listener klaar.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/**
 * Op native draait de vernieuw-timer niet vanzelf door: supabase-js weet niet wanneer de app
 * naar de achtergrond gaat. Zonder deze koppeling verloopt het access-token terwijl de app
 * weg is en krijgt de gebruiker bij terugkomst een 401. Op web regelt de browser dit zelf.
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
