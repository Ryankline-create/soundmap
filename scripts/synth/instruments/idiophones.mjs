// Struck wood and metal: bells (2-operator FM), gongs and metallophones
// (inharmonic partials with slow beating pairs), bars and tines (modal
// resonators), cymbals.
import { SR, len, modes, metal, fm, white, Biquad, filter, sum, noteFreq } from '../dsp.mjs';
import { burst } from './drums.mjs';

const TAU = Math.PI * 2;

const stick = (r, f = 3000, gain = 0.4, decay = 0.004) => ({ sig: burst(r, { seconds: 0.03, f, q: 0.8, decay }), gain });

// ---------- woods ----------
export const clave = (r, f = 2450) => sum([
  { sig: modes(0.16, [{ f, a: 1, d: 0.032 }, { f: f * 2.76, a: 0.14, d: 0.01 }]) },
  stick(r, 3800, 0.25, 0.002),
]);
export const clapsticks = (r) => sum([
  { sig: modes(0.13, [{ f: 1880, a: 1, d: 0.026 }, { f: 2930, a: 0.55, d: 0.02 }, { f: 4650, a: 0.22, d: 0.012 }]) },
  stick(r, 3300, 0.45, 0.003),
]);

// ---------- bells ----------
// West African iron bell (double bell / gankogui family): bright FM with an inharmonic modulator
export const ironBell = (r, f = 860) => sum([
  { sig: fm(0.65, { fc: f, ratio: 1.41, index: 2.6, tauIdx: 0.05, tau: 0.32 }) },
  { sig: fm(0.65, { fc: f * 2.76, ratio: 1.41, index: 1.2, tauIdx: 0.02, tau: 0.12 }), gain: 0.25 },
  stick(r, 4200, 0.25, 0.002),
]);
export const agogo = (r, f) => sum([
  { sig: fm(0.45, { fc: f, ratio: 1.42, index: 3, tauIdx: 0.03, tau: 0.22 }) },
  stick(r, 4500, 0.2, 0.002),
]);
export const cowbell = (r, f = 560) => {
  const s = sum([
    { sig: metal(0.45, f, [[1, 1, 0.22], [1.48, 0.75, 0.18], [2.21, 0.3, 0.08], [3.12, 0.2, 0.05]]) },
    stick(r, 2600, 0.35, 0.003),
  ]);
  return filter(s, 'peak', f * 1.48, 1.2, 4);
};

// ---------- cymbals and jingly metal ----------
function metalNoise(r, seconds, decay, hp, gain = 1) {
  const n = len(seconds);
  const s = white(n, r);
  for (let i = 0; i < n; i++) s[i] *= Math.exp(-(i / SR) / decay) * gain;
  return filter(s, 'hp', hp, 0.7);
}
// TR-808-style square cluster for hi-hats
function squares(seconds) {
  const freqs = [205.3, 304.4, 369.6, 522.7, 540, 800];
  const n = len(seconds);
  const out = new Float32Array(n);
  for (const f of freqs) {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      ph += (f * 2.2) / SR;
      out[i] += (ph % 1 < 0.5 ? 1 : -1) / freqs.length;
    }
  }
  return out;
}
export const hihat = (r, open = false) => {
  const d = open ? 0.22 : 0.028;
  const sec = open ? 0.45 : 0.09;
  const s = squares(sec);
  const nz = white(s.length, r);
  for (let i = 0; i < s.length; i++) {
    const e = Math.exp(-(i / SR) / d);
    s[i] = (s[i] * 0.6 + nz[i] * 0.5) * e;
  }
  filter(s, 'hp', 6200, 0.8);
  return filter(s, 'peak', 8500, 1, 4);
};
export const ride = (r) => sum([
  { sig: metal(0.75, 410, [[1, 0.5, 0.6, 1.3], [1.53, 0.4, 0.5], [2.37, 0.35, 0.45, 2.1], [3.21, 0.25, 0.4], [4.4, 0.2, 0.3], [5.7, 0.15, 0.25]]) },
  { sig: metalNoise(r, 0.75, 0.3, 4500, 0.35) },
  stick(r, 5000, 0.2, 0.002),
]);
export const chappa = (r) => sum([
  { sig: metal(0.45, 1100, [[1, 0.6, 0.22, 3], [1.36, 0.5, 0.2], [1.83, 0.45, 0.17, 4], [2.41, 0.35, 0.14], [3.12, 0.25, 0.1], [3.9, 0.2, 0.08]]) },
  { sig: metalNoise(r, 0.3, 0.05, 3000, 0.6) },
]);
export const cengceng = (r) => sum([
  { sig: metal(0.36, 920, [[1, 0.5, 0.18], [1.42, 0.5, 0.16, 5], [1.94, 0.4, 0.14], [2.61, 0.35, 0.11], [3.3, 0.3, 0.09], [4.17, 0.25, 0.07]]) },
  { sig: metalNoise(r, 0.3, 0.06, 2800, 0.8) },
  // the second cymbal of the pair a moment later
  { sig: metalNoise(r, 0.2, 0.03, 3200, 0.4), at: 0.012 },
]);
export const manjira = (r) => sum([
  { sig: metal(0.8, 2050, [[1, 1, 0.65, 2.5], [2.31, 0.45, 0.4, 3.5], [3.72, 0.25, 0.25], [5.1, 0.12, 0.15]]) },
  stick(r, 4500, 0.15, 0.002),
]);
export const zills = (r) => sum([
  { sig: metal(0.6, 2600, [[1, 1, 0.45, 3], [1.47, 0.5, 0.35], [2.09, 0.35, 0.25, 4], [2.56, 0.2, 0.18]]) },
  stick(r, 5000, 0.12, 0.002),
]);
// iron castanets: two plates clash, then rattle once
export const qraqeb = (r) => {
  const clash = (f, g) => sum([
    { sig: metal(0.16, f, [[1, 0.6, 0.07], [1.33, 0.5, 0.06], [1.71, 0.45, 0.05], [2.25, 0.35, 0.04], [2.9, 0.25, 0.03]]) },
    { sig: metalNoise(r, 0.1, 0.012, 2500, 0.9) },
  ].map((p) => ({ ...p, gain: g })));
  return sum([{ sig: clash(1750, 1) }, { sig: clash(1820, 0.45), at: 0.009 }]);
};
export const kecrek = (r) => {
  const hit = () => sum([
    { sig: metal(0.22, 1250, [[1, 0.6, 0.1], [1.55, 0.5, 0.08], [2.3, 0.4, 0.06], [3.1, 0.3, 0.05]]) },
    { sig: metalNoise(r, 0.15, 0.02, 2800, 0.6) },
  ]);
  return sum([{ sig: hit() }, { sig: hit(), at: 0.018, gain: 0.5 }]);
};

// ---------- gamelan ----------
// Javanese slendro, approximated: degrees 1 2 3 5 6 about 240 cents apart.
// Real gamelan sets each have their own tuning; this is one plausible set.
const SLENDRO_CENTS = { 1: 0, 2: 231, 3: 474, 5: 717, 6: 955 };
export const slendro = (degree, base = 530) => base * Math.pow(2, SLENDRO_CENTS[degree] / 1200);

// gong ageng: the big gong that closes each cycle; its fundamental beats slowly (ombak)
export const gongAgeng = () => sum([
  { sig: metal(2.6, 52, [[1, 1, 2.6, 2.2], [1.94, 0.5, 1.6, 1.5], [2.83, 0.35, 1.0], [3.95, 0.2, 0.6, 2.8], [5.2, 0.1, 0.4]], { attack: 0.012 }) },
]);
export const kempul = () => metal(1.5, 196, [[1, 1, 1.4, 1.6], [1.51, 0.4, 0.8], [2.02, 0.35, 0.55, 2.4], [2.83, 0.18, 0.3]], { attack: 0.006 });
export const kenong = () => metal(1.2, 545, [[1, 1, 1.1, 0.8], [2.01, 0.35, 0.6], [2.97, 0.18, 0.35], [4.1, 0.08, 0.2]], { attack: 0.004 });
export const ketuk = (r) => sum([
  { sig: metal(0.28, 330, [[1, 1, 0.1], [2.03, 0.4, 0.06], [3.1, 0.15, 0.04]], { attack: 0.003 }) },
  stick(r, 1800, 0.15, 0.004),
]);
export const kajar = (r) => sum([
  { sig: metal(0.22, 610, [[1, 1, 0.08], [2.1, 0.35, 0.05], [3.3, 0.15, 0.03]], { attack: 0.002 }) },
  stick(r, 2500, 0.2, 0.003),
]);
export const bonang = (f) => metal(0.65, f, [[1, 1, 0.5, 1.2], [2.0, 0.3, 0.3], [2.92, 0.22, 0.2], [4.2, 0.1, 0.1]], { attack: 0.002 });
// saron: thick bronze bar; free-bar mode ratios 1 : 2.76 : 5.40
export const saron = (r, f, seconds = 0.75) => sum([
  { sig: metal(seconds, f, [[1, 1, 0.85, 1.4], [2.76, 0.32, 0.28], [5.4, 0.1, 0.1]], { attack: 0.0015 }) },
  stick(r, 3200, 0.18, 0.003),
]);
// gendèr: thin bars over tube resonators, padded mallet, paired tuning that beats
export const gender = (f) => metal(0.62, f, [[1, 1, 0.75, 3.5], [2.76, 0.1, 0.22], [4.0, 0.04, 0.1]], { attack: 0.004 });

// ---------- tuned bars, pans, tines ----------
export const steelPan = (r, f) => sum([
  { sig: modes(0.68, [
    { f, a: 1, d: 0.75 }, { f: f * 1.003, a: 0.25, d: 0.6, ph: 1 },
    { f: f * 2, a: 0.55, d: 0.5 }, { f: f * 3.0, a: 0.28, d: 0.3 }, { f: f * 4.02, a: 0.1, d: 0.16 },
  ], { attack: 0.003 }) },
  { sig: burst(r, { seconds: 0.02, f: Math.min(f * 5, 6000), q: 1, decay: 0.003 }), gain: 0.15 },
]);

// balafon: rosewood bar over a gourd; the gourd's membrane (mirliton) adds the buzz
export const balafon = (r, f) => {
  const tone = modes(0.48, [{ f, a: 1, d: 0.32 }, { f: f * 2.92, a: 0.24, d: 0.1 }, { f: f * 5.6, a: 0.08, d: 0.04 }], { attack: 0.0012 });
  const res = new Biquad('bp', f, 6);
  const n = tone.length;
  const buzz = white(n, r);
  for (let i = 0; i < n; i++) {
    const x = tone[i];
    tone[i] = x + res.tick(x) * 0.6;
    buzz[i] *= Math.max(0, x) * 1.6;
  }
  filter(buzz, 'bp', 1450, 1.6);
  return sum([{ sig: tone }, { sig: buzz, gain: 0.35 }, stick(r, 2800, 0.22, 0.003)]);
};

// mbira tine: cantilever modes 1 : 6.27 : 17.5, buzzers (shells/caps) driven by the tone,
// and the deze (gourd) resonance
export const mbira = (r, f) => {
  const tone = modes(0.72, [{ f, a: 1, d: 0.62 }, { f: f * 6.27, a: 0.22, d: 0.07 }, { f: f * 17.5, a: 0.05, d: 0.02 }], { attack: 0.002 });
  const n = tone.length;
  const buzz = white(n, r);
  for (let i = 0; i < n; i++) buzz[i] *= Math.max(0, tone[i]) ** 1.5 * 1.8;
  filter(buzz, 'bp', 2600, 1.4);
  const deze = filter(Float32Array.from(tone), 'bp', 320, 1.5);
  return sum([{ sig: tone }, { sig: buzz, gain: 0.3 }, { sig: deze, gain: 0.4 }, stick(r, 1500, 0.08, 0.004)]);
};

// UI: soft mallet tone for feedback chimes
export const softMallet = (f, seconds = 0.5) => modes(seconds, [{ f, a: 1, d: 0.28 }, { f: f * 3.93, a: 0.12, d: 0.04 }], { attack: 0.003 });
export const bellTone = (f, seconds = 0.9) => fm(seconds, { fc: f, ratio: 3.5, index: 1.4, tauIdx: 0.08, tau: 0.35, attack: 0.002 });

export { noteFreq, TAU };
