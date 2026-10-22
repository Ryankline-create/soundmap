// Plucked and struck strings. Karplus-Strong strings through resonant bodies,
// and an additive piano with stretched (inharmonic) partials.
import { SR, len, pluck, body, sum, filter, Biquad, white, noteFreq, modes, additive } from '../dsp.mjs';
import { burst, membrane } from './drums.mjs';

const hz = (n) => (typeof n === 'number' ? n : noteFreq(n));

// kora: nylon-strung harp-lute; calabash body under a cowhide soundboard
export const kora = (r, note) => body(
  pluck(0.75, { f: hz(note), decay: 1.4, bright: 0.62, damp: 0.18, pos: 0.21, rand: r }),
  [[175, 2, 0.45], [410, 3, 0.25], [1250, 2, 0.12]],
);

// steel-string guitar (palm-wine and highlife fingerpicking)
export const guitar = (r, note, seconds = 0.6) => body(
  pluck(seconds, { f: hz(note), decay: 1.7, bright: 0.72, damp: 0.12, pos: 0.15, rand: r }),
  [[105, 3, 0.5], [215, 3, 0.3], [480, 2, 0.15], [2600, 1.5, 0.1]],
);

// muted strum ("chk") for Afrobeat rhythm guitar: palm on the strings, pick across three strings
export const guitarChk = (r, notes) => sum(notes.map((n, k) => ({
  sig: body(pluck(0.14, { f: hz(n), decay: 0.09, bright: 0.65, damp: 0.35, pos: 0.12, rand: r }), [[2200, 1.2, 0.3]]),
  at: k * 0.006,
  gain: 0.7,
})).concat([{ sig: burst(r, { seconds: 0.03, f: 3500, q: 0.8, decay: 0.005 }), gain: 0.2 }]));

// nylon-string guitar (tango and fado accompaniment)
export const nylon = (r, note, seconds = 0.6, bright = 0.38) => body(
  pluck(seconds, { f: hz(note), decay: 1.3, bright, damp: 0.3, pos: 0.2, rand: r }),
  [[98, 3, 0.55], [196, 3, 0.3], [400, 2, 0.12]],
);

// strum: strings sounded a few milliseconds apart (down = low to high)
export function strum(r, notes, { gap = 0.013, seconds = 0.55, voice = nylon, bright, up = false } = {}) {
  const order = up ? [...notes].reverse() : notes;
  return sum(order.map((n, k) => ({ sig: voice(r, n, seconds, bright), at: k * gap, gain: 0.55 })));
}

// flamenco rasgueado: the fingers flick out one after another (e, a, m, i) across the chord
export function rasgueado(r, notes) {
  const parts = [];
  const flicks = [0, 0.032, 0.062, 0.09];
  flicks.forEach((at, k) => {
    parts.push({ sig: strum(r, notes, { gap: 0.004, seconds: 0.5, bright: 0.68, up: k % 2 === 1 }), at, gain: k === 3 ? 0.9 : 0.55 });
  });
  parts.push({ sig: burst(r, { seconds: 0.05, f: 2000, q: 0.7, decay: 0.01 }), gain: 0.25 });
  return sum(parts);
}

// Portuguese guitar: steel courses in pairs, so each note sounds twice, slightly apart
export const portugueseGuitar = (r, note) => {
  const f = hz(note);
  const a = pluck(0.78, { f, decay: 1.5, bright: 0.86, damp: 0.08, pos: 0.13, rand: r });
  const b = pluck(0.78, { f: f * 1.0035, decay: 1.4, bright: 0.86, damp: 0.08, pos: 0.15, rand: r });
  return body(sum([{ sig: a, gain: 0.6 }, { sig: b, at: 0.004, gain: 0.5 }]), [[310, 2, 0.3], [1150, 2, 0.22], [2500, 2, 0.15]]);
};

// oud: fretless, double courses plucked with a long plectrum (risha), deep round body
export const oud = (r, note) => {
  const f = hz(note);
  const a = pluck(0.6, { f, decay: 1.1, bright: 0.74, damp: 0.24, pos: 0.12, rand: r });
  const b = pluck(0.6, { f: f * 1.002, decay: 1.0, bright: 0.74, damp: 0.24, pos: 0.13, rand: r });
  return body(sum([{ sig: a, gain: 0.6 }, { sig: b, at: 0.003, gain: 0.5 }]), [[110, 2, 0.55], [245, 2, 0.35], [520, 3, 0.15]]);
};

// guembri: three-string bass lute with a camel-skin top; the metal plate (sersera)
// fixed to the neck rattles along with the note
export const guembri = (r, note) => {
  const f = hz(note);
  const str = pluck(0.55, { f, decay: 0.9, bright: 0.5, damp: 0.38, pos: 0.25, rand: r });
  const thump = membrane(r, { f: 92, f0: 104, d: 0.05, ratios: [1, 1.594], amps: [1, 0.3], len: 0.2 });
  const n = str.length;
  const rattle = white(n, r);
  let env = 0;
  for (let i = 0; i < n; i++) {
    env = Math.max(Math.abs(str[i]), env * 0.9995);
    rattle[i] *= env * env * 3;
  }
  filter(rattle, 'bp', 3200, 2);
  return body(sum([{ sig: str }, { sig: thump, gain: 0.3 }, { sig: rattle, gain: 0.08 }]), [[90, 2, 0.4], [240, 2, 0.2]]);
};
export const guembriSlap = (r) => sum([
  { sig: membrane(r, { f: 80, f0: 92, d: 0.07, ratios: [1, 1.594], amps: [1, 0.3], len: 0.28 }) },
  { sig: pluck(0.25, { f: noteFreq('a1'), decay: 0.12, bright: 0.7, damp: 0.3, pos: 0.1, rand: r }), gain: 0.6 },
  { sig: burst(r, { seconds: 0.06, f: 900, q: 0.8, decay: 0.012 }), gain: 0.4 },
]);

// sitar: plectrum (mizrab), bridge buzz (jawari) inside the string loop, and the
// sympathetic strings (tarab) ringing along at the raga's notes
export const sitar = (r, note, { seconds = 0.9, glideTo, glideAt = 0.14, glideTime = 0.2 } = {}) => {
  const f = hz(note);
  const g = glideTo ? hz(glideTo) : f;
  const fFn = glideTo ? (t) => (t < glideAt ? f : f + (g - f) * Math.min(1, (t - glideAt) / glideTime) ** 0.7) : f;
  const str = pluck(seconds, { f: fFn, decay: 2.2, bright: 0.92, damp: 0.08, pos: 0.09, buzz: 0.42, rand: r });
  const tarab = new Float32Array(str.length);
  for (const n of ['c4', 'd4', 'e4', 'fs4', 'g4', 'b3', 'c5']) {
    const b = new Biquad('bp', noteFreq(n), 70);
    for (let i = 0; i < str.length; i++) tarab[i] += b.tick(str[i]);
  }
  return body(sum([{ sig: str }, { sig: tarab, gain: 0.5 }]), [[360, 2, 0.25], [920, 2, 0.15]]);
};

// round acoustic bass (jazz walking, son tumbao, tango, fado)
export const bass = (r, note) => {
  const s = pluck(0.5, { f: hz(note), decay: 1.0, bright: 0.3, damp: 0.45, pos: 0.22, rand: r });
  const thumb = burst(r, { seconds: 0.03, f: 400, q: 0.7, decay: 0.006 });
  return body(sum([{ sig: s }, { sig: thumb, gain: 0.15 }]), [[90, 2, 0.5], [180, 2, 0.25]]);
};

// ---------- piano ----------
// stretched partials f_k = k f sqrt(1 + B k^2), three slightly detuned strings,
// two-stage decay and a hammer knock
export function pianoNote(r, note, seconds = 0.55) {
  const f = hz(note);
  const B = 0.00015 + Math.max(0, (f - 500) / 1e7);
  const register = Math.min(1, Math.max(0, Math.log2(f / 65) / 6));
  const tau1 = 1.4 - register * 0.9;
  const parts = [];
  for (const det of [-0.7, 0, 0.8]) {
    const fd = f * Math.pow(2, det / 1200);
    const list = [];
    for (let k = 1; k <= 14; k++) {
      const fk = k * fd * Math.sqrt(1 + B * k * k);
      if (fk > SR * 0.45) break;
      const a = (1 / Math.pow(k, 1.15)) * (k === 1 ? 1 : 0.9) * (1 - register * 0.25 * Math.min(1, k / 6));
      list.push({ f: fk, a: a / 3, d: tau1 / (1 + 0.35 * (k - 1)), ph: k * 0.37 + det });
    }
    parts.push({ sig: modes(seconds, list, { attack: 0.0015 }) });
  }
  parts.push({ sig: burst(r, { seconds: 0.03, f: 1800 + register * 1500, q: 0.7, decay: 0.006 }), gain: 0.05 });
  const s = sum(parts);
  // brief prompt decay then a quieter aftersound
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    s[i] *= 0.6 + 0.4 * Math.exp(-t / 0.09);
  }
  return s;
}

export const pianoChord = (r, notes, seconds = 0.5) => sum(notes.map((n, k) => ({ sig: pianoNote(r, n, seconds), at: k * 0.004, gain: 0.7 })));

export { additive };
