import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CHAPTER_ACCENT, C} from './theme';
import {
  ChapterCard,
  FilmLook,
  Flash,
  HUD,
  Kinetic,
} from './overlay/Overlay';
import {ShotDispatcher} from './shots/ShotDispatcher';
import type {ShotLine} from './timeline';
import {timeline} from './timeline';

export const HistoryOfAI: React.FC = () => {
  const f = useCurrentFrame();

  // Precompute line lookup for shot lines
  const linesByShot = useMemo(() => {
    const map = new Map<number, ShotLine[]>();
    timeline.shots.forEach((s, sIdx) => {
      const list: ShotLine[] = s.lines.map((lIdx) => {
        const line = timeline.lines[lIdx];
        return {
          ...line,
          rel: line.startFrame - s.startFrame,
        };
      });
      map.set(sIdx, list);
    });
    return map;
  }, []);

  // Compute audio ducking for background score
  // If current frame is within any line's spoken window, duck music volume to 0.18, otherwise 0.38
  const isSpeaking = timeline.lines.some(
    (l) => f >= l.startFrame && f <= l.startFrame + l.durFrames
  );
  const musicVolume = isSpeaking ? 0.18 : 0.38;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* ================= AUDIO: VOICE & MUSIC ================= */}
      {/* Procedurally composed background score */}
      <Audio
        src={staticFile('audio/music.mp3')}
        volume={musicVolume}
      />

      {/* Spoken voiceover per line */}
      {timeline.lines.map((line) => (
        <Sequence
          key={`vo_${line.i}`}
          from={line.startFrame}
          durationInFrames={line.slotFrames}
        >
          <Audio src={staticFile(line.file)} volume={1.0} />
        </Sequence>
      ))}

      {/* ================= 3D VISUAL SHOTS ================= */}
      {timeline.shots.map((s, idx) => {
        const shotLines = linesByShot.get(idx) ?? [];
        const accent = CHAPTER_ACCENT[s.chapter] ?? C.cyan;
        return (
          <Sequence
            key={`shot_${idx}_${s.shot}`}
            from={s.startFrame}
            durationInFrames={s.durFrames}
          >
            <ShotDispatcher shotId={s.shot} dur={s.durFrames} lines={shotLines} />
            <Flash accent={accent} strong={idx === 0 || s.shot === 'title'} />
          </Sequence>
        );
      })}

      {/* ================= KINETIC MOTION GRAPHICS TYPOGRAPHY ================= */}
      {timeline.lines.map((line) => {
        const accent = CHAPTER_ACCENT[line.chapter] ?? C.cyan;
        return (
          <Sequence
            key={`kinetic_${line.i}`}
            from={line.startFrame}
            durationInFrames={line.slotFrames}
          >
            <Kinetic line={line} accent={accent} />
          </Sequence>
        );
      })}

      {/* ================= CHAPTER TITLE CARDS ================= */}
      {timeline.chapters.map((ch, idx) => {
        const accent = CHAPTER_ACCENT[ch.id] ?? C.cyan;
        return (
          <Sequence
            key={`chapter_${ch.id}`}
            from={ch.startFrame}
            durationInFrames={110}
          >
            <ChapterCard ch={ch} accent={accent} index={idx} />
          </Sequence>
        );
      })}

      {/* ================= GLOBAL HUD & FILM LOOK ================= */}
      <HUD />
      <FilmLook />
    </AbsoluteFill>
  );
};
