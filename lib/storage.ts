import type { RegionId } from "./regions";
import type { Instrument } from "./audio";

const PLAYER_KEY = "soundmap.player";
const STATE_KEY = "soundmap.state";

export type Player = {
  name: string;
  joinedAt: string;
};

export type RoundResult = {
  roundId: string;
  city: string;
  country: string;
  region: RegionId;
  hint: string;
  songTitle: string;
  songStyle: string;
  instrument: Instrument;
  guess: {
    region: RegionId;
    lat: number;
    lng: number;
    plays: number;
  };
  regionCorrect: boolean;
  distanceKm: number;
  xpEarned: number;
  playedAt: string;
};

export type GameState = {
  xp: number;
  streak: number;
  best: number;
  history: RoundResult[];
};

export const XP_PER_LEVEL = 200;

const EMPTY_STATE: GameState = { xp: 0, streak: 0, best: 0, history: [] };

export function loadPlayer(): Player | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAYER_KEY);
    return raw ? (JSON.parse(raw) as Player) : null;
  } catch {
    return null;
  }
}

export function savePlayer(name: string): Player {
  const player: Player = { name, joinedAt: new Date().toISOString() };
  window.localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  return player;
}

export function loadState(): GameState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      xp: parsed.xp ?? 0,
      streak: parsed.streak ?? 0,
      best: parsed.best ?? 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: GameState) {
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function appendResult(result: RoundResult): GameState {
  const prev = loadState();
  const streak = result.regionCorrect ? prev.streak + 1 : 0;
  const next: GameState = {
    xp: prev.xp + result.xpEarned,
    streak,
    best: Math.max(prev.best, streak),
    history: [result, ...prev.history].slice(0, 30),
  };
  saveState(next);
  return next;
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpProgress(xp: number) {
  return xp % XP_PER_LEVEL;
}
