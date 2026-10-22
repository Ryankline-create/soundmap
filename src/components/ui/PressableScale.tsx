import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/src/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PRESS_SPRING = { damping: 18, stiffness: 420, mass: 0.6 };

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  feedback?: 'tap' | 'select' | false;
};

// Every tappable surface: springs to 0.96 on press, Light haptic on release.
export function PressableScale({ style, scaleTo = 0.96, feedback = 'tap', onPressIn, onPressOut, onPress, disabled, ...rest }: Props) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      onPressIn={(e) => {
        if (!reduced) scale.value = withSpring(scaleTo, PRESS_SPRING);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (feedback === 'tap') haptic.tap();
        if (feedback === 'select') haptic.select();
        onPress?.(e);
      }}
      style={[style, animated, disabled && { opacity: 0.45 }]}
    />
  );
}
