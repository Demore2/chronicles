import { Ionicons } from '@expo/vector-icons';
import type { NativeStackHeaderProps } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AppHeader({ options, back, navigation }: NativeStackHeaderProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.row}>
        {back && (
          <Pressable onPress={navigation.goBack} hitSlop={16} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
        )}
        <ThemedText type="title" style={styles.title} numberOfLines={1}>
          {options.title ?? ''}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
  },
  backButton: {
    padding: Spacing.one,
    marginLeft: -Spacing.one,
  },
  title: {
    flex: 1,
  },
});
