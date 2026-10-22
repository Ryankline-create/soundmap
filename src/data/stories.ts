// "Explain it back": short stories retold from the lessons. Feedback checks
// which key ideas the student's own words mention; a keyword matches as a
// lowercase substring.
import type { ExplainStory } from './types';

export const STORIES: ExplainStory[] = [
  {
    id: 'kora-story',
    lesson: 'kora',
    title: 'Keeping History in Song',
    text: 'Among the Mande people of Mali, Senegal and The Gambia, the jali are hereditary musicians, historians and diplomats. For centuries they have carried family histories, praise songs and news across West Africa. One of their instruments is the kora: twenty one strings on half a calabash covered with cowhide, held in two rows by a tall notched bridge. The player plucks with thumbs and index fingers only. The thumbs keep a repeating accompaniment called kumbengo, while the index fingers improvise runs called birimintingo. Toumani Diabaté, from a long jali line, made the kora a solo concert instrument. And when enslaved West Africans were carried across the Atlantic, plucked string traditions went with them. Scholars trace the banjo, and part of the blues, to that crossing.',
    ideas: [
      { label: 'The jali keep history in song', keywords: ['jali', 'griot', 'jeli', 'histor', 'praise song'] },
      { label: 'The kora has 21 strings on a gourd', keywords: ['21', 'twenty one', 'twenty-one', 'calabash', 'gourd', 'cowhide'] },
      { label: 'Thumbs repeat a bass, index fingers improvise', keywords: ['kumbengo', 'birimintingo', 'thumb', 'index finger', 'improvis'] },
      { label: 'Toumani Diabaté made it a concert instrument', keywords: ['toumani', 'diabat', 'concert'] },
      { label: 'Plucked strings crossed the Atlantic to the banjo and the blues', keywords: ['banjo', 'blues', 'atlantic'] },
    ],
  },
  {
    id: 'samba-story',
    lesson: 'samba',
    title: 'Building a Batucada',
    text: "Samba grew in Rio de Janeiro's working class neighborhoods in the early 1900s. Its African rooted rhythms came to the city with families from Bahia. Bahian women known as tias held parties in Praça Onze where the first sambas were played, and Tia Ciata's house was one of them: 'Pelo Telefone' (1916), often called the first recorded samba, came out of her circle. Today samba schools rehearse a bateria of hundreds of drummers to drive one carnival parade. A batucada is a stack of parts. The big surdo holds the pulse, the small tamborim and pandeiro fill the space around it, and the cuíca, a friction drum, bends its pitch like a laughing voice. Every drum has a job.",
    ideas: [
      { label: 'The rhythms came to Rio from Bahia', keywords: ['bahia', 'bahian'] },
      { label: 'Tia Ciata hosted parties where early samba was played', keywords: ['tia ciata', 'ciata', 'tias', 'praça onze', 'praca onze', 'pelo telefone'] },
      { label: 'A bateria has hundreds of drummers', keywords: ['bateria', 'hundreds', 'samba school', 'parade', 'carnival'] },
      { label: 'The surdo holds the pulse', keywords: ['surdo', 'bass drum', 'pulse'] },
      { label: 'The cuíca bends its pitch', keywords: ['cuíca', 'cuica', 'friction', 'laugh'] },
    ],
  },
  {
    id: 'jazz-story',
    lesson: 'jazz',
    title: 'New Orleans Invents a New Music',
    text: "From the 1790s into the 1800s, enslaved and free Black people gathered in Congo Square, New Orleans, on Sundays to drum, dance and trade, and those rhythms stayed in the city. Before jazz, ragtime piano was the sound of American popular music. Brass bands marched for parades and funerals: the trumpet took the melody, the clarinet wove around it, and the drums kept the street moving. Louis Armstrong learned cornet in the Colored Waif's Home band and became the soloist who showed the world that a soloist could invent the melody. In the 1910s and 20s, Black musicians left the segregated South for Chicago and New York, and by the 1930s jazz was a hit in Europe too.",
    ideas: [
      { label: 'Sunday drumming in Congo Square', keywords: ['congo square', 'congo', 'sunday'] },
      { label: 'Ragtime came just before jazz', keywords: ['ragtime'] },
      { label: 'Brass bands played for parades and funerals', keywords: ['brass band', 'parade', 'funeral', 'trumpet', 'clarinet'] },
      { label: 'Armstrong showed a soloist could invent the melody', keywords: ['armstrong', 'soloist', 'invent', 'improvis'] },
      { label: 'Musicians carried it to Chicago and New York', keywords: ['chicago', 'new york', 'migrat', 'moved north', 'left the south'] },
    ],
  },
  {
    id: 'reggaeton-story',
    lesson: 'reggaeton',
    title: 'One Beat Goes Global',
    text: "Reggaeton is built on one drum pattern, the dembow. Its snare does not sit where a rock backbeat would, and that offset is the whole character of the beat. The pattern travelled through the Caribbean before it became global pop. Jamaican dancehall records reached Panama in the 1980s, where DJs rapped over them in Spanish. In Puerto Rico in the 1990s, the beat met Spanish rap and became reggaeton, and by the 2000s it was everywhere. The band is often a drum machine: each pad holds one sound, and a step grid decides when it fires, so the timing is exactly as written. Puerto Rico's earlier dance sound was salsa, and reggaeton kept that dance floor while swapping the horns for synths.",
    ideas: [
      { label: "The dembow's snare lands off the backbeat", keywords: ['dembow', 'snare', 'offbeat', 'off the beat', 'backbeat'] },
      { label: 'It started in Jamaican dancehall', keywords: ['jamaica', 'dancehall', 'kingston'] },
      { label: 'In Panama, DJs rapped in Spanish', keywords: ['panama', 'panamanian'] },
      { label: 'Puerto Rico turned it into reggaeton', keywords: ['puerto ric', 'san juan'] },
      { label: 'A drum machine plays the beat', keywords: ['drum machine', 'step grid', 'machine', 'synth'] },
    ],
  },
  {
    id: 'mbira-story',
    lesson: 'mbira',
    title: 'Metal Tines and Ancestors',
    text: 'Among the Shona of Zimbabwe, the mbira dzavadzimu is played at bira ceremonies, often through the night, so that ancestors can be addressed through the music. It has metal tines of different lengths fixed to a hardwood board, and bottle caps or shells buzz on the frame, a texture that belongs in the sound. The thumbs play the front row and the right index finger strokes the lower row. The two hands play separate interlocking parts over a twelve pulse cycle, and the hosho gourd rattle keeps the pulse steady. Because the pattern repeats and overlaps, the music can go on for hours. Thomas Mapfumo moved mbira lines onto electric guitars and sang in Shona, creating chimurenga music.',
    ideas: [
      { label: 'Played at bira ceremonies to address ancestors', keywords: ['bira', 'ceremon', 'ancestor'] },
      { label: 'Metal tines on a board, with a buzz', keywords: ['tine', 'hardwood board', 'wooden board', 'bottle cap', 'buzz'] },
      { label: 'Two hands interlock over twelve pulses', keywords: ['interlock', 'twelve pulse', '12 pulse', 'two hands', 'both hands'] },
      { label: 'The hosho rattle keeps the pulse', keywords: ['hosho', 'rattle', 'gourd'] },
      { label: 'Thomas Mapfumo put mbira on guitar', keywords: ['mapfumo', 'chimurenga', 'electric guitar', 'on guitar', 'onto guitar'] },
    ],
  },
  {
    id: 'afrobeat-story',
    lesson: 'afrobeat',
    title: 'Groove as an Argument',
    text: "In 1970s Lagos, Fela Kuti and his band Africa 70 played all night sets at the Afrika Shrine. Songs ran long on purpose: the groove hypnotized the room, and then the lyrics landed. In Afrobeat each instrument repeats a short phrase, and change comes from layers entering and leaving rather than from a chorus. Fela's bands often had two guitarists playing different repeating figures, while trumpets, saxophones and trombone punched in short riffs like a chorus of voices. Born in Abeokuta, Fela studied music in London and led a highlife band before a 1969 tour of the United States changed his direction. Afrobeat kept highlife's interlocking guitars and took its horn riffs and improvisation from jazz.",
    ideas: [
      { label: 'All night sets at the Afrika Shrine in Lagos', keywords: ['shrine', 'all night', 'lagos'] },
      { label: 'Long songs: the groove first, then the lyrics', keywords: ['hypnot', 'long song', 'ran long', 'songs long', 'twenty minute'] },
      { label: 'Change comes from layers, not a chorus', keywords: [' layer', 'no chorus', 'not a chorus', 'instead of a chorus', 'entering and leaving'] },
      { label: 'Horns answer with short riffs', keywords: ['horn', 'saxophone', 'trumpet', 'riff'] },
      { label: 'Built from highlife and jazz', keywords: ['highlife', 'jazz'] },
    ],
  },
  {
    id: 'gamelan-story',
    lesson: 'gamelan',
    title: 'One Melody, Many Hands',
    text: "In Java and Bali, Indonesia, a gamelan is an ensemble of bronze instruments made and tuned as a set, so every ensemble has its own tuning. No single player holds the tune. Players sit facing each other and divide the melody between them: one takes every other note and a neighbour takes the rest. The saron, a row of bronze bars struck with a mallet, usually plays the core melody, and the player damps each note with the other hand. The big gong marks the end of each cycle, and everything else fits inside that frame. Javanese gamelan is often slow and meditative, Balinese gamelan fast and explosive. In Bali, village associations called sekaha own and play their own sets.",
    ideas: [
      { label: 'The instruments are tuned as a set', keywords: ['tuned', 'tuning', 'as a set'] },
      { label: 'The melody is split between players', keywords: ['split', 'divide', 'every other note', 'interlock', 'share'] },
      { label: 'The saron plays the core melody', keywords: ['saron', 'core melody', 'mallet', 'bronze bar'] },
      { label: 'The big gong marks each cycle', keywords: ['gong', 'end of each cycle', 'end of a cycle'] },
      { label: 'Java and Bali have two styles', keywords: ['java', 'bali', 'sekaha', 'village'] },
    ],
  },
  {
    id: 'taiko-story',
    lesson: 'taiko',
    title: 'Drums in a Group',
    text: "Taiko were once heard in temples and festivals in Japan. In 1951 the jazz drummer Daihachi Oguchi arranged the festival rhythms of Suwa for a group of drums, and kumi-daiko, group drumming, was born. In kumi-daiko one drum strikes and another answers, so the group moves as one body. The odaiko, the biggest drum, rests on a stand, and the player uses the whole body, striking near the rim for a sharp sound and in the middle for a deep one. Drummers shout kakegoe to keep the energy up, and those shouts are part of the music. In 1971 young players moved to Sado Island to found the group that became Kodo, whose members live and train together.",
    ideas: [
      { label: 'Daihachi Oguchi arranged festival rhythms in 1951', keywords: ['oguchi', '1951', 'suwa', 'festival'] },
      { label: 'In a group, drums answer drums', keywords: ['kumi-daiko', 'kumi daiko', 'group drumming', 'group of drums', 'answer', 'ensemble', 'one body'] },
      { label: 'The odaiko is played with the whole body', keywords: ['odaiko', 'big drum', 'biggest drum', 'whole body', 'near the rim'] },
      { label: 'Kakegoe shouts are part of the music', keywords: ['kakegoe', 'shout'] },
      { label: 'Kodo lives and trains on Sado Island', keywords: ['kodo', 'sado'] },
    ],
  },
  {
    id: 'gnawa-story',
    lesson: 'gnawa',
    title: 'The Lila All Night Long',
    text: 'Gnawa traditions were carried north from West Africa to Morocco by enslaved West Africans and their descendants, and gnawa communities and brotherhoods kept them in families and ceremonies. The lila is a gnawa ceremony that goes through the night: a sequence of songs, each with its own rhythm and colour, led by a maalem playing the guembri. The music aims to heal and to bring people together. The guembri is a bass lute carved from a log with a skin soundboard, and slapping the low string makes it a bass line and a drum at once. The qraqeb, iron castanets, clatter out the pulse. Today Essaouira hosts a festival that draws gnawa musicians from all over Morocco.',
    ideas: [
      { label: 'Its roots were carried north from West Africa', keywords: ['west africa', 'sahara', 'enslaved'] },
      { label: 'The lila runs all night', keywords: ['lila', 'all night', 'through the night', 'ceremon'] },
      { label: 'A maalem leads on the guembri', keywords: ['maalem', 'guembri', 'master'] },
      { label: 'Qraqeb, iron castanets, mark the pulse', keywords: ['qraqeb', 'castanet', 'iron'] },
      { label: 'The music aims to heal and bring people together', keywords: ['heal', 'people together', 'bring together'] },
    ],
  },
  {
    id: 'oud-story',
    lesson: 'oud-maqam',
    title: 'Notes Between the Notes',
    text: 'Arabic maqam uses intervals smaller than the half steps of Western scales, often a note halfway between a natural and a flat. That small distance is a signature of many maqamat. The oud is a pear shaped lute with eleven or thirteen strings in courses, and its short neck has no frets, so the player slides to the notes between notes and finds each one by ear. In 9th century Baghdad, court musicians and theorists wrote about modes and frets, and the tradition spread to Cairo, Istanbul and Iberia. Umm Kulthum, the Voice of Egypt, sang on the first Thursday of every month for decades, and her long performances were built for tarab, the state of being moved by music.',
    ideas: [
      { label: 'Maqam uses notes between the notes', keywords: ['between the notes', 'half flat', 'quarter', 'microton', 'smaller than'] },
      { label: 'The oud has no frets', keywords: ['fretless', 'no frets', 'without frets'] },
      { label: 'The player finds each note by ear', keywords: ['by ear', 'slide', 'sliding'] },
      { label: 'It spread from Baghdad to Cairo, Istanbul and Iberia', keywords: ['baghdad', 'cairo', 'istanbul', 'iberia', 'spain', 'córdoba', 'cordoba'] },
      { label: 'Umm Kulthum sang for tarab', keywords: ['umm kulthum', 'kulthum', 'tarab'] },
    ],
  },
  {
    id: 'flamenco-story',
    lesson: 'flamenco',
    title: 'Twelve Beats that Turn Corners',
    text: 'Flamenco grew in Andalusia, in southern Spain, in the cities of Seville, Jerez and Cádiz, shaped by Romani (Gitano) families who made the form their own. It keeps a cycle of twelve beats, the compás, with accents on 3, 6, 8, 10 and 12. The cycle is even but the accents are not, so the music feels like it is turning a corner. Palmas, handclaps, are treated as an instrument, not as applause. The flamenco guitar is lighter and more percussive than a classical guitar: the right hand plays fast rolls called rasgueado and taps the soundboard, while the left hand holds chords and quick runs. UNESCO added flamenco to its Intangible Cultural Heritage list in 2010.',
    ideas: [
      { label: 'Romani (Gitano) families shaped it in Andalusia', keywords: ['romani', 'gitano', 'andalusia', 'seville', 'jerez', 'cádiz', 'cadiz'] },
      { label: 'A cycle of twelve beats', keywords: ['twelve', '12 beat', '12-beat', 'compás', 'compas'] },
      { label: 'The accents fall in unexpected places', keywords: ['accent', 'uneven', 'corner', '3, 6, 8'] },
      { label: 'Palmas are an instrument', keywords: ['palmas', 'clap'] },
      { label: 'The guitar is played like a drum too', keywords: ['rasgueado', 'soundboard', 'golpe', 'percussive'] },
    ],
  },
  {
    id: 'irish-story',
    lesson: 'irish',
    title: 'The Session',
    text: "In pubs from Doolin to Dublin, Irish musicians sit in a loose circle and play sets of tunes from memory. Nobody books a session: someone starts a tune and the room joins in, and the instruments double the same melody. A jig has six eighth notes per bar, grouped three and three, which gives the lilt people dance to, while a reel runs in fours. Uilleann pipes are filled with a bellows under the elbow, so the player sits and the sound can be soft enough for a small room. The bodhrán is a goatskin frame drum played with a tipper. Michael Coleman, a fiddler from County Sligo, recorded in New York in the 1920s and 30s, and his records changed how the fiddle was played back home.",
    ideas: [
      { label: 'A session: tunes from memory, nobody books it', keywords: ['session', 'from memory', 'pubs', 'in a pub', 'joins in', 'circle'] },
      { label: 'A jig has six beats in threes', keywords: ['jig', 'six eighth', 'sixes', 'threes', 'three and three', 'lilt'] },
      { label: 'Uilleann pipes use a bellows', keywords: ['uilleann', 'bellows', 'elbow', 'pipes'] },
      { label: 'The bodhrán is a frame drum', keywords: ['bodhrán', 'bodhran', 'tipper', 'goatskin', 'frame drum'] },
      { label: "Michael Coleman's records spread his style", keywords: ['coleman', 'sligo', '78s', 'records', 'recordings'] },
    ],
  },
];

const byId = new Map(STORIES.map((s) => [s.id, s]));
export const getStory = (id: string) => byId.get(id);
