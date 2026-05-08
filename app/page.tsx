"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SoundMark } from "@/components/sound-mark";
import { loadPlayer, savePlayer } from "@/lib/storage";

export default function SplashPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const existing = loadPlayer();
    if (existing?.name) setName(existing.name);
  }, []);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    savePlayer(trimmed);
    setTimeout(() => router.push("/play"), 300);
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background px-7 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-navy/70">
        <span>SoundMap</span>
        <span>Issue 01 · World Music</span>
      </div>

      <section className="flex flex-1 flex-col justify-center gap-9 py-10">
        <SoundMark className="w-[180px] animate-fade-up" />

        <div className="space-y-5 animate-fade-up [animation-delay:120ms]">
          <h1 className="font-serif-display text-[68px] font-normal leading-[0.95] tracking-tight text-navy">
            Discover<br />
            <em className="not-italic text-teal">music</em>{" "}
            <span className="font-serif-display italic">worldwide.</span>
          </h1>
          <p className="max-w-[18rem] text-[15px] leading-relaxed text-muted-foreground">
            Listen to a clip, guess where in the world it&apos;s from, and learn the story behind every sound.
          </p>
        </div>
      </section>

      <form onSubmit={handleStart} className="space-y-3 animate-fade-up [animation-delay:240ms]">
        <label className="block">
          <span className="mb-2 ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your name
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya"
            maxLength={24}
            inputMode="text"
            autoComplete="given-name"
            className="block h-14 w-full rounded-xl border border-border bg-card px-4 font-serif-display text-2xl italic text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!name.trim() || submitting}
          className="h-14 w-full rounded-xl text-base"
        >
          {submitting ? "Loading…" : "Begin"}
        </Button>

        <p className="px-1 pt-1 text-[11px] text-muted-foreground">
          No signup. Your name stays on this device.
        </p>
      </form>
    </main>
  );
}
