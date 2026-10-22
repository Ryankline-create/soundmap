import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '@/src/components/ui/Text';
import { Glyph } from '@/src/components/glyphs';
import { alpha } from '@/src/lib/color';
import { deck, font, shadow } from '@/src/theme/tokens';
import type { GlyphId } from '@/src/data/types';

// SoundDeck hardware parts. Same dark panel in both themes.

export function Engraved({ children, color = deck.faint }: { children: string; color?: string }) {
  return (
    <Text variant="label" style={{ color, fontSize: 10, letterSpacing: 1.6 }}>
      {children}
    </Text>
  );
}

export function Led({ on, color = deck.led, size = 8 }: { on: boolean; color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: on ? color : deck.ledOff,
        shadowColor: color,
        shadowOpacity: on ? 0.9 : 0,
        shadowRadius: on ? 6 : 0,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

// A pad: sinks in on press, flashes its ink. `flash` bumps when the sequencer
// plays it, so recorded loops light the pads too.
export function Pad({
  label,
  glyph,
  ink,
  onDown,
  selected,
  flash,
  disabled,
  silence,
}: {
  label: string;
  glyph?: GlyphId;
  ink: string;
  onDown: () => void;
  selected?: boolean;
  flash?: number;
  disabled?: boolean;
  silence?: boolean;
}) {
  const press = useSharedValue(0);
  const lit = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!flash) return;
    lit.value = 1;
    lit.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
  }, [flash, lit]);

  const down = () => {
    press.value = withTiming(1, { duration: 40 });
    lit.value = 1;
    onDown();
  };
  const up = () => {
    press.value = withSpring(0, { damping: 14, stiffness: 400 });
    lit.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.quad) });
  };

  const face = useAnimatedStyle(() => ({
    transform: [{ translateY: reduced ? 0 : press.value * 2.5 }, { scale: 1 - press.value * 0.03 }],
    shadowOpacity: 0.45 * (1 - press.value),
  }));
  const glow = useAnimatedStyle(() => ({ opacity: lit.value * 0.85 }));

  return (
    <Pressable
      onPressIn={down}
      onPressOut={up}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.padHit}
    >
      <View style={[styles.padWell, { backgroundColor: deck.well }]}>
        <Animated.View style={[styles.pad, { backgroundColor: deck.pad, borderColor: selected ? ink : deck.padEdge }, shadow.pad, face]}>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: ink, borderRadius: 10 }, glow]} />
          {glyph && !silence ? <Glyph name={glyph} size={22} color={deck.label} strokeWidth={1.6} /> : null}
          {silence && <View style={[styles.rest, { borderColor: deck.faint }]} />}
          <Text variant="label" numberOfLines={1} style={{ color: deck.readout, fontSize: 9, letterSpacing: 0.4, textTransform: 'none', fontFamily: font.bodySemi }}>
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Hardware button with an LED.
export function DeckButton({ label, onPress, led, ledColor, active, wide, children }: {
  label: string; onPress: () => void; led?: boolean; ledColor?: string; active?: boolean; wide?: boolean; children?: React.ReactNode;
}) {
  const press = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * 2 }] }));
  return (
    <Pressable
      onPressIn={() => (press.value = withTiming(1, { duration: 40 }))}
      onPressOut={() => (press.value = withSpring(0))}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.btnWell, wide && { flex: 1.4 }]}
    >
      <Animated.View style={[styles.btn, { borderColor: active ? ledColor ?? deck.led : deck.padEdge }, style]}>
        {led !== undefined && <Led on={led} color={ledColor} size={7} />}
        {children}
        <Text variant="label" style={{ color: deck.readout, fontSize: 10, letterSpacing: 1 }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// BPM slider: drag the fader, or tap − / +.
export function BpmFader({ bpm, onChange, ink }: { bpm: number; onChange: (v: number) => void; ink: string }) {
  const [w, setW] = useState(0);
  const MIN = 60;
  const MAX = 160;
  const frac = (bpm - MIN) / (MAX - MIN);
  const startFrac = useRef(frac);

  const set = (f: number) => onChange(Math.round(MIN + Math.max(0, Math.min(1, f)) * (MAX - MIN)));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      startFrac.current = w ? e.x / w : frac;
      set(startFrac.current);
    })
    .onUpdate((e) => {
      if (w) set(startFrac.current + e.translationX / w);
    });

  return (
    <View style={styles.faderRow}>
      <Pressable onPress={() => onChange(Math.max(MIN, bpm - 1))} accessibilityLabel="Slower" style={styles.nudge}>
        <Text variant="mono" style={{ color: deck.readout }}>−</Text>
      </Pressable>
      <GestureDetector gesture={pan}>
        <View style={styles.faderHit} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} accessibilityRole="adjustable" accessibilityLabel={`Tempo ${bpm} BPM`}>
          <View style={[styles.faderTrack, { backgroundColor: deck.well }]}>
            <View style={{ width: `${frac * 100}%`, height: '100%', backgroundColor: alpha(ink, 0.5), borderRadius: 3 }} />
          </View>
          {Array.from({ length: 11 }, (_, i) => (
            <View key={i} style={[styles.faderTick, { left: `${i * 10}%` }]} />
          ))}
          <View style={[styles.faderCap, { left: w ? frac * w - 9 : 0, borderColor: ink }]} />
        </View>
      </GestureDetector>
      <Pressable onPress={() => onChange(Math.min(MAX, bpm + 1))} accessibilityLabel="Faster" style={styles.nudge}>
        <Text variant="mono" style={{ color: deck.readout }}>+</Text>
      </Pressable>
    </View>
  );
}

// The vinyl deck: spins while the loop plays and coasts to a stop after.
export function Vinyl({ playing, ink, size = 92 }: { playing: boolean; ink: string; size?: number }) {
  const rot = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    if (playing) {
      rot.value = rot.value % 360;
      rot.value = withRepeat(withTiming(rot.value + 360, { duration: 1800, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(rot);
      rot.value = withTiming(rot.value + 60, { duration: 900, easing: Easing.out(Easing.cubic) });
    }
  }, [playing, reduced, rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, style]}>
        <Svg width={size} height={size}>
          <Circle cx={r} cy={r} r={r - 1} fill="#0B0705" stroke={deck.padEdge} />
          {[0.86, 0.74, 0.62, 0.52].map((k) => (
            <Circle key={k} cx={r} cy={r} r={r * k} stroke="#2A1E18" strokeWidth={1} fill="none" />
          ))}
          <Circle cx={r} cy={r} r={r * 0.32} fill={ink} />
          <Path d={`M${r} ${r - r * 0.26} A ${r * 0.26} ${r * 0.26} 0 0 1 ${r + r * 0.26} ${r}`} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} fill="none" />
          <Circle cx={r} cy={r} r={2.5} fill={deck.body} />
        </Svg>
      </Animated.View>
      <View style={[styles.arm, { right: -4, top: 2, height: size * 0.62 }]} />
    </View>
  );
}

export function useBlink(on: boolean, ms = 500) {
  const [b, setB] = useState(false);
  useEffect(() => {
    if (!on) {
      setB(false);
      return;
    }
    const id = setInterval(() => setB((x) => !x), ms);
    return () => clearInterval(id);
  }, [on, ms]);
  return b;
}

const styles = StyleSheet.create({
  padHit: { width: '25%', aspectRatio: 1, padding: 4 },
  padWell: { flex: 1, borderRadius: 13, padding: 3 },
  pad: { flex: 1, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden', paddingHorizontal: 3 },
  rest: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderStyle: 'dashed' },
  btnWell: { flex: 1, borderRadius: 10, backgroundColor: deck.well, padding: 3 },
  btn: { height: 40, borderRadius: 8, backgroundColor: deck.pad, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  faderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nudge: { width: 32, height: 32, borderRadius: 8, backgroundColor: deck.pad, alignItems: 'center', justifyContent: 'center' },
  faderHit: { flex: 1, height: 32, justifyContent: 'center' },
  faderTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  faderTick: { position: 'absolute', top: 22, width: 1, height: 5, backgroundColor: deck.ledOff },
  faderCap: { position: 'absolute', top: 6, width: 18, height: 20, borderRadius: 4, backgroundColor: deck.readout, borderWidth: 2 },
  arm: { position: 'absolute', width: 4, borderRadius: 2, backgroundColor: deck.label, transform: [{ rotate: '18deg' }] },
});
