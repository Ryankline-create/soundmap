import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius } from '@/src/theme/tokens';
import type { Icon } from './icons';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: Icon;
  iconRight?: Icon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'ink';
  size?: 'lg' | 'md' | 'sm';
  // overrides the fill for 'primary' / 'ink' (e.g. a region ink)
  tint?: string;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const HEIGHT = { lg: 54, md: 46, sm: 36 };

export function Button({ label, onPress, icon: IconL, iconRight: IconR, variant = 'primary', size = 'lg', tint, disabled, full, style, accessibilityHint }: Props) {
  const { c } = useTheme();
  const fill =
    variant === 'primary' ? tint ?? c.primary : variant === 'ink' ? tint ?? c.ink : variant === 'secondary' ? c.surface : 'transparent';
  const fg = variant === 'primary' ? c.primaryOn : variant === 'ink' ? c.bg : variant === 'ghost' ? tint ?? c.primary : c.ink;
  const iconSize = size === 'sm' ? 16 : 20;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[
        styles.base,
        { height: HEIGHT[size], backgroundColor: fill, paddingHorizontal: size === 'sm' ? 14 : 20 },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: c.borderStrong },
        full && { alignSelf: 'stretch' },
        style,
      ]}
    >
      <View style={styles.row}>
        {IconL && <IconL size={iconSize} color={fg} weight="bold" />}
        <Text variant={size === 'sm' ? 'smallStrong' : 'bodyStrong'} style={{ color: fg, fontSize: size === 'sm' ? 14 : 16 }} numberOfLines={1}>
          {label}
        </Text>
        {IconR && <IconR size={iconSize} color={fg} weight="bold" />}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
