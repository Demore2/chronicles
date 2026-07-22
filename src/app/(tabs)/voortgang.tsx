import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Flag } from '@/components/flag';
import { LegeStaat } from '@/components/lege-staat';
import { SectieKop } from '@/components/sectie-kop';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { regios } from '@/constants/regios';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import { tijdperken } from '@/constants/tijdperken';
import { getRegioVoortgang, getTijdperkVoortgang } from '@/content/queries';
import { verhalen } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function VoortgangScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);
  const streakDagen = useVoortgangStore((state) => state.streakDagen);

  const totaalVerhalen = verhalen.length;
  const totaalGelezen = gelezenIds.size;
  const totaalFractie = totaalVerhalen > 0 ? totaalGelezen / totaalVerhalen : 0;

  const regiosMetVerhalen = regios
    .map((regio) => ({ regio, voortgang: getRegioVoortgang(regio.id, gelezenIds) }))
    .filter((item) => item.voortgang.totaal > 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <ThemedText type="display">{t((s) => s.voortgang.titel)}</ThemedText>
          </View>

          <View style={[styles.streakCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.streakIcoon, { backgroundColor: withAlpha(theme.accent, 0.16) }]}>
              <Ionicons name="flame" size={28} color={theme.accent} />
            </View>
            <View style={styles.streakTekst}>
              <ThemedText type="title">{t((s) => s.voortgang.streak)(streakDagen)}</ThemedText>
              <ThemedText themeColor="textSecondary">{t((s) => s.voortgang.streakBeschrijving)}</ThemedText>
            </View>
          </View>

          <View style={[styles.voortgangCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.voortgangKopRow}>
              <ThemedText type="smallBold">{t((s) => s.voortgang.verhalenGelezen)}</ThemedText>
              <ThemedText type="smallBold" themeColor="accent">
                {t((s) => s.voortgang.aantalVerhalen)(totaalGelezen, totaalVerhalen)}
              </ThemedText>
            </View>
            <View style={[styles.balkTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.balkVulling,
                  { backgroundColor: theme.accent, width: `${totaalFractie * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.voortgang.perTijdperk)} />
            <View style={styles.lijst}>
              {tijdperken.map((tijdperk) => {
                const voortgang = getTijdperkVoortgang(tijdperk.id, gelezenIds);
                const fractie = voortgang.totaal > 0 ? voortgang.gelezen / voortgang.totaal : 0;
                return (
                  <Pressable
                    key={tijdperk.id}
                    onPress={() => router.push({ pathname: '/tijdperk/[id]', params: { id: tijdperk.id } })}
                    style={[styles.rij, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.rijTekst}>
                      <ThemedText type="smallBold">{v(tijdperk.titel)}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {t((s) => s.voortgang.aantalVerhalen)(voortgang.gelezen, voortgang.totaal)}
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
                    {fractie >= 1 && voortgang.totaal > 0 && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.voortgang.perLand)} />
            {regiosMetVerhalen.length === 0 ? (
              <LegeStaat
                titel={t((s) => s.voortgang.legeLandenTitel)}
                beschrijving={t((s) => s.voortgang.legeLandenBeschrijving)}
              />
            ) : (
              <View style={styles.lijst}>
                {regiosMetVerhalen.map(({ regio, voortgang }) => {
                  const fractie = voortgang.totaal > 0 ? voortgang.gelezen / voortgang.totaal : 0;
                  return (
                    <Pressable
                      key={regio.id}
                      onPress={() => router.push({ pathname: '/regio/[id]', params: { id: regio.id } })}
                      style={[styles.rij, { backgroundColor: theme.backgroundElement }]}>
                      <Flag iso2={regio.iso2} size={32} />
                      <View style={styles.rijTekst}>
                        <ThemedText type="smallBold">{v(regio.naam)}</ThemedText>
                        <ThemedText type="caption" themeColor="textSecondary">
                          {t((s) => s.voortgang.aantalVerhalen)(voortgang.gelezen, voortgang.totaal)}
                        </ThemedText>
                        <View style={[styles.balkTrackKlein, { backgroundColor: theme.backgroundSelected }]}>
                          <View
                            style={[
                              styles.balkVulling,
                              { backgroundColor: theme.accent, width: `${fractie * 100}%` },
                            ]}
                          />
                        </View>
                      </View>
                      {fractie >= 1 && <Ionicons name="checkmark-circle" size={22} color={theme.accent} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
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
  voortgangCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
    gap: Spacing.two,
  },
  voortgangKopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
