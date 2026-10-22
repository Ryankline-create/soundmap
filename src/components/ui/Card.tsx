import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, shadow } from '@/src/theme/tokens';

type Props = ViewProps & { style?: StyleProp<ViewStyle>; tone?: 'surface' | 'alt' | 'sunk'; flat?: boolean; pad?: number };

export function Card({ style, tone = 'surface', flat, pad = 16, ...rest }: Props) {
  const { c, scheme } = useTheme();
  const bg = tone === 'alt' ? c.surfaceAlt : tone === 'sunk' ? c.sunk : c.surface;
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: bg, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: pad },
        !flat && scheme === 'light' && shadow.card,
        style,
      ]}
    />
  );
}
