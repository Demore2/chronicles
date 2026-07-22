import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectieKaart } from '@/components/collectie-kaart';
import { HorizontaleRij } from '@/components/horizontale-rij';
import { LegeStaat } from '@/components/lege-staat';
import { SectieKop } from '@/components/sectie-kop';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TijdperkRij } from '@/components/tijdperk-rij';
import { VerhaalKaart } from '@/components/verhaal-kaart';
import { CardDimensions, Radii, Spacing } from '@/constants/theme';
import { getActieveTijdperken } from '@/constants/tijdperken';
import type { Verhaal } from '@/constants/types';
import { collecties } from '@/content/collecties';
import { getNieuwToegevoegd, getUitgelichteVerhalenVoorTijdperk, getUitgelichtVerhaal } from '@/content/queries';
import { getVerhaal } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useVoortgangStore } from '@/store/voortgang-store';

export default function OntdekScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, v } = useVertaling();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);
  const bekekenIds = useVoortgangStore((state) => state.bekekenIds);
  const streakDagen = useVoortgangStore((state) => state.streakDagen);

  const uitgelicht = getUitgelichtVerhaal();
  const verderLezen = [...bekekenIds]
    .map((id) => getVerhaal(id))
    .filter((verhaal): verhaal is Verhaal => verhaal !== undefined && !gelezenIds.has(verhaal.id));
  const nieuwToegevoegd = getNieuwToegevoegd();

  if (!uitgelicht) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <ThemedText type="display">{t((s) => s.tabs.ontdek)}</ThemedText>
              <View style={[styles.streak, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="flame" size={18} color={theme.accent} />
                <ThemedText type="smallBold">{streakDagen}</ThemedText>
              </View>
            </View>
            <LegeStaat
              icoonNaam="book-outline"
              titel="Geen content"
              beschrijving="Er zijn nog geen verhalen beschikbaar."
            />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  function openVerhaal(verhaalId: string) {
    router.push({ pathname: '/verhaal/[id]', params: { id: verhaalId } });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <ThemedText type="display">{t((s) => s.tabs.ontdek)}</ThemedText>
            <View style={[styles.streak, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="flame" size={18} color={theme.accent} />
              <ThemedText type="smallBold">{streakDagen}</ThemedText>
            </View>
          </View>

          <Pressable
            onPress={() => openVerhaal(uitgelicht.id)}
            style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="caption" themeColor="accent">
              {t((s) => s.ontdek.uitgelicht)}
            </ThemedText>
            <ThemedText type="display" style={styles.heroTitel}>
              {v(uitgelicht.titel)}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{v(uitgelicht.teaser)}</ThemedText>
            <View style={[styles.heroKnop, { backgroundColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                {t((s) => s.ontdek.leesNu)}
              </ThemedText>
            </View>
          </Pressable>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.ontdek.verderLezen)} />
            {verderLezen.length === 0 ? (
              <LegeStaat
                icoonNaam="book-outline"
                titel={t((s) => s.ontdek.verderLezenLegeTitel)}
                beschrijving={t((s) => s.ontdek.verderLezenLegeBeschrijving)}
              />
            ) : (
              <HorizontaleRij
                data={verderLezen}
                keyExtractor={(verhaal) => verhaal.id}
                itemBreedte={CardDimensions.portraitWidth}
                contentContainerStyle={styles.rij}
                renderItem={({ item }) => (
                  <VerhaalKaart
                    verhaal={item}
                    gelezen={gelezenIds.has(item.id)}
                    onPress={() => openVerhaal(item.id)}
                  />
                )}
              />
            )}
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.ontdek.verhaallijnen)} />
            <HorizontaleRij
              data={collecties}
              keyExtractor={(collectie) => collectie.id}
              itemBreedte={CardDimensions.portraitWidth}
              contentContainerStyle={styles.rij}
              renderItem={({ item }) => (
                <CollectieKaart
                  collectie={item}
                  onPress={() => router.push({ pathname: '/collectie/[id]', params: { id: item.id } })}
                />
              )}
            />
          </View>

          {getActieveTijdperken().map((tijdperk) => (
            <TijdperkRij
              key={tijdperk.id}
              tijdperk={tijdperk}
              verhalen={getUitgelichteVerhalenVoorTijdperk(tijdperk.id)}
              gelezenIds={gelezenIds}
              onPressVerhaal={openVerhaal}
              onPressOntdekMeer={() => router.push({ pathname: '/tijdperk/[id]', params: { id: tijdperk.id } })}
            />
          ))}

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.ontdek.nieuwToegevoegd)} />
            <HorizontaleRij
              data={nieuwToegevoegd}
              keyExtractor={(verhaal) => verhaal.id}
              itemBreedte={CardDimensions.portraitWidth}
              contentContainerStyle={styles.rij}
              renderItem={({ item }) => (
                <VerhaalKaart
                  verhaal={item}
                  gelezen={gelezenIds.has(item.id)}
                  onPress={() => openVerhaal(item.id)}
                />
              )}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.button,
  },
  hero: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
    gap: Spacing.two,
  },
  heroTitel: {
    marginTop: Spacing.one,
  },
  heroKnop: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
  sectie: {
    gap: Spacing.three,
  },
  rij: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
