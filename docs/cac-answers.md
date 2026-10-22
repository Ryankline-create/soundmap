# SoundMap: Congressional App Challenge answers

Draft answers in my voice. Anything in [brackets] is for me to check or fill in before submitting.

## 1. What programming languages did you use?

- **TypeScript and TSX** for the app itself (React Native with Expo).
- **JavaScript** for the sound synthesizer, which runs in Node and renders every instrument, and for the website's live audio (Web Audio API).
- **HTML and CSS** for the website.
- **JSON** for the lesson content and app configuration.

## 2. What platforms does your app run on?

- **iPhone and Android phones**, built with Expo and React Native. It runs in the Expo Go app on both.
- **Android APK**: an installable build, so it can be put on a phone without the Play Store.
- **Web**: a companion website tells SoundMap's story and has two small live demos (the opening guess and a playable SoundDeck).

## 3. What technical difficulties did you face?

**There is no Web Audio in React Native.** My first prototype made all its sounds live in the browser with the Web Audio API. Phones running React Native don't have that, so I split the problem in two. I wrote my own synthesizer in Node with no libraries. It builds every instrument from math:
- a sine wave that drops in pitch, plus a burst of filtered noise, for drums like the djembe, conga and taiko
- a pitch glide for the talking drum
- FM synthesis for bells
- plucked-string physics (the Karplus-Strong algorithm) for the kora, oud, sitar and guitar
- clusters of slightly out-of-tune partials for gamelan gongs

The synthesizer renders short audio files, and the app plays them back. That means we ship no recordings by anyone else, and nothing needs a license. [Number of sounds, total size.]

**Keeping layers in sync.** In the lessons you can bring the layers of a groove in one at a time, like the surdo, then the tamborim, then the cuíca. If each layer were its own audio file, they would drift apart. Instead, everything (lessons, quizzes, the guessing game and SoundDeck) plays through one sound engine with one clock. A layer you switch on waits for the next bar line, so it always comes in on the one.

**Timing.** Phones don't let JavaScript run code at an exact moment. A timer can fire 10 to 20 milliseconds late. So the engine never adds up small delays. It works out when every step *should* happen from the moment the loop started, and checks against that about every 4 ms. The Rhythm Coach judges your taps against those same times: within 60 ms is Perfect and within 120 ms is Good. It also allows for the small delay between the app playing a sound and you hearing it.

**A world map without a map SDK.** I didn't want an internet connection or an API key, so I projected the world map myself with the Equal Earth projection and turned it into shapes the app draws directly. Tapping the map works out which country you touched. The flight after each guess follows the real great-circle path between two points on the globe, the way planes fly.

**Android and iPhone differences.** Android draws the app edge to edge, under the status bar and the navigation buttons, so every screen had to leave room for them. I also had to pin the app to the exact Expo version the store's Expo Go supports, or it wouldn't open at all.

**Getting the rhythms right.** This was the hardest part that wasn't code. A rhythm in the wrong place would teach something false about real people's music. Every pattern is written out in the code with a note on where the hits fall and why: son clave 3-2, the teental cycle with its empty beat on 9, the twelve-beat flamenco compás with accents on 3, 6, 8, 10 and 12. [Which ones did I check against recordings or a teacher?]

## 4. How did you use AI, and what did you do yourself?

**The AI tools I used and how they helped:** I used [Claude / Claude Code] as a coding partner. I described what each part should do and how it should feel, and it wrote first versions of the code, which I then tested and changed. It helped most with:
- the parts that were new to me: the synthesizer math, the map projection, and the timing engine
- finding bugs that only appeared on Android
- [anything else]

**What I designed, wrote, tested and decided:**
- **The idea and the research.** SoundMap started from the Lisbon study on music and prejudice that I read, and from my own questions about where music comes from.
- **The lessons.** All 19 lessons came from my own research, in my words: the traditions, the instruments, the people, and the connections in the family tree. I decided which traditions to include and how to describe them.
- **The rules for respect.** No "exotic" or "ancient", credit communities by name, explain each tradition in its own terms, and keep the Yolŋu yidaki in its ceremonial context.
- **How it works.** I designed listen first, then guess, then the story; passport stamps; and XP that unlocks SoundDeck packs. [Other design decisions I made.]
- **Testing.** I tested on [my iPhone / Android phone], [what I changed after testing].
- **Checking the AI's work.** AI made mistakes, so I checked its facts against my sources and changed things that were wrong. [One example.]

## Other answers

These are already written in `docs/content/client-brief.md`: the video script, what the app does, my inspiration, Version 2.0, and what I learned. Before submitting:
- [ ] In "What I learned", fill in: [Name one connection that surprised you.]
- [ ] In "What the app does", change "oud, accordion and frame drum from East Africa" to "**from North Africa and the Middle East**". Those instruments come from there, and the app's pack is now named that way.
- [ ] Also in "What the app does": SoundMap now runs as a phone app (iPhone and Android), not only in a browser. Update "synthesized live in the browser" and "runs in any browser" to match.
