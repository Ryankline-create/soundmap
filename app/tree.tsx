import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Segmented } from '@/src/components/ui/Segmented';
import { Sheet } from '@/src/components/ui/Sheet';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ArrowLeftIcon, ArrowRightIcon } from '@/src/components/ui/icons';
import { AtlasMap, type AtlasHandle } from '@/src/components/atlas/AtlasMap';
import { MapPin } from '@/src/components/atlas/Pin';
import { ArcStroke, RouteArc, useArc } from '@/src/components/atlas/FlightArc';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { LESSONS, REGION_LABELS, REGION_ORDER, getLesson } from '@/src/data/lessons';
import { AXIS_TICKS, ERA_START, TREE_EDGES, tickLabel, yearToX, type TreeEdge } from '@/src/data/tree';
import { arcPoints, project, type XY } from '@/src/lib/geo';
import { goBack } from '@/src/lib/nav';
import { haptic } from '@/src/lib/haptics';
import { font } from '@/src/theme/tokens';
import { useSharedValue } from 'react-native-reanimated';

type View_ = 'map' | 'tree';

export default function Tree() {
  const { c } = useTheme();
  const [view, setView] = useState<View_>('map');
  const [edge, setEdge] = useState<TreeEdge | null>(null);
  const [node, setNode] = useState<string | null>(null);

  return (
    <Screen bottomInset>
      <View style={styles.head}>
        <PressableScale onPress={goBack} accessibilityLabel="Back" style={[styles.back, { borderColor: c.border, backgroundColor: c.surface }]}>
          <ArrowLeftIcon size={18} color={c.ink} weight="bold" />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="primary">Musical family tree</Text>
          <Text variant="h2">No music grows alone</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { key: 'map', label: 'Map' },
            { key: 'tree', label: 'Tree' },
          ]}
        />
        <Text variant="small" color="inkMuted">
          {view === 'map'
            ? `${TREE_EDGES.length} connections from the lessons. Tap a line to see why two traditions are linked.`
            : 'Each tradition on a timeline by when the lesson says it began. Tap one to open it.'}
        </Text>
      </View>

      {view === 'map' ? <MapView onEdge={setEdge} selected={edge} /> : <TreeView onNode={setNode} />}

      <Sheet visible={!!edge} onClose={() => setEdge(null)}>
        {edge && <EdgeCard edge={edge} />}
      </Sheet>
      <Sheet visible={!!node} onClose={() => setNode(null)}>
        {node && <NodeCard slug={node} onOpen={() => { setNode(null); router.push(`/lesson/${node}`); }} />}
      </Sheet>
    </Screen>
  );
}

function MapView({ onEdge, selected }: { onEdge: (e: TreeEdge) => void; selected: TreeEdge | null }) {
  const { ink } = useTheme();
  const map = useRef<AtlasHandle>(null);
  const samples = useMemo(() => TREE_EDGES.map((e) => arcPoints(getLesson(e.a)!.pin, getLesson(e.b)!.pin, 40)), []);

  const onTap = (p: XY, _c: unknown, unitsPerPt: number) => {
    let best = -1;
    let bestD = 22 * unitsPerPt;
    samples.forEach((pts, i) => {
      for (const q of pts) {
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    });
    if (best >= 0) {
      haptic.select();
      onEdge(TREE_EDGES[best]);
    }
  };

  return (
    <Animated.View entering={FadeIn} style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
      <AtlasMap
        ref={map}
        onTapMap={onTap}
        style={{ borderWidth: 1, borderColor: 'transparent' }}
        svgChildren={
          <>
            {TREE_EDGES.map((e, i) => (
              <RouteArc key={i} from={getLesson(e.a)!.pin} to={getLesson(e.b)!.pin} color={ink(getLesson(e.a)!.region)} delay={300 + i * 140} duration={1100} width={1.6} />
            ))}
            {selected && <Highlight edge={selected} />}
          </>
        }
      >
        {LESSONS.map((l, i) => (
          <MapPin key={l.slug} at={project(l.pin)} color={ink(l.region)} size="sm" delay={i * 40} />
        ))}
      </AtlasMap>
      <View style={styles.legend}>
        {REGION_ORDER.map((r) => (
          <View key={r} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: ink(r) }]} />
            <Text variant="small" color="inkMuted">{REGION_LABELS[r]}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function Highlight({ edge }: { edge: TreeEdge }) {
  const { c } = useTheme();
  const pts = useArc(getLesson(edge.a)!.pin, getLesson(edge.b)!.pin);
  const full = useSharedValue(1);
  return <ArcStroke pts={pts} progress={full} color={c.ink} width={3} dashed={false} />;
}

function EdgeCard({ edge }: { edge: TreeEdge }) {
  const { ink } = useTheme();
  const a = getLesson(edge.a)!;
  const b = getLesson(edge.b)!;
  return (
    <View style={{ gap: 14 }}>
      <View style={styles.pair}>
        <Text variant="smallStrong" style={{ color: ink(a.region), flexShrink: 1 }}>{a.shortTitle}</Text>
        <ArrowRightIcon size={16} color={ink(a.region)} />
        <Text variant="smallStrong" style={{ color: ink(b.region), flexShrink: 1 }}>{b.shortTitle}</Text>
      </View>
      {edge.whys.map((w, i) => (
        <View key={i} style={{ gap: 4 }}>
          <Text variant="label" color="inkMuted">Why</Text>
          <Text variant="body">{w.why}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <Button label={a.shortTitle} size="sm" variant="secondary" onPress={() => router.push(`/lesson/${a.slug}`)} style={{ flex: 1 }} />
        <Button label={b.shortTitle} size="sm" variant="secondary" onPress={() => router.push(`/lesson/${b.slug}`)} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const W = 760;
const LANE = 84;
const TOP = 34;
const X0 = 150;
const X1 = W - 40;
const UNDATED_X = 92;

function TreeView({ onNode }: { onNode: (slug: string) => void }) {
  const { c, ink } = useTheme();
  const H = TOP + LANE * REGION_ORDER.length + 10;

  const pos = useMemo(() => {
    const out: Record<string, { x: number; y: number }> = {};
    for (const r of REGION_ORDER) {
      const laneY = TOP + REGION_ORDER.indexOf(r) * LANE + LANE / 2;
      const ls = LESSONS.filter((l) => l.region === r)
        .map((l) => ({ slug: l.slug, x: ERA_START[l.slug] === null ? UNDATED_X : yearToX(ERA_START[l.slug]!, X0, X1) }))
        .sort((a, b) => a.x - b.x);
      let flip = -1;
      let prev = -999;
      for (const n of ls) {
        const crowded = n.x - prev < 70;
        flip = crowded ? -flip : -1;
        out[n.slug] = { x: n.x, y: laneY + (crowded ? flip * 18 : 0) };
        prev = n.x;
      }
    }
    return out;
  }, []);

  return (
    <Animated.View entering={FadeIn} style={{ paddingTop: 14 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={{ width: W, height: H }}>
          <Svg width={W} height={H}>
            {REGION_ORDER.map((r, i) => (
              <Line key={r} x1={0} x2={W} y1={TOP + i * LANE} y2={TOP + i * LANE} stroke={c.border} strokeWidth={1} />
            ))}
            <Line x1={UNDATED_X + 34} x2={UNDATED_X + 34} y1={TOP} y2={H - 10} stroke={c.border} strokeDasharray="3 4" />
            {AXIS_TICKS.map((t) => {
              const x = yearToX(t, X0, X1);
              return (
                <SvgText key={t} x={x} y={18} fill={c.inkFaint} fontSize={10} fontFamily={font.mono} textAnchor="middle">
                  {tickLabel(t)}
                </SvgText>
              );
            })}
            <SvgText x={UNDATED_X} y={18} fill={c.inkFaint} fontSize={10} fontFamily={font.mono} textAnchor="middle">
              long-standing
            </SvgText>
            {TREE_EDGES.map((e, i) => {
              const a = pos[e.a];
              const b = pos[e.b];
              const mx = (a.x + b.x) / 2;
              return (
                <Path
                  key={i}
                  d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
                  stroke={ink(getLesson(e.a)!.region)}
                  strokeOpacity={0.55}
                  strokeWidth={1.6}
                  fill="none"
                />
              );
            })}
          </Svg>
          {REGION_ORDER.map((r, i) => (
            <Text key={r} variant="label" style={[styles.lane, { top: TOP + i * LANE + 6, color: ink(r) }]} numberOfLines={1}>
              {REGION_LABELS[r]}
            </Text>
          ))}
          {LESSONS.map((l) => {
            const p = pos[l.slug];
            const tone = ink(l.region);
            return (
              <PressableScale
                key={l.slug}
                onPress={() => onNode(l.slug)}
                accessibilityLabel={`${l.shortTitle}, ${l.era}`}
                style={[styles.node, { left: p.x - 46, top: p.y - 15, borderColor: tone, backgroundColor: c.surface }]}
              >
                <Glyph name={l.instrument.glyph} size={14} color={tone} />
                <Text variant="smallStrong" numberOfLines={1} style={{ fontSize: 11, lineHeight: 15, color: c.ink, flexShrink: 1 }}>
                  {l.shortTitle.replace('Hindustani ', '').replace('Irish Traditional Music', 'Irish trad').replace('The Oud and Arabic Maqam', 'Oud & maqam')}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function NodeCard({ slug, onOpen }: { slug: string; onOpen: () => void }) {
  const { ink } = useTheme();
  const l = getLesson(slug)!;
  const tone = ink(l.region);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.row}>
        <Glyph name={l.instrument.glyph} size={26} color={tone} />
        <Text variant="label" style={{ color: tone, flex: 1 }}>{l.place} · {l.era}</Text>
      </View>
      <Text variant="h2">{l.title}</Text>
      <Text variant="body" color="inkMuted">{l.summary}</Text>
      <Button label="Open lesson" tint={tone} iconRight={ArrowRightIcon} onPress={onOpen} full style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lane: { position: 'absolute', left: 4, fontSize: 9.5, letterSpacing: 0.8, maxWidth: 140 },
  node: { position: 'absolute', width: 92, height: 30, borderRadius: 15, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
});
