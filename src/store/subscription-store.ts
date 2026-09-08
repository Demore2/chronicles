import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { foutTekst } from '@/store/sync-hulp';

/**
 * De abonnementsstatus zoals Supabase hem kent (Fase 1).
 *
 * **Dit staat naast `abonnement-store` en vervangt het niet.** Die store gaat over wat dit toestel
 * vandaag heeft geopend (`gestarteVerhalen`, `bonusVerhalen`) en over het tegoed dat je met een
 * uitnodiging verdient (`proTot`); deze gaat over wat de *server* over dit account weet.
 *
 * **Deze is sinds Fase 2A de bron voor "heeft deze lezer Pro".** `useAbonnement()` telt de twee
 * bij elkaar op — serverabonnement óf lopend tegoed — en de rest van de app kijkt uitsluitend naar
 * die hook. De dev-schakelaar "Simulate Pro", die `abonnement-store.isPro` zette, is daarmee
 * verdwenen; premium zet je nu op de serverrij (zie `docs/TEST_ACCOUNTS.md`).
 *
 * **Ook `magVerhaalOpenen` in `abonnement-store` kijkt hier sinds de rate limiting naar**, via
 * `heeftProNu()` daar. Hier stond dat het niet kon omdat die store deze niet kon zien; dat was een
 * ontwerpafspraak en geen technische onmogelijkheid — `abonnement-store` importeert nu
 * `isAbonnementActief` uit dit bestand. De afhankelijkheid loopt bewust maar één kant op: deze
 * store weet niets van die.
 *
 * Bewust géén `persist`: de serverrij is de waarheid en die wordt bij elke start opgehaald. Wat er
 * wél is, is een handmatige cache in AsyncStorage — niet om de state te herstellen, maar om na een
 * mislukte ronde (offline) terug te kunnen vallen op de laatst bekende stand in plaats van de
 * lezer stilzwijgend naar 'free' te degraderen.
 */

/** De vorm van een `user_subscriptions`-rij. Kolomnamen zijn snake_case, zoals in het schema. */
type AbonnementRij = {
  user_id: string;
  tier: 'free' | 'premium';
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  auto_renew: boolean;
};

export interface SubscriptionState {
  tier: 'free' | 'premium';
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  autoRenew: boolean;
  userId: string | null;
  loading: boolean;
  error: string | null;

  // Computed
  isPremium: () => boolean;

  // Actions
  loadSubscription: (userId: string) => Promise<void>;
  // UITGESCHAKELD TOT GOOGLE PLAY BILLING — allebei, en om dezelfde reden: de client schreef
  // `tier: 'premium'` naar zijn eigen rij zonder dat er een bon werd geverifieerd. `setPremium`
  // stond al uit; `setTrial` kreeg in FASE 3 een aanroeper in `pro-paywall.tsx` en was daarmee
  // één tik ver van gratis Pro. Die aanroeper is weg, dus dit sluit de deur er weer achter.
  // Premium zetten gebeurt tot die tijd met de hand in Supabase (zie docs/TEST_ACCOUNTS.md).
  // setTrial: (days: number) => Promise<boolean>;
  // setPremium: (planType: 'yearly' | 'monthly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reset: () => void;
}

/** De sleutel waaronder de laatst bekende serverrij in AsyncStorage ligt. */
function cacheSleutel(userId: string): string {
  return `subscription_${userId}`;
}

/**
 * Ligt er een moment in de toekomst? Losse functie, zodat `isPremium` één vorm heeft en niet drie
 * keer hetzelfde `!== null && new Date(...) > nu` uitschrijft.
 *
 * Let op de expliciete `boolean`: `waarde && new Date(waarde) > nu` geeft `null` terug wanneer
 * `waarde` null is, niet `false`. Dat is precies het verschil tussen een functie die `boolean`
 * belooft en een functie die dat waarmaakt.
 */
function loptNog(moment: string | null, nu: number): boolean {
  if (!moment) return false;
  const eind = new Date(moment).getTime();
  return !Number.isNaN(eind) && eind > nu;
}

/**
 * Loopt het abonnement van de server nú?
 *
 * Losse, zuivere functie met het peilmoment als parameter — precies de vorm van `isProActief` in
 * `abonnement-store` en van `berekenHuidigeStreak`. Zo kan `useAbonnement()` hem aanroepen zonder
 * tijdens het renderen de klok af te lezen (dat breekt de zuiverheidsregel van `react-hooks`, en
 * laat een scherm dat al uren openstaat op een verlopen abonnement staan).
 */
export function isAbonnementActief(
  rij: Pick<SubscriptionState, 'tier' | 'trialEndsAt' | 'subscriptionEndsAt'>,
  nu: number,
): boolean {
  if (rij.tier !== 'premium') return false;
  return loptNog(rij.trialEndsAt, nu) || loptNog(rij.subscriptionEndsAt, nu);
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  trialEndsAt: null,
  subscriptionEndsAt: null,
  autoRenew: false,
  userId: null,
  loading: false,
  error: null,

  /**
   * Premium is `tier === 'premium'` **én** een datum die nog loopt.
   *
   * Een rij die op premium blijft staan terwijl beide data verlopen zijn geeft dus `false`: een
   * abonnement loopt af door het verstrijken van tijd, niet doordat iemand een veld omzet. Dezelfde
   * redenering als bij `proTot` in `abonnement-store` en bij `useStreak()`.
   */
  isPremium: () => isAbonnementActief(get(), Date.now()),

  loadSubscription: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // `maybeSingle()` en niet `single()`: een lezer die zich ná de backfill registreerde heeft
      // nog geen rij, en `single()` maakt van dat normale geval een fout. De rij wordt dan hier
      // alsnog aangemaakt — zelfde aanpak als `maakGebruikersrijen` voor `profiles`/`voortgang`.
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('user_id, tier, trial_ends_at, subscription_ends_at, auto_renew')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      let rij = data as AbonnementRij | null;

      if (!rij) {
        // `ignoreDuplicates`, want twee toestellen kunnen dit tegelijk doen; de unique index op
        // user_id maakt de tweede een no-op in plaats van een duplicate-key-fout.
        const { error: insertFout } = await supabase
          .from('user_subscriptions')
          .upsert({ user_id: userId, tier: 'free' }, { onConflict: 'user_id', ignoreDuplicates: true });
        if (insertFout) throw insertFout;

        rij = {
          user_id: userId,
          tier: 'free',
          trial_ends_at: null,
          subscription_ends_at: null,
          auto_renew: false,
        };
      }

      set({
        userId,
        tier: rij.tier,
        trialEndsAt: rij.trial_ends_at,
        subscriptionEndsAt: rij.subscription_ends_at,
        autoRenew: rij.auto_renew,
        loading: false,
      });

      await AsyncStorage.setItem(cacheSleutel(userId), JSON.stringify(rij));
    } catch (fout: unknown) {
      // Offline of een 401: val terug op de laatst bekende stand in plaats van op 'free'. Een
      // betalende lezer die in de trein zijn app opent hoort zijn Pro niet kwijt te raken.
      const bewaard = await AsyncStorage.getItem(cacheSleutel(userId)).catch(() => null);
      const rij = bewaard ? (JSON.parse(bewaard) as AbonnementRij) : null;

      set({
        error: foutTekst(fout),
        loading: false,
        userId,
        tier: rij?.tier ?? 'free',
        trialEndsAt: rij?.trial_ends_at ?? null,
        subscriptionEndsAt: rij?.subscription_ends_at ?? null,
        autoRenew: rij?.auto_renew ?? false,
      });
    }
  },

  /**
   * UITGESCHAKELD TOT DE GOOGLE PLAY BILLING-INTEGRATIE — `setTrial` en `setPremium` samen.
   *
   * Ze zetten premium (een proefperiode van `days` dagen, respectievelijk een jaar of een maand).
   * **Allebei waren het placeholders met hetzelfde gat erin**: er werd geen aankoop geverifieerd,
   * de client schreef rechtstreeks naar zijn eigen rij, en de update-policy op
   * `user_subscriptions` (`auth.uid() = user_id`, zonder kolombeperking) staat dat toe — een
   * lezer met zijn eigen token kon zichzelf dus premium maken.
   *
   * `setPremium` stond al uit omdat hij geen aanroeper had. `setTrial` had er sinds FASE 3 wél
   * één — de knop "Start free trial" in `pro-paywall.tsx` — en die tik schreef `tier = 'premium'`
   * met `auto_renew = true` naar de server. Dat is nagemeten en bevestigd op een testaccount.
   * De knop is nu uitgeschakeld en deze methode gaat mee uit, zodat de volgende aanroeper hem
   * niet zomaar terugvindt.
   *
   * ⚠️ **Dit dicht de app-kant, niet het lek.** De update-policy staat er nog, dus wie de
   * publishable key uit de bundel haalt kan dezelfde `update` met elke REST-client uitvoeren.
   * Bij Billing keren beide terug als aanroep van een edge function die de bon bij Google
   * controleert, en **gaat de update-policy op de tabel eraf** — die twee horen bij elkaar. Tot
   * die tijd wordt premium met de hand in Supabase gezet, zie `docs/TEST_ACCOUNTS.md`.
   */
  // setTrial: async (days: number) => {
  //   const { userId } = get();
  //   // Geen sessie, geen proefperiode — en dat moet de aanroeper wéten. Een `return` zonder
  //   // antwoord las in de paywall als "gelukt", waarna er een felicitatie verscheen voor iets wat
  //   // nooit is weggeschreven.
  //   if (!userId) {
  //     set({ error: 'geen_sessie' });
  //     return false;
  //   }
  //
  //   try {
  //     const trialEndsAt = new Date();
  //     trialEndsAt.setDate(trialEndsAt.getDate() + days);
  //
  //     // `.select()` erachter, want een `update` die géén rij raakt is in PostgREST **geen fout**:
  //     // je krijgt een lege lijst en `error === null`. Zonder deze telling zet de app zichzelf
  //     // lokaal op premium terwijl de serverrij op 'free' blijft staan — dezelfde stille-nul-rijen
  //     // val als bij een `delete` zonder policy. Een lezer die zich ná de backfill registreerde en
  //     // wiens rij nog niet bestaat, loopt hier precies in.
  //     const { data, error } = await supabase
  //       .from('user_subscriptions')
  //       .update({
  //         tier: 'premium',
  //         trial_ends_at: trialEndsAt.toISOString(),
  //         auto_renew: true,
  //         updated_at: new Date().toISOString(),
  //       })
  //       .eq('user_id', userId)
  //       .select('user_id');
  //
  //     if (error) throw error;
  //     if (!data || data.length === 0) throw new Error('geen_abonnementsrij');
  //
  //     set({
  //       tier: 'premium',
  //       trialEndsAt: trialEndsAt.toISOString(),
  //       autoRenew: true,
  //       error: null,
  //     });
  //     return true;
  //   } catch (fout: unknown) {
  //     set({ error: foutTekst(fout) });
  //     return false;
  //   }
  // },

  // setPremium: async (planType: 'yearly' | 'monthly') => {
  //   const { userId } = get();
  //   if (!userId) return;
  //
  //   try {
  //     const subscriptionEndsAt = new Date();
  //     if (planType === 'yearly') {
  //       subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
  //     } else {
  //       subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
  //     }
  //
  //     const { error } = await supabase
  //       .from('user_subscriptions')
  //       .update({
  //         tier: 'premium',
  //         subscription_ends_at: subscriptionEndsAt.toISOString(),
  //         auto_renew: true,
  //         trial_ends_at: null, // een lopende proefperiode gaat op in het abonnement
  //         updated_at: new Date().toISOString(),
  //       })
  //       .eq('user_id', userId);
  //
  //     if (error) throw error;
  //
  //     set({
  //       tier: 'premium',
  //       subscriptionEndsAt: subscriptionEndsAt.toISOString(),
  //       autoRenew: true,
  //       trialEndsAt: null,
  //       error: null,
  //     });
  //   } catch (fout: unknown) {
  //     set({ error: foutTekst(fout) });
  //   }
  // },

  cancelSubscription: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          tier: 'free',
          subscription_ends_at: null,
          trial_ends_at: null,
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      set({
        tier: 'free',
        subscriptionEndsAt: null,
        trialEndsAt: null,
        autoRenew: false,
        error: null,
      });
    } catch (fout: unknown) {
      set({ error: foutTekst(fout) });
    }
  },

  /**
   * Terug naar de beginstand. Hoort bij het uitloggen: laat je de vorige lezer staan, dan ziet de
   * volgende zijn abonnement tot `loadSubscription` klaar is. De cache in AsyncStorage blijft hier
   * bewust staan — die hangt aan een user-id en is bij de volgende login van dezelfde lezer weer
   * precies wat je wilt hebben. Bij accountverwijdering moet hij wél weg: zie
   * `wisAbonnementCache()`.
   */
  reset: () =>
    set({
      tier: 'free',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      autoRenew: false,
      userId: null,
      loading: false,
      error: null,
    }),
}));

/**
 * Wist de abonnementsstatus én de gecachte serverrij van dit toestel.
 *
 * Alleen voor **accountverwijdering**, niet voor uitloggen — zelfde scheiding als in
 * `wisLokaleGebruikersgegevens()`, waar dit vandaan wordt aangeroepen. `reset()` alleen is hier
 * niet genoeg: dat leegt de state, maar laat de laatst bekende rij van de verwijderde lezer in
 * AsyncStorage achter. Die sleutel wordt na de verwijdering nooit meer gelezen (een nieuw account
 * krijgt een nieuw user-id), dus het is geen lek naar de volgende lezer — maar "voorgoed
 * verwijderd" hoort ook op het toestel te kloppen.
 *
 * Fire-and-forget: `wisLokaleGebruikersgegevens()` is synchroon, en een mislukte `removeItem` mag
 * de rest van het opruimen niet tegenhouden.
 */
export function wisAbonnementCache(): void {
  const { userId } = useSubscriptionStore.getState();
  if (userId) {
    void AsyncStorage.removeItem(cacheSleutel(userId)).catch(() => {
      // Niets aan te doen en niets aan verloren: de sleutel wordt nooit meer opgevraagd.
    });
  }
  useSubscriptionStore.getState().reset();
}
