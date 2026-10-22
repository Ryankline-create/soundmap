import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { ArrowRightIcon, LockSimpleIcon, PlayIcon, TargetIcon, XIcon } from '@/src/components/ui/icons';
import { Engraved, Led } from './parts';
import { alpha } from '@/src/lib/color';
import { deck, font, radius } from '@/src/theme/tokens';
import { haptic } from '@/src/lib/haptics';
import { XP } from '@/src/data/levels';
import { SoundEngine } from '@/src/audio/SoundEngine';
import { COACH } from '@/src/audio/coach';

export type Coach = (typeof COACH)[number];

const PERFECT_MS = 60;
const GOOD_MS = 120;
const LEAD_MS = 1300;
const JUDGED_BARS = 2;

type Target = { id: number; lane: number; t: number; judged: null | 'perfect' | 'good' | 'miss' };

// The list: ten patterns, each with a level, a tempo, how it works, and its lesson.
export function CoachList({ inkFor, unlocked, onLoad, onPlay }: {
  inkFor: (pack: string) => string;
  unlocked: string[];
  onLoad: (c: Coach) => void;
  onPlay: (c: Coach) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {COACH.map((c) => {
        const tone = inkFor(c.pack);
        const open = unlocked.includes(c.pack);
        return (
          <View key={c.id} style={[styles.item, { borderColor: deck.padEdge, backgroundColor: deck.panel }]}>
            <View style={[styles.itemSpine, { backgroundColor: tone }]} />
            <View style={styles.itemTop}>
              <View style={{ flex: 1 }}>
                <Text variant="title" style={{ color: deck.readout }}>{c.name}</Text>
                <Text variant="small" style={{ color: deck.label }}>{c.origin}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`Level ${c.level} of 3`}>
                  {[1, 2, 3].map((n) => (
                    <Led key={n} on={n <= c.level} color={tone} size={7} />
                  ))}
                </View>
                <Text variant="mono" tabular style={{ color: deck.led, fontSize: 12 }}>{c.bpm} BPM</Text>
              </View>
            </View>
            <Text variant="small" style={{ color: deck.label }}>{c.note[0]}</Text>
            <Text variant="small" style={{ color: deck.faint }}>{c.note[1]}</Text>
            <Pressable onPress={() => router.push(`/lesson/${c.lesson}`)} accessibilityRole="link" style={styles.lessonLink}>
              <Text variant="smallStrong" style={{ color: tone }}>{c.lessonLabel}</Text>
              <ArrowRightIcon size={13} color={tone} />
            </Pressable>
            <View style={styles.itemActions}>
              <Pressable onPress={() => open && onLoad(c)} disabled={!open} accessibilityRole="button" accessibilityLabel={open ? `Load ${c.name} into the grid` : `${c.name} needs its pack`}
                style={[styles.coachBtn, { borderColor: deck.padEdge, opacity: open ? 1 : 0.6 }]}
              >
                {!open && <LockSimpleIcon size={13} color={deck.faint} />}
                <Text variant="label" style={{ color: deck.readout, fontSize: 10 }}>{open ? 'Load' : 'Pack locked'}</Text>
              </Pressable>
              <Pressable onPress={() => onPlay(c)} accessibilityRole="button" accessibilityLabel={`Play along with ${c.name}`}
                style={[styles.coachBtn, { borderColor: tone, backgroundColor: alpha(tone, 0.16) }]}
              >
                <TargetIcon size={14} color={tone} weight="bold" />
                <Text variant="label" style={{ color: tone, fontSize: 10 }}>Play along</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Play-along: one bar to count in, then two judged bars. Notes fall toward the
// pads and land on the beat; each tap is judged against the engine's clock.
export function PlayAlong({ coach, ink, onClose, onXp }: { coach: Coach | null; ink: string; onClose: () => void; onXp: (xp: number) => void }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'ready' | 'count' | 'play' | 'done'>('ready');
  const [targets, setTargets] = useState<Target[]>([]);
  const [count, setCount] = useState(4);
  const [now, setNow] = useState(0);
  const [lastJudge, setLastJudge] = useState<Record<number, { kind: string; at: number }>>({});
  const targetsRef = useRef<Target[]>([]);
  const endAt = useRef(0);
  const lat = useRef(0);

  const lanes = coach?.lanes ?? [];

  const stop = useCallback(() => {
    SoundEngine.stop();
  }, []);

  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    if (!coach) {
      setPhase('ready');
      setTargets([]);
    }
  }, [coach]);

  const start = async () => {
    if (!coach) return;
    await SoundEngine.init();
    await SoundEngine.preload([...coach.pattern.tracks.map((t) => t.sample), ...lanes.map((l) => l.sample)]);
    const pattern = { ...coach.pattern, bpm: coach.bpm, id: `coach-${coach.id}` };
    SoundEngine.play(pattern, { loop: true });
    const clk = SoundEngine.clock();
    if (!clk) return;
    lat.current = SoundEngine.latencyMs ?? 0;
    const steps = pattern.steps;
    const cycle = steps * (pattern.bars ?? 1);
    const swing = pattern.swing ?? 0;
    const list: Target[] = [];
    let id = 0;
    for (let n = steps; n < steps * (1 + JUDGED_BARS); n++) {
      lanes.forEach((lane, li) => {
        if (lane.hits.includes(n % cycle)) {
          const t = clk.start + n * clk.stepMs + (n % 2 === 1 ? swing * clk.stepMs : 0) + lat.current;
          list.push({ id: id++, lane: li, t, judged: null });
        }
      });
    }
    targetsRef.current = list;
    setTargets(list);
    endAt.current = clk.start + steps * (1 + JUDGED_BARS) * clk.stepMs + lat.current + GOOD_MS + 40;
    setPhase('count');
  };

  // count-in display and the miss sweep run off one ticking clock
  useEffect(() => {
    if (phase !== 'count' && phase !== 'play') return;
    const offStep = SoundEngine.onStep((e) => {
      if (e.bar === 0) {
        const beat = coach && coach.pattern.steps === 12 ? 3 : 4;
        if (e.step % beat === 0) setCount(Math.round((coach!.pattern.steps - e.step) / beat));
      } else if (phase === 'count') setPhase('play');
    });
    const id = setInterval(() => {
      const t = SoundEngine.now();
      setNow(t);
      let changed = false;
      for (const tg of targetsRef.current) {
        if (!tg.judged && t > tg.t + GOOD_MS) {
          tg.judged = 'miss';
          changed = true;
          setLastJudge((j) => ({ ...j, [tg.lane]: { kind: 'Miss', at: t } }));
        }
      }
      if (changed) setTargets([...targetsRef.current]);
      if (t > endAt.current) {
        clearInterval(id);
        stop();
        setPhase('done');
      }
    }, 16);
    return () => {
      offStep();
      clearInterval(id);
    };
  }, [phase, coach, stop]);

  const tap = (lane: number) => {
    if (!coach) return;
    SoundEngine.hit(lanes[lane].sample);
    haptic.tap();
    if (phase !== 'play' && phase !== 'count') return;
    const t = SoundEngine.now();
    let best: Target | null = null;
    for (const tg of targetsRef.current) {
      if (tg.lane !== lane || tg.judged) continue;
      if (!best || Math.abs(tg.t - t) < Math.abs(best.t - t)) best = tg;
    }
    if (!best) return;
    const d = Math.abs(best.t - t);
    if (d <= GOOD_MS) {
      best.judged = d <= PERFECT_MS ? 'perfect' : 'good';
      setLastJudge((j) => ({ ...j, [lane]: { kind: d <= PERFECT_MS ? 'Perfect' : 'Good', at: t } }));
      setTargets([...targetsRef.current]);
    } else {
      setLastJudge((j) => ({ ...j, [lane]: { kind: t < best!.t ? 'Early' : 'Late', at: t } }));
    }
  };

  const stats = useMemo(() => {
    const perfect = targets.filter((t) => t.judged === 'perfect').length;
    const good = targets.filter((t) => t.judged === 'good').length;
    const miss = targets.filter((t) => t.judged === 'miss').length;
    const total = targets.length || 1;
    const accuracy = (perfect + good * 0.6) / total;
    return { perfect, good, miss, accuracy, xp: Math.round(accuracy * XP.coachMax) };
  }, [targets]);

  const awarded = useRef(false);
  useEffect(() => {
    if (phase === 'done' && !awarded.current) {
      awarded.current = true;
      if (stats.xp > 0) onXp(stats.xp);
      haptic.success();
    }
    if (phase === 'ready') awarded.current = false;
  }, [phase, stats.xp, onXp]);

  if (!coach) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={() => { stop(); onClose(); }} statusBarTranslucent navigationBarTranslucent>
      <View style={[styles.modal, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.modalHead}>
          <View style={{ flex: 1 }}>
            <Engraved>Rhythm Coach · play along</Engraved>
            <Text variant="h2" style={{ color: deck.readout }}>{coach.name}</Text>
          </View>
          <Pressable onPress={() => { stop(); onClose(); }} accessibilityLabel="Close play-along" style={styles.close}>
            <XIcon size={18} color={deck.readout} weight="bold" />
          </Pressable>
        </View>

        {phase === 'ready' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <Text variant="body" style={{ color: deck.label, textAlign: 'center' }}>{coach.note[0]}</Text>
            <Text variant="small" style={{ color: deck.faint, textAlign: 'center' }}>
              One bar to count in, then two bars to play. Tap each pad as its note reaches the line. Within 60 ms is Perfect, within 120 ms is Good.
            </Text>
            <Button label="Start" icon={PlayIcon} tint={ink} onPress={start} />
          </Animated.View>
        )}

        {(phase === 'count' || phase === 'play') && (
          <View style={{ flex: 1 }}>
            <View style={styles.counter}>
              <Text variant="monoLg" tabular style={{ color: phase === 'count' ? deck.led : deck.faint, fontSize: 40, lineHeight: 52 }}>
                {phase === 'count' ? count : '•'}
              </Text>
              <Text variant="label" style={{ color: deck.faint }}>{phase === 'count' ? 'Count in' : `${coach.bpm} BPM`}</Text>
            </View>
            <View style={styles.highway}>
              {lanes.map((lane, li) => {
                const next = targets.find((t) => t.lane === li && !t.judged);
                const near = next ? Math.max(0, 1 - (next.t - now) / 400) : 0;
                const judge = lastJudge[li];
                const showJudge = judge && now - judge.at < 500;
                return (
                  <View key={li} style={[styles.lane, { borderColor: deck.padEdge }]}>
                    <View style={[styles.lineHit, { backgroundColor: alpha(ink, 0.6) }]} />
                    {targets
                      .filter((t) => t.lane === li && t.t - now < LEAD_MS && now - t.t < 220)
                      .map((t) => (
                        <FallingNote key={t.id} target={t} now={now} ink={ink} />
                      ))}
                    {showJudge && (
                      <Text variant="label" style={[styles.judge, { color: judge.kind === 'Perfect' ? deck.led : judge.kind === 'Good' ? ink : deck.label }]}>
                        {judge.kind}
                      </Text>
                    )}
                    <Pressable onPressIn={() => tap(li)} accessibilityRole="button" accessibilityLabel={`Tap ${lane.label}`} style={styles.lanePadHit}>
                      <View style={[styles.lanePad, { borderColor: near > 0 ? ink : deck.padEdge, backgroundColor: near > 0 ? alpha(ink, 0.15 + near * 0.55) : deck.pad }]}>
                        <Text variant="label" style={{ color: deck.readout, fontSize: 11, letterSpacing: 0.4, textTransform: 'none', fontFamily: font.bodyBold }}>{lane.label}</Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {phase === 'done' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <Engraved>Accuracy</Engraved>
            <Text variant="display" tabular style={{ color: deck.readout, fontSize: 64, lineHeight: 82 }}>{Math.round(stats.accuracy * 100)}%</Text>
            <View style={styles.statsRow}>
              <Stat label="Perfect" value={stats.perfect} color={deck.led} />
              <Stat label="Good" value={stats.good} color={ink} />
              <Stat label="Miss" value={stats.miss} color={deck.label} />
            </View>
            <Text variant="mono" tabular style={{ color: deck.led }}>+{stats.xp} XP</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              <Button label="Again" variant="secondary" onPress={() => { setPhase('ready'); setTargets([]); setLastJudge({}); }} style={{ flex: 1 }} />
              <Button label="Done" tint={ink} onPress={onClose} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

function FallingNote({ target, now, ink }: { target: Target; now: number; ink: string }) {
  // position from time, so a slow frame never puts a note in the wrong place
  const y = useSharedValue(1 - (target.t - now) / LEAD_MS);
  useEffect(() => {
    const remaining = target.t - SoundEngine.now();
    y.value = withTiming(1 + 220 / LEAD_MS, { duration: Math.max(0, remaining + 220), easing: Easing.linear });
    // only on mount: the timing animation carries it from here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ top: `${Math.min(1.1, y.value) * 80}%` }));
  const hit = target.judged === 'perfect' || target.judged === 'good';
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.note, { backgroundColor: hit ? deck.led : target.judged === 'miss' ? deck.ledOff : ink, opacity: hit ? 0.4 : 1 }, style]}
    />
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text variant="monoLg" tabular style={{ color }}>{value}</Text>
      <Engraved>{label}</Engraved>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { borderWidth: 1, borderRadius: radius.md, padding: 14, paddingLeft: 18, gap: 4, overflow: 'hidden' },
  itemSpine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  itemTop: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  lessonLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-start' },
  itemActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  coachBtn: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  modal: { flex: 1, backgroundColor: deck.body, paddingHorizontal: 16, gap: 12 },
  modalHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: deck.pad, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 12 },
  counter: { alignItems: 'center', height: 76 },
  highway: { flex: 1, flexDirection: 'row', gap: 10 },
  lane: { flex: 1, borderWidth: 1, borderRadius: 14, backgroundColor: deck.well, overflow: 'hidden' },
  lineHit: { position: 'absolute', left: 0, right: 0, top: '80%', height: 3 },
  note: { position: 'absolute', left: '18%', right: '18%', height: 18, borderRadius: 9, marginTop: -9 },
  judge: { position: 'absolute', top: '62%', alignSelf: 'center', fontSize: 13 },
  lanePadHit: { position: 'absolute', left: 6, right: 6, bottom: 6, height: '17%' },
  lanePad: { flex: 1, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch' },
});
