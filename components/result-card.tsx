"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const matched = result.regionCorrect;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            matched ? "text-emerald-700" : "text-rose-700"
          )}
        >
          {matched ? "Region match" : "Wrong region"}
        </span>
        <span className="font-serif-display text-2xl italic leading-none text-foreground">
          +{result.xpEarned}
          <span className="ml-1 text-[11px] not-italic text-muted-foreground tracking-[0.16em]">XP</span>
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-foreground">
          <InstrumentIcon instrument={result.instrument} className="h-9 w-9" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif-display text-3xl italic leading-tight tracking-tight text-foreground">
            {result.songTitle}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{result.songStyle}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-3 border-y border-border py-4 text-[13px]">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">From</dt>
          <dd className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base">{region.emoji}</span>
            <span className="font-medium text-foreground">{result.city}</span>
            <span className="text-muted-foreground">· {result.country}</span>
          </dd>
          <dd className="text-[11px] text-muted-foreground">{region.label}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">You guessed</dt>
          <dd className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base">{regionGuess.emoji}</span>
            <span className="font-medium text-foreground">{regionGuess.label}</span>
          </dd>
          <dd className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {result.distanceKm.toLocaleString()} km off
          </dd>
        </div>
      </dl>

      <ul className="space-y-1.5 text-[12px]">
        <li className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Region bonus</span>
          <span className="font-serif-display italic">+{breakdown.regionXp}</span>
        </li>
        <li className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Pin accuracy</span>
          <span className="font-serif-display italic">+{breakdown.pinXp}</span>
        </li>
        {breakdown.playPenalty > 0 && (
          <li className="flex items-baseline justify-between text-rose-700">
            <span>Replay cost</span>
            <span className="font-serif-display italic">−{breakdown.playPenalty}</span>
          </li>
        )}
      </ul>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button asChild variant="outline" className="h-12 rounded-xl">
          <Link href={`/deep-dive/${result.roundId}`}>
            Deep dive
          </Link>
        </Button>
        <Button onClick={onNext} variant="primary" className="h-12 rounded-xl">
          Next round
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
