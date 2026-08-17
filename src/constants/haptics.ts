import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptische feedback (LAUNCH-PLAN.md B4). Eén wrapper met bedoelingen in plaats van
// `impactAsync(Light)`-aanroepen door de schermen heen, om drie redenen:
//
// 1. **Web.** `expo-haptics` is daar een no-op, maar we roepen 'm niet eens aan.
// 2. **Android.** `impactAsync`/`notificationAsync` simuleren daar met de `Vibrator`-API; Expo
//    raadt `performAndroidHapticsAsync` aan, dat de systeem-HapticFeedbackConstants gebruikt en
//    dus voelt zoals de rest van het toestel. Android is ons v1.0-doel, dus die tak is de echte.
// 3. **Nooit fataal.** Een toestel zonder trilmotor of met haptics uit mag geen interactie breken,
//    dus alles is fire-and-forget met een gesmoorde `catch`.

const ondersteund = Platform.OS === 'ios' || Platform.OS === 'android';

function veilig(actie: () => Promise<void>) {
  if (!ondersteund) return;
  try {
    actie().catch(() => {});
  } catch {
    // Ook een synchrone throw (module niet gelinkt) mag niets breken.
  }
}

export const haptics = {
  /** Lichte tik: een tegel of knop aanraken. */
  tik: () =>
    veilig(() =>
      Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    ),

  /** Hoofdstuk voltooid — bevestiging, geen beloning. */
  succes: () =>
    veilig(() =>
      Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    ),

  /** Personage ontgrendeld — de zwaarste in de app, dit is het beloningsmoment. */
  ontgrendeld: () =>
    veilig(() =>
      Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    ),
};
