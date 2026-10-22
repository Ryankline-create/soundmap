import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { KEYS, usePersisted } from './storage';
import type { PackId } from '@/src/audio/types';

// A SoundDeck loop: pad id → step indices, plus keyboard notes (index into
// the pack's 8 keys) captured while recording.
export type Grid = Record<string, number[]>;
export type KeyNote = { step: number; key: number };

export type DeckData = {
  packId: PackId;
  bpm: number;
  grids: Partial<Record<PackId, Grid>>;
  keys: Partial<Record<PackId, KeyNote[]>>;
  recordings: { id: string; name: string; packId: PackId; bpm: number; grid: Grid; keys: KeyNote[]; at: number }[];
};

const initialDeck: DeckData = { packId: 'westafrica', bpm: 100, grids: {}, keys: {}, recordings: [] };

type DeckApi = DeckData & {
  ready: boolean;
  grid: Grid | undefined;
  keyNotes: KeyNote[];
  setPack: (id: PackId) => void;
  setBpm: (bpm: number) => void;
  setGrid: (id: PackId, grid: Grid, keys?: KeyNote[]) => void;
  toggleStep: (padId: string, step: number) => void;
  addHit: (padId: string, step: number) => void;
  addKey: (step: number, key: number) => void;
  clear: () => void;
  saveRecording: (name: string) => void;
  reset: () => void;
};

const DeckContext = createContext<DeckApi | null>(null);

const withStep = (steps: number[] = [], step: number) => (steps.includes(step) ? steps : [...steps, step].sort((a, b) => a - b));

export function DeckProvider({ children }: { children: ReactNode }) {
  const [data, setData, ready] = usePersisted<DeckData>(KEYS.deck, initialDeck);

  const api = useMemo<DeckApi>(() => {
    const id = data.packId;
    const grid = data.grids[id];
    const keyNotes = data.keys[id] ?? [];
    const editGrid = (fn: (g: Grid) => Grid) =>
      setData((d) => ({ ...d, grids: { ...d.grids, [d.packId]: fn(d.grids[d.packId] ?? {}) } }));
    return {
      ...data,
      ready,
      grid,
      keyNotes,
      setPack: (packId) => setData((d) => ({ ...d, packId })),
      setBpm: (bpm) => setData((d) => ({ ...d, bpm: Math.round(Math.min(160, Math.max(60, bpm))) })),
      setGrid: (packId, g, keys = []) =>
        setData((d) => ({ ...d, grids: { ...d.grids, [packId]: g }, keys: { ...d.keys, [packId]: keys } })),
      toggleStep: (padId, step) =>
        editGrid((g) => {
          const cur = g[padId] ?? [];
          return { ...g, [padId]: cur.includes(step) ? cur.filter((s) => s !== step) : withStep(cur, step) };
        }),
      addHit: (padId, step) => editGrid((g) => ({ ...g, [padId]: withStep(g[padId], step) })),
      addKey: (step, key) =>
        setData((d) => {
          const cur = (d.keys[d.packId] ?? []).filter((n) => n.step !== step);
          return { ...d, keys: { ...d.keys, [d.packId]: [...cur, { step, key }] } };
        }),
      clear: () => setData((d) => ({ ...d, grids: { ...d.grids, [d.packId]: {} }, keys: { ...d.keys, [d.packId]: [] } })),
      saveRecording: (name) =>
        setData((d) => ({
          ...d,
          recordings: [
            { id: String(Date.now()), name, packId: d.packId, bpm: d.bpm, grid: d.grids[d.packId] ?? {}, keys: d.keys[d.packId] ?? [], at: Date.now() },
            ...d.recordings,
          ].slice(0, 12),
        })),
      reset: () => setData(initialDeck),
    };
  }, [data, ready, setData]);

  return <DeckContext.Provider value={api}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeck outside DeckProvider');
  return ctx;
}
