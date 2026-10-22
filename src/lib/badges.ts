import { getLesson } from '@/src/data/lessons';
import type { PlayerData } from '@/src/state/PlayerContext';
import type { LearnData } from '@/src/state/LearnContext';
import type { GlyphId } from '@/src/data/types';

export type Badge = { id: string; name: string; detail: string; glyph: GlyphId; earned: boolean; progress: number; status: string };

// Badges are derived from progress, so they can never drift out of sync.
export function badgesFor(player: Pick<PlayerData, 'streak' | 'stamps'>, learn: Pick<LearnData, 'quizzes' | 'explained'>): Badge[] {
  const regions = new Set(Object.keys(player.stamps).map((s) => getLesson(s)?.region).filter(Boolean));
  const explained = Object.keys(learn.explained).length;
  return [
    {
      id: 'first-quiz', name: 'First Quiz', detail: 'Finish any quiz', glyph: 'bell',
      earned: learn.quizzes.length > 0, progress: Math.min(1, learn.quizzes.length), status: learn.quizzes.length ? 'Earned' : '0 of 1',
    },
    {
      id: 'streak-7', name: '7-Day Streak', detail: 'Listen seven days in a row', glyph: 'djembe',
      earned: player.streak >= 7, progress: Math.min(1, player.streak / 7), status: player.streak >= 7 ? 'Earned' : `${player.streak} of 7 days`,
    },
    {
      id: 'regions-5', name: 'Explored 5 Regions', detail: 'A stamp from every region', glyph: 'kora',
      earned: regions.size >= 5, progress: regions.size / 5, status: regions.size >= 5 ? 'Earned' : `${regions.size} of 5 regions`,
    },
    {
      id: 'explain-10', name: 'Explained 10 Stories', detail: 'Retell ten stories in your own words', glyph: 'guitar',
      earned: explained >= 10, progress: Math.min(1, explained / 10), status: explained >= 10 ? 'Earned' : `${explained} of 10`,
    },
  ];
}
