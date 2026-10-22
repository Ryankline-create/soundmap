import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/src/components/ui/Text';
import { useTheme } from '@/src/theme/ThemeProvider';
import { haptic } from '@/src/lib/haptics';
import type { Lesson } from '@/src/data/types';

// Three cards from the lesson itself: the moment, the instrument, the people.
export function storyCards(lesson: Lesson) {
  const pick = (kind: string) => lesson.slides.find((s) => s.kind === kind);
  const cards = [pick('Listen First'), pick('The Instrument'), pick('People And Places') ?? pick('Where It Travelled') ?? pick('Connections')];
  return cards.filter(Boolean).map((s) => ({ kind: s!.kind, title: s!.title, body: s!.body }));
}

export function MiniStory({ lesson, ink, onDone }: { lesson: Lesson; ink: string; onDone?: () => void }) {
  const { c } = useTheme();
  const cards = storyCards(lesson);
  const [i, setI] = useState(0);
  const card = cards[i];

  const go = (d: number) => {
    const n = i + d;
    if (n < 0) return;
    if (n >= cards.length) {
      onDone?.();
      return;
    }
    haptic.tap();
    setI(n);
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.spine, { backgroundColor: ink }]} />
      <View style={styles.bars}>
        {cards.map((_, n) => (
          <View key={n} style={[styles.bar, { backgroundColor: n <= i ? ink : c.border }]} />
        ))}
      </View>
      <Animated.View key={i} entering={FadeIn.duration(220)} style={styles.body}>
        <Text variant="label" style={{ color: ink }}>{card.kind}</Text>
        <Text variant="h3">{card.title}</Text>
        <Text variant="body" color="inkMuted">{card.body}</Text>
      </Animated.View>
      <View style={styles.hint}>
        <Text variant="small" color="inkFaint">{i + 1} of {cards.length}</Text>
        <Text variant="smallStrong" style={{ color: ink }}>{i === cards.length - 1 ? 'Tap to finish' : 'Tap to continue'}</Text>
      </View>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.zones}>
          <Pressable style={{ flex: 1 }} onPress={() => go(-1)} accessibilityLabel="Previous card" />
          <Pressable style={{ flex: 2 }} onPress={() => go(1)} accessibilityLabel={i === cards.length - 1 ? 'Finish the story' : 'Next card'} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, paddingLeft: 22, paddingRight: 18, paddingVertical: 16, overflow: 'hidden', minHeight: 230 },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  bars: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  body: { gap: 6, flex: 1 },
  hint: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  zones: { flex: 1, flexDirection: 'row' },
});
