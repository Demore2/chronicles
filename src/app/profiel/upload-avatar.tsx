import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { meld } from '@/constants/dialoog';
import { Radii, Spacing } from '@/constants/theme';
import { getVerhaal } from '@/content/verhalen';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useCharacterUnlockStore } from '@/store/character-unlock-store';
import { useProfileStore } from '@/store/profile-store';

const PORTRET_FORMAAT = 76;

/**
 * De avatarkiezer (`/profiel/upload-avatar`, als modal).
 *
 * Twee bronnen naast elkaar, met opzet in deze volgorde. Bovenaan de portretten die je hebt
 * vrijgespeeld: die zitten al in de bundel, gaan straks mee naar een tweede toestel en zijn de
 * enige avatar die je in deze app moet *verdienen* — dat is het punt van de collectie. Daaronder
 * een eigen foto, die alleen op dit toestel bestaat.
 *
 * Wie nog niets heeft vrijgespeeld ziet geen leeg raster maar de reden waarom het leeg is.
 */
export default function AvatarScreen() {
  const theme = useTheme();
  const { t } = useVertaling();
  const router = useRouter();

  const unlockedCharacters = useCharacterUnlockStore((state) => state.unlockedCharacters);
  const avatar = useProfileStore((state) => state.avatar);
  const kiesPersonage = useProfileStore((state) => state.kiesPersonage);
  const kiesFoto = useProfileStore((state) => state.kiesFoto);
  const wisAvatar = useProfileStore((state) => state.wisAvatar);

  /**
   * Opent de galerij van het toestel.
   *
   * Geen aparte toestemmingsvraag: `launchImageLibraryAsync` gebruikt op Android de systeemkiezer
   * (die geeft de app alleen het gekozen bestand, dus er valt niets te vragen) en regelt op iOS
   * zijn eigen toegang. Vierkant bijsnijden omdat de avatar altijd een cirkel is — dan bepaalt de
   * gebruiker welk deel in beeld komt in plaats van een `contentFit`-regel.
   */
  async function kiesUitGalerij() {
    try {
      const resultaat = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (resultaat.canceled) return;

      const uri = resultaat.assets[0]?.uri;
      if (!uri) return;

      kiesFoto(uri);
      router.back();
    } catch {
      // Een geweigerde galerij of een toestel zonder fotokiezer mag het scherm niet laten klappen.
      meld(
        t((s) => s.avatar.titel),
        t((s) => s.avatar.fotoMislukt),
        t((s) => s.instellingen.ok),
      );
    }
  }

  function kiesEnSluit(verhaalId: string) {
    kiesPersonage(verhaalId);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t((s) => s.avatar.titel) }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.ondertitel}>
          {t((s) => s.avatar.ondertitel)}
        </ThemedText>

        <View style={styles.sectie}>
          <ThemedText type="smallBold" style={styles.sectieTitel}>
            {t((s) => s.avatar.personages)}
          </ThemedText>

          {unlockedCharacters.length === 0 ? (
            <View style={[styles.leeg, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.legeTekst}>
                {t((s) => s.avatar.personagesLeeg)}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.raster}>
              {unlockedCharacters.map((personage) => {
                const verhaal = getVerhaal(personage.verhaalId);
                if (!verhaal) return null;

                const gekozen =
                  avatar?.soort === 'personage' && avatar.verhaalId === personage.verhaalId;

                return (
                  <AnimatedPressable
                    key={personage.verhaalId}
                    onPress={() => kiesEnSluit(personage.verhaalId)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: gekozen }}
                    accessibilityLabel={personage.personageNaam}
                    style={styles.portretVak}>
                    <View
                      style={[
                        styles.portret,
                        {
                          backgroundColor: theme.backgroundSelected,
                          borderColor: gekozen ? theme.accent : 'transparent',
                        },
                      ]}>
                      {verhaal.afbeelding ? (
                        <Image
                          source={verhaal.afbeelding}
                          style={styles.portretAfbeelding}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <ThemedText type="title" style={{ color: theme.accent }}>
                          {personage.personageNaam[0]?.toUpperCase() ?? '?'}
                        </ThemedText>
                      )}
                      {gekozen && (
                        <View style={[styles.vinkje, { backgroundColor: theme.background }]}>
                          <Ionicons name="checkmark" size={12} color={theme.accent} />
                        </View>
                      )}
                    </View>
                    {/* De naam van het personage, niet de verhaaltitel: je kiest hier wie je
                        draagt, en dat is "Cleopatra", niet "The Last Pharaoh". */}
                    <ThemedText type="small" numberOfLines={2} style={styles.portretNaam}>
                      {personage.personageNaam}
                    </ThemedText>
                  </AnimatedPressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectie}>
          <AnimatedPressable
            onPress={kiesUitGalerij}
            accessibilityRole="button"
            style={[styles.knop, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="image-outline" size={20} color={theme.accent} />
            <View style={styles.knopTekst}>
              <ThemedText type="body">{t((s) => s.avatar.fotoKiezen)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t((s) => s.avatar.fotoUitleg)}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.inactive} />
          </AnimatedPressable>

          {avatar !== null && (
            <AnimatedPressable
              onPress={() => {
                wisAvatar();
                router.back();
              }}
              haptisch={false}
              accessibilityRole="button"
              style={[styles.knop, styles.wisKnop, { borderColor: theme.gevaar }]}>
              <Ionicons name="trash-outline" size={18} color={theme.gevaar} />
              <ThemedText type="smallBold" themeColor="gevaar">
                {t((s) => s.avatar.verwijderen)}
              </ThemedText>
            </AnimatedPressable>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  ondertitel: {
    paddingHorizontal: Spacing.four,
  },
  sectie: {
    gap: Spacing.three,
  },
  sectieTitel: {
    paddingHorizontal: Spacing.four,
  },
  raster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  portretVak: {
    alignItems: 'center',
    width: PORTRET_FORMAAT,
    gap: Spacing.two,
  },
  portret: {
    width: PORTRET_FORMAAT,
    height: PORTRET_FORMAAT,
    borderRadius: PORTRET_FORMAAT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Rand staat er altijd, ook doorzichtig: anders verspringt het raster zodra je iets kiest.
    borderWidth: 2,
    overflow: 'hidden',
  },
  portretAfbeelding: {
    width: '100%',
    height: '100%',
  },
  vinkje: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: Spacing.half,
  },
  portretNaam: {
    fontSize: 11,
    textAlign: 'center',
  },
  leeg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  legeTekst: {
    flex: 1,
  },
  knop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radii.card,
  },
  knopTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  wisKnop: {
    justifyContent: 'center',
    borderWidth: 1,
  },
});
