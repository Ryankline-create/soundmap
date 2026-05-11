# SoundMap

Discover music worldwide. A mobile-first guessing game: hear a clip, guess the region, drop a pin on the world map, then get an AI-powered Song Deep Dive on the music you just heard.

Built for the Congressional App Challenge as a 90-second screen-recording demo.

---

## What it does

- **Splash** — Player enters a name, stored on-device.
- **Play** — A 30-second clip plays (procedurally generated in the browser using Web Audio API, so each region has a distinct sound). Player picks a region, drops a pin on the map, submits a guess. Scoring rewards correct region + pin accuracy, costs XP for replays.
- **Song Deep Dive** — One AI call (`/api/deep-dive`, Anthropic) explains the song's region, instruments, history, what to listen for, and a fun fact. If no API key is set, a hand-curated fallback ships in the same shape — the demo always works.
- **Trivia / Lessons / Trending / Explore / Ranks** — Polished "Coming soon" screens previewing the rest of the app.

## Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS v3 + shadcn/ui (Radix Slot, no Base UI)
- Web Audio API (no audio files bundled — synthesis per region)
- Anthropic Messages API via plain `fetch` (no SDK dep)
- localStorage for player + XP/streak/history (no database)

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

To enable real AI deep dives, set:

```bash
ANTHROPIC_API_KEY=sk-ant-...   # in .env.local
```

If unset, the app falls back to bundled curated content for every round — the demo flow still works end-to-end.

## Install on your phone (PWA)

SoundMap is installable as a Progressive Web App — taps to a home-screen icon, opens fullscreen with no browser bars, looks identical to a native app.

**Same Wi-Fi as your laptop:**
1. With `npm run dev` running, find your Mac's local IP: `ipconfig getifaddr en0`
2. On your phone, open Safari (iOS) or Chrome (Android) → visit `http://<that-ip>:3000`
3. **iOS:** tap Share → "Add to Home Screen" → Add. **Android:** three-dot menu → "Add to Home screen" or "Install app".
4. Tap the SoundMap icon on your home screen — it opens fullscreen.

**Anywhere on the internet:**
Deploy the repo to any Next.js host (Vercel, Netlify, Cloudflare Pages, Render). Visit the HTTPS URL on your phone, then install via the same Add-to-Home-Screen flow.

## Demo flow

1. Splash → enter name → "Start"
2. Play tab — Round 1 is Balinese gamelan. Tap ▶ to listen, pick **Southeast Asia**, drop a pin near Indonesia, submit.
3. Result reveal shows correct region/city, distance, XP earned.
4. Tap **Deep Dive** → AI explains gamelan's instruments, history, what to listen for.
5. Tap **Next round** → repeat with a different region.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the exact click sequence used in the recording.

## Project layout

```
app/
  page.tsx              — splash / onboarding (light)
  template.tsx          — route-in fade animation
  layout.tsx            — root, fonts, metadata
  (app)/                — dark in-app route group with bottom nav + game header
    layout.tsx
    play/page.tsx
    deep-dive/page.tsx, [id]/page.tsx
    trivia/, lessons/, trending/, explore/, ranks/   — placeholder tabs
  api/deep-dive/route.ts — Anthropic call + curated fallback

components/
  ui/                   — shadcn primitives (button, card, input)
  audio-player-card.tsx — ▶ + progress + replay-cost
  region-grid.tsx       — 12-region picker
  world-map.tsx         — stippled SVG world, click to drop pin
  result-card.tsx       — guess reveal + XP breakdown + Deep Dive CTA
  deep-dive-card.tsx    — AI/curated dive presentation
  game-header.tsx       — sticky XP bar + level + streak
  bottom-nav.tsx        — 7-tab bottom nav

lib/
  audio.ts              — Web Audio synth + 10 instrument presets
  rounds.ts             — 12 rounds (region, target city, hint, audio preset)
  regions.ts            — region constants
  scoring.ts            — haversine distance + XP scoring
  storage.ts            — player + game state in localStorage
  deep-dive.ts          — curated fallback per round
  utils.ts              — shadcn cn()
```

## Design notes

- **Mobile-first**: container is `max-w-md`, all type and spacing tuned for 390×844 (iPhone 14).
- **Brand palette** is pulled directly from the logo: coral → pink → purple gradient on near-black.
- **No real auth, no database** — pure local state. By design.
- **Audio is synthesized**, not bundled. Each region has a unique scale, instrument timbre, tempo and motif, generated live with oscillators + filters. Avoids licensing and CORS issues completely; works offline.
