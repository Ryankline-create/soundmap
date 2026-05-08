"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

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

    function onStorage(e: StorageEvent) {
      if (e.key === "soundmap.state") {
        const s = loadState();
        setXp(s.xp);
        setStreak(s.streak);
      }
    }
    function onLocal() {
      const s = loadState();
      setXp(s.xp);
      setStreak(s.streak);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("soundmap:state", onLocal as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("soundmap:state", onLocal as EventListener);
    };
  }, []);

  const level = levelFromXp(xp);
  const progress = xpProgress(xp);
  const pct = (progress / XP_PER_LEVEL) * 100;

  return (
    <header className={cn("sticky top-0 z-30 bg-background/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold tracking-wide">
          <span className="text-muted-foreground">Lv</span>
          <span className="font-display text-base text-foreground">{mounted ? level : "—"}</span>
        </div>

        <div className="relative flex h-9 flex-1 items-center overflow-hidden rounded-full border border-white/10 bg-white/5 px-1">
          <div
            className="absolute inset-y-1 left-1 rounded-full bg-brand-gradient transition-[width] duration-700"
            style={{ width: `calc(${pct}% - 0.5rem)` }}
            aria-hidden
          />
          <div className="relative ml-3 text-[11px] font-semibold tracking-wide text-foreground/90">
            {mounted ? `${progress} / ${XP_PER_LEVEL} XP` : "— / 200 XP"}
          </div>
        </div>

        <div className="flex h-9 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold">
          <Flame className="h-3.5 w-3.5 text-brand-coral" />
          {mounted ? streak : 0}
        </div>
      </div>

      {name && mounted && (
        <p className="mt-2 text-xs text-muted-foreground">
          Hey <span className="font-medium text-foreground/80">{name}</span> — keep your streak going.
        </p>
      )}
    </header>
  );
}
