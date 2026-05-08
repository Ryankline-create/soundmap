"use client";

import { useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AudioPlayerCard } from "@/components/audio-player-card";
import { RegionGrid } from "@/components/region-grid";
import { WorldMap } from "@/components/world-map";
import { ResultCard } from "@/components/result-card";
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
    <main className="space-y-7 px-5 pb-8 pt-5">
      <div ref={topRef} aria-hidden />

      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <h1 className="font-serif-display text-[28px] italic leading-none tracking-tight">
          Round <span className="not-italic font-sans tabular-nums">{roundIndex + 1}</span>
          <span className="text-muted-foreground/60"> / {ROUNDS.length}</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Find this song&apos;s home
        </p>
      </div>

      <AudioPlayerCard
        preset={round.audio}
        hint={round.hint}
        roundLabel="Listen carefully"
        plays={plays}
        onPlay={onPlay}
        locked={!!result}
      />

      {result && breakdown ? (
        <ResultCard result={result} breakdown={breakdown} onNext={nextRound} />
      ) : (
        <>
          <Step number="01" title="Choose a region">
            <p className="mb-3 text-[13px] text-muted-foreground">
              Where in the world is this music from?
            </p>
            <RegionGrid
              value={selectedRegion}
              onChange={setSelectedRegion}
              disabled={!!result}
              highlight={null}
            />
          </Step>

          <Step number="02" title="Pin it on the map">
            <p className="mb-3 text-[13px] text-muted-foreground">
              {pin
                ? "Tap again to move your pin."
                : selectedRegion
                ? `Glowing area = ${REGION_BY_ID[selectedRegion].label}. Tap your best guess.`
                : "Pick a region first, then tap the map."}
            </p>
            <WorldMap pin={pin} target={target} selectedRegion={selectedRegion} onPick={setPin} />
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal" />
                Music capitals
              </span>
              {pin ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-navy" />
                  {pin.lat.toFixed(1)}°, {pin.lng.toFixed(1)}°
                </span>
              ) : (
                <span>Tap anywhere · click again to move</span>
              )}
            </div>
          </Step>

          <Button
            onClick={onSubmit}
            variant="primary"
            disabled={!canSubmit}
            className="h-13 w-full rounded-xl py-4 text-base"
          >
            Submit guess
          </Button>
        </>
      )}

      {result && (
        <Step number="—" title="Reveal">
          <WorldMap pin={pin} target={target} onPick={() => undefined} disabled />
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            <span className="text-navy">●</span> your pin · <span className="text-teal">●</span> answer
          </p>
        </Step>
      )}
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3 border-b border-border pb-2">
        <span className="font-serif-display text-2xl italic leading-none text-foreground/60">
          {number}
        </span>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
