import data from './data/timeline.json';

export type Word = {w: string; f: number};
export type Line = {
  i: number;
  chapter: string;
  shot: string;
  text: string;
  k: string;
  p: 'bottom' | 'center' | 'top';
  file: string;
  startFrame: number;
  durFrames: number;
  slotFrames: number;
  words: Word[];
};
export type Shot = {
  shot: string;
  chapter: string;
  lines: number[];
  startFrame: number;
  endFrame: number;
  durFrames: number;
};
export type Chapter = {
  id: string;
  label: string;
  title: string;
  startFrame: number;
  endFrame: number;
};
export type Timeline = {
  fps: number;
  totalFrames: number;
  chapters: Chapter[];
  shots: Shot[];
  lines: Line[];
};

export const timeline = data as Timeline;

/** A line as seen from inside a shot: frames are relative to the shot start. */
export type ShotLine = Line & {rel: number};

export type ShotProps = {
  dur: number;
  lines: ShotLine[];
};

/** Relative frame (inside the line) at which a word matching `re` is spoken, or fallback. */
export const wordFrame = (line: ShotLine | undefined, re: RegExp, fallback = 0): number => {
  if (!line) return fallback;
  const w = line.words.find((x) => re.test(x.w));
  return w ? line.rel + w.f : line.rel + fallback;
};

/** Index of the active line within a shot for a relative frame. */
export const activeLine = (lines: ShotLine[], frame: number): number => {
  let idx = 0;
  for (let k = 0; k < lines.length; k++) if (frame >= lines[k].rel) idx = k;
  return idx;
};
