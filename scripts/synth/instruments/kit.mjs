// Drum-machine voices (reggaeton, raï) and the interface sounds.
import { SR, len, modes, additive, sum, filter, sweep, softclip, noteFreq, white } from '../dsp.mjs';
import { membrane, burst, clap } from './drums.mjs';
import { softMallet, bellTone } from './idiophones.mjs';

const hz = (n) => (typeof n === 'number' ? n : noteFreq(n));

// ---------- drum machine ----------
export const dmKick = (r) => softclip(membrane(r, { f: 50, f0: 165, pd: 0.028, d: 0.3, ratios: [1], amps: [1], click: 0.25, len: 0.5 }), 1.4);
export const dmSnare = (r) => sum([
  { sig: membrane(r, { f: 225, f0: 260, pd: 0.01, d: 0.05, ratios: [1, 1.6], amps: [1, 0.3], len: 0.25 }), gain: 0.55 },
  { sig: burst(r, { seconds: 0.25, f: 2900, q: 0.8, decay: 0.075, hp: 1200 }), gain: 1 },
  { sig: clap(r, { f: 1600, taps: 2, tail: 0.04 }), gain: 0.5 },
]);
export const dmHat = (r) => {
  const n = len(0.07);
  const s = white(n, r);
  for (let i = 0; i < n; i++) s[i] *= Math.exp(-(i / SR) / 0.02);
  return filter(filter(s, 'hp', 7000, 0.7), 'peak', 9000, 1, 5);
};

// sub bass: a sine with a soft-clipped edge so phone speakers still carry the note
export function sub(r, note, seconds = 0.6) {
  const f = hz(note);
  const env = (t) => (t < 0.004 ? t / 0.004 : Math.exp(-(t - 0.004) / 0.55));
  const s = additive(seconds, (t) => f * (1 + 0.15 * Math.exp(-t / 0.02)), 4, (k, t) => env(t) * [0, 1, 0.45, 0.25, 0.1][k]);
  return softclip(s, 1.8);
}

// synth stab: short detuned saw chord with a closing filter
export function stab(r, notes, seconds = 0.3) {
  const parts = [];
  for (const n of notes) {
    for (const det of [-8, 8]) {
      const f = hz(n) * Math.pow(2, det / 1200);
      parts.push({ sig: additive(seconds, f, 20, (k, t) => (t < 0.003 ? t / 0.003 : Math.exp(-t / 0.09)) / k, { rand: r }), gain: 0.3 });
    }
  }
  return sweep(sum(parts), 'lp', (t) => 600 + 4200 * Math.exp(-t / 0.06), 1.2);
}

// synth bass for raï: rounded saw
export function synBass(r, note, seconds = 0.45) {
  const env = (t) => (t < 0.005 ? t / 0.005 : Math.exp(-(t - 0.005) / 0.3));
  return filter(additive(seconds, hz(note), 14, (k, t) => env(t) / k, { rand: r }), 'lp', 900, 0.9);
}

// ---------- interface ----------
// rubber stamp landing on a passport page: a low thud, a paper tick
export const uiThump = (r) => sum([
  { sig: membrane(r, { f: 78, f0: 120, pd: 0.018, d: 0.07, ratios: [1, 1.7], amps: [1, 0.25], len: 0.26 }) },
  { sig: burst(r, { seconds: 0.06, f: 1600, q: 0.7, decay: 0.012 }), gain: 0.25 },
  { sig: burst(r, { seconds: 0.08, f: 350, q: 0.6, decay: 0.02 }), gain: 0.35 },
]);
export const uiTick = () => modes(0.045, [{ f: 2350, a: 1, d: 0.009 }, { f: 4050, a: 0.4, d: 0.005 }], { attack: 0.0005 });
export const uiCorrect = () => sum([
  { sig: softMallet(noteFreq('e5'), 0.4), gain: 0.8 },
  { sig: softMallet(noteFreq('b5'), 0.5), at: 0.075, gain: 0.9 },
]);
export const uiWrong = () => sum([
  { sig: softMallet(noteFreq('c4'), 0.25), gain: 0.9 },
  { sig: softMallet(noteFreq('a3'), 0.32), at: 0.09, gain: 0.9 },
]);
export const uiUnlock = () => sum(['c5', 'e5', 'g5', 'c6'].map((n, k) => ({ sig: bellTone(noteFreq(n), 0.8), at: k * 0.07, gain: 0.45 })));
export const uiFlip = (r) => {
  const n = len(0.14);
  const s = white(n, r);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    s[i] *= Math.sin(Math.min(1, t / 0.14) * Math.PI) * 0.6;
  }
  return sweep(s, 'bp', (t) => 900 + 3000 * (t / 0.14), 1.1);
};
