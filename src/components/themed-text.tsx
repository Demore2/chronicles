import { Text, type TextProps } from 'react-native';

import { ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType = keyof typeof Typography | 'linkPrimary';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const typographyStyle = Typography[type as keyof typeof Typography] ?? Typography.link;

  return (
    <Text
      style={[
        typographyStyle,
        { color: theme[themeColor ?? 'text'] },
        type === 'linkPrimary' && { color: theme.accent },
        style,
      ]}
      {...rest}
    />
  );
}
