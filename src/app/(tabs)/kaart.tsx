import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorldMap } from '@/components/world-map';
import { Spacing } from '@/constants/theme';

export default function KaartScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title} numberOfLines={1}>
            Map
          </ThemedText>
        </View>
      </SafeAreaView>
      <ThemedView style={styles.mapWrapper}>
        <WorldMap />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
  },
  title: {
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    padding: Spacing.four,
  },
});
