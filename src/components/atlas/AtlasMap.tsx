import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { G, Path } from 'react-native-svg';
import { COUNTRIES, GRATICULE, MAP, type Country } from '@/src/data/world';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { countryAt, type XY } from '@/src/lib/geo';
import type { RegionKey } from '@/src/data/types';

// The SVG is drawn at 2× its on-screen size and shown at half scale, so it
// stays sharp when pinched in. Screen point = t + k · s0 · mapPoint.
const OVERSAMPLE = 2;
const MAX_ZOOM = 6;

export type MapCamera = { k: SharedValue<number>; tx: SharedValue<number>; ty: SharedValue<number>; s0: number; width: number; height: number; zoom: number };
const CameraContext = createContext<MapCamera | null>(null);
export const useMapCamera = () => useContext(CameraContext);

export type AtlasHandle = {
  focus: (points: XY[], opts?: { pad?: number; duration?: number; maxZoom?: number }) => void;
  reset: (duration?: number) => void;
};

type Props = {
  onTapMap?: (p: XY, country: Country | null, unitsPerPt: number) => void;
  interactive?: boolean;
  selectedCountry?: string | null;
  // tints every country of these regions in its region ink
  tintRegions?: RegionKey[];
  // tints one region strongly (map quiz feedback)
  markRegion?: { region: RegionKey; color: string } | null;
  svgChildren?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
};

export const AtlasMap = forwardRef<AtlasHandle, Props>(function AtlasMap(
  { onTapMap, interactive = true, selectedCountry, tintRegions, markRegion, svgChildren, children, style, rounded = true },
  ref,
) {
  const { c, ink } = useTheme();
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const s0 = width / MAP.width;
  const height = MAP.height * s0;

  const k = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const startK = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const clampT = (kv: number, x: number, y: number) => {
    'worklet';
    const minX = width - kv * width;
    const minY = height - kv * height;
    return [Math.min(0, Math.max(minX, x)), Math.min(0, Math.max(minY, y))];
  };

  const commitZoom = useCallback((kv: number) => setZoom(Math.round(kv * 4) / 4), []);

  const animateTo = useCallback(
    (kv: number, x: number, y: number, duration: number) => {
      const cfg = { duration, easing: Easing.inOut(Easing.cubic) };
      k.value = withTiming(kv, cfg);
      tx.value = withTiming(x, cfg);
      ty.value = withTiming(y, cfg);
      setTimeout(() => setZoom(Math.round(kv * 4) / 4), duration);
    },
    [k, tx, ty],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: (points, opts = {}) => {
        if (!width || !points.length) return;
        const pad = opts.pad ?? 60;
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
        const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
        const kv = Math.max(1, Math.min(opts.maxZoom ?? 3.5, MAP.width / (x1 - x0), MAP.height / (y1 - y0)));
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        const [x, y] = clampT(kv, width / 2 - kv * s0 * cx, height / 2 - kv * s0 * cy);
        animateTo(kv, x, y, opts.duration ?? 1100);
      },
      reset: (duration = 500) => animateTo(1, 0, 0, duration),
    }),
    // clampT reads width/height, which s0 tracks
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, s0, animateTo],
  );

  const handleTap = useCallback(
    (x: number, y: number, kv: number, txv: number, tyv: number) => {
      if (!onTapMap || !s0) return;
      const p = { x: (x - txv) / (kv * s0), y: (y - tyv) / (kv * s0) };
      onTapMap(p, countryAt(p), 1 / (kv * s0));
    },
    [onTapMap, s0],
  );

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .enabled(interactive)
      .onStart(() => {
        startK.value = k.value;
        startX.value = tx.value;
        startY.value = ty.value;
      })
      .onUpdate((e) => {
        const kv = Math.min(MAX_ZOOM, Math.max(1, startK.value * e.scale));
        const r = kv / startK.value;
        const [x, y] = clampT(kv, e.focalX - (e.focalX - startX.value) * r, e.focalY - (e.focalY - startY.value) * r);
        k.value = kv;
        tx.value = x;
        ty.value = y;
      })
      .onEnd(() => runOnJS(commitZoom)(k.value));
    const pan = Gesture.Pan()
      .enabled(interactive && zoom > 1)
      .minDistance(4)
      .onStart(() => {
        startX.value = tx.value;
        startY.value = ty.value;
      })
      .onUpdate((e) => {
        const [x, y] = clampT(k.value, startX.value + e.translationX, startY.value + e.translationY);
        tx.value = x;
        ty.value = y;
      });
    const doubleTap = Gesture.Tap()
      .enabled(interactive)
      .numberOfTaps(2)
      .onEnd(() => {
        const cfg = { duration: 320, easing: Easing.out(Easing.cubic) };
        k.value = withTiming(1, cfg);
        tx.value = withTiming(0, cfg);
        ty.value = withTiming(0, cfg);
        runOnJS(commitZoom)(1);
      });
    const tap = Gesture.Tap()
      .maxDuration(260)
      .onEnd((e, ok) => {
        if (ok) runOnJS(handleTap)(e.x, e.y, k.value, tx.value, ty.value);
      });
    return Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, tap));
    // clampT closes over width/height
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, zoom, width, handleTap, commitZoom]);

  const mapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: k.value / OVERSAMPLE }],
  }));

  const camera = useMemo<MapCamera>(() => ({ k, tx, ty, s0, width, height, zoom }), [k, tx, ty, s0, width, height, zoom]);

  const tint = useMemo(() => new Set(tintRegions ?? []), [tintRegions]);
  const stroke = 0.7 / zoom;

  return (
    <View
      onLayout={onLayout}
      style={[styles.box, { height: height || undefined, aspectRatio: height ? undefined : MAP.width / MAP.height, backgroundColor: c.mapSea }, rounded && styles.rounded, style]}
    >
      {width > 0 && (
        <CameraContext.Provider value={camera}>
          <GestureDetector gesture={gesture}>
            <View style={StyleSheet.absoluteFill} collapsable={false}>
              <Animated.View style={[{ width: width * OVERSAMPLE, height: height * OVERSAMPLE, transformOrigin: 'left top' }, mapStyle]}>
                <Svg width={width * OVERSAMPLE} height={height * OVERSAMPLE} viewBox={`0 0 ${MAP.width} ${MAP.height}`}>
                  <Path d={GRATICULE} stroke={c.mapGrid} strokeWidth={1 / zoom} fill="none" />
                  <Land
                    land={c.mapLand}
                    stroke={c.mapStroke}
                    strokeWidth={stroke}
                    tint={tint}
                    inkFor={ink}
                  />
                  {markRegion && (
                    <G>
                      {COUNTRIES.filter((x) => x.region === markRegion.region).map((x) => (
                        <Path key={x.id} d={x.d} fill={alpha(markRegion.color, 0.35)} stroke={markRegion.color} strokeWidth={stroke} />
                      ))}
                    </G>
                  )}
                  {selectedCountry && <Selected id={selectedCountry} fill={c.mapLandHover} stroke={c.inkFaint} strokeWidth={stroke * 1.6} />}
                  {svgChildren}
                </Svg>
              </Animated.View>
              {children}
            </View>
          </GestureDetector>
        </CameraContext.Provider>
      )}
    </View>
  );
});

// The 175 country paths only re-render when theme, tint or zoom changes.
const Land = memo(function Land({
  land,
  stroke,
  strokeWidth,
  tint,
  inkFor,
}: {
  land: string;
  stroke: string;
  strokeWidth: number;
  tint: Set<RegionKey>;
  inkFor: (r: RegionKey) => string;
}) {
  return (
    <G>
      {COUNTRIES.map((x) => (
        <Path
          key={x.id}
          d={x.d}
          fill={tint.has(x.region) ? alpha(inkFor(x.region), 0.22) : land}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
    </G>
  );
});

function Selected({ id, fill, stroke, strokeWidth }: { id: string; fill: string; stroke: string; strokeWidth: number }) {
  const country = COUNTRIES.find((x) => x.id === id);
  if (!country) return null;
  return <Path d={country.d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />;
}

// Places a fixed-size overlay (pin, label, plane) at a map point; it tracks
// pinch and pan without scaling.
export function MapAnchor({
  at,
  anchor = { x: 0.5, y: 1 },
  size,
  children,
  pointerEvents = 'box-none',
}: {
  at: XY;
  anchor?: { x: number; y: number };
  size: { w: number; h: number };
  children: ReactNode;
  pointerEvents?: 'box-none' | 'none' | 'auto';
}) {
  const cam = useMapCamera();
  const style = useAnimatedStyle(() => {
    if (!cam) return {};
    return {
      transform: [
        { translateX: cam.tx.value + cam.k.value * cam.s0 * at.x - size.w * anchor.x },
        { translateY: cam.ty.value + cam.k.value * cam.s0 * at.y - size.h * anchor.y },
      ],
    };
  });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[{ position: 'absolute', left: 0, top: 0, width: size.w, height: size.h }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', overflow: 'hidden' },
  rounded: { borderRadius: 16 },
});
