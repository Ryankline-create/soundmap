export type DeepDive = {
  region_summary: string;
  cultural_context: string;
  history: string;
  instruments: { name: string; role: string }[];
  listen_for: string[];
  fun_fact: string;
};

export const DEEP_DIVES: Record<string, DeepDive> = {
  "r1-bali-gamelan": {
    region_summary:
      "Gamelan Gong Kebyar is the explosive 20th-century reinvention of Balinese gamelan — an entire orchestra made almost entirely of tuned bronze percussion, played by 25–30 musicians sitting cross-legged on the temple floor.",
    cultural_context:
      "Gamelan is woven into Balinese daily life. Every village has its own ensemble, and ceremonies — weddings, cremations, temple festivals — are unthinkable without it. The musicians don't read sheet music; pieces are taught by ear and remembered as a community.",
    history:
      "The Kebyar style burst out of North Bali around 1915, deliberately faster, louder and more theatrical than older court gamelan. It quickly spread island-wide and became Bali's signature sound, partly because of how electrifying it was for visiting Western composers like Colin McPhee in the 1930s.",
    instruments: [
      { name: "Gangsa", role: "Bronze keyed metallophone — carries the interlocking melody (kotekan)" },
      { name: "Reyong", role: "Row of small bossed gongs played by 4 musicians together" },
      { name: "Kendang", role: "Two hand drums that lead the ensemble's tempo and dynamics" },
      { name: "Gong ageng", role: "The huge low gong that marks the end of every cycle" },
    ],
    listen_for: [
      "Pairs of instruments tuned slightly apart so the sound 'shimmers' — that's intentional",
      "How no single player has the full melody — they interlock note-by-note",
      "The huge low gong that punctuates every phrase",
    ],
    fun_fact:
      "Balinese gamelan instruments are tuned in pairs — one slightly higher than the other — to create the trademark shimmer you hear. The pair is called pengumbang and pengisep, 'breath-in' and 'breath-out'.",
  },
  "r2-mali-kora": {
    region_summary:
      "The kora is a 21-string harp-lute played by Mande griots across Mali, Senegal, Guinea and The Gambia — half harp, half lute, played with thumb and forefinger of both hands.",
    cultural_context:
      "Griots are West Africa's hereditary musician-historians. A griot is born into the role and trained from childhood to remember genealogies, sing praise songs and mediate between families. The kora is their core accompaniment.",
    history:
      "The kora dates back at least to the 16th-century Mali Empire. It's been thrust into global ears since the 1970s by players like Toumani Diabaté, who showed the world the instrument could hold its own with jazz, blues and orchestras.",
    instruments: [
      { name: "Kora", role: "21-string harp-lute, half-gourd resonator covered in cowhide" },
      { name: "Ngoni", role: "Older, smaller plucked lute, ancestor of the banjo" },
      { name: "Balafon", role: "Wooden xylophone with gourd resonators" },
    ],
    listen_for: [
      "Two melody lines crossing — the player's right and left thumbs are doing different things",
      "A constant rolling pulse called kumbengo underneath improvised flourishes",
      "Sung praise lines that name real ancestors",
    ],
    fun_fact:
      "Kora players still build their own instruments. The cow-skin head is glued on and tuned by tightening leather rings up the neck — there are no machine heads.",
  },
  "r3-india-sitar": {
    region_summary:
      "Hindustani classical music from North India is built on raga (melodic frameworks tied to mood and time of day) and tala (cyclic rhythms), performed as long, unfolding improvisations.",
    cultural_context:
      "A full performance can run an hour on one raga. Listeners don't expect songs — they expect a slow journey from drone to climax, performed by musicians who train under their guru for decades.",
    history:
      "The Hindustani tradition crystallized at Mughal courts in the 16th–18th centuries, blending older Vedic chant with Persian musical ideas. The sitar itself is thought to have evolved from the Persian setar in the 13th century.",
    instruments: [
      { name: "Sitar", role: "Long-necked plucked lute with sympathetic strings that ring on their own" },
      { name: "Tanpura", role: "Drone instrument — its constant hum is the harmonic ground of the raga" },
      { name: "Tabla", role: "Pair of hand drums providing the tala (rhythmic cycle)" },
    ],
    listen_for: [
      "The opening alap — slow, free-time, no drums, just exploring the raga's notes",
      "Meend — the way notes glide and bend, almost like a voice",
      "Sympathetic strings buzzing in the background, untouched by the player",
    ],
    fun_fact:
      "Each raga is traditionally tied to a time of day or season. Playing a morning raga at night is considered slightly off — like serving breakfast at midnight.",
  },
  "r4-japan-koto": {
    region_summary:
      "The koto is Japan's 13-string zither, plucked with picks worn on the right hand. Its sound is sparse, deliberate and deeply tied to pentatonic scales like Hirajōshi.",
    cultural_context:
      "Koto music traditionally accompanies poetry, court ceremony and tea. Even today it's a common first instrument for Japanese children studying classical music, and a flagship of cultural ambassador groups abroad.",
    history:
      "Imported from Tang-dynasty China around the 7th century, the koto became a fixture of the Heian-era imperial court. The solo and chamber repertoire we hear today mostly took shape in the Edo period (17th–19th c.).",
    instruments: [
      { name: "Koto", role: "13-string zither — bridges (ji) under each string set the tuning" },
      { name: "Shakuhachi", role: "End-blown bamboo flute, breathy and meditative" },
      { name: "Shamisen", role: "Three-string lute with a sharp, percussive attack" },
    ],
    listen_for: [
      "Generous silence between notes — the rest is part of the music",
      "Bent notes — the player presses behind the bridge to pitch a note up",
      "Hirajōshi scale: minor and slightly suspended-sounding, very 'Japanese' to Western ears",
    ],
    fun_fact:
      "The koto is so long (about 6 ft) that traditional players sit on the floor with the instrument across their laps. Modern stage koto adds folding legs.",
  },
  "r5-cuba-son": {
    region_summary:
      "Son cubano — born in eastern Cuba — is the rhythmic DNA of nearly all Latin dance music, including salsa. It's built on the clave: a 5-stroke pattern that everything else syncs to.",
    cultural_context:
      "Son moved from rural eastern Cuba to Havana in the 1920s and exploded. The conjunto format you hear (vocals, tres, bass, percussion, brass) became the template for dance bands across the Spanish-speaking world.",
    history:
      "Son emerged in the late 1800s in Oriente province, fusing Spanish guitar/canción traditions with Bantu drumming brought by enslaved Africans. By the 1930s it was Cuba's dominant popular music.",
    instruments: [
      { name: "Tres", role: "Three-pair Cuban guitar with a bright, ringing montuno pattern" },
      { name: "Claves", role: "Two wooden sticks tapping the foundational 3-2 or 2-3 clave pattern" },
      { name: "Bongo / conga", role: "Hand drums laying the groove" },
      { name: "Bass", role: "Anticipates the downbeat instead of landing on it — that's the swing" },
    ],
    listen_for: [
      "The clave pattern — once you hear it, you can't un-hear it",
      "The bass landing 'before' the beat",
      "Call-and-response between the lead singer and chorus (the montuno section)",
    ],
    fun_fact:
      "The clave isn't optional. Cuban musicians say a tune is 'in clave' or 'crossed' (cruzado), and a band that loses the clave is considered to have crashed.",
  },
  "r6-brazil-bossa": {
    region_summary:
      "Bossa nova is the late-1950s Rio de Janeiro reimagining of samba — quieter, slower, harmonically rich, sung half-whispered.",
    cultural_context:
      "Bossa was middle-class beach music: invented in Copacabana apartments by friends who wanted samba you could play softly so the neighbors wouldn't complain. It became Brazil's biggest cultural export of the 20th century.",
    history:
      "The genre crystallized around 1958 with João Gilberto's recording of 'Chega de Saudade' (Jobim/Moraes). By 1962 — Carnegie Hall concert, Getz/Gilberto album — it was a global phenomenon.",
    instruments: [
      { name: "Nylon-string guitar", role: "Plays syncopated chord patterns (the 'batida') — the genre's heartbeat" },
      { name: "Voice", role: "Soft, conversational, almost spoken" },
      { name: "Brushed snare / shaker", role: "Gentle samba-derived rhythm, never loud" },
    ],
    listen_for: [
      "The guitar pattern — anticipated, off the beat, never on the 1",
      "Lush jazz-derived chords (major 7ths, 9ths) instead of plain triads",
      "Lyrics in Portuguese about longing, the sea, Rio itself",
    ],
    fun_fact:
      "João Gilberto used to make musicians rehearse a single song for hours until the rhythmic feel was exactly right. Bossa is famously quiet — but the discipline behind it isn't.",
  },
  "r7-turkey-saz": {
    region_summary:
      "The bağlama (also called saz) is a long-necked plucked lute central to Turkish folk and Alevi religious music, with movable frets that can play microtonal makam scales.",
    cultural_context:
      "The saz is the instrument of the aşık — wandering poet-singers whose repertoire has carried social commentary, love poetry and Alevi religious teaching for centuries.",
    history:
      "The instrument descends from the Central Asian kopuz brought by Turkic peoples migrating west. The modern bağlama family took shape in Anatolia over the past 600 years.",
    instruments: [
      { name: "Bağlama / saz", role: "Long-necked lute with 7 strings in 3 courses" },
      { name: "Darbuka", role: "Goblet hand drum, sharp clear tones" },
      { name: "Kemençe", role: "Bowed Black Sea fiddle, sometimes added" },
    ],
    listen_for: [
      "Notes between Western piano keys — that's makam, not 'out of tune'",
      "A strummed drone alternating with a fingered melody on the same instrument",
      "The taksim — a free-time improvised intro before the rhythmic piece",
    ],
    fun_fact:
      "Bağlama frets are tied on with fishing line so the player can slide them to retune for different makam. A piano can't do this — the saz can.",
  },
  "r8-kenya-benga": {
    region_summary:
      "Benga is a Kenyan dance music born among the Luo people on the shores of Lake Victoria — fast, ringing, twin-electric-guitar grooves over a cantering bass.",
    cultural_context:
      "Benga was the soundtrack of Kenyan independence-era social life. Bands toured rural circuits playing weddings and bars, and in the 1970s it became Kenya's biggest pop export across East Africa.",
    history:
      "The genre took shape in the 1960s when guitarists like Daniel Owino Misiani translated traditional Luo lyre (nyatiti) and finger-picking patterns onto cheap electric guitars.",
    instruments: [
      { name: "Lead guitar", role: "Bright, ringing single-note runs that imitate the nyatiti lyre" },
      { name: "Rhythm guitar", role: "Interlocks with the lead, often two octaves apart" },
      { name: "Bass", role: "Walking, syncopated lines that drive the dance" },
      { name: "Drum kit", role: "Steady, fast 4/4 with a busy hi-hat" },
    ],
    listen_for: [
      "Guitar lines that sound like a harp or a thumb-piano",
      "Lyrics in Dholuo (Luo language)",
      "How the bass is melodic — it's a third voice, not just a foundation",
    ],
    fun_fact:
      "Benga's distinctive guitar tone often comes from playing with a thin pick on heavy strings — closer to a thumb than a rock guitarist.",
  },
  "r9-uk-folk": {
    region_summary:
      "Irish traditional music is built on dance tunes — reels, jigs, hornpipes — passed down by ear in pubs and at sessions for hundreds of years.",
    cultural_context:
      "An Irish session isn't a performance, it's a participatory event: players gather in a pub, share tunes, and anyone can join if they know the tune. The tradition is alive because of these gatherings.",
    history:
      "Many tunes are anonymous and centuries old. The current revival owes a lot to 1960s ensembles like The Chieftains, who proved instrumental Irish music could fill concert halls.",
    instruments: [
      { name: "Fiddle", role: "Carries the melody — same instrument as a violin, totally different bowing" },
      { name: "Tin whistle / flute", role: "Wooden flute or simple metal whistle, very fast ornamentation" },
      { name: "Bodhrán", role: "Frame drum played with a double-ended stick called a tipper" },
      { name: "Uilleann pipes", role: "Bellows-blown bagpipes — quieter than Highland pipes, indoor instrument" },
    ],
    listen_for: [
      "Three pulses per beat (jig) vs four (reel) — different dance",
      "Ornaments — rolls, cuts, crans — that decorate single notes",
      "How everyone plays the same tune at the same time, no harmony",
    ],
    fun_fact:
      "Tunes are usually played in 'sets' of two or three, segued with a nod or a stomp. If you don't know the next tune, you stop playing and listen.",
  },
  "r10-uzbek-dombra": {
    region_summary:
      "Shashmaqam is the classical art music of Uzbekistan and Tajikistan — six interlocking suite-cycles ('maqam') that have been the prestige music of Bukhara and Samarkand for centuries.",
    cultural_context:
      "Historically, shashmaqam was court music. Today it survives through state ensembles and conservatories — and through Bukharan-Jewish communities in Israel, New York and Vienna who carried the repertoire abroad.",
    history:
      "The repertoire was codified in 18th-century Bukhara, drawing on older Persian and Arab maqam traditions. The Soviet era both preserved (state ensembles) and disrupted (banning religious texts in lyrics) the tradition.",
    instruments: [
      { name: "Tanbur", role: "Long-necked plucked lute, the lead melodic voice" },
      { name: "Doira", role: "Frame drum with metal rings inside, providing the cyclic rhythm" },
      { name: "Sato", role: "Bowed version of the tanbur" },
      { name: "Voice", role: "Often singing classical Persian-language ghazal poetry" },
    ],
    listen_for: [
      "Long, suite-like form — many sections, all tied to the same maqam",
      "A drone or repeated note bed under the singer's florid melody",
      "Rhythmic cycles called usul that are often in 7 or 11 beats",
    ],
    fun_fact:
      "The lyrics are often in Persian, even when sung by Uzbek-speaking musicians — like opera being in Italian. The poetry is older than the political borders.",
  },
  "r11-louisiana-jazz": {
    region_summary:
      "New Orleans jazz is the original jazz — born around 1900 in a city where Creole, African, French, Spanish and Caribbean musical worlds had been mixing for two centuries.",
    cultural_context:
      "Jazz grew out of brass-band funeral processions, dance halls and the Storyville red-light district. The 'second line' — the celebrating crowd that follows a brass band through the streets — is still alive in New Orleans today.",
    history:
      "The genre's first recordings were made in 1917 by the Original Dixieland Jass Band. Louis Armstrong (b. 1901, New Orleans) carried it from collective improvisation into the modern soloist tradition.",
    instruments: [
      { name: "Cornet / trumpet", role: "Lead melody, often improvised" },
      { name: "Clarinet", role: "Decorates above the melody with quick obbligato lines" },
      { name: "Trombone", role: "Plays counter-melody and tailgate slides below" },
      { name: "Piano / banjo / bass / drums", role: "Rhythm section providing the groove" },
    ],
    listen_for: [
      "Three or four horns improvising at the same time (collective improvisation)",
      "Swing — the long-short feel inside each beat",
      "A 'second-line' bass-drum pattern that was originally a marching beat",
    ],
    fun_fact:
      "The 'second line' isn't the band — it's the dancing crowd that follows the band. A second-line parade in New Orleans can stretch for blocks and last all afternoon.",
  },
  "r12-australia-didj": {
    region_summary:
      "The didjeridu (yidaki, in Yolŋu language) is a wooden drone trumpet from northern Australia — a hollow eucalyptus branch eaten out by termites and shaped by the player.",
    cultural_context:
      "In Yolŋu culture from Arnhem Land, the yidaki accompanies manikay — sacred song cycles that map ancestral journeys across the land. Traditionally only initiated men play it.",
    history:
      "The instrument is at least 1,500 years old in northern Australia. It went global in the 20th century, often divorced from its ceremonial context — a tension Indigenous artists are still negotiating today.",
    instruments: [
      { name: "Yidaki / didjeridu", role: "Hollowed eucalyptus branch — a single drone with rich overtones" },
      { name: "Bilma", role: "Pair of clapsticks that mark the beat above the drone" },
      { name: "Voice", role: "Singer chanting manikay songs in language" },
    ],
    listen_for: [
      "Circular breathing — the drone never stops, even when the player inhales",
      "Overtone shifts — the player changes mouth shape to bring out melody from the harmonics",
      "Animal calls (dingo, bird) imitated through the instrument",
    ],
    fun_fact:
      "Players don't choose just any branch. They tap on living eucalyptus trees to find ones already hollowed by termites — the termites do the hardest part of the work.",
  },
};

export function getDeepDiveFallback(roundId: string): DeepDive | null {
  return DEEP_DIVES[roundId] ?? null;
}
