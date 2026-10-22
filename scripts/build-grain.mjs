// Writes assets/images/grain.png: a 128×128 tileable speckle mask (white specks
// on transparent). Laid over a stamp and tinted the paper color, it reads as
// uneven rubber-stamp ink. Zero dependencies, seeded so it's reproducible.
// Run: node scripts/build-grain.mjs

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const N = 128;
let seed = 0x5eed;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

const alpha = new Float32Array(N * N);
const dab = (cx, cy, r, a) => {
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++)
    for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const v = Math.max(0, Math.min(1, r + 0.5 - d)) * a;
      const i = ((y + N) % N) * N + ((x + N) % N);
      alpha[i] = Math.max(alpha[i], v);
    }
};

// fine specks, a few bigger voids, and short dry-brush scratches
for (let i = 0; i < 420; i++) dab(rand() * N, rand() * N, 0.35 + rand() * 0.6, 0.55 + rand() * 0.45);
for (let i = 0; i < 26; i++) dab(rand() * N, rand() * N, 1 + rand() * 1.4, 0.8);
for (let i = 0; i < 9; i++) {
  const x = rand() * N, y = rand() * N, ang = rand() * Math.PI, len = 6 + rand() * 10;
  for (let t = 0; t < len; t += 0.5) dab(x + Math.cos(ang) * t, y + Math.sin(ang) * t, 0.45, 0.7);
}

const raw = Buffer.alloc(N * (N * 4 + 1));
for (let y = 0; y < N; y++) {
  raw[y * (N * 4 + 1)] = 0;
  for (let x = 0; x < N; x++) {
    const o = y * (N * 4 + 1) + 1 + x * 4;
    raw[o] = raw[o + 1] = raw[o + 2] = 255;
    raw[o + 3] = Math.round(alpha[y * N + x] * 255);
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../assets/images/grain.png', import.meta.url), png);
console.log(`grain.png ${png.length} bytes`);
