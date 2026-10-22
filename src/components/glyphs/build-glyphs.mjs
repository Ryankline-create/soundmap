// Source of truth for SoundMap's instrument glyphs. Generates:
//   <Name>.tsx  react-native-svg component per glyph
//   svg.ts      GLYPH_SVG inner markup (the website inlines these as <symbol>s)
//   index.ts    GLYPHS, Glyph, GLYPH_PARTS, LESSON_PARTS
// Run: node src/components/glyphs/build-glyphs.mjs [--sheet <dir>]
// Glyphs are 24×24 line icons: stroke 1.75, round caps and joins, fill none.
// Small solid accents use fill="currentColor" stroke="none".

import { writeFileSync } from 'node:fs';

const DOT = 'fill="currentColor" stroke="none"';

export const SOURCES = {
  djembe: [
    '<ellipse cx="12" cy="4.2" rx="6.6" ry="1.6"/>',
    '<path d="M5.4 4.2C5.4 8.6 8 11 9.7 12.4C9.2 15.5 8.2 18.5 7.6 20.6H16.4C15.8 18.5 14.8 15.5 14.3 12.4C16 11 18.6 8.6 18.6 4.2"/>',
    '<path d="M9.7 12.4H14.3"/>',
    '<path d="M8 6L10.2 12.2M12 6.1V12.2M16 6L13.8 12.2"/>',
  ],
  talkingDrum: [
    '<ellipse cx="9.5" cy="4.5" rx="5" ry="1.5"/>',
    '<ellipse cx="9.5" cy="19.5" rx="5" ry="1.5"/>',
    '<path d="M4.5 4.5C7.8 8.5 7.8 15.5 4.5 19.5M14.5 4.5C11.2 8.5 11.2 15.5 14.5 19.5"/>',
    '<path d="M9.5 6V18"/>',
    '<path d="M16.8 6.8C20.6 8 21.4 12.8 19.4 16"/>',
  ],
  shaker: [
    '<path d="M10.5 4.4C10.5 6.4 9.4 7.6 7.6 9C5.6 10.6 4.6 12.6 4.6 15C4.6 18.6 7.8 21.2 12 21.2C16.2 21.2 19.4 18.6 19.4 15C19.4 12.6 18.4 10.6 16.4 9C14.6 7.6 13.5 6.4 13.5 4.4"/>',
    '<path d="M10.5 4.4Q12 3.4 13.5 4.4"/>',
    `<circle cx="8.4" cy="13.4" r="0.95" ${DOT}/>`,
    `<circle cx="12" cy="12.4" r="0.95" ${DOT}/>`,
    `<circle cx="15.6" cy="13.4" r="0.95" ${DOT}/>`,
    `<circle cx="10.2" cy="16.4" r="0.95" ${DOT}/>`,
    `<circle cx="13.8" cy="16.4" r="0.95" ${DOT}/>`,
    `<circle cx="12" cy="19.1" r="0.95" ${DOT}/>`,
  ],
  bell: [
    '<path d="M6.4 12H9.4L11.6 20.5H3.8Z"/>',
    '<path d="M15.6 12H18.2L20.2 18.5H13.6Z"/>',
    '<path d="M7.9 12V8.5C7.9 3.8 16.9 3.8 16.9 8.5V12"/>',
  ],
  clave: [
    '<path d="M4.5 16H19.5A1.5 1.5 0 0 1 19.5 19H4.5A1.5 1.5 0 0 1 4.5 16Z"/>',
    '<path d="M13.7 13.9L19.7 5.9A1.5 1.5 0 0 0 17.3 4.1L11.3 12.1A1.5 1.5 0 0 0 13.7 13.9Z"/>',
  ],
  conga: [
    '<ellipse cx="12" cy="4" rx="5" ry="1.5"/>',
    '<path d="M7 4C6 9 6.2 14.5 8.2 21H15.8C17.8 14.5 18 9 17 4"/>',
    '<path d="M6.7 7.2Q12 9 17.3 7.2"/>',
    '<path d="M9.2 8.4V11.4M12 8.6V11.6M14.8 8.4V11.4"/>',
  ],
  guiro: [
    '<path d="M3.5 11.5C3.5 9.1 6.3 8 10 8H15.5C18.6 8 20.5 9.5 20.5 11.5C20.5 13.5 18.6 15 15.5 15H10C6.3 15 3.5 13.9 3.5 11.5Z"/>',
    '<path d="M7.6 9.8V12.4M9.9 9.5V12.6M12.2 9.5V12.6M14.5 9.5V12.6M16.8 9.7V12.4"/>',
    '<path d="M5.5 20L19 17.2"/>',
  ],
  kora: [
    '<circle cx="12" cy="16.3" r="5"/>',
    '<path d="M12 7.6V2.2"/>',
    '<path d="M10.9 4H13.1"/>',
    '<path d="M12 7.6L10.9 12.6M12 7.6L13.1 12.6"/>',
    '<rect x="10.9" y="12.6" width="2.2" height="4.4" rx="0.5"/>',
    '<path d="M12 17V20.2"/>',
    '<path d="M8.4 10V12.4M15.6 10V12.4"/>',
  ],
  balafon: [
    '<path d="M2.75 12.75H21.25"/>',
    '<rect x="4.7" y="4" width="1.6" height="8.75" rx="0.6"/>',
    '<rect x="8.95" y="5" width="1.6" height="7.75" rx="0.6"/>',
    '<rect x="13.2" y="6" width="1.6" height="6.75" rx="0.6"/>',
    '<rect x="17.45" y="7" width="1.6" height="5.75" rx="0.6"/>',
    '<path d="M3.38 12.75A2.12 3.4 0 0 0 7.62 12.75A2.12 3 0 0 0 11.87 12.75A2.12 2.6 0 0 0 16.12 12.75A2.12 2.2 0 0 0 20.37 12.75"/>',
  ],
  mbira: [
    '<rect x="4.5" y="5" width="15" height="15.5" rx="2"/>',
    '<path d="M6.5 16H17.5"/>',
    '<path d="M7.8 16V10.6M10 16V8.6M12 16V7.6M14 16V8.6M16.2 16V10.6"/>',
  ],
  gong: [
    '<path d="M3 4H21M5 4V21M19 4V21M3.5 21H6.5M17.5 21H20.5"/>',
    '<path d="M10 4L10.6 8.4M14 4L13.4 8.4"/>',
    '<circle cx="12" cy="13.3" r="5"/>',
    '<circle cx="12" cy="13.3" r="1.7"/>',
  ],
  kendang: [
    '<ellipse cx="5" cy="12" rx="1.8" ry="5"/>',
    '<ellipse cx="19.2" cy="12" rx="1.4" ry="3.6"/>',
    '<path d="M5 7C9.5 5.8 15 6.6 19.2 8.4M5 17C9.5 18.2 15 17.4 19.2 15.6"/>',
    '<path d="M7.4 6.6L9.6 17.5M10.6 6.3L12.8 17.6M13.8 6.5L16 17.1"/>',
  ],
  tabla: [
    '<ellipse cx="7" cy="10" rx="5" ry="1.5"/>',
    '<path d="M2 10C2 16 4 19.5 7 19.5C10 19.5 12 16 12 10"/>',
    '<ellipse cx="17.5" cy="7.5" rx="3.2" ry="1.1"/>',
    '<path d="M14.3 7.5L14.8 19.5H20.2L20.7 7.5"/>',
    '<path d="M14.65 15H20.35"/>',
    `<circle cx="6.4" cy="10" r="0.8" ${DOT}/>`,
  ],
  sitar: [
    '<circle cx="12" cy="4" r="1.6"/>',
    '<path d="M10.8 5.6V14M13.2 5.6V14"/>',
    '<path d="M9.9 7.6H14.1M9.9 9.8H14.1M9.9 12H14.1"/>',
    '<path d="M10.8 14C7 14.6 7.2 21.5 12 21.5C16.8 21.5 17 14.6 13.2 14"/>',
  ],
  tanpura: [
    '<path d="M10.6 3V12.6M13.4 3V12.6M10.6 3H13.4"/>',
    '<path d="M10.6 4.6H9M10.6 7.2H9M13.4 4.6H15M13.4 7.2H15"/>',
    '<path d="M10.6 12.6C5.6 13.4 5.6 21.5 12 21.5C18.4 21.5 18.4 13.4 13.4 12.6"/>',
    '<path d="M10 18H14"/>',
  ],
  oud: [
    '<path d="M12 8C16.5 8 18.5 12.5 18.5 15.5C18.5 19 15.5 21.5 12 21.5C8.5 21.5 5.5 19 5.5 15.5C5.5 12.5 7.5 8 12 8Z"/>',
    '<path d="M11 8.1V4.6H13V8.1"/>',
    '<path d="M11 4.6H13L9.3 2.2L7.6 3Z"/>',
    '<circle cx="12" cy="13.2" r="1.5"/>',
    '<path d="M10 18.3H14"/>',
  ],
  frameDrum: [
    '<ellipse cx="10.5" cy="12" rx="6.5" ry="8.5"/>',
    '<path d="M10.5 3.5H13A6.5 8.5 0 0 1 13 20.5H10.5"/>',
  ],
  accordion: [
    '<rect x="3" y="5.5" width="4.5" height="13" rx="1"/>',
    '<rect x="16.5" y="5.5" width="4.5" height="13" rx="1"/>',
    '<path d="M7.5 7L9.75 5.6L12 7L14.25 5.6L16.5 7M7.5 17L9.75 18.4L12 17L14.25 18.4L16.5 17M9.75 5.6V18.4M12 7V17M14.25 5.6V18.4"/>',
    `<circle cx="5.25" cy="8.6" r="0.75" ${DOT}/>`,
    `<circle cx="5.25" cy="12" r="0.75" ${DOT}/>`,
    `<circle cx="5.25" cy="15.4" r="0.75" ${DOT}/>`,
    `<circle cx="18.75" cy="8.6" r="0.75" ${DOT}/>`,
    `<circle cx="18.75" cy="12" r="0.75" ${DOT}/>`,
    `<circle cx="18.75" cy="15.4" r="0.75" ${DOT}/>`,
  ],
  trumpet: [
    '<path d="M2.5 10H14.5"/>',
    '<path d="M2.5 8.75V11.25"/>',
    '<path d="M14.5 10C17.5 9.6 19.8 8 21.5 6.3V13.7C19.8 12 17.5 10.4 14.5 10Z"/>',
    '<path d="M6 10C3.8 10 3.8 14.5 6 14.5H13"/>',
    '<path d="M8.5 6.5V14.5M10.75 6.5V14.5M13 6.5V14.5"/>',
  ],
  fiddle: [
    '<path d="M12 8.5C9 8.5 7.5 9.5 7.5 11.5C7.5 13 9.2 13.6 9.2 14.6C9.2 15.6 7 16.2 7 18.5C7 20.5 9 21.5 12 21.5C15 21.5 17 20.5 17 18.5C17 16.2 14.8 15.6 14.8 14.6C14.8 13.6 16.5 13 16.5 11.5C16.5 9.5 15 8.5 12 8.5Z"/>',
    '<path d="M12 8.5V4.4"/>',
    '<circle cx="12" cy="3.3" r="1.1"/>',
    '<path d="M10 15.2C9.6 16.2 10.4 17.3 10 18.4M14 15.2C14.4 16.2 13.6 17.3 14 18.4"/>',
    '<path d="M12 17.4V20.4"/>',
  ],
  taiko: [
    '<ellipse cx="10" cy="10.5" rx="6" ry="7"/>',
    '<path d="M10 3.5H13.5A6 7 0 0 1 13.5 17.5H10"/>',
    `<circle cx="10" cy="4.9" r="0.6" ${DOT}/>`,
    `<circle cx="15.1" cy="10.5" r="0.6" ${DOT}/>`,
    `<circle cx="10" cy="16.1" r="0.6" ${DOT}/>`,
    `<circle cx="4.9" cy="10.5" r="0.6" ${DOT}/>`,
    '<path d="M7.4 16.9L5 21.5M13.8 17.4L16.4 21.5M6.1 19.6H15.2"/>',
    '<path d="M17.3 2.3L21.3 6.3"/>',
  ],
  yidaki: [
    '<path d="M5.3 3.7C9.5 8 12.5 10.8 19.84 16.16"/>',
    '<path d="M3.7 5.3C7.6 9.6 10.8 12.6 16.16 19.84"/>',
    '<path d="M19.84 16.16A2.6 0.95 -45 0 1 16.16 19.84A2.6 0.95 -45 0 1 19.84 16.16Z"/>',
    '<path d="M5.3 3.7A1.15 0.45 -45 0 0 3.7 5.3"/>',
  ],
  guitar: [
    '<path d="M12 9.5C9.5 9.5 8.3 10.5 8.3 12C8.3 13.3 9.3 13.6 9.3 14.4C9.3 15.2 7.5 15.7 7.5 17.8C7.5 20.2 9.5 21.5 12 21.5C14.5 21.5 16.5 20.2 16.5 17.8C16.5 15.7 14.7 15.2 14.7 14.4C14.7 13.6 15.7 13.3 15.7 12C15.7 10.5 14.5 9.5 12 9.5Z"/>',
    '<circle cx="12" cy="14.8" r="1.3"/>',
    '<path d="M10.5 18.6H13.5"/>',
    '<path d="M12 9.5V5"/>',
    '<rect x="10.8" y="2" width="2.4" height="3" rx="0.6"/>',
  ],
  steelPan: [
    '<ellipse cx="12" cy="9.5" rx="8.5" ry="4"/>',
    '<path d="M3.5 9.5V14A8.5 4 0 0 0 20.5 14V9.5"/>',
    '<ellipse cx="12" cy="9.1" rx="2" ry="1.1"/>',
    '<ellipse cx="6.6" cy="9.9" rx="1.2" ry="0.8"/>',
    '<ellipse cx="17.4" cy="9.9" rx="1.2" ry="0.8"/>',
  ],
  cuica: [
    '<ellipse cx="6.5" cy="12" rx="2.2" ry="6"/>',
    '<ellipse cx="17.5" cy="12" rx="2.2" ry="6"/>',
    '<path d="M6.5 6H17.5M6.5 18H17.5"/>',
    '<path d="M6.5 12H15"/>',
  ],
  surdo: [
    '<ellipse cx="10" cy="6.5" rx="7" ry="2"/>',
    '<path d="M3 6.5V17.5A7 2 0 0 0 17 17.5V6.5"/>',
    '<path d="M6.5 8.4V19.2M13.5 8.4V19.2"/>',
    '<path d="M18.5 11.5L19.7 5.6"/>',
    '<circle cx="20" cy="4.3" r="1.3"/>',
  ],
  uilleannPipes: [
    '<ellipse cx="9" cy="8" rx="4.5" ry="3.8"/>',
    '<path d="M13.6 7.6L12.2 11.6"/>',
    '<path d="M13.6 7.6L21.2 11.4M12.9 9.6L19.6 13M12.2 11.6L17.9 14.6"/>',
    '<path d="M8.5 11.8V19.6M7.5 20.4H9.5"/>',
    '<path d="M2.4 13.6L4.8 14.4V18.6L2.4 19.4Z"/>',
    '<path d="M3.6 13.9Q4 12 5.6 10.6"/>',
  ],
  guembri: [
    '<path d="M13.39 8.57L15.59 10.29Q17.01 11.4 15.9 12.82L10.73 19.44Q9.62 20.86 8.2 19.75L6 18.02Q4.58 16.92 5.69 15.5L10.86 8.88Q11.97 7.46 13.39 8.57Z"/>',
    '<path d="M14.49 9.43L19.41 3.13"/>',
    '<path d="M17.38 3.95L19.11 5.3M16.15 5.52L17.88 6.88"/>',
    '<path d="M12.95 9.62L7.53 16.55M14.68 10.97L9.26 17.91"/>',
    '<path d="M8.22 14.05L11.53 16.63"/>',
  ],
  gasba: [
    '<path d="M5.7 20.7L20.7 5.7A1.7 1.7 0 0 0 18.3 3.3L3.3 18.3A1.7 1.7 0 0 0 5.7 20.7Z"/>',
    `<circle cx="7.6" cy="16.4" r="0.6" ${DOT}/>`,
    `<circle cx="9.6" cy="14.4" r="0.6" ${DOT}/>`,
    `<circle cx="11.6" cy="12.4" r="0.6" ${DOT}/>`,
    `<circle cx="13.6" cy="10.4" r="0.6" ${DOT}/>`,
    '<path d="M15.3 6.3L17.7 8.7"/>',
  ],
  portugueseGuitar: [
    '<path d="M12 9.3C15.8 9.3 18 12 18 15.4C18 19 15.4 21.5 12 21.5C8.6 21.5 6 19 6 15.4C6 12 8.2 9.3 12 9.3Z"/>',
    '<circle cx="12" cy="14.6" r="1.3"/>',
    '<path d="M10.6 18.4H13.4"/>',
    '<path d="M12 9.3V7"/>',
    '<path d="M9.41 3.44A4.4 4.4 0 0 1 14.59 3.44"/>',
    '<path d="M12 7L9.41 3.44M12 7V2.6M12 7L14.59 3.44"/>',
  ],
  cajon: [
    '<rect x="5" y="7" width="11" height="14" rx="1"/>',
    '<path d="M5 7L8.5 3.5H19.5L16 7"/>',
    '<path d="M19.5 3.5V17.5L16 21"/>',
    '<circle cx="10.5" cy="14" r="2.2"/>',
  ],
  saron: [
    '<path d="M3 13.5H21L19.5 19.5H4.5Z"/>',
    '<path d="M5.2 9.2V12M8 9.2V12M10.8 9.2V12M13.6 9.2V12M16.4 9.2V12M19.2 9.2V12"/>',
    '<path d="M20.5 3.2L15.6 6.2"/>',
    '<path d="M14.87 5.01L16.33 7.39"/>',
  ],
  piano: [
    '<rect x="3" y="5" width="18" height="14" rx="1.5"/>',
    '<path d="M6.6 12.5V19M10.2 12.5V19M13.8 5V19M17.4 12.5V19"/>',
    `<rect x="5.6" y="5" width="2" height="7.5" rx="0.4" ${DOT}/>`,
    `<rect x="9.2" y="5" width="2" height="7.5" rx="0.4" ${DOT}/>`,
    `<rect x="16.4" y="5" width="2" height="7.5" rx="0.4" ${DOT}/>`,
  ],
  clapsticks: [
    '<path d="M4.94 16.28L16.94 6.28A1.15 1.15 0 0 0 15.46 4.52L3.46 14.52A1.15 1.15 0 0 0 4.94 16.28Z"/>',
    '<path d="M8.78 17.76L20.78 7.76A1.15 1.15 0 0 0 19.3 6L7.3 16A1.15 1.15 0 0 0 8.78 17.76Z"/>',
  ],
  qraqeb: [
    '<path d="M9.22 6.73Q12 7.6 14.78 6.73A3 3 0 1 1 14.78 9.27Q12 8.4 9.22 9.27A3 3 0 1 1 9.22 6.73Z"/>',
    '<path d="M9.22 14.73Q12 15.6 14.78 14.73A3 3 0 1 1 14.78 17.27Q12 16.4 9.22 17.27A3 3 0 1 1 9.22 14.73Z"/>',
    `<circle cx="6.5" cy="8" r="0.9" ${DOT}/>`,
    `<circle cx="17.5" cy="8" r="0.9" ${DOT}/>`,
    `<circle cx="6.5" cy="16" r="0.9" ${DOT}/>`,
    `<circle cx="17.5" cy="16" r="0.9" ${DOT}/>`,
  ],
  drumMachine: [
    '<rect x="3" y="3.5" width="18" height="17" rx="2"/>',
    '<rect x="5.25" y="5.75" width="7.5" height="2.75" rx="0.6"/>',
    '<circle cx="17" cy="7.1" r="1.4"/>',
    '<rect x="5.25" y="10.5" width="3" height="3" rx="0.6"/>',
    '<rect x="10.5" y="10.5" width="3" height="3" rx="0.6"/>',
    '<rect x="15.75" y="10.5" width="3" height="3" rx="0.6"/>',
    '<rect x="5.25" y="15.5" width="3" height="3" rx="0.6"/>',
    '<rect x="10.5" y="15.5" width="3" height="3" rx="0.6"/>',
    '<rect x="15.75" y="15.5" width="3" height="3" rx="0.6"/>',
  ],
  saxophone: [
    '<path d="M9.5 6V16C9.5 20.8 18.7 20.8 18.7 16V12.2"/>',
    '<path d="M12 6V15.8C12 18.2 16.2 18.2 16.2 15.8V12.2"/>',
    '<path d="M16.2 12.2L15 9.6M18.7 12.2L20.2 9.6"/>',
    '<ellipse cx="17.6" cy="9.6" rx="2.6" ry="0.7"/>',
    '<path d="M9.5 6H12"/>',
    '<path d="M10.75 6C10.75 3.8 9.4 3 6 3.2"/>',
  ],
  whistle: [
    '<rect x="10.25" y="2.5" width="3.5" height="19" rx="1.2"/>',
    '<path d="M10.25 6.5H13.75"/>',
    '<path d="M11.2 8.6H12.8"/>',
    `<circle cx="12" cy="11.8" r="0.6" ${DOT}/>`,
    `<circle cx="12" cy="14.3" r="0.6" ${DOT}/>`,
    `<circle cx="12" cy="16.8" r="0.6" ${DOT}/>`,
    `<circle cx="12" cy="19.2" r="0.6" ${DOT}/>`,
  ],
  cymbals: [
    '<path d="M3 10.5Q7.5 8.7 10.2 8.7Q10.5 6.7 12 6.7Q13.5 6.7 13.8 8.7Q16.5 8.7 21 10.5Q12 9.4 3 10.5Z"/>',
    '<path d="M11 6.9Q12 4.6 13 6.9"/>',
    '<path d="M3 13.5Q7.5 15.3 10.2 15.3Q10.5 17.3 12 17.3Q13.5 17.3 13.8 15.3Q16.5 15.3 21 13.5Q12 14.6 3 13.5Z"/>',
    '<path d="M11 17.1Q12 19.4 13 17.1"/>',
  ],
  darbuka: [
    '<ellipse cx="12" cy="4.5" rx="5" ry="1.4"/>',
    '<path d="M7 4.5C7 7.8 8.4 9.6 10.4 11C10.6 13.5 9 17.5 8 20.7H16C15 17.5 13.4 13.5 13.6 11C15.6 9.6 17 7.8 17 4.5"/>',
    '<path d="M7.5 7.6Q12 9 16.5 7.6"/>',
  ],
  clap: [
    '<path d="M9.81 19.62L11.33 12.17C11.88 9.62 11.04 8.05 9.46 7.78C7.89 7.5 6.7 8.51 6.35 10.48L5.9 13.04C5.16 12.6 4.38 12.97 4.34 13.78C4.3 14.58 4.91 15.2 5.53 15.71L5.09 18.78Z"/>',
    '<path d="M14.19 19.62L12.67 12.17C12.12 9.62 12.96 8.05 14.54 7.78C16.11 7.5 17.3 8.51 17.65 10.48L18.1 13.04C18.84 12.6 19.62 12.97 19.66 13.78C19.7 14.58 19.09 15.2 18.47 15.71L18.91 18.78Z"/>',
    '<path d="M8.49 8.11L8.02 10.77M10.26 8.42L9.79 11.08M15.51 8.11L15.98 10.77M13.74 8.42L14.21 11.08"/>',
    '<path d="M12 2.6V4.4M9.3 3.4L10 4.6M14.7 3.4L14 4.6"/>',
  ],
  timbales: [
    '<ellipse cx="7" cy="8" rx="4.5" ry="1.4"/>',
    '<path d="M2.5 8V12.5A4.5 1.4 0 0 0 11.5 12.5V8"/>',
    '<ellipse cx="17" cy="9" rx="4" ry="1.2"/>',
    '<path d="M13 9V13A4 1.2 0 0 0 21 13V9"/>',
    '<path d="M12 15.3V18.5M12 18.5L8.5 21.5M12 18.5L15.5 21.5M7 13.9L12 15.3L17 14.2"/>',
  ],
  bongo: [
    '<ellipse cx="7" cy="9" rx="3.8" ry="1.3"/>',
    '<path d="M3.2 9L4 16A3 1 0 0 0 10 16L10.8 9"/>',
    '<ellipse cx="16.5" cy="9" rx="4.8" ry="1.5"/>',
    '<path d="M11.7 9L12.6 17A3.9 1.2 0 0 0 20.4 17L21.3 9"/>',
  ],
};

// Numbered-callout anchors (24-space) for each lesson's instrument, in the
// order of that lesson's instrument.parts in scripts/lesson-meta.mjs.
export const LESSON_PARTS = {
  jazz: [[2.5, 10], [10.75, 6.8], [5.2, 14.2]],
  salsa: [[16.6, 4.2], [12, 4], [8.4, 4.6]],
  tango: [[5.25, 8.6], [12, 12], [18.75, 15.4]],
  samba: [[6.5, 7.6], [6.5, 15.8], [12, 12]],
  reggaeton: [[6.75, 12], [9, 7.1], [17, 7.1]],
  kora: [[9, 18.6], [15.6, 11.2], [12, 9.8]],
  highlife: [[10, 16.6], [13.8, 13], [12, 6.5]],
  afrobeat: [[6.4, 3.2], [10.75, 11], [14.4, 19.2]],
  mbira: [[6, 18.6], [10, 9.6], [16.2, 12.4]],
  gamelan: [[11, 10.6], [16.4, 5.4], [5.2, 9.4]],
  raga: [[13.8, 17.6], [14.1, 7.6], [10.8, 12.8]],
  taiko: [[10, 3.9], [10, 10.5], [19.3, 4.3]],
  yidaki: [[4.5, 4.5], [12, 12.2], [18, 18]],
  'oud-maqam': [[14.6, 17], [12, 6], [7.6, 16]],
  rai: [[15.4, 8.6], [10.6, 13.4], [19.6, 4.4]],
  gnawa: [[12.09, 12.5], [6.25, 16.57], [9.75, 17.28]],
  flamenco: [[12, 13.2], [14.6, 19], [12, 6.5]],
  irish: [[3.6, 16.6], [9, 8], [8.5, 17.6]],
  fado: [[15, 17.8], [12, 8.2], [12, 14.6]],
};

const LESSON_GLYPH = {
  jazz: 'trumpet', salsa: 'conga', tango: 'accordion', samba: 'cuica', reggaeton: 'drumMachine',
  kora: 'kora', highlife: 'guitar', afrobeat: 'saxophone', mbira: 'mbira', gamelan: 'saron',
  raga: 'sitar', taiko: 'taiko', yidaki: 'yidaki', 'oud-maqam': 'oud', rai: 'gasba',
  gnawa: 'guembri', flamenco: 'guitar', irish: 'uilleannPipes', fado: 'portugueseGuitar',
};

// ---------------------------------------------------------------------------

const TAGS = { path: 'Path', circle: 'Circle', ellipse: 'Ellipse', line: 'Line', rect: 'Rect', polyline: 'Polyline' };
const ATTR = { 'stroke-width': 'strokeWidth', 'fill-rule': 'fillRule', 'stroke-dasharray': 'strokeDasharray' };
const pascal = (id) => id[0].toUpperCase() + id.slice(1);

function toJsx(el) {
  const m = el.match(/^<(\w+)\s+(.*?)\s*\/>$/);
  if (!m || !TAGS[m[1]]) throw new Error(`Unsupported element: ${el}`);
  const attrs = [...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => {
    const key = ATTR[k] ?? k;
    return v === 'currentColor' ? `${key}={color}` : `${key}="${v}"`;
  });
  return { tag: TAGS[m[1]], jsx: `<${TAGS[m[1]]} ${attrs.join(' ')} />` };
}

function build() {
  const dir = new URL('./', import.meta.url);
  const ids = Object.keys(SOURCES);

  for (const id of ids) {
    const els = SOURCES[id].map(toJsx);
    const tags = [...new Set(els.map((e) => e.tag))].sort();
    const name = pascal(id);
    const tsx = `// GENERATED by build-glyphs.mjs. Edit the source there.
import Svg, { ${tags.join(', ')} } from 'react-native-svg';
import { GLYPH_DEFAULTS, type GlyphProps } from './types';

export default function ${name}({
  size = GLYPH_DEFAULTS.size,
  color = GLYPH_DEFAULTS.color,
  strokeWidth = GLYPH_DEFAULTS.strokeWidth,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
${els.map((e) => `      ${e.jsx}`).join('\n')}
    </Svg>
  );
}
`;
    writeFileSync(new URL(`${name}.tsx`, dir), tsx);
  }

  const svg = `// GENERATED by build-glyphs.mjs. Inner markup of each 24×24 glyph; wrap in
// <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
// stroke-linecap="round" stroke-linejoin="round">.
import type { GlyphId } from '../../data/types';

export const GLYPH_SVG: Record<GlyphId, string> = {
${ids.map((id) => `  ${id}: ${JSON.stringify(SOURCES[id].join(''))},`).join('\n')}
};
`;
  writeFileSync(new URL('svg.ts', dir), svg);

  const glyphParts = {};
  for (const [slug, glyph] of Object.entries(LESSON_GLYPH)) glyphParts[glyph] ??= LESSON_PARTS[slug];

  const index = `// GENERATED by build-glyphs.mjs. Edit the source there.
import { createElement, type ComponentType } from 'react';
import type { GlyphId } from '../../data/types';
import type { GlyphProps } from './types';
${ids.map((id) => `import ${pascal(id)} from './${pascal(id)}';`).join('\n')}

export type { GlyphProps } from './types';
export { GLYPH_DEFAULTS } from './types';

export const GLYPHS: Record<GlyphId, ComponentType<GlyphProps>> = {
${ids.map((id) => `  ${id}: ${pascal(id)},`).join('\n')}
};

export function Glyph({ name, ...props }: GlyphProps & { name: GlyphId }) {
  return createElement(GLYPHS[name], props);
}

type Anchor = [number, number];

// Numbered-callout anchors in 24-space, per lesson slug, in the order of the
// lesson's instrument.parts. Use this; flamenco and highlife share the guitar.
export const LESSON_PARTS: Record<string, [Anchor, Anchor, Anchor]> = ${JSON.stringify(LESSON_PARTS)};

// Same anchors keyed by glyph (guitar uses the highlife set).
export const GLYPH_PARTS: Partial<Record<GlyphId, Anchor[]>> = ${JSON.stringify(glyphParts)};
`;
  writeFileSync(new URL('index.ts', dir), index);
  console.log(`glyphs: ${ids.length} written`);
}

// Contact sheet (dev only): each glyph at 24px and 96px, plus part anchors.
function sheet(out) {
  const ids = Object.keys(SOURCES);
  const wrap = (id, px, sw = 1.75) =>
    `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${SOURCES[id].join('')}</svg>`;
  const cells = ids
    .map((id) => `<div class="c"><div class="row">${wrap(id, 24)}${wrap(id, 48)}${wrap(id, 96)}</div><span>${id}</span></div>`)
    .join('');
  const parts = Object.entries(LESSON_PARTS)
    .map(([slug, pts]) => {
      const g = LESSON_GLYPH[slug];
      const dots = pts
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#B4482F" stroke="none"/><text x="${x + 1.4}" y="${y - 0.9}" font-size="2.2" fill="#B4482F" stroke="none" font-family="sans-serif" font-weight="700">${i + 1}</text>`)
        .join('');
      return `<div class="c"><svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${SOURCES[g].join('')}${dots}</svg><span>${slug} · ${g}</span></div>`;
    })
    .join('');
  const html = (body, cols) => `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;background:#FAF5EE;color:#2B1610;font:12px -apple-system,sans-serif}
.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px}
.c{background:#FFFCF8;border:1px solid #EADFD2;border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px}
.row{display:flex;align-items:flex-end;gap:10px}
</style><div class="g">${body}</div>`;
  writeFileSync(`${out}/glyphs.html`, html(cells, 6));
  writeFileSync(`${out}/parts.html`, html(parts, 5));
  console.log(`sheet: ${out}/glyphs.html, ${out}/parts.html`);
}

const args = process.argv.slice(2);
if (args[0] === '--sheet') sheet(args[1]);
else build();
