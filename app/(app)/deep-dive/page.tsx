"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <main className="space-y-7 px-5 pb-8 pt-6">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Song Deep Dive
        </p>
        <h1 className="font-serif-display text-[44px] italic leading-[0.95] tracking-tight">
          The story behind<br />the sound.
        </h1>
        <p className="max-w-prose text-[14px] leading-relaxed text-muted-foreground">
          Pick a song you played and dive into its instruments, history, and what to listen for next time.
        </p>
      </header>

      {mounted && history.length > 0 ? (
        <ul className="space-y-0">
          {history.map((r, i) => (
            <li key={r.roundId + r.playedAt}>
              <Link
                href={`/deep-dive/${r.roundId}`}
                className="group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-muted/50"
              >
                <span className="font-serif-display text-xl italic leading-none text-foreground/55 tabular-nums w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-shrink-0 text-2xl">{REGION_BY_ID[r.region].emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif-display text-[19px] italic leading-tight text-foreground">
                    {r.songTitle}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {r.city}, {r.country} · {r.songStyle}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-5 border-y border-border py-10 text-center">
          <p className="font-serif-display text-2xl italic leading-snug text-foreground/85">
            Play a round first.
          </p>
          <p className="mx-auto max-w-xs text-[13px] text-muted-foreground">
            After each guess you can deep-dive into the song&apos;s story, instruments, and history.
          </p>
          <Button asChild variant="primary" className="rounded-xl">
            <Link href="/play">
              Start playing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {mounted && (
        <details className="text-sm">
          <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
            Or browse all 12 songs
          </summary>
          <ul className="mt-4 space-y-0">
            {ROUNDS.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/deep-dive/${r.id}`}
                  className="flex items-center justify-between border-b border-border py-2.5 text-[13px] hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2.5">
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
