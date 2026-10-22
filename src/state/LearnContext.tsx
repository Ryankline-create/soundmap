import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DAY, KEYS, usePersisted } from './storage';
import { seedLearn } from './seed';

// Leitner boxes 1-5. "Again" sends a card back to box 1 and keeps it due today;
// "Good" moves it up one box, "Easy" two. Each box waits longer.
const BOX_DAYS = [0, 1, 2, 4, 7, 14];

export type CardState = { box: number; due: number };
export type QuizRecord = { id: string; score: number; total: number; at: number };

export type LearnData = {
  cards: Record<string, CardState>;
  quizzes: QuizRecord[];
  explained: Record<string, { at: number; hit: number; total: number }>;
};

const initialLearn: LearnData = { cards: {}, quizzes: [], explained: {} };

type LearnApi = LearnData & {
  ready: boolean;
  dueIds: string[];
  seed: () => void;
  introduce: (lessonSlug: string) => void;
  review: (cardId: string, grade: 'again' | 'good' | 'easy') => void;
  recordQuiz: (id: string, score: number, total: number) => void;
  recordExplain: (id: string, hit: number, total: number) => void;
  reset: () => void;
};

const LearnContext = createContext<LearnApi | null>(null);

export function LearnProvider({ children }: { children: ReactNode }) {
  const [data, setData, ready] = usePersisted<LearnData>(KEYS.learn, initialLearn);

  const api = useMemo<LearnApi>(() => {
    const now = Date.now();
    const dueIds = Object.entries(data.cards)
      .filter(([, s]) => s.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => id);
    return {
      ...data,
      ready,
      dueIds,
      seed: () => setData(seedLearn()),
      // finishing a lesson adds its three cards to today's review
      introduce: (slug) =>
        setData((d) => {
          const cards = { ...d.cards };
          for (let i = 1; i <= 3; i++) {
            const id = `${slug}-${i}`;
            if (!cards[id]) cards[id] = { box: 1, due: Date.now() + i };
          }
          return { ...d, cards };
        }),
      review: (id, grade) =>
        setData((d) => {
          const cur = d.cards[id] ?? { box: 1, due: Date.now() };
          const box = grade === 'again' ? 1 : Math.min(5, cur.box + (grade === 'easy' ? 2 : 1));
          const wait = grade === 'again' ? 10 * 60 * 1000 : BOX_DAYS[box] * DAY;
          return { ...d, cards: { ...d.cards, [id]: { box, due: Date.now() + wait } } };
        }),
      recordQuiz: (id, score, total) =>
        setData((d) => ({ ...d, quizzes: [{ id, score, total, at: Date.now() }, ...d.quizzes] })),
      recordExplain: (id, hit, total) =>
        setData((d) => ({ ...d, explained: { ...d.explained, [id]: { at: Date.now(), hit, total } } })),
      reset: () => setData(initialLearn),
    };
  }, [data, ready, setData]);

  return <LearnContext.Provider value={api}>{children}</LearnContext.Provider>;
}

export function useLearn() {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error('useLearn outside LearnProvider');
  return ctx;
}
