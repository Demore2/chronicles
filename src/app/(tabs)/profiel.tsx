import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackModal } from '@/components/feedback-modal';
import { ProAccessBanner } from '@/components/pro-access-banner';
import { ProfileCharacterCollection } from '@/components/profile-character-collection';
import { ProfileHeader } from '@/components/profile-header';
import { PrestatieRaster } from '@/components/prestatie-raster';
import { ProfileStats } from '@/components/profile-stats';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * Profiel: wie je bent, wat je hebt gelezen en wie je hebt vrijgespeeld.
 *
 * **De instellingen staan hier niet meer.** Thema, taal, de dagelijkse herinnering, het
 * privacybeleid, de synchronisatiestatus en uitloggen zijn verhuisd naar `/profiel/settings` —
 * dit scherm gaat over voortgang, dat scherm over knoppen. Er is niets weggevallen: elke
 * instelling die hier stond werkt daar precies zo.
 *
 * Dit bestand is bewust `(tabs)/profiel.tsx` gebleven in plaats van `(tabs)/profiel/index.tsx`
 * te worden. Verwijderen kan niet in dit project (zie CLAUDE.md), en zolang het oude bestand
 * blijft bestaan zouden beide dezelfde route `/profiel` opeisen — Expo Router struikelt daarover.
 * De twee nieuwe schermen staan daarom onder `src/app/profiel/` en pushen als stack-scherm over
 * de tabbladen heen, net als `verhaal/[id]`.
 */
export default function ProfielScreen() {
  const theme = useTheme();
  const { t } = useVertaling();
  const router = useRouter();

  /**
   * Het spreekwolkje opent nu een venster in de app in plaats van een mailprogramma. Dat scheelt
   * de gebruiker een contextwissel, en het werkt óók op een toestel zonder mailclient en zonder
   * dat `SUPPORT_EMAIL` is ingevuld — het bericht gaat naar Supabase (zie `feedback-modal.tsx`).
   * "Contact support" in Instellingen blijft wél een mailto: dat is een gesprek, dit is een
   * melding.
   */
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBalk}>
            <ThemedText type="display" style={styles.titel}>
              {t((s) => s.profiel.titel)}
            </ThemedText>
            <Pressable
              onPress={() => setFeedbackOpen(true)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t((s) => s.profiel.feedbackOpenen)}
              style={styles.icoonKnop}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/profiel/settings')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t((s) => s.profiel.instellingenOpenen)}
              style={styles.icoonKnop}>
              <Ionicons name="settings-outline" size={22} color={theme.text} />
            </Pressable>
          </View>

          <ProfileHeader />
          <ProfileStats />
          <ProfileCharacterCollection />
          {/* De mijlpalen ná de personages: die zijn de beloning, dit is de meetlat ernaast. */}
          <PrestatieRaster />
        </ScrollView>

        {/* Staat buiten de ScrollView zodat hij blijft plakken. Rendert `null` zodra
            `PRO_BANNER_ENABLED` uit gaat — zie `pro-access-banner.tsx`. */}
        <ProAccessBanner />
      </SafeAreaView>

      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
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
  topBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  titel: {
    flex: 1,
  },
  icoonKnop: {
    padding: Spacing.one,
  },
});
