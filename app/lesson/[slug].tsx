import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { CountUp } from '@/src/components/ui/CountUp';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@/src/components/ui/icons';
import { Stamp, StampLanding } from '@/src/components/stamp/Stamp';
import {
  BuiltSlide,
  ConnectionsSlide,
  EarSlide,
  InstrumentSlide,
  ListenFirstSlide,
  NoticeSlide,
  PortraitSlide,
  TravelSlide,
} from '@/src/components/story/slides';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { getLesson } from '@/src/data/lessons';
import { XP } from '@/src/data/levels';
import { goBack } from '@/src/lib/nav';
import { haptic } from '@/src/lib/haptics';
import { LESSON_AUDIO } from '@/src/audio/lessonAudio';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { Slide } from '@/src/data/types';

export default function LessonScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const lesson = getLesson(slug ?? '');
  const { c, ink } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const player = usePlayer();
  const learn = useLearn();
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wasStamped] = useState(() => !!(slug && player.stamps[slug]));
  const list = useRef<FlatList<Slide>>(null);

  useEffect(() => () => SoundEngine.stop(), []);

  const go = useCallback(
    (i: number) => {
      if (!lesson) return;
      const n = Math.max(0, Math.min(lesson.slides.length - 1, i));
      SoundEngine.stop();
      haptic.select();
      setIndex(n);
      list.current?.scrollToIndex({ index: n, animated: true });
    },
    [lesson],
  );

  if (!lesson) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + 40, alignItems: 'center' }]}>
        <Text variant="h2">Lesson not found</Text>
        <Button label="Back" onPress={goBack} />
      </View>
    );
  }

  const tone = ink(lesson.region);
  const audio = LESSON_AUDIO[lesson.slug];
  const last = index === lesson.slides.length - 1;

  const finish = () => {
    SoundEngine.stop();
    if (wasStamped) {
      goBack();
      return;
    }
    setFinished(true);
  };

  const landed = () => {
    player.stamp(lesson.slug);
    player.addXp(XP.lessonFinish, `Lesson: ${lesson.shortTitle}`);
    learn.introduce(lesson.slug);
  };

  const toLab = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/lessons');
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) {
      SoundEngine.stop();
      setIndex(i);
    }
  };

  const renderSlide = ({ item, index: i }: { item: Slide; index: number }) => {
    const props = { lesson, slide: item, audio, ink: tone };
    let body: React.ReactNode = null;
    switch (item.kind) {
      case 'Listen First': body = <ListenFirstSlide {...props} />; break;
      case 'What Did You Notice?': body = <NoticeSlide {...props} />; break;
      case 'The Instrument': body = <InstrumentSlide {...props} />; break;
      case 'How It Is Built': body = <BuiltSlide {...props} />; break;
      case 'Ear Challenge': body = <EarSlide {...props} />; break;
      case 'Where It Travelled': body = <TravelSlide {...props} />; break;
      case 'People And Places': body = <PortraitSlide {...props} />; break;
      case 'Connections': body = <ConnectionsSlide {...props} onFinish={finish} stamped={wasStamped} />; break;
    }
    return (
      <ScrollView style={{ width }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text variant="label" style={{ color: tone }}>{String(i + 1).padStart(2, '0')} · {item.kind}</Text>
        {/* only mount the slide's interactive parts when it's near view */}
        {Math.abs(i - index) <= 1 ? body : <View style={{ height: 400 }} />}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={[styles.spine, { backgroundColor: tone, top: insets.top }]} />
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="inkMuted" numberOfLines={1}>{lesson.place}</Text>
            <Text variant="title" numberOfLines={1}>{lesson.shortTitle}</Text>
          </View>
          <PressableScale onPress={goBack} accessibilityLabel="Close lesson" style={[styles.close, { backgroundColor: c.surface, borderColor: c.border }]}>
            <XIcon size={18} color={c.ink} weight="bold" />
          </PressableScale>
        </View>
        <View style={styles.bars}>
          {lesson.slides.map((s, i) => (
            <PressableScale key={i} feedback={false} scaleTo={1} onPress={() => go(i)} accessibilityLabel={`Go to slide ${i + 1}: ${s.kind}`} style={styles.barHit}>
              <View style={[styles.bar, { backgroundColor: i <= index ? tone : c.border }]} />
            </PressableScale>
          ))}
        </View>
      </View>

      <FlatList
        ref={list}
        data={lesson.slides}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderSlide}
        extraData={index}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        initialNumToRender={2}
        windowSize={3}
      />

      <View style={[styles.nav, { paddingBottom: insets.bottom + 10, borderTopColor: c.border, backgroundColor: c.bg }]}>
        <Button label="Back" variant="secondary" size="md" icon={ArrowLeftIcon} onPress={() => go(index - 1)} disabled={index === 0} />
        <Text variant="mono" tabular color="inkMuted">{index + 1} / {lesson.slides.length}</Text>
        {last ? (
          <View style={{ width: 96 }} />
        ) : (
          <Button label="Next" size="md" tint={tone} iconRight={ArrowRightIcon} onPress={() => go(index + 1)} />
        )}
      </View>

      {finished && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.overlay, { backgroundColor: c.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
          <Text variant="label" style={{ color: tone }}>Lesson complete</Text>
          <Text variant="h1" center>{lesson.shortTitle}</Text>
          <View style={[styles.passportPage, { backgroundColor: c.surface, borderColor: c.border }]}>
            <StampLanding run delay={350} onLanded={landed}>
              <Stamp shape={lesson.stampShape} ink={tone} place={lesson.stamp} glyph={lesson.instrument.glyph} date={Date.now()} size={150} />
            </StampLanding>
          </View>
          <Animated.View entering={FadeInDown.delay(700)} style={{ alignItems: 'center', gap: 4 }}>
            <CountUp to={XP.lessonFinish} format={(v) => `+${Math.round(v)} XP`} duration={900} style={{ color: c.gold }} />
            <Text variant="small" color="inkMuted" center>Three new flashcards are waiting in Learn.</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(900)} style={{ alignSelf: 'stretch', gap: 8, marginTop: 'auto' }}>
            <Button label="Back to the Lab" onPress={toLab} full />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  spine: { position: 'absolute', left: 0, bottom: 0, width: 5, zIndex: 2 },
  top: { paddingLeft: 22, paddingRight: 16, paddingTop: 6, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', gap: 4 },
  barHit: { flex: 1, paddingVertical: 6 },
  bar: { height: 3, borderRadius: 2 },
  page: { paddingLeft: 24, paddingRight: 18, paddingTop: 8, paddingBottom: 24, gap: 10 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', gap: 14, paddingHorizontal: 24, zIndex: 5 },
  passportPage: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 36, borderRadius: 18, borderWidth: 1, marginTop: 10 },
});
