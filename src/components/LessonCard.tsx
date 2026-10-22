import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ArrowRightIcon, PlayIcon, StampIcon, StopIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { radius, shadow } from '@/src/theme/tokens';
import { SoundEngine } from '@/src/audio/SoundEngine';
import { useEngineState } from '@/src/audio/hooks';
import { LESSON_AUDIO } from '@/src/audio/lessonAudio';
import type { Lesson } from '@/src/data/types';

export function LessonCard({ lesson, stamped, compact }: { lesson: Lesson; stamped: boolean; compact?: boolean }) {
  const { c, ink, scheme } = useTheme();
  const tone = ink(lesson.region);
  const listen = LESSON_AUDIO[lesson.slug].listen;
  const engine = useEngineState();
  const previewing = engine.playing && engine.patternId === listen.id;

  const preview = async () => {
    if (previewing) {
      SoundEngine.stop();
      return;
    }
    await SoundEngine.init();
    await SoundEngine.preloadPattern(listen);
    SoundEngine.play(listen, { loop: true, maxMs: 9000 });
  };

  const open = () => router.push(`/lesson/${lesson.slug}`);

  return (
    <PressableScale onPress={open} scaleTo={0.985} accessibilityLabel={`${lesson.title}. ${lesson.place}, ${lesson.era}`}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, scheme === 'light' && shadow.card]}
    >
      <View style={[styles.spine, { backgroundColor: tone }]} />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.glyphs}>
            {lesson.glyphs.map((g) => (
              <View key={g} style={[styles.glyphBox, { backgroundColor: alpha(tone, 0.1) }]}>
                <Glyph name={g} size={20} color={tone} />
              </View>
            ))}
          </View>
          {stamped && (
            <View style={[styles.stamped, { borderColor: tone }]}>
              <StampIcon size={12} color={tone} weight="bold" />
              <Text variant="label" style={{ color: tone, fontSize: 9.5, letterSpacing: 0.8 }}>Stamped</Text>
            </View>
          )}
        </View>
        <Text variant="label" color="inkMuted" numberOfLines={1}>
          {lesson.place} · {lesson.era}
        </Text>
        <Text variant="h3">{lesson.title}</Text>
        {!compact && <Text variant="body" color="inkMuted">{lesson.summary}</Text>}
        <View style={styles.actions}>
          <PressableScale
            onPress={preview}
            accessibilityLabel={previewing ? 'Stop preview' : `Preview ${lesson.shortTitle}`}
            style={[styles.preview, { borderColor: previewing ? tone : c.borderStrong, backgroundColor: previewing ? alpha(tone, 0.1) : 'transparent' }]}
          >
            {previewing ? <StopIcon size={16} color={tone} weight="fill" /> : <PlayIcon size={16} color={c.ink} weight="fill" />}
            <Text variant="smallStrong" style={{ color: previewing ? tone : c.ink }}>{previewing ? 'Playing' : 'Preview'}</Text>
          </PressableScale>
          <Button label="Start" size="sm" tint={tone} iconRight={ArrowRightIcon} onPress={open} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  spine: { width: 6 },
  body: { flex: 1, padding: 16, gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  glyphs: { flexDirection: 'row', gap: 6 },
  glyphBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stamped: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.2, borderRadius: radius.pill, paddingHorizontal: 8, height: 24, transform: [{ rotate: '-4deg' }] },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: radius.lg, borderWidth: 1.5 },
});
