import { XP } from '@/src/data/levels';
import type { RegionKey } from '@/src/data/types';

// Closeness: full marks within 250 km, nothing past 4,000 km, linear between.
const NEAR_KM = 250;
const FAR_KM = 4000;

export type RoundScore = { region: number; closeness: number; fast: number; replays: number; total: number };

export function scoreRound(opts: {
  guessRegion: RegionKey | null;
  answerRegion: RegionKey;
  km: number;
  seconds: number;
  extraReplays: number;
}): RoundScore {
  const region = opts.guessRegion === opts.answerRegion ? XP.regionRight : 0;
  const t = Math.max(0, Math.min(1, (FAR_KM - opts.km) / (FAR_KM - NEAR_KM)));
  const closeness = Math.round(XP.closenessMax * t);
  const fast = opts.seconds <= 15 ? XP.fastAnswer : 0;
  const replays = opts.extraReplays * XP.extraReplay;
  return { region, closeness, fast, replays, total: Math.max(0, region + closeness + fast + replays) };
}
