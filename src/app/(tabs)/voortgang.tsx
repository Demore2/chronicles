import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectieKop } from '@/components/sectie-kop';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { tijdperken } from '@/constants/tijdperken';
import { verhalen } from '@/content/verhalen';
import { useStreak } from '@/hooks/use-streak';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function VoortgangScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, v } = useVertaling();
  const completedStories = useVoortgangStore((state) => state.completedStories);
  const streakDagen = useStreak();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <ThemedText type="display">{t((s) => s.voortgang.titel)}</ThemedText>
          </View>

          {/*
            Zonder streak is dit geen teller maar een uitnodiging (B6): het vlammetje dooft naar
            `inactive` en de tekst zegt wat je moet doen in plaats van "0 days streak".
          */}
          <View style={[styles.streakCard, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.streakIcoon,
                {
                  backgroundColor: withAlpha(
                    streakDagen > 0 ? theme.accent : theme.inactive,
                    0.16
                  ),
                },
              ]}>
              <Ionicons
                name={streakDagen > 0 ? 'flame' : 'flame-outline'}
                size={28}
                color={streakDagen > 0 ? theme.accent : theme.inactive}
              />
            </View>
            <View style={styles.streakTekst}>
              <ThemedText type="title">
                {streakDagen > 0
                  ? t((s) => s.voortgang.streak)(streakDagen)
                  : t((s) => s.voortgang.streakLeeg)}
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {streakDagen > 0
                  ? t((s) => s.voortgang.streakBeschrijving)
                  : t((s) => s.voortgang.streakLeegBeschrijving)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.voortgang.byEra)} />
            <View style={styles.lijst}>
              {tijdperken.map((tijdperk) => {
                const verhalenInEra = verhalen.filter((v) => v.tijdperkId === tijdperk.id);
                const completedInEra = verhalenInEra.filter((v) => completedStories.has(v.id)).length;
                const fractie = verhalenInEra.length > 0 ? completedInEra / verhalenInEra.length : 0;
                return (
                  <Pressable
                    key={tijdperk.id}
                    onPress={() => router.push({ pathname: '/tijdperk/[id]', params: { id: tijdperk.id } })}
                    style={[styles.rij, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.rijTekst}>
                      <ThemedText type="smallBold">{v(tijdperk.titel)}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {t((s) => s.voortgang.storiesOfEra)(completedInEra, verhalenInEra.length)}
                      </ThemedText>
                      <View style={[styles.balkTrackKlein, { backgroundColor: theme.backgroundSelected }]}>
                        <View
                          style={[
                            styles.balkVulling,
                            { backgroundColor: tijdperk.kleur, width: `${fractie * 100}%` },
                          ]}
                        />
                      </View>
                    </View>
                    {fractie >= 1 && verhalenInEra.length > 0 && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  headerRow: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  streakIcoon: {
    width: 56,
    height: 56,
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  balkTrack: {
    height: 8,
    borderRadius: Radii.small,
    overflow: 'hidden',
  },
  balkTrackKlein: {
    height: 6,
    borderRadius: Radii.small,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  balkVulling: {
    height: '100%',
    borderRadius: Radii.small,
  },
  sectie: {
    gap: Spacing.three,
  },
  lijst: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  rij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  rijTekst: {
    flex: 1,
    gap: Spacing.half,
  },
});
