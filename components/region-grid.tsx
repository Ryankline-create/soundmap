"use client";

import { cn } from "@/lib/utils";
import { REGIONS, type RegionId } from "@/lib/regions";

type Props = {
  value: RegionId | null;
  onChange: (id: RegionId) => void;
  disabled?: boolean;
  highlight?: { correct?: RegionId; wrong?: RegionId } | null;
};

export function RegionGrid({ value, onChange, disabled, highlight }: Props) {
  return (
    <ul className="grid grid-cols-3 gap-1.5">
      {REGIONS.map((r) => {
        const selected = value === r.id;
        const isCorrect = highlight?.correct === r.id;
        const isWrong = highlight?.wrong === r.id;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => !disabled && onChange(r.id)}
              disabled={disabled}
              aria-pressed={selected}
              className={cn(
                "group flex h-[78px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border bg-card text-center transition-colors",
                "border-border text-foreground hover:border-foreground/30",
                selected && "border-foreground bg-foreground text-background",
                isCorrect && !selected && "border-emerald-500/70 bg-emerald-50",
                isWrong && !selected && "border-rose-400/70 bg-rose-50",
                disabled && "cursor-default"
              )}
            >
              <span className="text-2xl leading-none">{r.emoji}</span>
              <span
                className={cn(
                  "px-1 text-[11px] font-medium leading-tight",
                  selected ? "text-background" : "text-foreground/85"
                )}
              >
                {r.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
