"use client";

import { useMemo, useRef, useState } from "react";
import { Globe2, MapPin, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AudioPlayerCard } from "@/components/audio-player-card";
import { RegionGrid } from "@/components/region-grid";
import { WorldMap } from "@/components/world-map";
import { ResultCard } from "@/components/result-card";
import { cn } from "@/lib/utils";
import { ROUNDS } from "@/lib/rounds";
import { REGION_BY_ID, type RegionId } from "@/lib/regions";
import { haversineKm, scoreRound, type ScoreBreakdown } from "@/lib/scoring";
import { appendResult, type RoundResult } from "@/lib/storage";

export default function PlayPage() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [plays, setPlays] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const round = ROUNDS[roundIndex % ROUNDS.length];

  const canSubmit = !!selectedRegion && !!pin && !result;

  function onPlay() {
    setPlays((p) => Math.min(3, p + 1));
  }

  function onSubmit() {
    if (!selectedRegion || !pin) return;
    const dist = haversineKm(pin, { lat: round.lat, lng: round.lng });
    const regionCorrect = selectedRegion === round.region;
    const score = scoreRound({ regionCorrect, distanceKm: dist, plays });
    const r: RoundResult = {
      roundId: round.id,
      city: round.city,
      country: round.country,
      region: round.region,
      hint: round.hint,
      songTitle: round.song.title,
      songStyle: round.song.style,
      instrument: round.audio.instrument,
      guess: { region: selectedRegion, lat: pin.lat, lng: pin.lng, plays },
      regionCorrect,
      distanceKm: dist,
      xpEarned: score.totalXp,
      playedAt: new Date().toISOString(),
    };
    appendResult(r);
    window.dispatchEvent(new Event("soundmap:state"));
    setBreakdown(score);
    setResult(r);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function nextRound() {
    setRoundIndex((i) => (i + 1) % ROUNDS.length);
    setSelectedRegion(null);
    setPin(null);
    setPlays(0);
    setResult(null);
    setBreakdown(null);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const target = useMemo(
    () => (result ? { lat: round.lat, lng: round.lng } : null),
    [result, round]
  );

  return (
    <main className="space-y-4 px-4 pb-6 pt-2">
      <div ref={topRef} aria-hidden />

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-brand-purple" />
          <h1 className="font-display text-base font-semibold tracking-tight">
            Round {roundIndex + 1} <span className="text-muted-foreground">of {ROUNDS.length}</span>
          </h1>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Find this song&apos;s home
        </p>
      </div>

      <AudioPlayerCard
        preset={round.audio}
        hint={round.hint}
        roundLabel={`Listen carefully`}
        plays={plays}
        onPlay={onPlay}
        locked={!!result}
      />

      {result && breakdown ? (
        <ResultCard result={result} breakdown={breakdown} onNext={nextRound} />
      ) : (
        <>
          <Section
            stepNumber={1}
            title="Choose a region"
            subtitle="Where in the world is this music from?"
          >
            <RegionGrid
              value={selectedRegion}
              onChange={setSelectedRegion}
              disabled={!!result}
              highlight={null}
            />
          </Section>

          <Section
            stepNumber={2}
            title="Pin it on the map"
            subtitle={
              pin
                ? "Tap again to move your pin."
                : selectedRegion
                ? `Glowing area = ${REGION_BY_ID[selectedRegion].label}. Tap your best guess.`
                : "Pick a region above, then tap the map."
            }
          >
            <WorldMap pin={pin} target={target} selectedRegion={selectedRegion} onPick={setPin} />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-purple" />
                Music capitals
              </span>
              {pin ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-brand-coral" />
                  {pin.lat.toFixed(1)}°, {pin.lng.toFixed(1)}°
                </span>
              ) : (
                <span>Tap anywhere · click again to move</span>
              )}
            </div>
          </Section>

          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            size="lg"
            className="h-14 w-full text-base"
          >
            <Target className="h-5 w-5" />
            Submit guess
          </Button>
        </>
      )}

      {result && (
        <Section stepNumber={null} title="Reveal" subtitle="Your guess vs. the answer">
          <WorldMap pin={pin} target={target} onPick={() => undefined} disabled />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            <span className="text-brand-coral">●</span> your pin · <span className="text-brand-purple">●</span> answer
          </p>
        </Section>
      )}
    </main>
  );
}

function Section({
  stepNumber,
  title,
  subtitle,
  children,
}: {
  stepNumber: number | null;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2.5">
        {stepNumber != null && (
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white")}>
            {stepNumber}
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}
