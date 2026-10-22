// SoundDeck instrument packs. 15 pads each (the UI adds Silence as the 16th),
// 8 keyboard notes in C major in the pack's melodic voice, and a demo groove
// written only with the pack's own pads so it loads straight into the grid.
import type { GlyphId, RegionKey } from '../data/types';
import type { PackId, Pattern, SampleId } from './types';
import { pattern, tr } from './notation';

export type Pad = { id: string; label: string; sample: SampleId; glyph: GlyphId };

export type Pack = {
  id: PackId;
  name: string;
  xp: number;
  region: RegionKey;
  pads: Pad[];
  keys: SampleId[];
  keysLabel: string;
  keysNote?: string;
  defaultBpm: number;
  demo: Pattern;
};

const KEYS = ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5'];
const keys = (prefix: string) => KEYS.map((k) => prefix + k);
const pad = (id: string, label: string, sample: SampleId, glyph: GlyphId): Pad => ({ id, label, sample, glyph });

const WA = 'westafrica/';
const CA = 'caribbean/';
const SA = 'southasia/';
const SE = 'seasia/';
const ME = 'mena/';

export const PACKS: Pack[] = [
  {
    id: 'westafrica',
    name: 'West Africa',
    xp: 0,
    region: 'africa',
    pads: [
      pad('djembe', 'Djembe', WA + 'djembe_tone', 'djembe'),
      pad('talkingdrum', 'Talking drum', WA + 'talkingdrum', 'talkingDrum'),
      pad('shaker', 'Shaker', WA + 'shaker', 'shaker'),
      pad('bell', 'Bell', WA + 'bell', 'bell'),
      pad('clap', 'Clap', WA + 'clap', 'clap'),
      pad('bassdrum', 'Bass drum', WA + 'bassdrum', 'surdo'),
      pad('clave', 'Clave', WA + 'clave', 'clave'),
      pad('hightone', 'High tone', WA + 'djembe_slap', 'djembe'),
      pad('lowtone', 'Low tone', WA + 'djembe_bass', 'djembe'),
      pad('rattle', 'Rattle', WA + 'rattle', 'shaker'),
      pad('logdrum', 'Log drum', WA + 'logdrum', 'cajon'),
      pad('balafon', 'Balafon', WA + 'balafon_g4', 'balafon'),
      pad('cowbell', 'Cowbell', WA + 'cowbell', 'bell'),
      pad('whistle', 'Whistle', WA + 'whistle', 'whistle'),
      pad('handclap', 'Hand clap', WA + 'handclap', 'clap'),
    ],
    keys: keys(WA + 'balafon_'),
    keysLabel: 'Balafon',
    defaultBpm: 108,
    // Kuku-style groove (see patterns.ts KUKU) on this pack's pads
    demo: pattern('deck-westafrica', 108, 16, [
      tr(WA + 'djembe_bass', 'X... .... X... ....'),
      tr(WA + 'djembe_tone', '..xx .... ..xx ....'),
      tr(WA + 'djembe_slap', '.... x.x. .... x.x.'),
      tr(WA + 'bassdrum', 'X..x ..x. .... x...'),
      tr(WA + 'bell', 'x.o. x.o. x.o. x.o.'),
      tr(WA + 'shaker', 'o.o. o.o. o.o. o.o.'),
    ]),
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    xp: 300,
    region: 'americas',
    pads: [
      pad('clave', 'Clave', CA + 'clave', 'clave'),
      pad('conga_open', 'Conga open', CA + 'conga_open', 'conga'),
      pad('conga_slap', 'Conga slap', CA + 'conga_slap', 'conga'),
      pad('tumba', 'Tumba', CA + 'tumba', 'conga'),
      pad('bongo_hi', 'Bongó high', CA + 'bongo_hi', 'bongo'),
      pad('bongo_lo', 'Bongó low', CA + 'bongo_lo', 'bongo'),
      pad('timbal', 'Timbal', CA + 'timbal', 'timbales'),
      pad('cascara', 'Cáscara', CA + 'cascara', 'timbales'),
      pad('cowbell', 'Cowbell', CA + 'cowbell', 'bell'),
      pad('guiro', 'Güiro', CA + 'guiro', 'guiro'),
      pad('maracas', 'Maracas', CA + 'maracas', 'shaker'),
      pad('steelpan', 'Steel pan', CA + 'pan_g4', 'steelPan'),
      pad('kick', 'Kick', CA + 'kick', 'drumMachine'),
      pad('snare', 'Snare', CA + 'snare', 'drumMachine'),
      pad('hihat', 'Hi-hat', CA + 'hihat', 'cymbals'),
    ],
    keys: keys(CA + 'pan_'),
    keysLabel: 'Steel pan',
    defaultBpm: 92,
    // son clave 3-2 with a conga tumbao and güiro (cut-time feel)
    demo: pattern('deck-caribbean', 92, 16, [
      tr(CA + 'clave', 'X..x ..x. ..X. x...'),
      tr(CA + 'conga_slap', '..x. .... ..x. ....'),
      tr(CA + 'conga_open', '.... ..x. .... ..x.'),
      tr(CA + 'tumba', '.... ...x .... ...x'),
      tr(CA + 'guiro', 'x... x... x... x...', undefined, 0.7),
      tr(CA + 'maracas', '..o. ..o. ..o. ..o.'),
    ]),
  },
  {
    id: 'southasia',
    name: 'South Asia',
    xp: 700,
    region: 'asia',
    pads: [
      pad('dha', 'Dha', SA + 'dha', 'tabla'),
      pad('dhin', 'Dhin', SA + 'dhin', 'tabla'),
      pad('na', 'Na', SA + 'na', 'tabla'),
      pad('tin', 'Tin', SA + 'tin', 'tabla'),
      pad('ge', 'Ge', SA + 'ge', 'tabla'),
      pad('ke', 'Ke', SA + 'ke', 'tabla'),
      pad('tun', 'Tun', SA + 'tun', 'tabla'),
      pad('te', 'Te', SA + 'te', 'tabla'),
      pad('ge_glide', 'Ge slide', SA + 'ge_glide', 'tabla'),
      pad('tanpura', 'Tanpura', SA + 'tanpura_sa', 'tanpura'),
      pad('sitar', 'Sitar', SA + 'sitar_c4', 'sitar'),
      pad('manjira', 'Manjira', SA + 'manjira', 'cymbals'),
      pad('ghungroo', 'Ghungroo', SA + 'ghungroo', 'shaker'),
      pad('dholak', 'Dholak', SA + 'dholak', 'kendang'),
      pad('dholak_hi', 'Dholak high', SA + 'dholak_hi', 'kendang'),
    ],
    keys: keys(SA + 'sitar_'),
    keysLabel: 'Sitar',
    defaultBpm: 60,
    // teental theka (see patterns.ts TEENTAL), one matra per step
    demo: pattern('deck-southasia', 60, 16, [
      tr(SA + 'dha', 'X..x x..x x... ...x'),
      tr(SA + 'dhin', '.xx. .xx. .... .xx.'),
      tr(SA + 'tin', '.... .... .xx. ....'),
      tr(SA + 'na', '.... .... ...x x...'),
      tr(SA + 'manjira', 'x... .... x... ....', undefined, 0.6),
    ]),
  },
  {
    id: 'seasia',
    name: 'Southeast Asia',
    xp: 1200,
    region: 'asia',
    pads: [
      pad('gong', 'Gong', SE + 'gong', 'gong'),
      pad('kempul', 'Kempul', SE + 'kempul', 'gong'),
      pad('kenong', 'Kenong', SE + 'kenong', 'gong'),
      pad('kethuk', 'Kethuk', SE + 'ketuk', 'gong'),
      pad('kendang_dhung', 'Kendang low', SE + 'kendang_dhung', 'kendang'),
      pad('kendang_tak', 'Kendang slap', SE + 'kendang_tak', 'kendang'),
      pad('kendang_tung', 'Kendang high', SE + 'kendang_tung', 'kendang'),
      pad('saron', 'Saron', SE + 'saron_5', 'saron'),
      pad('demung', 'Demung', SE + 'demung', 'saron'),
      pad('peking', 'Peking', SE + 'peking_1', 'saron'),
      pad('bonang', 'Bonang', SE + 'bonang', 'gong'),
      pad('cengceng', 'Ceng-ceng', SE + 'cengceng', 'cymbals'),
      pad('kecrek', 'Kecrek', SE + 'kecrek', 'cymbals'),
      pad('kajar', 'Kajar', SE + 'kajar', 'gong'),
      pad('gender', 'Gendèr', SE + 'gender_g4', 'saron'),
    ],
    keys: keys(SE + 'gender_'),
    keysLabel: 'Gendèr',
    keysNote: 'Gamelan sets have their own tunings (slendro and pelog). The keyboard plays the gendèr sound on a Western scale so it fits the other packs.',
    defaultBpm: 52,
    // lancaran gong cycle (see patterns.ts GAMELAN_CYCLE), one beat per step
    demo: pattern('deck-seasia', 52, 16, [
      tr(SE + 'ketuk', 'x.x. x.x. x.x. x.x.'),
      tr(SE + 'kenong', '...x ...x ...x ...x'),
      tr(SE + 'kempul', '.... .x.. .x.. .x..'),
      tr(SE + 'gong', '.... .... .... ...X'),
      tr(SE + 'kendang_tak', '..x. ..x. ..x. ....', undefined, 0.6),
      tr(SE + 'kendang_dhung', 'x... x... x... x.x.', undefined, 0.7),
    ]),
  },
  {
    id: 'mena',
    name: 'North Africa & Middle East',
    xp: 2000,
    region: 'mena',
    pads: [
      pad('oud', 'Oud', ME + 'oud_c4', 'oud'),
      pad('accordion', 'Accordion', ME + 'accordion_d4', 'accordion'),
      pad('bendir', 'Bendir', ME + 'bendir', 'frameDrum'),
      pad('dum', 'Darbuka dum', ME + 'darbuka_dum', 'darbuka'),
      pad('tek', 'Darbuka tek', ME + 'darbuka_tek', 'darbuka'),
      pad('ka', 'Darbuka ka', ME + 'darbuka_ka', 'darbuka'),
      pad('riq', 'Riq', ME + 'riq', 'frameDrum'),
      pad('qraqeb', 'Qraqeb', ME + 'qraqeb', 'qraqeb'),
      pad('guembri', 'Guembri', ME + 'guembri_a2', 'guembri'),
      pad('tar', 'Tar', ME + 'tar', 'frameDrum'),
      pad('zills', 'Zills', ME + 'zills', 'cymbals'),
      pad('gasba', 'Gasba', ME + 'gasba_a4', 'gasba'),
      pad('handclap', 'Hand clap', WA + 'handclap', 'clap'),
      pad('daf', 'Daf', ME + 'daf', 'frameDrum'),
      pad('tbel', 'Tbel', ME + 'tbel', 'surdo'),
    ],
    keys: keys(ME + 'oud_'),
    keysLabel: 'Oud',
    defaultBpm: 96,
    // maqsum (see patterns.ts MAQSUM)
    demo: pattern('deck-mena', 96, 16, [
      tr(ME + 'darbuka_dum', 'X... .... X... ....'),
      tr(ME + 'darbuka_tek', '..x. ..x. .... x...'),
      tr(ME + 'darbuka_ka', '.... g... ..g. ..g.'),
      tr(ME + 'riq', 'o.g. o.g. o.g. o.g.'),
    ]),
  },
];

export const getPack = (id: PackId) => PACKS.find((p) => p.id === id)!;

// every sample a pack needs (pads and keys)
export const packSamples = (p: Pack): SampleId[] => [...new Set([...p.pads.map((x) => x.sample), ...p.keys])];
