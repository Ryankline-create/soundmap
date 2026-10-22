/* SoundMap website synth: every sound on the page is made here with Web Audio.
   Ported recipes from the app's synthesizer:
   - Karplus-Strong plucked string (kora), rendered once per pitch into a buffer
   - membrane drum: sine with a fast pitch drop + band-passed noise slap
   - 2-operator FM bell, and a woody clave
   - band-passed noise shaker / güiro scrape
   - kick and a harmonic bass
   - a soft stamp thump
   Timing: notes are scheduled on AudioContext time by a lookahead scheduler
   (a timer only wakes it up; it never times notes itself). */

(function () {
  'use strict';

  let ctx = null;
  let bus = null;
  let noise = null;
  const ksCache = new Map();

  // Deterministic noise so the site sounds the same on every visit.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 10;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.2;
      bus = ctx.createGain();
      bus.gain.value = 0.85;
      bus.connect(comp);
      comp.connect(ctx.destination);
      const len = ctx.sampleRate;
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noise.getChannelData(0);
      const r = rng(20261021);
      for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const now = () => (ctx ? ctx.currentTime : 0);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function env(g, t, peak, attack, decay) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function noiseSource(t, dur) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    // start at a varying offset so repeated hits don't sound identical
    const off = (t * 7919) % 0.8;
    src.start(t, off, dur + 0.02);
    return src;
  }

  /* ---- Karplus-Strong pluck (kora) ---- */
  function ksBuffer(midi) {
    if (ksCache.has(midi)) return ksCache.get(midi);
    const sr = ctx.sampleRate;
    const f = mtof(midi);
    const t60 = 2.6 - Math.min(1.4, (midi - 40) * 0.04); // low strings ring longer
    const dur = Math.min(2.8, t60 + 0.2);
    const n = Math.floor(sr * dur);
    const N = Math.max(2, Math.round(sr / f));
    const decay = Math.pow(0.001, 1 / (t60 * f));
    const line = new Float32Array(N);
    const r = rng(midi * 131 + 7);
    // excitation: softened noise, then a pluck-position comb (plucked near 1/6 of the string)
    let lp = 0;
    for (let i = 0; i < N; i++) { lp += 0.55 * ((r() * 2 - 1) - lp); line[i] = lp; }
    const p = Math.max(1, Math.round(N / 6));
    const ex = line.slice();
    for (let i = 0; i < N; i++) line[i] = ex[i] - 0.6 * ex[(i + p) % N];
    const buf = ctx.createBuffer(1, n, sr);
    const out = buf.getChannelData(0);
    let idx = 0;
    let peak = 0;
    for (let i = 0; i < n; i++) {
      const a = line[idx];
      const b = line[(idx + 1) % N];
      line[idx] = decay * 0.5 * (a + b);
      out[i] = a;
      if (Math.abs(a) > peak) peak = Math.abs(a);
      idx = (idx + 1) % N;
    }
    const norm = peak > 0 ? 0.9 / peak : 1;
    const fade = Math.floor(sr * 0.03);
    for (let i = 0; i < n; i++) {
      let g = norm;
      if (i < 24) g *= i / 24;
      if (i > n - fade) g *= (n - i) / fade;
      out[i] *= g;
    }
    ksCache.set(midi, buf);
    return buf;
  }

  function kora(t, midi, vel) {
    const src = ctx.createBufferSource();
    src.buffer = ksBuffer(midi);
    const body = ctx.createBiquadFilter(); // calabash body resonance
    body.type = 'peaking'; body.frequency.value = 240; body.Q.value = 1.1; body.gain.value = 4;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 4200 + (midi - 50) * 40;
    const g = ctx.createGain();
    g.gain.value = 0.32 * (vel == null ? 0.8 : vel);
    src.connect(body); body.connect(tone); tone.connect(g); g.connect(bus);
    src.start(t);
  }

  /* ---- membrane drum ---- */
  function membrane(t, o) {
    const vel = o.vel == null ? 0.9 : o.vel;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(o.f * (o.drop || 2), t);
    osc.frequency.exponentialRampToValueAtTime(o.f, t + (o.pd || 0.04));
    const g = ctx.createGain();
    env(g, t, vel * (o.body == null ? 0.9 : o.body), 0.002, o.decay || 0.3);
    osc.connect(g); g.connect(bus);
    osc.start(t); osc.stop(t + (o.decay || 0.3) + 0.05);
    if (o.slap) {
      const src = noiseSource(t, 0.12);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = o.slapFreq || 2400; bp.Q.value = o.q || 0.9;
      const ng = ctx.createGain();
      env(ng, t, vel * o.slap, 0.001, o.slapDecay || 0.05);
      src.connect(bp); bp.connect(ng); ng.connect(bus);
    }
  }

  /* ---- FM bell (2-op) ---- */
  function bell(t, f, o) {
    o = o || {};
    const vel = o.vel == null ? 0.6 : o.vel;
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const mg = ctx.createGain();
    const g = ctx.createGain();
    car.frequency.value = f;
    mod.frequency.value = f * (o.ratio || 3.5);
    mg.gain.setValueAtTime(f * (o.index || 2.2), t);
    mg.gain.exponentialRampToValueAtTime(f * 0.05, t + (o.decay || 1.2));
    env(g, t, vel * 0.5, 0.003, o.decay || 1.2);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.connect(bus);
    car.start(t); mod.start(t);
    car.stop(t + (o.decay || 1.2) + 0.1); mod.stop(t + (o.decay || 1.2) + 0.1);
  }

  // Clave: two hardwood sticks, a short bright FM "tock" around 2.5 kHz.
  function clave(t, vel) {
    bell(t, 2450, { ratio: 1.48, index: 0.9, decay: 0.09, vel: (vel == null ? 0.9 : vel) * 1.25 });
  }

  // Cowbell: two detuned squares through a band-pass (the classic machine recipe).
  function cowbell(t, vel) {
    vel = vel == null ? 0.7 : vel;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 820; bp.Q.value = 2.2;
    const g = ctx.createGain();
    env(g, t, vel * 0.28, 0.002, 0.32);
    [562, 845].forEach(function (f) {
      const o = ctx.createOscillator();
      o.type = 'square'; o.frequency.value = f;
      o.connect(bp); o.start(t); o.stop(t + 0.4);
    });
    bp.connect(g); g.connect(bus);
  }

  /* ---- noise: shaker and güiro ---- */
  function shaker(t, vel, o) {
    o = o || {};
    vel = vel == null ? 0.5 : vel;
    const src = noiseSource(t, 0.15);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3800;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = o.f || 7200; bp.Q.value = 0.8;
    const g = ctx.createGain();
    env(g, t, vel * 0.55, o.attack || 0.012, o.decay || 0.07);
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(bus);
  }

  function guiro(t, vel) {
    vel = vel == null ? 0.6 : vel;
    for (let i = 0; i < 11; i++) {
      const tt = t + i * 0.016;
      const src = noiseSource(tt, 0.03);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2900 + i * 60; bp.Q.value = 3;
      const g = ctx.createGain();
      env(g, tt, vel * (0.5 + 0.05 * i), 0.002, 0.018);
      src.connect(bp); bp.connect(g); g.connect(bus);
    }
  }

  /* ---- kick and bass ---- */
  function kick(t, vel) {
    membrane(t, { f: 48, drop: 3, pd: 0.07, decay: 0.42, vel: vel == null ? 1 : vel, slap: 0.05, slapFreq: 900 });
  }

  function bass(t, midi, vel) {
    vel = vel == null ? 0.8 : vel;
    const f = mtof(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(1400, t);
    lp.frequency.exponentialRampToValueAtTime(260, t + 0.35);
    const g = ctx.createGain();
    env(g, t, vel * 0.42, 0.006, 0.55);
    [['triangle', 1, 1], ['sawtooth', 1, 0.18], ['sine', 2, 0.3]].forEach(function (v) {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = v[0]; o.frequency.value = f * v[1]; og.gain.value = v[2];
      o.connect(og); og.connect(lp); o.start(t); o.stop(t + 0.7);
    });
    lp.connect(g); g.connect(bus);
  }

  /* ---- stamp thump ---- */
  function thump(t) {
    membrane(t, { f: 62, drop: 2.2, pd: 0.03, decay: 0.22, vel: 0.9, body: 1 });
    const src = noiseSource(t, 0.08);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    const g = ctx.createGain();
    env(g, t, 0.35, 0.001, 0.06);
    src.connect(lp); lp.connect(g); g.connect(bus);
  }

  /* ---- instruments for the page ---- */
  const V = {
    // samba
    surdo1: (t, v) => membrane(t, { f: 56, drop: 1.7, pd: 0.05, decay: 0.75, vel: v, slap: 0.07, slapFreq: 700 }),
    surdo2: (t, v) => membrane(t, { f: 74, drop: 1.6, pd: 0.045, decay: 0.55, vel: v, slap: 0.07, slapFreq: 800 }),
    tamborim: (t, v) => membrane(t, { f: 690, drop: 1.25, pd: 0.01, decay: 0.07, vel: v, body: 0.55, slap: 0.55, slapFreq: 4200, slapDecay: 0.03 }),
    ganza: (t, v) => shaker(t, v, { f: 7600, attack: 0.008, decay: 0.05 }),
    // Caribbean deck
    clave: (t, v) => clave(t, v),
    conga: (t, v) => membrane(t, { f: 212, drop: 1.28, pd: 0.016, decay: 0.32, vel: v, slap: 0.22, slapFreq: 1800 }),
    slap: (t, v) => membrane(t, { f: 330, drop: 1.2, pd: 0.01, decay: 0.09, vel: v, body: 0.5, slap: 0.95, slapFreq: 3100, q: 1.2, slapDecay: 0.045 }),
    bongo: (t, v) => membrane(t, { f: 432, drop: 1.22, pd: 0.01, decay: 0.13, vel: v, slap: 0.4, slapFreq: 3600 }),
    cowbell: (t, v) => cowbell(t, v),
    maracas: (t, v) => shaker(t, v, { f: 6800, attack: 0.014, decay: 0.06 }),
    guiro: (t, v) => guiro(t, v),
    bass: (t, v) => bass(t, 43, v),
    kick: (t, v) => kick(t, v),
  };

  /* ---- lookahead scheduler ----
     schedule(step, time) is called ahead of time with AudioContext timestamps;
     visual(step) fires on the animation frame when that step is actually heard. */
  let active = null;

  function Loop(opts) {
    this.o = opts;
    this.timer = null;
    this.raf = 0;
    this.queue = [];
  }
  Loop.prototype.start = function () {
    if (!ensure()) return false;
    if (active && active !== this) active.stop();
    active = this;
    this.step = 0;
    this.count = 0;
    this.next = ctx.currentTime + 0.08;
    this.t0 = this.next;
    this.endAt = 0;
    this.queue.length = 0;
    const self = this;
    this.timer = setInterval(function () { self.tick(); }, 25);
    this.tick();
    const frame = function () { self.frame(); if (self.timer || self.queue.length) self.raf = requestAnimationFrame(frame); };
    this.raf = requestAnimationFrame(frame);
    if (this.o.onStart) this.o.onStart();
    return true;
  };
  Loop.prototype.tick = function () {
    const horizon = ctx.currentTime + 0.12;
    while (!this.endAt && this.next < horizon) {
      this.o.schedule(this.step, this.next);
      this.queue.push({ step: this.step, t: this.next });
      this.next += this.o.stepDur(this.step);
      this.step = (this.step + 1) % this.o.steps;
      this.count++;
      if (this.o.maxSteps && this.count >= this.o.maxSteps) this.endAt = this.next;
    }
  };
  Loop.prototype.frame = function () {
    const t = ctx.currentTime;
    while (this.queue.length && this.queue[0].t <= t) {
      const ev = this.queue.shift();
      if (this.o.visual) this.o.visual(ev.step, t - this.t0);
    }
    if (this.o.progress) this.o.progress(t - this.t0);
    if (this.endAt && t >= this.endAt) this.finish();
  };
  Loop.prototype.finish = function () {
    const ended = !!this.timer;
    this.halt();
    if (ended && this.o.onEnd) this.o.onEnd();
  };
  Loop.prototype.halt = function () {
    clearInterval(this.timer);
    this.timer = null;
    cancelAnimationFrame(this.raf);
    this.queue.length = 0;
    if (active === this) active = null;
  };
  Loop.prototype.stop = function () {
    const was = !!this.timer;
    this.halt();
    if (was && this.o.onStop) this.o.onStop();
  };
  Loop.prototype.playing = function () { return !!this.timer; };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && active) active.stop();
  });

  window.Synth = {
    ensure: ensure,
    now: now,
    kora: function (t, midi, vel) { if (ensure()) kora(t, midi, vel); },
    voice: function (name, t, vel) { if (ensure() && V[name]) V[name](t == null ? ctx.currentTime : t, vel); },
    chime: function () { if (!ensure()) return; const t = ctx.currentTime; bell(t, 784, { decay: 1.1, vel: 0.45 }); bell(t + 0.12, 1175, { decay: 1.3, vel: 0.4 }); },
    thump: function (t) { if (ensure()) thump(t == null ? ctx.currentTime : t); },
    Loop: Loop,
    stopAll: function () { if (active) active.stop(); },
  };
})();
