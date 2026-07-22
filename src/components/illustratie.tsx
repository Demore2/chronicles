import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { IoniconNaam } from '@/constants/types';

export function Illustratie({
  kleur,
  icoonNaam,
  iconSize = 40,
  style,
}: {
  kleur: string;
  icoonNaam: IoniconNaam;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.container, { backgroundColor: kleur }, style]}>
      <Ionicons name={icoonNaam} size={iconSize} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
