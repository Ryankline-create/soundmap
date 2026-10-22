import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { Text } from '@/src/components/ui/Text';
import { PlayIcon, StopIcon } from '@/src/components/ui/icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { radius } from '@/src/theme/tokens';
import { SoundEngine } from '@/src/audio/SoundEngine';
import { useEngineState, useStep } from '@/src/audio/hooks';
import type { Pattern } from '@/src/audio/types';

export async function playOnce(p: Pattern, maxMs = 6000, loop = true) {
  await SoundEngine.init();
  await SoundEngine.preloadPattern(p);
  SoundEngine.play(p, { loop, maxMs });
}

// A play/stop pill for one pattern, with a step meter while it plays.
export function ClipButton({
  pattern,
  label,
  sub,
  ink,
  maxMs = 6000,
  selected,
  onPlay,
  big,
}: {
  pattern: Pattern;
  label: string;
  sub?: string;
  ink?: string;
  maxMs?: number;
  selected?: boolean;
  onPlay?: () => void;
  big?: boolean;
}) {
  const { c } = useTheme();
  const tone = ink ?? c.primary;
  const engine = useEngineState();
  const playing = engine.playing && engine.patternId === pattern.id;
  const step = useStep(pattern.id);
  const total = pattern.steps;

  const toggle = () => {
    if (playing) SoundEngine.stop();
    else {
      onPlay?.();
      playOnce(pattern, maxMs);
    }
  };

  return (
    <PressableScale
      onPress={toggle}
      accessibilityLabel={playing ? `Stop ${label}` : `Play ${label}`}
      style={[
        styles.box,
        big && styles.big,
        { borderColor: selected || playing ? tone : c.border, backgroundColor: selected ? alpha(tone, 0.1) : c.surface },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: playing ? tone : alpha(tone, 0.12) }]}>
        {playing ? <StopIcon size={16} color={c.primaryOn} weight="fill" /> : <PlayIcon size={16} color={tone} weight="fill" />}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{label}</Text>
        {sub ? <Text variant="small" color="inkMuted" numberOfLines={2}>{sub}</Text> : null}
        <View style={styles.meter}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[styles.tick, { backgroundColor: playing && i === (step % total) ? tone : i % (total === 12 ? 3 : 4) === 0 ? c.borderStrong : c.border }]}
            />
          ))}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1.5 },
  big: { padding: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  meter: { flexDirection: 'row', gap: 2 },
  tick: { flex: 1, height: 4, borderRadius: 1 },
});
