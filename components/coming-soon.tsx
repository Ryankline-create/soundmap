"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  emoji: string;
  title: string;
  tagline: string;
  bullets: string[];
};

export function ComingSoon({ emoji, title, tagline, bullets }: Props) {
  return (
    <main className="space-y-7 px-5 pb-8 pt-6">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Coming soon
        </p>
        <h1 className="font-serif-display text-5xl italic leading-[1.05] tracking-tight">
          {title}
        </h1>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          <span className="mr-2 text-2xl align-middle">{emoji}</span>
          {tagline}
        </p>
      </header>

      <ul className="space-y-4">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-4 border-b border-border pb-4 last:border-0">
            <span className="font-serif-display text-xl italic leading-none text-foreground/55 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="flex-1 text-[14px] leading-relaxed text-foreground/85">{b}</p>
          </li>
        ))}
      </ul>

      <Button asChild variant="outline" className="w-full rounded-xl">
        <Link href="/play">
          Back to Play
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </main>
  );
}
