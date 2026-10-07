import {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate} from 'remotion';
export {interpolate};
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const grotesk = loadGrotesk('normal', {weights: ['400', '500', '700'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']});

export const HEAD = grotesk.fontFamily;
export const MONO = mono.fontFamily;

const fontsPromise = Promise.all([grotesk.waitUntilDone(), mono.waitUntilDone()]).catch(() => undefined);
let fontsLoaded = false;
fontsPromise.then(() => {
  fontsLoaded = true;
});

/** Canvas textures must be drawn after web fonts load; this gates them (and holds the render). */
export const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(fontsLoaded);
  const [handle] = useState(() => (fontsLoaded ? null : delayRender('Loading fonts for canvas textures')));
  useEffect(() => {
    if (!ready) fontsPromise.then(() => setReady(true));
  }, [ready]);
  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

export const C = {
  bg: '#04050b',
  bg2: '#0a0d1c',
  cyan: '#3ee6ff',
  blue: '#3d7bff',
  violet: '#9b6bff',
  magenta: '#ff4fd8',
  amber: '#ffb547',
  red: '#ff4d5e',
  green: '#46f2a0',
  white: '#eef4ff',
  grey: '#7d8aa8',
  dim: '#2a3350',
};

export const CHAPTER_ACCENT: Record<string, string> = {
  hook: C.cyan,
  idea: C.amber,
  birth: C.amber,
  ml: C.cyan,
  nn: C.violet,
  dl: C.green,
  tf: C.magenta,
  chat: C.cyan,
  why: C.violet,
  end: C.cyan,
};

/** Clamped 0..1 progress between two frames with easing. */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  ease: (t: number) => number = Easing.bezier(0.33, 0, 0.2, 1),
) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutBack = Easing.out(Easing.back(1.6));
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
