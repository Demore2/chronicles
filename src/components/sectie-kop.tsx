import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useVertaling } from '@/hooks/use-vertaling';

export function SectieKop({ titel, onToonAlles }: { titel: string; onToonAlles?: () => void }) {
  const { t } = useVertaling();

  return (
    <View style={styles.row}>
      <ThemedText type="title">{titel}</ThemedText>
      {onToonAlles && (
        <Pressable onPress={onToonAlles} hitSlop={8}>
          <ThemedText type="link" themeColor="accent">
            {t((s) => s.ontdek.toonAlles)}
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
