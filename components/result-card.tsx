"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InstrumentIcon } from "@/components/instrument-icon";
import { cn } from "@/lib/utils";
import { REGION_BY_ID } from "@/lib/regions";
import type { RoundResult } from "@/lib/storage";
import type { ScoreBreakdown } from "@/lib/scoring";

type Props = {
  result: RoundResult;
  breakdown: ScoreBreakdown;
  onNext: () => void;
};

export function ResultCard({ result, breakdown, onNext }: Props) {
  const region = REGION_BY_ID[result.region];
  const regionGuess = REGION_BY_ID[result.guess.region];

  return (
    <div className="space-y-3">
      <Card
        className={cn(
          "relative overflow-hidden p-5",
          result.regionCorrect ? "ring-1 ring-emerald-400/40" : "ring-1 ring-rose-500/40"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          aria-hidden
          style={{
            background: result.regionCorrect
              ? "radial-gradient(120% 80% at 50% 0%, hsl(150 80% 60% / 0.18), transparent 60%)"
              : "radial-gradient(120% 80% at 50% 0%, hsl(350 90% 65% / 0.18), transparent 60%)",
          }}
        />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5",
              result.regionCorrect ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
            )}
          >
            {result.regionCorrect ? "Region match" : "Wrong region"}
          </span>
          <span className="text-muted-foreground">+{result.xpEarned} XP</span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-purple">
            <InstrumentIcon instrument={result.instrument} className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold leading-tight">
              {result.songTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{result.songStyle}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-medium">
              <span className="text-base">{region.emoji}</span>
              {result.city}, {result.country}
            </div>
            <div className="text-xs text-muted-foreground">{region.label}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">You picked</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-medium">
              <span className="text-base">{regionGuess.emoji}</span>
              {regionGuess.label}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {result.distanceKm.toLocaleString()} km off
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center justify-between">
            <span>Region bonus</span>
            <span className="text-foreground/80">+{breakdown.regionXp}</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Pin accuracy</span>
            <span className="text-foreground/80">+{breakdown.pinXp}</span>
          </li>
          {breakdown.playPenalty > 0 && (
            <li className="flex items-center justify-between text-rose-300">
              <span>Replay cost</span>
              <span>−{breakdown.playPenalty}</span>
            </li>
          )}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="lg" className="h-12">
          <Link href={`/deep-dive/${result.roundId}`}>
            <Sparkles className="h-4 w-4 text-brand-purple" />
            Deep dive
          </Link>
        </Button>
        <Button onClick={onNext} size="lg" className="h-12">
          <Trophy className="h-4 w-4" />
          Next round
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
