import { useEffect, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import HistoraMark from '@/assets/images/mascotte/histora-mark.svg';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';
import { ThemedText } from './themed-text';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const theme = useTheme();
  const { t } = useVertaling();
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(onFinish);
    }, 2500);

    return () => clearTimeout(timer);
  }, [opacity, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          opacity,
        },
      ]}>
      <View style={styles.content}>
        {/*
          Het merk heeft vaste kleuren en volgt `theme.accent` dus niet meer — een
          merkteken is in beide thema's één kleur, en #0EA5E9 draagt zowel op het
          beige #F7F1E4 als op het donkerbruine #1C1A16.
        */}
        <View style={styles.logoContainer}>
          {/* De schijf vult ~85% van zijn eigen canvas (de boekversie ~53%), dus 96
              op de tekening levert optisch zo'n 80 px inkt — in balans met de 32 px
              titel. Vergroten naar 132 laat het merk over de titel heen domineren. */}
          <HistoraMark width={96} height={96} />
        </View>

        {/*
          De merknaam. Hij komt uit i18n (`app.name`) zodat hij op één plek staat en niet
          in elk scherm opnieuw wordt overgetypt, maar hij is gelijk in alle vier de talen —
          een merknaam vertaal je niet. De hoofdletters zitten in de weergave en niet in de
          sleutel, want dezelfde sleutel wordt elders in normale schrijfwijze getoond.
        */}
        <ThemedText type="display" style={styles.title}>
          {t((s) => s.app.name).toUpperCase()}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {t((s) => s.splash.ondertitel)}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 200,
  },
});
