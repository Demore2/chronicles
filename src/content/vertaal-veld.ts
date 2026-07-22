import type { TaalCode, VertaaldVeld } from '@/constants/types';

export function vertaalVeld(veld: VertaaldVeld, taal: TaalCode): string {
  return veld[taal] ?? veld.en;
}
