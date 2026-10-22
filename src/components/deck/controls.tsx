import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Text } from '@/src/components/ui/Text';
import { LockSimpleIcon } from '@/src/components/ui/icons';
import { Glyph } from '@/src/components/glyphs';
import { alpha } from '@/src/lib/color';
import { deck, font } from '@/src/theme/tokens';
import { haptic } from '@/src/lib/haptics';
import type { GlyphId } from '@/src/data/types';
import type { Grid, KeyNote } from '@/src/state/DeckContext';

type PadInfo = { id: string; label: string };

// 16-step grid. The big row edits the selected pad; the small rows below show
// every part in the loop. The playhead follows the engine's step clock.
export function StepGrid({
  pads,
  grid,
  keyNotes,
  selected,
  onSelect,
  onToggle,
  step,
  ink,
}: {
  pads: PadInfo[];
  grid: Grid;
  keyNotes: KeyNote[];
  selected: string;
  onSelect: (id: string) => void;
  onToggle: (step: number) => void;
  step: number;
  ink: string;
}) {
  const row = grid[selected] ?? [];
  const selectedPad = pads.find((p) => p.id === selected);
  const active = pads.filter((p) => (grid[p.id]?.length ?? 0) > 0);
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.rowHead}>
        <Text variant="label" style={{ color: deck.faint, fontSize: 10, letterSpacing: 1.4 }}>Steps · {selectedPad?.label ?? 'Pick a pad'}</Text>
        <Text variant="mono" tabular style={{ color: deck.led, fontSize: 12 }}>{step >= 0 ? String((step % 16) + 1).padStart(2, '0') : '--'}/16</Text>
      </View>
      <View style={styles.bigRow}>
        {Array.from({ length: 16 }, (_, s) => {
          const on = row.includes(s);
          const head = step % 16 === s;
          return (
            <Pressable
              key={s}
              onPress={() => {
                haptic.select();
                onToggle(s);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`Step ${s + 1}`}
              style={[styles.cell, s % 4 === 0 && styles.beat]}
            >
              <View
                style={[
                  styles.cellFace,
                  {
                    backgroundColor: on ? ink : s % 4 === 0 ? '#3A2A21' : deck.stepOff,
                    borderColor: head ? deck.playhead : 'transparent',
                    opacity: on && head ? 1 : on ? 0.9 : 1,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.overview, { backgroundColor: deck.well }]}>
        {active.length === 0 && keyNotes.length === 0 ? (
          <Text variant="small" style={{ color: deck.faint, textAlign: 'center' }}>Empty loop. Tap pads with REC on, or draw steps above.</Text>
        ) : null}
        {active.map((p) => (
          <Pressable key={p.id} onPress={() => onSelect(p.id)} style={styles.miniRow} accessibilityLabel={`Edit ${p.label}`}>
            <Text variant="small" numberOfLines={1} style={{ width: 70, color: p.id === selected ? ink : deck.label, fontSize: 11, fontFamily: font.bodySemi }}>{p.label}</Text>
            <View style={styles.miniCells}>
              {Array.from({ length: 16 }, (_, s) => (
                <View key={s} style={[styles.mini, { backgroundColor: grid[p.id]?.includes(s) ? (step % 16 === s ? deck.playhead : ink) : step % 16 === s ? '#4A372C' : deck.stepOff }]} />
              ))}
            </View>
          </Pressable>
        ))}
        {keyNotes.length > 0 && (
          <View style={styles.miniRow}>
            <Text variant="small" style={{ width: 70, color: deck.label, fontSize: 11, fontFamily: font.bodySemi }}>Keys</Text>
            <View style={styles.miniCells}>
              {Array.from({ length: 16 }, (_, s) => (
                <View key={s} style={[styles.mini, { backgroundColor: keyNotes.some((k) => k.step === s) ? deck.led : deck.stepOff }]} />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

export function Keyboard({ onKey, label, ink }: { onKey: (i: number) => void; label: string; ink: string }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.rowHead}>
        <Text variant="label" style={{ color: deck.faint, fontSize: 10, letterSpacing: 1.4 }}>Keys · {label}</Text>
        <Text variant="mono" style={{ color: deck.faint, fontSize: 11 }}>C major</Text>
      </View>
      <View style={styles.keys}>
        {NOTE_NAMES.map((n, i) => (
          <Key key={i} name={n} octave={i === 7} ink={ink} onDown={() => onKey(i)} />
        ))}
      </View>
    </View>
  );
}

function Key({ name, octave, ink, onDown }: { name: string; octave: boolean; ink: string; onDown: () => void }) {
  const p = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: p.value * 3 }], backgroundColor: p.value > 0.5 ? alpha(ink, 0.35) : '#EFE4D6' }));
  return (
    <Pressable
      onPressIn={() => {
        p.value = withTiming(1, { duration: 30 });
        onDown();
      }}
      onPressOut={() => (p.value = withTiming(0, { duration: 140 }))}
      accessibilityRole="button"
      accessibilityLabel={`${name}${octave ? ' high' : ''}`}
      style={styles.keyHit}
    >
      <Animated.View style={[styles.key, style]}>
        <Text variant="label" style={{ color: '#2B1610', fontSize: 10, letterSpacing: 0 }}>{name}{octave ? '′' : ''}</Text>
      </Animated.View>
    </Pressable>
  );
}

export type PackCard = { id: string; name: string; xp: number; ink: string; glyph: GlyphId; locked: boolean; progress: number };

export function PackPicker({ packs, current, onPick, onLocked }: { packs: PackCard[]; current: string; onPick: (id: string) => void; onLocked: (p: PackCard) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}>
      {packs.map((p) => (
        <PackChip key={p.id} p={p} on={p.id === current} onPress={() => (p.locked ? onLocked(p) : onPick(p.id))} />
      ))}
    </ScrollView>
  );
}

function PackChip({ p, on, onPress }: { p: PackCard; on: boolean; onPress: () => void }) {
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  return (
    <Pressable
      onPress={() => {
        if (p.locked) {
          haptic.wrong();
          shake.value = withSequence(withTiming(-5, { duration: 45 }), withTiming(5, { duration: 45 }), withTiming(-3, { duration: 45 }), withTiming(0, { duration: 45 }));
        } else haptic.select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: p.locked }}
      accessibilityLabel={p.locked ? `${p.name} pack, locked until ${p.xp} XP` : `${p.name} pack`}
    >
      <Animated.View style={[styles.pack, { borderColor: on ? p.ink : deck.padEdge, backgroundColor: on ? alpha(p.ink, 0.16) : deck.pad, opacity: p.locked ? 0.75 : 1 }, style]}>
        <View style={styles.packTop}>
          {p.locked ? <LockSimpleIcon size={16} color={deck.faint} weight="bold" /> : <Glyph name={p.glyph} size={18} color={p.ink} strokeWidth={1.7} />}
          <Text variant="smallStrong" numberOfLines={1} style={{ color: p.locked ? deck.faint : deck.readout, fontSize: 12 }}>{p.name}</Text>
        </View>
        {p.locked ? (
          <View style={{ gap: 4 }}>
            <Text variant="mono" tabular style={{ color: deck.faint, fontSize: 10 }}>{p.xp} XP</Text>
            <View style={[styles.packBar, { backgroundColor: deck.well }]}>
              <View style={{ width: `${Math.min(1, p.progress) * 100}%`, height: '100%', backgroundColor: deck.led, borderRadius: 2 }} />
            </View>
          </View>
        ) : (
          <Text variant="mono" style={{ color: on ? p.ink : deck.faint, fontSize: 10 }}>{on ? 'LOADED' : 'OPEN'}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bigRow: { flexDirection: 'row' },
  cell: { flex: 1, height: 34, padding: 1.5 },
  beat: { marginLeft: 3 },
  cellFace: { flex: 1, borderRadius: 4, borderWidth: 2 },
  overview: { borderRadius: 10, padding: 10, gap: 6 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniCells: { flex: 1, flexDirection: 'row', gap: 2 },
  mini: { flex: 1, height: 7, borderRadius: 1.5 },
  keys: { flexDirection: 'row', gap: 4 },
  keyHit: { flex: 1 },
  key: { height: 84, borderRadius: 6, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, borderBottomWidth: 4, borderBottomColor: '#C9B4A5' },
  pack: { width: 138, borderRadius: 10, borderWidth: 1.5, padding: 10, gap: 8 },
  packTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  packBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
});
