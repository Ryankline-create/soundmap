// Builds website/data.js: the land + border paths, the 19 lesson pins and the
// great-circle arcs the website draws. Uses the same Equal Earth fit as
// scripts/build-map.mjs, so pins sit where they do in the app.
// Dev-only. Run once and commit the output: node scripts/build-web.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoDistance, geoEqualEarth, geoGraticule, geoInterpolate, geoPath } from 'd3-geo';
import { feature, merge, mesh } from 'topojson-client';
import { LESSON_META, REGIONS, REGION_LABELS } from './lesson-meta.mjs';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-110m.json');
const lessons = JSON.parse(readFileSync(new URL('../docs/content/lessons.json', import.meta.url), 'utf8')).lessons;

const W = 1000;
const H = 520;
const PAD = 6;
const DROP = new Set(['Antarctica', 'Fr. S. Antarctic Lands']);

const keptGeoms = topo.objects.countries.geometries.filter((g) => !DROP.has(g.properties.name));
const kept = feature(topo, { type: 'GeometryCollection', geometries: keptGeoms }).features;
const projection = geoEqualEarth().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], { type: 'FeatureCollection', features: kept });
const path = geoPath(projection).digits(1);
const r1 = (v) => Math.round(v * 10) / 10;
const xy = (p) => projection([p.lng, p.lat]).map(r1);

const land = path(merge(topo, keptGeoms));
const borders = path(mesh(topo, { type: 'GeometryCollection', geometries: keptGeoms }, (a, b) => a !== b));
const graticule = path(geoGraticule().extent([[-180, -60], [180.01, 84]]).step([30, 30])());

// Great-circle arc as a path, sampled in lat/lng and projected.
function arc(from, to, samples = 60) {
  const interp = geoInterpolate([from.lng, from.lat], [to.lng, to.lat]);
  const pts = [];
  for (let i = 0; i <= samples; i++) pts.push(projection(interp(i / samples)).map(r1));
  return {
    d: 'M' + pts.map((p) => p.join(',')).join('L'),
    from: xy(from),
    to: xy(to),
    km: Math.round(geoDistance([from.lng, from.lat], [to.lng, to.lat]) * 6371),
  };
}

const pins = lessons.map((l) => {
  const m = LESSON_META[l.slug];
  const [x, y] = xy(m.pin);
  return {
    slug: l.slug,
    title: l.title,
    short: l.title.split(':')[0].trim(),
    place: l.place,
    era: l.era,
    summary: l.summary,
    region: REGIONS[l.region],
    stamp: m.stamp,
    x,
    y,
  };
});

const pt = (name, lat, lng) => ({ name, lat, lng });
const bamako = pt('Mali', 12.64, -8.0);
const rio = pt('Rio de Janeiro', -22.91, -43.17);
const newYork = pt('New York', 40.8, -73.94);

const data = {
  map: { w: W, h: H },
  land,
  borders,
  graticule,
  regions: REGION_LABELS,
  pins,
  // Hero: the listener's guess flies to the answer.
  hero: {
    answer: xy(bamako),
    guesses: {
      africa: { label: 'Africa?', ...arc(pt('Central Africa', 7.0, 20.0), bamako) },
      southAmerica: { label: 'South America?', ...arc(pt('Brazil', -10.0, -55.0), bamako) },
      asia: { label: 'Somewhere in Asia?', ...arc(pt('India', 22.0, 79.0), bamako) },
    },
  },
  // How it works: a pin dropped in Brazil, answer Rio (the samba round).
  flight: arc(pt('Your pin', -8.0, -58.0), rio),
  // Family tree, using the client's three examples.
  tree: [
    {
      id: 'blues',
      region: 'africa',
      title: 'Mali to the blues to New Orleans',
      caption: 'Griot music from Mali echoes through the blues into New Orleans jazz.',
      legs: [arc(bamako, pt('the American South', 34.2, -90.57)), arc(pt('the American South', 34.2, -90.57), pt('New Orleans', 29.95, -90.07), 20)],
      labels: [['Mali', ...xy(bamako)], ['The blues', ...xy(pt('', 34.2, -90.57))], ['New Orleans', ...xy(pt('', 29.95, -90.07))]],
    },
    {
      id: 'samba',
      region: 'africa',
      title: 'Angola and the Congo to samba',
      caption: 'Rhythms from Angola and the Congo became the heartbeat of samba.',
      legs: [arc(pt('Angola', -8.84, 13.23), rio), arc(pt('the Congo', -4.32, 15.31), rio)],
      labels: [['Angola', ...xy(pt('', -8.84, 13.23))], ['Congo', ...xy(pt('', -4.32, 15.31))], ['Rio', ...xy(rio)]],
    },
    {
      id: 'salsa',
      region: 'americas',
      title: 'Cuba and Puerto Rico to salsa',
      caption: 'Cuban and Puerto Rican musicians in New York created salsa.',
      legs: [arc(pt('Havana', 23.11, -82.37), newYork), arc(pt('San Juan', 18.47, -66.11), newYork)],
      labels: [['Cuba', ...xy(pt('', 23.11, -82.37))], ['Puerto Rico', ...xy(pt('', 18.47, -66.11))], ['New York', ...xy(newYork)]],
    },
  ],
};

// Instrument glyphs: copy the app's set (src/components/glyphs/svg.ts) into the
// page's inline sprite, so the site and the app draw the same instruments.
const WEB_GLYPHS = ['kora', 'cuica', 'surdo', 'clave', 'conga', 'bongo', 'bell', 'shaker', 'guiro', 'djembe', 'guitar', 'fiddle', 'trumpet'];
const glyphFile = new URL('../src/components/glyphs/svg.ts', import.meta.url);
if (existsSync(glyphFile)) {
  const ts = readFileSync(glyphFile, 'utf8');
  const body = ts.slice(ts.indexOf('{', ts.indexOf('GLYPH_SVG')), ts.lastIndexOf('}') + 1);
  const GLYPH_SVG = new Function('return (' + body + ');')();
  const html = new URL('../website/index.html', import.meta.url);
  const page = readFileSync(html, 'utf8');
  const start = page.indexOf('<!-- glyphs:start');
  const end = page.indexOf('<!-- glyphs:end -->');
  if (start < 0 || end < 0) throw new Error('glyph markers missing in website/index.html');
  const lineStart = page.indexOf('\n', start) + 1;
  const symbols = WEB_GLYPHS.map((g) => {
    if (!GLYPH_SVG[g]) throw new Error(`glyph ${g} missing from svg.ts`);
    return `      <symbol id="g-${g}" viewBox="0 0 24 24">${GLYPH_SVG[g]}</symbol>\n`;
  }).join('');
  writeFileSync(html, page.slice(0, lineStart) + symbols + '      ' + page.slice(end));
  console.log(`index.html: inlined ${WEB_GLYPHS.length} glyphs from svg.ts`);
}

const out = `// GENERATED by scripts/build-web.mjs. Do not edit.\nwindow.SM_DATA = ${JSON.stringify(data)};\n`;
writeFileSync(new URL('../website/data.js', import.meta.url), out);
console.log(`website/data.js: ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB (land ${(land.length / 1024).toFixed(0)} KB, borders ${(borders.length / 1024).toFixed(0)} KB)`);
