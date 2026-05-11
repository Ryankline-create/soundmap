# SoundMap — 90-second demo script

The exact click sequence to record. Total: ~85 seconds. No dead clicks, no console errors.

## Recording setup

Pick whichever recording surface you prefer:

**Option A — Desktop browser (most reliable for audio):**
1. `npm run dev` — server on `http://localhost:3000`
2. Resize the Chrome window narrow (~400px wide). The app fills the column edge-to-edge and looks like a real phone.
3. Open `http://localhost:3000`. Optional: Incognito window so localStorage starts empty.
4. Use QuickTime / OBS / built-in screen recorder.

**Option B — Real phone, installed as PWA (most "native app" feel):**
1. Follow the install steps in [README.md](README.md#install-on-your-phone-pwa) so the SoundMap icon is on the home screen.
2. Tap the icon — opens fullscreen with no browser bars.
3. Screen-record on the phone (iOS: Control Center → Record. Android: Quick Settings → Screen Record).

**Option C — Chrome DevTools mobile emulation (frame-accurate but audio sometimes blocked):**
1. Chrome → DevTools (F12 / ⌘⌥I) → toggle device toolbar (⌘⇧M)
2. Pick **iPhone 14** (390 × 844)
3. Refresh once. If audio doesn't play, fall back to Option A.

## Click sequence (with timing)

| Time | Action | What the viewer sees |
|------|--------|----------------------|
| 0:00 | Open `http://localhost:3000` | Splash — full SoundMap logo on white, name input below |
| 0:02 | Type a name (e.g. "Maya") | Brand-gradient "Start" button activates |
| 0:05 | Tap **Start** | Cross-fade into the dark Play tab — XP bar 0 / 200, Lv 1 |
| 0:07 | Tap the big ▶ play button | Procedural Balinese gamelan plays for 30s, progress bar fills |
| 0:10 | Read aloud the hint: *"Shimmering interlocking bronze metallophones — no single melody leads, it's woven together"* | Hint card with brand-pink quotes |
| 0:18 | (Don't replay — first play is free, 50 XP region bonus + up to 50 XP pin) | Replay-cost copy stays "2 plays left · 10 XP each" |
| 0:22 | Scroll down. Tap **🌺 Southeast Asia** in the region grid | Tile lights up with brand gradient |
| 0:28 | Scroll to map. Tap roughly on Indonesia | Pink pin drops, lat/lng appears |
| 0:34 | Tap **Submit guess** | Result card flies in: "Region match · +95 XP", reveals song = Gamelan Gong Kebyar, Ubud, Indonesia |
| 0:42 | Map below shows pin + target + dashed line | XP bar in header animates from 0 → 95 |
| 0:46 | Tap **Deep dive** (left button on result) | Loading skeleton, then the AI/curated dive card slides in |
| 0:52 | Scroll: cultural context → history → instruments → listen-for | Each section in its own card, brand-pink accents |
| 1:08 | Tap **Back** then **Play** in bottom nav | Returns to Play tab |
| 1:12 | Tap **Next round** on the result card *(or the Play tab itself if already there)* | Round 2 — Mande kora music from Mali |
| 1:18 | Briefly demo: tap ▶ to confirm Round 2 sounds different (kora pluck vs gamelan shimmer) | Audio is clearly distinct per region |
| 1:24 | Tap **Trending** in bottom nav | Polished "Coming soon" card with feature preview |
| 1:28 | Stop recording | |

## Talking points (if narrating)

- *"Each region's clip is generated in the browser with the Web Audio API — different scale, instrument, tempo. No licensed music."*
- *"Region match gives you 50 XP. Pin accuracy gives up to 50 more. Replays cost 10 XP each — so the first listen matters."*
- *"The Deep Dive is one AI call — Anthropic's Claude — that explains the music. With no API key it falls back to curated content, so the demo always works."*
- *"State (XP, streak, history) is local to the device. No login, no database."*

## What you can safely skip

- The **Trivia / Lessons / Explore / Ranks** tabs all render the same coming-soon template — show one, that covers all of them.
- The map's pin precision doesn't have to be exact; region match is the main scoring lever.

## Common pitfalls

- **Audio doesn't play in iOS-emulated mode unless you've clicked once already.** Clicking ▶ counts. If the first click silently fails (rare), tap again — the AudioContext resumes on user gesture.
- **localStorage from a previous run** can pre-fill the name and skip past the splash feel. Use Incognito or run `localStorage.clear()` in the console before recording.
- **Don't refresh during the recording** — Round 1 always re-loads as Round 1 (gamelan), but the XP and streak in the header reset.
