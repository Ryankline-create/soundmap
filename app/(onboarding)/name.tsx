import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { ArrowRightIcon } from '@/src/components/ui/icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { radius, font, shadow } from '@/src/theme/tokens';
import { haptic } from '@/src/lib/haptics';
import { stampDate } from '@/src/components/stamp/Stamp';
import { LESSONS } from '@/src/data/lessons';
import { SEED_STAMPS } from '@/src/state/seed';

const cover = require('@/assets/images/passport-cover.png');

export default function Name() {
  const { c } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const flip = useSharedValue(0);

  const trimmed = name.trim();

  const issue = () => {
    if (!trimmed) return;
    haptic.success();
    setOpen(true);
    flip.value = withDelay(250, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }));
  };

  const start = () => {
    player.finishOnboarding(trimmed);
    learn.seed();
    router.replace('/play');
  };

  const coverStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${-flip.value * 180}deg` }],
    opacity: flip.value > 0.5 ? 0 : 1,
  }));
  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${180 - flip.value * 180}deg` }],
    opacity: flip.value > 0.5 ? 1 : 0,
  }));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen bottomInset>
        <View style={styles.head}>
          <Text variant="label" color="primary">Your passport</Text>
          <Text variant="h1">{open ? `Welcome, ${trimmed}.` : 'Whose name goes in it?'}</Text>
          <Text variant="body" color="inkMuted">
            {open
              ? 'Every tradition you listen your way into earns a stamp. A few pages are already filled in for this demo.'
              : 'Your listening passport collects a stamp for every place you hear your way into.'}
          </Text>
        </View>

        <View style={styles.book}>
          <Animated.View style={[styles.face, { backgroundColor: c.surfaceAlt, borderColor: c.border }, shadow.raised, coverStyle]}>
            <View style={[styles.coverFrame, { borderColor: c.borderStrong }]}>
              <Image source={cover} style={styles.coverArt} resizeMode="contain" accessibilityLabel="Passport cover" />
            </View>
            <Text variant="label" color="inkMuted">Listening passport</Text>
          </Animated.View>
          <Animated.View style={[styles.face, styles.page, { backgroundColor: c.surface, borderColor: c.border }, shadow.raised, pageStyle]}>
            <Text variant="label" color="inkFaint">Passport of</Text>
            <Text variant="h1" numberOfLines={1} adjustsFontSizeToFit style={{ color: c.ink }}>{trimmed || ' '}</Text>
            <View style={[styles.rule, { backgroundColor: c.border }]} />
            <Row k="Issued" v={stampDate(Date.now())} />
            <Row k="Level" v="1" />
            <Row k="Stamps" v={`${SEED_STAMPS.length} of ${LESSONS.length}`} />
            <Text variant="small" color="inkFaint" style={{ marginTop: 'auto' }}>
              SOUNDMAP{'<<'}{trimmed.toUpperCase().replace(/\s+/g, '<')}{'<<<<<<<<<'}
            </Text>
          </Animated.View>
        </View>

        {!open ? (
          <Animated.View entering={FadeInDown} style={styles.form}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="First name"
              placeholderTextColor={c.inkFaint}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={24}
              returnKeyType="done"
              onSubmitEditing={issue}
              underlineColorAndroid="transparent"
              accessibilityLabel="Your first name"
              style={[styles.input, { color: c.ink, backgroundColor: c.surface, borderColor: c.borderStrong, fontFamily: font.bodySemi }]}
            />
            <Button label="Open my passport" onPress={issue} disabled={!trimmed} full />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.delay(1100)} style={styles.form}>
            <Button label="Start listening" iconRight={ArrowRightIcon} onPress={start} full />
          </Animated.View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" color="inkFaint">{k}</Text>
      <Text variant="mono" tabular>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 24, paddingTop: 28, gap: 8 },
  book: { height: 300, marginTop: 24, marginHorizontal: 40, alignItems: 'center', justifyContent: 'center' },
  face: {
    position: 'absolute', width: '100%', height: '100%', borderRadius: radius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 12, backfaceVisibility: 'hidden',
  },
  coverFrame: { width: 150, height: 150, borderRadius: radius.md, borderWidth: 1, padding: 10 },
  coverArt: { width: '100%', height: '100%' },
  page: { alignItems: 'stretch', justifyContent: 'flex-start', padding: 22, gap: 8 },
  rule: { height: 1, marginVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  form: { paddingHorizontal: 24, paddingTop: 24, gap: 12 },
  input: { height: 54, borderRadius: radius.lg, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 18 },
});
