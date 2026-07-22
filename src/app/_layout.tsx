import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppHeader } from '@/components/app-header';
import { useEffectieveKleurenSchema } from '@/hooks/use-theme';

export default function RootLayout() {
  const kleurenSchema = useEffectieveKleurenSchema();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={kleurenSchema === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ header: (props) => <AppHeader {...props} /> }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
