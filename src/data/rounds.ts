// "Where in the world?" rounds. Each plays its lesson's Listen First groove.
// Rio comes first (the demo script's round 1); Mali sits fourth because the
// onboarding hook already reveals it. `people` lines come from each lesson's text.

export type Round = {
  slug: string;
  tradition: string;
  place: string;
  people: string;
  // four country names, no flags; the lesson's country is the answer
  choices: [string, string, string, string];
};

export const ROUNDS: Round[] = [
  {
    slug: 'samba',
    tradition: 'Samba batucada',
    place: 'Rio de Janeiro, Brazil',
    people: "The samba schools of Rio's working-class neighborhoods, whose baterias rehearse hundreds of drummers for one parade.",
    choices: ['Cuba', 'Brazil', 'Ghana', 'Portugal'],
  },
  {
    slug: 'gamelan',
    tradition: 'Gamelan',
    place: 'Java and Bali, Indonesia',
    people: 'Ensembles in Java and Bali, where Balinese village associations called sekaha own and play their own sets.',
    choices: ['Japan', 'India', 'Indonesia', 'Thailand'],
  },
  {
    slug: 'flamenco',
    tradition: 'Flamenco',
    place: 'Andalusia, Spain',
    people: 'Romani (Gitano) families of Seville, Jerez and Cádiz, who made the form their own.',
    choices: ['Mexico', 'Morocco', 'Portugal', 'Spain'],
  },
  {
    slug: 'kora',
    tradition: 'Kora',
    place: 'Mali, Senegal and The Gambia',
    people: 'The Mande jali: hereditary musicians, historians and diplomats who carry family histories in song.',
    choices: ['Mali', 'Brazil', 'India', 'Egypt'],
  },
  {
    slug: 'raga',
    tradition: 'Hindustani raga',
    place: 'North India',
    people: 'Hindustani musicians, who learn hundreds of ragas, many of them linked to a time of day.',
    choices: ['Iran', 'Indonesia', 'India', 'Egypt'],
  },
  {
    slug: 'salsa',
    tradition: 'Salsa',
    place: 'New York City',
    people: 'Cuban and Puerto Rican musicians in Spanish Harlem and the Bronx, mixing son, mambo and jazz.',
    choices: ['Cuba', 'United States', 'Brazil', 'Spain'],
  },
  {
    slug: 'taiko',
    tradition: 'Kumi-daiko (ensemble taiko)',
    place: 'Japan',
    people: 'Taiko groups such as Kodo, whose members live and train together on Sado Island.',
    choices: ['China', 'South Korea', 'Indonesia', 'Japan'],
  },
  {
    slug: 'gnawa',
    tradition: 'Gnawa',
    place: 'Essaouira, Morocco',
    people: 'Gnawa communities and brotherhoods, led in ceremony by a maalem playing the guembri.',
    choices: ['Morocco', 'Mali', 'Egypt', 'Spain'],
  },
];
