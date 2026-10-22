import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { MapAnchor } from './AtlasMap';
import { Text } from '@/src/components/ui/Text';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { XY } from '@/src/lib/geo';

const SIZES = { sm: { w: 20, h: 26 }, md: { w: 28, h: 36 }, lg: { w: 36, h: 46 } };

// Mini teardrop in the region ink with a white music-note cutout, echoing the logo.
export function PinGlyph({ color, size = 'md', ring }: { color: string; size?: keyof typeof SIZES; ring?: string }) {
  const { w, h } = SIZES[size];
  return (
    <Svg width={w} height={h} viewBox="0 0 28 36">
      <Ellipse cx={14} cy={34.2} rx={5} ry={1.6} fill="#2B1610" opacity={0.18} />
      <Path
        d="M14 34 C14 34 3.2 22.6 3.2 13.6 A10.8 10.8 0 1 1 24.8 13.6 C24.8 22.6 14 34 14 34 Z"
        fill={color}
        stroke={ring ?? '#FFFCF8'}
        strokeWidth={1.6}
      />
      <Circle cx={12} cy={17.2} r={2.9} fill="#FFFFFF" />
      <Path d="M14.6 17.2 V7.6 C16.6 8.2 18.6 9.4 19 11.6" stroke="#FFFFFF" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

type Props = { at: XY; color: string; size?: keyof typeof SIZES; drop?: boolean; pulse?: boolean; delay?: number; dim?: boolean };

// A pin placed on the AtlasMap. Drops in with a spring; `pulse` rings it.
export function MapPin({ at, color, size = 'md', drop = true, pulse, delay = 0, dim }: Props) {
  const dims = SIZES[size];
  const reduced = useReducedMotion();
  const y = useSharedValue(drop && !reduced ? -22 : 0);
  const s = useSharedValue(drop && !reduced ? 0.4 : 1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (drop && !reduced) {
      y.value = withDelay(delay, withSpring(0, { damping: 11, stiffness: 260 }));
      s.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 300 }));
    }
  }, [drop, reduced, delay, y, s]);

  useEffect(() => {
    if (pulse && !reduced) ring.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 0 })), -1);
    else ring.value = 0;
  }, [pulse, reduced, ring]);

  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { scale: s.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse ? 0.55 * (1 - ring.value) : 0, transform: [{ scale: 0.4 + ring.value * 1.6 }] }));

  return (
    <MapAnchor at={at} size={dims} pointerEvents="none">
      <Animated.View style={[styles.ring, { borderColor: color, left: dims.w / 2 - 14, top: dims.h - 16 }, ringStyle]} />
      <Animated.View style={[{ transformOrigin: 'center bottom', opacity: dim ? 0.45 : 1 }, pinStyle]}>
        <PinGlyph color={color} size={size} />
      </Animated.View>
    </MapAnchor>
  );
}

// Small label pill anchored above a map point (country names, places, distance).
export function MapLabel({ at, text, color, offset = 40, mono }: { at: XY; text: string; color?: string; offset?: number; mono?: boolean }) {
  const { c } = useTheme();
  const w = Math.max(48, text.length * (mono ? 8.2 : 7.4) + 18);
  return (
    <MapAnchor at={at} size={{ w, h: 24 + offset }} anchor={{ x: 0.5, y: 1 }} pointerEvents="none">
      <View style={[styles.label, { backgroundColor: c.ink, width: w }]}>
        <Text variant={mono ? 'mono' : 'smallStrong'} numberOfLines={1} style={{ color: color ?? c.bg, fontSize: 12, lineHeight: 16 }}>
          {text}
        </Text>
      </View>
    </MapAnchor>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  label: { height: 24, borderRadius: 12, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
});
