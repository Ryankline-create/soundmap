import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Chip } from '@/src/components/ui/Chip';
import { Button } from '@/src/components/ui/Button';
import { ArrowRightIcon } from '@/src/components/ui/icons';
import { ListeningDial } from '@/src/components/dial/ListeningDial';
import { AtlasMap, type AtlasHandle } from '@/src/components/atlas/AtlasMap';
import { MapPin } from '@/src/components/atlas/Pin';
import { ArcStroke, FlightPlane, useArc, useFlight } from '@/src/components/atlas/FlightArc';
import { useTheme } from '@/src/theme/ThemeProvider';
import { project, type LatLng } from '@/src/lib/geo';
import { haptic } from '@/src/lib/haptics';
import { HOOK_PATTERN } from '@/src/audio/patterns';
import { getLesson } from '@/src/data/lessons';

const kora = getLesson('kora')!;

const GUESSES: { key: string; label: string; from: LatLng; right: boolean }[] = [
  { key: 'africa', label: 'Africa?', from: { lat: -2, lng: 22 }, right: true },
  { key: 'samerica', label: 'South America?', from: { lat: -12, lng: -55 }, right: false },
  { key: 'asia', label: 'Somewhere in Asia?', from: { lat: 25, lng: 88 }, right: false },
];

type Phase = 'listen' | 'guess' | 'reveal' | 'question';

export default function Hook() {
  const { c, ink } = useTheme();
  const [phase, setPhase] = useState<Phase>('listen');
  const [guess, setGuess] = useState<(typeof GUESSES)[number] | null>(null);
  const map = useRef<AtlasHandle>(null);
  const africa = ink('africa');

  const from = guess?.from ?? GUESSES[0].from;
  const pts = useArc(from, kora.pin);
  const flight = useFlight(phase === 'reveal' || phase === 'question', () => {
    haptic.correct();
    setTimeout(() => setPhase('question'), 900);
  });

  // chips appear while the groove is still playing
  const started = () => setTimeout(() => setPhase((p) => (p === 'listen' ? 'guess' : p)), 1400);

  const choose = (g: (typeof GUESSES)[number]) => {
    setGuess(g);
    haptic.select();
    setPhase('reveal');
  };

  useEffect(() => {
    if (phase !== 'reveal' || !guess) return;
    const t = setTimeout(() => map.current?.focus([project(guess.from), project(kora.pin)], { pad: 70, maxZoom: 2.6 }), 250);
    return () => clearTimeout(t);
  }, [phase, guess]);

  return (
    <Screen bottomInset>
      <View style={styles.top}>
        <Text variant="label" color="primary">SoundMap</Text>
        <Text variant="h1" center style={{ maxWidth: 320 }}>
          Where do you think this music comes from?
        </Text>
      </View>

      <View style={styles.dial}>
        <ListeningDial pattern={HOOK_PATTERN} durationMs={6000} color={c.primary} size={232} onStart={started} label="Play the mystery sound" />
      </View>

      {phase === 'guess' && (
        <Animated.View entering={FadeInDown.springify().damping(16)} exiting={FadeOut} style={styles.chips}>
          {GUESSES.map((g) => (
            <Chip key={g.key} label={g.label} size="lg" onPress={() => choose(g)} />
          ))}
        </Animated.View>
      )}

      {(phase === 'reveal' || phase === 'question') && guess && (
        <Animated.View entering={FadeIn.duration(260)} style={styles.reveal}>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text variant="label" style={{ color: guess.right ? c.teal : c.inkMuted }}>
              {guess.right ? 'You heard right' : 'Not quite. It travelled from here'}
            </Text>
            <Text variant="h2" center style={{ color: africa }}>West Africa — Mali</Text>
            <Text variant="small" color="inkMuted" center>A kora groove, the 21-string harp of the Mande jali</Text>
          </View>
          <View style={[styles.mapFrame, { borderColor: c.border }]}>
            <AtlasMap
              ref={map}
              interactive={false}
              tintRegions={['africa']}
              svgChildren={<ArcStroke pts={pts} progress={flight} color={africa} />}
            >
              <MapPin at={project(guess.from)} color={c.inkFaint} size="sm" />
              <MapPin at={project(kora.pin)} color={africa} delay={1500} pulse={phase === 'question'} />
              <FlightPlane pts={pts} progress={flight} color={africa} />
            </AtlasMap>
          </View>
        </Animated.View>
      )}

      {phase === 'question' && (
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={styles.question}>
          <Text variant="h3" center>
            Now, a harder question: what do you know about the people who made it?
          </Text>
          <Button label="Continue" iconRight={ArrowRightIcon} onPress={() => router.push('/name')} full />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingTop: 28 },
  dial: { alignItems: 'center', paddingVertical: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  reveal: { paddingHorizontal: 20, gap: 14 },
  mapFrame: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  question: { paddingHorizontal: 24, paddingTop: 18, gap: 16 },
});
