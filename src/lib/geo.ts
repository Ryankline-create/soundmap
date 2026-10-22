import { geoDistance, geoEqualEarth, geoInterpolate } from 'd3-geo';
import { COUNTRIES, MAP, type Country } from '@/src/data/world';
import type { RegionKey } from '@/src/data/types';

// Same projection the map paths were generated with (scripts/build-map.mjs).
const projection = geoEqualEarth().scale(MAP.scale).translate(MAP.translate);

export type XY = { x: number; y: number };
export type LatLng = { lat: number; lng: number };

export function project(p: LatLng): XY {
  const r = projection([p.lng, p.lat]) ?? [0, 0];
  return { x: r[0], y: r[1] };
}

export function unproject(p: XY): LatLng | null {
  const r = projection.invert?.([p.x, p.y]);
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1])) return null;
  return { lat: r[1], lng: r[0] };
}

export const EARTH_KM = 6371;
export const distanceKm = (a: LatLng, b: LatLng) => geoDistance([a.lng, a.lat], [b.lng, b.lat]) * EARTH_KM;

// Great-circle arc as projected points (60 samples). Splits the path where it
// would jump across the map edge.
export function arcPoints(a: LatLng, b: LatLng, samples = 60): XY[] {
  const interp = geoInterpolate([a.lng, a.lat], [b.lng, b.lat]);
  const pts: XY[] = [];
  for (let i = 0; i <= samples; i++) {
    const [lng, lat] = interp(i / samples);
    pts.push(project({ lat, lng }));
  }
  return pts;
}

export function arcPath(a: LatLng, b: LatLng, samples = 60) {
  const pts = arcPoints(a, b, samples);
  let d = '';
  pts.forEach((p, i) => {
    const jump = i > 0 && Math.abs(p.x - pts[i - 1].x) > MAP.width / 2;
    d += `${i === 0 || jump ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  });
  return d;
}

// Approximate path length for stroke-dash animation.
export function polylineLength(pts: XY[]) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return len;
}

// A bowed curve between two map points (used where a straight great circle
// would be too flat to read, e.g. the family tree).
export function bowPoint(a: XY, b: XY, bow = 0.22): XY {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // perpendicular, flipped so the curve always bows upward
  let nx = -dy;
  let ny = dx;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x: (a.x + b.x) / 2 + nx * bow, y: (a.y + b.y) / 2 + ny * bow };
}

export function bowPath(a: XY, b: XY, bow = 0.22) {
  const c = bowPoint(a, b, bow);
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
}

// Hit-testing: parse each country's M/L/Z path into rings once.
type Ring = number[];
type Shape = { country: Country; rings: Ring[]; box: [number, number, number, number] };
let shapes: Shape[] | null = null;

function parse(d: string): Ring[] {
  const rings: Ring[] = [];
  let cur: Ring = [];
  const re = /([MLZ])([^MLZ]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    if (m[1] === 'Z') {
      if (cur.length) rings.push(cur);
      cur = [];
      continue;
    }
    if (m[1] === 'M' && cur.length) {
      rings.push(cur);
      cur = [];
    }
    const [x, y] = m[2].split(',').map(Number);
    cur.push(x, y);
  }
  if (cur.length) rings.push(cur);
  return rings;
}

function getShapes() {
  if (shapes) return shapes;
  shapes = COUNTRIES.map((country) => {
    const rings = parse(country.d);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const r of rings) for (let i = 0; i < r.length; i += 2) {
      x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]);
      y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]);
    }
    return { country, rings, box: [x0, y0, x1, y1] as [number, number, number, number] };
  });
  return shapes;
}

function inRing(r: Ring, x: number, y: number) {
  let inside = false;
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function countryAt(p: XY): Country | null {
  for (const s of getShapes()) {
    const [x0, y0, x1, y1] = s.box;
    if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
    let inside = false;
    for (const r of s.rings) if (inRing(r, p.x, p.y)) inside = !inside;
    if (inside) return s.country;
  }
  return null;
}

export const countryByName = (name: string) => COUNTRIES.find((c) => c.name === name || c.id === name) ?? null;

// Centroid-ish label point for a country: the middle of its largest ring's box.
export function countryLabelPoint(country: Country): XY {
  const s = getShapes().find((x) => x.country === country);
  if (!s) return { x: 0, y: 0 };
  let best = s.rings[0];
  let bestArea = 0;
  for (const r of s.rings) {
    let a = 0;
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) a += r[j] * r[i + 1] - r[i] * r[j + 1];
    if (Math.abs(a) > bestArea) {
      bestArea = Math.abs(a);
      best = r;
    }
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < best.length; i += 2) {
    x0 = Math.min(x0, best[i]); x1 = Math.max(x1, best[i]);
    y0 = Math.min(y0, best[i + 1]); y1 = Math.max(y1, best[i + 1]);
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
}

export const regionOfCountry = (c: Country | null): RegionKey | null => c?.region ?? null;

export const formatKm = (km: number) => `${Math.round(km).toLocaleString('en-US')} km`;
