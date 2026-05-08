"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {roundLabel}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 className="h-3.5 w-3.5" />
          0:30 clip
        </span>
      </div>

      <div className="mt-4 flex gap-3">
        <div
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-purple",
            isPlaying && "animate-pulse-soft"
          )}
        >
          <InstrumentIcon instrument={preset.instrument} className="h-7 w-7" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-purple/90">
            {instrumentLabel(preset.instrument)} · {preset.bpm} BPM
          </p>
          <p className="mt-1 text-balance text-[15px] leading-snug text-foreground/90">
            <span className="mr-1 text-brand-coral">“</span>
            {hint}
            <span className="ml-1 text-brand-coral">”</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <Button
          type="button"
          onClick={togglePlay}
          disabled={locked || allUsed}
          aria-label={isPlaying ? "Stop" : "Play clip"}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full text-white",
            isPlaying && "animate-pulse-soft"
          )}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </Button>

        <div className="flex-1">
          <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-[width] duration-100 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>{fmtTime(elapsed)}</span>
            <span>0:30</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {allUsed
          ? "All 3 plays used — make your guess."
          : nextIsFree
          ? `${playsLeft} plays left · first play is free`
          : `${playsLeft} ${playsLeft === 1 ? "replay" : "replays"} left · ${PLAY_COST} XP each`}
      </p>
    </Card>
  );
}
