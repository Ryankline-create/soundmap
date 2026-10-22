import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { Screen, ScreenTitle } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Chip } from '@/src/components/ui/Chip';
import { Sheet } from '@/src/components/ui/Sheet';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ArrowRightIcon, ArrowSquareOutIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { FURTHER_READING, TOPIC_LABELS, TRENDING } from '@/src/data/trending';
import { REGION_LABELS, REGION_ORDER, getLesson } from '@/src/data/lessons';
import { radius } from '@/src/theme/tokens';
import type { RegionKey, TrendingStory, TrendingTopic } from '@/src/data/types';

// Each story's cover: its region ink, its instrument, and a step-grid pattern
// seeded from its id, like a rhythm written out. No photos.
function Cover({ story, height = 132 }: { story: TrendingStory; height?: number }) {
  const { ink } = useTheme();
  const tone = ink(story.region);
  const cells = useMemo(() => {
    let h = 7;
    for (const ch of story.id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < 16 * 4; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push(((h >>> 16) & 7) < 3 || i % 16 === 0);
    }
    return out;
  }, [story.id]);
  return (
    <View style={[styles.cover, { backgroundColor: tone, height }]}>
      <Svg width="100%" height={height} viewBox="0 0 320 132" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        {cells.map((on, i) => (
          <Rect key={i} x={14 + (i % 16) * 19} y={18 + Math.floor(i / 16) * 26} width={13} height={16} rx={3} fill="#FFFFFF" opacity={on ? 0.24 : 0.07} />
        ))}
      </Svg>
      <View style={styles.coverGlyph}>
        <Glyph name={story.glyph} size={64} color="#FFFFFF" strokeWidth={1.6} />
      </View>
      <View style={styles.coverTag}>
        <Text variant="label" style={{ color: '#FFFFFF', fontSize: 10 }}>{TOPIC_LABELS[story.topic]}</Text>
      </View>
    </View>
  );
}

export default function Trending() {
  const { c, ink } = useTheme();
  const [region, setRegion] = useState<RegionKey | 'all'>('all');
  const [topic, setTopic] = useState<TrendingTopic | 'all'>('all');
  const [open, setOpen] = useState<TrendingStory | null>(null);

  const list = TRENDING.filter((s) => (region === 'all' || s.region === region) && (topic === 'all' || s.topic === topic));

  return (
    <Screen hud>
      <ScreenTitle kicker="Featured music stories" title="Context for what you're hearing" sub="Short reads by the SoundMap team, each with its cultural and historical background." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Chip label="All regions" selected={region === 'all'} onPress={() => setRegion('all')} />
        {REGION_ORDER.map((r) => (
          <Chip key={r} label={REGION_LABELS[r]} dot ink={ink(r)} selected={region === r} onPress={() => setRegion(r)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filters, { paddingTop: 8 }]}>
        <Chip label="All topics" selected={topic === 'all'} onPress={() => setTopic('all')} />
        {(Object.keys(TOPIC_LABELS) as TrendingTopic[]).map((t) => (
          <Chip key={t} label={TOPIC_LABELS[t]} selected={topic === t} onPress={() => setTopic(t)} />
        ))}
      </ScrollView>

      <View style={styles.list}>
        <Text variant="mono" tabular color="inkFaint" style={{ fontSize: 12 }}>{list.length} {list.length === 1 ? 'story' : 'stories'}</Text>
        {list.map((s) => (
          <Animated.View key={s.id} entering={FadeIn.duration(200)}>
            <PressableScale onPress={() => setOpen(s)} scaleTo={0.985} accessibilityLabel={`${s.title}. ${s.dek}`} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Cover story={s} />
              <View style={styles.cardBody}>
                <Text variant="label" style={{ color: ink(s.region) }}>{REGION_LABELS[s.region]} · {s.minutes} min read</Text>
                <Text variant="h3">{s.title}</Text>
                <Text variant="body" color="inkMuted">{s.dek}</Text>
              </View>
            </PressableScale>
          </Animated.View>
        ))}
        {list.length === 0 && (
          <View style={[styles.empty, { borderColor: c.border }]}>
            <Text variant="body" color="inkMuted" center>No stories match both filters yet.</Text>
            <Button label="Clear filters" size="sm" variant="secondary" onPress={() => { setRegion('all'); setTopic('all'); }} />
          </View>
        )}
      </View>

      <Sheet visible={!!open} onClose={() => setOpen(null)} scroll>
        {open && <Article story={open} onLesson={(slug) => { setOpen(null); router.push(`/lesson/${slug}`); }} />}
      </Sheet>
    </Screen>
  );
}

function Article({ story, onLesson }: { story: TrendingStory; onLesson: (slug: string) => void }) {
  const { c, ink } = useTheme();
  const tone = ink(story.region);
  const lesson = story.lesson ? getLesson(story.lesson) : undefined;
  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <Cover story={story} height={120} />
      <Text variant="label" style={{ color: tone }}>By the SoundMap team · {story.minutes} min read</Text>
      <Text variant="h2">{story.title}</Text>
      {story.body.map((p, i) => (
        <Text key={i} variant="body">{p}</Text>
      ))}
      <View style={[styles.note, { borderColor: tone }]}>
        <Text variant="label" style={{ color: tone }}>Cultural significance</Text>
        <Text variant="body">{story.significance}</Text>
      </View>
      <View style={[styles.note, { borderColor: c.borderStrong }]}>
        <Text variant="label" color="inkMuted">Historical context</Text>
        <Text variant="body">{story.history}</Text>
      </View>
      {lesson && <Button label={`From the lesson: ${lesson.shortTitle}`} tint={tone} iconRight={ArrowRightIcon} onPress={() => onLesson(lesson.slug)} full />}
      <Text variant="label" color="inkMuted" style={{ marginTop: 4 }}>Further reading</Text>
      <View style={{ gap: 8 }}>
        {FURTHER_READING.map((f) => (
          <PressableScale key={f.url} onPress={() => Linking.openURL(f.url)} accessibilityRole="link" accessibilityLabel={`${f.label}, opens in your browser`}
            style={[styles.link, { borderColor: c.border, backgroundColor: c.surfaceAlt }]}
          >
            <Text variant="bodyStrong" style={{ flex: 1 }}>{f.label}</Text>
            <ArrowSquareOutIcon size={18} color={c.inkMuted} />
          </PressableScale>
        ))}
      </View>
      <Text variant="small" color="inkFaint">Links go to each publication's music section, not to a specific article.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 16, gap: 8 },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  cover: { borderRadius: radius.md, overflow: 'hidden', justifyContent: 'flex-end' },
  coverGlyph: { position: 'absolute', right: 18, bottom: 14 },
  coverTag: { position: 'absolute', left: 14, bottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: radius.pill, paddingHorizontal: 10, height: 24, justifyContent: 'center' },
  cardBody: { padding: 16, gap: 6 },
  note: { borderLeftWidth: 3, paddingLeft: 12, gap: 4 },
  link: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: radius.md },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: 20, alignItems: 'center', gap: 10 },
});
