import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useStreak } from '@/hooks/use-streak';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { useAuthStore } from '@/store/auth-store';
import { avatarBron, useProfileStore } from '@/store/profile-store';

const AVATAR_FORMAAT = 104;

/**
 * De kop van Profiel: avatar, naam, e-mailadres en de streak.
 *
 * De streak staat hier en niet alleen op Voortgang omdat dit het scherm is waar je jezelf
 * bekijkt — en hij komt uit `useStreak()`, niet uit `voortgangStore.streakDagen`: die opgeslagen
 * waarde weet niet dat er sinds gisteren een dag voorbij is (LAUNCH-PLAN.md B6). Bij een streak
 * van 0 verdwijnt het label helemaal; "0 dagen" is geen prestatie om te tonen.
 */
export function ProfileHeader() {
  const theme = useTheme();
  const { t } = useVertaling();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authProfiel = useAuthStore((state) => state.profiel);
  const avatar = useProfileStore((state) => state.avatar);
  const streak = useStreak();

  /**
   * Een gekozen foto is een pad naar een bestand op dit toestel, en dat kan weg zijn — Android
   * ruimt de cache van een app op wanneer het de ruimte nodig heeft. Dan valt de cirkel terug op
   * het standaardicoon in plaats van een grijs vlak te tonen. De keuze zelf blijft staan: hem
   * hier wissen zou de gebruiker zijn avatar afnemen op grond van één mislukte render.
   */
  const [afbeeldingKapot, setAfbeeldingKapot] = useState(false);
  const bron = avatarBron(avatar);
  const toonAfbeelding = bron !== null && !afbeeldingKapot;

  // De gebruikersnaam komt uit de `profiles`-rij; staat die er nog niet (net geregistreerd, rij
  // wordt bij de eerste echte login aangemaakt), dan rijdt hij mee in `user_metadata`.
  const metadataNaam =
    typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : null;
  const naam = authProfiel?.username ?? metadataNaam ?? user?.email ?? t((s) => s.profiel.naamloos);
  const toonEmail = user?.email && user.email !== naam ? user.email : null;

  return (
    <View style={styles.container}>
      <View style={styles.avatarVak}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected, borderColor: theme.accent }]}>
          {toonAfbeelding ? (
            <Image
              source={bron}
              style={styles.avatarAfbeelding}
              contentFit="cover"
              transition={200}
              onError={() => setAfbeeldingKapot(true)}
            />
          ) : (
            <Ionicons name="person" size={48} color={theme.accent} />
          )}
        </View>
        <AnimatedPressable
          onPress={() => router.push('/profiel/upload-avatar')}
          accessibilityRole="button"
          accessibilityLabel={t((s) => s.profiel.avatarWijzigen)}
          style={[styles.cameraKnop, { backgroundColor: theme.accent, borderColor: theme.background }]}>
          <Ionicons name="camera" size={16} color={theme.background} />
        </AnimatedPressable>
      </View>

      <View style={styles.tekst}>
        <ThemedText type="title" numberOfLines={1}>
          {naam}
        </ThemedText>
        {toonEmail ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {toonEmail}
          </ThemedText>
        ) : null}
      </View>

      {streak > 0 && (
        <View style={[styles.streak, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="flame" size={14} color={theme.accent} />
          <ThemedText type="smallBold">{t((s) => s.voortgang.streak)(streak)}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  avatarVak: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR_FORMAAT,
    height: AVATAR_FORMAAT,
    borderRadius: AVATAR_FORMAAT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarAfbeelding: {
    width: '100%',
    height: '100%',
  },
  cameraKnop: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    // Rand in de achtergrondkleur, zodat de knop losstaat van de portretrand eronder.
    borderWidth: 2,
  },
  tekst: {
    alignItems: 'center',
    gap: Spacing.half,
    maxWidth: '100%',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.button,
  },
});
