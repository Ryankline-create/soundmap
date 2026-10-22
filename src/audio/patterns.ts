// Named rhythms, written as drum charts (see notation.ts). Every pattern here is
// played by our own synthesized samples. Comments say what each one is and where
// its hits fall; where a pattern is our simplified version rather than a
// standard figure, the comment says so.
//
// Grid reminder: a 16-step bar is 4 beats of 4 steps; a 12-step bar is 4 beats
// of 3 (triplet or compound feel). `bpm` always counts those 4 beats.
import { notes, pattern, tr, untagged } from './notation';

const WA = 'westafrica/';
const CA = 'caribbean/';
const SA = 'southasia/';
const SE = 'seasia/';
const ME = 'mena/';
const IN = 'instruments/';

// ---------------------------------------------------------------- Caribbean

// Son clave, 3-2 (Cuba). One 16-step loop is a full clave cycle: two bars of
// 4/4 counted in eighth notes. Three strokes (steps 0, 3, 6), then two (10, 12).
export const SON_CLAVE = pattern('son-clave', 92, 16, [
  tr(CA + 'clave', 'X..x ..x. ..X. x...'),
]);

// Rumba clave, 3-2 (Cuba; guaguancó, yambú). Like son clave, but the third
// stroke is one step later (7 instead of 6), which pulls against the beat.
export const RUMBA_CLAVE = pattern('rumba-clave', 92, 16, [
  tr(CA + 'clave', 'X..x ...x ..X. x...'),
]);

// Tresillo (Cuba, and across the Caribbean): 3 + 3 + 2 sixteenths, twice per bar.
export const TRESILLO = pattern('tresillo', 100, 16, [
  tr(CA + 'conga_open', 'X..x ..x. X..x ..x.'),
]);

// Son montuno tumbao on one conga (heel-toe, slap on 2, open tones on 4 and
// 4-and), the tumba answering on 4-and, and the bass anticipating each chord.
export const SON_TUMBAO = pattern('son-tumbao', 92, 16, [
  tr(CA + 'conga_mute', 'og.g og.. og.g og..'),
  tr(CA + 'conga_slap', '..x. .... ..x. ....'),
  tr(CA + 'conga_open', '.... ..x. .... ..x.'),
  tr(CA + 'tumba', '.... ...x .... ...x'),
], { melody: notes(IN + 'bass_', '. . . f2 . . g2 . . . . f2 . . c3 .') });

// Reggae one drop (Jamaica, from the mid-1970s): beat 1 is left empty; kick and
// cross-stick land together on beat 3 (step 8). Hi-hat keeps the eighths.
export const ONE_DROP = pattern('one-drop', 76, 16, [
  tr(CA + 'hihat', 'x.o. x.o. x.o. x.o.'),
  tr(CA + 'kick', '.... .... X... ....'),
  tr(CA + 'rim', '.... .... X... ....'),
]);

// Dembow (Jamaica to Panama to Puerto Rico, 1990s): kick on every beat; snare
// on the last sixteenth of beat 1, the "and" of 2, the last sixteenth of 3 and
// the "and" of 4: steps 3, 6, 11, 14 (boom-ch-boom-chick).
export const DEMBOW = pattern('dembow', 92, 16, [
  tr(IN + 'dm_kick', 'X... x... X... x...'),
  tr(IN + 'dm_snare', '...x ..x. ...x ..x.'),
  tr(IN + 'dm_hat', 'o.o. o.o. o.o. o.o.'),
]);

// Four-on-the-floor dance beat, used only as a contrast in ear challenges.
export const FOUR_ON_THE_FLOOR = pattern('four-on-the-floor', 120, 16, [
  tr(IN + 'dm_kick', 'X... x... X... x...'),
  tr(WA + 'handclap', '.... x... .... x...'),
  tr(IN + 'dm_hat', '..o. ..o. ..o. ..o.'),
]);

// ---------------------------------------------------------------- Brazil

// Samba batucada (Rio de Janeiro). 16 steps = two bars of 2/4 in sixteenths.
// Surdo de segunda answers on beat 1 (steps 0, 8); surdo de primeira, the
// lowest, marks beat 2 (steps 4, 12), and mutes its head on beat 1. Caixa
// runs sixteenths; tamborim plays the teleco-teco figure.
export const SAMBA_BATUCADA = pattern('samba-batucada', 104, 16, [
  tr(IN + 'surdo2', 'X... .... X... ....'),
  tr(IN + 'surdo1', '.... X... .... X...'),
  tr(IN + 'surdo_mute', 'g... .... g... ....'),
  tr(IN + 'caixa', 'xgox xgox xgox xgox'),
  tr(IN + 'tamborim', 'x.xx .x.x .xx. x.x.'),
]);

// ---------------------------------------------------------------- West Africa

// The 12/8 bell "standard pattern" (seven strokes in twelve pulses), heard
// across West and Central Africa: steps 0, 2, 4, 5, 7, 9, 11.
export const STANDARD_BELL = pattern('standard-bell', 96, 12, [
  tr(WA + 'bell', 'X.x.xx.x.x.x'),
]);

// Kuku (forest region of south-eastern Guinea). One common djembe
// accompaniment as taught by Guinean drummers: bass, two tones, two slaps per
// half bar (B . T T S . S .). Dundun and bell parts vary from place to place;
// this backing is a simple version.
export const KUKU = pattern('kuku', 108, 16, [
  tr(WA + 'djembe_bass', 'X... .... X... ....'),
  tr(WA + 'djembe_tone', '..xx .... ..xx ....'),
  tr(WA + 'djembe_slap', '.... x.x. .... x.x.'),
  tr(WA + 'bassdrum', 'X..x ..x. .... x...'),
  tr(WA + 'bell', 'x.o. x.o. x.o. x.o.'),
  tr(WA + 'shaker', 'oggg oggg oggg oggg'),
]);

// Sabar-inspired break (Senegal). Sabar drummers, from Wolof géwël (griot)
// families, play fast, speech-like phrases with a stick in one hand and the
// bare hand on the drum. This is our simplified break on djembe slap, bass and
// talking drum, not a transcription of a traditional phrase.
export const SABAR_BREAK = pattern('sabar-break', 100, 16, [
  tr(WA + 'djembe_slap', 'X.xx .x.. x.xx .X..'),
  tr(WA + 'djembe_bass', '.... x..x .... ..x.'),
  tr(WA + 'talkingdrum', '.... .... .... ...x'),
  tr(WA + 'bassdrum', 'X... .... X... ....'),
]);

// Highlife bell (Ghana): a steady 4/4 bell figure that leans on the off-beats.
// This is our version of the kind of part highlife percussionists play.
export const HIGHLIFE_BELL = pattern('highlife-bell', 116, 16, [
  tr(WA + 'bell', 'X.x. x.xx .x.x .xx.'),
]);

// Afrobeat (Lagos, 1970s). Kick, hi-hat and shekere interlock so each fills
// the others' gaps: the kick sits on 1 and pushes ahead of beats 3 and 4 while
// the shekere leans on the off-beats in between.
export const AFROBEAT_DRUMS = pattern('afrobeat-drums', 108, 16, [
  tr(CA + 'kick', 'X... ..x. ..x. .... X... ..x. .... ..x.'),
  tr(CA + 'snare', '.... X..g ..g. X.g. .... X..g ..g. X.gg'),
  tr(CA + 'hihat', 'xgxg xgx. xgxg xgx. xgxg xgx. xgxg xgx.'),
  tr(CA + 'hihat_open', '.... ...x .... ...x .... ...x .... ...x'),
  tr(WA + 'shaker', 'g.x. X.g. x.g. X.x. g.x. X.g. x.g. X.x.'),
], { bars: 2 });

// Mbira (Shona, Zimbabwe): kushaura (the leading part) and kutsinhira (the part
// that interlocks with it) fall in each other's gaps. 12 pulses per phrase, felt
// as 4 beats of 3; hosho shakers mark the three-pulse beat.
export const MBIRA_INTERLOCK = pattern('mbira-interlock', 112, 12, [
  tr(IN + 'hosho', 'Xgx Xgx Xgx Xgx Xgx Xgx Xgx Xgx'),
], {
  bars: 2,
  melody: [
    // kushaura: left thumb on the beat, right thumb one pulse later
    ...notes(IN + 'mbira_', 'g2! b3 . d3 g3 . c3! e4 . g2 g3 . b2! d4 . d3 b3 . d3! d4 . b2 g3 .'),
    // kutsinhira: the third pulse of each beat, interlocking
    ...notes(IN + 'mbira_', '. . d4_ . . b3_ . . g3_ . . e4_ . . g3_ . . d4_ . . b3_ . . d4_'),
  ],
});

// ---------------------------------------------------------------- South Asia

// Teental (Hindustani): 16 matras in 4 vibhags, one step per matra.
// dha dhin dhin dha | dha dhin dhin dha | dha tin tin ta | ta dhin dhin dha
// Sam (the strongest beat) is matra 1 = step 0; khali (the "empty" section,
// no bayan resonance) begins at matra 9 = step 8.
export const TEENTAL = pattern('teental', 40, 16, [
  tr(SA + 'dha', 'X..x x..x x... ...x'),
  tr(SA + 'dhin', '.xx. .xx. .... .xx.'),
  tr(SA + 'tin', '.... .... .xx. ....'),
  tr(SA + 'na', '.... .... ...x x...'),
]);

// ---------------------------------------------------------------- Southeast Asia

// Gamelan colotomic cycle, lancaran form (Java): 16 beats, one step per beat.
// Kethuk on odd beats, kenong on 4/8/12/16, kempul on 6/10/14, and the big gong
// on beat 16, where the cycle ends and begins again. Steps are beat minus one.
export const GAMELAN_CYCLE = pattern('gamelan-cycle', 52, 16, [
  tr(SE + 'ketuk', 'x.x. x.x. x.x. x.x.'),
  tr(SE + 'kenong', '...x ...x ...x ...x'),
  tr(SE + 'kempul', '.... .x.. .x.. .x..'),
  tr(SE + 'gong', '.... .... .... ...X'),
], { melody: notes(SE + 'saron_', '3 5 3 2 3 5 3 2 5 6 5 3 2 1 2 6') });

// ---------------------------------------------------------------- Japan

// Kumi-daiko (ensemble taiko). The shime keeps a base rhythm (ji-uchi), here
// "don doko" on every beat, while the big drums play the lead over it.
export const TAIKO_JIUCHI = pattern('taiko-jiuchi', 116, 16, [
  tr(IN + 'shime', 'x.xx x.xx x.xx x.xx x.xx x.xx x.xx x.xx'),
  tr(IN + 'odaiko', 'X... .... X... .... X... .... X... x.x.'),
  tr(IN + 'nagado', '..x. X..x .x.. X... ..x. X..x .x.x X.x.'),
], { bars: 2 });

// ---------------------------------------------------------------- North Africa & Middle East

// Maqsum (Egypt and across the Arab world): "dum tek - tek dum - tek -" in
// eighth notes. Dum on steps 0 and 8, tek on 2, 6 and 12; riq jingles between.
export const MAQSUM = pattern('maqsum', 96, 16, [
  tr(ME + 'darbuka_dum', 'X... .... X... ....'),
  tr(ME + 'darbuka_tek', '..x. ..x. .... x...'),
  tr(ME + 'darbuka_ka', '.... g... ..g. ..g.'),
  tr(ME + 'riq', 'o.g. o.g. o.g. o.g.'),
]);

// Gnawa qraqeb (Morocco): iron castanets in a long-short triplet feel, played
// by the chorus around the guembri. 12 steps = 4 beats of 3.
export const GNAWA_QRAQEB = pattern('gnawa-qraqeb', 104, 12, [
  tr(ME + 'qraqeb', 'X.xX.xX.xX.x X.xX.xX.xXxx'),
], { bars: 2 });

// ---------------------------------------------------------------- Europe

// Flamenco bulería compás (Andalusia): a 12-beat cycle counted 12, 1, 2 ... 11,
// with accents on 12, 3, 6, 8 and 10. Step 0 is beat 12. Strong palmas on the
// accents, soft palmas in between.
export const BULERIA = pattern('buleria', 80, 12, [
  tr(IN + 'palmas_fuerte', 'X..x..x.x.x.'),
  tr(IN + 'palmas_sorda', '.gg.gg.g.g.g'),
]);

// Irish reel: even eighth notes, two bars of 4/4 in one 16-step loop. A
// reel-style fiddle line of our own in G.
export const IRISH_REEL = pattern('irish-reel', 55, 16, [], {
  melody: notes(IN + 'fiddle_', 'd5! b4 a4 b4 d5 e5 d5 b4 a4! b4 d5 e5 g5 e5 d5 b4'),
});

// Irish jig in 6/8 (a traditional-style line in G, after "The Kesh"):
// notes in groups of three, two bars of 6/8 per 12-step bar.
export const IRISH_JIG = pattern('irish-jig', 116, 12, [], {
  bars: 2,
  melody: notes(IN + 'fiddle_', 'g4! . . g4 a4 b4 a4! . . a4 b4 d5 e5! d5 d5 g5 d5 d5 e5! d5 b4 d5 b4 a4'),
});

// Fado guitar arpeggio (Lisbon): the Portuguese guitar circles the chord in
// sixteenths, A minor to E7 and back.
export const FADO_ARPEGGIO = pattern('fado-arpeggio', 66, 16, [], {
  bars: 2,
  melody: notes(IN + 'pguitar_', 'a4! c5 e5 c5 a4 c5 e5 c5 b4 c5 d5 c5 b4 a4 gs4 a4 gs4! b4 d5 b4 gs4 b4 e5 b4 d5 c5 b4 a4 gs4 . e4 .'),
});

// Tango marcato in 3-3-2 (Río de la Plata): the bar split 3 + 3 + 2 eighths,
// strokes on steps 0, 6 and 12.
export const TANGO_332 = pattern('tango-332', 66, 16, [
  tr(IN + 'nylon_dm', 'X... ..x. .... x...'),
]);

// ---------------------------------------------------------------- kora and the hook

// Kora (Mande griot tradition): kumbengo, the repeating accompaniment, and
// birimintingo, the improvised runs, in F, felt in 4 beats of 3. The thumbs
// play the bass on the beat; the index fingers answer between them.
export const KORA = pattern('kora-layers', 88, 12, [], {
  bars: 2,
  melody: [
    ...notes(IN + 'kora_', 'f2! . . c3 . . f2 . . a2 . . c3! . . g2 . . c3 . . g2 . .', 'Bass (kumbengo)'),
    ...notes(IN + 'kora_', '. c4 a3 . f4 c4 . a3 c4 . f4 e4 . e4 c4 . g4 e4 . c4 e4 . g4 f4', 'Melody'),
    ...notes(IN + 'kora_', '. . . . . . . . . a4_ c5 a4 . . . . . . c5! a4 g4 f4 g4 a4', 'Improvised runs'),
  ],
});

// Onboarding hook: the kora groove, played for six seconds.
export const HOOK_PATTERN = untagged(KORA, 'hook-kora');
export const HOOK_MAX_MS = 6000;
