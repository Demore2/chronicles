import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { JURIDISCH_BIJGEWERKT, type JuridischeAlinea } from '@/constants/juridische-teksten';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
 */
export function JuridischePagina({
  titel,
  alineas,
}: {
  titel: string;
  alineas: JuridischeAlinea[];
}) {
  const theme = useTheme();

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
});
