export type Instrument =
  | "gamelan"
  | "kalimba"
  | "sitar"
  | "koto"
  | "claves"
  | "nylonGuitar"
  | "saz"
  | "fiddle"
  | "jazzPiano"
  | "didjeridu";

export type AudioPreset = {
  instrument: Instrument;
  root: number;          // Hz of scale-degree 0
  scale: number[];       // semitone offsets from root
  bpm: number;
  motif: number[];       // scale-degree indices, looped
};

export const CLIP_DURATION_S = 30;

type Voice = {
  type: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;       // 0..1
  release: number;
  filterHz?: number;
  filterQ?: number;
  detune?: number;       // cents
  vibratoHz?: number;
  vibratoCents?: number;
  gain?: number;         // overall voice gain
  noise?: number;        // 0..1 mixes in noise burst at attack (for plucks)
};

type RegionConfig = {
  voice: Voice;
  drone?: { interval: number; gain: number; type?: OscillatorType };
  beatDiv?: number;      // notes per beat (default 1)
};

const REG: Record<Instrument, RegionConfig> = {
  gamelan: {
    voice: { type: "square", attack: 0.005, decay: 0.6, sustain: 0.3, release: 1.2, filterHz: 2400, filterQ: 6, gain: 0.18, noise: 0.05 },
  },
  kalimba: {
    voice: { type: "sine", attack: 0.002, decay: 0.18, sustain: 0.0, release: 0.4, filterHz: 3200, filterQ: 1.4, gain: 0.32, noise: 0.18 },
    beatDiv: 2,
  },
  sitar: {
    voice: { type: "sawtooth", attack: 0.04, decay: 0.6, sustain: 0.5, release: 1.2, filterHz: 1600, filterQ: 5, gain: 0.16, vibratoHz: 5.5, vibratoCents: 22 },
    drone: { interval: 0, gain: 0.05, type: "sawtooth" },
    beatDiv: 1,
  },
  koto: {
    voice: { type: "triangle", attack: 0.005, decay: 0.5, sustain: 0.05, release: 0.8, filterHz: 2200, filterQ: 1, gain: 0.28, noise: 0.12 },
  },
  claves: {
    voice: { type: "square", attack: 0.001, decay: 0.06, sustain: 0.0, release: 0.05, filterHz: 4000, filterQ: 0.7, gain: 0.22, noise: 0.4 },
    beatDiv: 2,
  },
  nylonGuitar: {
    voice: { type: "triangle", attack: 0.004, decay: 0.5, sustain: 0.15, release: 0.9, filterHz: 1800, filterQ: 1.4, gain: 0.26, noise: 0.18 },
    beatDiv: 2,
  },
  saz: {
    voice: { type: "sawtooth", attack: 0.008, decay: 0.4, sustain: 0.2, release: 0.6, filterHz: 1400, filterQ: 4, gain: 0.18, noise: 0.12, vibratoHz: 6, vibratoCents: 18 },
    drone: { interval: 0, gain: 0.06, type: "triangle" },
  },
  fiddle: {
    voice: { type: "sawtooth", attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.4, filterHz: 2200, filterQ: 3, gain: 0.18, vibratoHz: 5, vibratoCents: 14 },
    beatDiv: 2,
  },
  jazzPiano: {
    voice: { type: "triangle", attack: 0.003, decay: 0.6, sustain: 0.15, release: 1.0, filterHz: 2400, filterQ: 0.8, gain: 0.22, noise: 0.05 },
  },
  didjeridu: {
    voice: { type: "sawtooth", attack: 0.4, decay: 0.6, sustain: 0.85, release: 0.8, filterHz: 380, filterQ: 6, gain: 0.32, vibratoHz: 4, vibratoCents: 30 },
    drone: { interval: 0, gain: 0.18, type: "sawtooth" },
    beatDiv: 1,
  },
};

function semisToHz(rootHz: number, semitones: number) {
  return rootHz * Math.pow(2, semitones / 12);
}

function noteHz(preset: AudioPreset, motifIdx: number) {
  const scale = preset.scale;
  const degree = preset.motif[motifIdx % preset.motif.length];
  const octave = Math.floor(degree / scale.length);
  const inScale = scale[((degree % scale.length) + scale.length) % scale.length];
  return semisToHz(preset.root, inScale + 12 * octave);
}

function pluckNoiseBuffer(ctx: AudioContext, durationMs: number, color = 0.5) {
  const len = Math.max(2, Math.floor((ctx.sampleRate * durationMs) / 1000));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = last * (1 - color) + white * color;
    const env = Math.pow(1 - i / len, 2);
    data[i] = last * env;
  }
  return buf;
}

function scheduleNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startAt: number,
  durationS: number,
  voice: Voice
) {
  const osc = ctx.createOscillator();
  osc.type = voice.type;
  osc.frequency.setValueAtTime(freq, startAt);
  if (voice.detune) osc.detune.setValueAtTime(voice.detune, startAt);

  const gain = ctx.createGain();
  const peak = (voice.gain ?? 0.2);
  const a = voice.attack;
  const d = voice.decay;
  const s = voice.sustain * peak;
  const r = voice.release;

  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + a);
  gain.gain.linearRampToValueAtTime(Math.max(s, 0.0001), startAt + a + d);
  gain.gain.setValueAtTime(Math.max(s, 0.0001), startAt + Math.max(a + d, durationS));
  gain.gain.linearRampToValueAtTime(0.0001, startAt + Math.max(a + d, durationS) + r);

  let lastNode: AudioNode = osc;
  if (voice.filterHz) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(voice.filterHz, startAt);
    if (voice.filterQ) filter.Q.setValueAtTime(voice.filterQ, startAt);
    osc.connect(filter);
    lastNode = filter;
  }
  lastNode.connect(gain);
  gain.connect(destination);

  if (voice.vibratoHz && voice.vibratoCents) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = voice.vibratoHz;
    lfoGain.gain.value = voice.vibratoCents;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    lfo.start(startAt);
    lfo.stop(startAt + durationS + r + 0.05);
  }

  osc.start(startAt);
  osc.stop(startAt + durationS + r + 0.05);

  if (voice.noise && voice.noise > 0) {
    const src = ctx.createBufferSource();
    src.buffer = pluckNoiseBuffer(ctx, 60, 0.7);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(voice.noise * peak, startAt);
    ng.gain.linearRampToValueAtTime(0.0001, startAt + 0.08);
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = Math.min(8000, freq * 4);
    nf.Q.value = 1.5;
    src.connect(nf).connect(ng).connect(destination);
    src.start(startAt);
    src.stop(startAt + 0.12);
  }
}

export class SoundMapPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private endHandler: number | null = null;
  private startedAt = 0;
  private durationS: number;
  private playing = false;

  constructor(durationS: number = CLIP_DURATION_S) {
    this.durationS = durationS;
  }

  isPlaying() {
    return this.playing;
  }

  elapsed() {
    if (!this.ctx || !this.playing) return 0;
    return Math.min(this.durationS, this.ctx.currentTime - this.startedAt);
  }

  async play(preset: AudioPreset, onEnd?: () => void) {
    this.stop();
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    if (ctx.state === "suspended") await ctx.resume();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.4);
    master.connect(ctx.destination);
    this.master = master;
    this.startedAt = ctx.currentTime;

    const cfg = REG[preset.instrument];
    const beatS = 60 / preset.bpm;
    const noteS = beatS / (cfg.beatDiv ?? 1);
    const total = this.durationS;

    if (cfg.drone) {
      const droneFreq = semisToHz(preset.root, cfg.drone.interval) / 2;
      const droneOsc = ctx.createOscillator();
      droneOsc.type = cfg.drone.type ?? "sawtooth";
      droneOsc.frequency.value = droneFreq;
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0, ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(cfg.drone.gain, ctx.currentTime + 1.2);
      droneGain.gain.setValueAtTime(cfg.drone.gain, ctx.currentTime + total - 1.2);
      droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + total);
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.value = 900;
      droneOsc.connect(droneFilter).connect(droneGain).connect(master);
      droneOsc.start(ctx.currentTime);
      droneOsc.stop(ctx.currentTime + total + 0.1);
    }

    let i = 0;
    let t = ctx.currentTime + 0.05;
    while (t < ctx.currentTime + total - 0.1) {
      const freq = noteHz(preset, i);
      scheduleNote(ctx, master, freq, t, noteS * 0.9, cfg.voice);
      t += noteS;
      i++;
    }

    this.playing = true;
    this.endHandler = window.setTimeout(() => {
      this.stop();
      onEnd?.();
    }, total * 1000);
  }

  stop() {
    if (this.endHandler) {
      window.clearTimeout(this.endHandler);
      this.endHandler = null;
    }
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.15);
    }
    if (this.ctx) {
      const ctx = this.ctx;
      window.setTimeout(() => ctx.close().catch(() => undefined), 250);
    }
    this.ctx = null;
    this.master = null;
    this.playing = false;
  }
}
