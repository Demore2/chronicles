/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemaStore } from '@/store/thema-store';

export function useEffectieveKleurenSchema(): 'light' | 'dark' {
  const systeemSchema = useColorScheme();
  const themaVoorkeur = useThemaStore((state) => state.themaVoorkeur);

  if (themaVoorkeur === 'donker') return 'dark';
  if (themaVoorkeur === 'licht') return 'light';
  return systeemSchema === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const schema = useEffectieveKleurenSchema();
  return Colors[schema];
}
