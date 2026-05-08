"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  emoji: string;
  title: string;
  tagline: string;
  bullets: string[];
};

export function ComingSoon({ emoji, title, tagline, bullets }: Props) {
  return (
    <main className="px-4 pb-6 pt-2">
      <Card className="relative overflow-hidden p-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, hsl(var(--brand-purple) / 0.22), transparent 60%)",
          }}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-3xl shadow-lg shadow-brand-purple/30">
          <span aria-hidden>{emoji}</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold leading-tight">{title}</h1>
        <p className="mx-auto mt-1 max-w-xs text-balance text-sm text-muted-foreground">{tagline}</p>

        <ul className="mt-5 space-y-2 text-left text-sm">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-purple" />
              <span className="text-foreground/85">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Coming soon
          </span>
        </div>

        <Button asChild size="lg" className="mt-5 h-12 w-full">
          <Link href="/play">
            Back to Play
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </main>
  );
}
