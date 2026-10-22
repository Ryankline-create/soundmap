import { DAY, dayKey } from './storage';
import type { PlayerData } from './PlayerContext';
import type { LearnData } from './LearnContext';

// Demo seed, applied when onboarding finishes. Tuned so the 90-second demo
// lands its beats: Rio and Mali are new stamps, the quiz in step 4 takes XP
// past 300 (Level 2 + Caribbean pack), and the passport ends at 6 stamps.
//   90 + Rio round (~95) + Kora lesson (80) = ~265, then the quiz crosses 300.
export const SEED_STAMPS = ['jazz', 'irish', 'tango', 'fado'] as const;

export function seedPlayer(name: string): Partial<PlayerData> {
  const now = Date.now();
  return {
    name: name.trim(),
    xp: 90,
    streak: 3,
    lastDay: dayKey(now),
    stamps: { jazz: now - 12 * DAY, irish: now - 9 * DAY, tango: now - 5 * DAY, fado: now - 2 * DAY },
    xpLog: [
      { at: now - 1 * DAY, amount: 15, reason: 'Flashcards' },
      { at: now - 3 * DAY, amount: 75, reason: 'Quiz: Jazz' },
    ],
    newStamp: null,
    playRound: 0,
    rounds: {},
  };
}

export function seedLearn(): LearnData {
  const now = Date.now();
  const due = (days: number) => now + days * DAY;
  return {
    cards: {
      'jazz-1': { box: 1, due: due(-1) },
      'jazz-2': { box: 2, due: due(-0.5) },
      'irish-1': { box: 1, due: due(-0.2) },
      'tango-1': { box: 1, due: due(-0.1) },
      'tango-2': { box: 2, due: due(-0.05) },
      'fado-1': { box: 1, due: due(-0.01) },
      'jazz-3': { box: 3, due: due(2) },
      'irish-2': { box: 2, due: due(1) },
      'irish-3': { box: 2, due: due(3) },
      'tango-3': { box: 2, due: due(2) },
      'fado-2': { box: 2, due: due(1) },
      'fado-3': { box: 3, due: due(4) },
    },
    quizzes: [{ id: 'jazz', score: 5, total: 6, at: now - 3 * DAY }],
    explained: {},
  };
}
