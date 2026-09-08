import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#211F1A',
    textSecondary: '#6B6355',
    background: '#F7F1E4',
    backgroundElement: '#EEE4D0',
    backgroundSelected: '#E3D6B8',
    accent: '#3B6E7D',
    inactive: '#B7AE99',
    // Semantische kleuren (R8.AUTH deel 2): formulierfouten, wachtwoordsterkte, uitloggen.
    // Bewust gedempt — een schreeuwend #FF0000 hoort niet in dit beige palet.
    gevaar: '#A8322A',
    waarschuwing: '#9A6B14',
    succes: '#3F7A4B',
    // Vier accenten voor de tellers op Voortgang. Ze staan hier en niet in de component, om
    // dezelfde reden als hierboven: een hardgecodeerde hex in een scherm heeft geen donkere
    // tegenhanger, en dan leest een gekleurde kaart in donkere modus als een lichtvlek. De tinten
    // zijn bewust uit hetzelfde warme palet gekozen als de tijdperkkleuren, niet uit een
    // standaard materialpalet.
    statStreak: '#C2703C',
    statHoofdstuk: '#3B6E7D',
    statVerhaal: '#A8842E',
    statPersonage: '#5C7A5E',
  },
  dark: {
    text: '#F3ECDC',
    textSecondary: '#A89E89',
    background: '#1C1A16',
    backgroundElement: '#26231D',
    backgroundSelected: '#332E24',
    accent: '#6FA8B8',
    inactive: '#54503F',
    gevaar: '#E08A80',
    waarschuwing: '#D9AE5F',
    succes: '#7FB98B',
    statStreak: '#D9905E',
    statHoofdstuk: '#6FA8B8',
    statVerhaal: '#D9AE5F',
    statPersonage: '#7FB98B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  card: 16,
  button: 12,
  small: 8,
} as const;

/**
 * Maximale breedte van een leeskolom, in dp.
 *
 * De app is op een telefoon ontworpen en staat in `app.json` op `orientation: 'portrait'`, maar dat
 * slot geldt sinds Android 16 (API 36) niet meer op grote schermen: bij `sw >= 600dp` negeert het
 * systeem de oriëntatiebeperking en draait de app alsnog mee. Een tablet in liggende stand geeft
 * dan een kolom van ruim 1200dp, en dat is op twee manieren slecht: regels van honderd tekens lezen
 * niet, en een `16:9`-scèneafbeelding op volle breedte wordt hoger dan het scherm — je scrolt langs
 * een paginagrote foto voordat je één zin ziet.
 *
 * Vandaar een bovengrens in plaats van een oriëntatietruc: die werkt ongeacht of het systeem het
 * slot respecteert, en is precies de grens waarboven een tekstkolom te breed wordt.
 */
export const MAX_LEESBREEDTE = 720;

export const Typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '700' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  link: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
} as const;

export const CardDimensions = {
  portraitWidth: 148,
  portraitHeight: Math.round((148 * 4) / 3),
  portraitIllustrationRatio: 0.7,
  wideHeight: 96,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
