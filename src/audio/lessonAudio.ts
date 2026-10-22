// What each lesson plays. Every sound follows the slide's `audioDemo` text in
// docs/content/lessons.json and is synthesized by scripts/synth.
//   listen      Listen First loop (also the Play-round mystery groove)
//   instrument  "Hear the X": the instrument on its own
//   layers      How It Is Built: tracks tagged with the lesson's exact layer names
//   ear         Ear Challenge clips, the right answer and why
//   notice      What Did You Notice?, where the slide names a recording: our own
//               synth in that style, labelled as such
import type { Pattern } from './types';
import { notes, onlyLayers, pattern, tr, untagged, withId } from './notation';
import {
  BULERIA, DEMBOW, FADO_ARPEGGIO, FOUR_ON_THE_FLOOR, GNAWA_QRAQEB, IRISH_JIG, KORA,
  IRISH_REEL, ONE_DROP, SAMBA_BATUCADA, STANDARD_BELL, TEENTAL,
} from './patterns';

export type LessonAudio = {
  listen: Pattern;
  instrument: Pattern;
  instrumentLabel: string;
  layers?: Pattern;
  ear?: { clips: Pattern[]; answer: number; why: string };
  notice?: { pattern: Pattern; label: string };
};

const WA = 'westafrica/';
const CA = 'caribbean/';
const SA = 'southasia/';
const SE = 'seasia/';
const ME = 'mena/';
const IN = 'instruments/';

// adds tracks from another pattern (same grid) to a copy of p
const plus = (p: Pattern, id: string, extra: Pattern['tracks']): Pattern => ({ ...p, id, tracks: [...p.tracks, ...extra] });

// ------------------------------------------------------------------ jazz
// Listen First: a 12/8 bell-and-drum pattern of West African origin, the kind
// of rhythm played in Congo Square. Nobody recorded it, so this is a
// representative pattern, not a reconstruction.
const jazzListen = pattern('jazz-listen', 96, 12, [
  ...STANDARD_BELL.tracks,
  tr(WA + 'djembe_bass', 'X.....x.....'),
  tr(WA + 'djembe_tone', '...xx....xx.'),
  tr(WA + 'djembe_slap', '......x....x', undefined, 0.9),
  tr(WA + 'bassdrum', 'X.....x..x..'),
  tr(WA + 'shaker', 'xgoxgoxgoxgo', undefined, 0.8),
]);

// Ragtime: the opening of "The Entertainer" (Scott Joplin, 1902, public domain).
// 16 steps = two bars of 2/4 in sixteenths. Left hand: bass note on the beat,
// chord on the off-beat ("oom-pah"); right hand syncopates against it.
const jazzNotice = pattern('jazz-ragtime', 84, 16, [
  tr(IN + 'piano_c3', 'x... .... x... .... x... .... x... ....'),
  tr(IN + 'piano_g2', '.... x... .... x... .... x... .... x...'),
  tr(IN + 'pchord_c', '..o. ..o. ..o. ..o. ..o. .... ..o. ....'),
  tr(IN + 'pchord_g7', '.... .... .... .... .... ..o. .... ..o.'),
], {
  bars: 2,
  melody: notes(IN + 'piano_', 'e5 c6! . e5 c6 . e5 c6! . . . . . c6 d6 ds6 e6! c6 d6 e6 . b5 d6! . c6! . . . . . d5 ds5'),
});

const jazzTrumpet = pattern('jazz-trumpet', 100, 16, [], {
  melody: notes(IN + 'trumpet_', 'g4 . c5 . e5 . g5! . . . e5_ . g5 . . .'),
});

// Four layers on a swing (triplet) grid, C7 to F7.
// Rhythm: ride "ding, ding-a ding, ding-a", hi-hat on 2 and 4, feathered kick, walking bass.
const jazzLayers = pattern('jazz-layers', 112, 12, [
  tr(IN + 'ride', 'x..x.ox..x.o x..x.ox..x.o', 'Rhythm', 0.8),
  tr(CA + 'hihat', '...o.....o.. ...o.....o..', 'Rhythm'),
  tr(CA + 'kick', 'g..g..g..g.. g..g..g..g..', 'Rhythm'),
  tr(IN + 'pchord_c7', '...o.....o.. ............', 'Harmony'),
  tr(IN + 'pchord_f7', '............ ...o.....o..', 'Harmony'),
], {
  bars: 2,
  melody: [
    ...notes(IN + 'bass_', 'c2! . . e2 . . g2 . . a2 . . f2! . . a2 . . c3 . . d3 . .', 'Rhythm'),
    ...notes(IN + 'piano_', '. . ds5_ e5! . g5 . . c6 . . . . . ds5_ e5 . g5 . e5 . . . .', 'Blues'),
    ...notes(IN + 'trumpet_', 'e5 . g5! . . e5 ds5_ . c5 . . . . . g4 bb4 . c5 . ds5 e5! . . .', 'Improvisation'),
  ],
});

// ------------------------------------------------------------------ salsa
// Son clave 3-2 over a tumbao groove. 16 steps = two bars of 4/4 in eighths.
// Montuno chords move C, F, G, F; the bass anticipates each change.
const salsaLayers = pattern('salsa-layers', 92, 16, [
  tr(CA + 'clave', 'X..x ..x. ..X. x...', 'Clave'),
  tr(CA + 'conga_mute', 'og.g og.. og.g og..', 'Congas'),
  tr(CA + 'conga_slap', '..x. .... ..x. ....', 'Congas'),
  tr(CA + 'conga_open', '.... ..x. .... ..x.', 'Congas'),
  tr(CA + 'tumba', '.... ...x .... ...x', 'Congas'),
  tr(IN + 'pchord_c', '.x.x .... .... ....', 'Piano montuno', 0.8),
  tr(IN + 'pchord_f', '.... x.x. .... x.x.', 'Piano montuno', 0.8),
  tr(IN + 'pchord_g', '.... .... .x.x ....', 'Piano montuno', 0.8),
], { melody: notes(IN + 'bass_', '. . . f2 . . g2! . . . . f2 . . c3! .', 'Bass') });
const salsaNoClave = onlyLayers(salsaLayers, 'salsa-ear-a', ['Congas', 'Bass']);

// ------------------------------------------------------------------ tango
// Habanera bass (dotted eighth, sixteenth, two eighths), which reached the Río
// de la Plata from Cuba. 32 steps = four bars of 2/4: D minor, then A7.
const tangoListen = pattern('tango-listen', 66, 16, [
  tr(IN + 'pchord_dm', '.... o... .... o... .... .... .... ....', undefined, 0.8),
  tr(IN + 'pchord_a7', '.... .... .... .... .... o... .... o...', undefined, 0.8),
], {
  bars: 2,
  melody: notes(IN + 'bass_', 'd2! . . a2 d3 . a2 . d2! . . a2 d3 . a2 . a2! . . e2 a2 . cs3 . a2! . . e2 a2 . e2 .'),
});
const tangoBandoneon = pattern('tango-bandoneon', 66, 16, [], {
  bars: 2,
  melody: notes(IN + 'bandoneon_', 'd5! . . . cs5 . d5 . e5 . . . f5! . e5 . d5 . . . a4 . . . cs5 . . . d5! . . .'),
});
// Tango-canción accompaniment on guitar: bass note, then chords in 3-3-2.
const tangoGuitar = pattern('tango-guitar', 66, 16, [
  tr(IN + 'nylon_d3', 'X... .... .... .... .... .... .... ....'),
  tr(IN + 'nylon_dm', '.... ..x. .... x... .... .... .... ....'),
  tr(IN + 'nylon_a2', '.... .... .... .... X... .... .... ....'),
  tr(IN + 'nylon_a7', '.... .... .... .... .... ..x. .... x...'),
], { bars: 2 });

// ------------------------------------------------------------------ samba
const sambaLayers = pattern('samba-layers', 104, 16, [
  tr(IN + 'surdo2', 'X... .... X... ....', 'Surdo'),
  tr(IN + 'surdo1', '.... X... .... X...', 'Surdo'),
  tr(IN + 'surdo_mute', 'g... .... g... ....', 'Surdo'),
  tr(IN + 'tamborim', 'x.xx .x.x .xx. x.x.', 'Tamborim'),
  tr(IN + 'pandeiro_bass', 'x... x... x... x...', 'Pandeiro'),
  tr(IN + 'pandeiro_jingle', '.o.o .o.o .o.o .o.o', 'Pandeiro'),
  tr(IN + 'pandeiro_slap', '..x. ..x. ..x. ..x.', 'Pandeiro'),
  tr(IN + 'cuica_lo', '..x. .... ..x. ....', 'Cuíca'),
  tr(IN + 'cuica_hi', '...x ..x. ...x ..x.', 'Cuíca'),
]);
const sambaCuica = pattern('samba-cuica', 104, 16, [
  tr(IN + 'cuica_lo', '..x. ...x ..x. ....'),
  tr(IN + 'cuica_hi', 'x..x ..x. .x.x ..x.'),
]);

// ------------------------------------------------------------------ reggaeton
const reggaetonLayers = pattern('reggaeton-layers', 92, 16, [
  tr(IN + 'dm_kick', 'X... x... X... x...', 'Kick'),
  tr(IN + 'dm_snare', '...x ..x. ...x ..x.', 'Snare (dembow)'),
  tr(IN + 'stab_am', '..x. ..x. .... ....', 'Synth stab', 0.8),
  tr(IN + 'stab_f', '.... .... ..x. ..x.', 'Synth stab', 0.8),
], { melody: notes(IN + 'sub_', 'a1! . . . . . . . f1 . . . . . g1 .', 'Bass') });
// Programming a dembow: first bar kick only, then the snare joins
const reggaetonMachine = pattern('reggaeton-machine', 92, 16, [
  tr(IN + 'dm_kick', 'X... x... X... x... X... x... X... x...'),
  tr(IN + 'dm_snare', '.... .... .... .... ...x ..x. ...x ..x.'),
], { bars: 2 });

// ------------------------------------------------------------------ kora
// see KORA in patterns.ts
const koraLayers = KORA;

// ------------------------------------------------------------------ highlife
// Palm-wine guitar: the thumb keeps the bass on the beat, the fingers pick
// short phrases between. C, F, G, C over two bars.
const highlifeLayers = pattern('highlife-layers', 116, 16, [
  tr(CA + 'conga_mute', 'o... o... o... o... o... o... o... o...', 'Congas'),
  tr(CA + 'conga_slap', '..x. .... ..x. .... ..x. .... ..x. ....', 'Congas'),
  tr(CA + 'conga_open', '.... ..xx .... ..xx .... ..xx .... ..xx', 'Congas'),
], {
  bars: 2,
  melody: [
    ...notes(IN + 'guitar_', 'c3! . e4 g4 g2 . e4 c4 c3! . f4 a4 c3 . a4 c5 g2! . d4 g4 g2 . b3 d4 c3! . e4 g4 g2 . e4 c4', 'Guitar'),
    ...notes(IN + 'bass_', 'c2! . . c2 . . g2 . f2! . . f2 . . c3 . g2! . . g2 . . d3 . c2! . . . g2 . c2 .', 'Bass'),
    ...notes(IN + 'trumpet_', '. . . . . . . . . . . . g4 . c5 . e5! . g5 . e5 . c5 . . . . . . . . .', 'Brass'),
  ],
});
const highlifeListen = plus(untagged(highlifeLayers, 'highlife-listen'), 'highlife-listen', [
  // the HIGHLIFE_BELL figure (patterns.ts), twice
  tr(WA + 'bell', 'X.x. x.xx .x.x .xx. X.x. x.xx .x.x .xx.', undefined, 0.75),
  tr(WA + 'shaker', 'oggg oggg oggg oggg oggg oggg oggg oggg', undefined, 0.7),
]);

// ------------------------------------------------------------------ afrobeat
const afrobeatLayers = pattern('afrobeat-layers', 108, 16, [
  tr(CA + 'kick', 'X... ..x. ..x. .... X... ..x. .... ..x.', 'Drums'),
  tr(CA + 'snare', '.... X..g ..g. X.g. .... X..g ..g. X.gg', 'Drums', 0.85),
  tr(CA + 'hihat', 'xgxg xgx. xgxg xgx. xgxg xgx. xgxg xgx.', 'Drums', 0.8),
  tr(CA + 'hihat_open', '.... ...x .... ...x .... ...x .... ...x', 'Drums', 0.7),
  tr(WA + 'shaker', 'g.x. X.g. x.g. X.x. g.x. X.g. x.g. X.x.', 'Drums', 0.8),
  tr(IN + 'guitar_chk', '.x.o .x.o .x.o .x.o .x.o .x.o .x.o .x.o', 'Guitar'),
  tr(IN + 'horns_stab', '.... .... .... .... .... .... .... X...', 'Horns'),
], {
  bars: 2,
  melody: [
    ...notes(IN + 'bass_', 'd2! . . d2 . . f2 . a2 . . c3 . a2 g2 . d2! . . d2 . . f2 . a2 . c3 d3 . c3 a2 .', 'Bass'),
    ...notes(IN + 'guitar_', 'd4_ . f4_ . a4_ . f4_ d4_ . . d4_ . f4_ a4_ . . d4_ . f4_ . a4_ . f4_ d4_ . . d4_ . f4_ a4_ . .', 'Guitar'),
    ...notes(IN + 'sax_', '. . . . . . . . . . . . . . . . d4! . f4 . g4 . a4! . . . g4 f4 . . . .', 'Horns'),
  ],
});
// The horn section answers back: call on the saxophone, the section stabs back
const afrobeatHorns = pattern('afrobeat-horns', 108, 16, [
  tr(IN + 'horns_stab', '.... .... .... X... .... .... X.x. ....'),
], {
  bars: 2,
  melody: notes(IN + 'sax_', 'd4! . f4 . g4 . a4! . . . g4 f4 . . . . a4! . c5 . a4 . g4 f4 . . . . . . . .'),
});

// ------------------------------------------------------------------ mbira
// Kushaura: left thumb on the bass notes (the beat), right thumb one pulse
// later; hosho shakers mark each three-pulse beat.
const mbiraLayers = pattern('mbira-layers', 112, 12, [
  tr(IN + 'hosho', 'Xgx Xgx Xgx Xgx Xgx Xgx Xgx Xgx', 'Hosho', 0.85),
], {
  bars: 2,
  melody: [
    ...notes(IN + 'mbira_', 'g2! . . d3 . . c3! . . g2 . . b2! . . d3 . . d3! . . b2 . .', 'Left thumb'),
    ...notes(IN + 'mbira_', '. b3 . . g3 . . e4 . . g3 . . d4 . . b3 . . d4 . . g3 .', 'Right thumb'),
  ],
});

// ------------------------------------------------------------------ gamelan
// Lancaran cycle at two steps per beat, so the peking can double each note.
// Balungan (core melody, saron) 3 5 3 2 | 3 5 3 2 | 5 6 5 3 | 2 1 2 6; the gong
// lands on the last beat with the last note.
const gamelanLayers = pattern('gamelan-layers', 104, 16, [
  tr(SE + 'ketuk', 'x... x... x... x... x... x... x... x...', 'Gong cycle', 0.8),
  tr(SE + 'kenong', '.... ..x. .... ..x. .... ..x. .... ..x.', 'Gong cycle'),
  tr(SE + 'kempul', '.... .... ..x. .... ..x. .... ..x. ....', 'Gong cycle'),
  tr(SE + 'gong', '.... .... .... .... .... .... .... ..X.', 'Gong cycle'),
], {
  bars: 2,
  melody: [
    ...notes(SE + 'saron_', '3 . 5 . 3 . 2 . 3 . 5 . 3 . 2 . 5 . 6 . 5 . 3 . 2 . 1 . 2 . 6! .', 'Core melody'),
    ...notes(SE + 'peking_', '3_ 3_ 5_ 5_ 3_ 3_ 2_ 2_ 3_ 3_ 5_ 5_ 3_ 3_ 2_ 2_ 5_ 5_ 6_ 6_ 5_ 5_ 3_ 3_ 2_ 2_ 1_ 1_ 2_ 2_ 6_ 6_', 'Ornaments'),
  ],
});
const gamelanListen = plus(untagged(gamelanLayers, 'gamelan-listen'), 'gamelan-listen', [
  tr(SE + 'kendang_tak', '..x. .... ..x. .... ..x. .... ..x. ....', undefined, 0.7),
  tr(SE + 'kendang_dhung', 'x... .... x... .... x... .... x... x.x.', undefined, 0.7),
]);
const gamelanSaron: Pattern = {
  ...onlyLayers(gamelanLayers, 'gamelan-saron', ['Core melody']),
  tracks: gamelanLayers.tracks.filter((t) => t.sample === SE + 'gong').map(({ layer: _l, ...t }) => t),
};

// ------------------------------------------------------------------ raga
// Raag Yaman, an evening raga, with Sa on C: Ni Re Ga, Re Sa; Pa, tivra Ma, Ga,
// Re slides up to Ga (meend), Re Sa. Tanpura tuned Pa Sa Sa Sa (low), one
// pluck every four matras so the drone never stops. Tabla plays teental.
const ragaLayers = pattern('raga-layers', 40, 16, [
  tr(SA + 'tanpura_pa', 'x... .... .... ....', 'Drone'),
  tr(SA + 'tanpura_sa', '.... x... x... ....', 'Drone'),
  tr(SA + 'tanpura_sa_low', '.... .... .... x...', 'Drone'),
  ...TEENTAL.tracks.map((t) => ({ ...t, layer: 'Tabla cycle', vel: (t.vel as number[]).map((v) => v * 0.85) })),
], { melody: notes(SA + 'sitar_', 'b3 d4 e4! . d4 c4 . . g4! fs4 e4 meend . d4 c4! .', 'Melody') });
const ragaPhrase = onlyLayers(ragaLayers, 'raga-ear-a', ['Melody']);
const ragaWithDrone = untagged(onlyLayers(ragaLayers, 'raga-ear-b', ['Drone', 'Melody']), 'raga-ear-b');

// ------------------------------------------------------------------ taiko
const taikoLayers = pattern('taiko-layers', 116, 16, [
  tr(IN + 'odaiko', 'X... .... X... .... X... .... X... x.x.', 'Odaiko (big drum)'),
  tr(IN + 'odaiko_rim', '.... ..x. .... ..x. .... ..x. .... ....', 'Odaiko (big drum)', 0.8),
  tr(IN + 'nagado', '..x. X..x .x.. X... ..x. X..x .x.x X.x.', 'Nagado-daiko'),
  tr(IN + 'shime', 'x.xx x.xx x.xx x.xx x.xx x.xx x.xx x.xx', 'Shime-daiko (tight drum)', 0.8),
  tr(IN + 'chappa', '..x. ..x. ..x. ..x. ..x. ..x. ..x. ..x.', 'Chappa (cymbals)', 0.7),
], { bars: 2 });
const taikoOdaiko = pattern('taiko-odaiko', 100, 16, [
  tr(IN + 'odaiko', 'X... ...x X... .x.. X... .... X.x. x...'),
  tr(IN + 'odaiko_rim', '..x. .... ..x. .... ..xx .x.. .... ..x.'),
], { bars: 2 });

// ------------------------------------------------------------------ yidaki
// The yidaki drone runs continuously (one bar-long sound per bar, overlapping),
// clapsticks keep the pulse, and the player's accents fall across both.
// Tempo must stay 104: the drone sample is rendered exactly one bar long.
const yidakiLayers = pattern('yidaki-layers', 104, 16, [
  tr(IN + 'yidaki_drone', 'X... .... .... ....', 'Drone'),
  tr(IN + 'clapsticks', 'x... x... x... x...', 'Clapsticks'),
  tr(IN + 'yidaki_accent', '.... ..x. .... ..x.', 'Accents'),
  tr(IN + 'yidaki_accent_hi', '.... .... ..o. ....', 'Accents'),
]);

// ------------------------------------------------------------------ oud and maqam
// Maqam Rast on C: C D E-half-flat F G A B-half-flat C.
const oudListen = pattern('oud-listen', 72, 16, [], {
  bars: 2,
  melody: notes(ME + 'oud_', 'c4! . d4 . ehf4 . . f4 g4! . . . . . . . f4 . ehf4 . d4 . ehf4 . d4 . c4! . . . . .'),
});
const oudPhrases = pattern('oud-phrases', 72, 16, [], {
  bars: 2,
  melody: notes(ME + 'oud_', 'g4 . a4 . bhf4! . c5 . bhf4 . a4 . g4! . . . f4 . g4 . a4 . g4 . f4 . ehf4 . d4 . c4! .'),
});
const oudEar = (id: string, third: string) => pattern(id, 80, 16, [], {
  melody: notes(ME + 'oud_', `c4 d4 ${third} f4 g4! . f4 ${third} d4 . ${third} . c4! . . .`),
});

// ------------------------------------------------------------------ raï
// A 6/8 dance groove (two 6/8 bars per 12-step bar): a drum machine kick with
// darbuka and bendir sounds, as in modern raï. Accordion melody in D.
const raiLayers = pattern('rai-layers', 100, 12, [
  tr(IN + 'dm_kick', 'X.....X..... X.....X.....', 'Bendir / darbuka'),
  tr(ME + 'darbuka_dum', '...x.....x.. ...x.....x..', 'Bendir / darbuka'),
  tr(ME + 'darbuka_tek', '..x.xo..x.xo ..x.xo..x.xo', 'Bendir / darbuka', 0.85),
  tr(ME + 'bendir', 'o.....o..... o.....o.....', 'Bendir / darbuka', 0.8),
], {
  bars: 2,
  melody: [
    ...notes(ME + 'accordion_', 'a4! . bb4 a4 . g4 fs4 . g4 . eb4 . d4! . . fs4 . g4 a4 . bb4 . a4 .', 'Accordion'),
    ...notes(IN + 'synbass_', 'd2! . . . . . a2 . . . . . g2! . . . . . a2 . . d2 . .', 'Bass'),
  ],
});
const raiGasba = pattern('rai-gasba', 100, 12, [], {
  bars: 2,
  melody: notes(ME + 'gasba_', 'a4! . . g4 . f4 e4 . . d4 . . f4 . g4 . a4! . g4 . f4 e4 d4 .'),
});

// ------------------------------------------------------------------ gnawa
const gnawaLayers = pattern('gnawa-layers', 104, 12, [
  tr(ME + 'guembri_slap', '.....x.....x .....x......', 'Guembri', 0.8),
  { ...GNAWA_QRAQEB.tracks[0], layer: 'Qraqeb' },
  tr(ME + 'bendir', 'X.....x..... X.....x...x.', 'Frame drum'),
], {
  bars: 2,
  melody: notes(ME + 'guembri_', 'a2! . . c3 . a2 g2 . . e2 . g2 a2! . . c3 . d3 c3 . a2 g2 . e2', 'Guembri'),
});
const gnawaListen = plus(untagged(gnawaLayers, 'gnawa-listen'), 'gnawa-listen', [
  tr(WA + 'handclap', '...o.....o.. ...o.....o..', undefined, 0.7),
]);

// ------------------------------------------------------------------ flamenco
// Bulería compás with cajón and guitar: E (12), F (3), G (6), F (8), E (10).
const flamencoLayers = pattern('flamenco-layers', 80, 12, [
  ...BULERIA.tracks.map((t) => ({ ...t, layer: 'Palmas (claps)', vel: (t.vel as number[]).map((v) => v * 0.8) })),
  tr(IN + 'cajon_bass', 'X.....x.....', 'Cajón', 0.85),
  tr(IN + 'cajon_slap', '...x....x.x.', 'Cajón', 0.85),
  tr(IN + 'flamenco_e', 'o.........X.', 'Guitar'),
  tr(IN + 'flamenco_f', '...X....x...', 'Guitar'),
  tr(IN + 'flamenco_g', '......x.....', 'Guitar'),
]);
const flamencoGuitar = pattern('flamenco-guitar', 80, 12, [
  tr(IN + 'flamenco_e', 'x.........X.'),
  tr(IN + 'flamenco_f', '...X....x...'),
  tr(IN + 'flamenco_g', '......x.....'),
  tr(IN + 'golpe', '...x......x.'),
]);
// Contrast: the same claps in an even four-beat pattern
const flamencoEven = pattern('flamenco-ear-b', 80, 16, [
  tr(IN + 'palmas_fuerte', 'X... x... x... x...'),
  tr(IN + 'palmas_sorda', '.gg. .gg. .gg. .gg.'),
  tr(IN + 'cajon_bass', 'x... .... x... ....'),
]);

// ------------------------------------------------------------------ Irish
// Jig: fiddle, tin whistle an octave up, bodhrán down-up-down in each 6/8 bar.
// Tempo must stay 116: the pipes drone is rendered exactly one bar long.
const irishLayers = pattern('irish-layers', 116, 12, [
  tr(IN + 'bodhran_low', 'X..x..X..x.. X..x..X..x..', 'Bodhrán'),
  tr(IN + 'bodhran_high', '.og.og.og.og .og.og.og.og', 'Bodhrán'),
], {
  bars: 2,
  melody: [
    ...IRISH_JIG.melody!.map((m) => ({ ...m, layer: 'Fiddle' })),
    ...notes(IN + 'whistle_', 'g5! . . g5 a5 b5 a5! . . a5 b5 d6 e6! d6 d6 g6 d6 d6 e6! d6 b5 d6 b5 a5', 'Tin whistle', 0.85),
  ],
});
const irishPipes = pattern('irish-pipes', 116, 12, [
  tr(IN + 'pipes_drone', 'X........... X...........', undefined, 0.8),
], {
  bars: 2,
  melody: notes(IN + 'chanter_', 'g4! . . g4 a4 b4 a4! . . a4 b4 d5 e5! d5 d5 g5 d5 d5 e5! d5 b4 d5 b4 a4'),
});

// ------------------------------------------------------------------ fado
const fadoLayers = pattern('fado-layers', 66, 16, [], {
  bars: 2,
  melody: [
    ...notes(IN + 'bass_', 'a2! . . . e2 . . . a2 . . . c3 . . . e2! . . . d3 . . . e2 . . . d3 . c3 .', 'Bass line'),
    ...FADO_ARPEGGIO.melody!.map((m) => ({ ...m, vel: (m.vel ?? 0.8) * 0.85, layer: 'Portuguese guitar' })),
    ...notes(IN + 'hum_', 'e4 . . . a4! . . . b4 . c5 . b4 . a4 . gs4! . . . . . . . e4 . . . . . . .', 'Melody line'),
  ],
});
// listen adds the viola (nylon guitar) on the off-beats under bass and guitar
const fadoListen = untagged({
  ...onlyLayers(fadoLayers, 'fado-listen', ['Bass line', 'Portuguese guitar']),
  tracks: [
    tr(IN + 'nylon_am', '.... x... .... x... .... .... .... ....', undefined, 0.6),
    tr(IN + 'nylon_e7', '.... .... .... .... .... x... .... x...', undefined, 0.6),
  ],
}, 'fado-listen');
const fadoGuitar = onlyLayers(fadoLayers, 'fado-guitar', ['Portuguese guitar']);

// ------------------------------------------------------------------ the table

export const LESSON_AUDIO: Record<string, LessonAudio> = {
  jazz: {
    listen: jazzListen,
    instrument: jazzTrumpet,
    instrumentLabel: 'Hear the trumpet',
    layers: jazzLayers,
    notice: {
      pattern: jazzNotice,
      label: "Ragtime piano: the opening of Scott Joplin's 'The Entertainer' (1902), a public-domain piece, played by our synth.",
    },
  },
  salsa: {
    listen: untagged(salsaLayers, 'salsa-listen'),
    instrument: untagged(onlyLayers(salsaLayers, 'salsa-congas', ['Congas']), 'salsa-congas'),
    instrumentLabel: 'Hear the congas',
    layers: salsaLayers,
    ear: {
      clips: [
        untagged(salsaNoClave, 'salsa-ear-a'),
        untagged(onlyLayers(salsaLayers, 'salsa-ear-b', ['Clave', 'Congas', 'Bass']), 'salsa-ear-b'),
        plus(untagged(salsaNoClave, 'salsa-ear-c'), 'salsa-ear-c', [tr(CA + 'cowbell', 'x.x. x.x. x.x. x.x.', undefined, 0.7)]),
      ],
      answer: 1,
      why: 'Clip B. Listen for the hard wooden click: three strokes, then two (3-2). That is the son clave. Clips A and C keep the congas and bass, but nothing plays the clave.',
    },
  },
  tango: {
    listen: tangoListen,
    instrument: tangoBandoneon,
    instrumentLabel: 'Hear the bandoneón',
    notice: {
      pattern: tangoGuitar,
      label: "A tango-canción guitar accompaniment in the style of Carlos Gardel's 'Flor de Fango' (1918), played by our synth. The original is voice and guitar.",
    },
  },
  samba: {
    listen: plus(untagged(sambaLayers, 'samba-listen'), 'samba-listen', [SAMBA_BATUCADA.tracks[3]]),
    instrument: sambaCuica,
    instrumentLabel: 'Hear the cuíca',
    layers: sambaLayers,
  },
  reggaeton: {
    listen: plus(untagged(reggaetonLayers, 'reggaeton-listen'), 'reggaeton-listen', [DEMBOW.tracks[2]]),
    instrument: reggaetonMachine,
    instrumentLabel: 'Hear a dembow being programmed',
    layers: reggaetonLayers,
    ear: {
      clips: [withId(FOUR_ON_THE_FLOOR, 'reggaeton-ear-a', { bpm: 96 }), withId(ONE_DROP, 'reggaeton-ear-b'), withId(DEMBOW, 'reggaeton-ear-c')],
      answer: 2,
      why: 'Clip C. The dembow snare lands just before and just after the middle of each half bar: boom-ch-boom-chick. Clip A is a steady four-on-the-floor dance beat, and clip B is a reggae one drop, with the kick only on beat three.',
    },
  },
  kora: {
    listen: untagged(koraLayers, 'kora-listen'),
    instrument: untagged(onlyLayers(koraLayers, 'kora-hands', ['Bass (kumbengo)', 'Melody']), 'kora-hands'),
    instrumentLabel: "Hear the kora's two hands",
    layers: koraLayers,
  },
  highlife: {
    listen: highlifeListen,
    instrument: untagged(onlyLayers(highlifeLayers, 'highlife-guitar', ['Guitar']), 'highlife-guitar'),
    instrumentLabel: 'Hear the palm-wine guitar',
    layers: highlifeLayers,
  },
  afrobeat: {
    listen: untagged(afrobeatLayers, 'afrobeat-listen'),
    instrument: afrobeatHorns,
    instrumentLabel: 'Hear the horn section',
    layers: afrobeatLayers,
  },
  mbira: {
    listen: untagged(mbiraLayers, 'mbira-listen'),
    instrument: untagged(onlyLayers(mbiraLayers, 'mbira-keys', ['Left thumb', 'Right thumb']), 'mbira-keys'),
    instrumentLabel: 'Hear the mbira',
    layers: mbiraLayers,
  },
  gamelan: {
    listen: gamelanListen,
    instrument: untagged(gamelanSaron, 'gamelan-saron'),
    instrumentLabel: 'Hear the saron and gong',
    layers: gamelanLayers,
  },
  raga: {
    listen: withId(ragaWithDrone, 'raga-listen'),
    instrument: untagged(ragaPhrase, 'raga-sitar'),
    instrumentLabel: 'Hear the sitar',
    layers: ragaLayers,
    ear: {
      clips: [untagged(ragaPhrase, 'raga-ear-a'), ragaWithDrone],
      answer: 1,
      why: "Clip B. Under the sitar you can hear the tanpura's strings ringing the whole time: Pa, Sa, Sa, Sa. Clip A is the same phrase with nothing underneath it.",
    },
  },
  taiko: {
    listen: untagged(taikoLayers, 'taiko-listen'),
    instrument: taikoOdaiko,
    instrumentLabel: 'Hear the odaiko',
    layers: taikoLayers,
  },
  yidaki: {
    listen: untagged(yidakiLayers, 'yidaki-listen'),
    instrument: untagged(onlyLayers(yidakiLayers, 'yidaki-drone', ['Drone']), 'yidaki-drone'),
    instrumentLabel: 'Hear the yidaki',
    layers: yidakiLayers,
  },
  'oud-maqam': {
    listen: oudListen,
    instrument: oudPhrases,
    instrumentLabel: 'Hear the oud',
    ear: {
      clips: [oudEar('oud-ear-a', 'e4'), oudEar('oud-ear-b', 'ehf4')],
      answer: 1,
      why: 'Clip B. Its third note sits between E flat and E: the half-flat of maqam Rast. Clip A plays an ordinary E, so it sounds like a Western major scale.',
    },
  },
  rai: {
    listen: untagged(raiLayers, 'rai-listen'),
    instrument: raiGasba,
    instrumentLabel: 'Hear the gasba',
    layers: raiLayers,
  },
  gnawa: {
    listen: gnawaListen,
    instrument: untagged(onlyLayers(gnawaLayers, 'gnawa-guembri', ['Guembri']), 'gnawa-guembri'),
    instrumentLabel: 'Hear the guembri',
    layers: gnawaLayers,
  },
  flamenco: {
    listen: untagged(flamencoLayers, 'flamenco-listen'),
    instrument: flamencoGuitar,
    instrumentLabel: 'Hear the flamenco guitar',
    layers: flamencoLayers,
    ear: {
      clips: [untagged(onlyLayers(flamencoLayers, 'flamenco-ear-a', ['Palmas (claps)', 'Cajón']), 'flamenco-ear-a'), flamencoEven],
      answer: 0,
      why: 'Clip A. Its claps are grouped inside twelve beats, with accents on 12, 3, 6, 8 and 10, so the cycle turns a corner each time. Clip B claps an even four-beat pattern.',
    },
  },
  irish: {
    listen: untagged(irishLayers, 'irish-listen'),
    instrument: irishPipes,
    instrumentLabel: 'Hear the uilleann pipes',
    layers: irishLayers,
    ear: {
      clips: [withId(IRISH_REEL, 'irish-ear-a'), withId(IRISH_JIG, 'irish-ear-b')],
      answer: 1,
      why: 'Clip B. A jig groups its notes in threes: ONE two three, FOUR five six. Clip A is a reel, where the notes run in even twos and fours.',
    },
  },
  fado: {
    listen: fadoListen,
    instrument: fadoGuitar,
    instrumentLabel: 'Hear the Portuguese guitar',
    layers: fadoLayers,
  },
};

export const getLessonAudio = (slug: string): LessonAudio | undefined => LESSON_AUDIO[slug];
