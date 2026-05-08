"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    setTimeout(() => router.push("/play"), 350);
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-white px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-20 text-slate-900">
      <section className="flex flex-1 flex-col items-center justify-center">
        <Image
          src="/logo.png"
          alt="SoundMap — Discover music worldwide"
          width={1200}
          height={1520}
          priority
          sizes="(max-width: 480px) 70vw, 280px"
          className="h-auto w-[260px] animate-fade-up"
        />
      </section>

      <form onSubmit={handleStart} className="space-y-3 animate-fade-up [animation-delay:160ms]">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          inputMode="text"
          autoComplete="given-name"
          className="flex h-14 w-full rounded-2xl border border-slate-900/10 bg-white px-5 text-lg text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
        />

        <Button
          type="submit"
          size="lg"
          disabled={!name.trim() || submitting}
          className="h-14 w-full text-base"
        >
          {submitting ? "Loading…" : "Start"}
          {!submitting && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </main>
  );
}
