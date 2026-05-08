"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { loadPlayer, loadState, levelFromXp, xpProgress, XP_PER_LEVEL } from "@/lib/storage";

export function GameHeader({ className }: { className?: string }) {
  const [name, setName] = useState<string>("");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setName(loadPlayer()?.name ?? "");
    const s = loadState();
    setXp(s.xp);
    setStreak(s.streak);
    setMounted(true);

    function refresh() {
      const s = loadState();
      setXp(s.xp);
      setStreak(s.streak);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === "soundmap.state") refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("soundmap:state", refresh as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("soundmap:state", refresh as EventListener);
    };
  }, []);

  const level = levelFromXp(xp);
  const progress = xpProgress(xp);
  const pct = (progress / XP_PER_LEVEL) * 100;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/85 px-5 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur",
        className
      )}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
          SoundMap
          {name && mounted && (
            <span className="ml-2 text-foreground/60 normal-case tracking-normal">
              · {name}
            </span>
          )}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            Lv <span className="font-serif-display text-[15px] italic text-foreground">{mounted ? level : "—"}</span>
          </span>
          <span className="text-border">/</span>
          <span>
            <span className="font-serif-display text-[15px] italic text-foreground">{mounted ? streak : 0}</span>
            <span className="ml-1">streak</span>
          </span>
        </div>
      </div>
      <div className="mt-2 h-px w-full bg-border">
        <div
          className="h-px bg-foreground/70 transition-[width] duration-700"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{mounted ? progress : 0}/{XP_PER_LEVEL} XP</span>
        <span className="uppercase tracking-[0.14em]">Issue 01</span>
      </div>
    </header>
  );
}
