import { useEffect, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const theme = useTheme();
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
        {/* Hourglass logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.hourglass, { borderColor: theme.text }]}>
            <View style={[styles.chamber, { backgroundColor: theme.accent }]} />
            <View style={[styles.sand, { backgroundColor: '#A67C52' }]} />
            <View style={[styles.chamber, { backgroundColor: theme.accent }]} />
          </View>
        </View>

        {/* App name */}
        <ThemedText type="display" style={styles.title}>
          HISTORY
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Discover the Stories That Shaped Our World
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
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourglass: {
    width: 70,
    height: 70,
    borderWidth: 2.5,
    borderRadius: 8,
    justifyContent: 'space-between',
    padding: 8,
    alignItems: 'center',
  },
  chamber: {
    width: '100%',
    height: 12,
    borderRadius: 4,
  },
  sand: {
    width: 4,
    height: 20,
    borderRadius: 2,
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
