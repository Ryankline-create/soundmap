"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";
import type { RegionId } from "@/lib/regions";

type LatLng = { lat: number; lng: number };

type Props = {
  pin: LatLng | null;
  target: LatLng | null;
  selectedRegion?: RegionId | null;
  onPick: (p: LatLng) => void;
  disabled?: boolean;
  className?: string;
};

const VW = 360;
const VH = 180;

const lngToX = (lng: number) => lng + 180;
const latToY = (lat: number) => 90 - lat;

const REGION_CENTER: Record<RegionId, [number, number]> = {
  "west-africa":    [0,    8],
  "east-africa":    [37,   0],
  "north-america":  [-100, 40],
  "south-america":  [-58, -15],
  "caribbean":      [-75,  18],
  "europe":         [12,   52],
  "middle-east":    [42,   32],
  "south-asia":     [78,   22],
  "southeast-asia": [113,  0],
  "east-asia":      [128,  35],
  "central-asia":   [70,   42],
  "oceania":        [134, -25],
};

const MUSIC_CITIES: { name: string; lng: number; lat: number; anchor?: "start" | "middle" | "end"; dy?: number; dx?: number }[] = [
  { name: "London",      lng: -0.1,   lat: 51.5,  anchor: "start",  dy: -3.5, dx: 2 },
  { name: "New Orleans", lng: -90.1,  lat: 29.95, anchor: "end",    dy:  4,   dx: -2.5 },
  { name: "Havana",      lng: -82.4,  lat: 23.1,  anchor: "start",  dy: -3,   dx: 2.5 },
  { name: "Rio",         lng: -43.2,  lat: -22.9, anchor: "start",  dy:  4,   dx: 2.5 },
  { name: "Lagos",       lng: 3.4,    lat: 6.5,   anchor: "start",  dy:  4,   dx: 2.5 },
  { name: "Nairobi",     lng: 36.8,   lat: -1.3,  anchor: "start",  dy:  4,   dx: 2.5 },
  { name: "Istanbul",    lng: 29.0,   lat: 41.0,  anchor: "middle", dy: -3 },
  { name: "Mumbai",      lng: 72.9,   lat: 19.1,  anchor: "end",    dy:  4,   dx: -2.5 },
  { name: "Bali",        lng: 115.2,  lat: -8.5,  anchor: "start",  dy:  4,   dx: 2.5 },
  { name: "Tokyo",       lng: 139.7,  lat: 35.7,  anchor: "start",  dy: -3,   dx: 2.5 },
  { name: "Sydney",      lng: 151.2,  lat: -33.9, anchor: "end",    dy:  4,   dx: -2.5 },
];

// Continent silhouettes — stylized blobs in equirectangular space (viewBox 360 x 180).
// Drafted by hand, recognizable but not survey-grade.
const NORTH_AMERICA =
  "M 64 65 Q 50 56 50 42 Q 38 36 22 38 Q 18 26 26 22 Q 38 16 52 16 Q 70 14 90 14 Q 108 14 122 26 Q 124 35 116 42 Q 109 53 105 62 Q 102 70 96 72 Q 88 73 84 70 Q 78 75 70 73 Q 65 70 64 65 Z";
const GREENLAND =
  "M 132 14 Q 144 11 153 16 Q 158 24 152 32 Q 142 33 134 30 Q 128 22 132 14 Z";
const SOUTH_AMERICA =
  "M 105 84 Q 118 80 132 87 Q 145 96 145 108 Q 146 120 138 132 Q 130 144 118 148 Q 110 142 110 135 Q 106 120 110 110 Q 104 102 104 95 Q 100 88 105 84 Z";
const EURASIA =
  "M 170 52 Q 174 40 178 32 Q 188 24 200 22 Q 222 16 246 14 Q 274 12 302 16 Q 326 20 348 26 Q 348 34 340 38 Q 332 44 318 48 Q 318 56 308 60 Q 308 68 296 72 Q 290 78 280 82 Q 272 80 262 78 Q 254 70 246 68 Q 240 76 232 78 Q 226 78 222 75 Q 217 67 213 60 Q 208 56 200 54 Q 188 56 178 56 Q 172 56 170 52 Z";
const ARABIA =
  "M 215 64 Q 222 62 230 70 Q 236 78 232 86 Q 224 88 218 84 Q 212 76 215 64 Z";
const INDIA =
  "M 250 70 Q 258 70 262 78 Q 262 86 256 88 Q 252 84 250 78 Q 248 72 250 70 Z";
const AFRICA =
  "M 165 62 Q 178 56 196 56 Q 210 56 218 60 Q 226 70 224 78 Q 232 88 228 100 Q 222 116 212 124 Q 202 128 196 124 Q 188 116 192 100 Q 184 92 184 84 Q 176 78 166 74 Q 160 68 165 62 Z";
const MADAGASCAR =
  "M 222 108 Q 226 108 226 116 Q 224 122 220 119 Q 218 113 222 108 Z";
const SE_ASIA_ISLANDS =
  "M 282 86 Q 290 84 298 88 Q 302 94 296 96 Q 288 96 282 92 Q 280 88 282 86 Z M 304 92 Q 310 90 314 94 Q 314 100 308 100 Q 302 98 304 92 Z";
const JAPAN =
  "M 312 52 Q 318 48 322 54 Q 320 62 314 60 Q 310 58 312 52 Z";
const PHILIPPINES =
  "M 302 80 Q 306 78 308 82 Q 308 86 304 86 Q 300 84 302 80 Z";
const NEW_GUINEA =
  "M 312 96 Q 322 94 332 98 Q 332 104 322 104 Q 314 102 312 96 Z";
const AUSTRALIA =
  "M 296 110 Q 308 106 322 108 Q 336 110 340 118 Q 340 126 334 128 Q 320 132 308 130 Q 296 128 290 122 Q 290 114 296 110 Z";
const NEW_ZEALAND =
  "M 350 130 Q 354 128 354 134 Q 354 140 350 140 Q 348 138 348 134 Q 348 130 350 130 Z M 352 142 Q 356 142 356 146 Q 354 148 352 146 Q 350 144 352 142 Z";

const CONTINENT_LABELS: { text: string; x: number; y: number; size?: number; letterSpacing?: number }[] = [
  { text: "NORTH AMERICA", x: 73, y: 43, size: 5, letterSpacing: 1.2 },
  { text: "SOUTH AMERICA", x: 122, y: 116, size: 4.6, letterSpacing: 1.1 },
  { text: "EUROPE",        x: 195, y: 36, size: 4.6, letterSpacing: 1.1 },
  { text: "AFRICA",        x: 197, y: 92, size: 5.2, letterSpacing: 1.4 },
  { text: "RUSSIA",        x: 270, y: 28, size: 5,   letterSpacing: 1.3 },
  { text: "CENTRAL ASIA",  x: 264, y: 46, size: 4.4, letterSpacing: 1.0 },
  { text: "MIDDLE EAST",   x: 224, y: 64, size: 4.0, letterSpacing: 0.9 },
  { text: "SOUTH ASIA",    x: 252, y: 76, size: 3.9, letterSpacing: 0.9 },
  { text: "EAST ASIA",     x: 296, y: 56, size: 4.4, letterSpacing: 1.0 },
  { text: "SE ASIA",       x: 286, y: 90, size: 3.6, letterSpacing: 0.8 },
  { text: "AUSTRALIA",     x: 314, y: 121, size: 4.6, letterSpacing: 1.1 },
];

const OCEAN_LABELS: { text: string; x: number; y: number; size?: number; italic?: boolean }[] = [
  { text: "PACIFIC OCEAN",  x: 22,  y: 100, size: 4 },
  { text: "ATLANTIC OCEAN", x: 148, y: 76,  size: 3.8 },
  { text: "SOUTH ATLANTIC", x: 150, y: 132, size: 3.4 },
  { text: "INDIAN OCEAN",   x: 252, y: 118, size: 3.8 },
  { text: "PACIFIC OCEAN",  x: 340, y: 100, size: 4 },
];

export function WorldMap({ pin, target, selectedRegion, onPick, disabled, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const lng = px * 360 - 180;
    const lat = 90 - py * 180;
    onPick({ lat, lng });
  }

  const regionGlow = !pin && selectedRegion ? REGION_CENTER[selectedRegion] : null;

  const continentFill = "url(#landFill)";
  const continentStroke = "hsl(var(--brand-purple))";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      onClick={handleClick}
      role="img"
      aria-label="World map. Tap to place a pin."
      className={cn(
        "h-auto w-full select-none rounded-2xl bg-[#070C1C] ring-1 ring-white/10",
        !disabled && "cursor-crosshair",
        className
      )}
    >
      <defs>
        <radialGradient id="ocean" cx="50%" cy="55%" r="80%">
          <stop offset="0%"   stopColor="#152144" />
          <stop offset="100%" stopColor="#050917" />
        </radialGradient>
        <linearGradient id="landFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="hsl(220 28% 32%)" />
          <stop offset="100%" stopColor="hsl(232 32% 18%)" />
        </linearGradient>
        <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="hsl(var(--brand-purple))" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="hsl(var(--brand-purple))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--brand-purple))" stopOpacity="0" />
        </radialGradient>
        <filter id="landGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={VW} height={VH} fill="url(#ocean)" />

      {/* Graticule */}
      <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.4">
        {[-60, -30, 30, 60].map((lat) => (
          <line key={`lat${lat}`} x1="0" y1={latToY(lat)} x2={VW} y2={latToY(lat)} />
        ))}
        {[-150, -120, -90, -60, -30, 30, 60, 90, 120, 150].map((lng) => (
          <line key={`lng${lng}`} x1={lngToX(lng)} y1="0" x2={lngToX(lng)} y2={VH} />
        ))}
      </g>

      {/* Equator */}
      <line x1="2" y1={VH / 2} x2={VW - 2} y2={VH / 2} stroke="hsl(var(--brand-purple))" strokeOpacity="0.35" strokeDasharray="3 3" strokeWidth="0.5" />
      <text x="4" y={VH / 2 - 1.2} fontSize="3.6" fill="hsl(var(--brand-purple))" fillOpacity="0.7" letterSpacing={0.6}>EQUATOR</text>

      {/* Ocean labels */}
      <g fill="hsl(220 30% 70%)" fillOpacity="0.32" fontSize="3.8" fontStyle="italic" letterSpacing={0.4} textAnchor="middle">
        {OCEAN_LABELS.map((o, i) => (
          <text key={i} x={o.x} y={o.y} fontSize={o.size}>{o.text}</text>
        ))}
      </g>

      {/* Continents */}
      <g fill={continentFill} stroke={continentStroke} strokeOpacity="0.22" strokeWidth="0.45" filter="url(#landGlow)">
        <path d={NORTH_AMERICA} />
        <path d={GREENLAND} />
        <path d={SOUTH_AMERICA} />
        <path d={EURASIA} />
        <path d={ARABIA} />
        <path d={INDIA} />
        <path d={AFRICA} />
        <path d={MADAGASCAR} />
        <path d={SE_ASIA_ISLANDS} />
        <path d={JAPAN} />
        <path d={PHILIPPINES} />
        <path d={NEW_GUINEA} />
        <path d={AUSTRALIA} />
        <path d={NEW_ZEALAND} />
      </g>

      {/* Continent labels */}
      <g fill="white" fillOpacity="0.22" fontWeight={600} textAnchor="middle" style={{ pointerEvents: "none" }}>
        {CONTINENT_LABELS.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fontSize={l.size ?? 4.5}
            letterSpacing={l.letterSpacing ?? 1}
          >
            {l.text}
          </text>
        ))}
      </g>

      {/* Region pre-highlight */}
      {regionGlow && (
        <circle cx={lngToX(regionGlow[0])} cy={latToY(regionGlow[1])} r="26" fill="url(#regionGlow)">
          <animate attributeName="r" values="22;30;22" dur="2.6s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Music city pulses */}
      <g style={{ pointerEvents: "none" }}>
        {MUSIC_CITIES.map((c) => {
          const x = lngToX(c.lng);
          const y = latToY(c.lat);
          return (
            <g key={c.name}>
              <circle cx={x} cy={y} r="3.6" fill="hsl(var(--brand-purple))" fillOpacity="0.16">
                <animate attributeName="r" values="3;5.6;3" dur="3.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0.05;0.55" dur="3.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="1.4" fill="hsl(var(--brand-purple))" stroke="white" strokeOpacity="0.85" strokeWidth="0.4" />
              <text
                x={x + (c.dx ?? 0)}
                y={y + (c.dy ?? 4)}
                fontSize="3.8"
                fontWeight={600}
                textAnchor={c.anchor ?? "middle"}
                fill="hsl(220 25% 88%)"
                fillOpacity="0.85"
                style={{ paintOrder: "stroke", letterSpacing: 0.2 }}
                stroke="#070C1C"
                strokeWidth="0.9"
              >
                {c.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* Distance line */}
      {pin && target && (
        <line
          x1={lngToX(pin.lng)}
          y1={latToY(pin.lat)}
          x2={lngToX(target.lng)}
          y2={latToY(target.lat)}
          stroke="hsl(var(--brand-coral))"
          strokeOpacity="0.9"
          strokeWidth="1.0"
          strokeDasharray="3 2"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.4s" repeatCount="indefinite" />
        </line>
      )}

      {/* User pin */}
      {pin && (
        <g transform={`translate(${lngToX(pin.lng)} ${latToY(pin.lat)})`}>
          <circle r="6.5" fill="hsl(var(--brand-coral))" fillOpacity="0.22" />
          <circle r="2.8" fill="hsl(var(--brand-coral))" stroke="white" strokeWidth="0.7" />
        </g>
      )}

      {/* Target pin */}
      {target && (
        <g transform={`translate(${lngToX(target.lng)} ${latToY(target.lat)})`}>
          <circle r="9" fill="hsl(var(--brand-purple))" fillOpacity="0.25">
            <animate attributeName="r" values="6;11;6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="3.4" fill="hsl(var(--brand-purple))" stroke="white" strokeWidth="0.8" />
        </g>
      )}
    </svg>
  );
}
