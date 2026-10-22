// Featured music stories, written by the SoundMap team. Evergreen topics only:
// no news, no headlines or quotes attributed to real publications.
import type { TrendingStory, TrendingTopic } from './types';

export const TOPIC_LABELS: Record<TrendingTopic, string> = {
  instruments: 'Instruments',
  rhythm: 'Rhythm',
  history: 'History',
  people: 'People',
};

// Section homepages only. Never link a made-up article.
export const FURTHER_READING = [
  { label: 'NPR Music', url: 'https://www.npr.org/music/' },
  { label: 'The Guardian: Music', url: 'https://www.theguardian.com/music' },
  { label: 'Sounds and Colours', url: 'https://soundsandcolours.com/' },
] as const;

export const TRENDING: TrendingStory[] = [
  {
    id: 'kora-21-strings',
    title: 'Why the kora has 21 strings',
    dek: 'Two rows, two hands, and a layout built for two patterns at once.',
    region: 'africa',
    topic: 'instruments',
    glyph: 'kora',
    lesson: 'kora',
    minutes: 3,
    body: [
      "Look at a kora from the side and the strings don't sit in one flat row like a harp. A tall notched bridge holds them in two rows, rising from half a calabash covered with cowhide. The player sits with the instrument upright and plucks with thumbs and index fingers only.",
      'What the number does is clearer than where it came from. Twenty one strings in two rows give each hand its own set: eleven on the left, ten on the right. The thumbs keep a repeating bass part called kumbengo while the index fingers improvise runs called birimintingo above it. One pair of hands, two independent patterns.',
      'Why exactly twenty one? One explanation you will hear is three groups of seven, for the past, the present and the future. Treat that as a story told about the instrument rather than a rule for building it. The certain part is how the strings are shared between the hands.',
      'The notes of the scale alternate between the two rows, which is why fast runs bounce from hand to hand. On a traditional kora, the player tunes by sliding leather rings along the neck, so tuning takes patience and a good ear.',
    ],
    significance:
      'The kora belongs to the jali, the hereditary musicians and historians of the Mande. It carries the praise songs and family histories they keep, so learning it has traditionally meant learning inside a family line.',
    history:
      'The jali tradition of Mali, Senegal and The Gambia reaches back to the 13th century. In 1987 Toumani Diabaté, from a long jali line, recorded the solo kora album Kaira and helped make the kora a concert instrument around the world.',
  },
  {
    id: 'dembow-route',
    title: 'How the dembow travelled from Kingston to Panama to San Juan',
    dek: 'One drum pattern, three Caribbean cities, and a beat that went global.',
    region: 'americas',
    topic: 'rhythm',
    glyph: 'drumMachine',
    lesson: 'reggaeton',
    minutes: 3,
    body: [
      "Count four beats, each split into four: one-e-and-a, two-e-and-a. In the dembow, the kick hits every number. The snare lands on the 'a' of one and the 'and' of two, then again on the 'a' of three and the 'and' of four. It never sits where a rock backbeat would, and that offset is the whole character of the beat.",
      "The name comes from Jamaica. 'Dem Bow' was a 1990 dancehall song by the DJ Shabba Ranks, and the rhythm behind it spread with dancehall records around the Caribbean.",
      'Dancehall records reached Panama in the 1980s, where DJs began rapping over them in Spanish. In 1990s San Juan, Puerto Rican DJs and rappers mixed that sound with Spanish rap on mixtapes. The scene was first called underground, and the name reggaeton came later.',
      'Put the kick on one together with the two snare hits and you get a 3-3-2 figure called the tresillo, which shaped Cuban and Caribbean music long before drum machines. The newest beat in this story has some of the deepest roots.',
    ],
    significance:
      'Reggaeton gave young people in Puerto Rico and Panama a pop sound of their own, sung in Spanish and built on a rhythm shared across the Caribbean.',
    history:
      'Jamaican dancehall records reached Panama in the 1980s. In Puerto Rico in the 1990s the beat met Spanish rap, and by the 2000s reggaeton was global pop.',
  },
  {
    id: 'teental',
    title: 'Teental: counting to sixteen',
    dek: 'The most common rhythm cycle in Hindustani music, and the one beat everyone waits for.',
    region: 'asia',
    topic: 'rhythm',
    glyph: 'tabla',
    lesson: 'raga',
    minutes: 3,
    body: [
      'In Hindustani music, rhythm runs in cycles called tala. Teental is a cycle of sixteen beats, or matras, split into four groups of four. Tabla players learn it as spoken syllables called bols: dha dhin dhin dha, dha dhin dhin dha, dha tin tin ta, ta dhin dhin dha.',
      'The first beat is sam, the strongest point in the cycle. Musicians can improvise for as long as they like, but they plan their phrases to land together on sam, and listeners often nod or clap when they do.',
      'Beat nine is khali, which means empty. In the third group the deep, ringing bass strokes drop out, so dhin becomes tin. You can hear the cycle turn: a lighter stretch, then the bass returns and leads you back to sam. People keeping teental with their hands clap on beats 1, 5 and 13 and wave on beat 9.',
      'In a raga performance the tabla often waits. The melody first sets out the raga against the drone, and only then does the cycle begin.',
    ],
    significance:
      'Teental gives soloists a shared frame to improvise against. Knowing where sam is lets musicians and listeners follow long, free sounding passages without getting lost.',
    history:
      'Hindustani raga, the tradition teental belongs to, has developed in North India since the 13th century. Ravi Shankar\'s tours and teaching brought raga and tala to audiences around the world.',
  },
  {
    id: 'qraqeb',
    title: 'Qraqeb: the iron heartbeat of gnawa',
    dek: 'Why a gnawa ceremony can keep going until morning.',
    region: 'mena',
    topic: 'instruments',
    glyph: 'qraqeb',
    lesson: 'gnawa',
    minutes: 2,
    body: [
      'At a gnawa lila, the loudest sound is often not the singing. It is the qraqeb: large iron castanets, a pair in each hand, clattered by a line of players. Their sound marks the pulse that everything else locks into.',
      'Under the qraqeb, the maalem plays the guembri, a bass lute carved from a log with a skin soundboard. The low string is slapped against the skin, so the guembri is a bass line and a drum at once. Together they can keep a short figure going for hours.',
      'The lila is a ceremony that runs through the night, a sequence of songs each with its own rhythm and colour. The repetition is the point: the music aims to heal and to bring people together.',
    ],
    significance:
      'Gnawa music is kept by families, brotherhoods and maalems who carry the songs from one generation to the next. Its home is the ceremony, not the stage.',
    history:
      'Gnawa traditions were brought to Morocco by enslaved West Africans and their descendants. Today Essaouira hosts a festival that draws gnawa musicians from all over Morocco, and UNESCO added gnawa to its Intangible Cultural Heritage list in 2019.',
  },
  {
    id: 'compas-claps',
    title: "Clapping flamenco's twelve",
    dek: 'An even cycle with uneven accents, and how to clap it yourself.',
    region: 'europe',
    topic: 'rhythm',
    glyph: 'clap',
    lesson: 'flamenco',
    minutes: 2,
    body: [
      "Flamenco's compás is a cycle of twelve beats with accents on 3, 6, 8, 10 and 12. The beats are even and the accents are not, so the music feels like it keeps turning a corner.",
      'Try it. Count from 1 to 12 out loud, clapping hard on 3, 6, 8, 10 and 12 and softly on the rest. The first half groups in threes and the second half in twos: 1-2-3, 4-5-6, 7-8, 9-10, 11-12.',
      'Those claps are called palmas, and in flamenco they are an instrument, not applause. In styles such as bulería, players often start counting from 12, so the accent that closes one cycle also opens the next.',
      "Add the cajón, then the guitar's rasgueado and the taps on its soundboard, and all three lock to the same twelve.",
    ],
    significance:
      'Flamenco was shaped by Romani (Gitano) families in Andalusia who made the form their own. The compás is shared knowledge: it is how singers, dancers and players find each other.',
    history:
      'Flamenco grew in Seville, Jerez and Cádiz from the 19th century. UNESCO added it to its Intangible Cultural Heritage list in 2010.',
  },
  {
    id: 'congo-square',
    title: 'Congo Square: where a city kept its rhythm',
    dek: 'Sunday afternoons in New Orleans, and why they still matter.',
    region: 'americas',
    topic: 'history',
    glyph: 'trumpet',
    lesson: 'jazz',
    minutes: 3,
    body: [
      'From the 1790s into the 1800s, enslaved and free Black people in New Orleans gathered in Congo Square on Sundays to drum, dance and trade. It was a rare public space for those gatherings, and the rhythms played there stayed in the city.',
      'By the early 1900s, brass bands marched for parades and funerals: the trumpet took the melody, the clarinet wove around it, and the drums kept the street moving. Ragtime piano was the popular sound of the day. Jazz grew out of that mix.',
      'Musicians carried it up the Mississippi and across the country. In the 1910s and 20s, Black musicians left the segregated South for Chicago and New York, and recordings took jazz to the world.',
      'Today the square is part of Louis Armstrong Park, named for the trumpeter who grew up in the city.',
    ],
    significance:
      'Congo Square is remembered as a place where African rooted music and dance were kept alive in public, by the people who made them.',
    history:
      'The Sunday gatherings ran from the 1790s into the 1800s. By the 1930s, the music that grew in New Orleans was a hit in Europe too.',
  },
  {
    id: 'kumi-daiko',
    title: 'From festival drums to a stage ensemble',
    dek: 'How taiko became music for a group of drums in 1951.',
    region: 'asia',
    topic: 'history',
    glyph: 'taiko',
    lesson: 'taiko',
    minutes: 2,
    body: [
      "For a long time, taiko were heard in temples and festivals. In 1951 Daihachi Oguchi, a jazz drummer, arranged the rhythms of Suwa's festival drums for a group of drums. That idea, kumi-daiko, turned taiko into an ensemble art.",
      'In kumi-daiko the drums play interlocking patterns. The big odaiko carries the pulse, the tight shime-daiko plays the pattern, and the chappa cymbals cut through. One drum strikes and another answers, so the group moves as one body.',
      'In 1971, young players moved to Sado Island to found the group that became Kodo. Its members live and train together, running for hours each day to build the stamina a concert needs.',
      'Listen for the shouts. They are called kakegoe, and they are part of the music, not noise around it.',
    ],
    significance:
      'Kumi-daiko treats the ensemble, not a soloist, as the instrument. Groups keep the drum\'s roots in festival and ceremony, even on concert stages.',
    history:
      'Kumi-daiko began in Suwa in 1951. Kodo, founded on Sado Island in 1971, took taiko from local festivals to concert stages around the world.',
  },
  {
    id: 'coleman-records',
    title: "Michael Coleman's 78s: when records taught a fiddle style",
    dek: 'A Sligo fiddler in New York, and the records that travelled home.',
    region: 'europe',
    topic: 'people',
    glyph: 'fiddle',
    lesson: 'irish',
    minutes: 2,
    body: [
      'Michael Coleman was a fiddler from County Sligo who emigrated to New York. In the 1920s and 30s he recorded 78s there, and those records travelled back across the Atlantic.',
      'His Sligo style, with its flowing ornamentation, became one of the most imitated sounds in Irish music. It spread by records rather than by teachers.',
      'That was new. Irish tunes usually moved from player to player, by memory and by ear, in sessions where someone starts a tune and the room joins in. Coleman\'s records showed that a recording could carry a style too.',
      'Sit in a session today and you hear both: tunes passed from hand to hand, and styles shaped by records.',
    ],
    significance:
      'Irish traditional music lives in sessions, where musicians play sets of tunes from memory. Records like Coleman\'s widened that circle to people who had never been in the room.',
    history:
      'Coleman lived from 1891 to 1945. His recordings, made by an emigrant in New York, changed how the fiddle was played back in Ireland.',
  },
];

const byId = new Map(TRENDING.map((s) => [s.id, s]));
export const getTrending = (id: string) => byId.get(id);
