// Small notation helpers so patterns read like drum charts.
//
// Grid strings: one character per step.
//   X accent (1.0) · x normal (0.8) · o soft (0.55) · g ghost (0.3) · . or - rest
//   Spaces and | are ignored, so 'X..x ..x. ..X. x...' is one 16-step bar.
// Note rows: space-separated tokens, one per step. '.' rest, 'c4' normal,
//   'c4!' accent, 'c4_' soft. Each token gets the prefix, e.g. 'instruments/kora_'.
import type { Pattern, SampleId, Track } from './types';

const VEL: Record<string, number> = { X: 1, x: 0.8, o: 0.55, g: 0.3 };

export function grid(s: string): { hits: number[]; vel: number[] } {
  const hits: number[] = [];
  const vel: number[] = [];
  let step = 0;
  for (const ch of s) {
    if (ch === ' ' || ch === '|') continue;
    if (ch in VEL) {
      hits.push(step);
      vel.push(VEL[ch]);
    }
    step += 1;
  }
  return { hits, vel };
}

export function gridLength(s: string): number {
  let n = 0;
  for (const ch of s) if (ch !== ' ' && ch !== '|') n += 1;
  return n;
}

export function tr(sample: SampleId, s: string, layer?: string, gain = 1): Track {
  const { hits, vel } = grid(s);
  return { sample, hits, vel: gain === 1 ? vel : vel.map((v) => Math.min(1, v * gain)), ...(layer ? { layer } : {}) };
}

export type Melody = NonNullable<Pattern['melody']>;

export function notes(prefix: string, s: string, layer?: string, gain = 1): Melody {
  const out: Melody = [];
  s.trim().split(/\s+/).filter((t) => t !== '|').forEach((tok, step) => {
    if (tok === '.' || tok === '-') return;
    let v = 0.8;
    let name = tok;
    if (tok.endsWith('!')) { v = 1; name = tok.slice(0, -1); }
    else if (tok.endsWith('_')) { v = 0.5; name = tok.slice(0, -1); }
    out.push({ step, note: prefix + name, vel: Math.min(1, v * gain), ...(layer ? { layer } : {}) });
  });
  return out;
}

export function pattern(
  id: string,
  bpm: number,
  steps: 12 | 16,
  tracks: Track[],
  opts: { bars?: number; swing?: number; melody?: Melody } = {},
): Pattern {
  return { id, bpm, steps, tracks, ...(opts.bars && opts.bars > 1 ? { bars: opts.bars } : {}), ...(opts.swing ? { swing: opts.swing } : {}), ...(opts.melody?.length ? { melody: opts.melody } : {}) };
}

// copy of a pattern keeping only some layers (or dropping the layer tags)
export function onlyLayers(p: Pattern, id: string, layers: string[]): Pattern {
  return {
    ...p,
    id,
    tracks: p.tracks.filter((t) => t.layer && layers.includes(t.layer)),
    melody: p.melody?.filter((m) => m.layer && layers.includes(m.layer)),
  };
}

export function untagged(p: Pattern, id: string): Pattern {
  return {
    ...p,
    id,
    tracks: p.tracks.map(({ layer: _l, ...t }) => t),
    melody: p.melody?.map(({ layer: _l, ...m }) => m),
  };
}

export function withId(p: Pattern, id: string, extra: Partial<Pattern> = {}): Pattern {
  return { ...p, ...extra, id };
}

// every SampleId a pattern can trigger
export function samplesOf(p: Pattern): SampleId[] {
  const set = new Set<SampleId>();
  for (const t of p.tracks) set.add(t.sample);
  for (const m of p.melody ?? []) set.add(m.note);
  return [...set];
}
