import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, HEAD, MONO, prog} from '../theme';
import type {Chapter, Line} from '../timeline';
import {timeline} from '../timeline';

/* ------------------------------------------------------------------ kinetic headline */
type Tok = {w: string; accent: boolean};
const parse = (row: string): Tok[] => {
  const out: Tok[] = [];
  row.split(/(\*[^*]+\*)/).forEach((seg) => {
    if (!seg) return;
    const accent = seg.startsWith('*') && seg.endsWith('*');
    const clean = accent ? seg.slice(1, -1) : seg;
    clean
      .split(/(\s+)/)
      .filter((x) => x.trim().length)
      .forEach((w) => out.push({w, accent}));
  });
  return out;
};

export const Kinetic: React.FC<{line: Line; accent: string}> = ({line, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = useMemo(() => line.k.split('|').map(parse), [line.k]);
  const center = line.p === 'center';
  const top = line.p === 'top';
  const size = center ? 118 : 66;
  const exitStart = Math.max(line.slotFrames - 9, 12);
  const exit = prog(f, exitStart, 9);
  const bar = spring({frame: f, fps, config: {damping: 18}});
  let wi = 0;
  return (
    <AbsoluteFill
      style={{
        justifyContent: center ? 'center' : top ? 'flex-start' : 'flex-end',
        alignItems: 'center',
        paddingBottom: center ? 0 : 118,
        paddingTop: top ? 150 : 0,
        perspective: 1100,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 26}px)`,
        filter: `blur(${exit * 8}px)`,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: center ? 6 : 2}}>
        {rows.map((row, r) => (
          <div key={r} style={{display: 'flex', gap: size * 0.28, alignItems: 'center'}}>
            {r === 0 && !center ? (
              <div style={{width: 70 * bar, height: 3, background: accent, boxShadow: `0 0 12px ${accent}`, marginRight: 10}} />
            ) : null}
            {row.map((t, k) => {
              const s = spring({frame: f - (wi++) * 3, fps, config: {damping: 13, mass: 0.6, stiffness: 140}});
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    padding: '0 4px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: HEAD,
                      fontWeight: 700,
                      fontSize: size,
                      lineHeight: 1.05,
                      letterSpacing: '0.02em',
                      color: t.accent ? accent : C.white,
                      textShadow: t.accent
                        ? `0 0 28px ${accent}aa, 0 0 2px ${accent}`
                        : '0 4px 30px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)',
                      transform: `translateY(${(1 - s) * 105}%) rotateX(${(1 - s) * -75}deg)`,
                      transformOrigin: '50% 100%',
                      opacity: Math.min(1, s * 1.4),
                    }}
                  >
                    {t.w}
                  </span>
                </span>
              );
            })}
            {r === 0 && !center ? (
              <div style={{width: 70 * bar, height: 3, background: accent, boxShadow: `0 0 12px ${accent}`, marginLeft: 10}} />
            ) : null}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ chapter card */
export const ChapterCard: React.FC<{ch: Chapter; accent: string; index: number}> = ({ch, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inS = spring({frame: f, fps, config: {damping: 20}});
  const wipe = prog(f, 4, 18);
  const out = prog(f, 95, 14);
  return (
    <AbsoluteFill style={{padding: '150px 120px', opacity: 1 - out, transform: `translateX(${-out * 40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 14, height: 14, border: `2px solid ${accent}`, transform: `rotate(${45 + inS * 180}deg)`}} />
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.45em', color: accent, opacity: inS}}>{ch.label}</div>
        <div style={{height: 2, width: 260 * wipe, background: `linear-gradient(90deg, ${accent}, transparent)`}} />
      </div>
      <div style={{overflow: 'hidden', marginTop: 12}}>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 64,
            color: C.white,
            letterSpacing: '0.01em',
            transform: `translateY(${(1 - inS) * 110}%)`,
            textShadow: '0 6px 40px rgba(0,0,0,0.8)',
            clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`,
          }}
        >
          {ch.title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ HUD */
const fmt = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  const ff = frame % fps;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
};

export const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const total = timeline.totalFrames;
  const ch = [...timeline.chapters].reverse().find((c) => f >= c.startFrame - 1) ?? timeline.chapters[0];
  const idx = timeline.chapters.indexOf(ch);
  const accent = ['#3ee6ff', '#ffb547', '#ffb547', '#3ee6ff', '#9b6bff', '#46f2a0', '#ff4fd8', '#3ee6ff', '#9b6bff', '#3ee6ff'][idx] ?? C.cyan;
  const local = f - ch.startFrame;
  const lab = interpolate(local, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(f, [10, 40], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(f, [total - 60, total - 20], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const corner = (style: React.CSSProperties) => (
    <div style={{position: 'absolute', width: 34, height: 34, borderColor: 'rgba(238,244,255,0.35)', borderStyle: 'solid', borderWidth: 0, ...style}} />
  );
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{opacity: fadeIn * fadeOut * 0.9, pointerEvents: 'none'}}>
      {corner({left: 48, top: 48, borderLeftWidth: 2, borderTopWidth: 2})}
      {corner({right: 48, top: 48, borderRightWidth: 2, borderTopWidth: 2})}
      {corner({left: 48, bottom: 48, borderLeftWidth: 2, borderBottomWidth: 2})}
      {corner({right: 48, bottom: 48, borderRightWidth: 2, borderBottomWidth: 2})}
      <div style={{position: 'absolute', left: 100, top: 70, fontFamily: MONO, fontSize: 17, letterSpacing: '0.3em', color: 'rgba(238,244,255,0.55)'}}>
        <span style={{color: accent, opacity: lab}}>{ch.label}</span>
        <span style={{margin: '0 14px', opacity: 0.5}}>/</span>
        <span style={{opacity: lab}}>{ch.title.toUpperCase()}</span>
      </div>
      <div style={{position: 'absolute', right: 100, top: 70, fontFamily: MONO, fontSize: 17, letterSpacing: '0.25em', color: 'rgba(238,244,255,0.55)', display: 'flex', gap: 18, alignItems: 'center'}}>
        <span style={{width: 9, height: 9, borderRadius: 9, background: C.red, opacity: blink ? 1 : 0.25, boxShadow: `0 0 10px ${C.red}`}} />
        <span>THE HISTORY OF AI</span>
        <span style={{color: accent}}>{fmt(f, fps)}</span>
      </div>
      {/* progress rail */}
      <div style={{position: 'absolute', left: 100, right: 100, bottom: 70, height: 2, background: 'rgba(238,244,255,0.12)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 2, width: `${(f / total) * 100}%`, background: accent, boxShadow: `0 0 10px ${accent}`}} />
        {timeline.chapters.map((c, k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: `${(c.startFrame / total) * 100}%`,
              top: -4,
              width: 2,
              height: 10,
              background: f >= c.startFrame ? accent : 'rgba(238,244,255,0.3)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: `calc(${(f / total) * 100}% - 5px)`,
            top: -4,
            width: 10,
            height: 10,
            borderRadius: 10,
            background: '#fff',
            boxShadow: `0 0 14px ${accent}`,
          }}
        />
      </div>
      <div style={{position: 'absolute', left: 100, bottom: 84, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', color: 'rgba(238,244,255,0.35)'}}>
        {String(idx).padStart(2, '0')} / {String(timeline.chapters.length - 1).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', right: 100, bottom: 84, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', color: 'rgba(238,244,255,0.35)'}}>
        {width}x1080 · 3D
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ transitions & film look */
export const Flash: React.FC<{accent: string; strong?: boolean}> = ({accent, strong}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 2, strong ? 16 : 11], [0, strong ? 0.55 : 0.32, 0], {extrapolateRight: 'clamp'});
  const streak = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const bars = strong && f < 8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, ${accent} 0%, transparent 70%)`, opacity: a, mixBlendMode: 'screen'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 2,
          transform: `scaleX(${streak}) translateY(-1px)`,
          background: `linear-gradient(90deg, transparent, ${accent}, #fff, ${accent}, transparent)`,
          opacity: 1 - streak,
          boxShadow: `0 0 30px ${accent}`,
        }}
      />
      {bars
        ? new Array(7).fill(0).map((_, k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${random(`gb${k}${f}`) * 100}%`,
                height: 4 + random(`gh${k}${f}`) * 26,
                background: k % 2 ? accent : '#ffffff',
                opacity: 0.18,
                transform: `translateX(${(random(`gx${k}${f}`) - 0.5) * 300}px)`,
                mixBlendMode: 'screen',
              }}
            />
          ))
        : null}
    </AbsoluteFill>
  );
};

let noiseUrl: string | null = null;
const getNoise = () => {
  if (noiseUrl) return noiseUrl;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(random(`n${i}`) * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  noiseUrl = c.toDataURL();
  return noiseUrl;
};

export const FilmLook: React.FC = () => {
  const f = useCurrentFrame();
  const url = useMemo(() => getNoise(), []);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)'}} />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${url})`,
          backgroundPosition: `${Math.floor(random(`gx${f}`) * 256)}px ${Math.floor(random(`gy${f}`) * 256)}px`,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};
