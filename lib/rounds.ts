import type { RegionId } from "./regions";
import type { AudioPreset } from "./audio";

export type Round = {
  id: string;
  region: RegionId;
  city: string;
  country: string;
  lat: number;
  lng: number;
  hint: string;
  song: {
    title: string;
    style: string;
    year?: string;
  };
  audio: AudioPreset;
};

export const ROUNDS: Round[] = [
  {
    id: "r1-bali-gamelan",
    region: "southeast-asia",
    city: "Ubud",
    country: "Indonesia",
    lat: -8.5069,
    lng: 115.2625,
    hint: "Shimmering interlocking bronze metallophones — no single melody leads, it's woven together",
    song: { title: "Gamelan Gong Kebyar", style: "Balinese gamelan", year: "trad." },
    audio: { instrument: "gamelan", root: 261.63, scale: [0, 1, 3, 7, 8], bpm: 92, motif: [0, 2, 1, 3, 4, 2, 1, 0, 2, 3, 4, 1] },
  },
  {
    id: "r2-mali-kora",
    region: "west-africa",
    city: "Bamako",
    country: "Mali",
    lat: 12.6392,
    lng: -8.0029,
    hint: "Cascading harp-like plucks over a steady polyrhythm — bright, water-like, calling and answering",
    song: { title: "Kora improvisation", style: "Mande griot", year: "trad." },
    audio: { instrument: "kalimba", root: 293.66, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 104, motif: [0, 4, 2, 6, 5, 3, 4, 2, 0, 2, 4, 5] },
  },
  {
    id: "r3-india-sitar",
    region: "south-asia",
    city: "Varanasi",
    country: "India",
    lat: 25.3176,
    lng: 82.9739,
    hint: "A long humming drone underneath a melody that bends, glides, and ornaments every note",
    song: { title: "Raga Yaman alap", style: "Hindustani classical", year: "trad." },
    audio: { instrument: "sitar", root: 220.0, scale: [0, 2, 4, 6, 7, 9, 11], bpm: 60, motif: [0, 2, 4, 2, 6, 4, 7, 6, 4, 2, 0] },
  },
  {
    id: "r4-japan-koto",
    region: "east-asia",
    city: "Kyoto",
    country: "Japan",
    lat: 35.0116,
    lng: 135.7681,
    hint: "Sparse, plucked strings on a five-note scale, with breathing space between phrases",
    song: { title: "Sakura Sakura", style: "Koto, Hirajōshi scale", year: "trad." },
    audio: { instrument: "koto", root: 261.63, scale: [0, 1, 5, 7, 8], bpm: 72, motif: [0, 2, 3, 4, 3, 2, 0, 2, 1, 0] },
  },
  {
    id: "r5-cuba-son",
    region: "caribbean",
    city: "Havana",
    country: "Cuba",
    lat: 23.1136,
    lng: -82.3666,
    hint: "Tight wood-on-wood clave pattern, plucked bass walking, bright muted brass stabs",
    song: { title: "Son cubano groove", style: "Son montuno", year: "1950s" },
    audio: { instrument: "claves", root: 220.0, scale: [0, 3, 5, 7, 10], bpm: 96, motif: [0, 3, 5, 3, 7, 5, 3, 0, 5, 3, 0, 7] },
  },
  {
    id: "r6-brazil-bossa",
    region: "south-america",
    city: "Rio de Janeiro",
    country: "Brazil",
    lat: -22.9068,
    lng: -43.1729,
    hint: "Soft nylon-string guitar in syncopated chords, brushed snare, melody floating gently above",
    song: { title: "Bossa nova standard", style: "Bossa nova", year: "1960s" },
    audio: { instrument: "nylonGuitar", root: 246.94, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 110, motif: [0, 4, 7, 4, 9, 7, 4, 2, 0, 4, 2, 0] },
  },
  {
    id: "r7-turkey-saz",
    region: "middle-east",
    city: "Istanbul",
    country: "Turkey",
    lat: 41.0082,
    lng: 28.9784,
    hint: "Long-necked plucked lute, microtonal slides between notes, hand-drum accent on the off-beat",
    song: { title: "Bağlama taksim", style: "Turkish makam", year: "trad." },
    audio: { instrument: "saz", root: 196.0, scale: [0, 1, 4, 5, 7, 8, 11], bpm: 84, motif: [0, 1, 4, 5, 4, 1, 0, 1, 4, 7, 5, 4] },
  },
  {
    id: "r8-kenya-benga",
    region: "east-africa",
    city: "Nairobi",
    country: "Kenya",
    lat: -1.2864,
    lng: 36.8172,
    hint: "Fast, ringing twin-guitar lines bouncing off each other over a cantering bass",
    song: { title: "Benga groove", style: "Benga", year: "1970s" },
    audio: { instrument: "kalimba", root: 329.63, scale: [0, 2, 4, 7, 9], bpm: 124, motif: [0, 2, 4, 7, 4, 2, 0, 4, 7, 9, 7, 4] },
  },
  {
    id: "r9-uk-folk",
    region: "europe",
    city: "Galway",
    country: "Ireland",
    lat: 53.2707,
    lng: -9.0568,
    hint: "Bright fiddle reel, drone-like accordion, lifting and skipping in 4/4 with a swung feel",
    song: { title: "Reel in D", style: "Irish trad", year: "trad." },
    audio: { instrument: "fiddle", root: 293.66, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 132, motif: [0, 2, 4, 7, 4, 2, 0, 4, 7, 9, 11, 7] },
  },
  {
    id: "r10-uzbek-dombra",
    region: "central-asia",
    city: "Bukhara",
    country: "Uzbekistan",
    lat: 39.7681,
    lng: 64.4556,
    hint: "Two-string lute strumming a hypnotic two-note bed under a wandering vocal-like melody",
    song: { title: "Shashmaqam ostinato", style: "Uzbek shashmaqam", year: "trad." },
    audio: { instrument: "saz", root: 174.61, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 76, motif: [0, 3, 5, 3, 7, 5, 3, 2, 0, 3, 2, 0] },
  },
  {
    id: "r11-louisiana-jazz",
    region: "north-america",
    city: "New Orleans",
    country: "United States",
    lat: 29.9511,
    lng: -90.0715,
    hint: "Brassy stride piano triads, sliding muted trumpet, a cymbal that swings every beat",
    song: { title: "Second line groove", style: "New Orleans jazz", year: "1920s" },
    audio: { instrument: "jazzPiano", root: 261.63, scale: [0, 3, 5, 6, 7, 10], bpm: 116, motif: [0, 3, 5, 6, 7, 6, 5, 3, 0, 5, 7, 10] },
  },
  {
    id: "r12-australia-didj",
    region: "oceania",
    city: "Arnhem Land",
    country: "Australia",
    lat: -12.4634,
    lng: 134.9650,
    hint: "Earthy circular-breathed drone with rhythmic overtones — almost no melody, all texture",
    song: { title: "Didjeridu rhythm", style: "Yolŋu manikay", year: "trad." },
    audio: { instrument: "didjeridu", root: 73.42, scale: [0, 0, 0, 7, 0, 0, 12, 0], bpm: 70, motif: [0, 0, 7, 0, 12, 0, 0, 7] },
  },
];

export function getRound(index: number): Round {
  return ROUNDS[index % ROUNDS.length];
}
