// SoundMap synthesizer. Renders every instrument to mono 22.05 kHz 16-bit WAV.
//   npm run synth                 render all samples, peaks.json and src/audio/samples.ts
//   npm run synth -- --preview    also mix every pattern to dist/previews/*.wav and validate
//   npm run synth -- --only kora  render only ids containing "kora" (no index files)
//   npm run synth -- --stats      list every sample with its size
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, len, hashSeed, rng, finish, peak, dbToGain, scale } from './dsp.mjs';
import { encodeWav } from './wav.mjs';
import { CATALOG, FAMILY, NO_TRIM } from './catalog.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'assets', 'sounds');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const BUDGET = 6 * 1024 * 1024;

// Long drones (not rhythmic) go to AAC/m4a when ffmpeg is available; everything else stays WAV
const FFMPEG = (() => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    return null;
  }
})();
const TMP = mkdtempSync(join(tmpdir(), 'soundmap-synth-'));

function encodeM4a(sig, file) {
  const src = join(TMP, 'in.wav');
  writeFileSync(src, encodeWav(sig));
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-c:a', 'aac', '-b:a', '80k', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-movflags', '+faststart', file]);
}

// decodes an m4a and finds its lag against the source (ms) by normalized
// correlation over the whole file; edit lists should make this 0
function startOffsetMs(sig, file) {
  const raw = execFileSync(FFMPEG, ['-loglevel', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 64 << 20 });
  const dec = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  let best = -Infinity;
  let bestLag = 0;
  for (let lag = -2500; lag <= 2500; lag += 1) {
    let acc = 0;
    let ea = 0;
    let eb = 0;
    for (let i = 0; i < sig.length; i += 2) {
      const j = i + lag;
      if (j < 0 || j >= dec.length) continue;
      acc += sig[i] * dec[j];
      ea += sig[i] * sig[i];
      eb += dec[j] * dec[j];
    }
    const c = acc / Math.sqrt(ea * eb || 1);
    if (c > best) { best = c; bestLag = lag; }
  }
  return { lagMs: (bestLag / SR) * 1000, decodedSec: dec.length / SR, corr: best };
}

function windowRms(sig, seconds = 0.03) {
  const W = len(seconds);
  let acc = 0;
  let best = 0;
  for (let i = 0; i < sig.length; i++) {
    acc += sig[i] * sig[i];
    if (i >= W) acc -= sig[i - W] * sig[i - W];
    if (i >= Math.min(W, sig.length) - 1) best = Math.max(best, Math.sqrt(Math.max(acc, 0) / Math.min(W, i + 1)));
  }
  return best;
}

function level(sig, family) {
  const { rms, peak: ceiling } = FAMILY[family];
  const r = windowRms(sig);
  let g = r > 0 ? dbToGain(rms) / r : 1;
  const p = peak(sig) * g;
  if (p > dbToGain(ceiling)) g *= dbToGain(ceiling) / p;
  return scale(sig, g);
}

function peaksOf(sig, bins = 48) {
  const p = peak(sig) || 1;
  const out = [];
  const size = sig.length / bins;
  for (let b = 0; b < bins; b++) {
    let m = 0;
    for (let i = Math.floor(b * size); i < Math.floor((b + 1) * size); i++) m = Math.max(m, Math.abs(sig[i]));
    out.push(Math.round((m / p) * 100) / 100);
  }
  return out;
}

export function renderAll(filter) {
  const rendered = new Map();
  for (const e of CATALOG) {
    if (filter && !e.id.includes(filter)) continue;
    const rand = rng(hashSeed(e.id));
    let sig = e.render(rand);
    if (sig.some((v) => !Number.isFinite(v))) throw new Error(`${e.id}: non-finite samples`);
    sig = NO_TRIM.has(e.id) ? sig : finish(sig, { maxSec: e.max, fadeMs: e.family === 'drone' ? 120 : 30 });
    level(sig, e.family);
    rendered.set(e.id, { sig, family: e.family });
  }
  return rendered;
}

function main() {
  const t0 = Date.now();
  if (!only && existsSync(OUT)) {
    for (const d of readdirSync(OUT)) {
      const p = join(OUT, d);
      if (statSync(p).isDirectory()) rmSync(p, { recursive: true });
    }
  }
  const rendered = renderAll(only);
  let bytes = 0;
  const rows = [];
  const ext = {};
  for (const [id, { sig, family }] of rendered) {
    ext[id] = family === 'drone' && FFMPEG ? 'm4a' : 'wav';
    const file = join(OUT, `${id}.${ext[id]}`);
    mkdirSync(dirname(file), { recursive: true });
    let size;
    if (ext[id] === 'm4a') {
      encodeM4a(sig, file);
      size = statSync(file).size;
      const { lagMs, decodedSec, corr } = startOffsetMs(sig, file);
      console.log(`m4a ${id}: start offset ${lagMs.toFixed(1)} ms (corr ${corr.toFixed(3)}), ${decodedSec.toFixed(2)} s decoded vs ${(sig.length / SR).toFixed(2)} s source`);
    } else {
      const wav = encodeWav(sig);
      writeFileSync(file, wav);
      size = wav.length;
    }
    bytes += size;
    rows.push([id, size, sig.length / SR]);
  }
  if (args.includes('--stats')) {
    for (const [id, b, s] of rows.sort((a, b) => b[1] - a[1])) console.log(`${(b / 1024).toFixed(1).padStart(7)} KB  ${s.toFixed(2)} s  ${id}`);
  }
  console.log(`${rendered.size} samples, ${(bytes / 1024 / 1024).toFixed(2)} MB, ${(rows.reduce((a, r) => a + r[2], 0)).toFixed(1)} s of audio, ${((Date.now() - t0) / 1000).toFixed(1)} s to render`);
  if (only) return rendered;
  if (bytes > BUDGET) console.warn(`WARNING: over the 6 MB audio budget by ${((bytes - BUDGET) / 1024).toFixed(0)} KB`);

  const peaks = {};
  const durations = {};
  for (const [id, { sig }] of rendered) {
    peaks[id] = peaksOf(sig);
    durations[id] = Math.round((sig.length / SR) * 1000);
  }
  writeFileSync(join(OUT, 'peaks.json'), JSON.stringify(peaks));

  const ids = [...rendered.keys()].sort();
  const ts = `// GENERATED by scripts/synth/index.mjs (npm run synth). Do not edit.
// Every sound is synthesized by our own code; nothing here is a recording.

export type SampleKey =
${ids.map((id) => `  | '${id}'`).join('\n')};

export const SAMPLES: Record<SampleKey, number> = {
${ids.map((id) => `  '${id}': require('../../assets/sounds/${id}.${ext[id]}'),`).join('\n')}
};

export const DURATION_MS: Record<SampleKey, number> = {
${ids.map((id) => `  '${id}': ${durations[id]},`).join('\n')}
};

export const SAMPLE_IDS = Object.keys(SAMPLES) as SampleKey[];
`;
  writeFileSync(join(ROOT, 'src', 'audio', 'samples.ts'), ts);
  return rendered;
}

const rendered = main();
rmSync(TMP, { recursive: true, force: true });
if (args.includes('--preview')) {
  const { preview } = await import('./preview.mjs');
  await preview(rendered, ROOT);
}
