// Three cards per lesson for spaced review. Backs come from the lesson text.
import type { Flashcard } from './types';

const cards = (lesson: string, list: [string, string][]): Flashcard[] =>
  list.map(([front, back], i) => ({ id: `${lesson}-${i + 1}`, lesson, front, back }));

export const FLASHCARDS: Flashcard[] = [
  ...cards('jazz', [
    ['Congo Square', 'A square in New Orleans where, from the 1790s into the 1800s, enslaved and free Black people gathered on Sundays to drum, dance and trade.'],
    ['Ragtime', 'The piano music that came just before jazz. The left hand holds the beat while the right hand pushes against it.'],
    ['What did Louis Armstrong show the world?', 'That a soloist could invent the melody. His 1920s Hot Five and Hot Seven recordings treated improvisation as composition.'],
  ]),
  ...cards('salsa', [
    ['Clave', 'Two wooden sticks playing a five stroke pattern. Every other part of the groove lines up with it.'],
    ['Montuno', 'The salsa piano part: a short repeating figure.'],
    ['Where was salsa made?', 'In Spanish Harlem and the Bronx in the 1960s, where Cuban and Puerto Rican musicians mixed son, mambo and jazz.'],
  ]),
  ...cards('tango', [
    ['Bandoneón', 'A German button accordion that arrived with sailors and migrants. Tango players in Buenos Aires made it the voice of the music.'],
    ['Río de la Plata', 'The river with Buenos Aires on one side and Montevideo on the other. Tango grew in both cities at the same time.'],
    ['What met in the port neighborhoods where tango grew?', 'Afro-Argentine candombe drumming, Spanish and Italian songs, and the Cuban habanera.'],
  ]),
  ...cards('samba', [
    ['Bateria', "A samba school's drum section. Each school rehearses hundreds of drummers to drive one parade."],
    ['Cuíca', 'A friction drum. A thin stick is rubbed inside while the other hand presses the skin, bending the pitch like a voice.'],
    ['Tia Ciata', 'Hilária Batista de Almeida, a Bahian woman in Rio who hosted the parties where early samba was played.'],
  ]),
  ...cards('reggaeton', [
    ['Dembow', 'The drum pattern at the heart of reggaeton. Its snare does not sit where a rock backbeat would, and that offset gives the beat its character.'],
    ['How did the dembow reach Puerto Rico?', 'Jamaican dancehall records reached Panama in the 1980s, where DJs rapped in Spanish. In Puerto Rico the beat met Spanish rap and became reggaeton.'],
    ['Drum machine', 'Each pad holds one drum sound, and a step grid decides when it fires. There is no drummer, so the timing is exactly as written.'],
  ]),
  ...cards('kora', [
    ['Jali', 'Hereditary musicians, historians and diplomats in Mande society, who carry family histories, praise songs and news across West Africa.'],
    ['Kumbengo and birimintingo', "Kumbengo is the kora's repeating accompaniment. Birimintingo is the improvised runs that decorate it."],
    ['How is a kora built?', 'Twenty one strings on half a calabash covered with cowhide, held in two rows by a tall notched bridge.'],
  ]),
  ...cards('highlife', [
    ['Palm wine bars', 'Where small guitar bands played along the West African coast by the 1920s. The music took the name highlife.'],
    ['How do highlife guitarists play?', 'In short repeating figures that lock in with the percussion, borrowed from local bell and drum rhythms.'],
    ['E.T. Mensah', 'The Ghanaian trumpeter and bandleader called the King of Highlife. His band the Tempos played for independence celebrations in 1957.'],
  ]),
  ...cards('afrobeat', [
    ['The Afrika Shrine', 'The venue in Lagos where Fela Kuti and his band Africa 70 played all night sets.'],
    ['How does an Afrobeat song change?', 'Each instrument repeats a short phrase. Change comes from layers entering and leaving, not from a chorus.'],
    ['Where did Afrobeat come from?', 'Fela Kuti led a highlife band and played jazz trumpet. After a 1969 tour of the United States, he built Afrobeat.'],
  ]),
  ...cards('mbira', [
    ['Mbira dzavadzimu', 'A Shona instrument of metal tines on a hardwood board, played with both thumbs and the right index finger.'],
    ['Bira', 'A Shona ceremony, often through the night, where the mbira is played so that ancestors can be addressed through the music.'],
    ['Hosho', 'A gourd rattle that holds the steady twelve pulse cycle under the two thumb parts.'],
  ]),
  ...cards('gamelan', [
    ['Saron', 'A row of bronze bars struck with a mallet. It usually plays the core melody, and the other hand damps each note.'],
    ['Why does each gamelan sound different?', 'Its bronze instruments are made and tuned as a set, so every ensemble has its own tuning.'],
    ['Sekaha', 'Village associations in Bali that own and play their own gamelan sets.'],
  ]),
  ...cards('raga', [
    ['Raga', 'A set of notes with phrases that belong to it, often linked to a mood and a time of day.'],
    ['Tanpura', 'The drone instrument. It sounds the same notes throughout, so every note of the melody is heard against it.'],
    ['Why are sitar frets movable?', 'They are tied on, so one instrument can be set up for different ragas.'],
  ]),
  ...cards('taiko', [
    ['Kumi-daiko', "Taiko played by a group of drums. Daihachi Oguchi arranged Suwa's festival rhythms this way in 1951."],
    ['Kakegoe', 'The shouts taiko drummers use to keep the energy up. They are part of the music.'],
    ['Kodo', 'A taiko group founded in 1971 whose members live and train together on Sado Island.'],
  ]),
  ...cards('yidaki', [
    ['Circular breathing', 'Breathing in through the nose while pushing air out with the cheeks, so the yidaki drone can last as long as the song needs.'],
    ['What is a yidaki made from?', 'A eucalyptus trunk that termites have already hollowed. Yolŋu makers shape, seal and often paint it.'],
    ["The yidaki's role in Yolŋu song", 'It supports the singers and does not lead. It is never a solo instrument.'],
  ]),
  ...cards('oud-maqam', [
    ['Maqam', 'An Arabic modal system that uses intervals smaller than Western half steps, often a note halfway between a natural and a flat.'],
    ['Why does the oud have no frets?', 'So the fingers can slide to the notes between notes. The player finds each pitch by ear.'],
    ['Tarab', "The state of being moved by music. Umm Kulthum's long performances were built for it."],
  ]),
  ...cards('rai', [
    ['Cheb', "The name for the young singers in Oran's 1970s and 80s nightclubs, who put raï's frank lyrics over synths and drum machines."],
    ['Gasba', 'A cane flute held across the lips and blown at an angle. It carried raï melodies before accordions and synths.'],
    ['Cheikha Rimitti', "The singer called the grandmother of raï. She sang about women's lives in blunt language and kept performing into her eighties."],
  ]),
  ...cards('gnawa', [
    ['Lila', 'A gnawa ceremony that runs through the night: a sequence of songs led by a maalem playing the guembri.'],
    ['Guembri', 'A bass lute carved from a log, with a skin soundboard. Slapping the low string makes it a bass line and a drum at once.'],
    ['Qraqeb', 'Iron castanets. Their clatter is the heartbeat of gnawa.'],
  ]),
  ...cards('flamenco', [
    ['Compás', "Flamenco's cycle of twelve beats, with accents on 3, 6, 8, 10 and 12."],
    ['Palmas', 'Handclaps. In flamenco they are treated as an instrument, not as applause.'],
    ['Rasgueado', "Fast strummed rolls played by the flamenco guitarist's right hand."],
  ]),
  ...cards('irish', [
    ['Session', 'Musicians in a loose circle, often in a pub, playing sets of tunes from memory. Someone starts a tune and the room joins in.'],
    ['Jig', 'A dance tune with six eighth notes per bar, grouped three and three.'],
    ['Bodhrán', 'A goatskin frame drum played with a small stick called a tipper.'],
  ]),
  ...cards('fado', [
    ['Mouraria and Alfama', "Lisbon's waterfront neighborhoods where fado took shape in the 1820s and 30s."],
    ['Portuguese guitar', 'A pear shaped guitar with twelve steel strings in six double courses. Each note rings twice.'],
    ['Amália Rodrigues', "The singer who took fado from Lisbon's taverns to concert halls around the world, and made the word saudade known far beyond Portugal."],
  ]),
];
