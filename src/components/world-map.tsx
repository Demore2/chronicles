import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MAP_VIEWBOX, countryPaths } from '@/constants/map-data';
import { regios } from '@/constants/regios';
import { getRegioVoortgang } from '@/content/queries';
import { useTheme } from '@/hooks/use-theme';
import { useVoortgangStore } from '@/store/voortgang-store';

const [, , VIEWBOX_WIDTH, VIEWBOX_HEIGHT] = MAP_VIEWBOX.split(' ').map(Number);
const VIEWBOX_ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT;

export function WorldMap() {
  const router = useRouter();
  const theme = useTheme();
  const gelezenIds = useVoortgangStore((state) => state.gelezenIds);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  const voortgangByIso2 = useMemo(() => {
    const map = new Map<string, { regioId: string; totaal: number; gelezen: number }>();
    for (const regio of regios) {
      const { totaal, gelezen } = getRegioVoortgang(regio.id, gelezenIds);
      map.set(regio.iso2, { regioId: regio.id, totaal, gelezen });
    }
    return map;
  }, [gelezenIds]);

  let svgWidth = containerSize.width;
  let svgHeight = svgWidth / VIEWBOX_ASPECT_RATIO;
  if (svgHeight > containerSize.height && containerSize.height > 0) {
    svgHeight = containerSize.height;
    svgWidth = svgHeight * VIEWBOX_ASPECT_RATIO;
  }

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {svgWidth > 0 && svgHeight > 0 && (
        <Svg viewBox={MAP_VIEWBOX} width={svgWidth} height={svgHeight}>
          {countryPaths.map((country) => {
            const info = voortgangByIso2.get(country.iso2);
            const heeftVerhalen = (info?.totaal ?? 0) > 0;
            const isPressed = pressedId === country.id;

            let fillOpacity = 0.4;
            if (heeftVerhalen && info) {
              const fractieGelezen = info.gelezen / info.totaal;
              fillOpacity = fractieGelezen >= 1 ? 1 : fractieGelezen > 0 ? 0.75 : 0.45;
            }
            if (isPressed) fillOpacity = Math.min(fillOpacity, 0.6);

            return (
              <Path
                key={country.id}
                d={country.d}
                fill={heeftVerhalen ? theme.accent : theme.inactive}
                fillOpacity={fillOpacity}
                stroke={theme.background}
                strokeWidth={0.5}
                onPressIn={() => heeftVerhalen && setPressedId(country.id)}
                onPressOut={() => setPressedId(null)}
                onPress={() => {
                  if (!heeftVerhalen || !info) return;
                  router.push({ pathname: '/regio/[id]', params: { id: info.regioId } });
                }}
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
