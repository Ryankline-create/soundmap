import { ScrollView, StyleSheet, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, shadow } from '@/src/theme/tokens';

type Option<K extends string> = { key: K; label: string; ink?: string };

type Props<K extends string> = {
  options: Option<K>[];
  value: K;
  onChange: (k: K) => void;
  // scrolls horizontally instead of splitting the width (for long labels)
  scroll?: boolean;
  dark?: boolean;
};

export function Segmented<K extends string>({ options, value, onChange, scroll }: Props<K>) {
  const { c } = useTheme();
  const items = options.map((o) => {
    const on = o.key === value;
    return (
      <PressableScale
        key={o.key}
        feedback="select"
        scaleTo={0.97}
        onPress={() => onChange(o.key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={o.label}
        style={[styles.item, !scroll && styles.flex, on && [{ backgroundColor: c.surface }, shadow.card]]}
      >
        <View style={styles.row}>
          {o.ink && <View style={[styles.dot, { backgroundColor: o.ink, opacity: on ? 1 : 0.55 }]} />}
          <Text variant="smallStrong" numberOfLines={1} style={{ color: on ? o.ink ?? c.ink : c.inkMuted }}>
            {o.label}
          </Text>
        </View>
      </PressableScale>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={[styles.track, { backgroundColor: c.sunk }]}
      >
        {items}
      </ScrollView>
    );
  }
  return <View style={[styles.track, { backgroundColor: c.sunk }]}>{items}</View>;
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radius.md, gap: 2 },
  item: { height: 36, paddingHorizontal: 14, borderRadius: radius.sm + 1, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, paddingHorizontal: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
