import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { Segmented } from '@/src/components/ui/Segmented';
import { Sheet } from '@/src/components/ui/Sheet';
import { Button } from '@/src/components/ui/Button';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { ArrowCounterClockwiseIcon, ArrowLeftIcon, ArrowRightIcon, SpeakerHighIcon, SpeakerSlashIcon } from '@/src/components/ui/icons';
import { Stamp, stampDate } from '@/src/components/stamp/Stamp';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { useLearn } from '@/src/state/LearnContext';
import { useDeck } from '@/src/state/DeckContext';
import { LESSONS, REGION_LABELS, REGION_ORDER, getLesson } from '@/src/data/lessons';
import { PACK_UNLOCKS } from '@/src/data/levels';
import { goBack } from '@/src/lib/nav';
import { radius } from '@/src/theme/tokens';
import { clearAll } from '@/src/state/storage';
import { SoundEngine } from '@/src/audio/SoundEngine';
import type { ThemeMode } from '@/src/theme/ThemeProvider';

const cover = require('@/assets/images/passport-cover.png');

export default function Passport() {
  const { c, ink } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const deck = useDeck();
  const [open, setOpen] = useState<string | null>(null);
  const count = Object.keys(player.stamps).length;
  const { level, next, progress } = player.level;
  const nextPack = PACK_UNLOCKS.find((p) => p.xp > player.xp);

  const reset = () => {
    Alert.alert('Reset the demo?', 'This clears your name, stamps, XP and SoundDeck loops, and starts again from the first screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          SoundEngine.stop();
          await clearAll();
          player.reset();
          learn.reset();
          deck.reset();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/hook');
        },
      },
    ]);
  };

  const opened = open ? getLesson(open) : null;

  return (
    <Screen bottomInset>
      <View style={styles.head}>
        <PressableScale onPress={goBack} accessibilityLabel="Back" style={[styles.back, { borderColor: c.border, backgroundColor: c.surface }]}>
          <ArrowLeftIcon size={18} color={c.ink} weight="bold" />
        </PressableScale>
        <Text variant="label" color="primary">Listening passport</Text>
      </View>

      <View style={[styles.cover, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <View style={[styles.art, { borderColor: c.borderStrong, backgroundColor: c.surface }]}>
          <Image source={cover} style={{ width: '100%', height: '100%' }} resizeMode="contain" accessibilityLabel="Passport cover" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="label" color="inkFaint">Passport of</Text>
          <Text variant="h1" numberOfLines={1} adjustsFontSizeToFit>{player.name || 'Listener'}</Text>
          <Text variant="mono" tabular color="inkMuted">{count} of {LESSONS.length} stamps</Text>
          <ProgressBar value={count / LESSONS.length} color={c.primary} height={5} />
        </View>
      </View>

      {REGION_ORDER.map((r) => {
        const ls = LESSONS.filter((l) => l.region === r);
        const got = ls.filter((l) => player.stamps[l.slug]).length;
        return (
          <View key={r} style={[styles.page, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.pageHead}>
              <Text variant="label" style={{ color: ink(r) }}>{REGION_LABELS[r]}</Text>
              <Text variant="mono" tabular color="inkFaint" style={{ fontSize: 12 }}>{got}/{ls.length}</Text>
            </View>
            <View style={styles.grid}>
              {ls.map((l) => {
                const at = player.stamps[l.slug];
                return (
                  <PressableScale
                    key={l.slug}
                    onPress={() => (at ? setOpen(l.slug) : router.push(`/lesson/${l.slug}`))}
                    scaleTo={0.97}
                    accessibilityLabel={at ? `${l.stamp} stamp, ${stampDate(at)}` : `${l.stamp}, not stamped. Open the lesson`}
                    style={styles.cell}
                  >
                    <Stamp shape={l.stampShape} ink={ink(l.region)} place={l.stamp} glyph={l.instrument.glyph} date={at} size={92} empty={!at} />
                    {!at && <Text variant="small" color="inkFaint" numberOfLines={1}>{l.shortTitle}</Text>}
                  </PressableScale>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={[styles.page, { backgroundColor: c.surface, borderColor: c.border, gap: 10 }]}>
        <Text variant="label" color="inkMuted">Level and XP</Text>
        <View style={styles.row}>
          <Text variant="h2" style={{ color: c.gold }}>Level {level}</Text>
          <Text variant="mono" tabular color="inkMuted">{player.xp}{next ? ` / ${next}` : ''} XP</Text>
        </View>
        <ProgressBar value={progress} />
        <Text variant="small" color="inkMuted">
          {nextPack ? `${nextPack.xp - player.xp} XP to the ${nextPack.name} pack.` : 'Every SoundDeck pack is open.'}
        </Text>
        <View style={{ gap: 8, marginTop: 6 }}>
          {player.xpLog.slice(0, 8).map((e, i) => (
            <View key={i} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text variant="body" numberOfLines={1}>{e.reason}</Text>
                <Text variant="small" color="inkFaint">{stampDate(e.at)}</Text>
              </View>
              <Text variant="mono" tabular style={{ color: e.amount >= 0 ? c.teal : c.error }}>{e.amount >= 0 ? `+${e.amount}` : `−${Math.abs(e.amount)}`}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.page, { backgroundColor: c.surface, borderColor: c.border, gap: 14 }]}>
        <Text variant="label" color="inkMuted">Settings</Text>
        <View style={{ gap: 8 }}>
          <Text variant="bodyStrong">Theme</Text>
          <Segmented<ThemeMode>
            value={player.theme}
            onChange={player.setTheme}
            options={[
              { key: 'system', label: 'System' },
              { key: 'light', label: 'Field Notes' },
              { key: 'dark', label: 'Night Atlas' },
            ]}
          />
        </View>
        <View style={styles.row}>
          <Text variant="bodyStrong">Sound</Text>
          <Button
            label={player.sound ? 'On' : 'Off'}
            size="sm"
            variant="secondary"
            icon={player.sound ? SpeakerHighIcon : SpeakerSlashIcon}
            onPress={() => player.setSound(!player.sound)}
            accessibilityHint="Turns all SoundMap audio on or off"
          />
        </View>
        <Button label="Reset demo" variant="ghost" tint={c.error} icon={ArrowCounterClockwiseIcon} onPress={reset} style={{ alignSelf: 'flex-start' }} />
      </View>

      <Sheet visible={!!opened} onClose={() => setOpen(null)}>
        {opened && (
          <View style={{ gap: 12, alignItems: 'center' }}>
            <Stamp shape={opened.stampShape} ink={ink(opened.region)} place={opened.stamp} glyph={opened.instrument.glyph} date={player.stamps[opened.slug]} size={140} />
            <Text variant="h2" center>{opened.title}</Text>
            <Text variant="small" color="inkMuted">Stamped {stampDate(player.stamps[opened.slug])} · {opened.place}</Text>
            <Button label="Open lesson" tint={ink(opened.region)} iconRight={ArrowRightIcon} full onPress={() => { setOpen(null); router.push(`/lesson/${opened.slug}`); }} />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 16, padding: 16, borderRadius: radius.xl, borderWidth: 1 },
  art: { width: 92, height: 92, borderRadius: radius.md, borderWidth: 1, padding: 6 },
  page: { marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1 },
  pageHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  cell: { width: '50%', alignItems: 'center', gap: 4, paddingVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
});
