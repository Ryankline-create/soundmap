import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { Chip } from '@/src/components/ui/Chip';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { CheckCircleIcon, StampIcon, XCircleIcon, ArrowRightIcon } from '@/src/components/ui/icons';
import { ListeningDial } from '@/src/components/dial/ListeningDial';
import { ClipButton } from '@/src/components/ClipButton';
import { LayerMixer } from './LayerMixer';
import { AtlasMap, type AtlasHandle } from '@/src/components/atlas/AtlasMap';
import { MapLabel, MapPin } from '@/src/components/atlas/Pin';
import { RouteArc } from '@/src/components/atlas/FlightArc';
import { Glyph, GLYPH_PARTS, LESSON_PARTS } from '@/src/components/glyphs';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { haptic } from '@/src/lib/haptics';
import { sfx } from '@/src/lib/sfx';
import { project } from '@/src/lib/geo';
import { radius } from '@/src/theme/tokens';
import { getLesson } from '@/src/data/lessons';
import type { Lesson, Place, Slide } from '@/src/data/types';
import type { LESSON_AUDIO } from '@/src/audio/lessonAudio';

type Audio = (typeof LESSON_AUDIO)[string];
type SlideProps = { lesson: Lesson; slide: Slide; audio: Audio; ink: string };

function Head({ slide }: { slide: Slide }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="h2">{slide.title}</Text>
      <Text variant="body" color="inkMuted">{slide.body}</Text>
    </View>
  );
}

export function ListenFirstSlide({ slide, audio, ink }: SlideProps) {
  return (
    <View style={styles.slide}>
      <View style={styles.dial}>
        <ListeningDial pattern={audio.listen} durationMs={12000} color={ink} size={210} label={`Play: ${slide.audioDemo ?? 'the groove'}`} />
        {slide.audioDemo && (
          <Text variant="small" color="inkFaint" center>
            Our synth plays {slide.audioDemo}
          </Text>
        )}
      </View>
      <Head slide={slide} />
    </View>
  );
}

export function NoticeSlide({ slide, audio, ink }: SlideProps) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const toggle = (o: string) => {
    haptic.tap();
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(o)) n.delete(o);
      else n.add(o);
      return n;
    });
  };
  return (
    <View style={styles.slide}>
      <Head slide={slide} />
      {audio.notice ? (
        <ClipButton pattern={audio.notice.pattern} label={slide.clip ?? 'Listen'} sub={audio.notice.label} ink={ink} maxMs={9000} big />
      ) : (
        <ClipButton pattern={audio.listen} label="Listen again" sub={slide.audioDemo} ink={ink} maxMs={9000} big />
      )}
      <Text variant="label" color="inkMuted">What did you notice? Pick any</Text>
      <View style={styles.chips}>
        {(slide.options ?? []).map((o) => (
          <Chip key={o} label={o} tick selected={picked.has(o)} ink={ink} onPress={() => toggle(o)} />
        ))}
      </View>
      {picked.size > 0 && (
        <Animated.View entering={FadeIn} style={[styles.note, { backgroundColor: alpha(ink, 0.08), borderColor: alpha(ink, 0.3) }]}>
          <Text variant="small">There are no wrong answers here. Every listener hears something different, and noticing is the first step.</Text>
        </Animated.View>
      )}
    </View>
  );
}

export function InstrumentSlide({ lesson, slide, audio, ink }: SlideProps) {
  const { c } = useTheme();
  const { glyph, name, parts } = lesson.instrument;
  const anchors = LESSON_PARTS[lesson.slug] ?? GLYPH_PARTS[glyph] ?? [];
  const size = 200;
  return (
    <View style={styles.slide}>
      <View style={[styles.plate, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <View style={{ width: size, height: size }}>
          <Glyph name={glyph} size={size} color={c.ink} strokeWidth={1.1} />
          {anchors.slice(0, 3).map(([x, y], i) => (
            <Animated.View
              key={i}
              entering={FadeIn.delay(200 + i * 160)}
              style={[styles.callout, { left: (x / 24) * size - 12, top: (y / 24) * size - 12, backgroundColor: ink, borderColor: c.surfaceAlt }]}
            >
              <Text variant="label" style={{ color: c.primaryOn, letterSpacing: 0, fontSize: 11 }}>{i + 1}</Text>
            </Animated.View>
          ))}
        </View>
        <Text variant="label" color="inkMuted">{name}</Text>
      </View>
      <Head slide={slide} />
      <View style={{ gap: 8 }}>
        {parts.map((p, i) => (
          <View key={p} style={styles.part}>
            <View style={[styles.num, { borderColor: ink }]}>
              <Text variant="label" style={{ color: ink, letterSpacing: 0 }}>{i + 1}</Text>
            </View>
            <Text variant="body" style={{ flex: 1 }}>{p}</Text>
          </View>
        ))}
      </View>
      {slide.detail && <Text variant="small" color="inkMuted">{slide.detail}</Text>}
      <ClipButton pattern={audio.instrument} label={audio.instrumentLabel} sub={slide.audioDemo ? `Our synth plays ${slide.audioDemo}` : undefined} ink={ink} maxMs={7000} big />
    </View>
  );
}

export function BuiltSlide({ slide, audio, ink }: SlideProps) {
  return (
    <View style={styles.slide}>
      <Head slide={slide} />
      {audio.layers && slide.layers ? (
        <LayerMixer pattern={audio.layers} layers={slide.layers} ink={ink} />
      ) : null}
      {slide.note && <Text variant="small" color="inkMuted">{slide.note.replace(/\s*Nothing is switched on yet\.?/, '')}</Text>}
    </View>
  );
}

export function EarSlide({ slide, audio, ink }: SlideProps) {
  const { c } = useTheme();
  const [choice, setChoice] = useState<number | null>(null);
  const ear = audio.ear;
  if (!ear) return null;
  const labels = slide.choices ?? ear.clips.map((_, i) => `Clip ${String.fromCharCode(65 + i)}`);
  const right = choice === ear.answer;
  const choose = (i: number) => {
    if (choice !== null) return;
    setChoice(i);
    if (i === ear.answer) {
      haptic.correct();
      sfx.correct();
    } else {
      haptic.wrong();
      sfx.wrong();
    }
  };
  return (
    <View style={styles.slide}>
      <Text variant="h2">{slide.title}</Text>
      <Text variant="body" color="inkMuted">{slide.question ?? slide.body}</Text>
      <View style={{ gap: 10 }}>
        {ear.clips.map((p, i) => (
          <View key={p.id} style={styles.earRow}>
            <View style={{ flex: 1 }}>
              <ClipButton pattern={p} label={labels[i]} ink={ink} maxMs={6000} selected={choice === i} />
            </View>
            <PressableScale
              onPress={() => choose(i)}
              disabled={choice !== null && choice !== i && i !== ear.answer}
              accessibilityLabel={`Choose ${labels[i]}`}
              style={[
                styles.pick,
                {
                  borderColor: choice === null ? c.borderStrong : i === ear.answer ? c.teal : choice === i ? c.error : c.border,
                  backgroundColor: choice !== null && i === ear.answer ? c.tealSoft : c.surface,
                },
              ]}
            >
              {choice !== null && i === ear.answer ? (
                <CheckCircleIcon size={22} color={c.teal} weight="fill" />
              ) : choice === i ? (
                <XCircleIcon size={22} color={c.error} weight="fill" />
              ) : (
                <Text variant="smallStrong">This one</Text>
              )}
            </PressableScale>
          </View>
        ))}
      </View>
      {choice !== null && (
        <Animated.View entering={FadeInDown} style={[styles.note, { backgroundColor: right ? c.tealSoft : alpha(c.error, 0.08), borderColor: right ? c.teal : alpha(c.error, 0.4) }]}>
          <Text variant="label" style={{ color: right ? c.teal : c.error }}>{right ? 'Good ears' : `It was ${labels[ear.answer]}`}</Text>
          <Text variant="body">{ear.why}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export function TravelSlide({ lesson, slide, ink }: SlideProps) {
  const map = useRef<AtlasHandle>(null);
  const places: Place[] = [];
  for (const [a, b] of lesson.route) for (const p of [a, b]) if (!places.find((q) => q.name === p.name)) places.push(p);
  useEffect(() => {
    const t = setTimeout(() => map.current?.focus(places.map(project), { pad: 80, maxZoom: 3.4, duration: 900 }), 200);
    return () => clearTimeout(t);
    // places are derived from the lesson
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.slug]);
  return (
    <View style={styles.slide}>
      <Head slide={slide} />
      <AtlasMap
        ref={map}
        svgChildren={lesson.route.map(([a, b], i) => (
          <RouteArc key={i} from={a} to={b} color={ink} delay={1000 + i * 700} duration={1300} />
        ))}
      >
        {places.map((p, i) => (
          <MapPin key={p.name} at={project(p)} color={ink} size="sm" delay={900 + i * 250} />
        ))}
        {places.map((p) => (
          <MapLabel key={`l${p.name}`} at={project(p)} text={p.name} offset={26} />
        ))}
      </AtlasMap>
      {slide.detail && <Text variant="body">{slide.detail}</Text>}
    </View>
  );
}

// Typographic portrait: we show no photos of real people.
export function PortraitSlide({ slide, ink }: SlideProps) {
  const { c } = useTheme();
  const person = slide.person;
  if (!person) return null;
  const { role, years } = splitRole(person.role);
  const words = person.name.split(' ').filter((w) => /^[A-ZÀ-Ž]/.test(w));
  const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : person.name.slice(0, 1)).toUpperCase();
  return (
    <View style={styles.slide}>
      <View style={[styles.portrait, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[styles.portraitTop, { backgroundColor: alpha(ink, 0.08), borderBottomColor: c.border }]}>
          <View style={[styles.monogram, { borderColor: ink }]}>
            <View style={[styles.monoInner, { borderColor: alpha(ink, 0.5) }]}>
              <Text variant="display" style={{ color: ink, fontSize: 40, lineHeight: 52 }}>{initials}</Text>
            </View>
          </View>
          {years && <Text variant="mono" tabular style={{ color: ink }}>{years}</Text>}
        </View>
        <View style={{ padding: 18, gap: 6 }}>
          <Text variant="label" color="inkMuted">People and places</Text>
          <Text variant="h2">{person.name}</Text>
          <Text variant="smallStrong" color="inkMuted">{role}</Text>
          <View style={[styles.rule, { backgroundColor: c.border }]} />
          <Text variant="body">{person.bio}</Text>
        </View>
      </View>
      <Head slide={slide} />
    </View>
  );
}

export function splitRole(r: string): { role: string; years: string | null } {
  let m = r.match(/^(.*?),\s*(about\s+)?(\d{4})\s+to\s+(\d{4})$/);
  if (m) return { role: m[1], years: `${m[2] ? 'c. ' : ''}${m[3]}–${m[4]}` };
  m = r.match(/^(.*?),\s*born\s+(\d{4})$/);
  if (m) return { role: m[1], years: `b. ${m[2]}` };
  m = r.match(/^(.*?)\s+founded in\s+(\d{4})$/);
  if (m) return { role: m[1], years: `Founded ${m[2]}` };
  return { role: r, years: null };
}

export function ConnectionsSlide({ lesson, slide, ink, onFinish, stamped }: SlideProps & { onFinish: () => void; stamped: boolean }) {
  const { c, ink: inkOf } = useTheme();
  return (
    <View style={styles.slide}>
      <Head slide={slide} />
      <View style={{ gap: 10 }}>
        {(slide.connections ?? []).map((cn) => {
          const other = getLesson(cn.slug);
          if (!other) return null;
          const tone = inkOf(other.region);
          return (
            <PressableScale
              key={cn.slug}
              onPress={() => router.push(`/lesson/${cn.slug}`)}
              scaleTo={0.98}
              accessibilityLabel={`Open ${other.title}`}
              style={[styles.conn, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <View style={[styles.connSpine, { backgroundColor: tone }]} />
              <View style={{ flex: 1, gap: 4, padding: 14 }}>
                <View style={styles.connTop}>
                  <Glyph name={other.instrument.glyph} size={20} color={tone} />
                  <Text variant="label" style={{ color: tone, flex: 1 }} numberOfLines={1}>{other.place}</Text>
                  <ArrowRightIcon size={16} color={c.inkMuted} />
                </View>
                <Text variant="h3">{other.title}</Text>
                <Text variant="small" color="inkMuted">{cn.why}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
      <Animated.View entering={FadeInDown.delay(150)} style={{ gap: 8, marginTop: 6 }}>
        <Button label={stamped ? 'Finish' : 'Finish and stamp'} icon={StampIcon} tint={ink} onPress={onFinish} full />
        {!stamped && <Text variant="small" color="inkFaint" center>+80 XP and a {lesson.stamp} stamp</Text>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { gap: 16, paddingBottom: 12 },
  dial: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { padding: 14, borderRadius: radius.md, borderWidth: 1, gap: 4 },
  plate: { alignItems: 'center', paddingVertical: 20, borderRadius: radius.lg, borderWidth: 1, gap: 6 },
  callout: { position: 'absolute', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  part: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  num: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  earRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  pick: { width: 92, borderRadius: radius.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  portrait: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  portraitTop: { alignItems: 'center', paddingVertical: 22, gap: 10, borderBottomWidth: 1 },
  monogram: { width: 112, height: 112, borderRadius: 56, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  monoInner: { width: 98, height: 98, borderRadius: 49, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 1, marginVertical: 4 },
  conn: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  connSpine: { width: 5 },
  connTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
