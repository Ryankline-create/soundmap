import { LESSONS } from './lessons';

// The family tree: one edge per Connections entry, merged when two lessons
// point at each other.
export type TreeEdge = { a: string; b: string; whys: { from: string; why: string }[] };

export const TREE_EDGES: TreeEdge[] = (() => {
  const map = new Map<string, TreeEdge>();
  for (const l of LESSONS) {
    for (const s of l.slides) {
      for (const cn of s.connections ?? []) {
        const key = [l.slug, cn.slug].sort().join('|');
        const e = map.get(key) ?? { a: l.slug, b: cn.slug, whys: [] };
        e.whys.push({ from: l.slug, why: cn.why });
        map.set(key, e);
      }
    }
  }
  return [...map.values()];
})();

// Start year from each lesson's own era text. null = the lesson gives no
// start date (shown in a "long-standing" column, never given an invented year).
export const ERA_START: Record<string, number | null> = {
  'oud-maqam': 850, // 9th century
  kora: 1250, // 13th century
  raga: 1250, // 13th century
  gnawa: 1550, // 16th century
  irish: 1750, // 18th century
  fado: 1820, // 1820s
  flamenco: 1850, // 19th century
  tango: 1880, // late 1800s
  jazz: 1900, // early 1900s
  samba: 1905, // early 1900s
  highlife: 1910, // early 1900s onward
  rai: 1920, // 1920s
  taiko: 1951, // 1950s (kumi-daiko, 1951)
  salsa: 1960, // 1960s and 70s
  afrobeat: 1970, // 1970s
  reggaeton: 1990, // 1990s
  mbira: null,
  gamelan: null,
  yidaki: null,
};

// Piecewise time axis: 800–1800 compressed, 1800–today stretched.
export const AXIS_TICKS = [850, 1250, 1550, 1800, 1900, 1950, 2000];
export function yearToX(year: number, x0: number, x1: number) {
  const split = x0 + (x1 - x0) * 0.38;
  if (year <= 1800) return x0 + ((year - 800) / 1000) * (split - x0);
  return split + ((year - 1800) / (2026 - 1800)) * (x1 - split);
}
export const tickLabel = (y: number) => (y < 1800 ? `${Math.floor(y / 100) + 1}th c.` : `${y}s`);
