// Contract between the audio engine and the UI. Everything that makes sound
// (Play rounds, lesson slides, layer mixer, ear challenges, SoundDeck, Rhythm
// Coach) plays a Pattern through the one SoundEngine, so layers stay in sync.

// '<folder>/<name>', matching assets/sounds/<folder>/<name>.wav
export type SampleId = string;

export type Track = {
  sample: SampleId;
  // step indices in [0, steps * bars)
  hits: number[];
  // 0..1, one value for every hit or one per hit
  vel?: number | number[];
  // name of the "How It Is Built" layer this track belongs to (exact lessons.json text)
  layer?: string;
};

export type Pattern = {
  id: string;
  bpm: number;
  // steps per bar: 16 (sixteenths) or 12 (bulería, 12/8 feels)
  steps: 12 | 16;
  bars?: number;
  // 0..0.5, delays every odd step by this fraction of a step
  swing?: number;
  tracks: Track[];
  // pitched notes: each note is a SampleId of a rendered pitch
  melody?: { step: number; note: SampleId; vel?: number; layer?: string }[];
};

export type StepEvent = { step: number; bar: number; at: number; stepMs: number; patternId: string };

export type PackId = 'westafrica' | 'caribbean' | 'southasia' | 'seasia' | 'mena';
