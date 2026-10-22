// The one sound engine. React Native has no Web Audio, so synthesis happens
// offline (scripts/synth) and this engine plays the rendered samples through
// expo-audio on a drift-corrected step clock.
//
// - Players: a small round-robin pool per sample so fast repeats don't cut
//   each other off. After a hit finishes, the player is paused and rewound
//   ("armed") so the next hit starts without waiting for a seek.
// - Clock: setInterval(4 ms) reads performance.now(); step n is due at
//   start + n * stepMs (never accumulated), so timer jitter never adds up.
// - Everything (Play rounds, lessons, layer mixer, SoundDeck, Rhythm Coach)
//   plays a Pattern here, so layers that share a pattern are always in sync.
import { AppState, Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { DURATION_MS, SAMPLES } from './samples';
import type { Pattern, SampleId, StepEvent } from './types';

type Pool = {
  players: AudioPlayer[];
  armed: boolean[];
  timers: (ReturnType<typeof setTimeout> | null)[];
  next: number;
  refs: number;
  lastUsed: number;
};

type Hit = { sample: SampleId; vel: number; layer?: string };

const IS_ANDROID = Platform.OS === 'android';
// Android: every player is an ExoPlayer with its own AudioTrack, so keep the total low
const MAX_PLAYERS = IS_ANDROID ? 40 : 96;
const MASTER = 0.8;
// samples that are often retriggered while still sounding, or that overlap themselves (drones)
const BUSY = /(shaker|hihat|hat|maracas|caixa|tamborim|qraqeb|ghungroo|riq|jingle|clave|chk|tick|palmas|hosho|ketuk|clapsticks|tek|_ka$|dha|dhin|tin$|na$|drone|tanpura|kora_|mbira_|peking_|saron_)/;

const sampleMap = SAMPLES as Record<string, number>;
const durations = DURATION_MS as Record<string, number>;
const now = () => performance.now();
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function poolSize(id: SampleId) {
  const busy = BUSY.test(id);
  if (IS_ANDROID) return busy ? 2 : 1;
  return busy ? 3 : 2;
}

// step index -> hits, built once per pattern
function compile(p: Pattern): Hit[][] {
  const length = p.steps * (p.bars ?? 1);
  const table: Hit[][] = Array.from({ length }, () => []);
  for (const t of p.tracks) {
    t.hits.forEach((h, k) => {
      if (h < 0 || h >= length) return;
      const vel = Array.isArray(t.vel) ? t.vel[k] ?? 0.8 : t.vel ?? 0.8;
      table[h].push({ sample: t.sample, vel, layer: t.layer });
    });
  }
  for (const m of p.melody ?? []) {
    if (m.step >= 0 && m.step < length) table[m.step].push({ sample: m.note, vel: m.vel ?? 0.8, layer: m.layer });
  }
  return table;
}

export function samplesOfPattern(p: Pattern): SampleId[] {
  const set = new Set<SampleId>();
  for (const t of p.tracks) set.add(t.sample);
  for (const m of p.melody ?? []) set.add(m.note);
  return [...set];
}

class Engine {
  // tunable estimate of how long a triggered sound takes to come out of the
  // speaker; the Rhythm Coach judge shifts its targets by this much
  latencyMs = IS_ANDROID ? 80 : 35;

  private pools = new Map<SampleId, Pool>();
  private enabled = true;
  private ready: Promise<void> | null = null;
  private warned = new Set<string>();

  private pat: Pattern | null = null;
  private table: Hit[][] = [];
  private length = 16;
  private stepMs = 125;
  private startAt = 0;
  private n = 0;
  private startedAt = 0;
  private loop = true;
  private maxMs = 0;
  private onEndCb: (() => void) | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private muted = new Set<string>();
  private pendingMutes = new Map<string, boolean>();

  private stepListeners = new Set<(e: StepEvent) => void>();
  private stateListeners = new Set<(s: { playing: boolean; patternId: string | null }) => void>();

  // ---------- setup ----------

  init(): Promise<void> {
    if (!this.ready) {
      this.ready = setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
      }).catch(() => undefined);
      AppState.addEventListener('change', (s) => {
        if (s === 'background') this.stop();
      });
    }
    return this.ready;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  // ---------- players ----------

  private ensurePool(id: SampleId): Pool | null {
    const existing = this.pools.get(id);
    if (existing) return existing;
    const source = sampleMap[id];
    if (source === undefined) {
      if (__DEV__ && !this.warned.has(id)) {
        this.warned.add(id);
        console.warn(`SoundEngine: unknown sample ${id}`);
      }
      return null;
    }
    const size = poolSize(id);
    const players: AudioPlayer[] = [];
    for (let i = 0; i < size; i++) players.push(createAudioPlayer(source, { updateInterval: 1000 }));
    const pool: Pool = { players, armed: players.map(() => true), timers: players.map(() => null), next: 0, refs: 0, lastUsed: now() };
    this.pools.set(id, pool);
    this.evict();
    return pool;
  }

  private totalPlayers() {
    let n = 0;
    for (const p of this.pools.values()) n += p.players.length;
    return n;
  }

  // drop least-recently-used pools that nobody holds and the current pattern doesn't use
  private evict() {
    if (this.totalPlayers() <= MAX_PLAYERS) return;
    const inUse = new Set(this.pat ? samplesOfPattern(this.pat) : []);
    const candidates = [...this.pools.entries()]
      .filter(([id, p]) => p.refs <= 0 && !inUse.has(id))
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [id] of candidates) {
      if (this.totalPlayers() <= MAX_PLAYERS) break;
      this.removePool(id);
    }
  }

  private removePool(id: SampleId) {
    const pool = this.pools.get(id);
    if (!pool) return;
    pool.timers.forEach((t) => t && clearTimeout(t));
    for (const p of pool.players) {
      try {
        p.remove();
      } catch {}
    }
    this.pools.delete(id);
  }

  private async waitLoaded(ids: SampleId[], timeoutMs = 2500) {
    const t0 = now();
    const players = ids.flatMap((id) => this.pools.get(id)?.players ?? []);
    while (now() - t0 < timeoutMs) {
      if (players.every((p) => p.isLoaded)) return;
      await new Promise((r) => setTimeout(r, 25));
    }
  }

  // holds samples in memory until release(); resolves when they can play
  async preload(ids: SampleId[]): Promise<void> {
    this.init();
    for (const id of ids) {
      const pool = this.ensurePool(id);
      if (pool) pool.refs += 1;
    }
    await this.waitLoaded(ids);
  }

  // warms up a pattern's samples without holding them
  async preloadPattern(p: Pattern): Promise<void> {
    this.init();
    const ids = samplesOfPattern(p);
    ids.forEach((id) => this.ensurePool(id));
    await this.waitLoaded(ids);
  }

  release(ids: SampleId[]) {
    const inUse = new Set(this.pat ? samplesOfPattern(this.pat) : []);
    for (const id of ids) {
      const pool = this.pools.get(id);
      if (!pool) continue;
      pool.refs -= 1;
      if (pool.refs <= 0 && !inUse.has(id) && IS_ANDROID) this.removePool(id);
    }
    this.evict();
  }

  private fire(id: SampleId, vel: number) {
    const pool = this.ensurePool(id);
    if (!pool) return;
    pool.lastUsed = now();
    const i = pool.next;
    pool.next = (i + 1) % pool.players.length;
    const p = pool.players[i];
    try {
      p.volume = clamp01(vel * MASTER);
      if (!pool.armed[i]) p.seekTo(0).catch(() => undefined);
      p.play();
      pool.armed[i] = false;
      const prev = pool.timers[i];
      if (prev) clearTimeout(prev);
      pool.timers[i] = setTimeout(() => {
        pool.timers[i] = null;
        try {
          p.pause();
          p.seekTo(0).then(() => { pool.armed[i] = true; }, () => undefined);
        } catch {}
      }, (durations[id] ?? 600) + 40);
    } catch {}
  }

  // one-shot, now (pads, keys, interface sounds)
  hit(id: SampleId, vel = 0.9) {
    if (!this.enabled) return;
    this.init();
    this.fire(id, vel);
  }

  // ---------- transport ----------

  play(p: Pattern, opts: { loop?: boolean; maxMs?: number; muted?: string[]; onEnd?: () => void } = {}) {
    this.stopClock(false);
    if (!this.enabled) return;
    this.init();
    this.setActive(p);
    this.loop = opts.loop ?? true;
    this.maxMs = opts.maxMs ?? 0;
    this.onEndCb = opts.onEnd ?? null;
    this.muted = new Set(opts.muted ?? []);
    this.pendingMutes.clear();
    samplesOfPattern(p).forEach((id) => this.ensurePool(id));
    // a short lead-in gives freshly created players a moment to load
    this.startedAt = now();
    this.startAt = this.startedAt + 40;
    this.n = 0;
    this.timer = setInterval(() => this.tick(), 4);
    this.emitState();
  }

  stop() {
    this.stopClock(true);
  }

  private stopClock(silence: boolean) {
    const wasPlaying = this.timer !== null;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (silence && this.pat) {
      for (const id of samplesOfPattern(this.pat)) {
        const pool = this.pools.get(id);
        pool?.players.forEach((pl, i) => {
          if (pool.armed[i]) return;
          try {
            pl.pause();
          } catch {}
        });
      }
    }
    if (wasPlaying) this.emitState();
  }

  private finish() {
    const cb = this.onEndCb;
    this.onEndCb = null;
    this.stopClock(false);
    cb?.();
  }

  isPlaying(patternId?: string) {
    return this.timer !== null && (!patternId || this.pat?.id === patternId);
  }

  current() {
    return this.pat;
  }

  private setActive(p: Pattern) {
    this.pat = p;
    this.table = compile(p);
    this.length = p.steps * (p.bars ?? 1);
    this.stepMs = 60000 / p.bpm / (p.steps / 4);
  }

  // live edit (SoundDeck grid, recording): keeps the playhead where it is
  setPattern(p: Pattern) {
    if (!this.timer || !this.pat) {
      this.setActive(p);
      return;
    }
    const due = this.stepTime(this.n);
    const oldStepMs = this.stepMs;
    this.setActive(p);
    if (this.stepMs !== oldStepMs) this.startAt = due - this.n * this.stepMs;
    samplesOfPattern(p).forEach((id) => this.ensurePool(id));
  }

  setBpm(bpm: number) {
    if (!this.pat) return;
    this.setPattern({ ...this.pat, bpm });
  }

  // muting and unmuting take effect on the next bar line, so a layer always
  // comes in on the one
  setLayerMuted(layer: string, muted: boolean) {
    if (!this.timer) {
      if (muted) this.muted.add(layer);
      else this.muted.delete(layer);
      return;
    }
    this.pendingMutes.set(layer, muted);
  }

  mutedLayers() {
    const out = new Set(this.muted);
    for (const [l, m] of this.pendingMutes) {
      if (m) out.add(l);
      else out.delete(l);
    }
    return [...out];
  }

  private stepTime(n: number) {
    const swing = this.pat?.swing ?? 0;
    return this.startAt + n * this.stepMs + (n % 2 === 1 ? swing * this.stepMs : 0);
  }

  private tick() {
    const p = this.pat;
    if (!p) return;
    const t = now();
    if (this.maxMs && t - this.startedAt >= this.maxMs) {
      this.finish();
      return;
    }
    let guard = 0;
    while (this.timer && t >= this.stepTime(this.n) && guard++ < 8) {
      // after a long stall (app busy), jump to the present instead of bursting
      if (t - this.stepTime(this.n) > this.stepMs * 1.5) {
        this.n = Math.floor((t - this.startAt) / this.stepMs);
        continue;
      }
      if (!this.loop && this.n >= this.length) {
        this.finish();
        return;
      }
      const step = this.n % this.length;
      if (step % p.steps === 0 && this.pendingMutes.size) {
        for (const [l, m] of this.pendingMutes) {
          if (m) this.muted.add(l);
          else this.muted.delete(l);
        }
        this.pendingMutes.clear();
      }
      for (const h of this.table[step]) {
        if (h.layer && this.muted.has(h.layer)) continue;
        this.fire(h.sample, h.vel);
      }
      const e: StepEvent = { step, bar: Math.floor(step / p.steps), at: this.stepTime(this.n), stepMs: this.stepMs, patternId: p.id };
      this.n += 1;
      this.stepListeners.forEach((cb) => cb(e));
    }
  }

  // ---------- timing info and events ----------

  now() {
    return now();
  }

  // step k of loop pass m is due at start + (m * length + k) * stepMs
  clock(): { start: number; stepMs: number; length: number } | null {
    if (!this.timer) return null;
    return { start: this.startAt, stepMs: this.stepMs, length: this.length };
  }

  onStep(cb: (e: StepEvent) => void) {
    this.stepListeners.add(cb);
    return () => {
      this.stepListeners.delete(cb);
    };
  }

  onState(cb: (s: { playing: boolean; patternId: string | null }) => void) {
    this.stateListeners.add(cb);
    return () => {
      this.stateListeners.delete(cb);
    };
  }

  private emitState() {
    const s = { playing: this.timer !== null, patternId: this.pat?.id ?? null };
    this.stateListeners.forEach((cb) => cb(s));
  }
}

export const SoundEngine = new Engine();
