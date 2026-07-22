import { StyleSheet, View } from 'react-native';

import Be from '@/assets/flags/be.svg';
import De from '@/assets/flags/de.svg';
import Fr from '@/assets/flags/fr.svg';
import Nl from '@/assets/flags/nl.svg';

const flagsByIso2 = {
  NL: Nl,
  BE: Be,
  DE: De,
  FR: Fr,
} as const;

export function Flag({ iso2, size = 32 }: { iso2: string; size?: number }) {
  const FlagComponent = flagsByIso2[iso2 as keyof typeof flagsByIso2];
  if (!FlagComponent) return null;

  return (
    <View style={[styles.wrapper, { width: size, height: (size * 3) / 4 }]}>
      <FlagComponent width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 4,
    overflow: 'hidden',
  },
});
