import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {AICore} from '../three/objects';
import {
  CanvasPlane,
  Dust,
  Glow,
  Grid,
  Label,
  Rig,
  Stage,
  Starfield,
  Text3D,
  orbit,
  roundRect,
} from '../three/primitives';

/** 1. MAINFRAME (1940s room-sized computing cabinets) */
export const MainframeShot: React.FC<ShotProps> = ({dur, lines}) => {
  const f = useCurrentFrame();
  const camP = interpolate(f, [0, dur], [0, 1]);
  const camPos: [number, number, number] = [
    Math.sin(camP * 0.4) * 8 - 4,
    2.5 + Math.cos(camP * 0.3) * 0.8,
    14 - camP * 4,
  ];

  // Procedural mainframe rack cabinets
  const racks = useMemo(() => {
    return [-6, -3, 0, 3, 6].map((x, i) => ({
      x,
      z: -1 - Math.abs(x) * 0.5,
      height: 5.5,
      width: 2.2,
      depth: 1.8,
      seed: i,
    }));
  }, []);

  return (
    <Stage bg="#03060f" fog={[8, 30]} keyColor="#7eb8ff" rimColor="#ff9944">
      <Rig pos={camPos} look={[0, 1.8, 0]} />
      <Grid size={50} div={50} color="#1c355e" opacity={0.3} y={-0.1} />
      <Dust count={300} spread={[20, 10, 20]} color="#5599ff" speed={0.005} />

      {/* Racks */}
      {racks.map((r, idx) => {
        const isBlinking = Math.sin(f * 0.3 + idx * 2.1) > 0;
        return (
          <group key={idx} position={[r.x, r.height / 2, r.z]}>
            {/* Metal Cabinet */}
            <mesh>
              <boxGeometry args={[r.width, r.height, r.depth]} />
              <meshStandardMaterial
                color="#0c1322"
                metalness={0.7}
                roughness={0.35}
              />
            </mesh>
            {/* Front Panel Grid & Dials */}
            <CanvasPlane
              id={`rack_panel_${idx}`}
              px={[512, 1024]}
              width={r.width * 0.9}
              position={[0, 0, r.depth / 2 + 0.02]}
              draw={(ctx, w, h) => {
                ctx.fillStyle = '#080d18';
                ctx.fillRect(0, 0, w, h);
                // Draw analog vacuum tubes / gauges
                for (let row = 0; row < 8; row++) {
                  for (let col = 0; col < 6; col++) {
                    const cx = 50 + col * 75;
                    const cy = 60 + row * 110;
                    ctx.fillStyle = (row + col + idx) % 2 === 0 ? '#ffb852' : '#2dd4bf';
                    ctx.beginPath();
                    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }
                // Vacuum tube glow bank
                ctx.fillStyle = '#1e293b';
                roundRect(ctx, 40, 900, w - 80, 80, 10);
                ctx.fill();
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 28px monospace';
                ctx.fillText(`VACUUM BANK 0${idx + 1} - 1944`, 60, 950);
              }}
            />
            {/* Blinking lamp indicator */}
            <mesh position={[0, r.height / 2 - 0.3, r.depth / 2 + 0.1]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial
                color={isBlinking ? '#ffb547' : '#3ee6ff'}
                toneMapped={false}
              />
            </mesh>
            <Glow
              color={isBlinking ? '#ffb547' : '#3ee6ff'}
              scale={2.2}
              opacity={isBlinking ? 0.6 : 0.2}
              position={[0, r.height / 2 - 0.3, r.depth / 2 + 0.1]}
            />
          </group>
        );
      })}

      {/* Floating 1944 Callout */}
      <Label
        text="CIRCA 1944 // FIRST ELECTRONIC COMPUTERS"
        size={0.4}
        color={C.amber}
        bg="rgba(12, 18, 32, 0.85)"
        border={C.amber}
        position={[0, 4.6, 2]}
      />
    </Stage>
  );
};

/** 2. YEAR WARP (Camera tunnels forward from 1944 to present day) */
export const YearWarpShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const progress = prog(f, 0, dur);
  const zPos = 30 - progress * 40;
  const currentYear = Math.round(interpolate(progress, [0, 1], [1944, 2026]));

  return (
    <Stage bg="#020308" fog={[5, 45]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={[0, 0, zPos + 10]} look={[0, 0, zPos - 10]} roll={f * 0.02} />
      <Starfield count={2000} radius={60} spin={0.002} />

      {/* Tunnel Rings */}
      {new Array(25).fill(0).map((_, i) => {
        const ringZ = 30 - i * 3;
        const ringYear = 1944 + i * 4;
        return (
          <group key={i} position={[0, 0, ringZ]}>
            <mesh rotation={[0, 0, f * 0.01 * (i % 2 === 0 ? 1 : -1)]}>
              <torusGeometry args={[4.5, 0.04, 8, 48]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? C.cyan : C.violet}
                transparent
                opacity={0.65}
              />
            </mesh>
            <Label
              text={`${ringYear}`}
              size={0.3}
              color={C.cyan}
              position={[4.9, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            />
          </group>
        );
      })}

      {/* Central Warp Label */}
      <Label
        text={`${currentYear}`}
        size={1.6}
        color="#ffffff"
        glow
        position={[0, 0, zPos - 3]}
      />
    </Stage>
  );
};

/** 3. AI CORE (Modern intelligence core with capability orbitals) */
export const AICoreShot: React.FC<ShotProps> = ({dur, lines}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos = orbit(f * 0.015, 11 - p * 2, 2.5 + Math.sin(f * 0.02) * 0.8);

  const capabilities = [
    {label: 'CODE SYNTHESIS', col: C.cyan, r: 4.2, speed: 0.025, phase: 0},
    {label: 'IMAGE GENERATION', col: C.magenta, r: 4.8, speed: -0.02, phase: 1.2},
    {label: 'VIDEO ANALYSIS', col: C.amber, r: 5.4, speed: 0.018, phase: 2.5},
    {label: 'TRANSLATION', col: C.green, r: 3.8, speed: -0.03, phase: 3.8},
    {label: 'LOGICAL REASONING', col: C.violet, r: 5.0, speed: 0.022, phase: 4.7},
  ];

  return (
    <Stage bg="#03040c" fog={[10, 40]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Starfield count={1500} radius={50} color="#7fa2ff" />
      <Dust count={250} spread={[25, 15, 25]} color={C.cyan} />

      <AICore scale={1.3} intensity={1.2} />

      {/* Orbiting Capability Nodes */}
      {capabilities.map((c, i) => {
        const theta = f * c.speed + c.phase;
        const x = Math.sin(theta) * c.r;
        const z = Math.cos(theta) * c.r;
        const y = Math.sin(f * 0.03 + i) * 1.1;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial color={c.col} toneMapped={false} />
            </mesh>
            <Glow color={c.col} scale={2.0} opacity={0.8} />
            <Label
              text={c.label}
              size={0.28}
              color={C.white}
              bg="rgba(10, 15, 30, 0.85)"
              border={c.col}
              position={[0, 0.45, 0]}
            />
          </group>
        );
      })}
    </Stage>
  );
};

/** 4. LATTICE (Rigid instructions morphing into fluid intelligence) */
export const LatticeShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const transition = prog(f, dur * 0.35, dur * 0.4); // 0 = rigid instructions, 1 = intelligence flow
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 7,
    4 - transition * 1.5,
    11 - f * 0.02,
  ];

  // 3D Grid of instruction blocks
  const blocks = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        list.push([x * 1.6, 0, z * 1.6]);
      }
    }
    return list;
  }, []);

  return (
    <Stage bg="#030511" fog={[8, 35]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Dust count={200} spread={[20, 12, 20]} />

      {blocks.map(([bx, by, bz], i) => {
        // As transition increases, rigid blocks float and ripple like an organic neural wave
        const ripple = Math.sin(f * 0.08 + (bx + bz) * 0.8) * transition * 1.8;
        const rotY = transition * (f * 0.03 + i * 0.2);
        const col = transition > 0.5 ? C.violet : C.cyan;

        return (
          <group key={i} position={[bx, by + ripple, bz]} rotation={[0, rotY, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.3 + transition * 0.4, 0.8]} />
              <meshStandardMaterial
                color={transition > 0.5 ? '#150f2f' : '#0d1d33'}
                emissive={col}
                emissiveIntensity={0.3 + transition * 0.5}
                wireframe={transition < 0.3}
              />
            </mesh>
          </group>
        );
      })}

      <Label
        text={
          transition > 0.5
            ? 'EMERGENT ADAPTIVE INTELLIGENCE'
            : 'FIXED PROCEDURAL INSTRUCTIONS'
        }
        size={0.4}
        color={transition > 0.5 ? C.magenta : C.cyan}
        bg="rgba(5, 8, 20, 0.9)"
        border={transition > 0.5 ? C.magenta : C.cyan}
        position={[0, 3.2, 0]}
      />
    </Stage>
  );
};

/** 5. TITLE SHOT (Hero 3D Extruded Title) */
export const TitleShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [0, 0.5, 12 - prog(f, 0, dur) * 2.5];

  return (
    <Stage bg="#02030a" fog={[8, 40]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.2, 0]} />
      <Starfield count={2200} radius={65} spin={0.0005} />
      <Dust count={400} spread={[30, 18, 30]} color={C.cyan} />

      <AICore scale={2.2} intensity={0.5} position={[0, 0, -4]} />

      <Text3D
        text="ARTIFICIAL"
        size={1.5}
        depth={0.4}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 1.2, 0]}
        anim="drop"
        dur={25}
      />
      <Text3D
        text="INTELLIGENCE"
        size={1.4}
        depth={0.4}
        color={C.cyan}
        emissive={C.violet}
        emissiveIntensity={0.7}
        position={[0, -0.6, 0]}
        anim="drop"
        dur={28}
      />

      <Label
        text="HOW MACHINES BECAME INTELLIGENT"
        size={0.4}
        color={C.amber}
        font="monospace"
        bg="rgba(10, 15, 30, 0.9)"
        border={C.amber}
        position={[0, -2.1, 0.5]}
      />
    </Stage>
  );
};
