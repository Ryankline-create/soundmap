import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { Text } from '@/src/components/ui/Text';
import { PlayIcon, StopIcon } from '@/src/components/ui/icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { Pattern } from '@/src/audio/types';

type Props = {
  pattern: Pattern;
  durationMs?: number;
  color?: string;
  size?: number;
  // free replays left; shown as dots. Omit to hide.
  replaysLeft?: number;
  replaysTotal?: number;
  onStart?: () => void;
  onEnd?: () => void;
  label?: string;
  disabled?: boolean;
};

const SEGMENTS = 8;

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

// Big play button in concentric rings. The rings pulse on each beat of the
// pattern as the engine's step clock plays it, so what you see is what you hear.
export function ListeningDial({ pattern, durationMs = 8000, color, size = 220, replaysLeft, replaysTotal = 2, onStart, onEnd, label, disabled }: Props) {
  const { c } = useTheme();
  const ink = color ?? c.primary;
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const startAt = useRef(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    const beat = pattern.steps === 12 ? 3 : 4;
    const offStep = SoundEngine.onStep((e) => {
      if (e.patternId !== pattern.id) return;
      setProgress(Math.min(1, (SoundEngine.now() - startAt.current) / durationMs));
      if (e.step % beat === 0 && !reduced) {
        pulse.value = e.step === 0 ? 1 : 0.6;
        pulse.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) });
      }
    });
    const offState = SoundEngine.onState((s) => {
      const mine = s.playing && s.patternId === pattern.id;
      setPlaying(mine);
    });
    return () => {
      offStep();
      offState();
    };
  }, [pattern.id, pattern.steps, durationMs, reduced, pulse]);

  // stop our groove if the screen goes away mid-play
  useEffect(() => () => {
    if (SoundEngine.isPlaying(pattern.id)) SoundEngine.stop();
  }, [pattern.id]);

  const toggle = async () => {
    if (playing) {
      SoundEngine.stop();
      return;
    }
    await SoundEngine.init();
    await SoundEngine.preloadPattern(pattern);
    startAt.current = SoundEngine.now();
    setProgress(0);
    onStart?.();
    SoundEngine.play(pattern, {
      loop: true,
      maxMs: durationMs,
      onEnd: () => {
        setProgress(1);
        onEnd?.();
      },
    });
  };

  const r0 = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.035 }], opacity: 0.35 + pulse.value * 0.5 }));
  const r1 = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.065 }], opacity: 0.27 + pulse.value * 0.5 }));
  const r2 = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.095 }], opacity: 0.19 + pulse.value * 0.5 }));

  const half = size / 2;
  const segR = size * 0.37;
  const gap = 0.09;
  const filled = progress * SEGMENTS;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {[r2, r1, r0].map((st, i) => {
          const d = size * (1 - (2 - i) * 0.13);
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[styles.abs, { width: d, height: d, borderRadius: d / 2, borderColor: alpha(ink, 0.45), borderWidth: i === 2 ? 1.5 : 1 }, st]}
            />
          );
        })}
        <Svg width={size} height={size} style={styles.abs} pointerEvents="none">
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / SEGMENTS + gap / 2;
            const a1 = a0 + (2 * Math.PI) / SEGMENTS - gap;
            return (
              <Path key={`bg${i}`} d={arc(half, half, segR, a0, a1)} stroke={c.border} strokeWidth={5} strokeLinecap="round" fill="none" />
            );
          })}
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / SEGMENTS + gap / 2;
            const a1 = a0 + (2 * Math.PI) / SEGMENTS - gap;
            const f = Math.max(0, Math.min(1, filled - i));
            if (f <= 0.02) return null;
            return <Path key={`fg${i}`} d={arc(half, half, segR, a0, a0 + (a1 - a0) * f)} stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />;
          })}
          <Circle cx={half} cy={half} r={size * 0.31} fill={alpha(ink, 0.08)} />
        </Svg>
        <PressableScale
          onPress={toggle}
          disabled={disabled}
          accessibilityLabel={playing ? 'Stop listening' : label ?? 'Play the sound'}
          style={[styles.button, { width: size * 0.46, height: size * 0.46, borderRadius: size * 0.23, backgroundColor: ink }]}
        >
          {playing ? (
            <StopIcon size={size * 0.15} color={c.primaryOn} weight="fill" />
          ) : (
            <View style={{ marginLeft: size * 0.02 }}>
              <PlayIcon size={size * 0.17} color={c.primaryOn} weight="fill" />
            </View>
          )}
        </PressableScale>
      </View>
      {replaysLeft !== undefined && (
        <View style={styles.dots} accessibilityLabel={`${replaysLeft} free replays left`}>
          {Array.from({ length: replaysTotal }, (_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i < replaysLeft ? ink : 'transparent', borderColor: ink }]} />
          ))}
          <Text variant="small" color="inkMuted" style={{ marginLeft: 4 }}>
            {replaysLeft > 0 ? `${replaysLeft} free ${replaysLeft === 1 ? 'replay' : 'replays'}` : 'Replays cost 10 XP'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  abs: { position: 'absolute' },
  button: { alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
});
