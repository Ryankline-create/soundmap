import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { GlyphId } from '@/src/data/types';

// A small round stamp for strips and lists; a dashed ring when empty.
export function MiniStamp({ ink, glyph, stamped, size = 44, glow }: { ink: string; glyph: GlyphId; stamped: boolean; size?: number; glow?: boolean }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const g = useSharedValue(0);
  useEffect(() => {
    if (glow && !reduced) g.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
    else g.value = 0;
  }, [glow, reduced, g]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow ? 0.25 + g.value * 0.45 : 0, transform: [{ scale: 1.05 + g.value * 0.18 }] }));
  const color = stamped ? ink : c.borderStrong;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: ink }, glowStyle]}
      />
      <Svg width={size} height={size} viewBox="0 0 44 44" style={{ position: 'absolute' }}>
        <Circle cx={22} cy={22} r={20} fill={c.surface} stroke={color} strokeWidth={stamped ? 2.2 : 1.4} strokeDasharray={stamped ? undefined : '3 3'} />
        {stamped && <Circle cx={22} cy={22} r={16.5} stroke={color} strokeWidth={0.9} fill="none" />}
      </Svg>
      <View style={{ opacity: stamped ? 0.92 : 0.5 }}>
        <Glyph name={glyph} size={size * 0.45} color={color} strokeWidth={stamped ? 1.9 : 1.5} />
      </View>
    </View>
  );
}
