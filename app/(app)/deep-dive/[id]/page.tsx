"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeepDiveCard } from "@/components/deep-dive-card";
import { ROUNDS } from "@/lib/rounds";
import { loadState, type RoundResult } from "@/lib/storage";
import type { DeepDive } from "@/lib/deep-dive";

type ApiResponse = { source: "ai" | "fallback"; data: DeepDive };
type DiveMeta = Pick<RoundResult, "songTitle" | "songStyle" | "city" | "country" | "region" | "instrument">;

export default function DeepDivePage({ params }: { params: { id: string } }) {
  const [meta, setMeta] = useState<DiveMeta | null>(null);
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const round = ROUNDS.find((r) => r.id === params.id);
    const fromHistory = loadState().history.find((h) => h.roundId === params.id);
    if (fromHistory) {
      setMeta({
        songTitle: fromHistory.songTitle,
        songStyle: fromHistory.songStyle,
        city: fromHistory.city,
        country: fromHistory.country,
        region: fromHistory.region,
        instrument: fromHistory.instrument ?? round?.audio.instrument ?? "kalimba",
      });
    } else if (round) {
      setMeta({
        songTitle: round.song.title,
        songStyle: round.song.style,
        city: round.city,
        country: round.country,
        region: round.region,
        instrument: round.audio.instrument,
      });
    } else {
      setError("Song not found.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/deep-dive", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roundId: params.id }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setResp(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <main className="space-y-5 px-5 pb-8 pt-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start text-muted-foreground">
        <Link href="/deep-dive">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      {error ? (
        <div className="space-y-3 border-y border-border py-10 text-center">
          <p className="font-serif-display text-xl italic text-foreground/85">{error}</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/play">Try a round</Link>
          </Button>
        </div>
      ) : !meta || !resp ? (
        <LoadingSkeleton />
      ) : (
        <DeepDiveCard meta={meta} dive={resp.data} source={resp.source} />
      )}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Generating Deep Dive</span>
          <span>Claude</span>
        </div>
        <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2.5">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <div className="h-4 w-6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
