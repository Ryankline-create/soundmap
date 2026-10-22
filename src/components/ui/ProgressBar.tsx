import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

type Props = { value: number; color?: string; track?: string; height?: number; style?: StyleProp<ViewStyle>; duration?: number };

export function ProgressBar({ value, color, track, height = 6, style, duration = 600 }: Props) {
  const { c } = useTheme();
  const v = useSharedValue(Math.max(0, Math.min(1, value)));
  useEffect(() => {
    v.value = withTiming(Math.max(0, Math.min(1, value)), { duration, easing: Easing.out(Easing.cubic) });
  }, [value, duration, v]);
  const fill = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[{ height, borderRadius: height, backgroundColor: track ?? c.sunk, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color ?? c.gold }, fill]} />
    </View>
  );
}
