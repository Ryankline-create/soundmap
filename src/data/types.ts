// Shared content types. Generated files (lessons.ts, world.ts) and hand-written
// content (quizzes, flashcards, stories, trending) all conform to these.

export type RegionKey = 'americas' | 'africa' | 'asia' | 'mena' | 'europe';

export type GlyphId =
  | 'djembe' | 'talkingDrum' | 'shaker' | 'bell' | 'clave' | 'conga' | 'guiro' | 'kora'
  | 'balafon' | 'mbira' | 'gong' | 'kendang' | 'tabla' | 'sitar' | 'tanpura' | 'oud'
  | 'frameDrum' | 'accordion' | 'trumpet' | 'fiddle' | 'taiko' | 'yidaki' | 'guitar'
  | 'steelPan' | 'cuica' | 'surdo' | 'uilleannPipes' | 'guembri' | 'gasba'
  | 'portugueseGuitar' | 'cajon' | 'saron' | 'piano' | 'clapsticks' | 'qraqeb'
  | 'drumMachine' | 'saxophone' | 'whistle' | 'cymbals' | 'darbuka' | 'clap' | 'timbales'
  | 'bongo';

export type Place = { name: string; lat: number; lng: number };

export type SlideKind =
  | 'Listen First'
  | 'What Did You Notice?'
  | 'The Instrument'
  | 'How It Is Built'
  | 'Ear Challenge'
  | 'Where It Travelled'
  | 'People And Places'
  | 'Connections';

export type Slide = {
  kind: SlideKind;
  title: string;
  body: string;
  audioDemo?: string;
  clip?: string;
  options?: string[];
  detail?: string;
  layers?: string[];
  note?: string;
  question?: string;
  choices?: string[];
  person?: { name: string; role: string; bio: string };
  connections?: { lesson: string; slug: string; place: string; why: string }[];
};

export type Lesson = {
  slug: string;
  index: number;
  region: RegionKey;
  regionLabel: string;
  title: string;
  shortTitle: string;
  place: string;
  era: string;
  summary: string;
  pin: Place;
  stamp: string;
  stampShape: 'circle' | 'rect' | 'postmark';
  country: string;
  glyphs: GlyphId[];
  instrument: { glyph: GlyphId; name: string; parts: [string, string, string] };
  route: [Place, Place][];
  slides: Slide[];
};

// Quizzes: 6 questions each. "audio" options play the listed lessons' Listen
// First loops; "map" asks the player to tap the right world region.
export type QuizQuestion =
  | { kind: 'text'; prompt: string; options: string[]; answer: number; explain: string }
  | { kind: 'audio'; prompt: string; options: { label: string; slug: string }[]; answer: number; explain: string }
  | { kind: 'map'; prompt: string; answer: RegionKey; explain: string };

export type Quiz = { id: string; title: string; lesson?: string; questions: QuizQuestion[] };

export type Flashcard = { id: string; lesson: string; front: string; back: string };

// "Explain it back": ~120-word story; feedback checks which key ideas the
// student's own words mention. A keyword matches as a lowercase substring.
export type ExplainStory = {
  id: string;
  lesson: string;
  title: string;
  text: string;
  ideas: { label: string; keywords: string[] }[];
};

export type TrendingTopic = 'instruments' | 'rhythm' | 'history' | 'people';

export type TrendingStory = {
  id: string;
  title: string;
  dek: string;
  region: RegionKey;
  topic: TrendingTopic;
  glyph: GlyphId;
  lesson?: string;
  body: string[];
  significance: string;
  history: string;
  minutes: number;
};
