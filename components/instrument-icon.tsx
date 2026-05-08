import { cn } from "@/lib/utils";
import type { Instrument } from "@/lib/audio";

type Props = {
  instrument: Instrument;
  className?: string;
};

const SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<Instrument, React.ReactNode> = {
  gamelan: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <line x1="6.5" y1="7.5"  x2="14"   y2="7.5" />
      <line x1="6.5" y1="10.5" x2="16"   y2="10.5" />
      <line x1="6.5" y1="13.5" x2="17.5" y2="13.5" />
      <line x1="6.5" y1="16.5" x2="13"   y2="16.5" />
    </>
  ),
  kalimba: (
    <>
      <path d="M4.5 14 Q4.5 21 12 21 Q19.5 21 19.5 14 Z" />
      <line x1="7"  y1="14" x2="7"  y2="9" />
      <line x1="9.5"  y1="14" x2="9.5"  y2="6" />
      <line x1="12" y1="14" x2="12" y2="4" />
      <line x1="14.5" y1="14" x2="14.5" y2="6" />
      <line x1="17" y1="14" x2="17" y2="9" />
    </>
  ),
  sitar: (
    <>
      <ellipse cx="12" cy="17.5" rx="5" ry="4" />
      <path d="M12 13.5 L12 3.5" />
      <line x1="9" y1="3.5" x2="15" y2="3.5" />
      <circle cx="9.5"  cy="3" r="0.6" fill="currentColor" />
      <circle cx="14.5" cy="3" r="0.6" fill="currentColor" />
      <line x1="11" y1="13.5" x2="11" y2="3.5" strokeWidth="1" />
      <line x1="13" y1="13.5" x2="13" y2="3.5" strokeWidth="1" />
    </>
  ),
  koto: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1" />
      <line x1="3.5" y1="11" x2="20.5" y2="11" strokeWidth="0.9" />
      <line x1="3.5" y1="13" x2="20.5" y2="13" strokeWidth="0.9" />
      <line x1="9"  y1="8.5" x2="9"  y2="15.5" strokeWidth="1.2" />
      <line x1="14" y1="8.5" x2="14" y2="15.5" strokeWidth="1.2" />
    </>
  ),
  claves: (
    <>
      <rect x="2.5" y="6.5" width="19" height="3" rx="1.5" transform="rotate(12 12 8)" />
      <rect x="2.5" y="14.5" width="19" height="3" rx="1.5" transform="rotate(-12 12 16)" />
    </>
  ),
  nylonGuitar: (
    <>
      <path d="M12 19.5 C7 19.5 6 16 7 13.5 C6 11 7.5 8.5 12 8.5 C16.5 8.5 18 11 17 13.5 C18 16 17 19.5 12 19.5 Z" />
      <circle cx="12" cy="14.5" r="1.6" />
      <rect x="11.25" y="3" width="1.5" height="6" rx="0.5" />
      <line x1="9.5" y1="3" x2="14.5" y2="3" />
    </>
  ),
  saz: (
    <>
      <ellipse cx="12" cy="18.5" rx="3.5" ry="3" />
      <rect x="11.25" y="3.5" width="1.5" height="13" rx="0.5" />
      <line x1="9.5" y1="3.5" x2="14.5" y2="3.5" />
      <circle cx="10" cy="3" r="0.5" fill="currentColor" />
      <circle cx="14" cy="3" r="0.5" fill="currentColor" />
    </>
  ),
  fiddle: (
    <>
      <path d="M9.5 8 Q9.5 6 12 6 Q14.5 6 14.5 8 Q15.8 10 15.8 13 Q14.5 15 14.5 17 Q14.5 19.5 12 19.5 Q9.5 19.5 9.5 17 Q9.5 15 8.2 13 Q9.5 10 9.5 8 Z" />
      <line x1="12" y1="6" x2="12" y2="3" />
      <circle cx="12" cy="2.8" r="0.9" />
      <line x1="11" y1="6.5" x2="11" y2="19" strokeWidth="0.7" />
      <line x1="13" y1="6.5" x2="13" y2="19" strokeWidth="0.7" />
    </>
  ),
  jazzPiano: (
    <>
      <rect x="2.5" y="8" width="19" height="9" rx="0.8" />
      <line x1="6"  y1="8" x2="6"  y2="17" />
      <line x1="9.5"  y1="8" x2="9.5"  y2="17" />
      <line x1="14.5" y1="8" x2="14.5" y2="17" />
      <line x1="18"   y1="8" x2="18"   y2="17" />
      <rect x="4.5"  y="8" width="2" height="5" fill="currentColor" stroke="none" />
      <rect x="8.5"  y="8" width="2" height="5" fill="currentColor" stroke="none" />
      <rect x="13.5" y="8" width="2" height="5" fill="currentColor" stroke="none" />
      <rect x="17"   y="8" width="2" height="5" fill="currentColor" stroke="none" />
    </>
  ),
  didjeridu: (
    <>
      <path d="M3.5 20.5 L9 17 L21 4" strokeWidth="2.2" />
      <circle cx="3.5" cy="20.5" r="1.5" />
      <line x1="20" y1="3" x2="22" y2="5" strokeWidth="1.2" />
    </>
  ),
};

const LABELS: Record<Instrument, string> = {
  gamelan: "Gamelan",
  kalimba: "Kalimba / kora",
  sitar: "Sitar",
  koto: "Koto",
  claves: "Clave & tres",
  nylonGuitar: "Nylon guitar",
  saz: "Saz / bağlama",
  fiddle: "Fiddle",
  jazzPiano: "Jazz piano",
  didjeridu: "Didjeridu",
};

export function InstrumentIcon({ instrument, className }: Props) {
  return (
    <svg {...SVG_PROPS} className={cn("h-5 w-5", className)} aria-hidden>
      {ICONS[instrument]}
    </svg>
  );
}

export function instrumentLabel(instrument: Instrument) {
  return LABELS[instrument];
}
