"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="space-y-3 px-4 pb-6 pt-2">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start text-muted-foreground">
        <Link href="/deep-dive">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      {error ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-rose-300">{error}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/play">Try a round</Link>
          </Button>
        </Card>
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
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 bg-brand-gradient p-5 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
              Generating Deep Dive
            </p>
            <p className="mt-1 text-sm text-white/85">
              Pulling instruments, history, and what to listen for…
            </p>
          </div>
        </div>
      </Card>
      {[0, 1, 2].map((i) => (
        <Card key={i} className="space-y-2 p-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-full animate-pulse rounded bg-white/10" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
        </Card>
      ))}
    </div>
  );
}
