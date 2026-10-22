import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Screen, ScreenTitle } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { CardsIcon, CaretRightIcon, FireIcon, MedalIcon, PencilSimpleIcon, QuestionIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { QUIZZES } from '@/src/data/quizzes';
import { STORIES } from '@/src/data/stories';
import { getLesson } from '@/src/data/lessons';
import { badgesFor } from '@/src/lib/badges';
import { alpha } from '@/src/lib/color';
import { radius } from '@/src/theme/tokens';

export default function Learn() {
  const { c, ink } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const badges = badgesFor(player, learn);
  const earned = badges.filter((b) => b.earned).length;
  const due = learn.dueIds.length;
  const best = (id: string) => learn.quizzes.filter((q) => q.id === id).reduce<{ score: number; total: number } | null>((m, q) => (!m || q.score > m.score ? q : m), null);

  // quizzes for stamped lessons you haven't taken come first
  const lessonQuizzes = QUIZZES.filter((q) => q.lesson);
  const featured = QUIZZES.find((q) => q.id === 'stories-in-sound');
  const ordered = [...lessonQuizzes].sort((a, b) => {
    const rank = (q: (typeof QUIZZES)[number]) => (player.stamps[q.lesson!] ? (best(q.id) ? 1 : 0) : 2);
    return rank(a) - rank(b) || getLesson(a.lesson!)!.index - getLesson(b.lesson!)!.index;
  });

  return (
    <Screen hud>
      <ScreenTitle kicker="Learn & play" title="Practice what you heard" />

      <View style={styles.stats}>
        <Stat label="Cards due" value={due} />
        <Stat label="Day streak" value={player.streak} icon={<FireIcon size={14} color={c.gold} weight="fill" />} />
        <Stat label="Quizzes" value={new Set(learn.quizzes.map((q) => q.id)).size} />
        <Stat label="Badges" value={`${earned}/4`} />
      </View>

      <View style={styles.section}>
        <View style={styles.pair}>
          <PressableScale onPress={() => router.push('/flashcards')} style={[styles.tool, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel={`Flashcards, ${due} due today`}>
            <CardsIcon size={26} color={c.primary} weight="duotone" />
            <Text variant="title">Flashcards</Text>
            <Text variant="small" color="inkMuted">{due ? `${due} due today` : 'All caught up'}</Text>
          </PressableScale>
          <PressableScale onPress={() => router.push('/explain')} style={[styles.tool, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel="Explain it back">
            <PencilSimpleIcon size={26} color={c.teal} weight="duotone" />
            <Text variant="title">Explain it back</Text>
            <Text variant="small" color="inkMuted">{Object.keys(learn.explained).length} of {STORIES.length} retold</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHead title="Quizzes" icon={<QuestionIcon size={18} color={c.ink} />} />
        {featured && (
          <Card style={{ gap: 8 }}>
            <Text variant="label" color="primary">Across every lesson</Text>
            <Text variant="h3">{featured.title}</Text>
            <Text variant="small" color="inkMuted">Six questions about how the traditions connect.</Text>
            <Button label={best(featured.id) ? `Best ${best(featured.id)!.score}/6 · Play again` : 'Start quiz'} size="md" onPress={() => router.push(`/quiz/${featured.id}`)} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
          </Card>
        )}
        <View style={{ gap: 8 }}>
          {ordered.map((q) => {
            const l = getLesson(q.lesson!)!;
            const b = best(q.id);
            const tone = ink(l.region);
            return (
              <PressableScale key={q.id} onPress={() => router.push(`/quiz/${q.id}`)} scaleTo={0.985} accessibilityLabel={`${q.title} quiz${b ? `, best ${b.score} of ${b.total}` : ''}`}
                style={[styles.quiz, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <View style={[styles.quizGlyph, { backgroundColor: alpha(tone, 0.1) }]}>
                  <Glyph name={l.instrument.glyph} size={22} color={tone} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>{q.title}</Text>
                  <Text variant="small" color="inkMuted" numberOfLines={1}>
                    {player.stamps[l.slug] ? 'Stamped' : 'Not stamped yet'} · {l.regionLabel}
                  </Text>
                </View>
                {b ? (
                  <Text variant="mono" tabular style={{ color: b.score === b.total ? c.teal : c.inkMuted }}>{b.score}/{b.total}</Text>
                ) : (
                  <CaretRightIcon size={16} color={c.inkFaint} />
                )}
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHead title="Badges" icon={<MedalIcon size={18} color={c.ink} />} />
        <View style={styles.badges}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badge, { backgroundColor: c.surface, borderColor: c.border }]} accessible accessibilityLabel={`${b.name}: ${b.status}`}>
              <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', opacity: b.earned ? 1 : 0.55 }}>
                <Svg width={64} height={64} style={{ position: 'absolute' }}>
                  <Circle cx={32} cy={32} r={29} stroke={b.earned ? c.gold : c.borderStrong} strokeWidth={2.5} strokeDasharray={b.earned ? undefined : '4 4'} fill={b.earned ? c.goldSoft : 'none'} />
                  <Circle cx={32} cy={32} r={24} stroke={b.earned ? c.gold : c.border} strokeWidth={1} fill="none" />
                </Svg>
                <Glyph name={b.glyph} size={26} color={b.earned ? c.gold : c.inkFaint} />
              </View>
              <Text variant="smallStrong" center>{b.name}</Text>
              <Text variant="small" color="inkMuted" center>{b.detail}</Text>
              {!b.earned && <ProgressBar value={b.progress} height={4} style={{ alignSelf: 'stretch' }} />}
              <Text variant="label" style={{ color: b.earned ? c.gold : c.inkFaint, fontSize: 10 }}>{b.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon}
        <Text variant="monoLg" tabular style={{ fontSize: 22, lineHeight: 29 }}>{value}</Text>
      </View>
      <Text variant="label" color="inkMuted" style={{ fontSize: 9.5, letterSpacing: 0.8 }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function SectionHead({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon}
      <Text variant="h3">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  stat: { flex: 1, borderWidth: 1, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center', gap: 2 },
  section: { paddingHorizontal: 16, paddingTop: 22, gap: 12 },
  pair: { flexDirection: 'row', gap: 10 },
  tool: { flex: 1, borderWidth: 1, borderRadius: radius.lg, padding: 14, gap: 6 },
  quiz: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderWidth: 1, borderRadius: radius.md },
  quizGlyph: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: '48%', flexGrow: 1, borderWidth: 1, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 6 },
});
