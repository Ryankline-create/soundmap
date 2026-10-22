import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { PlayIcon, StopIcon } from '@/src/components/ui/icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { alpha } from '@/src/lib/color';
import { radius } from '@/src/theme/tokens';
import { haptic } from '@/src/lib/haptics';
import { SoundEngine } from '@/src/audio/SoundEngine';
import { useEngineState } from '@/src/audio/hooks';
import type { Pattern } from '@/src/audio/types';

// Channel strips for "How It Is Built". Every layer is a track of the same
// pattern on the same clock, so a layer you switch on comes in on the next
// bar line, exactly in time.
export function LayerMixer({ pattern, layers, ink }: { pattern: Pattern; layers: string[]; ink: string }) {
  const { c } = useTheme();
  const engine = useEngineState();
  const playing = engine.playing && engine.patternId === pattern.id;
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [lit, setLit] = useState<Record<string, boolean>>({});
  const [bar, setBar] = useState(0);
  const cycle = pattern.steps * (pattern.bars ?? 1);

  // step → layers that sound on it
  const hitsByLayer = useMemo(() => {
    const m: Record<string, Set<number>> = {};
    for (const l of layers) m[l] = new Set();
    for (const t of pattern.tracks) if (t.layer && m[t.layer]) t.hits.forEach((h) => m[t.layer!].add(h % cycle));
    for (const n of pattern.melody ?? []) if (n.layer && m[n.layer]) m[n.layer].add(n.step % cycle);
    return m;
  }, [pattern, layers, cycle]);

  const onRef = useRef(on);
  onRef.current = on;

  useEffect(() => {
    return SoundEngine.onStep((e) => {
      if (e.patternId !== pattern.id) return;
      const abs = (e.bar * pattern.steps + e.step) % cycle;
      if (e.step === 0) {
        setPending({});
        setBar(e.bar);
      }
      const next: Record<string, boolean> = {};
      for (const l of layers) next[l] = !!onRef.current[l] && hitsByLayer[l].has(abs);
      setLit(next);
    });
  }, [pattern.id, pattern.steps, cycle, layers, hitsByLayer]);

  useEffect(() => () => {
    if (SoundEngine.isPlaying(pattern.id)) SoundEngine.stop();
  }, [pattern.id]);

  const start = async (state: Record<string, boolean>) => {
    await SoundEngine.init();
    await SoundEngine.preloadPattern(pattern);
    SoundEngine.play(pattern, { loop: true, muted: layers.filter((l) => !state[l]) });
  };

  const toggle = (layer: string) => {
    haptic.tap();
    const next = { ...on, [layer]: !on[layer] };
    setOn(next);
    if (playing) {
      SoundEngine.setLayerMuted(layer, !next[layer]);
      setPending((p) => ({ ...p, [layer]: true }));
    } else if (next[layer]) {
      start(next);
    }
  };

  const transport = () => {
    if (playing) SoundEngine.stop();
    else start(on);
  };

  const count = layers.filter((l) => on[l]).length;

  return (
    <View style={{ gap: 10 }}>
      <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
        {layers.map((l, i) => {
          const active = !!on[l];
          return (
            <PressableScale
              key={l}
              feedback={false}
              onPress={() => toggle(l)}
              accessibilityRole="switch"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${l} layer`}
              style={[styles.strip, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}
            >
              <View style={[styles.led, { backgroundColor: lit[l] ? ink : active ? alpha(ink, 0.35) : c.sunk, borderColor: active ? ink : c.borderStrong }]} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyStrong">{l}</Text>
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(cycle, 16) }, (_, s) => (
                    <View key={s} style={[styles.dot, { backgroundColor: hitsByLayer[l].has(s) ? (active ? ink : c.borderStrong) : c.border }]} />
                  ))}
                </View>
              </View>
              {pending[l] ? (
                <Text variant="label" style={{ color: ink }}>Next bar</Text>
              ) : null}
              <View style={[styles.toggle, { backgroundColor: active ? ink : c.sunk, borderColor: active ? ink : c.borderStrong }]}>
                <Text variant="label" style={{ color: active ? c.primaryOn : c.inkMuted, letterSpacing: 0.8 }}>{active ? 'In' : 'Out'}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Button
          label={playing ? 'Stop' : count ? 'Play' : 'Play the groove'}
          icon={playing ? StopIcon : PlayIcon}
          size="md"
          variant={playing ? 'secondary' : 'primary'}
          tint={ink}
          onPress={transport}
        />
        <Text variant="mono" tabular color="inkMuted" style={{ fontSize: 12 }}>
          {count} of {layers.length} layers{playing ? ` · bar ${bar + 1}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  led: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 8, height: 4, borderRadius: 1 },
  toggle: { minWidth: 52, height: 30, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
