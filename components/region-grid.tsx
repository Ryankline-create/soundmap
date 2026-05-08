"use client";

import { Check } from "lucide-react";

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
    <ul className="grid grid-cols-3 gap-2">
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
                "group relative flex h-[78px] w-full flex-col items-center justify-center gap-1 rounded-2xl border bg-white/5 px-1 text-center transition-all",
                "border-white/10 text-foreground/90 hover:border-white/20 hover:bg-white/10",
                selected && "border-transparent bg-brand-gradient text-white shadow-md shadow-brand-purple/40",
                isCorrect && "ring-2 ring-emerald-400/80 ring-offset-2 ring-offset-background",
                isWrong && "ring-2 ring-rose-500/70 ring-offset-2 ring-offset-background",
                disabled && "cursor-default opacity-90"
              )}
            >
              <span className="text-2xl leading-none">{r.emoji}</span>
              <span className="text-[11px] font-medium leading-tight">
                {r.label}
              </span>
              {selected && (
                <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-white" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
