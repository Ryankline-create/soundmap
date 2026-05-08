"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Headphones, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUNDS } from "@/lib/rounds";
import { REGION_BY_ID } from "@/lib/regions";
import { loadState, type RoundResult } from "@/lib/storage";

export default function DeepDiveIndexPage() {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(loadState().history);
    setMounted(true);
  }, []);

  return (
    <main className="space-y-5 px-4 pb-6 pt-2">
      <header className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Song Deep Dive</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a song you played and learn the story — instruments, history, what to listen for next time.
        </p>
      </header>

      {mounted && history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((r) => (
            <li key={r.roundId + r.playedAt}>
              <Link href={`/deep-dive/${r.roundId}`} className="block">
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.04]">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-2xl">
                    {REGION_BY_ID[r.region].emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">{r.songTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.city}, {r.country} · {r.songStyle}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">Play a round first</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            After each guess you can deep-dive into the song&apos;s story, instruments, and history.
          </p>
          <Button asChild size="lg" className="mt-4 h-12">
            <Link href="/play">
              Start playing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      )}

      {mounted && (
        <details className="px-1 text-sm">
          <summary className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-brand-purple" />
            Want to dive into a song you haven&apos;t played?
          </summary>
          <ul className="mt-2 space-y-1">
            {ROUNDS.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/deep-dive/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs hover:bg-white/[0.05]"
                >
                  <span className="flex items-center gap-2">
                    <span>{REGION_BY_ID[r.region].emoji}</span>
                    <span className="text-foreground/85">{r.song.title}</span>
                  </span>
                  <span className="text-muted-foreground">{r.country}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
