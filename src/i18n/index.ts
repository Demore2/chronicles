import type { TaalCode } from '@/constants/types';

import de from './de';
import en, { type Vertalingen } from './en';
import fr from './fr';
import nl from './nl';

export type { Vertalingen };

const vertalingenPerTaal: Record<Exclude<TaalCode, 'en'>, object> = { nl, fr, de };

function isPlainObject(waarde: unknown): waarde is Record<string, unknown> {
  return typeof waarde === 'object' && waarde !== null && !Array.isArray(waarde);
}

// Vult ontbrekende sleutels van een gedeeltelijke vertaling aan met de
// Engelse basis, zodat een taal nooit een lege string of kale sleutelnaam
// oplevert.
function diepeMerge(basis: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const resultaat: Record<string, unknown> = { ...basis };
  for (const key of Object.keys(override)) {
    const overrideWaarde = override[key];
    const basisWaarde = basis[key];
    if (overrideWaarde === undefined) continue;
    resultaat[key] =
      isPlainObject(overrideWaarde) && isPlainObject(basisWaarde)
        ? diepeMerge(basisWaarde, overrideWaarde)
        : overrideWaarde;
  }
  return resultaat;
}

const cache = new Map<TaalCode, Vertalingen>();

export function getVertalingen(taal: TaalCode): Vertalingen {
  if (taal === 'en') return en;
  const cached = cache.get(taal);
  if (cached) return cached;
  const merged = diepeMerge(
    en as unknown as Record<string, unknown>,
    vertalingenPerTaal[taal] as Record<string, unknown>
  ) as unknown as Vertalingen;
  cache.set(taal, merged);
  return merged;
}
