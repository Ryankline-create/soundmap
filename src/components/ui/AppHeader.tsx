import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { ProgressBar } from './ProgressBar';
import { FireIcon, StampIcon } from './icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { usePlayer } from '@/src/state/PlayerContext';
import { LESSONS } from '@/src/data/lessons';
import { radius } from '@/src/theme/tokens';

// Always visible on the tabs: Passport · Level · Streak.
export function AppHeader() {
  const { c } = useTheme();
  const p = usePlayer();
  const stamps = Object.keys(p.stamps).length;
  const { level, next, progress } = p.level;
  const open = () => router.push('/passport');
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={open}
        accessibilityLabel={`Passport, ${stamps} of ${LESSONS.length} stamps`}
        style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <StampIcon size={18} color={c.primary} weight="bold" />
        <Text variant="mono" tabular style={{ color: c.ink, fontSize: 13 }}>
          {stamps}
          <Text variant="mono" style={{ color: c.inkFaint, fontSize: 13 }}>/{LESSONS.length}</Text>
        </Text>
      </PressableScale>

      <PressableScale
        onPress={open}
        accessibilityLabel={`Level ${level}, ${p.xp} XP${next ? ` of ${next}` : ''}`}
        style={[styles.level, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <View style={[styles.badge, { backgroundColor: c.goldSoft }]}>
          <Text variant="label" style={{ color: c.gold, letterSpacing: 0.6 }}>Lv {level}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <ProgressBar value={progress} height={5} />
          <Text variant="mono" tabular numberOfLines={1} style={{ fontSize: 11, lineHeight: 14, color: c.inkMuted }}>
            {p.xp}{next ? ` / ${next} XP` : ' XP'}
          </Text>
        </View>
      </PressableScale>

      <View accessible accessibilityLabel={`${p.streak} day streak`} style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]}>
        <FireIcon size={18} color={c.gold} weight="fill" />
        <Text variant="mono" tabular style={{ fontSize: 13 }}>{p.streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1 },
  level: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 40, paddingLeft: 6, paddingRight: 14, borderRadius: radius.pill, borderWidth: 1 },
  badge: { height: 28, paddingHorizontal: 10, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
