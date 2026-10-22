import { useEffect, useMemo } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { useMapCamera } from './AtlasMap';
import { AirplaneIcon } from '@/src/components/ui/icons';
import { arcPoints, type LatLng } from '@/src/lib/geo';
import { motion } from '@/src/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Flattened [x0, y0, x1, y1, …] so worklets can read it cheaply.
export function useArc(from: LatLng, to: LatLng, samples = 60) {
  return useMemo(() => arcPoints(from, to, samples).flatMap((p) => [p.x, p.y]), [from.lat, from.lng, to.lat, to.lng, samples]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Draws the arc up to `progress` (0..1). Dashed by default, stroke in screen points.
export function ArcStroke({
  pts,
  progress,
  color,
  width = 2,
  dashed = true,
  opacity = 1,
}: {
  pts: number[];
  progress: SharedValue<number>;
  color: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  const cam = useMapCamera();
  const unit = cam ? 1 / (cam.s0 * cam.zoom) : 1;
  const animatedProps = useAnimatedProps(() => {
    const n = pts.length / 2 - 1;
    const f = Math.max(0, Math.min(1, progress.value)) * n;
    const i = Math.floor(f);
    let d = `M${pts[0]},${pts[1]}`;
    for (let j = 1; j <= i; j++) {
      const jump = Math.abs(pts[j * 2] - pts[j * 2 - 2]) > 500;
      d += `${jump ? 'M' : 'L'}${pts[j * 2]},${pts[j * 2 + 1]}`;
    }
    if (i < n) {
      const t = f - i;
      const x = pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * t;
      const y = pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * t;
      if (Math.abs(pts[i * 2 + 2] - pts[i * 2]) < 500) d += `L${x},${y}`;
    }
    return { d };
  });
  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={width * unit}
      strokeDasharray={dashed ? [6 * unit, 5 * unit] : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={opacity}
    />
  );
}

// An arc that draws itself when mounted (routes, family tree).
export function RouteArc({ from, to, color, delay = 0, duration = 1200, width = 2, dashed = true }: {
  from: LatLng; to: LatLng; color: string; delay?: number; duration?: number; width?: number; dashed?: boolean;
}) {
  const pts = useArc(from, to);
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }));
  }, [delay, duration, reduced, progress, pts]);
  return <ArcStroke pts={pts} progress={progress} color={color} width={width} dashed={dashed} />;
}

// Starts a 1.6 s flight when `run` turns true; calls onDone at the end.
export function useFlight(run: boolean, onDone?: () => void) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!run) {
      progress.value = 0;
      return;
    }
    const done = () => onDone?.();
    progress.value = withTiming(1, { duration: reduced ? 1 : motion.flight, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(done)();
    });
    // onDone is read at completion time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced, progress]);
  return progress;
}

// The plane riding the arc, rotated along its tangent. Render as an AtlasMap child.
export function FlightPlane({ pts, progress, color }: { pts: number[]; progress: SharedValue<number>; color: string }) {
  const cam = useMapCamera();
  const S = 22;
  const style = useAnimatedStyle(() => {
    if (!cam) return { opacity: 0 };
    const n = pts.length / 2 - 1;
    const t = Math.max(0, Math.min(1, progress.value));
    const f = Math.min(n - 0.001, t * n);
    const i = Math.floor(f);
    const u = f - i;
    const x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[i * 2 + 2], y1 = pts[i * 2 + 3];
    const x = x0 + (x1 - x0) * u;
    const y = y0 + (y1 - y0) * u;
    const angle = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    const k = cam.k.value * cam.s0;
    return {
      opacity: t > 0.01 && t < 0.995 ? 1 : 0,
      transform: [
        { translateX: cam.tx.value + k * x - S / 2 },
        { translateY: cam.ty.value + k * y - S / 2 },
        { rotate: `${angle}rad` },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: S, height: S }, style]}>
      <AirplaneIcon size={S} color={color} weight="fill" />
    </Animated.View>
  );
}
