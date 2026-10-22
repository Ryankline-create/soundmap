import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DAY, dayKey, KEYS, usePersisted } from './storage';
import { levelFor, PACK_UNLOCKS, packsUnlockedAt } from '@/src/data/levels';
import { seedPlayer } from './seed';
import type { ThemeMode } from '@/src/theme/ThemeProvider';
import type { PackId } from '@/src/audio/types';

export type Moment =
  | { kind: 'level'; level: number }
  | { kind: 'pack'; packId: PackId; name: string; xp: number };

export type PlayerData = {
  onboarded: boolean;
  name: string;
  xp: number;
  streak: number;
  lastDay: string;
  // lesson slug → time stamped
  stamps: Record<string, number>;
  xpLog: { at: number; amount: number; reason: string }[];
  theme: ThemeMode;
  sound: boolean;
  // the most recent stamp glows in the Lab until it's been seen
  newStamp: string | null;
  playRound: number;
  rounds: Record<string, number>;
};

export const initialPlayer: PlayerData = {
  onboarded: false,
  name: '',
  xp: 0,
  streak: 0,
  lastDay: '',
  stamps: {},
  xpLog: [],
  theme: 'system',
  sound: true,
  newStamp: null,
  playRound: 0,
  rounds: {},
};

type PlayerApi = PlayerData & {
  ready: boolean;
  level: ReturnType<typeof levelFor>;
  unlockedPacks: PackId[];
  moments: Moment[];
  finishOnboarding: (name: string) => void;
  addXp: (amount: number, reason: string) => void;
  stamp: (slug: string) => boolean;
  clearNewStamp: () => void;
  setTheme: (t: ThemeMode) => void;
  setSound: (on: boolean) => void;
  setPlayRound: (n: number) => void;
  recordRound: (slug: string, score: number) => void;
  dismissMoment: () => void;
  reset: () => void;
};

const PlayerContext = createContext<PlayerApi | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [data, setData, ready] = usePersisted<PlayerData>(KEYS.player, initialPlayer);
  const [moments, setMoments] = useState<Moment[]>([]);

  // Streak: a new day after an active yesterday extends it; a gap restarts it.
  useEffect(() => {
    if (!ready || !data.onboarded) return;
    const today = dayKey();
    if (data.lastDay === today) return;
    const yesterday = dayKey(Date.now() - DAY);
    setData((d) => ({ ...d, lastDay: today, streak: d.lastDay === yesterday ? d.streak + 1 : 1 }));
  }, [ready, data.onboarded, data.lastDay, setData]);

  // XP as of the latest addXp call, so two quick awards both count before React re-renders
  const xpRef = useRef(data.xp);
  useEffect(() => {
    xpRef.current = data.xp;
  }, [data.xp]);

  const addXp = useCallback(
    (amount: number, reason: string) => {
      const before = xpRef.current;
      const xp = Math.max(0, before + amount);
      xpRef.current = xp;
      const next: Moment[] = [];
      if (levelFor(xp).level > levelFor(before).level) next.push({ kind: 'level', level: levelFor(xp).level });
      for (const p of PACK_UNLOCKS) if (before < p.xp && xp >= p.xp) next.push({ kind: 'pack', packId: p.id, name: p.name, xp: p.xp });
      if (next.length) setMoments((m) => [...m, ...next]);
      setData((d) => ({ ...d, xp, xpLog: [{ at: Date.now(), amount, reason }, ...d.xpLog].slice(0, 60) }));
    },
    [setData],
  );

  const stamp = useCallback(
    (slug: string) => {
      const isNew = !data.stamps[slug];
      if (isNew) setData((d) => ({ ...d, stamps: { ...d.stamps, [slug]: Date.now() }, newStamp: slug }));
      return isNew;
    },
    [data.stamps, setData],
  );

  const api = useMemo<PlayerApi>(
    () => ({
      ...data,
      ready,
      level: levelFor(data.xp),
      unlockedPacks: packsUnlockedAt(data.xp),
      moments,
      finishOnboarding: (name) => setData(() => ({ ...initialPlayer, ...seedPlayer(name), onboarded: true })),
      addXp,
      stamp,
      clearNewStamp: () => setData((d) => ({ ...d, newStamp: null })),
      setTheme: (theme) => setData((d) => ({ ...d, theme })),
      setSound: (sound) => setData((d) => ({ ...d, sound })),
      setPlayRound: (playRound) => setData((d) => ({ ...d, playRound })),
      recordRound: (slug, score) => setData((d) => ({ ...d, rounds: { ...d.rounds, [slug]: Math.max(score, d.rounds[slug] ?? 0) } })),
      dismissMoment: () => setMoments((m) => m.slice(1)),
      reset: () => {
        setMoments([]);
        setData(initialPlayer);
      },
    }),
    [data, ready, moments, addXp, stamp, setData],
  );

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer outside PlayerProvider');
  return ctx;
}
