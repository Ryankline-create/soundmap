"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Card } from "@/components/ui/card";
import { InstrumentIcon, instrumentLabel } from "@/components/instrument-icon";
import { cn } from "@/lib/utils";
import { CLIP_DURATION_S, SoundMapPlayer, type AudioPreset } from "@/lib/audio";
import { FREE_PLAYS, MAX_PLAYS, PLAY_COST } from "@/lib/scoring";

type Props = {
  preset: AudioPreset;
  hint: string;
  roundLabel: string;
  plays: number;
  onPlay: () => void;
  locked?: boolean;
  className?: string;
};

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AudioPlayerCard({ preset, hint, roundLabel, plays, onPlay, locked, className }: Props) {
  const playerRef = useRef<SoundMapPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      playerRef.current?.stop();
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    if (locked && playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
    }
  }, [locked]);

  function startTick() {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      const e = playerRef.current?.elapsed() ?? 0;
      setElapsed(e);
    }, 80);
  }
  function stopTick() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  async function togglePlay() {
    if (locked) return;
    if (isPlaying) {
      playerRef.current?.stop();
      setIsPlaying(false);
      stopTick();
      return;
    }
    if (plays >= MAX_PLAYS) return;
    const player = new SoundMapPlayer(CLIP_DURATION_S);
    playerRef.current = player;
    setElapsed(0);
    setIsPlaying(true);
    onPlay();
    startTick();
    await player.play(preset, () => {
      setIsPlaying(false);
      setElapsed(CLIP_DURATION_S);
      stopTick();
    });
  }

  const pct = Math.min(100, (elapsed / CLIP_DURATION_S) * 100);
  const playsLeft = Math.max(0, MAX_PLAYS - plays);
  const nextIsFree = plays < FREE_PLAYS;
  const allUsed = plays >= MAX_PLAYS;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{roundLabel}</span>
        <span>0:30 clip</span>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-foreground">
          <InstrumentIcon instrument={preset.instrument} className="h-9 w-9" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {instrumentLabel(preset.instrument)} · {preset.bpm} BPM
          </p>
          <p className="mt-1 font-serif-display text-[22px] italic leading-snug text-foreground">
            “{hint}”
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          disabled={locked || allUsed}
          aria-label={isPlaying ? "Stop" : "Play clip"}
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
            "border-foreground bg-foreground text-background hover:bg-foreground/90",
            (locked || allUsed) && "border-border bg-muted text-muted-foreground hover:bg-muted"
          )}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </button>

        <div className="flex-1">
          <div className="relative h-px w-full bg-border">
            <div
              className="absolute inset-y-[-1px] left-0 h-[3px] -translate-y-[1px] bg-foreground transition-[width] duration-100 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span className="font-serif-display italic text-foreground">{fmtTime(elapsed)}</span>
            <span>0:30</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        {allUsed
          ? "All 3 plays used — make your guess."
          : nextIsFree
          ? `${playsLeft} plays left · first play is free`
          : `${playsLeft} ${playsLeft === 1 ? "replay" : "replays"} left · ${PLAY_COST} XP each`}
      </p>
    </Card>
  );
}
