import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { CountUp } from '@/src/components/ui/CountUp';
import { ArrowRightIcon, CheckCircleIcon, FireIcon, XCircleIcon, XIcon } from '@/src/components/ui/icons';
import { ClipButton } from '@/src/components/ClipButton';
import { AtlasMap } from '@/src/components/atlas/AtlasMap';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { getQuiz } from '@/src/data/quizzes';
import { REGION_LABELS, getLesson } from '@/src/data/lessons';
import { XP } from '@/src/data/levels';
import { goBack } from '@/src/lib/nav';
import { haptic } from '@/src/lib/haptics';
import { sfx } from '@/src/lib/sfx';
import { alpha } from '@/src/lib/color';
import { radius } from '@/src/theme/tokens';
import { LESSON_AUDIO } from '@/src/audio/lessonAudio';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { QuizQuestion, RegionKey } from '@/src/data/types';
import type { Country } from '@/src/data/world';

const KIND_LABEL = { text: 'Question', audio: 'Listen', map: 'Map' } as const;

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = getQuiz(id ?? '');
  const { c } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const awarded = useRef(false);

  useEffect(() => () => SoundEngine.stop(), []);

  if (!quiz) {
    return (
      <Screen bottomInset>
        <View style={{ padding: 24, gap: 12 }}>
          <Text variant="h2">Quiz not found</Text>
          <Button label="Back" onPress={goBack} />
        </View>
      </Screen>
    );
  }

  const q = quiz.questions[i];
  const answered = answers.length > i;
  const score = answers.filter(Boolean).length;
  const xp = score * XP.quizCorrect + (score === quiz.questions.length ? XP.quizPerfect : 0);

  const answer = (correct: boolean) => {
    if (answered) return;
    setAnswers((a) => [...a, correct]);
    if (correct) {
      haptic.correct();
      sfx.correct();
      setStreak((s) => {
        setBestStreak((b) => Math.max(b, s + 1));
        return s + 1;
      });
    } else {
      haptic.wrong();
      sfx.wrong();
      setStreak(0);
    }
  };

  const next = () => {
    SoundEngine.stop();
    if (i < quiz.questions.length - 1) setI(i + 1);
    else {
      setDone(true);
      if (!awarded.current) {
        awarded.current = true;
        learn.recordQuiz(quiz.id, score, quiz.questions.length);
        // let the results card land before a level-up sheet can appear
        setTimeout(() => player.addXp(xp, `Quiz: ${quiz.title}`), 900);
      }
    }
  };

  return (
    <Screen bottomInset>
      <View style={styles.top}>
        <PressableScale onPress={goBack} accessibilityLabel="Close quiz" style={[styles.close, { borderColor: c.border, backgroundColor: c.surface }]}>
          <XIcon size={18} color={c.ink} weight="bold" />
        </PressableScale>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="label" color="inkMuted" numberOfLines={1}>Quiz · {quiz.title}</Text>
          <View style={styles.bars}>
            {quiz.questions.map((_, n) => (
              <View key={n} style={[styles.bar, { backgroundColor: n < answers.length ? (answers[n] ? c.teal : c.error) : n === i && !done ? c.ink : c.border }]} />
            ))}
          </View>
        </View>
        <View style={[styles.streak, { backgroundColor: streak > 1 ? c.goldSoft : 'transparent' }]} accessibilityLabel={`${streak} in a row`}>
          <FireIcon size={16} color={streak > 0 ? c.gold : c.inkFaint} weight={streak > 0 ? 'fill' : 'regular'} />
          <Text variant="mono" tabular style={{ color: streak > 0 ? c.gold : c.inkFaint }}>{streak}</Text>
        </View>
      </View>

      {!done ? (
        <Animated.View key={i} entering={FadeInRight.duration(240)} style={styles.body}>
          <Text variant="label" color="primary">{KIND_LABEL[q.kind]} · {i + 1} of {quiz.questions.length}</Text>
          <Text variant="h2">{q.prompt}</Text>
          {q.kind === 'text' && <TextQ q={q} answered={answered} onAnswer={answer} />}
          {q.kind === 'audio' && <AudioQ q={q} answered={answered} onAnswer={answer} />}
          {q.kind === 'map' && <MapQ q={q} answered={answered} onAnswer={answer} />}
          {answered && (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 12 }}>
              <View style={[styles.note, { backgroundColor: answers[i] ? c.tealSoft : alpha(c.error, 0.08), borderColor: answers[i] ? c.teal : alpha(c.error, 0.4) }]}>
                <Text variant="label" style={{ color: answers[i] ? c.teal : c.error }}>
                  {answers[i] ? (streak > 2 ? `${streak} in a row` : 'Right') : 'Not this time'}
                </Text>
                <Text variant="body">{q.explain}</Text>
              </View>
              <Button label={i < quiz.questions.length - 1 ? 'Next question' : 'See results'} iconRight={ArrowRightIcon} onPress={next} full />
            </Animated.View>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={[styles.body, { alignItems: 'center', paddingTop: 30 }]}>
          <Text variant="label" color="primary">Results</Text>
          <Text variant="display" tabular style={{ fontSize: 72, lineHeight: 92 }}>
            {score}<Text variant="display" style={{ color: c.inkFaint, fontSize: 40, lineHeight: 92 }}> / {quiz.questions.length}</Text>
          </Text>
          <Text variant="body" color="inkMuted" center>
            {score === quiz.questions.length ? 'Every one. That is a careful listener.' : score >= 4 ? 'Strong listening. Check the ones you missed in the lesson.' : 'Worth another pass through the lesson, then try again.'}
          </Text>
          <View style={[styles.result, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Row label="Correct answers" value={`+${score * XP.quizCorrect}`} />
            {score === quiz.questions.length && <Row label="Perfect score" value={`+${XP.quizPerfect}`} />}
            <Row label="Best streak" value={`${bestStreak}`} plain />
            <View style={[styles.rule, { backgroundColor: c.border }]} />
            <View style={styles.row}>
              <Text variant="title">XP earned</Text>
              <CountUp to={xp} format={(v) => `+${Math.round(v)}`} duration={900} style={{ color: c.gold, fontSize: 24, lineHeight: 32 }} />
            </View>
          </View>
          <Button label="Back to Learn" onPress={goBack} full />
        </Animated.View>
      )}
    </Screen>
  );
}

function Row({ label, value, plain }: { label: string; value: string; plain?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="body">{label}</Text>
      <Text variant="mono" tabular style={{ color: plain ? c.inkMuted : c.teal }}>{value}</Text>
    </View>
  );
}

type QProps<K extends QuizQuestion['kind']> = { q: Extract<QuizQuestion, { kind: K }>; answered: boolean; onAnswer: (ok: boolean) => void };

function TextQ({ q, answered, onAnswer }: QProps<'text'>) {
  const { c } = useTheme();
  const [pick, setPick] = useState<number | null>(null);
  return (
    <View style={{ gap: 8 }}>
      {q.options.map((o, n) => {
        const isAnswer = n === q.answer;
        const chosen = pick === n;
        const state = !answered ? 'idle' : isAnswer ? 'right' : chosen ? 'wrong' : 'dim';
        return (
          <PressableScale
            key={n}
            onPress={() => {
              if (answered) return;
              setPick(n);
              onAnswer(isAnswer);
            }}
            accessibilityLabel={o}
            style={[
              styles.option,
              {
                backgroundColor: state === 'right' ? c.tealSoft : state === 'wrong' ? alpha(c.error, 0.08) : c.surface,
                borderColor: state === 'right' ? c.teal : state === 'wrong' ? c.error : c.border,
                opacity: state === 'dim' ? 0.55 : 1,
              },
            ]}
          >
            <Text variant="body" style={{ flex: 1 }}>{o}</Text>
            {state === 'right' && <CheckCircleIcon size={22} color={c.teal} weight="fill" />}
            {state === 'wrong' && <XCircleIcon size={22} color={c.error} weight="fill" />}
          </PressableScale>
        );
      })}
    </View>
  );
}

function AudioQ({ q, answered, onAnswer }: QProps<'audio'>) {
  const { c } = useTheme();
  const [pick, setPick] = useState<number | null>(null);
  return (
    <View style={{ gap: 10 }}>
      {q.options.map((o, n) => {
        const audio = LESSON_AUDIO[o.slug];
        if (!audio) return null;
        const isAnswer = n === q.answer;
        return (
          <View key={n} style={styles.audioRow}>
            <View style={{ flex: 1 }}>
              <ClipButton pattern={audio.listen} label={o.label} ink={c.primary} maxMs={6000} selected={pick === n} />
            </View>
            <PressableScale
              onPress={() => {
                if (answered) return;
                setPick(n);
                SoundEngine.stop();
                onAnswer(isAnswer);
              }}
              accessibilityLabel={`Choose ${o.label}`}
              style={[
                styles.pick,
                {
                  borderColor: !answered ? c.borderStrong : isAnswer ? c.teal : pick === n ? c.error : c.border,
                  backgroundColor: answered && isAnswer ? c.tealSoft : c.surface,
                },
              ]}
            >
              {answered && isAnswer ? (
                <CheckCircleIcon size={22} color={c.teal} weight="fill" />
              ) : answered && pick === n ? (
                <XCircleIcon size={22} color={c.error} weight="fill" />
              ) : (
                <Text variant="smallStrong">This one</Text>
              )}
            </PressableScale>
          </View>
        );
      })}
      {answered && (
        <Text variant="small" color="inkMuted">
          {q.options.map((o) => `${o.label}: ${getLesson(o.slug)?.shortTitle ?? o.slug}`).join(' · ')}
        </Text>
      )}
    </View>
  );
}

function MapQ({ q, answered, onAnswer }: QProps<'map'>) {
  const { c } = useTheme();
  const [tapped, setTapped] = useState<RegionKey | null>(null);
  const onTap = (_p: unknown, country: Country | null) => {
    if (answered || !country) return;
    setTapped(country.region);
    onAnswer(country.region === q.answer);
  };
  return (
    <View style={{ gap: 8 }}>
      <AtlasMap
        onTapMap={onTap}
        markRegion={answered ? { region: q.answer, color: c.teal } : null}
        tintRegions={answered && tapped && tapped !== q.answer ? [tapped] : undefined}
        style={{ borderWidth: 1, borderColor: c.border }}
      />
      <Text variant="small" color="inkMuted">
        {answered
          ? tapped === q.answer
            ? `${REGION_LABELS[q.answer]}, marked in green.`
            : `You tapped ${tapped ? REGION_LABELS[tapped] : 'the sea'}. The answer is ${REGION_LABELS[q.answer]}, marked in green.`
          : 'Tap anywhere inside the region you think it is.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10 },
  close: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingHorizontal: 10, borderRadius: radius.pill },
  body: { paddingHorizontal: 20, paddingTop: 22, gap: 16 },
  note: { padding: 14, borderRadius: radius.md, borderWidth: 1, gap: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderWidth: 1.5, borderRadius: radius.lg },
  audioRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  pick: { width: 92, borderRadius: radius.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  result: { alignSelf: 'stretch', borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 10, marginVertical: 8 },
  rule: { height: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
