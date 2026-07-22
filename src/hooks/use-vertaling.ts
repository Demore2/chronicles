import { useMemo } from 'react';

import type { VertaaldVeld } from '@/constants/types';
import { getVertalingen, type Vertalingen } from '@/i18n';
import { useTaalStore } from '@/store/taal-store';

export function useVertaling() {
  const taal = useTaalStore((state) => state.taal);
  const setTaal = useTaalStore((state) => state.setTaal);
  const vertalingen = useMemo(() => getVertalingen(taal), [taal]);

  function t<R>(selector: (v: Vertalingen) => R): R {
    return selector(vertalingen);
  }

  function v(veld: VertaaldVeld): string {
    return veld[taal] ?? veld.en;
  }

  return { t, v, taal, setTaal };
}
