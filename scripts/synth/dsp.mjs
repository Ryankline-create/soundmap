// SoundMap synthesizer: DSP building blocks. Zero dependencies.
// Everything renders offline into Float32Array buffers at SR.

export const SR = 22050;
const TAU = Math.PI * 2;

// ---------- randomness (deterministic) ----------

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- buffers ----------

export const len = (sec) => Math.max(1, Math.round(sec * SR));
export const buf = (sec) => new Float32Array(len(sec));

export function mix(target, src, gain = 1, offsetSec = 0) {
  const o = Math.round(offsetSec * SR);
  const n = Math.min(src.length, target.length - o);
  for (let i = 0; i < n; i++) target[i + o] += src[i] * gain;
  return target;
}

// sums several buffers (with gains/offsets) into a new buffer long enough for all
export function sum(parts) {
  let n = 1;
  for (const p of parts) n = Math.max(n, Math.round((p.at ?? 0) * SR) + p.sig.length);
  const out = new Float32Array(n);
  for (const p of parts) mix(out, p.sig, p.gain ?? 1, p.at ?? 0);
  return out;
}

export function scale(sig, g) {
  for (let i = 0; i < sig.length; i++) sig[i] *= g;
  return sig;
}

export function peak(sig) {
  let p = 0;
  for (let i = 0; i < sig.length; i++) {
    const a = Math.abs(sig[i]);
    if (a > p) p = a;
  }
  return p;
}

export const dbToGain = (db) => Math.pow(10, db / 20);

// ---------- notes ----------

const NOTE_INDEX = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

// 'c4', 'fs4' (sharp), 'bb3' (flat), 'ehf4' (half-flat, 50 cents low), 'eqs4' (quarter-sharp)
export function noteFreq(name) {
  const m = /^([a-g])(s|b|hf|qs)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  let semis = NOTE_INDEX[m[1]];
  if (m[2] === 's') semis += 1;
  if (m[2] === 'b') semis -= 1;
  if (m[2] === 'hf') semis -= 0.5;
  if (m[2] === 'qs') semis += 0.5;
  const midi = 12 * (Number(m[3]) + 1) + semis;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const cents = (f, c) => f * Math.pow(2, c / 1200);

// ---------- noise ----------

export function white(n, rand) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = rand() * 2 - 1;
  return out;
}

// ---------- filters ----------

export class Biquad {
  constructor(type = 'lp', f = 1000, q = 0.707, gain = 0) {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(type, f, q, gain);
  }
  set(type, f, q = 0.707, gain = 0) {
    f = Math.min(Math.max(f, 5), SR * 0.48);
    const w = (TAU * f) / SR;
    const cw = Math.cos(w);
    const sw = Math.sin(w);
    const alpha = sw / (2 * q);
    const A = Math.pow(10, gain / 40);
    let b0, b1, b2, a0, a1, a2;
    switch (type) {
      case 'lp': b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'hp': b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'bp': b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'notch': b0 = 1; b1 = -2 * cw; b2 = 1; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
      case 'peak': b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; break;
      case 'lowshelf': {
        const s = 2 * Math.sqrt(A) * alpha;
        b0 = A * ((A + 1) - (A - 1) * cw + s); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - s);
        a0 = (A + 1) + (A - 1) * cw + s; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - s;
        break;
      }
      case 'highshelf': {
        const s = 2 * Math.sqrt(A) * alpha;
        b0 = A * ((A + 1) + (A - 1) * cw + s); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - s);
        a0 = (A + 1) - (A - 1) * cw + s; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s;
        break;
      }
      default: throw new Error(`filter type ${type}`);
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  tick(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

export function filter(sig, type, f, q = 0.707, gain = 0) {
  const b = new Biquad(type, f, q, gain);
  for (let i = 0; i < sig.length; i++) sig[i] = b.tick(sig[i]);
  return sig;
}

// cutoff follows fFn(tSeconds); coefficients refresh every 16 samples
export function sweep(sig, type, fFn, q = 0.707, gain = 0) {
  const b = new Biquad(type, fFn(0), q, gain);
  for (let i = 0; i < sig.length; i++) {
    if ((i & 15) === 0) b.set(type, fFn(i / SR), q, gain);
    sig[i] = b.tick(sig[i]);
  }
  return sig;
}

// parallel resonant body: sum of band-passes added to the dry signal
export function body(sig, peaks, dry = 1) {
  const out = new Float32Array(sig.length);
  for (let i = 0; i < sig.length; i++) out[i] = sig[i] * dry;
  for (const [f, q, g] of peaks) {
    const b = new Biquad('bp', f, q);
    for (let i = 0; i < sig.length; i++) out[i] += b.tick(sig[i]) * g;
  }
  return out;
}

export function onePoleLP(sig, coef) {
  let y = 0;
  for (let i = 0; i < sig.length; i++) {
    y += coef * (sig[i] - y);
    sig[i] = y;
  }
  return sig;
}

// ---------- envelopes ----------

export const expDecay = (t, tau) => Math.exp(-t / tau);

// attack (linear-ish) then exponential decay
export function ad(t, attack, tau) {
  if (t < attack) return Math.sin((t / attack) * Math.PI * 0.5);
  return Math.exp(-(t - attack) / tau);
}

// attack, sustain level held until `hold`, then release
export function asr(t, attack, hold, release, sustain = 1) {
  if (t < attack) return (t / attack) * sustain;
  if (t < hold) return sustain;
  return sustain * Math.exp(-(t - hold) / release);
}

export function applyEnv(sig, fn) {
  for (let i = 0; i < sig.length; i++) sig[i] *= fn(i / SR);
  return sig;
}

// ---------- oscillators ----------

// sum of decaying sinusoidal modes; modes: [{ f, a, d, f0?, pd? }]
// f may glide from f0 to f with time constant pd (pitch drop)
export function modes(seconds, list, opts = {}) {
  const n = len(seconds);
  const out = new Float32Array(n);
  const attack = opts.attack ?? 0.0015;
  for (const m of list) {
    let ph = m.ph ?? 0;
    const glide = m.f0 !== undefined && m.pd;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const f = glide ? m.f + (m.f0 - m.f) * Math.exp(-t / m.pd) : m.f;
      ph += (TAU * f) / SR;
      const env = Math.exp(-t / m.d) * (t < attack ? t / attack : 1);
      out[i] += Math.sin(ph) * env * m.a;
    }
  }
  return out;
}

// inharmonic partials with slow beating pairs (gongs, metallophones)
export function metal(seconds, f, partials, opts = {}) {
  const list = [];
  for (const [ratio, amp, decay, beat = 0] of partials) {
    list.push({ f: f * ratio, a: amp, d: decay });
    if (beat) list.push({ f: f * ratio + beat, a: amp * 0.8, d: decay * 0.95, ph: 1.3 });
  }
  return modes(seconds, list, opts);
}

// 2-operator FM, index decays with tauIdx
export function fm(seconds, { fc, ratio, index, tauIdx, tau, attack = 0.001, fb = 0 }) {
  const n = len(seconds);
  const out = new Float32Array(n);
  let pc = 0;
  let pm = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const idx = index * Math.exp(-t / tauIdx);
    pm += (TAU * fc * ratio) / SR;
    const mod = Math.sin(pm + fb * prev);
    prev = mod;
    pc += (TAU * fc) / SR;
    out[i] = Math.sin(pc + idx * mod) * ad(t, attack, tau);
  }
  return out;
}

// band-limited additive tone. f: number | (t) => Hz. amp(k, t): partial k (1-based) amplitude at time t
export function additive(seconds, f, count, amp, opts = {}) {
  const n = len(seconds);
  const out = new Float32Array(n);
  const fFn = typeof f === 'function' ? f : () => f;
  const phases = new Float64Array(count + 1);
  const rand = opts.rand;
  if (rand) for (let k = 1; k <= count; k++) phases[k] = rand() * TAU;
  let base = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f0 = fFn(t);
    base += (TAU * f0) / SR;
    let s = 0;
    for (let k = 1; k <= count; k++) {
      if (f0 * k > SR * 0.45) break;
      const a = amp(k, t);
      if (a !== 0) s += a * Math.sin(base * k + phases[k]);
    }
    out[i] = s;
  }
  return out;
}

// ---------- Karplus-Strong string ----------

// f: Hz or (t) => Hz (glides/bends); decay: seconds to -60 dB at the fundamental;
// bright: 0..1 excitation brightness; damp: 0..1 loop lowpass (higher = darker);
// pos: pluck position 0..0.5 (comb on excitation); buzz: 0..1 jawari-style one-sided clip in the loop
export function pluck(seconds, { f, decay = 1.5, bright = 0.6, damp = 0.25, pos = 0.18, buzz = 0, rand, excite }) {
  damp = Math.min(Math.max(damp, 0), 0.85);
  const n = len(seconds);
  const out = new Float32Array(n);
  const fFn = typeof f === 'function' ? f : () => f;
  const SIZE = 8192;
  const line = new Float32Array(SIZE);
  let w = 0;
  const f0 = fFn(0);
  const period = SR / f0;
  // excitation: one period of filtered noise (or a supplied burst), shaped by pluck position
  const exLen = Math.max(4, Math.round(period));
  let ex = excite ? excite(exLen) : white(exLen, rand);
  ex = onePoleLP(ex, 0.08 + bright * 0.9);
  const pd = Math.max(1, Math.round(exLen * pos));
  const shaped = new Float32Array(exLen);
  for (let i = 0; i < exLen; i++) shaped[i] = ex[i] - (i >= pd ? ex[i - pd] : 0) * 0.9;
  let lp = 0;
  let dc = 0;
  let dcy = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fNow = fFn(t);
    const L = SR / fNow - damp / (1 - damp);
    // loss per sample from T60 at the current pitch
    const g = Math.pow(10, -3 / (fNow * decay));
    let rp = w - L;
    while (rp < 0) rp += SIZE;
    const i0 = Math.floor(rp);
    const frac = rp - i0;
    const a = line[i0 % SIZE];
    const b = line[(i0 + 1) % SIZE];
    let y = a + (b - a) * frac;
    lp += (1 - damp) * (y - lp);
    y = lp * g;
    if (buzz > 0 && y > 0) {
      const th = 0.25 * (1 - buzz * 0.85);
      if (y > th) y = th + (y - th) * (1 - buzz);
    }
    if (i < exLen) y += shaped[i];
    line[w] = y;
    w = (w + 1) % SIZE;
    // dc block
    dcy = y - dc + 0.995 * dcy;
    dc = y;
    out[i] = dcy;
  }
  return out;
}

// ---------- shaping ----------

export function softclip(sig, drive = 1) {
  const norm = Math.tanh(drive);
  for (let i = 0; i < sig.length; i++) sig[i] = Math.tanh(sig[i] * drive) / norm;
  return sig;
}

export function dcBlock(sig) {
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < sig.length; i++) {
    const y = sig[i] - x1 + 0.997 * y1;
    x1 = sig[i];
    y1 = y;
    sig[i] = y;
  }
  return sig;
}

// small Schroeder room: tail seconds ~ rt, wet mix
export function room(sig, { rt = 0.35, wet = 0.15, extra = 0.3 } = {}) {
  const n = sig.length + len(extra);
  const out = new Float32Array(n);
  out.set(sig);
  const combs = [1116, 1188, 1277, 1356].map((d) => Math.round((d * SR) / 44100));
  const wetBuf = new Float32Array(n);
  for (const d of combs) {
    const g = Math.pow(10, (-3 * d) / (SR * rt));
    const line = new Float32Array(d);
    let p = 0;
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const x = i < sig.length ? sig[i] : 0;
      const y = line[p];
      lp += 0.6 * (y - lp);
      line[p] = x + lp * g;
      p = (p + 1) % d;
      wetBuf[i] += y * 0.25;
    }
  }
  for (const d of [556, 441].map((v) => Math.round((v * SR) / 44100))) {
    const line = new Float32Array(d);
    let p = 0;
    for (let i = 0; i < n; i++) {
      const x = wetBuf[i];
      const y = line[p];
      const v = x + y * 0.5;
      line[p] = v;
      wetBuf[i] = y - v * 0.5;
      p = (p + 1) % d;
    }
  }
  for (let i = 0; i < n; i++) out[i] += wetBuf[i] * wet;
  return out;
}

// ---------- finishing ----------

// trims trailing audio below thresholdDb (relative to peak) and caps to maxSec,
// fades the end over fadeMs and the start over inMs
export function finish(sig, { maxSec = 4, thresholdDb = -54, fadeMs = 30, inMs = 1.5 } = {}) {
  dcBlock(sig);
  const p = peak(sig) || 1;
  const th = p * dbToGain(thresholdDb);
  let end = Math.min(sig.length, len(maxSec));
  let last = 0;
  for (let i = 0; i < end; i++) if (Math.abs(sig[i]) > th) last = i;
  end = Math.min(end, last + len(0.01));
  const out = sig.slice(0, Math.max(end, 32));
  const fo = Math.min(out.length, len(fadeMs / 1000));
  for (let i = 0; i < fo; i++) {
    const g = i / fo;
    out[out.length - 1 - i] *= g * g;
  }
  const fi = Math.min(out.length, len(inMs / 1000));
  for (let i = 0; i < fi; i++) out[i] *= i / fi;
  return out;
}

export function normalize(sig, peakDb) {
  const p = peak(sig);
  if (p > 0) scale(sig, dbToGain(peakDb) / p);
  return sig;
}

// exact-length loop: crossfades the tail into the head so it repeats without a click
export function loopify(sig, seconds, xfadeSec = 0.12) {
  const L = len(seconds);
  const X = len(xfadeSec);
  if (sig.length < L + X) throw new Error('loopify: source too short');
  const out = sig.slice(0, L);
  for (let i = 0; i < X; i++) {
    const g = i / X;
    out[i] = out[i] * Math.sqrt(g) + sig[L + i] * Math.sqrt(1 - g);
  }
  return out;
}

// harmonic exciter for low drums: saturated copy, band-limited to what phone
// speakers can play, mixed under the original so the pitch still reads
export function exciter(sig, amount = 0.35, drive = 3, lo = 180, hi = 2500) {
  const p = peak(sig) || 1;
  const sat = new Float32Array(sig.length);
  for (let i = 0; i < sig.length; i++) sat[i] = Math.tanh((sig[i] / p) * drive);
  filter(sat, 'hp', lo, 0.7);
  filter(sat, 'lp', hi, 0.7);
  for (let i = 0; i < sig.length; i++) sig[i] += sat[i] * p * amount;
  return sig;
}
