"use client";

import { Headphones, MapPin } from "lucide-react";

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
    <article className="space-y-7">
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5" />
            Song Deep Dive
          </span>
          <span>{source === "ai" ? "AI · Claude" : "Curated"}</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center text-foreground">
            <InstrumentIcon instrument={meta.instrument} className="h-11 w-11" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif-display text-[34px] italic leading-[1.05] tracking-tight text-foreground">
              {meta.songTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{meta.songStyle}</p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-[13px] text-foreground/80">
          <MapPin className="h-3.5 w-3.5 text-teal" />
          {meta.city}, {meta.country}
          <span className="text-muted-foreground">· {region.emoji} {region.label}</span>
        </p>
      </header>

      <p className="font-serif-display text-[20px] italic leading-snug text-foreground">
        {dive.region_summary}
      </p>

      <Section eyebrow="01" title="Cultural context">
        <p>{dive.cultural_context}</p>
      </Section>

      <Section eyebrow="02" title="History">
        <p>{dive.history}</p>
      </Section>

      <Section eyebrow="03" title="Instruments">
        <ul className="space-y-3">
          {dive.instruments.map((it) => (
            <li key={it.name} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="font-serif-display text-base italic text-muted-foreground/80">
                ◦
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{it.name}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{it.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="04" title="Listen for next time">
        <ul className="space-y-2.5">
          {dive.listen_for.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-serif-display text-lg italic leading-none text-foreground/65">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-foreground/85">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <aside className="rounded-xl border border-border bg-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal">
          Did you know
        </p>
        <p className="mt-2 font-serif-display text-[18px] italic leading-snug text-foreground">
          {dive.fun_fact}
        </p>
      </aside>
    </article>
  );
}

function Section({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-baseline gap-3 border-b border-border pb-2">
        <span className="font-serif-display text-xl italic leading-none text-foreground/55">
          {eyebrow}
        </span>
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground">
          {title}
        </h2>
      </div>
      <div className="text-[14px] leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}
