import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ArrowLeftIcon, CheckCircleIcon, CircleHalfIcon, PencilSimpleIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { STORIES } from '@/src/data/stories';
import { getLesson } from '@/src/data/lessons';
import { XP } from '@/src/data/levels';
import { checkIdeas } from '@/src/lib/keyIdeas';
import { goBack } from '@/src/lib/nav';
import { haptic } from '@/src/lib/haptics';
import { font, radius } from '@/src/theme/tokens';
import type { ExplainStory } from '@/src/data/types';

type Step = 'read' | 'write' | 'feedback';

export default function Explain() {
  const { c, ink } = useTheme();
  const learn = useLearn();
  const [story, setStory] = useState<ExplainStory | null>(null);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen bottomInset>
        <View style={styles.head}>
          <PressableScale onPress={() => (story ? setStory(null) : goBack())} accessibilityLabel="Back" style={[styles.back, { borderColor: c.border, backgroundColor: c.surface }]}>
            <ArrowLeftIcon size={18} color={c.ink} weight="bold" />
          </PressableScale>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="primary">Explain it back</Text>
            <Text variant="h2">{story ? story.title : 'Retell a story in your own words'}</Text>
          </View>
        </View>

        {story ? (
          <Retell key={story.id} story={story} onDone={() => setStory(null)} />
        ) : (
          <View style={styles.list}>
            <Text variant="body" color="inkMuted">
              Read a short story, hide it, then write it back. Explaining something is one of the best ways to remember it.
            </Text>
            {STORIES.map((s) => {
              const l = getLesson(s.lesson)!;
              const tone = ink(l.region);
              const prev = learn.explained[s.id];
              return (
                <PressableScale key={s.id} onPress={() => setStory(s)} scaleTo={0.985} accessibilityLabel={`${s.title}${prev ? ', retold' : ''}`}
                  style={[styles.item, { backgroundColor: c.surface, borderColor: c.border }]}
                >
                  <View style={[styles.spine, { backgroundColor: tone }]} />
                  <Glyph name={l.instrument.glyph} size={22} color={tone} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{s.title}</Text>
                    <Text variant="small" color="inkMuted">{l.shortTitle} · {s.ideas.length} key ideas</Text>
                  </View>
                  {prev && <Text variant="mono" tabular style={{ color: c.teal }}>{prev.hit}/{prev.total}</Text>}
                </PressableScale>
              );
            })}
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Retell({ story, onDone }: { story: ExplainStory; onDone: () => void }) {
  const { c, ink } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const lesson = getLesson(story.lesson)!;
  const tone = ink(lesson.region);
  const [step, setStep] = useState<Step>('read');
  const [text, setText] = useState('');
  const results = step === 'feedback' ? checkIdeas(story, text) : [];
  const hit = results.filter((r) => r.hit).length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const check = () => {
    const r = checkIdeas(story, text);
    const h = r.filter((x) => x.hit).length;
    learn.recordExplain(story.id, h, r.length);
    player.addXp(h * 2 >= r.length ? XP.explainGood : XP.explainTry, 'Explain it back');
    if (h * 2 >= r.length) haptic.correct();
    setStep('feedback');
  };

  return (
    <View style={styles.list}>
      {step === 'read' && (
        <Animated.View entering={FadeIn} style={{ gap: 14 }}>
          <View style={[styles.story, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.spine, { backgroundColor: tone }]} />
            <Text variant="label" style={{ color: tone }}>{lesson.shortTitle} · read carefully</Text>
            <Text variant="body" style={{ fontSize: 17, lineHeight: 27 }}>{story.text}</Text>
          </View>
          <Button label="Hide it and write" icon={PencilSimpleIcon} onPress={() => setStep('write')} full />
        </Animated.View>
      )}

      {step !== 'read' && (
        <Animated.View entering={FadeIn} style={{ gap: 10 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={step === 'write'}
            multiline
            autoFocus
            placeholder="In your own words: who makes this music, where, and what makes it work?"
            placeholderTextColor={c.inkFaint}
            underlineColorAndroid="transparent"
            textAlignVertical="top"
            accessibilityLabel="Your explanation"
            style={[styles.input, { color: c.ink, backgroundColor: c.surface, borderColor: c.borderStrong, fontFamily: font.body }]}
          />
          <Text variant="mono" tabular color="inkFaint" style={{ fontSize: 12 }}>{words} words</Text>
        </Animated.View>
      )}

      {step === 'write' && (
        <View style={{ gap: 8 }}>
          <Button label="Check my explanation" onPress={check} disabled={words < 8} full />
          <Button label="Peek at the story" variant="ghost" onPress={() => setStep('read')} />
        </View>
      )}

      {step === 'feedback' && (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 12 }}>
          <View style={[styles.story, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="label" color="inkMuted">Practice feedback — checks for key ideas</Text>
            <Text variant="h3">{hit} of {results.length} key ideas</Text>
            {results.map((r) => (
              <View key={r.label} style={styles.idea}>
                {r.hit ? <CheckCircleIcon size={20} color={c.teal} weight="fill" /> : <CircleHalfIcon size={20} color={c.inkFaint} />}
                <Text variant="body" style={{ flex: 1, color: r.hit ? c.ink : c.inkMuted }}>{r.label}</Text>
              </View>
            ))}
            <Text variant="small" color="inkFaint">
              It looks for the ideas, not exact words, so a good explanation can still miss one. Read the story again and see what you would add.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Try again" variant="secondary" onPress={() => setStep('write')} style={{ flex: 1 }} size="md" />
            <Button label="More stories" onPress={onDone} style={{ flex: 1 }} size="md" />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, gap: 10, paddingTop: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingLeft: 18, borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  story: { borderWidth: 1, borderRadius: radius.lg, padding: 18, paddingLeft: 22, gap: 10, overflow: 'hidden' },
  input: { minHeight: 180, borderWidth: 1.5, borderRadius: radius.lg, padding: 14, fontSize: 16, lineHeight: 24 },
  idea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
