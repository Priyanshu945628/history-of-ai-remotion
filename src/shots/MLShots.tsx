import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {WireCat} from '../three/objects';
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
} from '../three/primitives';

/** 1. CATRULES (Highlighting anatomical rules on 3D WireCat) */
export const CatRulesShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos = orbit(f * 0.015, 8 - p * 1.5, 1.8);

  // Sequential rule highlights
  const earHi = interpolate(f, [15, 45, 60], [0, 1, 0], {extrapolateRight: 'clamp'});
  const whiskerHi = interpolate(f, [55, 85, 100], [0, 1, 0], {extrapolateRight: 'clamp'});
  const legHi = interpolate(f, [95, 125, 140], [0, 1, 0], {extrapolateRight: 'clamp'});
  const tailHi = interpolate(f, [135, 165, 180], [0, 1, 0], {extrapolateRight: 'clamp'});

  return (
    <Stage bg="#030510" fog={[6, 25]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 1.0, 0]} />
      <Grid size={40} div={40} color="#152b47" opacity={0.35} y={0} />
      <Dust count={200} spread={[16, 10, 16]} />

      <WireCat
        position={[0, 0, 0]}
        scale={1.2}
        hi={{
          ears: earHi,
          whiskers: whiskerHi,
          legs: legHi,
          tail: tailHi,
        }}
      />

      {/* Dynamic Rule Callouts */}
      {earHi > 0.1 && (
        <Label
          text="RULE 1: TWO EARS"
          size={0.28}
          color={C.amber}
          bg="rgba(10, 15, 30, 0.9)"
          border={C.amber}
          position={[0.8, 2.6, 0]}
        />
      )}
      {whiskerHi > 0.1 && (
        <Label
          text="RULE 2: WHISKERS"
          size={0.28}
          color={C.amber}
          bg="rgba(10, 15, 30, 0.9)"
          border={C.amber}
          position={[1.6, 1.6, 0]}
        />
      )}
      {legHi > 0.1 && (
        <Label
          text="RULE 3: FOUR LEGS"
          size={0.28}
          color={C.amber}
          bg="rgba(10, 15, 30, 0.9)"
          border={C.amber}
          position={[-0.8, 0.4, 1]}
        />
      )}
      {tailHi > 0.1 && (
        <Label
          text="RULE 4: TAIL"
          size={0.28}
          color={C.amber}
          bg="rgba(10, 15, 30, 0.9)"
          border={C.amber}
          position={[-1.8, 1.8, 0]}
        />
      )}
    </Stage>
  );
};

/** 2. CATSVARY (3 Different Cat Morphology Variants in 3D) */
export const CatsVaryShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.012) * 5,
    2.2,
    11 - (f / dur) * 2,
  ];

  return (
    <Stage bg="#03040c" fog={[8, 30]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={camPos} look={[0, 1.2, 0]} />
      <Grid size={45} div={45} color="#152642" opacity={0.35} y={0} />
      <Dust count={250} spread={[22, 12, 22]} />

      {/* Cat 1: Curled up asleep */}
      <group position={[-3.6, 0, 0]}>
        <WireCat v={{curled: true, head: 0.38, ear: 0.28}} color={C.cyan} scale={1.1} />
        <Label text="SLEEPING / CURLED" size={0.25} color={C.cyan} position={[0, 2.0, 0]} />
        <Label text="NO LEGS VISIBLE" size={0.22} color={C.red} position={[0, 1.6, 0]} />
      </group>

      {/* Cat 2: Standard sitting upright */}
      <group position={[0, 0, 0]}>
        <WireCat color={C.amber} scale={1.2} />
        <Label text="STANDARD TABBY" size={0.25} color={C.amber} position={[0, 2.4, 0]} />
        <Label text="MEETS BASIC RULES" size={0.22} color={C.green} position={[0, 2.0, 0]} />
      </group>

      {/* Cat 3: Sphynx / Folded ears */}
      <group position={[3.6, 0, 0]}>
        <WireCat v={{earFold: true, tail: false, leg: 1.1}} color={C.magenta} scale={1.1} />
        <Label text="SPHYNX / FOLDED" size={0.25} color={C.magenta} position={[0, 2.2, 0]} />
        <Label text="NO VISIBLE FUR OR TAIL" size={0.22} color={C.red} position={[0, 1.8, 0]} />
      </group>

      <Label
        text="REAL WORLD VARIATION BREAKS STATIC RULES"
        size={0.36}
        color={C.red}
        bg="rgba(25, 8, 12, 0.9)"
        border={C.red}
        position={[0, 3.8, 0]}
      />
    </Stage>
  );
};

/** 3. LEARNRULES ("What if the machine learns the rules itself?") */
export const LearnRulesShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 1.2, 10 - p * 2.5];

  return (
    <Stage bg="#030512" fog={[6, 28]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 1.0, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={C.cyan} />

      <Text3D
        text="WHAT IF IT LEARNS"
        size={1.1}
        depth={0.3}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 2.0, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="THE RULES ITSELF?"
        size={1.2}
        depth={0.35}
        color={C.cyan}
        emissive={C.violet}
        emissiveIntensity={0.7}
        position={[0, 0.5, 0]}
        anim="drop"
        dur={25}
      />

      <Label
        text="THE PARADIGM SHIFT: FROM EXPLICIT CODE TO INDUCTIVE LEARNING"
        size={0.32}
        color={C.amber}
        bg="rgba(8, 14, 28, 0.9)"
        border={C.cyan}
        position={[0, -1.2, 0]}
      />
    </Stage>
  );
};

/** 4. MLTITLE (Hero 3D Extruded Title: "MACHINE LEARNING") */
export const MLTitleShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 0.8, 11 - p * 2.2];

  return (
    <Stage bg="#02040d" fog={[8, 30]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Starfield count={1800} radius={50} color="#7cb8ff" />
      <Dust count={300} spread={[25, 14, 25]} color={C.cyan} />

      <Text3D
        text="MACHINE"
        size={1.5}
        depth={0.4}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 1.4, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="LEARNING"
        size={1.4}
        depth={0.4}
        color={C.cyan}
        emissive={C.violet}
        emissiveIntensity={0.7}
        position={[0, -0.4, 0]}
        anim="drop"
        dur={26}
      />

      <Label
        text="DISCOVERING PATTERNS IN DATA"
        size={0.36}
        color={C.amber}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.amber}
        position={[0, -2.0, 0]}
      />
    </Stage>
  );
};

/** 5. EXAMPLES (Swarm of Thousands, Millions, Billions of Data Examples) */
export const ExamplesShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.012, 11, 2.5);

  // 1200 floating data point cubes swirling inwards
  const count = 600;
  const points = useMemo(() => {
    const list: [number, number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 6.5;
      const th = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 5;
      list.push([r, th, y, Math.random()]);
    }
    return list;
  }, []);

  return (
    <Stage bg="#030514" fog={[8, 32]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Dust count={300} spread={[24, 14, 24]} color={C.cyan} />

      {/* Swirling Data Ingestion Vortex */}
      {points.map(([r, th, y, seed], idx) => {
        const curTh = th + f * (0.01 + seed * 0.02);
        const curR = r - ((f * 0.02 + seed * 2) % 4);
        const x = Math.sin(curTh) * curR;
        const z = Math.cos(curTh) * curR;
        const col = seed > 0.5 ? C.cyan : C.magenta;

        return (
          <mesh key={idx} position={[x, y, z]} scale={0.08 + seed * 0.06}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={col} />
          </mesh>
        );
      })}

      {/* Center Absorption Core */}
      <mesh>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshStandardMaterial
          color="#0d1b33"
          emissive={C.cyan}
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
      <Glow color={C.cyan} scale={4.5} opacity={0.6} />

      <Label
        text="TRAINING DATASET // MILLIONS OF SAMPLES"
        size={0.34}
        color={C.cyan}
        bg="rgba(8, 14, 28, 0.9)"
        border={C.cyan}
        position={[0, 3.2, 0]}
      />
    </Stage>
  );
};

/** 6. PATTERNS (Statistical Manifold & Mathematical Model) */
export const PatternsShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.015, 9, 2.0);

  // Clustered 3D decision boundary manifold surface
  return (
    <Stage bg="#03040e" fog={[7, 30]} keyColor={C.cyan} rimColor={C.green}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Dust count={250} spread={[20, 12, 20]} />

      {/* Discovered Decision Surface */}
      <mesh rotation={[-Math.PI / 3, 0, f * 0.005]}>
        <planeGeometry args={[7, 7, 24, 24]} />
        <meshStandardMaterial
          color="#122744"
          emissive={C.cyan}
          emissiveIntensity={0.35}
          wireframe
        />
      </mesh>

      {/* Clustered class A (Cats) vs Class B (Dogs) */}
      {new Array(30).fill(0).map((_, i) => (
        <group key={`a_${i}`} position={[-1.8 + Math.sin(i * 1.3) * 1.2, 1 + Math.cos(i * 1.1) * 0.8, Math.sin(i) * 1.2]}>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={C.cyan} />
          </mesh>
        </group>
      ))}
      {new Array(30).fill(0).map((_, i) => (
        <group key={`b_${i}`} position={[1.8 + Math.sin(i * 1.7) * 1.2, -0.5 + Math.cos(i * 1.4) * 0.8, Math.cos(i) * 1.2]}>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={C.amber} />
          </mesh>
        </group>
      ))}

      <Label
        text="MATHEMATICAL PATTERN EXTRACTION"
        size={0.36}
        color={C.green}
        bg="rgba(10, 18, 25, 0.9)"
        border={C.green}
        position={[0, 2.6, 0]}
      />
    </Stage>
  );
};
