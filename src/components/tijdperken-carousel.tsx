import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, withAlpha } from '@/constants/theme';
import type { Tijdperk } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

const BREEDTE_DREMPEL = 768;
const KAART_ASPECT_RATIO = 3 / 4;

export function TijdperkenCarousel({
  tijdperken,
  onPress,
}: {
  tijdperken: Tijdperk[];
  onPress: (tijdperk: Tijdperk) => void;
}) {
  const theme = useTheme();
  const { v } = useVertaling();
  const { width: schermBreedte } = useWindowDimensions();

  const kaartBreedte = Math.min(schermBreedte * 0.6, 240);
  const kaartHoogte = kaartBreedte / KAART_ASPECT_RATIO;
  const stap = kaartBreedte + Spacing.three;

  const [containerBreedte, setContainerBreedte] = useState(schermBreedte);
  const [actieveIndex, setActieveIndex] = useState(0);
  // `useRef(new Animated.Value(0)).current` las een ref tijdens de render, wat
  // `react-hooks/refs` terecht afkeurt — en het maakte bij élke render een `Animated.Value` aan
  // die meteen werd weggegooid. De lazy initializer van `useState` doet het één keer en geeft
  // dezelfde stabiele waarde terug; de setter is niet nodig, de waarde wisselt nooit.
  const [scrollX] = useState(() => new Animated.Value(0));
  const lijstRef = useRef<Animated.FlatList<Tijdperk>>(null);

  const zijPadding = Math.max(0, (containerBreedte - kaartBreedte) / 2);
  const toonPijlen = schermBreedte > BREEDTE_DREMPEL;

  function scrollNaarIndex(index: number) {
    const clamped = Math.min(tijdperken.length - 1, Math.max(0, index));
    lijstRef.current?.scrollToOffset({ offset: clamped * stap, animated: true });
    setActieveIndex(clamped);
  }

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / stap);
    setActieveIndex(Math.min(tijdperken.length - 1, Math.max(0, index)));
  }

  return (
    <View>
      <View style={styles.kaartenWrapper} onLayout={(e) => setContainerBreedte(e.nativeEvent.layout.width)}>
        <Animated.FlatList
          ref={lijstRef}
          data={tijdperken}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={stap}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: zijPadding }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderItem={({ item, index }) => {
            const inputRange = [(index - 1) * stap, index * stap, (index + 1) * stap];
            const schaal = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: 'clamp',
            });
            const dekking = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={{
                  width: kaartBreedte,
                  marginRight: index === tijdperken.length - 1 ? 0 : Spacing.three,
                  transform: [{ scale: schaal }],
                  opacity: dekking,
                }}>
                <Pressable
                  onPress={() => onPress(item)}
                  style={[styles.kaart, { height: kaartHoogte, backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.kleurvlak, { backgroundColor: item.kleur }]}>
                    <Ionicons name="time-outline" size={48} color="#FFFFFF" />
                  </View>
                  <View style={styles.tekstArea}>
                    <ThemedText type="subtitle" numberOfLines={2}>
                      {v(item.titel)}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {v(item.periode)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
                      {v(item.korteBeschrijving)}
                    </ThemedText>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
        />
        {toonPijlen && actieveIndex > 0 && (
          <View style={[styles.pijlKolom, styles.pijlKolomLinks]} pointerEvents="box-none">
            <Pressable
              onPress={() => scrollNaarIndex(actieveIndex - 1)}
              hitSlop={8}
              style={[styles.pijlCirkel, { backgroundColor: withAlpha(theme.backgroundElement, 0.85) }]}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </Pressable>
          </View>
        )}
        {toonPijlen && actieveIndex < tijdperken.length - 1 && (
          <View style={[styles.pijlKolom, styles.pijlKolomRechts]} pointerEvents="box-none">
            <Pressable
              onPress={() => scrollNaarIndex(actieveIndex + 1)}
              hitSlop={8}
              style={[styles.pijlCirkel, { backgroundColor: withAlpha(theme.backgroundElement, 0.85) }]}>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.stippenRij}>
        {tijdperken.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.stip,
              index === actieveIndex ? styles.stipActief : undefined,
              { backgroundColor: index === actieveIndex ? theme.accent : theme.inactive },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kaartenWrapper: {
    position: 'relative',
  },
  kaart: {
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  kleurvlak: {
    height: '58%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tekstArea: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  pijlKolom: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  pijlKolomLinks: {
    left: 0,
  },
  pijlKolomRechts: {
    right: 0,
  },
  pijlCirkel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  stippenRij: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  stip: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stipActief: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
