import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { LegeStaat } from '@/components/lege-staat';
import { ThemedView } from '@/components/themed-view';
import { getVerhaal } from '@/content/verhalen';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function VerhaalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useVertaling();
  const markeerAlsBekeken = useVoortgangStore((state) => state.markeerAlsBekeken);

  const verhaal = getVerhaal(id);

  useEffect(() => {
    if (verhaal) {
      markeerAlsBekeken(verhaal.id);
      router.replace({
        pathname: '/verhaal/[id]/chapters',
        params: { id: verhaal.id },
      });
    }
  }, [verhaal, markeerAlsBekeken, router]);

  if (!verhaal) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: t((s) => s.verhaal.nietGevondenTitel) }} />
        <LegeStaat
          titel={t((s) => s.verhaal.nietGevondenTitel)}
          beschrijving={t((s) => s.verhaal.nietGevondenBeschrijving)}
        />
      </ThemedView>
    );
  }

  return null;
}
