// Membrane drums and hand percussion.
// Technique: pitched sine modes with a pitch-drop envelope (circular-membrane
// mode ratios) plus a band-passed noise "slap" for the hand or stick contact.
import { SR, len, modes, white, Biquad, filter, sum } from '../dsp.mjs';

const TAU = Math.PI * 2;
const MEMBRANE = [1, 1.594, 2.136, 2.296, 2.653, 2.918, 3.156];

// decaying band-passed noise burst
export function burst(rand, { seconds = 0.08, f = 2000, q = 0.8, decay = 0.02, attack = 0.0008, hp = 0 }) {
  const n = len(seconds);
  const out = white(n, rand);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] *= (t < attack ? t / attack : 1) * Math.exp(-t / decay);
  }
  filter(out, 'bp', f, q);
  if (hp) filter(out, 'hp', hp, 0.7);
  return out;
}

// struck membrane: f (settled pitch), f0 (strike pitch), pd (pitch-drop time), d (decay)
export function membrane(rand, o) {
  const seconds = o.len ?? 0.6;
  const ratios = o.ratios ?? MEMBRANE.slice(0, 4);
  const amps = o.amps ?? [1, 0.45, 0.28, 0.16, 0.1, 0.07, 0.05];
  const list = ratios.map((r, k) => ({
    f: o.f * r,
    f0: (o.f0 ?? o.f) * r,
    pd: o.pd ?? 0.04,
    a: amps[k] ?? 0.05,
    d: o.d * (o.decays?.[k] ?? 1 / (1 + k * 0.9)),
    ph: k * 0.7,
  }));
  const parts = [{ sig: modes(seconds, list, { attack: o.attack ?? 0.001 }), gain: o.tone ?? 1 }];
  if (o.slap) parts.push({ sig: burst(rand, { seconds: Math.min(seconds, o.slapD * 8 + 0.01), f: o.slapF ?? 2000, q: o.slapQ ?? 0.8, decay: o.slapD ?? 0.02 }), gain: o.slap });
  if (o.click) parts.push({ sig: burst(rand, { seconds: 0.01, f: 4500, q: 0.5, decay: 0.0015 }), gain: o.click });
  return sum(parts);
}

// membrane whose pitch follows fFn(t) (talking drum, ge glide, cuíca-like bends)
export function glideMembrane(rand, { seconds, fFn, ratios = [1, 1.594, 2.136], amps = [1, 0.35, 0.15], d = 0.3, attack = 0.002, slap = 0, slapF = 1500, slapD = 0.01 }) {
  const n = len(seconds);
  const out = new Float32Array(n);
  ratios.forEach((r, k) => {
    let ph = k;
    const dk = d / (1 + k * 0.8);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += (TAU * fFn(t) * r) / SR;
      out[i] += Math.sin(ph) * amps[k] * Math.exp(-t / dk) * (t < attack ? t / attack : 1);
    }
  });
  if (!slap) return out;
  return sum([{ sig: out }, { sig: burst(rand, { seconds: 0.08, f: slapF, decay: slapD }), gain: slap }]);
}

// particle shaker (seeds/beads hitting a shell): impacts at a rate following
// the shake envelope, each ringing through the shell resonance
export function shaker(rand, { seconds = 0.25, f = 5000, q = 1.4, rate = 1800, attack = 0.012, decay = 0.06, hp = 2500, body = 0, bodyF = 300, flamMs = 0 }) {
  const n = len(seconds);
  const out = new Float32Array(n);
  const env = (t) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));
  const shake = (offset, gain) => {
    for (let i = 0; i < n - offset; i++) {
      const t = i / SR;
      if (rand() < (rate * env(t)) / SR) out[i + offset] += (rand() * 2 - 1) * gain * (0.4 + env(t));
    }
  };
  shake(0, 1);
  if (flamMs) shake(len(flamMs / 1000), 0.6);
  const b = new Biquad('bp', f, q);
  const h = new Biquad('hp', hp, 0.7);
  const lo = new Biquad('bp', bodyF, 3);
  for (let i = 0; i < n; i++) {
    const x = out[i];
    out[i] = h.tick(b.tick(x)) + (body ? lo.tick(x) * body : 0);
  }
  return out;
}

// metal jingles (riq zils, pandeiro platinelas, ghungroo): impacts into
// high-Q inharmonic resonators
export function jingles(rand, { seconds = 0.3, freqs = [3400, 4700, 5900, 7300, 8600], q = 28, rate = 900, attack = 0.004, decay = 0.05, ring = 1 }) {
  const n = len(seconds);
  const imp = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const e = t < attack ? t / attack : Math.exp(-(t - attack) / decay);
    if (rand() < (rate * e) / SR) imp[i] = (rand() * 2 - 1) * e;
  }
  const out = new Float32Array(n);
  for (const f of freqs) {
    const b = new Biquad('bp', f * (0.98 + rand() * 0.04), q);
    for (let i = 0; i < n; i++) out[i] += b.tick(imp[i]) * ring;
  }
  const h = new Biquad('hp', 2500, 0.7);
  for (let i = 0; i < n; i++) out[i] = h.tick(out[i] + imp[i] * 0.15);
  return out;
}

// hand clap: a few micro-transients then a short diffuse tail
export function clap(rand, { f = 1300, q = 0.9, spread = 0.011, taps = 3, tail = 0.07, bright = 0 } = {}) {
  const parts = [];
  for (let k = 0; k < taps; k++) {
    parts.push({ sig: burst(rand, { seconds: 0.03, f: f * (0.9 + rand() * 0.2), q, decay: 0.004 }), at: k * spread * (0.8 + rand() * 0.4), gain: 0.8 });
  }
  parts.push({ sig: burst(rand, { seconds: tail * 5, f, q: q * 0.7, decay: tail }), at: (taps - 1) * spread, gain: 0.9 });
  if (bright) parts.push({ sig: burst(rand, { seconds: 0.05, f: 3500, q: 0.7, decay: 0.008 }), at: 0, gain: bright });
  return sum(parts);
}

// several people clapping, slightly apart
export function groupClap(rand, people = 5) {
  const parts = [];
  for (let p = 0; p < people; p++) parts.push({ sig: clap(rand, { f: 1000 + rand() * 900, taps: 2 }), at: rand() * 0.022, gain: 0.5 });
  return sum(parts);
}

// ---------------- specific drums ----------------

export const djembeBass = (r) => membrane(r, { f: 72, f0: 96, pd: 0.025, d: 0.24, ratios: [1, 1.5, 2.0], amps: [1, 0.22, 0.08], slap: 0.18, slapF: 380, slapD: 0.018, len: 0.5 });
export const djembeTone = (r) => membrane(r, { f: 330, f0: 352, pd: 0.012, d: 0.13, ratios: MEMBRANE.slice(0, 6), amps: [1, 0.62, 0.48, 0.34, 0.26, 0.18], slap: 0.32, slapF: 1700, slapQ: 0.9, slapD: 0.011, len: 0.38 });
export const djembeSlap = (r) => membrane(r, { f: 410, f0: 440, pd: 0.008, d: 0.05, ratios: [1, 1.594, 2.136, 2.918, 3.5], amps: [0.6, 0.5, 0.45, 0.35, 0.25], slap: 1.1, slapF: 3100, slapQ: 0.7, slapD: 0.022, click: 0.4, len: 0.26 });
export const dundunba = (r) => membrane(r, { f: 60, f0: 80, pd: 0.03, d: 0.34, ratios: [1, 1.594, 2.136], amps: [1, 0.3, 0.12], slap: 0.45, slapF: 900, slapD: 0.009, click: 0.25, len: 0.55 });
export const logDrum = (r) => sum([
  { sig: modes(0.45, [{ f: 300, a: 1, d: 0.14 }, { f: 300 * 2.38, a: 0.45, d: 0.06 }, { f: 300 * 4.1, a: 0.18, d: 0.03 }]) },
  { sig: burst(r, { seconds: 0.03, f: 2200, q: 0.8, decay: 0.004 }), gain: 0.35 },
]);
export const talkingDrum = (r) => glideMembrane(r, {
  seconds: 0.55,
  // struck low, squeezed up, then released: the "speech" contour
  fFn: (t) => 165 + 95 * Math.sin(Math.min(1, t / 0.3) * Math.PI * 0.85) * Math.exp(-t / 0.6),
  ratios: [1, 1.5, 2.0, 2.6], amps: [1, 0.35, 0.18, 0.08], d: 0.32, slap: 0.35, slapF: 2300, slapD: 0.006,
});

export const congaOpen = (r) => membrane(r, { f: 218, f0: 236, pd: 0.02, d: 0.3, ratios: MEMBRANE.slice(0, 5), amps: [1, 0.38, 0.22, 0.12, 0.07], slap: 0.22, slapF: 1400, slapD: 0.009, len: 0.5 });
export const congaSlap = (r) => membrane(r, { f: 290, f0: 310, pd: 0.01, d: 0.06, ratios: MEMBRANE.slice(0, 5), amps: [0.5, 0.45, 0.4, 0.3, 0.2], slap: 1.0, slapF: 2600, slapQ: 0.8, slapD: 0.028, click: 0.3, len: 0.25 });
export const congaMute = (r) => membrane(r, { f: 200, f0: 210, pd: 0.01, d: 0.035, ratios: [1, 1.594], amps: [1, 0.3], slap: 0.3, slapF: 700, slapD: 0.008, len: 0.12 });
export const tumba = (r) => membrane(r, { f: 160, f0: 172, pd: 0.02, d: 0.38, ratios: MEMBRANE.slice(0, 4), amps: [1, 0.35, 0.2, 0.1], slap: 0.2, slapF: 1100, slapD: 0.009, len: 0.6 });
export const bongoHigh = (r) => membrane(r, { f: 470, f0: 505, pd: 0.008, d: 0.09, ratios: MEMBRANE.slice(0, 5), amps: [1, 0.5, 0.35, 0.22, 0.12], slap: 0.5, slapF: 3200, slapD: 0.006, len: 0.26 });
export const bongoLow = (r) => membrane(r, { f: 330, f0: 352, pd: 0.01, d: 0.12, ratios: MEMBRANE.slice(0, 5), amps: [1, 0.48, 0.3, 0.18, 0.1], slap: 0.4, slapF: 2600, slapD: 0.006, len: 0.3 });
export const timbal = (r) => sum([
  { sig: membrane(r, { f: 390, f0: 410, pd: 0.01, d: 0.18, ratios: MEMBRANE.slice(0, 4), slap: 0.6, slapF: 3300, slapD: 0.008, len: 0.45 }) },
  { sig: modes(0.45, [{ f: 1480, a: 0.25, d: 0.25 }, { f: 2520, a: 0.15, d: 0.18 }, { f: 3830, a: 0.08, d: 0.1 }]), gain: 1 },
]);
export const cascara = (r) => sum([
  { sig: modes(0.14, [{ f: 1750, a: 1, d: 0.03 }, { f: 3050, a: 0.6, d: 0.02 }, { f: 4400, a: 0.3, d: 0.012 }]) },
  { sig: burst(r, { seconds: 0.03, f: 3200, q: 0.8, decay: 0.004 }), gain: 0.5 },
]);

// samba
export const surdoPrimeira = (r) => membrane(r, { f: 56, f0: 70, pd: 0.05, d: 0.5, ratios: [1, 1.594, 2.136], amps: [1, 0.3, 0.14], slap: 0.28, slapF: 320, slapD: 0.016, len: 0.9 });
export const surdoSegunda = (r) => membrane(r, { f: 70, f0: 84, pd: 0.045, d: 0.42, ratios: [1, 1.594, 2.136], amps: [1, 0.3, 0.14], slap: 0.28, slapF: 360, slapD: 0.016, len: 0.8 });
export const surdoMuted = (r) => membrane(r, { f: 60, f0: 72, pd: 0.03, d: 0.06, ratios: [1, 1.594], amps: [1, 0.3], slap: 0.35, slapF: 420, slapD: 0.012, len: 0.2 });
export const caixa = (r) => sum([
  { sig: membrane(r, { f: 330, f0: 350, d: 0.035, ratios: [1, 1.594], amps: [1, 0.4], len: 0.18 }), gain: 0.6 },
  { sig: burst(r, { seconds: 0.18, f: 4400, q: 0.7, decay: 0.05, hp: 1800 }), gain: 1.2 },
]);
export const tamborim = (r) => sum([
  { sig: membrane(r, { f: 720, f0: 760, pd: 0.005, d: 0.04, ratios: [1, 1.594, 2.136], amps: [1, 0.4, 0.2], len: 0.15 }) },
  { sig: burst(r, { seconds: 0.05, f: 3600, q: 0.8, decay: 0.006 }), gain: 0.9 },
]);
export const pandeiroBass = (r) => sum([
  { sig: membrane(r, { f: 135, f0: 150, pd: 0.02, d: 0.11, ratios: [1, 1.594], amps: [1, 0.3], len: 0.3 }) },
  { sig: jingles(r, { seconds: 0.25, rate: 500, decay: 0.04 }), gain: 0.35 },
]);
export const pandeiroJingle = (r) => jingles(r, { seconds: 0.2, rate: 1100, decay: 0.035 });
export const pandeiroSlap = (r) => sum([
  { sig: membrane(r, { f: 420, f0: 440, d: 0.03, slap: 0.9, slapF: 2800, slapD: 0.01, len: 0.2 }) },
  { sig: jingles(r, { seconds: 0.2, rate: 900, decay: 0.04 }), gain: 0.5 },
]);

// drum kit (jazz, afrobeat, reggae)
export const kick = (r) => membrane(r, { f: 58, f0: 112, pd: 0.022, d: 0.22, ratios: [1, 1.594], amps: [1, 0.12], slap: 0.25, slapF: 2500, slapD: 0.004, len: 0.45 });
export const snare = (r) => sum([
  { sig: membrane(r, { f: 190, f0: 205, d: 0.06, ratios: [1, 1.594, 2.136], amps: [1, 0.4, 0.2], len: 0.3 }), gain: 0.7 },
  { sig: burst(r, { seconds: 0.3, f: 3600, q: 0.6, decay: 0.09, hp: 1500 }), gain: 1.1 },
]);
export const rim = (r) => sum([
  { sig: modes(0.13, [{ f: 430, a: 0.8, d: 0.035 }, { f: 1680, a: 0.7, d: 0.02 }, { f: 2900, a: 0.3, d: 0.012 }]) },
  { sig: burst(r, { seconds: 0.03, f: 3000, q: 0.7, decay: 0.003 }), gain: 0.6 },
]);
export const brush = (r) => {
  const n = len(0.26);
  const s = white(n, r);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    s[i] *= (t < 0.012 ? t / 0.012 : Math.exp(-(t - 0.012) / 0.07));
  }
  filter(s, 'bp', 3200, 0.5);
  return s;
};

// taiko (Kodo-style ensemble roles)
export const odaiko = (r) => sum([
  { sig: membrane(r, { f: 47, f0: 64, pd: 0.06, d: 0.75, ratios: [1, 1.594, 2.136, 2.653], amps: [1, 0.34, 0.18, 0.08], slap: 0.25, slapF: 240, slapD: 0.02, len: 1.2 }) },
  { sig: burst(r, { seconds: 0.4, f: 120, q: 0.6, decay: 0.12 }), gain: 0.5 },
]);
export const odaikoRim = (r) => sum([
  { sig: modes(0.16, [{ f: 940, a: 1, d: 0.035 }, { f: 2280, a: 0.55, d: 0.02 }, { f: 3600, a: 0.2, d: 0.01 }]) },
  { sig: burst(r, { seconds: 0.03, f: 2600, q: 0.8, decay: 0.004 }), gain: 0.5 },
]);
export const nagado = (r) => membrane(r, { f: 104, f0: 128, pd: 0.04, d: 0.42, ratios: [1, 1.594, 2.136, 2.296], amps: [1, 0.4, 0.24, 0.12], slap: 0.3, slapF: 600, slapD: 0.012, len: 0.75 });
export const shime = (r) => membrane(r, { f: 380, f0: 420, pd: 0.01, d: 0.065, ratios: MEMBRANE.slice(0, 5), amps: [1, 0.6, 0.5, 0.4, 0.3], slap: 0.6, slapF: 2500, slapD: 0.009, len: 0.2 });

// South Asia: tabla. The dayan's syahi gives harmonic overtones; Sa = C4 here.
const SA = 261.63;
function dayan(r, { amps, decay, click = 0.3, len: seconds = 0.6 }) {
  const list = amps.map((a, k) => ({ f: SA * (k + 1) * (1 + k * 0.0015), a, d: decay / (1 + k * 0.6), ph: k }));
  return sum([
    { sig: modes(seconds, list) },
    { sig: burst(r, { seconds: 0.03, f: 2600, q: 0.8, decay: 0.004 }), gain: click },
  ]);
}
const bayanGe = (r, glide = false) => glideMembrane(r, {
  seconds: glide ? 0.75 : 0.6,
  fFn: glide ? (t) => 88 + 46 * (1 - Math.exp(-t / 0.18)) : (t) => 96 + 10 * Math.exp(-t / 0.03),
  ratios: [1, 2, 3], amps: [1, 0.35, 0.12], d: glide ? 0.5 : 0.36, slap: 0.15, slapF: 600, slapD: 0.01,
});
export const tablaNa = (r) => dayan(r, { amps: [0.5, 1, 0.55, 0.35, 0.18], decay: 0.42, click: 0.45, len: 0.55 });
export const tablaTin = (r) => dayan(r, { amps: [0.9, 0.7, 0.25, 0.1], decay: 0.24, click: 0.25, len: 0.4 });
export const tablaTun = (r) => dayan(r, { amps: [1, 0.35, 0.15], decay: 0.6, click: 0.15, len: 0.7 });
export const tablaTe = (r) => sum([
  { sig: modes(0.14, [{ f: SA, a: 0.6, d: 0.02 }, { f: SA * 2, a: 0.3, d: 0.012 }]) },
  { sig: burst(r, { seconds: 0.06, f: 1600, q: 0.9, decay: 0.008 }), gain: 0.8 },
]);
export const tablaGe = (r) => bayanGe(r);
export const tablaGeGlide = (r) => bayanGe(r, true);
export const tablaKe = (r) => membrane(r, { f: 118, f0: 125, d: 0.025, ratios: [1, 1.594], amps: [1, 0.3], slap: 0.6, slapF: 520, slapD: 0.012, len: 0.12 });
export const tablaDha = (r) => sum([{ sig: tablaNa(r), gain: 0.85 }, { sig: bayanGe(r), gain: 0.9 }]);
export const tablaDhin = (r) => sum([{ sig: tablaTin(r), gain: 0.9 }, { sig: bayanGe(r), gain: 0.9 }]);
export const dholak = (r) => membrane(r, { f: 112, f0: 140, pd: 0.03, d: 0.22, ratios: [1, 1.594, 2.136], amps: [1, 0.35, 0.15], slap: 0.3, slapF: 700, slapD: 0.012, len: 0.45 });
export const dholakHigh = (r) => membrane(r, { f: 520, f0: 540, d: 0.05, ratios: MEMBRANE.slice(0, 4), slap: 0.8, slapF: 3000, slapD: 0.01, len: 0.2 });

// Southeast Asia: kendang (two-headed hand drum that leads the gamelan)
export const kendangDhung = (r) => membrane(r, { f: 118, f0: 136, pd: 0.03, d: 0.3, ratios: [1, 1.594, 2.136], amps: [1, 0.35, 0.15], slap: 0.2, slapF: 700, slapD: 0.01, len: 0.5 });
export const kendangTak = (r) => membrane(r, { f: 300, f0: 320, d: 0.03, ratios: [1, 1.594, 2.136], slap: 0.9, slapF: 2300, slapD: 0.012, len: 0.16 });
export const kendangTung = (r) => membrane(r, { f: 236, f0: 250, pd: 0.015, d: 0.2, ratios: [1, 1.594, 2.136], amps: [1, 0.3, 0.12], slap: 0.2, slapF: 1400, slapD: 0.008, len: 0.4 });

// North Africa & Middle East
export const darbukaDum = (r) => membrane(r, { f: 104, f0: 124, pd: 0.03, d: 0.3, ratios: [1, 1.594, 2.136, 2.296], amps: [1, 0.32, 0.2, 0.1], slap: 0.22, slapF: 520, slapD: 0.012, len: 0.5 });
export const darbukaTek = (r) => sum([
  { sig: modes(0.26, [{ f: 820, a: 0.6, d: 0.05 }, { f: 1310, a: 0.5, d: 0.04 }, { f: 2480, a: 0.45, d: 0.03 }, { f: 3700, a: 0.2, d: 0.02 }]) },
  { sig: burst(r, { seconds: 0.05, f: 3600, q: 1, decay: 0.009 }), gain: 0.9 },
]);
export const darbukaKa = (r) => sum([
  { sig: modes(0.2, [{ f: 760, a: 0.5, d: 0.035 }, { f: 1250, a: 0.4, d: 0.03 }, { f: 2300, a: 0.2, d: 0.02 }]) },
  { sig: burst(r, { seconds: 0.04, f: 2600, q: 1, decay: 0.006 }), gain: 0.6 },
]);
// bendir: frame drum with a gut snare stretched under the skin (the buzz)
export const bendir = (r) => {
  const tone = membrane(r, { f: 86, f0: 100, pd: 0.03, d: 0.26, ratios: [1, 1.594, 2.136], amps: [1, 0.35, 0.15], slap: 0.2, slapF: 500, slapD: 0.012, len: 0.5 });
  const n = tone.length;
  const bz = white(n, r);
  let env = 0;
  for (let i = 0; i < n; i++) {
    env = Math.max(Math.abs(tone[i]), env * 0.9992);
    bz[i] *= env * (0.6 + 0.4 * Math.sin((i / SR) * TAU * 86));
  }
  filter(bz, 'bp', 1900, 1.1);
  return sum([{ sig: tone }, { sig: bz, gain: 0.55 }]);
};
export const riq = (r) => jingles(r, { seconds: 0.36, freqs: [3900, 5200, 6400, 7700, 9100], rate: 1300, decay: 0.07 });
export const riqDum = (r) => sum([
  { sig: membrane(r, { f: 180, f0: 196, d: 0.08, ratios: [1, 1.594], amps: [1, 0.3], len: 0.3 }) },
  { sig: jingles(r, { seconds: 0.3, rate: 700, decay: 0.05 }), gain: 0.5 },
]);
export const tar = (r) => sum([
  { sig: membrane(r, { f: 112, f0: 124, d: 0.18, ratios: [1, 1.594, 2.136], amps: [1, 0.35, 0.15], slap: 0.25, slapF: 900, slapD: 0.01, len: 0.4 }) },
  { sig: jingles(r, { seconds: 0.35, freqs: [3100, 4300, 5600, 6800], rate: 600, decay: 0.06 }), gain: 0.45 },
]);
export const daf = (r) => sum([
  { sig: membrane(r, { f: 88, f0: 98, d: 0.3, ratios: [1, 1.594, 2.136], amps: [1, 0.3, 0.12], slap: 0.2, slapF: 700, slapD: 0.012, len: 0.5 }) },
  { sig: jingles(r, { seconds: 0.45, freqs: [1800, 2600, 3500, 4300], q: 20, rate: 400, decay: 0.12 }), gain: 0.4 },
]);
export const tbel = (r) => membrane(r, { f: 70, f0: 86, pd: 0.03, d: 0.36, ratios: [1, 1.594, 2.136], amps: [1, 0.32, 0.14], slap: 0.45, slapF: 800, slapD: 0.01, len: 0.55 });

// Irish bodhrán (frame drum played with a tipper)
export const bodhranLow = (r) => membrane(r, { f: 82, f0: 96, pd: 0.03, d: 0.22, ratios: [1, 1.594, 2.136], amps: [1, 0.35, 0.15], slap: 0.3, slapF: 650, slapD: 0.01, len: 0.4 });
export const bodhranHigh = (r) => membrane(r, { f: 190, f0: 200, d: 0.08, ratios: [1, 1.594, 2.136], amps: [1, 0.4, 0.2], slap: 0.5, slapF: 1500, slapD: 0.008, len: 0.22 });

// flamenco cajón: wooden box with snare wires behind the playing face
export const cajonBass = (r) => sum([
  { sig: membrane(r, { f: 78, f0: 92, pd: 0.02, d: 0.16, ratios: [1, 1.7], amps: [1, 0.25], len: 0.35 }) },
  { sig: burst(r, { seconds: 0.12, f: 2600, q: 0.6, decay: 0.025 }), gain: 0.25 },
]);
export const cajonSlap = (r) => sum([
  { sig: modes(0.25, [{ f: 340, a: 0.6, d: 0.04 }, { f: 820, a: 0.4, d: 0.03 }]) },
  { sig: burst(r, { seconds: 0.2, f: 3400, q: 0.6, decay: 0.045, hp: 1500 }), gain: 1.2 },
]);
export const golpe = (r) => sum([
  { sig: membrane(r, { f: 115, f0: 130, d: 0.05, ratios: [1, 1.9], amps: [1, 0.3], len: 0.2 }) },
  { sig: burst(r, { seconds: 0.05, f: 1300, q: 0.9, decay: 0.006 }), gain: 0.6 },
]);

export const handClap = (r) => clap(r, { f: 1250, taps: 3, tail: 0.06 });
export const palmasFuerte = (r) => clap(r, { f: 2200, q: 1.0, taps: 2, spread: 0.006, tail: 0.045, bright: 0.6 });
export const palmasSorda = (r) => clap(r, { f: 700, q: 1.2, taps: 2, spread: 0.008, tail: 0.04 });
