import type { TaalCode } from '@/constants/types';

// Taalnamen in hun eigen taal (autoniemen) — bewust niet vertaald, zodat
// iemand zijn eigen taal herkent ongeacht de huidige UI-taal.
export const taalNamen: Record<TaalCode, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
};

export const taalCodes: TaalCode[] = ['en', 'nl', 'fr', 'de'];
