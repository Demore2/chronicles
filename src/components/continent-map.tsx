import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { continentBounds, countryPaths } from '@/constants/map-data';
import { regios } from '@/constants/regios';
import { useTheme } from '@/hooks/use-theme';
import { useVertaling } from '@/hooks/use-vertaling';

export type GeselecteerdeRegio = {
  naam: string;
  iso2: string;
  regioId: string | null;
  actief: boolean;
};

export function ContinentMap({
  continentId,
  onSelectRegio,
}: {
  continentId: string;
  onSelectRegio: (regio: GeselecteerdeRegio) => void;
}) {
  const theme = useTheme();
  const { v } = useVertaling();
  const [pressedId, setPressedId] = useState<string | null>(null);

  const landenOpKaart = useMemo(
    () => countryPaths.filter((country) => country.continentId === continentId),
    [continentId]
  );

  const regioByIso2 = useMemo(() => new Map(regios.map((regio) => [regio.iso2, regio])), []);

  const bounds = continentBounds[continentId];

  return (
    <Svg viewBox={bounds?.join(' ')} style={styles.svg}>
      {landenOpKaart.map((country) => {
        const bekendeRegio = regioByIso2.get(country.iso2);
        const actief = bekendeRegio?.actief ?? false;
        const isPressed = pressedId === country.id;

        return (
          <Path
            key={country.id}
            d={country.d}
            fill={actief ? theme.accent : theme.inactive}
            fillOpacity={isPressed ? 0.65 : actief ? 1 : 0.5}
            stroke={theme.background}
            strokeWidth={0.5}
            onPressIn={() => setPressedId(country.id)}
            onPressOut={() => setPressedId(null)}
            onPress={() =>
              onSelectRegio({
                naam: bekendeRegio ? v(bekendeRegio.naam) : country.naam,
                iso2: country.iso2,
                regioId: bekendeRegio?.id ?? null,
                actief,
              })
            }
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    width: '100%',
    height: '100%',
  },
});
