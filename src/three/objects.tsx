import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {C, HEAD, MONO, clamp01} from '../theme';
import {CanvasPlane, Glow, Label, THREE, V3, dotTexture, fibSphere, noise3, rnd, roundRect, srand, tmpCol, tmpObj, useInstanced} from './primitives';

/* ================================================================== AI CORE */
export const AICore: React.FC<{scale?: number; intensity?: number; color?: string; color2?: string; position?: V3}> = ({
  scale = 1,
  intensity = 1,
  color = C.cyan,
  color2 = C.violet,
  position = [0, 0, 0],
}) => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f * 0.12) * 0.04;
  const ringPts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts = fibSphere(500, 2.6).flat();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <group position={position} scale={scale * pulse}>
      <mesh rotation={[f * 0.008, f * 0.011, 0]}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55 * intensity} toneMapped={false} />
      </mesh>
      <mesh rotation={[-f * 0.006, f * 0.009, f * 0.003]}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#081428" emissive={color2} emissiveIntensity={0.5 * intensity} flatShading metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <Glow color={color} scale={5.5 * intensity} opacity={0.9} />
      <Glow color={color2} scale={9 * intensity} opacity={0.35} />
      {[0, 1, 2].map((k) => (
        <mesh key={k} rotation={[Math.PI / 2 + k * 0.7 + f * 0.004 * (k + 1), k * 1.1, f * 0.01 * (k % 2 ? 1 : -1)]}>
          <torusGeometry args={[2.2 + k * 0.35, 0.012, 8, 160]} />
          <meshBasicMaterial color={k === 1 ? color2 : color} transparent opacity={0.8 * intensity} toneMapped={false} />
        </mesh>
      ))}
      <points geometry={ringPts} rotation={[0, -f * 0.004, 0]}>
        <pointsMaterial size={0.06} color={color} map={dotTexture()} transparent opacity={0.7 * intensity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

/* ================================================================== NEURAL NET */
export type NetLayout = {nodes: V3[]; layerOf: number[]; edges: [number, number][]; layers: number[]};

export const netLayout = (layers: number[], spacing = 2.2, ringScale = 0.42): NetLayout => {
  const nodes: V3[] = [];
  const layerOf: number[] = [];
  const idx: number[][] = [];
  layers.forEach((m, i) => {
    const x = (i - (layers.length - 1) / 2) * spacing;
    idx.push([]);
    for (let j = 0; j < m; j++) {
      let y = 0, z = 0;
      if (m <= 3) {
        y = (j - (m - 1) / 2) * 1.1;
      } else {
        const r = ringScale * Math.pow(m, 0.85);
        const a = (j / m) * Math.PI * 2 + i * 0.4;
        y = Math.cos(a) * r;
        z = Math.sin(a) * r;
      }
      idx[i].push(nodes.length);
      nodes.push([x, y, z]);
      layerOf.push(i);
    }
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < layers.length - 1; i++) for (const a of idx[i]) for (const b of idx[i + 1]) edges.push([a, b]);
  return {nodes, layerOf, edges, layers};
};

/**
 * Animated neural network. `wave` is the activation front position measured in layers
 * (e.g. 0 = input layer lit, 2.5 = signal between layer 2 and 3). `jitter` recolors weights.
 */
export const NeuralNet: React.FC<{
  layout: NetLayout;
  wave?: number;
  jitter?: number;
  color?: string;
  color2?: string;
  reveal?: number;
  edgeOpacity?: number;
  nodeScale?: number;
  baseGlow?: number;
  errorTint?: number;
}> = ({layout, wave = -5, jitter = 0, color = C.cyan, color2 = C.magenta, reveal = 1, edgeOpacity = 0.35, nodeScale = 1, baseGlow = 0.25, errorTint = 0}) => {
  const f = useCurrentFrame();
  const nL = layout.layers.length;
  const sphere = useMemo(() => new THREE.SphereGeometry(0.16, 20, 20), []);
  const nodeMat = useMemo(() => new THREE.MeshBasicMaterial({toneMapped: false}), []);
  const nodes = useInstanced(sphere, nodeMat, layout.nodes.length);
  const cA = useMemo(() => new THREE.Color(color), [color]);
  const cB = useMemo(() => new THREE.Color(color2), [color2]);
  const cR = useMemo(() => new THREE.Color(C.red), []);
  const dimC = useMemo(() => new THREE.Color('#1c2a4a'), []);
  layout.nodes.forEach((p, i) => {
    const li = layout.layerOf[i];
    const vis = clamp01(reveal * nL - li);
    const act = Math.exp(-Math.pow(li - wave, 2) / 0.35);
    tmpObj.position.set(p[0], p[1], p[2]);
    tmpObj.scale.setScalar(Math.max(0.0001, vis * nodeScale * (1 + act * 0.7)));
    tmpObj.updateMatrix();
    nodes.setMatrixAt(i, tmpObj.matrix);
    tmpCol.copy(dimC).lerp(cA, clamp01(baseGlow + act));
    if (errorTint > 0) tmpCol.lerp(cR, errorTint * (0.5 + 0.5 * Math.sin(i * 3.1 + f * 0.3)));
    if (act > 0.5) tmpCol.lerp(new THREE.Color('#ffffff'), (act - 0.5) * 1.2);
    nodes.setColorAt(i, tmpCol);
  });
  nodes.instanceMatrix.needsUpdate = true;
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;

  const eGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(layout.edges.length * 6);
    layout.edges.forEach(([a, b], k) => pos.set([...layout.nodes[a], ...layout.nodes[b]], k * 6));
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(layout.edges.length * 6), 3));
    return g;
  }, [layout]);
  const col = eGeo.attributes.color.array as Float32Array;
  const pGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(layout.edges.length * 3), 3));
    return g;
  }, [layout]);
  const pp = pGeo.attributes.position.array as Float32Array;
  layout.edges.forEach(([a, b], k) => {
    const li = layout.layerOf[a];
    const vis = clamp01(reveal * nL - li - 1);
    const act = Math.exp(-Math.pow(li + 0.5 - wave, 2) / 0.3);
    const j = jitter > 0 ? 0.5 + 0.5 * noise3(k * 0.37, f * 0.08 * jitter, 0) : 0;
    tmpCol.copy(cA).lerp(cB, j * clamp01(jitter));
    if (errorTint > 0) tmpCol.lerp(cR, errorTint * 0.6);
    const s = vis * (edgeOpacity + act * 0.9);
    for (let v = 0; v < 2; v++) {
      col[k * 6 + v * 3] = tmpCol.r * s;
      col[k * 6 + v * 3 + 1] = tmpCol.g * s;
      col[k * 6 + v * 3 + 2] = tmpCol.b * s;
    }
    const t = wave - li;
    const A = layout.nodes[a], B = layout.nodes[b];
    if (t > 0 && t < 1 && vis > 0) {
      pp.set([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], k * 3);
    } else pp.set([0, -999, 0], k * 3);
  });
  eGeo.attributes.color.needsUpdate = true;
  pGeo.attributes.position.needsUpdate = true;
  return (
    <group>
      <primitive object={nodes} />
      <lineSegments geometry={eGeo}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={pGeo}>
        <pointsMaterial size={0.22} color="#ffffff" map={dotTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

/* ================================================================== WIREFRAME CAT */
export type CatVariant = {
  body?: [number, number, number];
  head?: number;
  ear?: number;
  leg?: number;
  tail?: boolean;
  curled?: boolean;
  earFold?: boolean;
};

const partMat = (color: string, hi: number, opacity: number) => (
  <meshBasicMaterial color={hi > 0.01 ? new THREE.Color(color).lerp(new THREE.Color(C.amber), hi) : color} wireframe transparent opacity={opacity} toneMapped={false} />
);

export const WireCat: React.FC<{
  v?: CatVariant;
  color?: string;
  opacity?: number;
  hi?: {ears?: number; legs?: number; whiskers?: number; tail?: number};
  position?: V3;
  rotation?: V3;
  scale?: number;
}> = ({v = {}, color = C.cyan, opacity = 0.9, hi = {}, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1}) => {
  const body = v.body ?? [1.25, 0.6, 0.55];
  const headR = v.head ?? 0.45;
  const legL = v.curled ? 0 : v.leg ?? 0.85;
  const by = legL + body[1] * 0.75;
  const hx = v.curled ? body[0] * 0.55 : body[0] * 0.95;
  const hy = v.curled ? by + 0.05 : by + body[1] * 0.85;
  const tailCurve = useMemo(() => {
    if (v.tail === false) return null;
    if (v.curled)
      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(-body[0] * 0.8, by - 0.2, 0.2),
        new THREE.Vector3(-body[0] * 0.2, by - 0.45, body[2] + 0.2),
        new THREE.Vector3(body[0] * 0.6, by - 0.4, body[2] + 0.1),
      ]);
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-body[0] * 0.9, by + 0.05, 0),
      new THREE.Vector3(-body[0] * 1.4, by + 0.5, 0),
      new THREE.Vector3(-body[0] * 1.35, by + 1.2, 0.1),
      new THREE.Vector3(-body[0] * 1.1, by + 1.45, 0.15),
    ]);
  }, [v.tail, v.curled, body[0], by]);
  const whiskers = useMemo(() => {
    const pts: number[] = [];
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++) pts.push(hx + headR * 0.85, hy - 0.1, s * 0.12, hx + headR * 1.6, hy - 0.2 + k * 0.1, s * (0.5 + k * 0.08));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [hx, hy, headR]);
  const ear = v.ear ?? 0.42;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, by, 0]} scale={body}>
        <sphereGeometry args={[1, 14, 10]} />
        {partMat(color, 0, opacity * 0.7)}
      </mesh>
      <mesh position={[hx, hy, 0]}>
        <icosahedronGeometry args={[headR, 1]} />
        {partMat(color, 0, opacity)}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[hx - 0.05, hy + headR * 0.85, s * headR * 0.5]} rotation={[s * (v.earFold ? 1.1 : 0.25), 0, v.earFold ? -0.9 : 0]}>
          <coneGeometry args={[0.17, ear, 4]} />
          {partMat(color, hi.ears ?? 0, opacity)}
        </mesh>
      ))}
      {legL > 0
        ? [
            [body[0] * 0.6, 0.3],
            [body[0] * 0.6, -0.3],
            [-body[0] * 0.6, 0.3],
            [-body[0] * 0.6, -0.3],
          ].map(([x, z], k) => (
            <mesh key={k} position={[x, legL / 2, z * body[2] * 1.4]}>
              <cylinderGeometry args={[0.09, 0.07, legL + 0.2, 6, 2]} />
              {partMat(color, hi.legs ?? 0, opacity)}
            </mesh>
          ))
        : null}
      {tailCurve ? (
        <mesh>
          <tubeGeometry args={[tailCurve, 20, 0.07, 5, false]} />
          {partMat(color, hi.tail ?? 0, opacity)}
        </mesh>
      ) : null}
      <lineSegments geometry={whiskers}>
        <lineBasicMaterial color={(hi.whiskers ?? 0) > 0.01 ? C.amber : color} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
};

/* ================================================================== GLOBE */
export const useGlobePoints = (n = 4200, r = 3, seed = 3.1) =>
  useMemo(() => {
    const land: number[] = [];
    const sea: number[] = [];
    fibSphere(n, r).forEach((p) => {
      const nv = noise3(p[0] * 0.55 + seed, p[1] * 0.55, p[2] * 0.55) + 0.5 * noise3(p[0] * 1.3, p[1] * 1.3 + seed, p[2] * 1.3);
      (nv > 0.12 ? land : sea).push(...p);
    });
    const mk = (a: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
      return g;
    };
    return {land: mk(land), sea: mk(sea), landArr: land};
  }, [n, r, seed]);

export const Globe: React.FC<{r?: number; color?: string; opacity?: number; rotY?: number; position?: V3}> = ({
  r = 3,
  color = C.cyan,
  opacity = 1,
  rotY = 0,
  position = [0, 0, 0],
}) => {
  const {land, sea} = useGlobePoints(5200, r);
  return (
    <group position={position} rotation={[0.25, rotY, 0]}>
      <mesh>
        <sphereGeometry args={[r * 0.985, 48, 48]} />
        <meshStandardMaterial color="#040a18" emissive={C.blue} emissiveIntensity={0.08} transparent opacity={0.92 * opacity} />
      </mesh>
      <points geometry={land}>
        <pointsMaterial size={0.07} color={color} map={dotTexture()} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={sea}>
        <pointsMaterial size={0.03} color={C.blue} map={dotTexture()} transparent opacity={0.35 * opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <sphereGeometry args={[r * 1.08, 48, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.05 * opacity} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Glow color={C.blue} scale={r * 3.4} opacity={0.35 * opacity} />
    </group>
  );
};

/* ================================================================== DOCUMENT (paper) */
export type PaperSpec = {
  kicker?: string;
  title: string;
  authors?: string;
  sub?: string;
  firstLine?: string;
  bodyLines?: number;
  dark?: boolean;
};

export const drawPaper = (s: PaperSpec) => (g: CanvasRenderingContext2D, w: number, h: number) => {
  const paper = s.dark ? '#f4f4f0' : '#efe5cc';
  g.fillStyle = paper;
  g.fillRect(0, 0, w, h);
  // aged vignette
  const gr = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, s.dark ? 'rgba(0,0,0,0.06)' : 'rgba(110,70,20,0.28)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1d1a16';
  g.textAlign = 'center';
  let y = 90;
  if (s.kicker) {
    g.font = `500 22px "${MONO}", monospace`;
    g.fillText(s.kicker, w / 2, y);
    y += 30;
    g.fillRect(w * 0.12, y, w * 0.76, 2);
    y += 60;
  }
  g.font = `700 50px Georgia, "Times New Roman", serif`;
  const words = s.title.split(' ');
  let line = '';
  const lines: string[] = [];
  words.forEach((wd) => {
    const t = line ? `${line} ${wd}` : wd;
    if (g.measureText(t).width > w * 0.8) {
      lines.push(line);
      line = wd;
    } else line = t;
  });
  lines.push(line);
  lines.forEach((l) => {
    g.fillText(l, w / 2, y);
    y += 60;
  });
  if (s.authors) {
    y += 6;
    g.font = `italic 26px Georgia, serif`;
    g.fillText(s.authors, w / 2, y);
    y += 36;
  }
  if (s.sub) {
    g.font = `22px Georgia, serif`;
    g.fillStyle = '#4a4238';
    g.fillText(s.sub, w / 2, y);
    y += 40;
  }
  y += 20;
  g.textAlign = 'left';
  if (s.firstLine) {
    g.fillStyle = '#1d1a16';
    g.font = `24px Georgia, serif`;
    g.fillText(s.firstLine, w * 0.1, y);
    y += 40;
  }
  g.fillStyle = 'rgba(40,34,28,0.35)';
  for (let k = 0; k < (s.bodyLines ?? 14) && y < h - 60; k++) {
    const len = k % 6 === 5 ? 0.45 : 0.8 - (k % 3) * 0.03;
    g.fillRect(w * 0.1, y, w * len, 9);
    y += 30;
  }
};

/* ================================================================== MONITOR / TERMINAL */
export const Monitor: React.FC<{
  id: string;
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void;
  position?: V3;
  rotation?: V3;
  scale?: number;
  glow?: string;
  opacity?: number;
}> = ({id, draw, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, glow = C.cyan, opacity = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0, -0.18]}>
      <boxGeometry args={[2.3, 1.65, 0.3]} />
      <meshStandardMaterial color="#141a2a" metalness={0.5} roughness={0.4} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, -1.05, -0.2]}>
      <boxGeometry args={[0.3, 0.5, 0.2]} />
      <meshStandardMaterial color="#141a2a" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[0, -1.3, -0.1]}>
      <boxGeometry args={[1.1, 0.08, 0.6]} />
      <meshStandardMaterial color="#141a2a" metalness={0.5} roughness={0.4} />
    </mesh>
    <CanvasPlane id={id} draw={draw} px={[640, 440]} width={2.05} position={[0, 0, -0.02]} opacity={opacity} doubleSide={false} />
    <Glow color={glow} scale={3.2} opacity={0.25 * opacity} position={[0, 0, -0.3]} />
  </group>
);

export const drawScreen = (title: string, lines: string[], accent: string, icon?: 'human' | 'machine' | 'judge') => (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = '#05101e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = accent;
  g.lineWidth = 4;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = accent;
  g.font = `700 40px "${MONO}", monospace`;
  g.fillText(title, 34, 64);
  g.font = `400 24px "${MONO}", monospace`;
  g.fillStyle = 'rgba(200,230,255,0.85)';
  lines.forEach((l, k) => g.fillText(l, 34, 120 + k * 38));
  if (icon) {
    g.save();
    g.translate(w - 120, h - 130);
    g.strokeStyle = accent;
    g.lineWidth = 7;
    if (icon === 'human' || icon === 'judge') {
      g.beginPath();
      g.arc(0, -30, 30, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(0, 60, 55, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
    } else {
      roundRect(g, -45, -60, 90, 80, 14);
      g.stroke();
      g.fillStyle = accent;
      g.fillRect(-25, -35, 14, 14);
      g.fillRect(11, -35, 14, 14);
      g.fillRect(-20, -2, 40, 6);
      g.beginPath();
      g.moveTo(0, -60);
      g.lineTo(0, -85);
      g.stroke();
      g.beginPath();
      g.arc(0, -90, 7, 0, Math.PI * 2);
      g.fill();
      roundRect(g, -55, 35, 110, 45, 10);
      g.stroke();
    }
    g.restore();
  }
};

/* ================================================================== CHIP (processor) */
export const Chip: React.FC<{position?: V3; rotation?: V3; scale?: number; color?: string; glow?: number; label?: string}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = C.green,
  glow = 1,
  label,
}) => {
  const pins = useMemo(() => {
    const out: V3[] = [];
    for (let k = 0; k < 10; k++) {
      const t = -1.1 + k * 0.245;
      out.push([t, 0, 1.45], [t, 0, -1.45], [1.45, 0, t], [-1.45, 0, t]);
    }
    return out;
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[2.6, 0.25, 2.6]} />
        <meshStandardMaterial color="#10141c" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.5, 0.08, 1.5]} />
        <meshStandardMaterial color="#1b2333" emissive={color} emissiveIntensity={0.8 * glow} metalness={0.4} roughness={0.2} />
      </mesh>
      {pins.map((p, k) => (
        <mesh key={k} position={p} rotation={[0, Math.abs(p[0]) > 1.4 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.35]} />
          <meshStandardMaterial color="#d9b25a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {label ? <Label text={label} size={0.28} font={MONO} color={C.white} position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} /> : null}
      <Glow color={color} scale={4 * glow} opacity={0.5 * glow} position={[0, 0.4, 0]} />
    </group>
  );
};

/* ================================================================== CAMPUS HALL */
export const CampusHall: React.FC<{position?: V3; scale?: number; lit?: number}> = ({position = [0, 0, 0], scale = 1, lit = 1}) => {
  const f = useCurrentFrame();
  const windows = useMemo(() => {
    const out: V3[] = [];
    for (let fl = 0; fl < 3; fl++) for (let k = 0; k < 9; k++) out.push([-3.2 + k * 0.8, 0.6 + fl * 1.0, 1.01]);
    return out;
  }, []);
  const trees = useMemo(() => new Array(10).fill(0).map((_, k) => [srand(`tx${k}`, -9, 9), srand(`tz${k}`, 2, 6)] as [number, number]), []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[8, 3.2, 2]} />
        <meshStandardMaterial color="#7a3527" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.5, 1]}>
        <coneGeometry args={[4.6, 1.6, 4, 1]} />
        <meshStandardMaterial color="#2c2f36" roughness={0.6} />
      </mesh>
      {/* cupola */}
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#f2efe6" roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.15, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.7, 8]} />
        <meshStandardMaterial color="#f2efe6" roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.85, 0]}>
        <coneGeometry args={[0.42, 0.8, 8]} />
        <meshStandardMaterial color="#3f6e5c" roughness={0.5} />
      </mesh>
      {windows.map((p, k) => (
        <mesh key={k} position={p}>
          <planeGeometry args={[0.42, 0.62]} />
          <meshBasicMaterial color={new THREE.Color('#ffe2a0').multiplyScalar(0.4 + 0.6 * lit * (0.6 + 0.4 * Math.sin(k * 7.1 + f * 0.02)))} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.7, 1.05]}>
        <planeGeometry args={[0.8, 1.3]} />
        <meshBasicMaterial color="#f2efe6" />
      </mesh>
      <mesh position={[0, 0, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 10]} />
        <meshStandardMaterial color="#1f3a22" roughness={1} />
      </mesh>
      {trees.map(([x, z], k) => (
        <group key={k} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
            <meshStandardMaterial color="#3b2a1e" />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <icosahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#2f5a2c" flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ================================================================== GPU CARD */
export const GPUCard: React.FC<{position?: V3; rotation?: V3; scale?: number; open?: number}> = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, open = 0}) => {
  const f = useCurrentFrame();
  const fins = useMemo(() => new Array(34).fill(0).map((_, k) => -3.3 + k * 0.2), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* PCB */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[7.4, 0.08, 2.9]} />
        <meshStandardMaterial color="#0c2a1c" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* PCIe gold fingers */}
      {new Array(28).fill(0).map((_, k) => (
        <mesh key={k} position={[-2 + k * 0.1, -0.35, 1.5]}>
          <boxGeometry args={[0.06, 0.09, 0.18]} />
          <meshStandardMaterial color="#e2b84f" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      {/* heatsink fins */}
      <group position={[0, open * 1.2, 0]}>
        {fins.map((x, k) => (
          <mesh key={k} position={[x, 0.05, 0]}>
            <boxGeometry args={[0.04, 0.7, 2.6]} />
            <meshStandardMaterial color="#9aa3b5" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </group>
      {/* shroud with fans */}
      <group position={[0, 0.55 + open * 3, 0]} rotation={[open * -0.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[7.5, 0.35, 3]} />
          <meshStandardMaterial color="#12151d" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 1.35]}>
          <boxGeometry args={[7.3, 0.04, 0.08]} />
          <meshBasicMaterial color={C.green} toneMapped={false} />
        </mesh>
        {[-1.8, 1.8].map((x, k) => (
          <group key={k} position={[x, 0.19, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.1, 1.22, 48]} />
              <meshBasicMaterial color={C.green} toneMapped={false} />
            </mesh>
            <group rotation={[0, f * 0.35 * (k ? 1 : -1), 0]}>
              <mesh>
                <cylinderGeometry args={[0.32, 0.32, 0.08, 24]} />
                <meshStandardMaterial color="#222837" metalness={0.6} />
              </mesh>
              {new Array(9).fill(0).map((_, b) => (
                <mesh key={b} rotation={[0.35, (b / 9) * Math.PI * 2, 0]} position={[Math.cos((b / 9) * Math.PI * 2) * 0.68, 0, -Math.sin((b / 9) * Math.PI * 2) * 0.68]}>
                  <boxGeometry args={[0.72, 0.02, 0.3]} />
                  <meshStandardMaterial color="#2b3242" metalness={0.5} roughness={0.4} />
                </mesh>
              ))}
            </group>
          </group>
        ))}
      </group>
      {/* die revealed when open */}
      <mesh position={[0, -0.27, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.6]} />
        <meshStandardMaterial color="#1b2333" emissive={C.green} emissiveIntensity={open * 1.2} />
      </mesh>
    </group>
  );
};

/* ================================================================== CHESS PIECE (lathe) */
const PIECES: Record<string, [number, number][]> = {
  pawn: [[0, 0], [0.38, 0], [0.38, 0.1], [0.24, 0.2], [0.14, 0.55], [0.22, 0.62], [0.13, 0.68], [0.2, 0.82], [0.2, 0.95], [0.1, 1.04], [0, 1.06]],
  king: [[0, 0], [0.44, 0], [0.44, 0.12], [0.28, 0.24], [0.17, 0.95], [0.3, 1.02], [0.18, 1.1], [0.26, 1.35], [0.12, 1.45], [0, 1.47]],
  rook: [[0, 0], [0.42, 0], [0.42, 0.12], [0.28, 0.22], [0.24, 0.85], [0.34, 0.9], [0.34, 1.12], [0, 1.12]],
};
export const ChessPiece: React.FC<{type: 'pawn' | 'king' | 'rook'; color: string; position: V3; emissive?: string}> = ({type, color, position, emissive = '#000000'}) => {
  const geo = useMemo(() => new THREE.LatheGeometry(PIECES[type].map(([x, y]) => new THREE.Vector2(x, y)), 32), [type]);
  return (
    <mesh geometry={geo} position={position}>
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} metalness={0.5} roughness={0.3} />
    </mesh>
  );
};

/* ================================================================== text block texture (for LLM tunnel) */
const SAMPLE = [
  'the history of science is the history of questions that refused to stay small',
  'language is a map of how people think about the world and each other',
  'a model reads patterns in text and learns which words tend to follow',
  'def train(model, data): for batch in data: loss = model.step(batch)',
  'once upon a time a machine was asked whether it could think',
  'the capital of france is paris and the capital of japan is tokyo',
  'water boils at one hundred degrees celsius at sea level',
  'photosynthesis converts light energy into chemical energy',
];
export const drawTextBlock = (seed: number, accent: string) => (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = 'rgba(8,14,30,0.85)';
  roundRect(g, 4, 4, w - 8, h - 8, 18);
  g.fill();
  g.strokeStyle = accent;
  g.globalAlpha = 0.6;
  g.lineWidth = 3;
  g.stroke();
  g.globalAlpha = 1;
  g.font = `400 26px "${MONO}", monospace`;
  g.fillStyle = 'rgba(210,225,255,0.85)';
  let y = 50;
  for (let k = 0; k < 7; k++) {
    const s = SAMPLE[(seed + k) % SAMPLE.length];
    g.fillText(s.slice(0, 34 + ((seed * 7 + k * 3) % 10)), 26, y);
    y += 40;
  }
};

export {HEAD, MONO, rnd};
