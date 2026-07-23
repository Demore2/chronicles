import { Stack } from 'expo-router';
import { LegeStaat } from '@/components/lege-staat';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function ChapterQuizScreen() {
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
