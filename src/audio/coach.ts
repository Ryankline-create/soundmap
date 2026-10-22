// Rhythm Coach: ten patterns to play along with. `pattern` is the backing the
// engine plays; `lanes` are the parts the student taps (they are not in the
// backing). Every coach pattern is one bar, so it loads into the 16-step grid
// (12-step bars don't appear here).
import type { PackId, Pattern, SampleId } from './types';
import { grid, notes, pattern, tr } from './notation';
import { GAMELAN_CYCLE, SABAR_BREAK, SON_TUMBAO } from './patterns';

export type Lane = { sample: SampleId; label: string; hits: number[] };

export type CoachPattern = {
  id: string;
  name: string;
  origin: string;
  level: 1 | 2 | 3;
  bpm: number;
  note: [string, string];
  lesson: string;
  lessonLabel: string;
  pack: PackId;
  pattern: Pattern;
  lanes: Lane[];
};

const lane = (sample: SampleId, label: string, s: string): Lane => ({ sample, label, hits: grid(s).hits });

const WA = 'westafrica/';
const CA = 'caribbean/';
const SA = 'southasia/';
const SE = 'seasia/';
const ME = 'mena/';
const IN = 'instruments/';

export const COACH: CoachPattern[] = [
  {
    id: 'son-clave',
    name: 'Son clave',
    origin: 'Cuba',
    level: 1,
    bpm: 88,
    note: [
      'The clave is the key of Cuban son: three strokes, then two.',
      'Everything else in the band fits around it, so the clave part never changes.',
    ],
    lesson: 'salsa',
    lessonLabel: 'From the lesson: Salsa: Made in New York',
    pack: 'caribbean',
    pattern: { ...SON_TUMBAO, id: 'coach-son-clave', bpm: 88 },
    lanes: [lane(CA + 'clave', 'Clave', 'X..x ..x. ..X. x...')],
  },
  {
    id: 'one-drop',
    name: 'Reggae one drop',
    origin: 'Jamaica',
    level: 1,
    bpm: 76,
    note: [
      'The one drop is a reggae drum beat from Jamaica.',
      'Beat one is left empty and the kick drops on beat three, so the groove sits back.',
    ],
    lesson: 'reggaeton',
    lessonLabel: 'Related lesson: Reggaeton: One Beat Goes Global',
    pack: 'caribbean',
    pattern: pattern('coach-one-drop', 76, 16, [
      tr(CA + 'rim', '.... .... X... ....'),
      tr(IN + 'guitar_chk_hi', '.... x... .... x...', undefined, 0.7),
    ]),
    lanes: [
      lane(CA + 'hihat', 'Hi-hat', 'x.x. x.x. x.x. x.x.'),
      lane(CA + 'kick', 'Kick', '.... .... X... ....'),
    ],
  },
  {
    id: 'gamelan-cycle',
    name: 'Gamelan gong cycle',
    origin: 'Java, Indonesia',
    level: 1,
    bpm: 52,
    note: [
      'In a gamelan the gongs mark a cycle, like the hands of a clock.',
      'Kenong every four beats, kempul in between, and the big gong on the last beat, where the cycle starts again.',
    ],
    lesson: 'gamelan',
    lessonLabel: 'From the lesson: Gamelan: One Melody, Many Hands',
    pack: 'seasia',
    pattern: { ...GAMELAN_CYCLE, id: 'coach-gamelan', tracks: GAMELAN_CYCLE.tracks.filter((t) => t.sample === SE + 'ketuk') },
    lanes: [
      lane(SE + 'kenong', 'Kenong', '...x ...x ...x ...x'),
      lane(SE + 'kempul', 'Kempul', '.... .x.. .x.. .x..'),
      lane(SE + 'gong', 'Gong', '.... .... .... ...X'),
    ],
  },
  {
    id: 'maqsum',
    name: 'Maqsum',
    origin: 'Egypt and the Arab world',
    level: 1,
    bpm: 96,
    note: [
      'Maqsum is one of the most common rhythms in Arabic music.',
      'Say it as you play: dum tek, tek dum, tek. Dum is the low centre stroke, tek the sharp edge.',
    ],
    lesson: 'oud-maqam',
    lessonLabel: 'From the lesson: The Oud and Arabic Maqam',
    pack: 'mena',
    pattern: pattern('coach-maqsum', 96, 16, [
      tr(ME + 'riq', 'o.g. o.g. o.g. o.g.'),
      tr(ME + 'darbuka_ka', '.... g... ..g. ..g.'),
    ]),
    lanes: [
      lane(ME + 'darbuka_dum', 'Dum', 'X... .... X... ....'),
      lane(ME + 'darbuka_tek', 'Tek', '..x. ..x. .... x...'),
    ],
  },
  {
    id: 'kuku',
    name: 'Kuku',
    origin: 'Guinea',
    level: 2,
    bpm: 104,
    note: [
      'Kuku is a dance rhythm from the forest region of south-eastern Guinea.',
      'Each half bar goes bass, tone, tone, slap, slap: low, then middle, then high.',
    ],
    lesson: 'kora',
    lessonLabel: 'Related lesson: Kora and the Griots',
    pack: 'westafrica',
    pattern: pattern('coach-kuku', 104, 16, [
      tr(WA + 'bassdrum', 'X..x ..x. .... x...'),
      tr(WA + 'bell', 'x.o. x.o. x.o. x.o.'),
      tr(WA + 'shaker', 'oggg oggg oggg oggg', undefined, 0.8),
    ]),
    lanes: [
      lane(WA + 'djembe_bass', 'Low tone', 'X... .... X... ....'),
      lane(WA + 'djembe_tone', 'Djembe', '..xx .... ..xx ....'),
      lane(WA + 'djembe_slap', 'High tone', '.... x.x. .... x.x.'),
    ],
  },
  {
    id: 'rumba-clave',
    name: 'Rumba clave',
    origin: 'Cuba',
    level: 2,
    bpm: 88,
    note: [
      'Rumba clave is the clave of Cuban rumba.',
      'It matches son clave except the third stroke, which comes one step later and pulls against the beat.',
    ],
    lesson: 'salsa',
    lessonLabel: 'Related lesson: Salsa: Made in New York',
    pack: 'caribbean',
    pattern: pattern('coach-rumba-clave', 88, 16, [
      tr(CA + 'tumba', 'x... ..x. x... ..x.'),
      tr(CA + 'conga_open', '.... x... .... x..x'),
      tr(CA + 'conga_slap', '..x. .... ..x. ....'),
      tr(CA + 'maracas', 'o.o. o.o. o.o. o.o.', undefined, 0.7),
    ]),
    lanes: [lane(CA + 'clave', 'Clave', 'X..x ...x ..X. x...')],
  },
  {
    id: 'dembow',
    name: 'Dembow',
    origin: 'Jamaica, Panama, Puerto Rico',
    level: 2,
    bpm: 92,
    note: [
      'The dembow came from Jamaican dancehall, through Panama, to reggaeton in Puerto Rico.',
      'Kick on every beat; the snare answers just before and just after the middle of each half bar.',
    ],
    lesson: 'reggaeton',
    lessonLabel: 'From the lesson: Reggaeton: One Beat Goes Global',
    pack: 'caribbean',
    pattern: pattern('coach-dembow', 92, 16, [tr(CA + 'hihat', 'o.o. o.o. o.o. o.o.')], {
      melody: notes(IN + 'sub_', 'a1 . . . . . . . f1 . . . . . g1 .'),
    }),
    lanes: [
      lane(CA + 'kick', 'Kick', 'X... x... X... x...'),
      lane(CA + 'snare', 'Snare', '...x ..x. ...x ..x.'),
    ],
  },
  {
    id: 'samba',
    name: 'Samba batucada',
    origin: 'Rio de Janeiro, Brazil',
    level: 3,
    bpm: 96,
    note: [
      'In a Rio batucada the lowest surdo marks beat two, the strong beat of samba.',
      'The tamborim plays the teleco-teco figure on top. Start with the surdo, then add it.',
    ],
    lesson: 'samba',
    lessonLabel: 'From the lesson: Samba: Building a Batucada',
    pack: 'caribbean',
    pattern: pattern('coach-samba', 96, 16, [
      tr(IN + 'surdo2', 'X... .... X... ....'),
      tr(IN + 'caixa', 'xgox xgox xgox xgox', undefined, 0.7),
      tr(IN + 'pandeiro_jingle', '.o.o .o.o .o.o .o.o', undefined, 0.8),
    ]),
    lanes: [
      lane(IN + 'surdo1', 'Surdo', '.... X... .... X...'),
      lane(IN + 'tamborim', 'Tamborim', 'x.xx .x.x .xx. x.x.'),
    ],
  },
  {
    id: 'sabar',
    name: 'Sabar break',
    origin: 'Senegal',
    level: 3,
    bpm: 96,
    note: [
      'Sabar drummers in Senegal play quick, speech-like phrases with a stick in one hand and the bare hand on the drum.',
      'This break is our simplified version on djembe and talking drum. Copy it like a sentence, then land the last note.',
    ],
    lesson: 'kora',
    lessonLabel: 'Related lesson: Kora and the Griots',
    pack: 'westafrica',
    pattern: { ...SABAR_BREAK, id: 'coach-sabar', bpm: 96, tracks: SABAR_BREAK.tracks.filter((t) => t.sample === WA + 'bassdrum') },
    lanes: [
      lane(WA + 'djembe_slap', 'High tone', 'X.xx .x.. x.xx .X..'),
      lane(WA + 'djembe_bass', 'Low tone', '.... x..x .... ..x.'),
      lane(WA + 'talkingdrum', 'Talking drum', '.... .... .... ...x'),
    ],
  },
  {
    id: 'teental',
    name: 'Teental',
    origin: 'North India',
    level: 3,
    bpm: 40,
    note: [
      'Teental is a 16-beat cycle in Hindustani music: four groups of four.',
      'Beat 1 (sam) is the strongest. Beat 9 starts the khali, the "empty" part where the bass drum goes quiet, so you always know where you are.',
    ],
    lesson: 'raga',
    lessonLabel: 'From the lesson: Hindustani Raga',
    pack: 'southasia',
    pattern: pattern('coach-teental', 40, 16, [
      tr(SA + 'tanpura_pa', 'x... .... .... ....', undefined, 0.6),
      tr(SA + 'tanpura_sa', '.... x... x... ....', undefined, 0.6),
      tr(SA + 'tanpura_sa_low', '.... .... .... x...', undefined, 0.6),
    ]),
    lanes: [
      lane(SA + 'dha', 'Dha', 'X..x x..x x... ...x'),
      lane(SA + 'dhin', 'Dhin', '.xx. .xx. .... .xx.'),
      lane(SA + 'tin', 'Tin · Ta', '.... .... .xxx x...'),
    ],
  },
];

export const getCoach = (id: string) => COACH.find((c) => c.id === id);
