import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { font } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { Colors } from '@/src/theme/tokens';

export type TextVariant =
  | 'display' | 'h1' | 'h2' | 'h3' | 'title'
  | 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'label'
  | 'mono' | 'monoLg';

const variants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: font.display, fontSize: 44, lineHeight: 56, letterSpacing: -0.6 },
  h1: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.3 },
  h2: { fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: font.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  title: { fontFamily: font.bodyBold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: font.bodySemi, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: font.bodyHeavy, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  mono: { fontFamily: font.mono, fontSize: 14, lineHeight: 20 },
  monoLg: { fontFamily: font.monoMedium, fontSize: 28, lineHeight: 36 },
};

type Props = TextProps & {
  variant?: TextVariant;
  // a theme token name or a raw color
  color?: keyof Colors | (string & {});
  tabular?: boolean;
  center?: boolean;
};

// Young Serif clips its ascenders unless lineHeight ≥ fontSize × 1.28, so every
// Text gets that floor whatever style is passed in.
export function Text({ variant = 'body', color = 'ink', tabular, center, style, ...rest }: Props) {
  const { c } = useTheme();
  const flat = StyleSheet.flatten([variants[variant], style]) as TextStyle;
  const size = flat.fontSize ?? 16;
  const minLine = Math.ceil(size * 1.28);
  const resolved = (c as Record<string, string>)[color] ?? color;
  return (
    <RNText
      {...rest}
      style={[
        flat,
        { color: flat.color ?? resolved },
        (flat.lineHeight ?? 0) < minLine && { lineHeight: minLine },
        tabular && { fontVariant: ['tabular-nums'] },
        center && { textAlign: 'center' },
      ]}
    />
  );
}
