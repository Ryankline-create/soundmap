import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { Screen, ScreenTitle } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Segmented } from '@/src/components/ui/Segmented';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { CaretRightIcon, TreeStructureIcon } from '@/src/components/ui/icons';
import { AtlasMap, type AtlasHandle } from '@/src/components/atlas/AtlasMap';
import { MapLabel, MapPin } from '@/src/components/atlas/Pin';
import { MiniStamp } from '@/src/components/stamp/MiniStamp';
import { LessonCard } from '@/src/components/LessonCard';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { LESSONS, REGION_INTROS, REGION_ORDER } from '@/src/data/lessons';
import { project, type XY } from '@/src/lib/geo';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { RegionKey } from '@/src/data/types';

const SHORT: Record<RegionKey, string> = {
  americas: 'Americas',
  africa: 'Africa',
  asia: 'Asia & Oceania',
  mena: 'Mid. East & N. Africa',
  europe: 'Europe',
};

export default function Lessons() {
  const { c, ink } = useTheme();
  const player = usePlayer();
  const newStamp = player.newStamp;
  const initial = newStamp ? LESSONS.find((l) => l.slug === newStamp)?.region ?? 'americas' : 'americas';
  const [region, setRegion] = useState<RegionKey>(initial);
  const [picked, setPicked] = useState<string | null>(null);
  const map = useRef<AtlasHandle>(null);
  const scroll = useRef<ScrollView>(null);
  const cardY = useRef<Record<string, number>>({});
  const listY = useRef(0);
  const sectionY = useRef(0);

  const inRegion = LESSONS.filter((l) => l.region === region);

  // read the latest player inside a stable focus callback
  const latest = useRef(player);
  latest.current = player;
  useFocusEffect(
    useCallback(() => {
      return () => {
        SoundEngine.stop();
        // the glow lasts until you leave the Lab once
        if (latest.current.newStamp) latest.current.clearNewStamp();
      };
    }, []),
  );

  useEffect(() => {
    setPicked(null);
    const t = setTimeout(() => map.current?.focus(inRegion.map((l) => project(l.pin)), { pad: 70, maxZoom: 3.2, duration: 700 }), 80);
    return () => clearTimeout(t);
    // focus whenever the region changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const onTapMap = (p: XY, _c: unknown, unitsPerPt: number) => {
    let best: string | null = null;
    let bestD = 26 * unitsPerPt;
    for (const l of inRegion) {
      const q = project(l.pin);
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = l.slug;
      }
    }
    setPicked(best);
    if (best && cardY.current[best] !== undefined) {
      scroll.current?.scrollTo({ y: sectionY.current + listY.current + cardY.current[best] - 12, animated: true });
    }
  };

  const tone = ink(region);
  const stampedCount = Object.keys(player.stamps).length;

  return (
    <Screen hud scrollRef={scroll}>
      <ScreenTitle kicker="Ethnomusicology Lab" title="Hear it, then meet the people who make it" />

      <PressableScale onPress={() => router.push('/passport')} scaleTo={0.99} accessibilityLabel={`Passport: ${stampedCount} of 19 stamps`} style={styles.stripHead}>
        <Text variant="label" color="inkMuted">Passport stamps</Text>
        <View style={styles.row}>
          <Text variant="mono" tabular color="inkMuted">{stampedCount} of {LESSONS.length}</Text>
          <CaretRightIcon size={14} color={c.inkMuted} />
        </View>
      </PressableScale>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {LESSONS.map((l) => (
          <PressableScale key={l.slug} onPress={() => router.push('/passport')} accessibilityLabel={`${l.shortTitle}${player.stamps[l.slug] ? ', stamped' : ''}`}>
            <MiniStamp ink={ink(l.region)} glyph={l.instrument.glyph} stamped={!!player.stamps[l.slug]} glow={newStamp === l.slug} />
          </PressableScale>
        ))}
      </ScrollView>

      <View style={styles.segment}>
        <Segmented
          scroll
          value={region}
          onChange={setRegion}
          options={REGION_ORDER.map((r) => ({ key: r, label: SHORT[r], ink: ink(r) }))}
        />
      </View>

      <Animated.View key={region} entering={FadeIn.duration(220)} style={styles.section} onLayout={(e) => (sectionY.current = e.nativeEvent.layout.y)}>
        <Text variant="body" color="inkMuted">{REGION_INTROS[region]}</Text>
        <View style={[styles.mapCard, { borderColor: c.border, backgroundColor: c.surface }]}>
          <AtlasMap ref={map} onTapMap={onTapMap} tintRegions={[region]} rounded={false}>
            {inRegion.map((l, i) => (
              <MapPin key={l.slug} at={project(l.pin)} color={tone} size="sm" delay={300 + i * 90} dim={!player.stamps[l.slug] && picked !== l.slug} />
            ))}
            {picked && <MapLabel at={project(LESSONS.find((l) => l.slug === picked)!.pin)} text={LESSONS.find((l) => l.slug === picked)!.shortTitle} offset={30} />}
          </AtlasMap>
          <View style={[styles.mapFoot, { borderTopColor: c.border }]}>
            <Text variant="small" color="inkMuted" style={{ flex: 1 }}>
              {inRegion.length} traditions. Tap a pin to jump to it.
            </Text>
            <Button label="Musical family tree" size="sm" variant="secondary" icon={TreeStructureIcon} onPress={() => router.push('/tree')} />
          </View>
        </View>

        <View style={{ gap: 12 }} onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}>
          {inRegion.map((l) => (
            <View key={l.slug} onLayout={(e) => (cardY.current[l.slug] = e.nativeEvent.layout.y)}>
              <LessonCard lesson={l} stamped={!!player.stamps[l.slug]} />
            </View>
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stripHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  strip: { paddingHorizontal: 16, gap: 6, paddingBottom: 4 },
  segment: { paddingHorizontal: 16, paddingTop: 16 },
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  mapCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  mapFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1 },
});
