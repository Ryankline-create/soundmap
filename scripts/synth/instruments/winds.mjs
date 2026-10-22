// Blown, bowed and sustained voices: additive synthesis with time-varying
// harmonic weights, resonant bodies and breath noise. Drones are rendered as
// bar-length loops with equal-power ends so back-to-back triggers join smoothly.
import { SR, len, additive, body, sum, filter, sweep, white, noteFreq, Biquad } from '../dsp.mjs';
import { burst } from './drums.mjs';

const TAU = Math.PI * 2;
const hz = (n) => (typeof n === 'number' ? n : noteFreq(n));
const ramp = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

// sustain envelope: attack, hold to the end minus release, then fall
const sustainEnv = (seconds, attack, release) => (t) => {
  if (t < attack) return Math.sin((t / attack) * Math.PI * 0.5);
  const end = seconds - release;
  if (t < end) return 1;
  return Math.max(0, Math.cos(((t - end) / release) * Math.PI * 0.5));
};

function breath(r, seconds, env, f, q, gain) {
  const n = len(seconds);
  const s = white(n, r);
  for (let i = 0; i < n; i++) s[i] *= env(i / SR) * gain;
  return filter(s, 'bp', f, q);
}

// trumpet: brighter as it gets louder; lips start slightly flat; light vibrato on held notes
export function trumpet(r, note, seconds = 0.46) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.03, 0.09);
  const fFn = (t) => f * (1 - 0.016 * Math.exp(-t / 0.022)) * (1 + 0.0035 * Math.sin(TAU * 5.2 * t) * ramp(t, 0.16, 0.28));
  const tone = additive(seconds, fFn, 24, (k, t) => {
    const e = env(t);
    return e * Math.pow(k, -(2.5 - 1.35 * e));
  }, { rand: r });
  const s = sum([{ sig: tone }, { sig: breath(r, seconds, env, 1500, 0.9, 0.04) }]);
  return filter(s, 'peak', 1250, 1, 5);
}

// tenor saxophone: single reed, strong odd harmonics, two broad formants
export function sax(r, note, seconds = 0.42) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.025, 0.08);
  const fFn = (t) => f * (1 + 0.006 * Math.sin(TAU * 5.4 * t) * ramp(t, 0.12, 0.25));
  const tone = additive(seconds, fFn, 26, (k, t) => {
    const e = env(t);
    return e * Math.pow(k, -(1.7 - 0.6 * e)) * (k % 2 ? 1 : 0.65);
  }, { rand: r });
  const s = body(sum([{ sig: tone }, { sig: breath(r, seconds, env, 2200, 0.8, 0.06) }]), [[520, 2, 0.6], [1750, 2.5, 0.4]], 0.5);
  return s;
}

// free reeds. Bandoneón: dry, an octave reed above; accordion (raï): musette reeds that beat
export function reed(r, note, { seconds = 0.55, reeds = [[0, 1]], tilt = 0.85, nasal = 1400 } = {}) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.03, 0.07);
  const parts = reeds.map(([centsOrMult, gain], k) => {
    const fr = centsOrMult > 100 ? f * (centsOrMult / 1000) : f * Math.pow(2, centsOrMult / 1200);
    const tone = additive(seconds, (t) => fr * (1 + 0.002 * Math.sin(TAU * 3.1 * t + k)), 22, (kk, t) => env(t) * Math.pow(kk, -tilt) * (kk === 2 ? 0.8 : 1), { rand: r });
    return { sig: tone, gain };
  });
  return filter(sum(parts), 'peak', nasal, 1.1, 4);
}
export const bandoneon = (r, note) => reed(r, note, { reeds: [[0, 0.7], [2000, 0.25]], tilt: 0.95, nasal: 1300 });
export const accordion = (r, note) => reed(r, note, { seconds: 0.48, reeds: [[-13, 0.45], [0, 0.6], [13, 0.45]], tilt: 0.9, nasal: 1650 });

// fiddle: bowed sawtooth (Helmholtz motion) through violin body resonances
export function fiddle(r, note, seconds = 0.32) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.022, 0.07);
  const fFn = (t) => f * (1 + 0.0035 * Math.sin(TAU * 5.6 * t) * ramp(t, 0.09, 0.2));
  const tone = additive(seconds, fFn, 30, (k, t) => env(t) / k, { rand: r });
  const s = sum([
    { sig: tone },
    { sig: breath(r, seconds, env, 2300, 0.8, 0.05) },
    { sig: burst(r, { seconds: 0.04, f: 2800, q: 0.7, decay: 0.008 }), gain: 0.05 },
  ]);
  return body(s, [[290, 3, 0.7], [445, 3, 0.6], [1000, 2.5, 0.5], [2600, 2, 0.35]], 0.35);
}

// tin whistle: nearly pure tone, breathy, a little chiff on the attack and a scoop into the note
export function tinWhistle(r, note, seconds = 0.26) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.012, 0.04);
  const fFn = (t) => f * Math.pow(2, (-35 * Math.exp(-t / 0.015)) / 1200);
  const tone = additive(seconds, fFn, 3, (k, t) => env(t) * [0, 1, 0.18, 0.06][k], { rand: r });
  return sum([
    { sig: tone },
    { sig: breath(r, seconds, env, f, 5, 0.25) },
    { sig: breath(r, seconds, env, 4000, 0.6, 0.03) },
    { sig: burst(r, { seconds: 0.04, f: f * 2, q: 2, decay: 0.012 }), gain: 0.12 },
  ]);
}

// uilleann pipes: chanter (conical double reed, bright and crisp) and the drones
export function chanter(r, note, seconds = 0.36) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.01, 0.05);
  const tone = additive(seconds, f, 28, (k, t) => env(t) * Math.pow(k, -0.75) * (k % 2 ? 1 : 0.6), { rand: r });
  return body(tone, [[920, 2, 0.6], [1900, 2, 0.4]], 0.45);
}

// equal-power ends: fade in and out over x seconds; total = barSec + x
function loopEnds(sig, x) {
  const X = len(x);
  for (let i = 0; i < X && i < sig.length; i++) {
    const g = Math.sin((i / X) * Math.PI * 0.5);
    sig[i] *= g;
    sig[sig.length - 1 - i] *= g;
  }
  return sig;
}

export function pipesDrone(r, barSec, x = 0.25) {
  const seconds = barSec + x;
  const d3 = additive(seconds, (t) => noteFreq('d3') * (1 + 0.0008 * Math.sin(TAU * 0.7 * t)), 30, (k) => Math.pow(k, -0.8), { rand: r });
  const d2 = additive(seconds, noteFreq('d2'), 40, (k) => Math.pow(k, -0.85) * (k % 2 ? 1 : 0.7), { rand: r });
  return loopEnds(body(sum([{ sig: d3, gain: 0.6 }, { sig: d2, gain: 0.5 }]), [[700, 2, 0.4]], 0.6), x);
}

// gasba: long cane flute, played obliquely; lots of breath, a scoop and an uneven vibrato
export function gasba(r, note, seconds = 0.46) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.05, 0.08);
  const fFn = (t) => f * Math.pow(2, (-55 * Math.exp(-t / 0.04)) / 1200) * (1 + 0.008 * Math.sin(TAU * 4.6 * t + Math.sin(TAU * 1.3 * t)) * ramp(t, 0.12, 0.25));
  const tone = additive(seconds, fFn, 5, (k, t) => env(t) * [0, 1, 0.3, 0.12, 0.05, 0.02][k], { rand: r });
  return sum([
    { sig: tone },
    { sig: breath(r, seconds, env, f, 3, 0.55) },
    { sig: breath(r, seconds, env, f * 2, 4, 0.22) },
    { sig: breath(r, seconds, env, 3500, 0.5, 0.06) },
  ]);
}

// a soft sung "oh" for fado's melody line (stands in for the voice)
export function hum(r, note, seconds = 0.62) {
  const f = hz(note);
  const env = sustainEnv(seconds, 0.07, 0.12);
  const fFn = (t) => f * (1 + 0.01 * Math.sin(TAU * 5.3 * t) * ramp(t, 0.18, 0.35));
  const tone = additive(seconds, fFn, 30, (k, t) => env(t) * Math.pow(k, -1.1), { rand: r });
  return body(tone, [[450, 4, 1], [800, 5, 0.6], [2800, 6, 0.2]], 0.12);
}

// cuíca: a stick rubbed inside the drum; the hand on the skin bends the pitch like a voice
export function cuica(r, high) {
  const seconds = high ? 0.36 : 0.3;
  const fFn = high
    ? (t) => 520 + 260 * (1 - Math.exp(-t / 0.05)) - 90 * ramp(t, 0.12, 0.3)
    : (t) => 340 - 60 * (1 - Math.exp(-t / 0.08));
  const env = (t) => (t < 0.015 ? t / 0.015 : Math.exp(-(t - 0.015) / (high ? 0.16 : 0.12)));
  const tone = additive(seconds, fFn, 14, (k, t) => env(t) * Math.pow(k, -0.7), { rand: r });
  return body(tone, [[1100, 2, 0.8], [2400, 2.5, 0.35]], 0.3);
}

// pea whistle (samba apito, West African dance whistle): the pea makes a fast trill
export function peaWhistle(r, f = 2600, seconds = 0.3) {
  const env = sustainEnv(seconds, 0.01, 0.06);
  const n = len(seconds);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * f * (1 + 0.035 * Math.sin(TAU * 32 * t))) / SR;
    out[i] = Math.sin(ph) * env(t) * (0.75 + 0.25 * Math.sin(TAU * 32 * t + 1));
  }
  return sum([{ sig: out }, { sig: breath(r, seconds, env, 3000, 0.7, 0.08) }]);
}

// tanpura: the jawari bridge makes a band of overtones that rises through the
// harmonic series as the string rings. Modelled as moving harmonic weights.
export function tanpura(r, note, seconds = 2.1) {
  const f = hz(note);
  return additive(seconds, (t) => f * (1 + 0.0006 * Math.sin(TAU * 0.4 * t)), 36, (k, t) => {
    const env = t < 0.006 ? t / 0.006 : Math.exp(-t / 1.45);
    const kc = 2 + 15 * (1 - Math.exp(-t / 0.75));
    const band = 0.22 + 0.78 * Math.exp(-((k - kc) ** 2) / 24);
    return (env * band) / Math.pow(k, 0.5);
  }, { rand: r });
}

// yidaki (Yolŋu): lip buzz through the hollowed trunk; the player's mouth shapes a
// moving formant, so one held pitch keeps changing colour. Rendered one bar long.
export function yidakiDrone(r, barSec, x = 0.25) {
  const seconds = barSec + x;
  const f0 = noteFreq('d2');
  const buzz = additive(seconds, (t) => f0 * (1 + 0.003 * Math.sin(TAU * 0.5 * t)), 60, (k, t) => {
    const breathe = 0.85 + 0.15 * Math.sin(TAU * (2 / barSec) * t - 0.6);
    return Math.pow(k, -0.6) * breathe;
  }, { rand: r });
  const bore = body(buzz, [[f0, 8, 0.8], [f0 * 2.6, 7, 0.6], [f0 * 4.3, 6, 0.45], [f0 * 6.0, 6, 0.3], [f0 * 7.7, 6, 0.2]], 0.25);
  const mouth = Float32Array.from(bore);
  sweep(mouth, 'bp', (t) => 1150 + 520 * Math.sin(TAU * (1 / barSec) * t * 2 + 0.4), 2.6);
  const s = sum([{ sig: bore, gain: 0.7 }, { sig: mouth, gain: 1.1 }]);
  filter(s, 'lp', 4200, 0.7);
  return loopEnds(s, x);
}

// a spoken-tongue accent on top of the drone: a quick formant swoop and a push of breath
export function yidakiAccent(r, high = false) {
  const seconds = 0.32;
  const f0 = noteFreq('d2') * (high ? 2.6 : 1);
  const env = (t) => (t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) / 0.09));
  const buzz = additive(seconds, f0, high ? 24 : 60, (k, t) => env(t) * Math.pow(k, -0.55), { rand: r });
  sweep(buzz, 'bp', (t) => 2200 - 1400 * Math.min(1, t / 0.12), 2.2);
  return buzz;
}

export { Biquad };
