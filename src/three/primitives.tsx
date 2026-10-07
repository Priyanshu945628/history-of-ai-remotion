import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import fontJson from '../assets/fonts/helvetiker_bold.typeface.json';
import {C, HEAD, clamp01, easeOutBack, prog, useFontsReady} from '../theme';

type V3 = [number, number, number];

/* ------------------------------------------------------------------ utils */
export const rnd = (seed: string | number) => random(seed);
export const srand = (seed: string | number, a = -1, b = 1) => a + (b - a) * random(seed);

export const fibSphere = (n: number, r = 1): V3[] => {
  const pts: V3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = g * i;
    pts.push([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r]);
  }
  return pts;
};

/** cheap smooth 3D value noise in [-1,1] */
export const noise3 = (x: number, y: number, z: number) => {
  const h = (a: number, b: number, c: number) => {
    const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  return L(
    L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
    L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
};

let _dot: THREE.Texture | null = null;
export const dotTexture = () => {
  if (_dot) return _dot;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  _dot = new THREE.CanvasTexture(c);
  return _dot;
};

let _glow: THREE.Texture | null = null;
export const glowTexture = () => {
  if (_glow) return _glow;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.15, 'rgba(255,255,255,0.55)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
};

/* ------------------------------------------------------------------ stage */
export const Stage: React.FC<{
  children: React.ReactNode;
  bg?: string;
  fog?: [number, number];
  fov?: number;
  lights?: boolean;
  keyColor?: string;
  rimColor?: string;
}> = ({children, bg = C.bg, fog = [16, 70], fov = 40, lights = true, keyColor = '#ffffff', rimColor = C.violet}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0}}
      gl={{antialias: true, preserveDrawingBuffer: true}}
      camera={{fov, near: 0.1, far: 500, position: [0, 0, 12]}}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, fog[0], fog[1]]} />
      {lights ? (
        <>
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 8, 6]} intensity={1.6} color={keyColor} />
          <directionalLight position={[-6, -2, -4]} intensity={0.9} color={rimColor} />
          <pointLight position={[0, 3, 6]} intensity={25} color={C.cyan} />
        </>
      ) : null}
      {children}
    </ThreeCanvas>
  );
};

/** Sets the camera every frame (render-time mutation keeps it deterministic in Remotion). */
export const Rig: React.FC<{pos: V3; look?: V3; fov?: number; roll?: number}> = ({pos, look = [0, 0, 0], fov, roll = 0}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(look[0], look[1], look[2]);
  if (fov && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

/** Orbit helper: position on a circle around `look`. */
export const orbit = (angle: number, radius: number, height: number, look: V3 = [0, 0, 0]): V3 => [
  look[0] + Math.sin(angle) * radius,
  look[1] + height,
  look[2] + Math.cos(angle) * radius,
];

/* ------------------------------------------------------------------ atmosphere */
export const Starfield: React.FC<{
  count?: number;
  radius?: number;
  inner?: number;
  size?: number;
  color?: string;
  seed?: string;
  opacity?: number;
  spin?: number;
}> = ({count = 1500, radius = 80, inner = 25, size = 0.25, color = '#9fb4ff', seed = 'stars', opacity = 0.9, spin = 0.0004}) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rnd(`${seed}u${i}`) * 2 - 1;
      const th = rnd(`${seed}t${i}`) * Math.PI * 2;
      const r = inner + (radius - inner) * Math.pow(rnd(`${seed}r${i}`), 0.6);
      const s = Math.sqrt(1 - u * u);
      p.set([Math.cos(th) * s * r, u * r, Math.sin(th) * s * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [count, radius, inner, seed]);
  return (
    <points geometry={geo} rotation={[0, f * spin, 0]}>
      <pointsMaterial
        size={size}
        color={color}
        map={dotTexture()}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

/** Drifting dust particles in a box, for depth and parallax. */
export const Dust: React.FC<{count?: number; spread?: V3; color?: string; size?: number; seed?: string; speed?: number; opacity?: number}> = ({
  count = 400,
  spread = [30, 16, 30],
  color = C.cyan,
  size = 0.06,
  seed = 'dust',
  speed = 0.01,
  opacity = 0.6,
}) => {
  const f = useCurrentFrame();
  const base = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = srand(`${seed}x${i}`) * spread[0] * 0.5;
      p[i * 3 + 1] = srand(`${seed}y${i}`) * spread[1] * 0.5;
      p[i * 3 + 2] = srand(`${seed}z${i}`) * spread[2] * 0.5;
    }
    return p;
  }, [count, seed, spread[0], spread[1], spread[2]]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(base), 3));
    return g;
  }, [base]);
  const arr = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const y = base[i * 3 + 1] + f * speed * (0.5 + rnd(`${seed}s${i}`));
    const h = spread[1];
    arr[i * 3 + 1] = ((((y + h / 2) % h) + h) % h) - h / 2;
    arr[i * 3] = base[i * 3] + Math.sin(f * 0.01 + i) * 0.2;
  }
  geo.attributes.position.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial size={size} color={color} map={dotTexture()} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export const Glow: React.FC<{color?: string; scale?: number; opacity?: number; position?: V3}> = ({
  color = C.cyan,
  scale = 3,
  opacity = 1,
  position = [0, 0, 0],
}) => (
  <sprite position={position} scale={[scale, scale, 1]}>
    <spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
  </sprite>
);

/** Flat XZ grid of lines (tron floor). */
export const Grid: React.FC<{size?: number; div?: number; color?: string; opacity?: number; y?: number; z?: number}> = ({
  size = 60,
  div = 60,
  color = C.blue,
  opacity = 0.25,
  y = -3,
  z = 0,
}) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const h = size / 2;
    for (let i = 0; i <= div; i++) {
      const v = -h + (size / div) * i;
      pts.push(-h, 0, v, h, 0, v, v, 0, -h, v, 0, h);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [size, div]);
  return (
    <lineSegments geometry={geo} position={[0, y, z]}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

/* ------------------------------------------------------------------ lines & tubes */
export const Segments: React.FC<{points: number[]; color?: string; opacity?: number; additive?: boolean}> = ({
  points,
  color = C.cyan,
  opacity = 0.5,
  additive = true,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, [points]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </lineSegments>
  );
};

export const Tube: React.FC<{
  curve: THREE.Curve<THREE.Vector3>;
  radius?: number;
  color?: string;
  opacity?: number;
  progress?: number;
  segments?: number;
  emissive?: boolean;
}> = ({curve, radius = 0.03, color = C.cyan, opacity = 1, progress = 1, segments = 64, emissive = true}) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, segments, radius, 6, false), [curve, radius, segments]);
  const count = geo.index ? geo.index.count : 0;
  const p = clamp01(progress);
  geo.setDrawRange(0, Math.floor((count * p) / 36) * 36);
  if (p <= 0) return null;
  return (
    <mesh geometry={geo}>
      {emissive ? (
        <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      )}
    </mesh>
  );
};

export const arc = (a: V3, b: V3, lift = 2): THREE.QuadraticBezierCurve3 => {
  const m = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift, (a[2] + b[2]) / 2);
  return new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), m, new THREE.Vector3(...b));
};

/* ------------------------------------------------------------------ extruded 3D text */
const FONT = new FontLoader().parse(fontJson as any);
const glyphCache = new Map<string, THREE.BufferGeometry>();
const glyph = (ch: string, size: number, depth: number, bevel: number) => {
  const key = `${ch}|${size}|${depth}|${bevel}`;
  let g = glyphCache.get(key);
  if (!g) {
    g = new TextGeometry(ch, {
      font: FONT,
      size,
      depth,
      curveSegments: 6,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 0.6,
      bevelSegments: 2,
    });
    g.computeBoundingBox();
    glyphCache.set(key, g);
  }
  return g;
};
const advance = (ch: string, size: number) => {
  const d = (FONT as any).data;
  const gl = d.glyphs[ch] || d.glyphs['?'];
  return (gl.ha * size) / d.resolution;
};

export type TextAnim = 'drop' | 'fly' | 'scatter' | 'scale' | 'rise' | 'none';

export const Text3D: React.FC<{
  text: string;
  size?: number;
  depth?: number;
  bevel?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  side?: string;
  position?: V3;
  rotation?: V3;
  start?: number;
  stagger?: number;
  dur?: number;
  anim?: TextAnim;
  exitAt?: number;
  exitDur?: number;
  lineHeight?: number;
  tracking?: number;
  seed?: string;
  opacity?: number;
}> = ({
  text,
  size = 1,
  depth = 0.3,
  bevel = 0.03,
  color = '#ffffff',
  emissive = C.cyan,
  emissiveIntensity = 0.35,
  side = '#1b2440',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  start = 0,
  stagger = 2,
  dur = 22,
  anim = 'drop',
  exitAt,
  exitDur = 15,
  lineHeight = 1.25,
  tracking = 0.04,
  seed = 'txt',
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  const rows = text.split('\n');
  const letters = useMemo(() => {
    const out: {ch: string; x: number; y: number; i: number}[] = [];
    let idx = 0;
    rows.forEach((row, r) => {
      const w = [...row].reduce((s, ch) => s + advance(ch, size) + size * tracking, 0) - size * tracking;
      let x = -w / 2;
      [...row].forEach((ch) => {
        if (ch !== ' ') out.push({ch, x, y: -r * size * lineHeight + ((rows.length - 1) * size * lineHeight) / 2 - size * 0.36, i: idx++});
        x += advance(ch, size) + size * tracking;
      });
    });
    return out;
  }, [text, size, tracking, lineHeight]);
  const mats = useMemo(
    () =>
      letters.map(() => [
        new THREE.MeshStandardMaterial({color, emissive, emissiveIntensity, metalness: 0.25, roughness: 0.35, transparent: true}),
        new THREE.MeshStandardMaterial({color: side, emissive, emissiveIntensity: emissiveIntensity * 0.35, metalness: 0.6, roughness: 0.3, transparent: true}),
      ]),
    [letters, color, emissive, emissiveIntensity, side],
  );
  const exit = exitAt === undefined ? 0 : prog(f, exitAt, exitDur);
  return (
    <group position={position} rotation={rotation}>
      {letters.map((L, k) => {
        const p = anim === 'none' ? 1 : prog(f, start + L.i * stagger, dur, (t) => t);
        const pe = anim === 'scale' || anim === 'drop' ? easeOutBack(p) : 1 - Math.pow(1 - p, 3);
        let x = L.x, y = L.y, z = 0, rx = 0, ry = 0, s = 1;
        if (anim === 'drop') {
          y += (1 - pe) * size * 1.6;
          rx = (1 - pe) * -1.4;
        } else if (anim === 'rise') {
          y -= (1 - pe) * size * 1.2;
          rx = (1 - pe) * 1.2;
        } else if (anim === 'fly') {
          z -= (1 - pe) * 25;
        } else if (anim === 'scatter') {
          x += (1 - pe) * srand(`${seed}x${k}`) * 12;
          y += (1 - pe) * srand(`${seed}y${k}`) * 7;
          z += (1 - pe) * srand(`${seed}z${k}`, -18, 6);
          rx = (1 - pe) * srand(`${seed}a${k}`) * 4;
          ry = (1 - pe) * srand(`${seed}b${k}`) * 4;
        } else if (anim === 'scale') {
          s = Math.max(0.001, pe);
        }
        // exit: letters fall back into depth
        z -= exit * 8 * (0.5 + rnd(`${seed}e${k}`));
        y += exit * srand(`${seed}ey${k}`) * 2;
        const o = clamp01(p * 1.6) * (1 - exit) * opacity;
        mats[k][0].opacity = o;
        mats[k][1].opacity = o;
        mats[k][0].visible = o > 0.005;
        mats[k][1].visible = o > 0.005;
        return <mesh key={k} geometry={glyph(L.ch, size, depth, bevel)} material={mats[k]} position={[x, y, z]} rotation={[rx, ry, 0]} scale={s} />;
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ canvas-texture planes */
type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Plane with a custom 2D-canvas drawing as texture (documents, UI cards, icons). */
export const CanvasPlane: React.FC<{
  id: string;
  draw: DrawFn;
  px?: [number, number];
  width?: number;
  position?: V3;
  rotation?: V3;
  opacity?: number;
  additive?: boolean;
  scale?: number;
  doubleSide?: boolean;
}> = ({id, draw, px = [1024, 640], width = 4, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1, additive = false, scale = 1, doubleSide = true}) => {
  const ready = useFontsReady();
  const tex = useMemo(() => {
    if (!ready) return null;
    const c = document.createElement('canvas');
    c.width = px[0];
    c.height = px[1];
    draw(c.getContext('2d')!, px[0], px[1]);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id, px[0], px[1]]);
  if (!tex || opacity <= 0.003) return null;
  const h = (width * px[1]) / px[0];
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[width, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
        side={doubleSide ? THREE.DoubleSide : THREE.FrontSide}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
};

export const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

/** Text label rendered to a texture. `size` = world height of one text line. */
export const Label: React.FC<{
  text: string;
  size?: number;
  color?: string;
  font?: string;
  weight?: number;
  bg?: string;
  border?: string;
  position?: V3;
  rotation?: V3;
  opacity?: number;
  align?: 'center' | 'left' | 'right';
  tracking?: number;
  scale?: number;
  glow?: boolean;
}> = ({
  text,
  size = 0.4,
  color = C.white,
  font = HEAD,
  weight = 700,
  bg,
  border,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  opacity = 1,
  align = 'center',
  tracking = 0.04,
  scale = 1,
  glow = false,
}) => {
  const ready = useFontsReady();
  const data = useMemo(() => {
    if (!ready) return null;
    const fp = 96;
    const rows = text.split('\n');
    const c = document.createElement('canvas');
    const g = c.getContext('2d')!;
    const fontStr = `${weight} ${fp}px "${font}", "Segoe UI", Arial, sans-serif`;
    g.font = fontStr;
    (g as any).letterSpacing = `${tracking * fp}px`;
    const tw = Math.max(...rows.map((r) => g.measureText(r).width));
    const pad = bg || border ? fp * 0.55 : fp * 0.2;
    const lh = fp * 1.25;
    c.width = Math.ceil(tw + pad * 2);
    c.height = Math.ceil(lh * rows.length + pad * 2 - fp * 0.25);
    g.font = fontStr;
    (g as any).letterSpacing = `${tracking * fp}px`;
    if (bg || border) {
      roundRect(g, 3, 3, c.width - 6, c.height - 6, fp * 0.3);
      if (bg) {
        g.fillStyle = bg;
        g.fill();
      }
      if (border) {
        g.lineWidth = 5;
        g.strokeStyle = border;
        g.stroke();
      }
    }
    g.fillStyle = color;
    g.textBaseline = 'top';
    g.textAlign = align;
    if (glow) {
      g.shadowColor = color;
      g.shadowBlur = fp * 0.3;
    }
    const ax = align === 'center' ? c.width / 2 : align === 'left' ? pad : c.width - pad;
    rows.forEach((r, k) => g.fillText(r, ax, pad + k * lh));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return {t, w: c.width, h: c.height, fp};
  }, [ready, text, color, font, weight, bg, border, align, tracking, glow]);
  if (!data || opacity <= 0.003) return null;
  const worldH = (size * data.h) / data.fp;
  const worldW = (worldH * data.w) / data.h;
  const ox = align === 'left' ? worldW / 2 : align === 'right' ? -worldW / 2 : 0;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[ox, 0, 0]}>
        <planeGeometry args={[worldW, worldH]} />
        <meshBasicMaterial map={data.t} transparent opacity={opacity} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ instancing */
/**
 * Instanced mesh whose per-instance transform/color is computed every frame by `update`.
 */
export const useInstanced = (geometry: THREE.BufferGeometry, material: THREE.Material, count: number) =>
  useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, count);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    return m;
  }, [geometry, material, count]);

export const tmpObj = new THREE.Object3D();
export const tmpCol = new THREE.Color();

export {THREE};
export type {V3};
