import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ArrowLeftIcon, CheckCircleIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { FLASHCARDS } from '@/src/data/flashcards';
import { getLesson } from '@/src/data/lessons';
import { XP } from '@/src/data/levels';
import { goBack } from '@/src/lib/nav';
import { sfx } from '@/src/lib/sfx';
import { haptic } from '@/src/lib/haptics';
import { radius, shadow } from '@/src/theme/tokens';

const byId = new Map(FLASHCARDS.map((f) => [f.id, f]));

export default function Flashcards() {
  const { c, ink } = useTheme();
  const learn = useLearn();
  const player = usePlayer();
  // today's queue, fixed when you open the deck; "Again" puts a card at the back
  const [queue, setQueue] = useState(() => learn.dueIds.filter((id) => byId.has(id)));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const flip = useSharedValue(0);

  const id = queue[pos];
  const card = id ? byId.get(id) : undefined;
  const lesson = card ? getLesson(card.lesson) : undefined;
  const tone = lesson ? ink(lesson.region) : c.primary;
  const left = queue.length - pos;

  const turn = () => {
    sfx.flip();
    haptic.tap();
    const to = flipped ? 0 : 1;
    flip.value = withTiming(to, { duration: 420, easing: Easing.inOut(Easing.cubic) });
    setFlipped(!flipped);
  };

  const grade = (g: 'again' | 'good' | 'easy') => {
    if (!id) return;
    learn.review(id, g);
    if (g === 'again') setQueue((q) => [...q, id]);
    else {
      player.addXp(XP.cardReview, 'Flashcards');
      setReviewed((n) => n + 1);
    }
    flip.value = 0;
    setFlipped(false);
    setPos((p) => p + 1);
  };

  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 1000 }, { rotateY: `${flip.value * 180}deg` }] }));
  const back = useAnimatedStyle(() => ({ transform: [{ perspective: 1000 }, { rotateY: `${flip.value * 180 - 180}deg` }] }));

  return (
    <Screen bottomInset scroll={false}>
      <View style={styles.head}>
        <PressableScale onPress={goBack} accessibilityLabel="Back" style={[styles.back, { borderColor: c.border, backgroundColor: c.surface }]}>
          <ArrowLeftIcon size={18} color={c.ink} weight="bold" />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="primary">Flashcards</Text>
          <Text variant="h2">{card ? `${left} due today` : 'All caught up'}</Text>
        </View>
      </View>

      {card && lesson ? (
        <View style={styles.body}>
          <Pressable onPress={turn} accessibilityRole="button" accessibilityLabel={flipped ? `Answer: ${card.back}. Tap to see the question` : `${card.front}. Tap to see the answer`} style={styles.cardWrap}>
            <Animated.View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadow.raised, front]}>
              <Side tone={tone} label={lesson.shortTitle} glyph={lesson.instrument.glyph} kind="Question" text={card.front} hint="Tap to flip" />
            </Animated.View>
            <Animated.View style={[styles.card, { backgroundColor: c.surfaceAlt, borderColor: c.border }, shadow.raised, back]}>
              <Side tone={tone} label={lesson.shortTitle} glyph={lesson.instrument.glyph} kind="Answer" text={card.back} hint="How well did you know it?" />
            </Animated.View>
          </Pressable>
          {flipped ? (
            <Animated.View entering={FadeIn} style={styles.grades}>
              <Button label="Again" variant="secondary" onPress={() => grade('again')} style={{ flex: 1 }} />
              <Button label="Good" onPress={() => grade('good')} style={{ flex: 1 }} />
              <Button label="Easy" tint={c.teal} onPress={() => grade('easy')} style={{ flex: 1 }} />
            </Animated.View>
          ) : (
            <Button label="Show answer" variant="secondary" onPress={turn} full />
          )}
          <Text variant="small" color="inkFaint" center>
            Again: back to box 1 and later today. Good: next box. Easy: skip a box.
          </Text>
        </View>
      ) : (
        <Animated.View entering={FadeIn} style={[styles.body, { alignItems: 'center', justifyContent: 'center' }]}>
          <CheckCircleIcon size={56} color={c.teal} weight="duotone" />
          <Text variant="h2" center>Nothing left for today</Text>
          <Text variant="body" color="inkMuted" center>
            {reviewed ? `You reviewed ${reviewed} ${reviewed === 1 ? 'card' : 'cards'} (+${reviewed * XP.cardReview} XP).` : 'Finish a lesson to add its three cards.'} Cards come back as their boxes come due.
          </Text>
          <Button label="Back to Learn" onPress={goBack} full />
        </Animated.View>
      )}
    </Screen>
  );
}

function Side({ tone, label, glyph, kind, text, hint }: { tone: string; label: string; glyph: Parameters<typeof Glyph>[0]['name']; kind: string; text: string; hint: string }) {
  const { c } = useTheme();
  return (
    <>
      <View style={[styles.spine, { backgroundColor: tone }]} />
      <View style={styles.sideTop}>
        <Glyph name={glyph} size={22} color={tone} />
        <Text variant="label" style={{ color: tone, flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text variant="label" color="inkFaint">{kind}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text variant={kind === 'Question' ? 'h2' : 'body'} style={kind === 'Answer' ? { fontSize: 19, lineHeight: 28 } : undefined}>
          {text}
        </Text>
      </View>
      <Text variant="small" style={{ color: c.inkFaint }}>{hint}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  cardWrap: { flex: 1, maxHeight: 440 },
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.xl, borderWidth: 1,
    padding: 22, paddingLeft: 28, gap: 12, backfaceVisibility: 'hidden', overflow: 'hidden',
  },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  sideTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grades: { flexDirection: 'row', gap: 8 },
});
