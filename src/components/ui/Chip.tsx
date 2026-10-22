import { StyleSheet, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { CheckIcon } from './icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { radius } from '@/src/theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  // region ink or another accent; defaults to primary
  ink?: string;
  dot?: boolean;
  tick?: boolean;
  size?: 'md' | 'lg';
};

export function Chip({ label, selected, onPress, ink, dot, tick, size = 'md' }: Props) {
  const { c } = useTheme();
  const accent = ink ?? c.primary;
  return (
    <PressableScale
      onPress={onPress}
      feedback="select"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        size === 'lg' && styles.lg,
        {
          backgroundColor: selected ? alpha(accent, 0.12) : c.surface,
          borderColor: selected ? accent : c.border,
        },
      ]}
    >
      <View style={styles.row}>
        {dot && <View style={[styles.dot, { backgroundColor: accent }]} />}
        {tick && selected && <CheckIcon size={14} weight="bold" color={accent} />}
        <Text
          variant={size === 'lg' ? 'bodyStrong' : 'smallStrong'}
          style={{ color: selected ? accent : c.ink }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5, justifyContent: 'center' },
  lg: { height: 46, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
