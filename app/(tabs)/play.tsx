import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { Screen, ScreenTitle } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { CountUp } from '@/src/components/ui/CountUp';
import { ArrowRightIcon, BookOpenIcon, StampIcon } from '@/src/components/ui/icons';
import { ListeningDial } from '@/src/components/dial/ListeningDial';
import { AtlasMap, type AtlasHandle } from '@/src/components/atlas/AtlasMap';
import { MapLabel, MapPin } from '@/src/components/atlas/Pin';
import { ArcStroke, FlightPlane, useArc, useFlight } from '@/src/components/atlas/FlightArc';
import { MiniStory } from '@/src/components/story/MiniStory';
import { Stamp, StampLanding } from '@/src/components/stamp/Stamp';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { ROUNDS, type Round } from '@/src/data/rounds';
import { getLesson, REGION_LABELS } from '@/src/data/lessons';
import { levelFor } from '@/src/data/levels';
import { countryByName, countryLabelPoint, distanceKm, formatKm, project, unproject, type LatLng, type XY } from '@/src/lib/geo';
import { scoreRound, type RoundScore } from '@/src/lib/scoring';
import { haptic } from '@/src/lib/haptics';
import { sfx } from '@/src/lib/sfx';
import { LESSON_AUDIO } from '@/src/audio/lessonAudio';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { Country } from '@/src/data/world';

export default function Play() {
  const player = usePlayer();
  const idx = player.playRound % ROUNDS.length;
  const scroll = useRef<ScrollView>(null);

  // leaving the tab stops the groove
  useFocusEffect(useCallback(() => () => SoundEngine.stop(), []));

  return (
    <Screen hud scrollRef={scroll}>
      <RoundView
        key={idx}
        round={ROUNDS[idx]}
        n={idx + 1}
        scroll={scroll}
        onNext={() => {
          player.setPlayRound(idx + 1);
          scroll.current?.scrollTo({ y: 0, animated: false });
        }}
      />
    </Screen>
  );
}

type Phase = 'listen' | 'flight' | 'result' | 'story' | 'stamped';
type Guess = { at: XY; ll: LatLng; country: Country | null; via: 'map' | 'choice' };

function RoundView({ round, n, onNext, scroll }: { round: Round; n: number; onNext: () => void; scroll: React.RefObject<ScrollView | null> }) {
  const { c, ink } = useTheme();
  const player = usePlayer();
  const lesson = getLesson(round.slug)!;
  const audio = LESSON_AUDIO[round.slug];
  const answer = project(lesson.pin);
  const regionInk = ink(lesson.region);
  const answerCountry = countryByName(lesson.country);

  const [phase, setPhase] = useState<Phase>('listen');
  const [plays, setPlays] = useState(0);
  const firstPlay = useRef<number | null>(null);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [score, setScore] = useState<RoundScore | null>(null);
  const [km, setKm] = useState(0);
  const [xpBefore, setXpBefore] = useState(player.xp);
  const [wasStamped] = useState(!!player.stamps[round.slug]);
  const map = useRef<AtlasHandle>(null);

  const from = guess?.ll ?? lesson.pin;
  const pts = useArc(from, lesson.pin);
  const flight = useFlight(phase !== 'listen', () => {
    if (!score) return;
    player.addXp(score.total, `Round: ${round.tradition}`);
    player.recordRound(round.slug, score.total);
    if (score.region) {
      haptic.correct();
      sfx.correct();
    } else {
      haptic.wrong();
      sfx.wrong();
    }
    setPhase('result');
  });

  useEffect(() => {
    if (phase === 'result' || phase === 'story' || phase === 'stamped') {
      const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 200);
      return () => clearTimeout(t);
    }
  }, [phase, scroll]);

  const extraReplays = Math.max(0, plays - 3);
  const replaysLeft = Math.max(0, 3 - Math.max(1, plays));

  const onTapMap = (p: XY, country: Country | null) => {
    if (phase !== 'listen') return;
    const ll = unproject(p);
    if (!ll) return;
    haptic.tap();
    setGuess({ at: p, ll, country, via: 'map' });
  };

  const choose = (name: string) => {
    const country = countryByName(name);
    if (!country) return;
    const at = name === lesson.country ? answer : countryLabelPoint(country);
    const ll = unproject(at);
    if (!ll) return;
    setGuess({ at, ll, country, via: 'choice' });
  };

  const lockIn = () => {
    if (!guess) return;
    SoundEngine.stop();
    const d = distanceKm(guess.ll, lesson.pin);
    const seconds = firstPlay.current ? (Date.now() - firstPlay.current) / 1000 : 99;
    setKm(d);
    setScore(scoreRound({ guessRegion: guess.country?.region ?? null, answerRegion: lesson.region, km: d, seconds, extraReplays }));
    setXpBefore(player.xp);
    setPhase('flight');
    map.current?.focus([guess.at, answer], { pad: 60, maxZoom: 3 });
  };

  const stampIt = () => {
    player.stamp(round.slug);
    setPhase('stamped');
  };

  const after = levelFor(player.xp);
  const before = levelFor(xpBefore);

  return (
    <View>
      <ScreenTitle kicker="Where in the world?" title={`Round ${n} of ${ROUNDS.length}`} />

      {phase === 'listen' && (
        <Animated.View entering={FadeIn} style={styles.dial}>
          <ListeningDial
            pattern={audio.listen}
            durationMs={10000}
            size={196}
            replaysLeft={plays === 0 ? 2 : replaysLeft}
            onStart={() => {
              if (!firstPlay.current) firstPlay.current = Date.now();
              setPlays((p) => p + 1);
            }}
            label="Play the mystery groove"
          />
          <Text variant="small" color="inkMuted" center style={{ paddingHorizontal: 32 }}>
            {plays === 0 ? 'Listen, then drop a pin where you think it comes from.' : 'Tap the map to drop your pin, or pick a country below.'}
          </Text>
        </Animated.View>
      )}

      <View style={styles.mapWrap}>
        <AtlasMap
          ref={map}
          onTapMap={onTapMap}
          selectedCountry={phase === 'listen' ? guess?.country?.id ?? null : answerCountry?.id ?? null}
          svgChildren={phase !== 'listen' && guess ? <ArcStroke pts={pts} progress={flight} color={regionInk} /> : null}
          style={{ borderWidth: 1, borderColor: c.border }}
        >
          {guess && <MapPin key={`${guess.at.x},${guess.at.y}`} at={guess.at} color={c.ink} size="sm" />}
          {phase !== 'listen' && guess && <FlightPlane pts={pts} progress={flight} color={regionInk} />}
          {(phase === 'result' || phase === 'story' || phase === 'stamped') && (
            <>
              <MapPin at={answer} color={regionInk} pulse />
              <MapLabel at={answer} text={lesson.country} offset={42} />
            </>
          )}
        </AtlasMap>
        {phase === 'listen' && (
          <Text variant="small" color="inkFaint" style={styles.mapHint}>
            Pinch to zoom · double-tap to reset
          </Text>
        )}
      </View>

      {phase === 'listen' && (
        <View style={styles.block}>
          <View style={styles.choices}>
            {round.choices.map((name) => (
              <Chip key={name} label={name} selected={guess?.via === 'choice' && guess.country?.name === name} onPress={() => choose(name)} />
            ))}
          </View>
          <Button
            label={guess ? 'Lock in' : plays === 0 ? 'Listen first' : 'Drop a pin to guess'}
            onPress={lockIn}
            disabled={!guess || plays === 0}
            full
          />
        </View>
      )}

      {phase === 'flight' && score && (
        <View style={[styles.block, { alignItems: 'center' }]}>
          <Text variant="label" color="inkMuted">Distance</Text>
          <CountUp to={km} format={(v) => formatKm(v)} />
        </View>
      )}

      {(phase === 'result' || phase === 'story' || phase === 'stamped') && score && (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.block}>
          <Card style={{ gap: 12 }}>
            <View style={[styles.spine, { backgroundColor: regionInk }]} />
            <View style={{ gap: 2 }}>
              <Text variant="label" style={{ color: regionInk }}>
                {REGION_LABELS[lesson.region]} · {score.region ? 'Right region' : 'Different region'}
              </Text>
              <Text variant="h2">{round.tradition}</Text>
              <Text variant="smallStrong" color="inkMuted">{round.place}</Text>
            </View>
            <Text variant="body">{round.people}</Text>
            <View style={[styles.rule, { backgroundColor: c.border }]} />
            <View style={styles.distance}>
              <Text variant="label" color="inkMuted">Your pin was</Text>
              <Text variant="mono" tabular>{formatKm(km)} away</Text>
            </View>
            <ScoreLine label="Right region" v={score.region} />
            <ScoreLine label="Closeness" v={score.closeness} />
            <ScoreLine label="Quick ear" v={score.fast} />
            {score.replays !== 0 && <ScoreLine label="Extra replays" v={score.replays} />}
            <View style={[styles.rule, { backgroundColor: c.border }]} />
            <View style={styles.total}>
              <Text variant="title">Total</Text>
              <CountUp to={score.total} format={(v) => `+${Math.round(v)} XP`} duration={900} variant="monoLg" style={{ color: c.gold, fontSize: 24, lineHeight: 32 }} />
            </View>
            <View style={{ gap: 6 }}>
              <ProgressBar value={after.level > before.level ? 1 : after.progress} />
              <Text variant="mono" tabular color="inkMuted" style={{ fontSize: 12 }}>
                Level {after.level} · {player.xp}{after.next ? ` / ${after.next}` : ''} XP
              </Text>
            </View>
            {phase === 'result' && (
              <Button label="Unlock the story" icon={BookOpenIcon} tint={regionInk} onPress={() => setPhase('story')} full />
            )}
          </Card>
        </Animated.View>
      )}

      {phase === 'story' && (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.block}>
          <MiniStory lesson={lesson} ink={regionInk} />
          <Button label={wasStamped ? 'See my stamp' : 'Stamp my passport'} icon={StampIcon} tint={regionInk} onPress={stampIt} full />
        </Animated.View>
      )}

      {phase === 'stamped' && (
        <Animated.View entering={FadeIn} style={[styles.block, { alignItems: 'center' }]}>
          <View style={[styles.page, { backgroundColor: c.surface, borderColor: c.border }]}>
            <StampLanding run={!wasStamped}>
              <Stamp
                shape={lesson.stampShape}
                ink={regionInk}
                place={lesson.stamp}
                glyph={lesson.instrument.glyph}
                date={player.stamps[round.slug] ?? Date.now()}
                size={130}
              />
            </StampLanding>
          </View>
          <Text variant="small" color="inkMuted" center>
            {wasStamped ? 'Already in your passport.' : `${Object.keys(player.stamps).length} of 19 stamps`}
          </Text>
          <View style={styles.row}>
            <Button label="Open full lesson" variant="secondary" icon={BookOpenIcon} onPress={() => router.push(`/lesson/${round.slug}`)} style={{ flex: 1 }} size="md" />
            <Button label="Next round" iconRight={ArrowRightIcon} onPress={onNext} style={{ flex: 1 }} size="md" />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function ScoreLine({ label, v }: { label: string; v: number }) {
  const { c } = useTheme();
  return (
    <View style={styles.line}>
      <Text variant="body" color={v ? 'ink' : 'inkFaint'}>{label}</Text>
      <Text variant="mono" tabular style={{ color: v > 0 ? c.teal : v < 0 ? c.error : c.inkFaint }}>
        {v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center', gap: 10, paddingBottom: 14 },
  mapWrap: { paddingHorizontal: 16, gap: 6 },
  mapHint: { textAlign: 'right', paddingRight: 4 },
  block: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spine: { position: 'absolute', left: 0, top: 16, bottom: 16, width: 4, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  rule: { height: 1 },
  distance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  page: { width: '100%', alignItems: 'center', paddingVertical: 26, borderRadius: 16, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
});
