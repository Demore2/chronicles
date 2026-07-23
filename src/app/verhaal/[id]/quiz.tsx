import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { LegeStaat } from '@/components/lege-staat';
import { ThemedView } from '@/components/themed-view';

export default function QuizScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Quiz verwijderd' }} />
      <LegeStaat titel="Quiz verwijderd" beschrijving="Quizzes zijn uit deze app verwijderd." />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
