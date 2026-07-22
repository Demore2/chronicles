import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function SectieKop({ titel, onToonAlles }: { titel: string; onToonAlles?: () => void }) {
  return (
    <View style={styles.row}>
      <ThemedText type="title">{titel}</ThemedText>
      {onToonAlles && (
        <Pressable onPress={onToonAlles} hitSlop={8}>
          <ThemedText type="link" themeColor="accent">
            Toon alles
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
});
