import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Inhoud (iconen + labels) van de tab bar, exclusief de veilige zone onderaan.
// De onderliggende tab bar reserveert intern een vast icoonvak (28px) plus
// 5px padding boven en onder per item; het label krijgt via flex wat daarna
// overblijft. Deze hoogte moet dus ruim genoeg zijn zodat het label niet
// wordt afgeknepen tot een paar pixels.
const TAB_BAR_INHOUD_HOOGTE = 64;

function tabIcon(filled: IoniconName, outline: IoniconName) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Ionicons name={focused ? filled : outline} color={color as string} size={size} />
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useVertaling();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          height: TAB_BAR_INHOUD_HOOGTE + insets.bottom,
          paddingTop: Spacing.one,
          paddingBottom: insets.bottom + Spacing.one,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t((s) => s.tabs.ontdek), tabBarIcon: tabIcon('compass', 'compass-outline') }}
      />
      <Tabs.Screen
        name="kaart"
        options={{ title: t((s) => s.tabs.kaart), tabBarIcon: tabIcon('map', 'map-outline') }}
      />
      <Tabs.Screen
        name="voortgang"
        options={{ title: t((s) => s.tabs.voortgang), tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline') }}
      />
      <Tabs.Screen
        name="profiel"
        options={{ title: t((s) => s.tabs.profiel), tabBarIcon: tabIcon('person', 'person-outline') }}
      />
      {/* Oude route, vervangen door (tabs)/index.tsx. Kon niet worden verwijderd
          (Remove-Item is geblokkeerd in dit project) — href: null verbergt 'm uit de tab bar. */}
      <Tabs.Screen name="ontdek" options={{ href: null }} />
    </Tabs>
  );
}
