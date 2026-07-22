import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing, withAlpha } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BREEDTE_DREMPEL = 768;
const SCROLL_DREMPEL = 4;

type HorizontaleRijProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: FlatListProps<T>['renderItem'];
  itemBreedte: number;
  gap?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function HorizontaleRij<T>({
  data,
  keyExtractor,
  renderItem,
  itemBreedte,
  gap = Spacing.three,
  contentContainerStyle,
  style,
}: HorizontaleRijProps<T>) {
  const theme = useTheme();
  const { width: schermBreedte } = useWindowDimensions();
  const lijstRef = useRef<FlatList<T>>(null);

  const [scrollX, setScrollX] = useState(0);
  const [layoutBreedte, setLayoutBreedte] = useState(0);
  const [inhoudBreedte, setInhoudBreedte] = useState(0);

  const toonPijlen = schermBreedte > BREEDTE_DREMPEL;
  const kanNaarLinks = toonPijlen && scrollX > SCROLL_DREMPEL;
  const kanNaarRechts = toonPijlen && scrollX < inhoudBreedte - layoutBreedte - SCROLL_DREMPEL;
  const stap = itemBreedte + gap;

  function scrollNaarLinks() {
    const nieuweOffset = Math.max(0, scrollX - stap);
    lijstRef.current?.scrollToOffset({ offset: nieuweOffset, animated: true });
  }

  function scrollNaarRechts() {
    const maxOffset = Math.max(0, inhoudBreedte - layoutBreedte);
    const nieuweOffset = Math.min(maxOffset, scrollX + stap);
    lijstRef.current?.scrollToOffset({ offset: nieuweOffset, animated: true });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollX(event.nativeEvent.contentOffset.x);
  }

  return (
    <View style={[styles.wrapper, style]}>
      <FlatList
        ref={lijstRef}
        horizontal
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={(event) => setLayoutBreedte(event.nativeEvent.layout.width)}
        onContentSizeChange={(width) => setInhoudBreedte(width)}
      />
      {kanNaarLinks && (
        <View style={[styles.pijlKolom, styles.pijlKolomLinks]} pointerEvents="box-none">
          <Pressable
            onPress={scrollNaarLinks}
            hitSlop={8}
            style={[styles.pijlCirkel, { backgroundColor: withAlpha(theme.backgroundElement, 0.85) }]}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
        </View>
      )}
      {kanNaarRechts && (
        <View style={[styles.pijlKolom, styles.pijlKolomRechts]} pointerEvents="box-none">
          <Pressable
            onPress={scrollNaarRechts}
            hitSlop={8}
            style={[styles.pijlCirkel, { backgroundColor: withAlpha(theme.backgroundElement, 0.85) }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
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
});
