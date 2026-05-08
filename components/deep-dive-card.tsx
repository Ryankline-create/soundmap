"use client";

import { Bookmark, Headphones, Lightbulb, MapPin, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { InstrumentIcon } from "@/components/instrument-icon";
import { cn } from "@/lib/utils";
import type { DeepDive } from "@/lib/deep-dive";
import type { RoundResult } from "@/lib/storage";
import { REGION_BY_ID } from "@/lib/regions";

type Props = {
  meta: Pick<RoundResult, "songTitle" | "songStyle" | "city" | "country" | "region" | "instrument">;
  dive: DeepDive;
  source: "ai" | "fallback";
};

export function DeepDiveCard({ meta, dive, source }: Props) {
  const region = REGION_BY_ID[meta.region];

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <div className="bg-brand-gradient p-5 text-white">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/85">
            <Headphones className="h-3.5 w-3.5" />
            Song Deep Dive
            {source === "ai" ? (
              <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">AI</span>
            ) : (
              <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Curated</span>
            )}
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <InstrumentIcon instrument={meta.instrument} className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl leading-tight">{meta.songTitle}</h2>
              <p className="text-sm text-white/85">{meta.songStyle}</p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-white/80">
            <MapPin className="h-3 w-3" />
            {meta.city}, {meta.country} · {region.emoji} {region.label}
          </p>
        </div>
        <div className="space-y-4 p-5 text-[14px] leading-relaxed text-foreground/90">
          <p>{dive.region_summary}</p>
        </div>
      </Card>

      <Section title="Cultural context" Icon={Bookmark}>
        <p>{dive.cultural_context}</p>
      </Section>

      <Section title="History" Icon={Sparkles}>
        <p>{dive.history}</p>
      </Section>

      <Section title="Instruments">
        <ul className="space-y-2.5">
          {dive.instruments.map((it) => (
            <li key={it.name} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gradient" />
              <div>
                <span className="font-semibold text-foreground">{it.name}</span>
                <span className="text-foreground/75"> — {it.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Listen for next time" Icon={Lightbulb}>
        <ul className="space-y-2">
          {dive.listen_for.map((item, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-purple/15 text-[10px] font-bold text-brand-purple">
                {i + 1}
              </span>
              <span className="text-foreground/85">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Card className="bg-brand-gradient/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-purple">Did you know</p>
        <p className="mt-1 text-[14px] leading-relaxed text-foreground/90">{dive.fun_fact}</p>
      </Card>
    </div>
  );
}

function Section({
  title,
  Icon,
  children,
  className,
}: {
  title: string;
  Icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-brand-purple" />}
        {title}
      </h3>
      <div className="text-[14px] leading-relaxed text-foreground/85">{children}</div>
    </Card>
  );
}
