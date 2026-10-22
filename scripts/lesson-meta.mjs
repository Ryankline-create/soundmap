// Per-lesson data that lessons.json doesn't carry: map position, region ink,
// stamp label/shape, instrument glyph + numbered parts, and the "Where It
// Travelled" route. Read by build-lessons.mjs (app) and the website.
// Places come only from each lesson's own text. Where the text names an area
// rather than a city ("Europe", "the American South"), the point is a
// representative spot in that area and the label keeps the text's wording.

export const REGIONS = {
  'The Americas': 'americas',
  Africa: 'africa',
  'Asia & Oceania': 'asia',
  'Middle East & North Africa': 'mena',
  Europe: 'europe',
};

export const REGION_LABELS = {
  americas: 'The Americas',
  africa: 'Africa',
  asia: 'Asia & Oceania',
  mena: 'Middle East & North Africa',
  europe: 'Europe',
};

const P = {
  newOrleans: { name: 'New Orleans', lat: 29.95, lng: -90.07 },
  chicago: { name: 'Chicago', lat: 41.88, lng: -87.63 },
  newYork: { name: 'New York', lat: 40.8, lng: -73.94 },
  europe: { name: 'Europe', lat: 48.86, lng: 2.35 },
  havana: { name: 'Havana', lat: 23.11, lng: -82.37 },
  sanJuan: { name: 'San Juan', lat: 18.47, lng: -66.11 },
  buenosAires: { name: 'Buenos Aires', lat: -34.6, lng: -58.38 },
  montevideo: { name: 'Montevideo', lat: -34.9, lng: -56.16 },
  paris: { name: 'Paris', lat: 48.86, lng: 2.35 },
  salvador: { name: 'Bahia', lat: -12.97, lng: -38.5 },
  rio: { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17 },
  kingston: { name: 'Kingston', lat: 17.97, lng: -76.79 },
  panama: { name: 'Panama', lat: 8.98, lng: -79.52 },
  bamako: { name: 'Bamako', lat: 12.64, lng: -8.0 },
  westAfrica: { name: 'West Africa', lat: 12.64, lng: -8.0 },
  americanSouth: { name: 'the American South', lat: 34.2, lng: -90.57 },
  accra: { name: 'Accra', lat: 5.6, lng: -0.19 },
  lagos: { name: 'Lagos', lat: 6.52, lng: 3.38 },
  harare: { name: 'Harare', lat: -17.83, lng: 31.05 },
  java: { name: 'Java', lat: -7.8, lng: 110.36 },
  bali: { name: 'Bali', lat: -8.65, lng: 115.22 },
  delhi: { name: 'North India', lat: 28.61, lng: 77.21 },
  suwa: { name: 'Suwa', lat: 36.04, lng: 138.11 },
  sado: { name: 'Sado Island', lat: 38.02, lng: 138.37 },
  yirrkala: { name: 'Northeast Arnhem Land', lat: -12.25, lng: 136.89 },
  baghdad: { name: 'Baghdad', lat: 33.31, lng: 44.37 },
  cairo: { name: 'Cairo', lat: 30.04, lng: 31.24 },
  istanbul: { name: 'Istanbul', lat: 41.01, lng: 28.98 },
  iberia: { name: 'Iberia', lat: 37.88, lng: -4.78 },
  oran: { name: 'Oran', lat: 35.7, lng: -0.63 },
  essaouira: { name: 'Essaouira', lat: 31.51, lng: -9.77 },
  seville: { name: 'Seville', lat: 37.39, lng: -5.98 },
  jerez: { name: 'Jerez', lat: 36.69, lng: -6.13 },
  cadiz: { name: 'Cádiz', lat: 36.53, lng: -6.29 },
  ireland: { name: 'Ireland', lat: 53.35, lng: -7.7 },
  lisbon: { name: 'Lisbon', lat: 38.72, lng: -9.14 },
};

// route: list of [from, to] legs drawn as great-circle arcs.
// parts: three numbered callouts for The Instrument slide, from its detail text.
export const LESSON_META = {
  jazz: {
    pin: P.newOrleans, stamp: 'NEW ORLEANS', country: 'United States',
    glyphs: ['trumpet', 'piano', 'clave'],
    instrument: { glyph: 'trumpet', name: 'Trumpet', parts: ['Mouthpiece: the lips buzz here', 'Three valves', 'Extra tubing that changes the pitch'] },
    route: [[P.newOrleans, P.chicago], [P.newOrleans, P.newYork], [P.newYork, P.europe]],
  },
  salsa: {
    pin: P.newYork, stamp: 'NEW YORK', country: 'United States',
    glyphs: ['clave', 'conga', 'piano'],
    instrument: { glyph: 'conga', name: 'Congas', parts: ['Near the rim: open tone', 'The middle: closed tone', 'Fingers snap: slap'] },
    route: [[P.havana, P.newYork], [P.sanJuan, P.newYork]],
  },
  tango: {
    pin: P.buenosAires, stamp: 'BUENOS AIRES', country: 'Argentina',
    glyphs: ['accordion', 'guitar', 'fiddle'],
    instrument: { glyph: 'accordion', name: 'Bandoneón', parts: ['Buttons on each side', 'The bellows', 'Metal reeds inside'] },
    route: [[P.montevideo, P.buenosAires], [P.havana, P.buenosAires], [P.buenosAires, P.paris]],
  },
  samba: {
    pin: P.rio, stamp: 'RIO DE JANEIRO', country: 'Brazil',
    glyphs: ['surdo', 'cuica', 'shaker'],
    instrument: { glyph: 'cuica', name: 'Cuíca', parts: ['The drum skin', 'Pressing here bends the pitch', 'The friction sound starts inside'] },
    route: [[P.salvador, P.rio]],
  },
  reggaeton: {
    pin: P.sanJuan, stamp: 'SAN JUAN', country: 'Puerto Rico',
    glyphs: ['drumMachine', 'clap', 'bell'],
    instrument: { glyph: 'drumMachine', name: 'Drum machine', parts: ['Pads: one drum sound each', 'The step grid', 'Timing exactly as written'] },
    route: [[P.kingston, P.panama], [P.panama, P.sanJuan]],
  },
  kora: {
    pin: P.bamako, stamp: 'MALI', country: 'Mali',
    glyphs: ['kora', 'balafon', 'djembe'],
    instrument: { glyph: 'kora', name: 'Kora', parts: ['The gourd body', 'Thumbs and index fingers pluck', 'Strings held upright'] },
    route: [[P.westAfrica, P.americanSouth]],
  },
  highlife: {
    pin: P.accra, stamp: 'ACCRA', country: 'Ghana',
    glyphs: ['guitar', 'trumpet', 'conga'],
    instrument: { glyph: 'guitar', name: 'Guitar', parts: ['The thumb keeps the bass moving', 'Fingers on the top strings', 'Short melodic phrases'] },
    route: [[P.accra, P.lagos]],
  },
  afrobeat: {
    pin: P.lagos, stamp: 'LAGOS', country: 'Nigeria',
    glyphs: ['saxophone', 'shaker', 'guitar'],
    instrument: { glyph: 'saxophone', name: 'Tenor saxophone', parts: ['A single reed', 'Keys along the tube', 'The metal tube'] },
    route: [],
  },
  mbira: {
    pin: P.harare, stamp: 'ZIMBABWE', country: 'Zimbabwe',
    glyphs: ['mbira', 'shaker'],
    instrument: { glyph: 'mbira', name: 'Mbira dzavadzimu', parts: ['The wooden board', 'Thumbs on the front row', 'Right index finger on the lower row'] },
    route: [],
  },
  gamelan: {
    pin: P.bali, stamp: 'JAVA · BALI', country: 'Indonesia',
    glyphs: ['gong', 'saron', 'kendang'],
    instrument: { glyph: 'saron', name: 'Saron', parts: ['Bronze bars', 'One hand strikes with the mallet', 'The other hand damps the last note'] },
    route: [[P.java, P.bali]],
  },
  raga: {
    pin: P.delhi, stamp: 'NORTH INDIA', country: 'India',
    glyphs: ['sitar', 'tanpura', 'tabla'],
    instrument: { glyph: 'sitar', name: 'Sitar', parts: ['Wire plectrum on the right hand', 'Movable frets', 'The long neck: strings pulled sideways'] },
    route: [],
  },
  taiko: {
    pin: P.sado, stamp: 'JAPAN', country: 'Japan',
    glyphs: ['taiko', 'cymbals'],
    instrument: { glyph: 'taiko', name: 'Odaiko', parts: ['Near the rim: a sharp sound', 'The middle: a deep sound', 'Arms and body weight'] },
    route: [[P.suwa, P.sado]],
  },
  yidaki: {
    pin: P.yirrkala, stamp: 'ARNHEM LAND', country: 'Australia',
    glyphs: ['yidaki', 'clapsticks'],
    instrument: { glyph: 'yidaki', name: 'Yidaki', parts: ['Mouthpiece: the lips vibrate', 'A trunk hollowed by termites', 'Circular breathing keeps it going'] },
    route: [],
  },
  'oud-maqam': {
    pin: P.cairo, stamp: 'ARAB WORLD', country: 'Egypt',
    glyphs: ['oud', 'frameDrum', 'darbuka'],
    instrument: { glyph: 'oud', name: 'Oud', parts: ['A long plectrum', 'A neck with no frets', 'The short neck and round body'] },
    route: [[P.baghdad, P.cairo], [P.baghdad, P.istanbul], [P.cairo, P.iberia]],
  },
  rai: {
    pin: P.oran, stamp: 'ORAN', country: 'Algeria',
    glyphs: ['gasba', 'accordion', 'darbuka'],
    instrument: { glyph: 'gasba', name: 'Gasba', parts: ['The cane', 'A row of finger holes', 'Blown across the lips at an angle'] },
    route: [],
  },
  gnawa: {
    pin: P.essaouira, stamp: 'MOROCCO', country: 'Morocco',
    glyphs: ['guembri', 'qraqeb', 'frameDrum'],
    instrument: { glyph: 'guembri', name: 'Guembri', parts: ['Three strings', 'The drum-skin body', 'The low string doubles as a slap'] },
    route: [[P.westAfrica, P.essaouira]],
  },
  flamenco: {
    pin: P.seville, stamp: 'ANDALUSIA', country: 'Spain',
    glyphs: ['guitar', 'clap', 'cajon'],
    instrument: { glyph: 'guitar', name: 'Flamenco guitar', parts: ['Rasgueado: fast strummed rolls', 'Golpe: a tap on the soundboard', 'The left hand: chords and runs'] },
    route: [[P.cadiz, P.jerez], [P.jerez, P.seville]],
  },
  irish: {
    pin: P.ireland, stamp: 'IRELAND', country: 'Ireland',
    glyphs: ['fiddle', 'whistle', 'frameDrum'],
    instrument: { glyph: 'uilleannPipes', name: 'Uilleann pipes', parts: ['Bellows worked by the elbow', 'The bag keeps the air steady', 'The chanter plays the melody'] },
    route: [],
  },
  fado: {
    pin: P.lisbon, stamp: 'LISBON', country: 'Portugal',
    glyphs: ['portugueseGuitar', 'guitar'],
    instrument: { glyph: 'portugueseGuitar', name: 'Portuguese guitar', parts: ['Thumb and index finger', 'Strings in pairs', 'Each note rings twice'] },
    route: [],
  },
};

// Every glyph the app draws. The glyph set in src/components/glyphs must
// implement each id.
export const GLYPH_IDS = [
  'djembe', 'talkingDrum', 'shaker', 'bell', 'clave', 'conga', 'guiro', 'kora', 'balafon',
  'mbira', 'gong', 'kendang', 'tabla', 'sitar', 'tanpura', 'oud', 'frameDrum', 'accordion',
  'trumpet', 'fiddle', 'taiko', 'yidaki', 'guitar', 'steelPan',
  // added for the lessons and packs
  'cuica', 'surdo', 'uilleannPipes', 'guembri', 'gasba', 'portugueseGuitar', 'cajon', 'saron',
  'piano', 'clapsticks', 'qraqeb', 'drumMachine', 'saxophone', 'whistle', 'cymbals', 'darbuka',
  'clap', 'timbales', 'bongo',
];
