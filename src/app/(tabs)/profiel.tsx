import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterGrid } from '@/components/character-grid';
import { SectieKop } from '@/components/sectie-kop';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import type { IoniconNaam } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { taalCodes, taalNamen } from '@/i18n/taal-namen';
import { verhalen } from '@/content/verhalen';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { useVoortgangStore } from '@/store/voortgang-store';
import { useThemaStore, type ThemaVoorkeur } from '@/store/thema-store';

const THEMA_OPTIES: { waarde: ThemaVoorkeur; icoonNaam: IoniconNaam }[] = [
  { waarde: 'licht', icoonNaam: 'sunny-outline' },
  { waarde: 'donker', icoonNaam: 'moon-outline' },
  { waarde: 'systeem', icoonNaam: 'phone-portrait-outline' },
];

const THEMA_LABEL_SLEUTEL = {
  licht: 'themaLicht',
  donker: 'themaDonker',
  systeem: 'themaSysteem',
} as const;

export default function ProfielScreen() {
  const theme = useTheme();
  const { t, taal, setTaal } = useVertaling();
  const themaVoorkeur = useThemaStore((state) => state.themaVoorkeur);
  const setThemaVoorkeur = useThemaStore((state) => state.setThemaVoorkeur);
  const characterStore = useCharacterUnlockStore();
  const voortgangStore = useVoortgangStore();

  const totalCharacters = verhalen.length;
  const charactersUnlocked = characterStore.getTotalUnlocked();
  const unlockedCharacters = characterStore.unlockedCharacters;
  const chaptersRead = voortgangStore.bekekenIds.size;
  const storiesCompleted = voortgangStore.completedStories.size;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <ThemedText type="display">{t((s) => s.profiel.titel)}</ThemedText>
          </View>

          <View style={[styles.statsBox, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {chaptersRead}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.chaptersRead)}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {charactersUnlocked}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.charactersUnlocked)}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="display" style={{ color: theme.accent }}>
                  {storiesCompleted}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t((s) => s.profiel.storiesCompleted)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.profiel.characterCollection)} />
            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <CharacterGrid unlockedCharacters={unlockedCharacters} totalCharacters={totalCharacters} />
            </View>
          </View>

          <View style={styles.sectie}>
            <SectieKop titel={t((s) => s.profiel.instellingen)} />
            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">{t((s) => s.profiel.thema)}</ThemedText>
              <View style={styles.themaRij}>
                {THEMA_OPTIES.map((optie) => {
                  const actief = themaVoorkeur === optie.waarde;
                  return (
                    <Pressable
                      key={optie.waarde}
                      onPress={() => setThemaVoorkeur(optie.waarde)}
                      style={[
                        styles.themaKnop,
                        { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                      ]}>
                      <Ionicons name={optie.icoonNaam} size={20} color={actief ? theme.background : theme.text} />
                      <ThemedText type="small" style={{ color: actief ? theme.background : theme.text }}>
                        {t((s) => s.profiel[THEMA_LABEL_SLEUTEL[optie.waarde]])}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">{t((s) => s.profiel.taal)}</ThemedText>
              <View style={styles.taalRij}>
                {taalCodes.map((code) => {
                  const actief = taal === code;
                  return (
                    <Pressable
                      key={code}
                      onPress={() => setTaal(code)}
                      style={[
                        styles.taalKnop,
                        { backgroundColor: actief ? theme.accent : theme.backgroundSelected },
                      ]}>
                      <ThemedText type="small" style={{ color: actief ? theme.background : theme.text }}>
                        {taalNamen[code]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
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
  statsBox: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.three,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectie: {
    gap: Spacing.three,
  },
  kaart: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radii.card,
    gap: Spacing.three,
  },
  themaRij: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themaKnop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: Radii.button,
  },
  taalRij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  taalKnop: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
