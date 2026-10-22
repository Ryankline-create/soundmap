import { useEffect, useState } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { SoundEngine } from './SoundEngine';
import type { SampleId } from './types';

type EngineState = { playing: boolean; patternId: string | null };

export function useEngineState(): EngineState {
  const [state, setState] = useState<EngineState>(() => ({
    playing: SoundEngine.isPlaying(),
    patternId: SoundEngine.current()?.id ?? null,
  }));
  useEffect(() => SoundEngine.onState(setState), []);
  return state;
}

// current step of the playing pattern (or of patternId only), -1 when stopped
export function useStep(patternId?: string): number {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    const offStep = SoundEngine.onStep((e) => {
      if (!patternId || e.patternId === patternId) setStep(e.step);
    });
    const offState = SoundEngine.onState((s) => {
      if (!s.playing || (patternId && s.patternId !== patternId)) setStep(-1);
    });
    return () => {
      offStep();
      offState();
    };
  }, [patternId]);
  return step;
}

// +1 on every step of the playing pattern (or of patternId only). Drive
// step-synced animations from this with useAnimatedReaction.
export function useStepSV(patternId?: string): SharedValue<number> {
  const step = useSharedValue(0);
  useEffect(
    () =>
      SoundEngine.onStep((e) => {
        if (patternId && e.patternId !== patternId) return;
        step.value = step.value + 1;
      }),
    [patternId, step],
  );
  return step;
}

// +1 on every beat (a quarter of a bar): the listening dial's rings pulse on this
export function useBeatSV(patternId?: string): SharedValue<number> {
  const beat = useSharedValue(0);
  useEffect(
    () =>
      SoundEngine.onStep((e) => {
        if (patternId && e.patternId !== patternId) return;
        const pattern = SoundEngine.current();
        const perBeat = pattern ? pattern.steps / 4 : 4;
        if (e.step % perBeat === 0) beat.value = beat.value + 1;
      }),
    [patternId, beat],
  );
  return beat;
}

// keeps samples loaded while the component is mounted; true once they can play
export function usePreload(ids: SampleId[]): boolean {
  const [ready, setReady] = useState(false);
  const key = ids.join('|');
  useEffect(() => {
    let alive = true;
    const list = key ? key.split('|') : [];
    setReady(false);
    SoundEngine.preload(list).then(() => alive && setReady(true));
    return () => {
      alive = false;
      SoundEngine.release(list);
    };
  }, [key]);
  return ready;
}
