// Every sample SoundMap ships: id -> { render, family, max }.
// family sets the loudness target; max caps the length (seconds).
import * as D from './instruments/drums.mjs';
import * as I from './instruments/idiophones.mjs';
import * as S from './instruments/strings.mjs';
import * as W from './instruments/winds.mjs';
import * as K from './instruments/kit.mjs';
import { noteFreq, exciter } from './dsp.mjs';

// Tempos of lessons whose drones loop once per bar (bar = 4 beats)
export const IRISH_BPM = 116;
export const YIDAKI_BPM = 104;
const bar = (bpm) => (60 / bpm) * 4;

const C_MAJOR = ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5'];

const entries = [];
const add = (id, family, render, max = 1) => entries.push({ id, family, render, max });
const voice = (prefix, family, notes, fn, max) => notes.forEach((n) => add(prefix + n, family, (r) => fn(r, n), max));

// ---------------- West Africa pack ----------------
add('westafrica/djembe_tone', 'drum', D.djembeTone, 0.4);
add('westafrica/djembe_slap', 'drum', D.djembeSlap, 0.3);
add('westafrica/djembe_bass', 'drum', D.djembeBass, 0.5);
add('westafrica/talkingdrum', 'drum', D.talkingDrum, 0.55);
add('westafrica/shaker', 'perc', (r) => D.shaker(r, { seconds: 0.22, f: 5200, rate: 2200, decay: 0.045, body: 0.25, bodyF: 260 }), 0.22);
add('westafrica/bell', 'perc', (r) => I.ironBell(r, 860), 0.5);
add('westafrica/clap', 'drum', (r) => D.groupClap(r, 5), 0.32);
add('westafrica/bassdrum', 'drum', D.dundunba, 0.55);
add('westafrica/clave', 'perc', (r) => I.clave(r, 2250), 0.14);
add('westafrica/rattle', 'perc', (r) => D.shaker(r, { seconds: 0.34, f: 3800, q: 1.1, rate: 1500, attack: 0.02, decay: 0.09, hp: 1800, flamMs: 70 }), 0.34);
add('westafrica/logdrum', 'perc', D.logDrum, 0.4);
add('westafrica/cowbell', 'perc', (r) => I.cowbell(r, 610), 0.42);
add('westafrica/whistle', 'perc', (r) => W.peaWhistle(r, 2250, 0.24), 0.24);
add('westafrica/handclap', 'drum', D.handClap, 0.3);
voice('westafrica/balafon_', 'tonal', C_MAJOR, (r, n) => I.balafon(r, noteFreq(n)), 0.38);

// ---------------- Caribbean pack ----------------
add('caribbean/clave', 'perc', (r) => I.clave(r, 2480), 0.14);
add('caribbean/conga_open', 'drum', D.congaOpen, 0.5);
add('caribbean/conga_slap', 'drum', D.congaSlap, 0.25);
add('caribbean/conga_mute', 'drum', D.congaMute, 0.12);
add('caribbean/tumba', 'drum', D.tumba, 0.55);
add('caribbean/bongo_hi', 'drum', D.bongoHigh, 0.25);
add('caribbean/bongo_lo', 'drum', D.bongoLow, 0.3);
add('caribbean/timbal', 'drum', D.timbal, 0.45);
add('caribbean/cascara', 'perc', D.cascara, 0.13);
add('caribbean/cowbell', 'perc', (r) => I.cowbell(r, 520), 0.42);
// güiro: the scraper sweeps across the ridges, then a short return stroke
add('caribbean/guiro', 'perc', (r) => D.shaker(r, { seconds: 0.4, f: 3300, q: 2.2, rate: 5200, attack: 0.03, decay: 0.12, hp: 1500, body: 0.5, bodyF: 850 }), 0.4);
add('caribbean/guiro_short', 'perc', (r) => D.shaker(r, { seconds: 0.14, f: 3300, q: 2.2, rate: 5200, attack: 0.008, decay: 0.035, hp: 1500, body: 0.5, bodyF: 850 }), 0.14);
add('caribbean/maracas', 'perc', (r) => D.shaker(r, { seconds: 0.2, f: 6200, q: 1.3, rate: 2600, attack: 0.006, decay: 0.035, hp: 3500 }), 0.2);
add('caribbean/kick', 'drum', D.kick, 0.42);
add('caribbean/snare', 'drum', D.snare, 0.3);
add('caribbean/hihat', 'perc', (r) => I.hihat(r, false), 0.08);
add('caribbean/hihat_open', 'perc', (r) => I.hihat(r, true), 0.4);
add('caribbean/rim', 'perc', D.rim, 0.12);
voice('caribbean/pan_', 'tonal', C_MAJOR, (r, n) => I.steelPan(r, noteFreq(n)), 0.46);

// ---------------- South Asia pack ----------------
add('southasia/dha', 'drum', D.tablaDha, 0.5);
add('southasia/dhin', 'drum', D.tablaDhin, 0.5);
add('southasia/na', 'drum', D.tablaNa, 0.5);
add('southasia/tin', 'drum', D.tablaTin, 0.4);
add('southasia/ge', 'drum', D.tablaGe, 0.5);
add('southasia/ge_glide', 'drum', D.tablaGeGlide, 0.6);
add('southasia/ke', 'drum', D.tablaKe, 0.12);
add('southasia/tun', 'drum', D.tablaTun, 0.5);
add('southasia/te', 'drum', D.tablaTe, 0.14);
add('southasia/tanpura_pa', 'drone', (r) => W.tanpura(r, 'g3', 1.5), 1.5);
add('southasia/tanpura_sa', 'drone', (r) => W.tanpura(r, 'c4', 1.5), 1.5);
add('southasia/tanpura_sa_low', 'drone', (r) => W.tanpura(r, 'c3', 1.5), 1.5);
voice('southasia/sitar_', 'tonal', [...C_MAJOR, 'b3', 'fs4'], (r, n) => S.sitar(r, n, { seconds: 0.52 }), 0.52);
add('southasia/sitar_meend', 'tonal', (r) => S.sitar(r, 'd4', { seconds: 0.7, glideTo: 'e4', glideAt: 0.1, glideTime: 0.22 }), 0.7);
add('southasia/manjira', 'perc', I.manjira, 0.55);
add('southasia/ghungroo', 'perc', (r) => D.jingles(r, { seconds: 0.3, freqs: [4200, 5100, 6100, 7000, 8300, 9400], rate: 1800, attack: 0.012, decay: 0.06 }), 0.3);
add('southasia/dholak', 'drum', D.dholak, 0.45);
add('southasia/dholak_hi', 'drum', D.dholakHigh, 0.2);

// ---------------- Southeast Asia pack ----------------
add('seasia/gong', 'metal', () => I.gongAgeng(), 1.7);
add('seasia/kempul', 'metal', () => I.kempul(), 1.0);
add('seasia/kenong', 'metal', () => I.kenong(), 0.75);
add('seasia/ketuk', 'metal', I.ketuk, 0.26);
add('seasia/kajar', 'metal', I.kajar, 0.2);
add('seasia/kendang_dhung', 'drum', D.kendangDhung, 0.45);
add('seasia/kendang_tak', 'drum', D.kendangTak, 0.16);
add('seasia/kendang_tung', 'drum', D.kendangTung, 0.38);
for (const d of [1, 2, 3, 5, 6]) {
  add(`seasia/saron_${d}`, 'metal', (r) => I.saron(r, I.slendro(d, 530), 0.5), 0.5);
  add(`seasia/peking_${d}`, 'metal', (r) => I.saron(r, I.slendro(d, 1060), 0.4), 0.4);
}
add('seasia/demung', 'metal', (r) => I.saron(r, I.slendro(5, 265), 0.6), 0.6);
add('seasia/bonang', 'metal', () => I.bonang(I.slendro(3, 530)), 0.5);
add('seasia/cengceng', 'perc', I.cengceng, 0.34);
add('seasia/kecrek', 'perc', I.kecrek, 0.24);
voice('seasia/gender_', 'metal', C_MAJOR, (_r, n) => I.gender(noteFreq(n)), 0.45);

// ---------------- North Africa & Middle East pack ----------------
// maqam Rast on C: E and B are half-flat
voice('mena/oud_', 'tonal', [...C_MAJOR, 'ehf4', 'bhf4'], (r, n) => S.oud(r, n), 0.45);
voice('mena/accordion_', 'sustain', ['d4', 'eb4', 'fs4', 'g4', 'a4', 'bb4'], (r, n) => W.accordion(r, n), 0.42);
voice('mena/gasba_', 'sustain', ['d4', 'e4', 'f4', 'g4', 'a4'], (r, n) => W.gasba(r, n, 0.42), 0.42);
voice('mena/guembri_', 'tonal', ['e2', 'g2', 'a2', 'c3', 'd3'], (r, n) => S.guembri(r, n), 0.5);
add('mena/guembri_slap', 'drum', S.guembriSlap, 0.26);
add('mena/bendir', 'drum', D.bendir, 0.48);
add('mena/darbuka_dum', 'drum', D.darbukaDum, 0.45);
add('mena/darbuka_tek', 'drum', D.darbukaTek, 0.24);
add('mena/darbuka_ka', 'drum', D.darbukaKa, 0.18);
add('mena/riq', 'perc', D.riq, 0.34);
add('mena/riq_dum', 'drum', D.riqDum, 0.28);
add('mena/qraqeb', 'perc', I.qraqeb, 0.16);
add('mena/tar', 'drum', D.tar, 0.38);
add('mena/zills', 'perc', I.zills, 0.5);
add('mena/daf', 'drum', D.daf, 0.45);
add('mena/tbel', 'drum', D.tbel, 0.5);

// ---------------- lesson voices ----------------
const IN = 'instruments/';
voice(IN + 'piano_', 'tonal', ['g2', 'c3', 'd5', 'ds5', 'e5', 'g5', 'b5', 'c6', 'd6', 'ds6', 'e6'], (r, n) => S.pianoNote(r, n, 0.38), 0.38);
const CHORDS = {
  c: ['c4', 'e4', 'g4'], g7: ['b3', 'd4', 'f4', 'g4'], c7: ['e4', 'g4', 'bb4'], f7: ['eb4', 'f4', 'a4'],
  f: ['c4', 'f4', 'a4'], g: ['b3', 'd4', 'g4'], dm: ['d4', 'f4', 'a4'], a7: ['cs4', 'e4', 'g4'],
};
for (const [name, ns] of Object.entries(CHORDS)) add(`${IN}pchord_${name}`, 'tonal', (r) => S.pianoChord(r, ns, 0.4), 0.4);
voice(IN + 'trumpet_', 'sustain', ['g4', 'bb4', 'c5', 'ds5', 'e5', 'g5'], (r, n) => W.trumpet(r, n, 0.4), 0.4);
voice(IN + 'bass_', 'tonal', ['c2', 'd2', 'e2', 'f2', 'g2', 'a2', 'c3', 'cs3', 'd3'], (r, n) => S.bass(r, n), 0.42);
voice(IN + 'kora_', 'tonal', ['f2', 'g2', 'a2', 'c3', 'a3', 'c4', 'e4', 'f4', 'g4', 'a4', 'c5'], (r, n) => S.kora(r, n), 0.5);
voice(IN + 'guitar_', 'tonal', ['g2', 'c3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'c5'], (r, n) => S.guitar(r, n, 0.42), 0.42);
add(IN + 'guitar_chk', 'perc', (r) => S.guitarChk(r, ['d3', 'a3', 'd4']), 0.13);
add(IN + 'guitar_chk_hi', 'perc', (r) => S.guitarChk(r, ['f4', 'a4', 'd5']), 0.13);
add(IN + 'nylon_d3', 'tonal', (r) => S.nylon(r, 'd3', 0.5), 0.5);
add(IN + 'nylon_a2', 'tonal', (r) => S.nylon(r, 'a2', 0.5), 0.5);
add(IN + 'nylon_dm', 'tonal', (r) => S.strum(r, ['a3', 'd4', 'f4', 'a4'], { seconds: 0.5 }), 0.5);
add(IN + 'nylon_a7', 'tonal', (r) => S.strum(r, ['g3', 'cs4', 'e4', 'a4'], { seconds: 0.5 }), 0.5);
add(IN + 'nylon_am', 'tonal', (r) => S.strum(r, ['a3', 'c4', 'e4', 'a4'], { seconds: 0.45 }), 0.45);
add(IN + 'nylon_e7', 'tonal', (r) => S.strum(r, ['gs3', 'b3', 'd4', 'e4'], { seconds: 0.45 }), 0.45);
add(IN + 'flamenco_e', 'tonal', (r) => S.rasgueado(r, ['e2', 'b2', 'e3', 'gs3', 'b3', 'e4']), 0.5);
add(IN + 'flamenco_f', 'tonal', (r) => S.rasgueado(r, ['f2', 'c3', 'f3', 'a3', 'c4', 'f4']), 0.5);
add(IN + 'flamenco_g', 'tonal', (r) => S.rasgueado(r, ['g2', 'b2', 'd3', 'g3', 'b3', 'g4']), 0.5);
add(IN + 'golpe', 'drum', D.golpe, 0.2);
add(IN + 'palmas_fuerte', 'drum', D.palmasFuerte, 0.22);
add(IN + 'palmas_sorda', 'drum', D.palmasSorda, 0.2);
add(IN + 'cajon_bass', 'drum', D.cajonBass, 0.32);
add(IN + 'cajon_slap', 'drum', D.cajonSlap, 0.24);
voice(IN + 'pguitar_', 'tonal', ['e4', 'gs4', 'a4', 'b4', 'c5', 'd5', 'e5'], (r, n) => S.portugueseGuitar(r, n), 0.48);
voice(IN + 'hum_', 'sustain', ['e4', 'gs4', 'a4', 'b4', 'c5'], (r, n) => W.hum(r, n, 0.48), 0.48);
voice(IN + 'mbira_', 'tonal', ['g2', 'b2', 'c3', 'd3', 'g3', 'b3', 'd4', 'e4'], (r, n) => I.mbira(r, noteFreq(n)), 0.55);
add(IN + 'hosho', 'perc', (r) => D.shaker(r, { seconds: 0.2, f: 3600, q: 1.1, rate: 2000, attack: 0.004, decay: 0.04, hp: 1600, body: 0.3, bodyF: 380, flamMs: 25 }), 0.2);
voice(IN + 'fiddle_', 'sustain', ['g4', 'a4', 'b4', 'd5', 'e5', 'g5'], (r, n) => W.fiddle(r, n, 0.4), 0.4);
voice(IN + 'whistle_', 'sustain', ['g5', 'a5', 'b5', 'd6', 'e6', 'g6'], (r, n) => W.tinWhistle(r, n, 0.34), 0.34);
voice(IN + 'chanter_', 'sustain', ['g4', 'a4', 'b4', 'd5', 'e5', 'g5'], (r, n) => W.chanter(r, n, 0.4), 0.4);
add(IN + 'pipes_drone', 'drone', (r) => W.pipesDrone(r, bar(IRISH_BPM)), 3);
add(IN + 'bodhran_low', 'drum', D.bodhranLow, 0.38);
add(IN + 'bodhran_high', 'drum', D.bodhranHigh, 0.2);
voice(IN + 'bandoneon_', 'sustain', ['a4', 'cs5', 'd5', 'e5', 'f5'], (r, n) => W.bandoneon(r, n), 0.5);
voice(IN + 'sax_', 'sustain', ['d4', 'f4', 'g4', 'a4', 'c5'], (r, n) => W.sax(r, n, 0.36), 0.36);
add(IN + 'horns_stab', 'sustain', (r) => {
  const parts = [W.sax(r, 'd4', 0.3), W.sax(r, 'a4', 0.3), W.trumpet(r, 'f5', 0.3), W.trumpet(r, 'c5', 0.3)];
  const n = Math.max(...parts.map((p) => p.length));
  const out = new Float32Array(n);
  parts.forEach((p) => p.forEach((v, i) => { out[i] += v * 0.5; }));
  return out;
}, 0.3);
add(IN + 'cuica_hi', 'sustain', (r) => W.cuica(r, true), 0.36);
add(IN + 'cuica_lo', 'sustain', (r) => W.cuica(r, false), 0.3);
add(IN + 'surdo1', 'drum', D.surdoPrimeira, 0.6);
add(IN + 'surdo2', 'drum', D.surdoSegunda, 0.6);
add(IN + 'surdo_mute', 'drum', D.surdoMuted, 0.2);
add(IN + 'caixa', 'perc', D.caixa, 0.16);
add(IN + 'tamborim', 'perc', D.tamborim, 0.14);
add(IN + 'pandeiro_bass', 'drum', D.pandeiroBass, 0.26);
add(IN + 'pandeiro_jingle', 'perc', D.pandeiroJingle, 0.18);
add(IN + 'pandeiro_slap', 'drum', D.pandeiroSlap, 0.2);
add(IN + 'odaiko', 'drum', D.odaiko, 0.75);
add(IN + 'odaiko_rim', 'perc', D.odaikoRim, 0.15);
add(IN + 'nagado', 'drum', D.nagado, 0.6);
add(IN + 'shime', 'drum', D.shime, 0.18);
add(IN + 'chappa', 'perc', I.chappa, 0.4);
add(IN + 'yidaki_drone', 'drone', (r) => W.yidakiDrone(r, bar(YIDAKI_BPM)), 3);
add(IN + 'yidaki_accent', 'sustain', (r) => W.yidakiAccent(r, false), 0.3);
add(IN + 'yidaki_accent_hi', 'sustain', (r) => W.yidakiAccent(r, true), 0.3);
add(IN + 'clapsticks', 'perc', I.clapsticks, 0.12);
add(IN + 'dm_kick', 'drum', K.dmKick, 0.45);
add(IN + 'dm_snare', 'drum', K.dmSnare, 0.24);
add(IN + 'dm_hat', 'perc', K.dmHat, 0.07);
voice(IN + 'sub_', 'tonal', ['f1', 'g1', 'a1'], (r, n) => K.sub(r, n, 0.45), 0.45);
add(IN + 'stab_am', 'sustain', (r) => K.stab(r, ['a4', 'c5', 'e5']), 0.25);
add(IN + 'stab_f', 'sustain', (r) => K.stab(r, ['a4', 'c5', 'f5']), 0.25);
voice(IN + 'synbass_', 'tonal', ['d2', 'g2', 'a2'], (r, n) => K.synBass(r, n), 0.42);
add(IN + 'ride', 'perc', I.ride, 0.5);
add(IN + 'brush', 'perc', D.brush, 0.24);

// ---------------- interface ----------------
add('ui/thump', 'ui', K.uiThump, 0.26);
add('ui/tick', 'ui', K.uiTick, 0.05);
add('ui/correct', 'ui', K.uiCorrect, 0.55);
add('ui/wrong', 'ui', K.uiWrong, 0.42);
add('ui/unlock', 'ui', K.uiUnlock, 0.7);
add('ui/flip', 'ui', K.uiFlip, 0.14);

// one-shot drones loop per bar: they need their full length, not trimmed by threshold
export const NO_TRIM = new Set([IN + 'pipes_drone', IN + 'yidaki_drone']);

// loudness: max RMS over a 30 ms window (dBFS), and a peak ceiling
export const FAMILY = {
  drum: { rms: -14, peak: -1 },
  perc: { rms: -17, peak: -2 },
  tonal: { rms: -16, peak: -2 },
  metal: { rms: -18, peak: -2 },
  sustain: { rms: -18, peak: -3 },
  drone: { rms: -20, peak: -4 },
  ui: { rms: -21, peak: -6 },
};

// low drums get the exciter so phone speakers can carry them
const LOW_DRUMS = new Set([
  'westafrica/djembe_bass', 'westafrica/bassdrum', 'caribbean/kick', 'caribbean/tumba',
  'southasia/dha', 'southasia/dhin', 'southasia/ge', 'southasia/ge_glide', 'southasia/dholak',
  'seasia/kendang_dhung', 'seasia/gong', 'mena/darbuka_dum', 'mena/bendir', 'mena/tbel', 'mena/daf', 'mena/tar',
  IN + 'surdo1', IN + 'surdo2', IN + 'surdo_mute', IN + 'odaiko', IN + 'nagado', IN + 'bodhran_low',
  IN + 'cajon_bass', IN + 'dm_kick', 'ui/thump',
]);
for (const e of entries) {
  if (!LOW_DRUMS.has(e.id)) continue;
  const render = e.render;
  e.render = (r) => exciter(render(r), e.id === 'seasia/gong' ? 0.25 : 0.4);
}

const seen = new Set();
export const CATALOG = entries.filter((e) => {
  if (seen.has(e.id)) return false;
  seen.add(e.id);
  return true;
});
