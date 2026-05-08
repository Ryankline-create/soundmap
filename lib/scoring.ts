export const PLAY_COST = 10;
export const FREE_PLAYS = 1;
export const MAX_PLAYS = 3;

export const REGION_HIT_XP = 50;
export const PIN_MAX_BONUS = 50;
export const PIN_FALLOFF_KM = 1500;

export type ScoreInputs = {
  regionCorrect: boolean;
  distanceKm: number;
  plays: number;
};

export type ScoreBreakdown = {
  regionXp: number;
  pinXp: number;
  playPenalty: number;
  totalXp: number;
};

export function scoreRound({ regionCorrect, distanceKm, plays }: ScoreInputs): ScoreBreakdown {
  const regionXp = regionCorrect ? REGION_HIT_XP : 0;
  const pinXp = regionCorrect
    ? Math.round(PIN_MAX_BONUS * Math.max(0, 1 - distanceKm / PIN_FALLOFF_KM))
    : 0;
  const extraPlays = Math.max(0, plays - FREE_PLAYS);
  const playPenalty = extraPlays * PLAY_COST;
  const total = regionXp + pinXp - playPenalty;
  return { regionXp, pinXp, playPenalty, totalXp: Math.max(0, total) };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
