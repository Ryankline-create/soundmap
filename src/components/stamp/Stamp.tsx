import { useEffect, useId } from 'react';
import { Image, StyleSheet, View } from 'react-native';
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
import Svg, { Circle, Defs, Line, Path, Rect, Text as SvgText, TextPath } from 'react-native-svg';
import { Glyph } from '@/src/components/glyphs';
import { font } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/ThemeProvider';
import { haptic } from '@/src/lib/haptics';
import { sfx } from '@/src/lib/sfx';
import type { GlyphId } from '@/src/data/types';

export type StampShape = 'circle' | 'rect' | 'postmark';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const stampDate = (t: number) => {
  const d = new Date(t);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// width : height of each shape's artwork
export const STAMP_ASPECT: Record<StampShape, number> = { circle: 1, rect: 150 / 104, postmark: 168 / 112 };

// Stable per-place tilt in ±6°.
export function stampTilt(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 1200) / 100) - 6;
}

type Props = {
  shape: StampShape;
  ink: string;
  place: string;
  glyph: GlyphId;
  date?: number;
  // stamp height in points
  size?: number;
  rotate?: number;
  // outline only: an empty slot in the passport
  empty?: boolean;
  // the color the stamp sits on (the grain shows it through the ink)
  paper?: string;
};

const grain = require('@/assets/images/grain.png');

export function Stamp({ shape, ink, place, glyph, date, size = 120, rotate, empty, paper }: Props) {
  const { c } = useTheme();
  const id = useId().replace(/:/g, '');
  const w = size * STAMP_ASPECT[shape];
  const color = empty ? c.borderStrong : ink;
  const dash = empty ? '5 5' : undefined;
  const label = place.toUpperCase();
  const when = date ? stampDate(date) : 'NOT YET';
  const tilt = rotate ?? (empty ? 0 : stampTilt(place));
  const textProps = { fill: empty ? c.inkFaint : ink, fontFamily: font.bodyHeavy, textAnchor: 'middle' as const };

  let art: React.ReactNode;
  let glyphBox: { x: number; y: number; s: number };

  if (shape === 'circle') {
    const fs = label.length > 12 ? 9 : label.length > 10 ? 10 : 11;
    art = (
      <Svg width={w} height={size} viewBox="0 0 120 120">
        <Defs>
          <Path id={`t${id}`} d="M 17,60 A 43,43 0 0 1 103,60" />
          <Path id={`b${id}`} d="M 13,60 A 47,47 0 0 0 107,60" />
        </Defs>
        <Circle cx={60} cy={60} r={56} stroke={color} strokeWidth={3.2} strokeDasharray={dash} fill="none" />
        <Circle cx={60} cy={60} r={50.5} stroke={color} strokeWidth={1.1} fill="none" />
        <Circle cx={60} cy={60} r={29} stroke={color} strokeWidth={1.1} fill="none" />
        <SvgText {...textProps} fontSize={fs} letterSpacing={1.4}>
          <TextPath href={`#t${id}`} startOffset="50%">{label}</TextPath>
        </SvgText>
        <SvgText {...textProps} fontFamily={font.monoMedium} fontSize={8.5} letterSpacing={1.2}>
          <TextPath href={`#b${id}`} startOffset="50%">{when}</TextPath>
        </SvgText>
        <Circle cx={12.8} cy={60} r={1.7} fill={color} />
        <Circle cx={107.2} cy={60} r={1.7} fill={color} />
      </Svg>
    );
    glyphBox = { x: 0.5, y: 0.5, s: 0.3 };
  } else if (shape === 'rect') {
    const words = label.split(' ');
    const lines = label.length > 11 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [label];
    art = (
      <Svg width={w} height={size} viewBox="0 0 150 104">
        <Rect x={3} y={3} width={144} height={98} rx={11} stroke={color} strokeWidth={3.2} strokeDasharray={dash} fill="none" />
        <Rect x={9} y={9} width={132} height={86} rx={6} stroke={color} strokeWidth={1.1} fill="none" />
        <SvgText {...textProps} x={75} y={23} fontSize={7.5} letterSpacing={2.2}>SOUNDMAP · ADMITTED</SvgText>
        <Line x1={18} y1={30} x2={132} y2={30} stroke={color} strokeWidth={1.1} />
        <Line x1={58} y1={38} x2={58} y2={86} stroke={color} strokeWidth={1.1} />
        {lines.map((ln, i) => (
          <SvgText key={i} {...textProps} textAnchor="start" x={66} y={(lines.length > 1 ? 54 : 60) + i * 14} fontSize={ln.length > 9 ? 11 : 13} letterSpacing={0.8}>
            {ln}
          </SvgText>
        ))}
        <SvgText {...textProps} textAnchor="start" fontFamily={font.monoMedium} x={66} y={84} fontSize={8.5} letterSpacing={1}>
          {when}
        </SvgText>
      </Svg>
    );
    glyphBox = { x: 34 / 150, y: 62 / 104, s: 0.34 };
  } else {
    const fs = label.length > 12 ? 8 : label.length > 9 ? 9 : 10;
    art = (
      <Svg width={w} height={size} viewBox="0 0 168 112">
        <Defs>
          <Path id={`t${id}`} d="M 20,56 A 36,36 0 0 1 92,56" />
        </Defs>
        <Circle cx={56} cy={56} r={50} stroke={color} strokeWidth={3} strokeDasharray={dash} fill="none" />
        <Circle cx={56} cy={56} r={44} stroke={color} strokeWidth={1.1} fill="none" />
        <SvgText {...textProps} fontSize={fs} letterSpacing={1.3}>
          <TextPath href={`#t${id}`} startOffset="50%">{label}</TextPath>
        </SvgText>
        <Line x1={24} y1={74} x2={88} y2={74} stroke={color} strokeWidth={1.1} />
        <SvgText {...textProps} fontFamily={font.monoMedium} x={56} y={88} fontSize={8.5} letterSpacing={1}>
          {when}
        </SvgText>
        {[26, 40, 54, 68, 82].map((y) => (
          <Path
            key={y}
            d={`M108 ${y} q 7 -4.5 14 0 t 14 0 t 14 0 t 14 0`}
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray={dash}
            fill="none"
          />
        ))}
      </Svg>
    );
    glyphBox = { x: 56 / 168, y: 52 / 112, s: 0.26 };
  }

  const gs = size * glyphBox.s;
  return (
    <View
      style={{ width: w, height: size, opacity: empty ? 1 : 0.92, transform: [{ rotate: `${tilt}deg` }] }}
      accessible
      accessibilityLabel={empty ? `${place}, not stamped yet` : `Stamp: ${place}, ${when}`}
    >
      {art}
      <View style={[styles.glyph, { left: w * glyphBox.x - gs / 2, top: size * glyphBox.y - gs / 2 }]}>
        <Glyph name={glyph} size={gs} color={color} strokeWidth={empty ? 1.4 : 1.9} />
      </View>
      {!empty && (
        <Image
          source={grain}
          resizeMode="repeat"
          style={[StyleSheet.absoluteFill, { tintColor: paper ?? c.surface, opacity: 0.85 }]}
        />
      )}
    </View>
  );
}

// The "thunk": drops from 1.4× with a spring, a tiny shake, a Heavy haptic and
// a soft thump on impact.
export function StampLanding({ run, delay = 0, onLanded, children }: { run: boolean; delay?: number; onLanded?: () => void; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(run ? 1.4 : 1);
  const opacity = useSharedValue(run ? 0 : 1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!run) return;
    const impact = () => {
      haptic.stamp();
      sfx.stamp();
      onLanded?.();
    };
    if (reduced) {
      scale.value = 1;
      opacity.value = withTiming(1, { duration: 120 });
      impact();
      return;
    }
    scale.value = 1.4;
    opacity.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration: 90 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 520, mass: 0.7 }));
    // the stiff spring first reaches 1 about 110 ms in: that's the impact
    const t = setTimeout(impact, delay + 110);
    shake.value = withDelay(delay + 150, withSequence(withRepeat(withTiming(1, { duration: 40 }), 4, true), withTiming(0, { duration: 40 })));
    return () => clearTimeout(t);
    // onLanded is read at impact time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, delay, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateX: shake.value * 1.6 }, { rotate: `${shake.value * 0.8}deg` }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  glyph: { position: 'absolute' },
});
