/* SoundMap website: interactions. Plain JS, no build step. */

// Links that don't exist yet. Buttons stay hidden while a value is empty.
const CONFIG = {
  expoUrl: '',
  apkUrl: '',
  githubUrl: 'https://github.com/Ryankline-create/soundmap',
};

(function () {
  'use strict';

  const D = window.SM_DATA;
  const S = window.Synth;
  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  function tween(ms, fn, done) {
    if (reduceMotion || ms <= 0) { fn(1); if (done) done(); return () => {}; }
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      fn(p);
      if (p < 1) raf = requestAnimationFrame(step);
      else if (done) done();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }

  function onVisible(node, fn, threshold) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.35 });
    io.observe(node);
  }

  /* ---------- theme ---------- */

  const root = document.documentElement;
  const themeBtn = $('.theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  function syncTheme() {
    const t = theme();
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    $$('meta[name="theme-color"]').forEach((m) => {
      if (root.getAttribute('data-theme')) m.setAttribute('content', t === 'dark' ? '#140D0A' : '#FAF5EE');
    });
  }
  themeBtn.addEventListener('click', () => {
    const next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sm-theme', next); } catch (e) { /* private mode */ }
    syncTheme();
  });
  systemDark.addEventListener && systemDark.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- CTAs ---------- */

  [['expo', CONFIG.expoUrl], ['apk', CONFIG.apkUrl], ['github', CONFIG.githubUrl]].forEach(([k, url]) => {
    const a = $('[data-cta="' + k + '"]');
    if (!a) return;
    if (url) { a.href = url; a.hidden = false; } else a.hidden = true;
  });

  /* ---------- map pieces ---------- */

  function baseMap(svg, opts) {
    opts = opts || {};
    if (opts.graticule !== false) svgEl('path', { class: 'grat', d: D.graticule }, svg);
    svgEl('path', { class: 'land', d: D.land }, svg);
    svgEl('path', { class: 'borders', d: D.borders }, svg);
  }

  // Teardrop pin with a music-note cutout, echoing the logo. Tip at (13, 31).
  const PIN_INNER =
    '<path class="body" d="M13 31.2c-.5 0-.9-.2-1.2-.6C7.6 25.4 2.5 19.6 2.5 12.9a10.5 10.5 0 0 1 21 0c0 6.7-5.1 12.5-9.3 17.7-.3.4-.7.6-1.2.6z"/>' +
    '<g class="note"><ellipse cx="11.3" cy="16.6" rx="2.6" ry="2.05" transform="rotate(-22 11.3 16.6)"/><path d="M12.9 16.2V7.4l4.6 1.6v2.5l-3.1-1.05v5.75z"/></g>';

  function mapPin(parent, x, y, color) {
    const g = svgEl('g', { class: 'map-pin' }, parent);
    g.style.setProperty('--pin', color);
    g.innerHTML = PIN_INNER;
    g.setAttribute('data-x', x);
    g.setAttribute('data-y', y);
    return g;
  }

  // Keep in-map pins and the plane a constant on-screen size while the camera zooms.
  function unitPx(svg) {
    const vb = svg.viewBox.baseVal;
    const w = svg.clientWidth || 1;
    const h = svg.clientHeight || 1;
    return Math.max(vb.width / w, vb.height / h);
  }
  function placePins(svg) {
    const k = unitPx(svg);
    $$('.map-pin', svg).forEach((g) => {
      const x = +g.getAttribute('data-x');
      const y = +g.getAttribute('data-y');
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + k + ') translate(-13 -31)');
    });
  }

  function frameBox(svg, box, pad) {
    const w = svg.clientWidth || 16;
    const h = svg.clientHeight || 9;
    const aspect = w / h;
    let bw = box.width + pad * 2;
    let bh = box.height + pad * 2;
    if (bw / bh < aspect) bw = bh * aspect; else bh = bw / aspect;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    return [cx - bw / 2, cy - bh / 2, bw, bh];
  }
  function setVB(svg, v) { svg.setAttribute('viewBox', v.map((n) => n.toFixed(1)).join(' ')); }
  function getVB(svg) { const b = svg.viewBox.baseVal; return [b.x, b.y, b.width, b.height]; }

  let maskId = 0;

  // A guess → answer flight: camera eases to frame both points, then a dashed
  // great-circle arc draws (1.6s) with a plane riding its tangent.
  function Flight(svg, opts) {
    const id = 'fm' + (++maskId);
    const defs = svgEl('defs', {}, svg);
    const mask = svgEl('mask', { id: id, maskUnits: 'userSpaceOnUse', x: -500, y: -500, width: 2000, height: 1600 }, defs);
    const maskPath = svgEl('path', { fill: 'none', stroke: '#fff', 'stroke-width': 30, 'stroke-linecap': 'round' }, mask);
    const g = svgEl('g', { class: 'flight' }, svg);
    const arc = svgEl('path', { class: 'arc-path', mask: 'url(#' + id + ')' }, g);
    const pins = svgEl('g', {}, svg);
    const plane = svgEl('use', { href: '#g-plane', class: 'plane', width: 24, height: 24 }, svg);
    plane.style.display = 'none';
    let cancel = () => {};
    let guessPin = null;
    let answerPin = null;

    this.run = function (a, done) {
      cancel();
      arc.setAttribute('d', a.d);
      maskPath.setAttribute('d', a.d);
      const L = arc.getTotalLength();
      maskPath.setAttribute('stroke-dasharray', L + ' ' + L);
      maskPath.setAttribute('stroke-dashoffset', L);
      pins.innerHTML = '';
      guessPin = mapPin(pins, a.from[0], a.from[1], opts.guessColor);
      answerPin = null;
      plane.style.display = 'none';
      const from = getVB(svg);
      const to = frameBox(svg, arc.getBBox(), opts.pad || 60);
      placePins(svg);
      const fly = () => {
        plane.style.display = '';
        cancel = tween(1600, (p) => {
          const e = ease(p);
          maskPath.setAttribute('stroke-dashoffset', L * (1 - e));
          const pt = arc.getPointAtLength(L * e);
          const ahead = arc.getPointAtLength(Math.min(L, L * e + 2));
          const behind = arc.getPointAtLength(Math.max(0, L * e - 2));
          const ang = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
          const k = unitPx(svg);
          plane.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ') rotate(' + ang + ') scale(' + k + ') translate(-12 -12)');
          if (opts.onProgress) opts.onProgress(e, a);
        }, () => {
          plane.style.display = 'none';
          answerPin = mapPin(pins, a.to[0], a.to[1], opts.answerColor);
          placePins(svg);
          if (!reduceMotion) answerPin.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
          if (done) done();
        });
      };
      cancel = tween(opts.cameraMs == null ? 700 : opts.cameraMs, (p) => {
        const e = ease(p);
        setVB(svg, from.map((v, i) => v + (to[i] - v) * e));
        placePins(svg);
      }, fly);
    };
    window.addEventListener('resize', () => placePins(svg));
  }

  const cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  /* ---------- listening dial ---------- */

  function Dial(rootEl, opts) {
    const segG = $('.dial-segments', rootEl);
    const pulse = $('.pulse', rootEl);
    const btn = $('.dial-btn', rootEl);
    const ring2 = $('.ring-2', rootEl);
    const N = opts.segments || 24;
    const segs = [];
    const R = 108;
    const gap = 3.2; // degrees
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * 360 - 90 + gap / 2;
      const a1 = ((i + 1) / N) * 360 - 90 - gap / 2;
      const p = (a) => [120 + R * Math.cos(a * Math.PI / 180), 120 + R * Math.sin(a * Math.PI / 180)];
      const s = p(a0); const e = p(a1);
      segs.push(svgEl('path', { class: 'seg', d: 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + 'A' + R + ' ' + R + ' 0 0 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2) }, segG));
    }
    const setProgress = (f) => {
      const on = Math.min(N, Math.floor(f * N + 0.0001));
      segs.forEach((s, i) => s.classList.toggle('on', i < on));
    };
    const beat = () => {
      if (reduceMotion) return;
      pulse.animate([{ transform: 'scale(1)', opacity: 0.75 }, { transform: 'scale(1.62)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
      ring2.animate([{ transform: 'scale(1.025)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
    };
    const loop = new S.Loop({
      steps: opts.steps,
      stepDur: opts.stepDur,
      maxSteps: opts.maxSteps,
      schedule: opts.schedule,
      visual: (step) => { if (opts.isBeat(step)) beat(); },
      progress: (t) => { t = Math.max(0, t); setProgress(t / opts.duration); if (opts.onTime) opts.onTime(t); },
      onStart: () => { rootEl.classList.add('playing'); btn.setAttribute('aria-label', opts.stopLabel || 'Stop'); },
      onStop: () => reset(),
      onEnd: () => { setProgress(1); reset(true); if (opts.onEnd) opts.onEnd(); },
    });
    function reset(keep) {
      rootEl.classList.remove('playing');
      btn.setAttribute('aria-label', opts.playLabel);
      if (!keep) setProgress(0);
    }
    btn.addEventListener('click', () => {
      if (loop.playing()) loop.stop();
      else { setProgress(0); loop.start(); }
    });
    this.loop = loop;
  }

  /* Kora groove: 12 pulses per bar, 4 bars, 0.125 s per pulse = 6 seconds.
     Thumbs keep a repeating bass (kumbengo style) on the strong pulses while the
     index fingers answer in between, over F, B-flat, F and C. */
  const KORA_BARS = [
    [[0, 41, 1], [2, 60, 0.55], [3, 53, 0.7], [4, 69, 0.8], [6, 48, 0.85], [7, 67, 0.55], [8, 69, 0.7], [9, 57, 0.6], [10, 72, 0.8], [11, 69, 0.5]],
    [[0, 46, 1], [2, 62, 0.55], [3, 53, 0.7], [4, 70, 0.8], [6, 50, 0.85], [7, 69, 0.55], [8, 67, 0.7], [9, 58, 0.6], [10, 65, 0.75], [11, 62, 0.5]],
    [[0, 41, 1], [2, 60, 0.55], [3, 53, 0.7], [4, 69, 0.8], [6, 48, 0.85], [7, 72, 0.6], [8, 69, 0.7], [9, 57, 0.6], [10, 67, 0.75], [11, 65, 0.55]],
    [[0, 48, 1], [2, 64, 0.55], [3, 55, 0.7], [4, 67, 0.8], [6, 43, 0.85], [7, 64, 0.55], [8, 65, 0.7], [9, 58, 0.6], [10, 67, 0.8], [11, 64, 0.55]],
  ];
  const koraAt = KORA_BARS.map((bar) => {
    const m = new Map();
    bar.forEach(([p, midi, v]) => m.set(p, [midi, v]));
    return m;
  });
  const koraDial = (el, extra) => new Dial(el, Object.assign({
    steps: 48,
    stepDur: () => 0.125,
    maxSteps: 48,
    duration: 6,
    segments: 24,
    isBeat: (s) => s % 3 === 0,
    schedule: (s, t) => {
      const n = koraAt[Math.floor(s / 12)].get(s % 12);
      if (n) S.kora(t, n[0], n[1]);
    },
  }, extra));

  /* ---------- 1 · hero ---------- */

  const heroTime = $('[data-dial-time]');
  koraDial($('[data-dial="hero"]'), {
    playLabel: 'Play the mystery groove',
    stopLabel: 'Stop the groove',
    onTime: (t) => { heroTime.textContent = '0:0' + Math.min(6, Math.floor(t)); },
    onEnd: () => { heroTime.textContent = '0:06'; },
  });

  const panel = $('.reveal-panel');
  const heroSvg = $('[data-map="hero"]');
  baseMap(heroSvg);
  const kmOut = $('[data-km]', panel);
  const verdict = $('[data-verdict]', panel);
  const heroFlight = new Flight(heroSvg, {
    guessColor: 'var(--ink)',
    answerColor: 'var(--ink-africa)',
    pad: 70,
    onProgress: (e, a) => { kmOut.textContent = fmt(a.km * e); },
  });
  const chips = $('.chips');
  function guess(key, silent) {
    const g = D.hero.guesses[key];
    $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.guess === key)));
    chips.classList.add('decided');
    const first = panel.hidden;
    panel.hidden = false;
    verdict.textContent = '';
    if (first) setVB(heroSvg, [0, 20, 1000, 480]);
    requestAnimationFrame(() => {
      if (first && !silent) panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      heroFlight.run(g, () => {
        kmOut.textContent = fmt(g.km);
        verdict.textContent = key === 'africa' ? 'from your guess. Right continent.' : 'from your guess to Mali.';
        if (key === 'africa' && !silent) S.chime();
      });
    });
  }
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) guess(c.dataset.guess);
  });
  if (params.get('guess') && D.hero.guesses[params.get('guess')]) guess(params.get('guess'), true);

  /* ---------- 3 · how it works ---------- */

  // Listen: a batucada pattern for the round-1 dial (samba, Rio).
  // 16 sixteenths = two bars of 2/4. Surdo de segunda answers on beat 1 and the
  // deeper surdo de primeira marks beat 2; tamborim plays a teleco-teco phrase;
  // the ganzá runs sixteenths with a lift on the last one of each beat.
  const SAMBA = {
    surdo2: [0, 8], surdo1: [4, 12],
    tamborim: [0, 2, 5, 7, 9, 12, 14],
  };
  new Dial($('[data-dial="samba"]'), {
    steps: 16,
    stepDur: () => 0.145,
    maxSteps: 64,
    duration: 64 * 0.145,
    segments: 16,
    playLabel: 'Play round 1',
    stopLabel: 'Stop round 1',
    isBeat: (s) => s % 4 === 0,
    schedule: (s, t) => {
      if (SAMBA.surdo2.includes(s)) S.voice('surdo2', t, 0.95);
      if (SAMBA.surdo1.includes(s)) S.voice('surdo1', t, 1);
      if (SAMBA.tamborim.includes(s)) S.voice('tamborim', t, 0.55);
      S.voice('ganza', t, s % 4 === 3 ? 0.42 : 0.2);
    },
  });

  // Guess: a pin in Brazil flies to Rio.
  const flightSvg = $('[data-map="flight"]');
  baseMap(flightSvg);
  const fKm = $('[data-flight-km]');
  const fXp = $('[data-flight-xp]');
  const stepFlight = new Flight(flightSvg, {
    guessColor: 'var(--ink)',
    answerColor: 'var(--ink-americas)',
    pad: 120,
    onProgress: (e, a) => {
      fKm.textContent = fmt(a.km * e);
      fXp.textContent = '+' + Math.round(95 * e) + ' XP';
    },
  });
  const runFlight = () => { setVB(flightSvg, [0, 0, 1000, 520]); stepFlight.run(D.flight); };
  onVisible(flightSvg, runFlight, 0.5);
  $('[data-flight-replay]').addEventListener('click', runFlight);

  // Stamp: rubber stamps in region ink, in the app's three shapes (circle with
  // text on a path, double-bordered rectangle, postmark with wavy lines), with an
  // ink-grain mask. A new stamp lands with a thunk.
  let stampUid = 0;
  const GRAIN =
    '<filter id="ink-grain" x="-5%" y="-5%" width="110%" height="110%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="m"/>' +
    '<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>';
  const HEAVY = 'font-family="Hanken Grotesk, sans-serif" font-weight="800"';
  const MONO = 'font-family="DM Mono, monospace" font-weight="500"';
  const glyphUse = (id, x, y, s) => '<use href="#' + id + '" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

  function stampSVG(shape, place, date, glyph) {
    const u = 'st' + (++stampUid);
    let body = '';
    if (shape === 'circle') {
      body =
        '<defs><path id="' + u + 't" d="M34 100A66 66 0 0 1 166 100"/><path id="' + u + 'b" d="M26 100A74 74 0 0 0 174 100"/></defs>' +
        '<circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="5"/>' +
        '<circle cx="100" cy="100" r="83" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<circle cx="100" cy="100" r="47" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<text fill="currentColor" ' + HEAVY + ' font-size="17" letter-spacing="2.4"><textPath href="#' + u + 't" startOffset="50%" text-anchor="middle">' + place + '</textPath></text>' +
        '<text fill="currentColor" ' + MONO + ' font-size="13" letter-spacing="1.5"><textPath href="#' + u + 'b" startOffset="50%" text-anchor="middle">' + date + '</textPath></text>' +
        '<circle cx="18" cy="100" r="2.6" fill="currentColor"/><circle cx="182" cy="100" r="2.6" fill="currentColor"/>' +
        glyphUse(glyph, 72, 72, 56);
    } else if (shape === 'rect') {
      body =
        '<rect x="12" y="44" width="176" height="112" rx="14" fill="none" stroke="currentColor" stroke-width="5"/>' +
        '<rect x="22" y="54" width="156" height="92" rx="7" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        glyphUse(glyph, 31, 81, 38) +
        '<line x1="78" y1="66" x2="78" y2="134" stroke="currentColor" stroke-width="1.6"/>' +
        '<text x="89" y="92" fill="currentColor" ' + HEAVY + ' font-size="15" letter-spacing="1">' + place.split(' ').slice(0, 1).join(' ') + '</text>' +
        '<text x="89" y="110" fill="currentColor" ' + HEAVY + ' font-size="15" letter-spacing="1">' + place.split(' ').slice(1).join(' ') + '</text>' +
        '<text x="89" y="132" fill="currentColor" ' + MONO + ' font-size="10" letter-spacing=".4">' + date + '</text>';
    } else {
      body =
        '<defs><path id="' + u + 't" d="M24 92A50 50 0 0 1 124 92"/><path id="' + u + 'b" d="M18 92A56 56 0 0 0 130 92"/></defs>' +
        '<circle cx="74" cy="92" r="66" fill="none" stroke="currentColor" stroke-width="4"/>' +
        '<circle cx="74" cy="92" r="35" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<text fill="currentColor" ' + HEAVY + ' font-size="15" letter-spacing="2.2"><textPath href="#' + u + 't" startOffset="50%" text-anchor="middle">' + place + '</textPath></text>' +
        '<text fill="currentColor" ' + MONO + ' font-size="11" letter-spacing="1.2"><textPath href="#' + u + 'b" startOffset="50%" text-anchor="middle">' + date + '</textPath></text>' +
        glyphUse(glyph, 54, 72, 40) +
        [70, 92, 114].map((y) => '<path d="M146 ' + y + 'q7 -7 14 0t14 0t14 0" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>').join('');
    }
    return '<svg class="stamp" viewBox="0 0 200 200" role="img" aria-label="Passport stamp: ' + place + ', ' + date + '"><defs>' + GRAIN + '</defs><g filter="url(#ink-grain)">' + body + '</g></svg>';
  }
  function stampDate(daysAgo) {
    const d = new Date(Date.now() - daysAgo * 864e5);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  // Two stamps already in this passport (the demo's New Orleans and Ireland).
  const pre = {
    rect: { place: 'NEW ORLEANS', date: stampDate(9), glyph: 'g-trumpet', ink: 'var(--ink-americas)', rot: 3.5 },
    postmark: { place: 'IRELAND', date: stampDate(4), glyph: 'g-fiddle', ink: 'var(--ink-europe)', rot: -3 },
  };
  $$('[data-prestamp]').forEach((w) => {
    const p = pre[w.dataset.prestamp];
    w.innerHTML = stampSVG(w.dataset.prestamp, p.place, p.date, p.glyph);
    const svg = $('.stamp', w);
    svg.style.color = p.ink;
    svg.style.transform = 'rotate(' + p.rot + 'deg)';
  });

  const stampWrap = $('[data-stamp]');
  const stampBtn = $('[data-stamp-btn]');
  stampBtn.addEventListener('click', () => {
    stampWrap.innerHTML = stampSVG('circle', 'RIO DE JANEIRO', 'SAMBA · ' + stampDate(0), 'g-cuica');
    stampWrap.hidden = false;
    stampWrap.parentElement.classList.add('filled');
    const svg = $('.stamp', stampWrap);
    stampBtn.textContent = 'Stamp it again';
    if (reduceMotion) { svg.style.transform = 'rotate(-6deg)'; S.thump(); return; }
    svg.animate([
      { transform: 'scale(1.45) rotate(-13deg)', opacity: 0 },
      { transform: 'scale(.96) rotate(-6deg)', opacity: 0.92, offset: 0.55 },
      { transform: 'scale(1.015) rotate(-4.6deg)', offset: 0.7 },
      { transform: 'scale(1) rotate(-7deg)', offset: 0.84 },
      { transform: 'scale(1) rotate(-6deg)', opacity: 0.92 },
    ], { duration: 460, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
    const ctx = S.ensure();
    if (ctx) S.thump(ctx.currentTime + 0.24);
    $('.passport-page').animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(1px,2px)', offset: 0.6 }, { transform: 'translate(-1px,-1px)', offset: 0.75 }, { transform: 'translate(0,0)' },
    ], { duration: 420, delay: 230 });
  });

  // Story: three slides from the samba lesson, tap or swipe to advance.
  const SLIDES = [
    { kind: 'Listen first', title: "Carnival's engine room", body: "In Rio's working class neighborhoods, samba schools grew out of community dance halls. Each school rehearses a bateria of hundreds of drummers to drive one parade." },
    { kind: 'The instrument', title: 'Cuíca, the laughing drum', body: 'A friction drum. The player rubs a thin stick inside the drum with one hand while pressing the skin outside with the other.' },
    { kind: 'People and places', title: "Tia Ciata's house", body: 'Hilária Batista de Almeida, known as Tia Ciata, was a Bahian woman in Rio who hosted the parties where early samba was played.' },
  ];
  const story = $('[data-story]');
  const bars = $('.story-bars', story);
  const sBody = $('.story-body', story);
  const sCount = $('[data-story-count]', story);
  let slide = 0;
  SLIDES.forEach(() => bars.appendChild(document.createElement('span')));
  function showSlide(i) {
    slide = (i + SLIDES.length) % SLIDES.length;
    const s = SLIDES[slide];
    sBody.innerHTML = '<p class="label">' + s.kind + '</p><h4>' + s.title + '</h4><p>' + s.body + '</p>';
    $$('span', bars).forEach((b, j) => b.classList.toggle('on', j <= slide));
    sCount.textContent = slide + 1 + ' / ' + SLIDES.length;
    if (!reduceMotion) sBody.animate([{ opacity: 0, transform: 'translateX(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
  }
  $('[data-story-next]', story).addEventListener('click', (e) => { e.stopPropagation(); showSlide(slide + 1); });
  $('[data-story-prev]', story).addEventListener('click', (e) => { e.stopPropagation(); showSlide(slide - 1); });
  story.addEventListener('click', (e) => {
    const r = story.getBoundingClientRect();
    showSlide(e.clientX - r.left > r.width * 0.35 ? slide + 1 : slide - 1);
  });
  story.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); showSlide(slide + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(slide - 1); }
  });
  let touchX = null;
  story.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  story.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) { e.preventDefault(); showSlide(slide + (dx < 0 ? 1 : -1)); }
  });
  showSlide(0);

  /* ---------- 4 · 19 listening journeys ---------- */

  // Display nudges (map units) so neighbouring pins don't sit on top of each other.
  const NUDGE = {
    fado: [-9, 2], flamenco: [3, -5], rai: [12, 4], gnawa: [-6, 10],
    highlife: [-7, 2], afrobeat: [7, -1], salsa: [2, -3],
  };
  const atlasSvg = $('[data-map="atlas"]');
  baseMap(atlasSvg);
  const pinsBox = $('.pins');
  const card = $('.atlas-card');
  const filter = $('.region-filter');
  const index = $('.index');
  const ORDER = ['americas', 'africa', 'asia', 'mena', 'europe'];
  let selected = 'kora';
  let region = null;

  D.pins.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pin r-' + p.region;
    const n = NUDGE[p.slug] || [0, 0];
    b.style.left = ((p.x + n[0]) / D.map.w) * 100 + '%';
    b.style.top = ((p.y + n[1]) / D.map.h) * 100 + '%';
    b.dataset.slug = p.slug;
    b.setAttribute('aria-label', p.short + ', ' + p.place);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<svg viewBox="0 0 26 32" aria-hidden="true">' + PIN_INNER + '</svg>';
    b.addEventListener('click', () => select(p.slug));
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') select(p.slug); });
    b.addEventListener('focus', () => select(p.slug));
    pinsBox.appendChild(b);
  });

  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'rchip';
  all.innerHTML = 'All <span class="mono">19</span>';
  all.setAttribute('aria-pressed', 'true');
  all.addEventListener('click', () => setRegion(null));
  filter.appendChild(all);
  ORDER.forEach((r) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rchip r-' + r;
    b.dataset.region = r;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<i aria-hidden="true"></i>' + D.regions[r] + ' <span class="mono">' + D.pins.filter((p) => p.region === r).length + '</span>';
    b.addEventListener('click', () => setRegion(region === r ? null : r));
    filter.appendChild(b);

    const col = document.createElement('div');
    col.className = 'r-' + r;
    col.innerHTML = '<h3>' + D.regions[r] + '</h3>';
    const ul = document.createElement('ul');
    D.pins.filter((p) => p.region === r).forEach((p) => {
      const li = document.createElement('li');
      const ib = document.createElement('button');
      ib.type = 'button';
      ib.dataset.slug = p.slug;
      ib.textContent = p.short;
      ib.addEventListener('click', () => {
        select(p.slug);
        if (window.innerWidth < 900) card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
      li.appendChild(ib);
      ul.appendChild(li);
    });
    col.appendChild(ul);
    index.appendChild(col);
  });

  function setRegion(r) {
    region = r;
    $$('.rchip', filter).forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.region || null) === r)));
    $$('.pin', pinsBox).forEach((b) => {
      const p = D.pins.find((q) => q.slug === b.dataset.slug);
      b.classList.toggle('dim', !!r && p.region !== r);
    });
    if (r) {
      const cur = D.pins.find((p) => p.slug === selected);
      if (cur.region !== r) select(D.pins.find((p) => p.region === r).slug);
    }
  }

  function select(slug) {
    selected = slug;
    const p = D.pins.find((q) => q.slug === slug);
    card.className = 'atlas-card card r-' + p.region;
    card.innerHTML =
      '<p class="label">' + D.regions[p.region] + ' · Stamp: ' + p.stamp + '</p>' +
      '<h3>' + p.title + '</h3>' +
      '<p class="where">' + p.place + ' · ' + p.era + '</p>' +
      '<p>' + p.summary + '</p>';
    $$('.pin', pinsBox).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.slug === slug)));
    $$('button', index).forEach((b) => b.setAttribute('aria-current', String(b.dataset.slug === slug)));
  }
  select(selected);

  /* ---------- 5 · family tree ---------- */

  const treeSvg = $('[data-map="tree"]');
  setVB(treeSvg, [180, 64, 440, 344]);
  baseMap(treeSvg);
  const list = $('.tree-list');
  const treeLabels = [];
  const groups = D.tree.map((t, i) => {
    const g = svgEl('g', { class: 'tree-g r-' + t.region }, treeSvg);
    const paths = t.legs.map((leg) => svgEl('path', { class: 'tree-arc', d: leg.d }, g));
    t.labels.forEach(([name, x, y]) => {
      const dot = svgEl('circle', { class: 'tree-node', cx: x, cy: y, r: 3.2 }, g);
      const tx = svgEl('text', { class: 'map-label', x: x + 6, y: y - 6 }, g);
      tx.textContent = name;
      treeLabels.push({ dot, tx, x, y });
    });
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tree-item r-' + t.region;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="mono">0' + (i + 1) + '</span><strong>' + t.title + '</strong><span class="cap">' + t.caption + '</span>';
    b.addEventListener('click', () => showTree(i, true));
    li.appendChild(b);
    list.appendChild(li);
    return { g, paths, b };
  });
  function drawPaths(paths, ms) {
    paths.forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L + ' ' + L;
      p.style.strokeDashoffset = L;
    });
    let k = 0;
    const next = () => {
      if (k >= paths.length) return;
      const p = paths[k++];
      const L = p.getTotalLength();
      tween(ms, (e) => { p.style.strokeDashoffset = L * (1 - ease(e)); }, next);
    };
    next();
  }
  let treeTimer = 0;
  function showTree(i, user) {
    if (user) clearTimeout(treeTimer);
    groups.forEach((gr, j) => {
      gr.g.classList.toggle('on', j === i);
      gr.g.classList.toggle('dim', j !== i);
      gr.b.setAttribute('aria-pressed', String(j === i));
    });
    drawPaths(groups[i].paths, 900);
    if (!user && !reduceMotion) treeTimer = setTimeout(() => showTree((i + 1) % groups.length, false), 4200);
  }
  // Labels and nodes keep the same on-screen size whatever the map width.
  function sizeTreeLabels() {
    const k = unitPx(treeSvg);
    treeLabels.forEach(({ dot, tx, x, y }) => {
      dot.setAttribute('r', (4 * k).toFixed(2));
      tx.setAttribute('font-size', (13 * k).toFixed(2));
      tx.setAttribute('x', (x + 7 * k).toFixed(1));
      tx.setAttribute('y', (y - 7 * k).toFixed(1));
    });
  }
  sizeTreeLabels();
  window.addEventListener('resize', sizeTreeLabels);
  groups.forEach((gr) => gr.g.classList.add('on'));
  onVisible(treeSvg, () => showTree(0, false), 0.4);

  /* ---------- 6 · SoundDeck ---------- */

  const PADS = [
    { id: 'clave', label: 'Clave', glyph: 'g-clave' },
    { id: 'conga', label: 'Conga', glyph: 'g-conga' },
    { id: 'slap', label: 'Conga slap', glyph: 'g-conga' },
    { id: 'bongo', label: 'Bongó', glyph: 'g-bongo' },
    { id: 'cowbell', label: 'Cowbell', glyph: 'g-bell' },
    { id: 'maracas', label: 'Maracas', glyph: 'g-shaker' },
    { id: 'guiro', label: 'Güiro', glyph: 'g-guiro' },
    { id: 'bass', label: 'Bass', glyph: 'g-guitar' },
  ];
  // Son montuno sketch: son clave 3-2 (0,3,6,10,12); conga tumbao with the
  // slap on beat 2 and open tones on 4 and 4-and; cowbell on the beats;
  // maracas in eighths; tumbao bass anticipating on 2-and and 4.
  const PRESET = {
    clave: [0, 3, 6, 10, 12],
    conga: [12, 14],
    slap: [4],
    bongo: [],
    cowbell: [0, 4, 8, 12],
    maracas: [0, 2, 4, 6, 8, 10, 12, 14],
    guiro: [],
    bass: [6, 12],
  };
  const VEL = { clave: 0.95, conga: 0.85, slap: 0.85, bongo: 0.7, cowbell: 0.45, maracas: 0.32, guiro: 0.5, bass: 0.9 };

  const deck = $('[data-deck]');
  const padBox = $('.pads', deck);
  const seq = $('.seq', deck);
  const led = $('[data-led]', deck);
  const bpmIn = $('[data-bpm]', deck);
  const bpmOut = $('[data-bpm-out]', deck);
  const stepOut = $('[data-step-out]', deck);
  const playBtn = $('[data-deck-play]', deck);
  const playLabel = $('[data-deck-play-label]', deck);
  let bpm = 100;
  const grid = PADS.map((p) => new Array(16).fill(false));
  const cells = PADS.map(() => []);

  const padEls = PADS.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pad';
    b.setAttribute('aria-label', 'Play ' + p.label);
    b.innerHTML = '<kbd>' + (i + 1) + '</kbd><svg class="ico" aria-hidden="true"><use href="#' + p.glyph + '"/></svg><span>' + p.label + '</span>';
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); hitPad(i); });
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hitPad(i); } });
    padBox.appendChild(b);
    return b;
  });
  function flash(i) {
    const b = padEls[i];
    b.classList.add('hit');
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('hit'), 110);
  }
  function hitPad(i) {
    S.voice(PADS[i].id, null, VEL[PADS[i].id]);
    flash(i);
  }

  // header row: step numbers
  seq.appendChild(document.createElement('span'));
  for (let s = 0; s < 16; s++) {
    const h = document.createElement('span');
    h.className = 'steps-row' + (s % 4 === 0 ? ' b' : '');
    h.textContent = s % 4 === 0 ? String(s / 4 + 1) : '·';
    h.setAttribute('aria-hidden', 'true');
    seq.appendChild(h);
  }
  let painting = null;
  PADS.forEach((p, r) => {
    const lab = document.createElement('span');
    lab.className = 'rl';
    lab.textContent = p.label;
    seq.appendChild(lab);
    for (let s = 0; s < 16; s++) {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'cell' + (Math.floor(s / 4) % 2 === 0 ? '' : ' beat');
      c.setAttribute('aria-label', p.label + ', step ' + (s + 1));
      c.setAttribute('aria-pressed', 'false');
      c.dataset.r = r;
      c.dataset.s = s;
      c.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        e.preventDefault();
        painting = !grid[r][s];
        setCell(r, s, painting, true);
      });
      c.addEventListener('pointerenter', (e) => {
        if (painting !== null && e.pointerType === 'mouse' && e.buttons === 1) setCell(r, s, painting, true);
      });
      c.addEventListener('click', (e) => {
        if (e.detail > 0 && e.pointerType === 'mouse') return;
        if (painting !== null) return;
        setCell(r, s, !grid[r][s], true);
      });
      seq.appendChild(c);
      cells[r][s] = c;
    }
  });
  window.addEventListener('pointerup', () => { setTimeout(() => { painting = null; }, 0); });

  function setCell(r, s, on, audition) {
    grid[r][s] = on;
    cells[r][s].classList.toggle('on', on);
    cells[r][s].setAttribute('aria-pressed', String(on));
    if (on && audition && !deckLoop.playing()) S.voice(PADS[r].id, null, VEL[PADS[r].id] * 0.8);
  }
  function loadPreset() {
    PADS.forEach((p, r) => { for (let s = 0; s < 16; s++) setCell(r, s, PRESET[p.id].includes(s), false); });
  }

  let lastCol = -1;
  function playhead(s) {
    if (lastCol >= 0) cells.forEach((row) => row[lastCol].classList.remove('ph'));
    if (s >= 0) cells.forEach((row) => row[s].classList.add('ph'));
    lastCol = s;
  }
  const deckLoop = new S.Loop({
    steps: 16,
    stepDur: () => 60 / bpm / 4,
    schedule: (s, t) => {
      PADS.forEach((p, r) => {
        if (!grid[r][s]) return;
        const accent = s % 4 === 0 ? 1 : 0.86;
        S.voice(p.id, t, VEL[p.id] * accent);
      });
    },
    visual: (s) => {
      playhead(s);
      stepOut.textContent = String(s + 1).padStart(2, '0');
      led.classList.toggle('on', s % 4 === 0);
      PADS.forEach((p, r) => { if (grid[r][s]) flash(r); });
    },
    onStart: () => { deck.classList.add('playing'); playLabel.textContent = 'Stop'; playBtn.setAttribute('aria-label', 'Stop the loop'); },
    onStop: () => {
      deck.classList.remove('playing');
      playLabel.textContent = 'Play';
      playBtn.setAttribute('aria-label', 'Play the loop');
      playhead(-1);
      led.classList.remove('on');
      stepOut.textContent = '--';
    },
  });
  playBtn.addEventListener('click', () => { if (deckLoop.playing()) deckLoop.stop(); else deckLoop.start(); });
  bpmIn.addEventListener('input', () => { bpm = +bpmIn.value; bpmOut.textContent = String(bpm); });
  $('[data-deck-clear]', deck).addEventListener('click', () => {
    PADS.forEach((p, r) => { for (let s = 0; s < 16; s++) setCell(r, s, false, false); });
  });
  $('[data-deck-preset]', deck).addEventListener('click', () => { loadPreset(); bpm = 100; bpmIn.value = 100; bpmOut.textContent = '100'; });
  loadPreset();

  let deckInView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { deckInView = es[0].isIntersecting; }, { threshold: 0.2 }).observe(deck);
  }
  document.addEventListener('keydown', (e) => {
    if (!deckInView || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 8) hitPad(n - 1);
  });

  /* ---------- 10 · close ---------- */

  koraDial($('[data-dial="close"]'), {
    playLabel: 'Play the opening sound again',
    stopLabel: 'Stop the sound',
  });

  /* ---------- layout check for headless verification: ?check=1 ---------- */

  if (params.get('check')) {
    setTimeout(() => {
      const out = document.createElement('pre');
      out.id = 'sm-check';
      out.textContent = JSON.stringify({
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        ok: root.scrollWidth === window.innerWidth,
        height: root.scrollHeight,
        wide: $$('body *').filter((n) => n.getBoundingClientRect().right > window.innerWidth + 0.5 && !n.closest('svg')).slice(0, 6).map((n) => n.tagName + '.' + n.className),
      });
      document.body.appendChild(out);
    }, 600);
  }
})();
