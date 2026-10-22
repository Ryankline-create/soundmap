// --preview: loads the app's pattern files, validates them against the rendered
// samples and the lessons, and mixes every pattern offline (2 passes) into
// dist/previews/<id>.wav so a person can audition them (afplay on a Mac).
// The pattern files are TypeScript, so this transpiles them with the project's
// own `typescript` dev dependency into a temp folder first.
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SR, len, peak } from './dsp.mjs';
import { encodeWav } from './wav.mjs';

const MODULES = ['notation', 'patterns', 'lessonAudio', 'packs', 'coach'];

async function loadAudioModules(root) {
  const require = createRequire(join(root, 'package.json'));
  const ts = require('typescript');
  const dir = mkdtempSync(join(tmpdir(), 'soundmap-preview-'));
  for (const m of MODULES) {
    const src = readFileSync(join(root, 'src', 'audio', `${m}.ts`), 'utf8');
    let js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    js = js.replace(/from '\.\/(\w+)'/g, "from './$1.mjs'");
    writeFileSync(join(dir, `${m}.mjs`), js);
  }
  const mods = {};
  for (const m of MODULES) mods[m] = await import(pathToFileURL(join(dir, `${m}.mjs`)).href);
  rmSync(dir, { recursive: true, force: true });
  return mods;
}

const isPattern = (v) => v && typeof v === 'object' && Array.isArray(v.tracks) && typeof v.bpm === 'number' && (v.steps === 12 || v.steps === 16);

function collectPatterns(value, out, path) {
  if (isPattern(value)) {
    out.push({ path, p: value });
    return;
  }
  if (Array.isArray(value)) value.forEach((v, i) => collectPatterns(v, out, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) collectPatterns(v, out, `${path}.${k}`);
}

function eventsOf(p) {
  const length = p.steps * (p.bars ?? 1);
  const ev = [];
  for (const t of p.tracks) t.hits.forEach((h, k) => ev.push({ step: h, sample: t.sample, vel: Array.isArray(t.vel) ? t.vel[k] : t.vel ?? 0.8, layer: t.layer }));
  for (const m of p.melody ?? []) ev.push({ step: m.step, sample: m.note, vel: m.vel ?? 0.8, layer: m.layer });
  return { length, ev };
}

function mixPattern(p, rendered, passes = 2) {
  const { length, ev } = eventsOf(p);
  const stepSec = 60 / p.bpm / (p.steps / 4);
  const total = length * passes * stepSec + 3;
  const out = new Float32Array(len(total));
  for (let pass = 0; pass < passes; pass++) {
    for (const e of ev) {
      const s = rendered.get(e.sample);
      if (!s) continue;
      const n = pass * length + e.step;
      const t = n * stepSec + (n % 2 === 1 ? (p.swing ?? 0) * stepSec : 0);
      const o = Math.round(t * SR);
      const g = e.vel * 0.8; // engine MASTER
      for (let i = 0; i < s.sig.length && o + i < out.length; i++) out[o + i] += s.sig[i] * g;
    }
  }
  let end = out.length;
  while (end > 1 && Math.abs(out[end - 1]) < 1e-4) end--;
  return out.slice(0, end);
}

// time until the sample first reaches -20 dB of its peak
function onsetMs(sig) {
  const th = peak(sig) * 0.1;
  for (let i = 0; i < sig.length; i++) if (Math.abs(sig[i]) >= th) return (i / SR) * 1000;
  return Infinity;
}

export async function preview(rendered, root) {
  const mods = await loadAudioModules(root);
  const problems = [];
  const warn = (m) => problems.push(m);

  // every sample starts promptly (no leading silence that would sound late)
  for (const [id, { sig, family }] of rendered) {
    const ms = onsetMs(sig);
    const limit = family === 'sustain' || family === 'drone' ? 60 : 12;
    if (ms > limit) warn(`slow onset ${ms.toFixed(1)} ms: ${id}`);
  }

  const found = [];
  collectPatterns(mods.patterns, found, 'patterns');
  collectPatterns(mods.lessonAudio.LESSON_AUDIO, found, 'lessons');
  for (const pk of mods.packs.PACKS) collectPatterns(pk.demo, found, `packs.${pk.id}.demo`);
  for (const c of mods.coach.COACH) collectPatterns(c.pattern, found, `coach.${c.id}`);

  const unique = new Map();
  for (const f of found) if (!unique.has(f.p.id)) unique.set(f.p.id, f);

  for (const { path, p } of unique.values()) {
    const { length, ev } = eventsOf(p);
    for (const e of ev) {
      if (!rendered.has(e.sample)) warn(`${path} (${p.id}): unknown sample ${e.sample}`);
      if (!(e.step >= 0 && e.step < length && Number.isInteger(e.step))) warn(`${path} (${p.id}): step ${e.step} outside 0..${length - 1}`);
      if (!(e.vel > 0 && e.vel <= 1)) warn(`${path} (${p.id}): velocity ${e.vel}`);
    }
  }

  // lessons: every slug, exact layer names, ear clip counts
  const lessons = JSON.parse(readFileSync(join(root, 'docs', 'content', 'lessons.json'), 'utf8')).lessons;
  const LA = mods.lessonAudio.LESSON_AUDIO;
  for (const l of lessons) {
    const a = LA[l.slug];
    if (!a) { warn(`lesson ${l.slug}: no audio`); continue; }
    const built = l.slides.find((s) => s.kind === 'How It Is Built');
    if (built) {
      if (!a.layers) warn(`lesson ${l.slug}: no layers pattern`);
      else {
        const { ev } = eventsOf(a.layers);
        const used = new Set(ev.map((e) => e.layer));
        for (const name of built.layers) if (!used.has(name)) warn(`lesson ${l.slug}: layer "${name}" has no sound`);
        for (const e of ev) if (!e.layer || !built.layers.includes(e.layer)) warn(`lesson ${l.slug}: layer pattern has untagged/unknown layer "${e.layer}"`);
      }
    } else if (a.layers) warn(`lesson ${l.slug}: has layers but no How It Is Built slide`);
    const ear = l.slides.find((s) => s.kind === 'Ear Challenge');
    if (ear) {
      if (!a.ear) warn(`lesson ${l.slug}: no ear challenge audio`);
      else {
        if (a.ear.clips.length !== ear.choices.length) warn(`lesson ${l.slug}: ${a.ear.clips.length} clips for ${ear.choices.length} choices`);
        if (!(a.ear.answer >= 0 && a.ear.answer < a.ear.clips.length)) warn(`lesson ${l.slug}: ear answer out of range`);
      }
    }
    if (l.slides.some((s) => s.clip) && !a.notice) warn(`lesson ${l.slug}: slide names a recording but no notice audio`);
    if (!a.instrumentLabel) warn(`lesson ${l.slug}: no instrumentLabel`);
  }
  for (const slug of Object.keys(LA)) if (!lessons.some((l) => l.slug === slug)) warn(`audio for unknown lesson ${slug}`);

  // packs and coach
  const packs = mods.packs.PACKS;
  if (packs.map((p) => p.id).join() !== 'westafrica,caribbean,southasia,seasia,mena') warn('pack order');
  for (const pk of packs) {
    if (pk.pads.length !== 15) warn(`pack ${pk.id}: ${pk.pads.length} pads`);
    if (pk.keys.length !== 8) warn(`pack ${pk.id}: ${pk.keys.length} keys`);
    for (const x of [...pk.pads.map((d) => d.sample), ...pk.keys]) if (!rendered.has(x)) warn(`pack ${pk.id}: unknown sample ${x}`);
    const padSamples = new Set(pk.pads.map((d) => d.sample));
    for (const t of pk.demo.tracks) if (!padSamples.has(t.sample)) warn(`pack ${pk.id}: demo uses ${t.sample}, not a pad`);
    if ((pk.demo.bars ?? 1) !== 1 || pk.demo.steps !== 16) warn(`pack ${pk.id}: demo must be one 16-step bar`);
    if (/yidaki/.test(JSON.stringify(pk))) warn(`pack ${pk.id}: yidaki must not be a pad`);
  }
  const coach = mods.coach.COACH;
  if (coach.length !== 10) warn(`coach: ${coach.length} patterns`);
  for (const c of coach) {
    const length = c.pattern.steps * (c.pattern.bars ?? 1);
    if (c.pattern.steps !== 16 || (c.pattern.bars ?? 1) !== 1) warn(`coach ${c.id}: not one 16-step bar`);
    if (c.lanes.length < 1 || c.lanes.length > 3) warn(`coach ${c.id}: ${c.lanes.length} lanes`);
    for (const ln of c.lanes) {
      if (!rendered.has(ln.sample)) warn(`coach ${c.id}: unknown lane sample ${ln.sample}`);
      if (ln.hits.some((h) => h < 0 || h >= length)) warn(`coach ${c.id}: lane hit out of range`);
      if (c.pattern.tracks.some((t) => t.sample === ln.sample)) warn(`coach ${c.id}: backing also plays the lane ${ln.label}`);
    }
    if (!lessons.some((l) => l.slug === c.lesson)) warn(`coach ${c.id}: unknown lesson ${c.lesson}`);
    if (c.bpm !== c.pattern.bpm) warn(`coach ${c.id}: bpm ${c.bpm} vs pattern ${c.pattern.bpm}`);
  }

  // voice rules in every user-facing string of the audio data
  const text = JSON.stringify([LA, packs, coach]);
  const banned = text.match(/\b(exotic|primitive|ancient)\b/gi);
  if (banned) warn(`banned words: ${banned.join(', ')}`);

  // mix and measure
  const outDir = join(root, 'dist', 'previews');
  mkdirSync(outDir, { recursive: true });
  const rows = [];
  for (const { p } of unique.values()) {
    const mix = mixPattern(p, rendered);
    const pk = peak(mix);
    let acc = 0;
    for (const v of mix) acc += v * v;
    const rms = Math.sqrt(acc / mix.length);
    rows.push([p.id, pk, rms, mix.length / SR]);
    if (pk > 1) warn(`${p.id}: mix clips (peak ${pk.toFixed(2)})`);
    const norm = pk > 0.98 ? 0.98 / pk : 1;
    for (let i = 0; i < mix.length; i++) mix[i] *= norm;
    writeFileSync(join(outDir, `${p.id}.wav`), encodeWav(mix));
  }
  rows.sort((a, b) => b[1] - a[1]);
  console.log(`preview: ${unique.size} patterns mixed to dist/previews`);
  console.log('loudest mixes:', rows.slice(0, 6).map((r) => `${r[0]} peak ${r[1].toFixed(2)}`).join(' · '));
  console.log('quietest mixes:', rows.slice(-4).map((r) => `${r[0]} rms ${(20 * Math.log10(r[2])).toFixed(1)} dB`).join(' · '));
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const m of problems) console.log(' - ' + m);
    process.exitCode = 1;
  } else console.log('validation: OK');
}
