// The slice of d3-geo the app uses (avoids adding @types/d3-geo).
declare module 'd3-geo' {
  export interface GeoProjection {
    (point: [number, number]): [number, number] | null;
    invert?(point: [number, number]): [number, number] | null;
    scale(): number;
    scale(s: number): this;
    translate(): [number, number];
    translate(t: [number, number]): this;
  }
  export function geoEqualEarth(): GeoProjection;
  export function geoInterpolate(a: [number, number], b: [number, number]): (t: number) => [number, number];
  export function geoDistance(a: [number, number], b: [number, number]): number;
}
