import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { JURIDISCH_BIJGEWERKT, type JuridischeAlinea } from '@/constants/juridische-teksten';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * De opmaak die de voorwaarden en het privacybeleid delen (`app/profiel/terms.tsx` en
 * `app/profiel/privacy.tsx`).
 *
 * Eén component in plaats van twee bijna gelijke schermen: als er ooit een derde document bij
 * komt — of als de datumregel verandert — is dit de enige plek. De schermen zelf blijven daardoor
 * drie regels lang en zeggen alleen wélk document ze tonen.
 *
 * De titel in de kopbalk komt uit i18n en staat dus vertaald boven een Engelse tekst; dat is
 * bewust, zie de kop van `constants/juridische-teksten.ts`.
 *
 * Geen `AdBanner` en geen andere onderbreking op deze twee schermen: dit is de tekst waarnaar
 * iemand op zoek gaat als hij twijfelt over wat de app met zijn gegevens doet, en dat is het
 * slechtst denkbare moment voor een advertentie of een aanbod.
 *
 * **`webUrl` is de gepubliceerde kopie, niet de bron.** De tekst hierboven zit in de bundel en
 * werkt offline; deze regel is er voor wie hem buiten de app wil lezen of doorsturen — en omdat
 * Play het privacybeleid op een bereikbare URL wil zien. De regel verschijnt alleen als de URL
 * echt gepubliceerd is (`privacyBeleidIsGepubliceerd` / `voorwaardenZijnGepubliceerd`), zodat er
 * nooit een dode link onder de tekst staat; is dat niet zo, dan laat het scherm hem gewoon weg en
 * blijft de tekst zelf gewoon leesbaar.
 */
export function JuridischePagina({
  titel,
  alineas,
  webUrl,
}: {
  titel: string;
  alineas: JuridischeAlinea[];
  webUrl?: string;
}) {
  const theme = useTheme();
  const { t } = useVertaling();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.kop}>
          <ThemedText type="title">{titel}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {`Last updated: ${JURIDISCH_BIJGEWERKT}`}
          </ThemedText>
        </View>

        <View style={[styles.kaart, { backgroundColor: theme.backgroundElement }]}>
          {alineas.map((alinea) => (
            // De alineatekst is de sleutel: er zijn er een handvol en ze zijn per definitie
            // uniek, dus een index als sleutel zou hier alleen maar minder zeggen.
            <ThemedText key={alinea.tekst} type="body">
              {alinea.label ? (
                <ThemedText type="bodyBold">{`${alinea.label}: `}</ThemedText>
              ) : null}
              {alinea.tekst}
            </ThemedText>
          ))}
        </View>

        {webUrl ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              // Zelfde afspraak als elders in de app: een mislukte `openURL` (geen browser, of een
              // schema dat het toestel niet kent) mag geen onafgevangen belofte opleveren. De tekst
              // staat hierboven al, dus er valt niets te melden.
              Linking.openURL(webUrl).catch(() => {});
            }}
            style={styles.webLink}
          >
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t((s) => s.instellingen.bekijkOnline)}
            </ThemedText>
            <Ionicons name="open-outline" size={14} color={theme.accent} />
          </Pressable>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  kop: {
    gap: Spacing.one,
  },
  kaart: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: Radii.card,
  },
  webLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
