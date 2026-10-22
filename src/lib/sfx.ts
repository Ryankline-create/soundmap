import { SoundEngine } from '@/src/audio/SoundEngine';

// UI sounds, rendered by our synth into assets/sounds/ui/.
const UI = {
  stamp: 'ui/thump',
  tick: 'ui/tick',
  correct: 'ui/correct',
  wrong: 'ui/wrong',
  unlock: 'ui/unlock',
  flip: 'ui/flip',
} as const;

export const UI_SAMPLES = Object.values(UI);

export const sfx = {
  stamp: () => SoundEngine.hit(UI.stamp),
  tick: () => SoundEngine.hit(UI.tick, 0.6),
  correct: () => SoundEngine.hit(UI.correct),
  wrong: () => SoundEngine.hit(UI.wrong),
  unlock: () => SoundEngine.hit(UI.unlock),
  flip: () => SoundEngine.hit(UI.flip, 0.7),
};
