import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Screen, ScreenTitle } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { LockSimpleIcon, PlayIcon, StopIcon, EraserIcon } from '@/src/components/ui/icons';
import { BpmFader, DeckButton, Engraved, Led, Pad, Vinyl, useBlink } from '@/src/components/deck/parts';
import { Keyboard, PackPicker, StepGrid, type PackCard } from '@/src/components/deck/controls';
import { CoachList, PlayAlong, type Coach } from '@/src/components/deck/RhythmCoach';
import { usePlayer } from '@/src/state/PlayerContext';
import { useDeck, type Grid } from '@/src/state/DeckContext';
import { dark, deck as D, regionInkKey, radius } from '@/src/theme/tokens';
import { PACK_LOOK } from '@/src/data/packMeta';
import { SoundEngine } from '@/src/audio/SoundEngine';
import { useEngineState, useStep } from '@/src/audio/hooks';
import { PACKS } from '@/src/audio/packs';
import type { Pattern, PackId } from '@/src/audio/types';
import type { RegionKey } from '@/src/data/types';

type Pack = (typeof PACKS)[number];

// On the dark panel, region inks use their Night Atlas values in both themes.
const deckInk = (r: RegionKey) => dark[regionInkKey[r]];
const REC_RED = '#FF6B57';
const SCRATCH_XP = 500;

function gridFrom(pack: Pack, tracks: { sample: string; hits: number[] }[]): Grid {
  const g: Grid = {};
  for (const t of tracks) {
    const pad = pack.pads.find((p) => p.sample === t.sample);
    if (!pad) continue;
    const steps = [...new Set(t.hits.map((h) => h % 16))].sort((a, b) => a - b);
    g[pad.id] = [...new Set([...(g[pad.id] ?? []), ...steps])].sort((a, b) => a - b);
  }
  return g;
}

function buildPattern(pack: Pack, grid: Grid, keys: { step: number; key: number }[], bpm: number): Pattern {
  return {
    id: `deck-${pack.id}`,
    bpm,
    steps: 16,
    tracks: pack.pads.filter((p) => grid[p.id]?.length).map((p) => ({ sample: p.sample, hits: grid[p.id] })),
    melody: keys.map((k) => ({ step: k.step, note: pack.keys[k.key] })),
  };
}

export default function DeckScreen() {
  const player = usePlayer();
  const d = useDeck();
  const params = useLocalSearchParams<{ pack?: string }>();
  const engine = useEngineState();
  const pack = PACKS.find((p) => p.id === d.packId) ?? PACKS[0];
  const ink = deckInk(pack.region);
  const grid = useMemo(() => d.grid ?? {}, [d.grid]);
  const [selected, setSelected] = useState<string>(pack.pads[0].id);
  const [rec, setRec] = useState(false);
  const [flash, setFlash] = useState<Record<string, number>>({});
  const [coach, setCoach] = useState<Coach | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pattern = useMemo(() => buildPattern(pack, grid, d.keyNotes, d.bpm), [pack, grid, d.keyNotes, d.bpm]);
  const playing = engine.playing && engine.patternId === pattern.id;
  const step = useStep(pattern.id);
  const recBlink = useBlink(rec && playing, 400);

  useEffect(() => {
    SoundEngine.init();
  }, []);

  useEffect(() => {
    SoundEngine.preload([...pack.pads.map((p) => p.sample), ...pack.keys]);
  }, [pack]);

  // the first time a pack opens, its demo groove is waiting in the grid
  useEffect(() => {
    if (d.ready && !d.grids[pack.id]) d.setGrid(pack.id, gridFrom(pack, pack.demo.tracks));
    setSelected(pack.pads[0].id);
    // a new pack re-skins the pads: a ripple of its ink across the grid
    pack.pads.forEach((p, i) => setTimeout(() => setFlash((f) => ({ ...f, [p.id]: (f[p.id] ?? 0) + 1 })), 60 + i * 35));
    // run when the pack changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack.id, d.ready]);

  // arriving from "Caribbean pack unlocked"
  useEffect(() => {
    const id = params.pack as PackId | undefined;
    if (id && player.unlockedPacks.includes(id) && id !== d.packId) {
      SoundEngine.stop();
      d.setPack(id);
    }
    // only when the param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.pack]);

  // edits while playing reach the engine on the next step
  useEffect(() => {
    if (playing) SoundEngine.setPattern(pattern);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern]);

  // pads light up when the sequencer plays them
  useEffect(() => {
    return SoundEngine.onStep((e) => {
      if (e.patternId !== pattern.id) return;
      const hit = pack.pads.filter((p) => grid[p.id]?.includes(e.step % 16));
      if (hit.length) setFlash((f) => {
        const n = { ...f };
        for (const p of hit) n[p.id] = (n[p.id] ?? 0) + 1;
        return n;
      });
    });
  }, [pattern.id, pack, grid]);

  useFocusEffect(
    useCallback(
      () => () => {
        SoundEngine.stop();
        setRec(false);
      },
      [],
    ),
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const quantize = () => {
    const clk = SoundEngine.clock();
    if (!clk) return 0;
    const n = Math.round((SoundEngine.now() - (SoundEngine.latencyMs ?? 0) - clk.start) / clk.stepMs);
    return ((n % 16) + 16) % 16;
  };

  const play = async () => {
    await SoundEngine.init();
    await SoundEngine.preloadPattern(pattern);
    SoundEngine.play(pattern, { loop: true });
  };

  const padDown = (p: Pack['pads'][number]) => {
    SoundEngine.hit(p.sample);
    setSelected(p.id);
    if (rec && playing) d.addHit(p.id, quantize());
  };

  const silence = () => {
    if (rec && playing) {
      const s = quantize();
      const g: Grid = {};
      for (const [k, v] of Object.entries(grid)) g[k] = v.filter((x) => x !== s);
      d.setGrid(pack.id, g, d.keyNotes.filter((k) => k.step !== s));
    } else SoundEngine.stop();
  };

  const key = (i: number) => {
    SoundEngine.hit(pack.keys[i]);
    if (rec && playing) d.addKey(quantize(), i);
  };

  const toggleRec = () => {
    const next = !rec;
    setRec(next);
    if (next && !playing) play();
  };

  const setBpm = (v: number) => {
    d.setBpm(v);
    if (playing) SoundEngine.setBpm(v);
  };

  const load = (c: Coach) => {
    const target = PACKS.find((p) => p.id === c.pack);
    if (!target) return;
    SoundEngine.stop();
    d.setPack(target.id);
    d.setGrid(target.id, gridFrom(target, [...c.pattern.tracks, ...c.lanes]));
    d.setBpm(c.bpm);
    setToast(`${c.name} is in the grid at ${c.bpm} BPM`);
  };

  const cards: PackCard[] = PACKS.map((p) => ({
    id: p.id,
    name: p.name,
    xp: p.xp,
    ink: deckInk(p.region),
    glyph: PACK_LOOK[p.id as PackId].glyph,
    locked: !player.unlockedPacks.includes(p.id as PackId),
    progress: p.xp ? player.xp / p.xp : 1,
  }));

  return (
    <Screen
      hud
      overlay={
        toast ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.toast, { backgroundColor: D.panel, borderColor: D.padEdge }]} pointerEvents="none">
            <Text variant="smallStrong" style={{ color: D.readout }}>{toast}</Text>
          </Animated.View>
        ) : null
      }
    >
      <ScreenTitle kicker="SoundDeck" title="Play it yourself" />

      <View style={[styles.device, { backgroundColor: D.body }]}>
        <View style={styles.topStrip}>
          <View style={{ flex: 1, gap: 6 }}>
            <Engraved>SoundDeck · Studio</Engraved>
            <View style={[styles.display, { backgroundColor: D.well }]}>
              <Led on={playing} color={ink} />
              <Text variant="mono" numberOfLines={1} style={{ color: D.readout, fontSize: 13, flex: 1 }}>
                {pack.name.toUpperCase()}
              </Text>
              <Text variant="mono" tabular style={{ color: D.led, fontSize: 13 }}>{d.bpm}</Text>
            </View>
            <Text variant="small" style={{ color: D.faint }} numberOfLines={1}>{pack.keysLabel}</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Vinyl playing={playing} ink={ink} size={84} />
            <View style={styles.scratch}>
              <LockSimpleIcon size={10} color={D.faint} />
              <Text variant="label" style={{ color: D.faint, fontSize: 8.5, letterSpacing: 0.6 }}>
                {player.xp >= SCRATCH_XP ? 'Scratch soon' : `Scratch at ${SCRATCH_XP} XP`}
              </Text>
            </View>
          </View>
        </View>

        <PackPicker
          packs={cards}
          current={pack.id}
          onPick={(id) => {
            SoundEngine.stop();
            setRec(false);
            d.setPack(id as PackId);
          }}
          onLocked={(p) => setToast(`${p.name} opens at ${p.xp} XP. You have ${player.xp}.`)}
        />

        <View style={styles.section}>
          <View style={styles.transport}>
            <DeckButton label={playing ? 'Stop' : 'Play'} onPress={() => (playing ? SoundEngine.stop() : play())} led={playing} ledColor={ink} active={playing}>
              {playing ? <StopIcon size={14} color={D.readout} weight="fill" /> : <PlayIcon size={14} color={D.readout} weight="fill" />}
            </DeckButton>
            <DeckButton label="Rec" onPress={toggleRec} led={rec && (!playing || recBlink)} ledColor={REC_RED} active={rec} />
            <DeckButton label="Clear" onPress={() => d.clear()}>
              <EraserIcon size={14} color={D.readout} />
            </DeckButton>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.bpmHead}>
              <Engraved>Tempo</Engraved>
              <Text variant="mono" tabular style={{ color: D.readout, fontSize: 12 }}>{d.bpm} BPM</Text>
            </View>
            <BpmFader bpm={d.bpm} onChange={setBpm} ink={ink} />
          </View>
        </View>

        <View style={styles.pads}>
          {pack.pads.map((p) => (
            <Pad key={p.id} label={p.label} glyph={p.glyph} ink={ink} onDown={() => padDown(p)} selected={selected === p.id} flash={flash[p.id]} />
          ))}
          <Pad label="Silence" ink={D.ledOff} onDown={silence} silence />
        </View>
        {rec && (
          <Text variant="small" style={{ color: REC_RED, paddingHorizontal: 16, marginTop: -4 }}>
            Recording: pad and key taps snap to the nearest step.
          </Text>
        )}

        <View style={styles.section}>
          <StepGrid
            pads={pack.pads}
            grid={grid}
            keyNotes={d.keyNotes}
            selected={selected}
            onSelect={setSelected}
            onToggle={(s) => d.toggleStep(selected, s)}
            step={playing ? step : -1}
            ink={ink}
          />
        </View>

        <View style={styles.section}>
          <Keyboard onKey={key} label={pack.keysLabel} ink={ink} />
          {pack.keysNote ? <Text variant="small" style={{ color: D.faint }}>{pack.keysNote}</Text> : null}
        </View>
      </View>

      <View style={[styles.device, { backgroundColor: D.body, marginTop: 14 }]}>
        <View style={[styles.section, { paddingTop: 16 }]}>
          <Engraved>Rhythm Coach</Engraved>
          <Text variant="h3" style={{ color: D.readout }}>Ten patterns, played the way they're played</Text>
          <Text variant="small" style={{ color: D.label }}>
            Load one into the grid to take it apart, or play along and get judged to the millisecond.
          </Text>
          <CoachList
            inkFor={(id) => deckInk(PACKS.find((p) => p.id === id)?.region ?? 'africa')}
            unlocked={player.unlockedPacks}
            onLoad={load}
            onPlay={(c) => {
              SoundEngine.stop();
              setCoach(c);
            }}
          />
        </View>
      </View>


      <PlayAlong
        coach={coach}
        ink={coach ? deckInk(PACKS.find((p) => p.id === coach.pack)?.region ?? 'africa') : ink}
        onClose={() => setCoach(null)}
        onXp={(xp) => coach && player.addXp(xp, `Rhythm Coach: ${coach.name}`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  device: { marginHorizontal: 12, borderRadius: radius.xl, paddingBottom: 16, gap: 14, overflow: 'hidden' },
  topStrip: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  display: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 34, borderRadius: 6, paddingHorizontal: 10 },
  scratch: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  section: { paddingHorizontal: 16, gap: 12 },
  transport: { flexDirection: 'row', gap: 8 },
  bpmHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pads: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  toast: { position: 'absolute', left: 24, right: 24, bottom: 20, borderWidth: 1, borderRadius: radius.md, padding: 12 },
});
