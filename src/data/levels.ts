import type { PackId } from '@/src/audio/types';

// Level thresholds match the SoundDeck pack unlocks.
export const LEVELS = [0, 300, 700, 1200, 2000] as const;

export const PACK_UNLOCKS: { id: PackId; name: string; xp: number }[] = [
  { id: 'westafrica', name: 'West Africa', xp: 0 },
  { id: 'caribbean', name: 'Caribbean', xp: 300 },
  { id: 'southasia', name: 'South Asia', xp: 700 },
  { id: 'seasia', name: 'Southeast Asia', xp: 1200 },
  { id: 'mena', name: 'North Africa & Middle East', xp: 2000 },
];

export function levelFor(xp: number) {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) level = i + 1;
  const floor = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const progress = next === null ? 1 : (xp - floor) / (next - floor);
  return { level, floor, next, progress };
}

export const packsUnlockedAt = (xp: number) => PACK_UNLOCKS.filter((p) => xp >= p.xp).map((p) => p.id);

// XP rules, in one place so the demo math stays checkable.
export const XP = {
  regionRight: 50,
  closenessMax: 50,
  fastAnswer: 10,
  extraReplay: -10,
  freeReplays: 2,
  lessonFinish: 80,
  quizCorrect: 15,
  quizPerfect: 20,
  cardReview: 5,
  explainGood: 20,
  explainTry: 10,
  coachMax: 50,
} as const;
