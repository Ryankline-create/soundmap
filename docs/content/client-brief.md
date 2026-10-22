# SoundMap — client brief (from the student)

The student's own words, copied from the CAC answers doc. Source of truth for copy, the story, and what the app must do.

## Pitch video script (student)
[Play 5 seconds of an unfamiliar musical tradition.]
Where do you think that music comes from?
Africa? South America? Somewhere in Asia?
Now, here's a harder question: What do you know about the people who created it?
We have more access to the world's music than any generation before us. But hearing a culture's music isn't the same as understanding it.
I created SoundMap to change this.
SoundMap turns music into a passport to the world.
Here's how it works.
[Show interactive map]
You hear a sound from somewhere on Earth. Your challenge? Figure out where it comes from.
Make your guess, earn points, and unlock the story behind the music.
But guessing is just the beginning.
[Show Lessons tab]
SoundMap features 19 interactive lessons where students explore instruments, break down rhythms, and discover the communities behind the music.
[Show quizzes]
As students complete lessons and quizzes, they earn XP, level up, and unlock new musical possibilities.
[Show musical family tree]
They can also explore the musical family tree, tracing how traditions have traveled across continents and influenced the music we listen to today.
[Show SoundDeck]
I also built SoundDeck, an interactive music production studio where the XP students earn through lessons and quizzes unlocks instrument packs from around the world.
Students can experiment with instruments like West African djembes and different drums by using a digital keyboard to create and record their own beats.
There's even a Rhythm Coach that teaches students how to play traditional musical patterns.
Instead of simply hearing how different cultures make music, students get to explore the rhythms, instruments, and creative decisions that bring those traditions to life.
[Show SoundDeck code or audio engine]
One of my biggest technical challenges was building SoundDeck's audio engine.
Using the Web Audio API, I programmed instruments and rhythms to be synthesized directly in the browser, rather than relying on prerecorded samples.
I also built a 16-step sequencer that lets students arrange beats and adjust their tempo in real time.
But getting the code to produce sound was only half the challenge. I had to make sure the rhythms were culturally accurate, because recreating a tradition incorrectly would undermine the very understanding I wanted to build.
But SoundMap is about something much bigger than music education.
It's about the possibility that understanding another culture's music can change the way we see the people who created it.
Studies have found that learning music from unfamiliar cultures can foster more positive attitudes toward the people behind it. In one study, those changes were still measurable two years later.
Music can do more than connect us for the length of a song. It can change what we carry with us after the music stops.
I wanted students to recognize the real people, histories, and communities behind every song.
[Return to the opening audio.]
Remember that sound I played at the beginning?
My goal isn't just for you to recognize where it comes from.
It's for you to become curious about the people who created it.
Because music doesn't have to speak our language to help us understand one another.


## What the app does 
SoundMap is an ethnomusicology learning app that helps students understand the world’s cultures by starting with their ears. Instead of a textbook, it opens with a sound: a real recording or groove from somewhere on Earth. Students listen, then guess where it comes from on an interactive map, earning passport stamps, XP and levels as their listening passport fills up. Every guess, right or wrong, opens the door to the place and people behind the music.
The Lessons tab offers 19 guided listening journeys. Each walks through a tradition slide by slide: hear it first, discover the instruments, pick apart the layers of the groove, take an ear-training challenge, then learn about the place, the people who make the music, and where the sound travelled next. Traditions are presented as living music made by real communities, not museum pieces or exotic sound effects.
A family tree connects every tradition, showing how music has always moved between peoples. Students can trace how griot music from Mali echoes through the blues into New Orleans jazz, how rhythms from Angola and the Congo became the heartbeat of samba, and how Cuban and Puerto Rican musicians in New York created salsa. No culture’s music exists in isolation; the songs students love are built from many others.
SoundDeck is SoundMap’s beat-making studio, where students stop only listening and start playing. Each sound pack holds a region’s instruments: djembe, talking drum and balafon from West Africa; clave, congas and güiro from the Caribbean; tabla, tanpura and sitar from South Asia; gong and kendang from Southeast Asia; oud, accordion and frame drum from East Africa. Every sound is synthesized live in the browser, so there’s nothing to license or download. Students tap 16 performance pads or draw into a 16-step sequencer, record grooves in real time and set the tempo. Packs unlock as they earn XP, and the Rhythm Coach loads ten real patterns, from son clave and reggae’s one drop to a teental cycle, a Kuku groove and a gamelan gong cycle, each with a note on how it works and pads that light up so students can play along.
Trending brings in music journalism from The Guardian, NPR Music, Sounds and Colours and more, with short notes giving cultural and historical context. Learn & Play turns everything into quizzes, spaced-review flashcards and “explain it back” prompts. SoundMap runs in any browser on phones, tablets and Chromebooks.

## Inspiration 
Most music education starts with notation and dates. But music is something you hear before you understand it, and that’s how most of us first meet other cultures too: a song in a film, a playlist, a classmate’s family celebration. I wanted to build something that starts from that moment of hearing and turns “where is this from?” into a reason to learn about the people who made it.
A study from Portugal convinced me this could matter far beyond music class. Researchers worked with 229 sixth-graders in public schools around Lisbon, all from light-skinned families. They measured the students’ prejudice toward darker-skinned people in two ways: a questionnaire, and an Implicit Association Test, which detects unconscious bias people may not notice in themselves. Half the students then spent six months in a school music programme that mixed Cape Verdean songs with Portuguese ones. Cape Verde is an African country and former Portuguese colony, and many Cape Verdeans live in the Lisbon area.
The results surprised me. Prejudice dropped among the students who learned the songs, on both the questionnaire and the unconscious test. Students who had their usual classes showed no change. When the researchers checked again three months later, and then two years later, the effect was still there. It was also specific: attitudes toward Cape Verdeans improved, but attitudes toward other groups didn’t. Students warmed to the people whose music they had actually learned.
This finding is what has guided SoundMap. If learning one culture’s music can reduce prejudice toward that culture, then a student who listens their way across many traditions has many chances to see strangers as people. Other research points the same way: Oxford researchers found that even a few minutes of West African or Indian music made listeners’ attitudes toward those cultures more positive, especially for people who were open and empathetic. Music seems to work best with context and respect around it, which is exactly what an app can add.
Streaming puts the world’s music one tap away, yet almost nothing helps students understand who made it or how traditions shaped each other. SoundMap is my attempt to close that gap: to give every student a passport of places they’ve listened their way into, and the sense that the world’s people share more than divides them.


## Technical difficulties (to write) 


## Version 2.0 
Version 2.0 would move SoundMap from learning about other cultures toward connecting with them.
Classroom-to-classroom listening exchanges. Pair classes in different countries. Each class records a short introduction to music from its own community, then the other class tries to place it on the map and asks questions. Students would hear about traditions from people who live them, not only from an app. This builds on decades of research showing that structured contact between groups reduces prejudice.
Voices from the tradition. Add short, permission-based introductions from musicians and community members for each tradition, so cultures speak for themselves.
“Add your family’s music.” Let students contribute a song from their own heritage to a moderated class map. Students whose families come from elsewhere would see their culture valued, and classmates would discover how many places their own class connects to.
Live classroom mode. A PIN lobby where a teacher hosts a Kahoot-style round with a real-time leaderboard, plus a “play it together” round where the class keeps one rhythm in sync. Cambridge researchers found that a school year of group rhythm games raised children’s empathy, while similar games without music did not.
More languages. Translate lessons so students who are still learning English can use SoundMap, and so it can reach classrooms beyond the U.S.
Measuring real impact. A short before-and-after survey so teachers can see whether SoundMap actually changes how students feel about the cultures they study. Research suggests music can do this, but I’d rather test it than assume it.
Practical upgrades. A teacher dashboard showing progress by world region, more traditions (expanding the country data to 35), a sing- and play-along mode built on the sound engine, and an offline mode for school Wi-Fi that drops.
The goal is an app that leaves students not just knowing more about the world, but feeling more connected to the people in it.

## AI use (to write) 


## What I learned
The hardest part of building an app isn’t the code. It’s deciding exactly what it should teach and then being ruthless about cutting everything else. But the biggest lessons were about culture, not software.
The world’s music is more connected than I expected. Building the family tree, I kept finding that traditions I thought of as separate were related. Rhythms, instruments and ideas have always travelled with people, and most music I grew up with carries pieces of places I’d never thought about. [Name one connection that surprised you.] I stopped thinking of cultures as separate boxes and started seeing them as branches of one story.
Respect is a design decision. Early on, it was easy to describe a tradition with words like “exotic” or “ancient,” as if it belonged to the past. I learned to present every tradition as living music made by real people today, to explain it in its own terms, and to give credit to the communities behind it. Those choices shape how students feel about the people, not just what they know.
Research matters, including its limits. I read studies showing that music can build empathy and reduce prejudice, and that inspired me. But I also learned that listening alone isn’t enough: the effects were strongest when people were open and had context. That’s why SoundMap never plays a song without the story of who made it. It also taught me to be honest. My app is designed around this research, but I haven’t proven it works yet, which is why I want to measure it in 2.0.
Care matters most when students are the audience. Rights, accuracy and tone all needed attention, and AI content needed a human checking it.
How to build something big. I learned to break a large idea into small pieces, test each one, and keep going when something didn’t work the first three times.
Most of all, I learned that curiosity is a form of respect. Asking “where is this from, and who made it?” is the first step toward understanding someone.
