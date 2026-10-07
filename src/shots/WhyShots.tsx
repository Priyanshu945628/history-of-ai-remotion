import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
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
  Tube,
  arc,
  orbit,
} from '../three/primitives';

/** 1. NOTPROG (Not Programmed, But Learned from Data) */
export const NotProgShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 1.0, 10 - p * 2.2];

  return (
    <Stage bg="#030410" fog={[7, 28]} keyColor={C.violet} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.6, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={C.violet} />

      <Text3D
        text="NOT PROGRAMMED"
        size={1.2}
        depth={0.3}
        color="#ffffff"
        emissive={C.red}
        emissiveIntensity={0.6}
        position={[0, 1.8, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="DISCOVERED"
        size={1.4}
        depth={0.35}
        color={C.cyan}
        emissive={C.violet}
        emissiveIntensity={0.7}
        position={[0, 0.2, 0]}
        anim="drop"
        dur={26}
      />

      <Label
        text="INTELLIGENCE EMERGED FROM SELF-OPTIMIZING MATHEMATICS"
        size={0.32}
        color={C.amber}
        bg="rgba(14, 10, 28, 0.9)"
        border={C.amber}
        position={[0, -1.4, 0]}
      />
    </Stage>
  );
};

/** 2. LOOP (The Core 6-Step Loop: Data -> Training -> Prediction -> Error -> Adjustment -> Repeat) */
export const LoopShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.012, 10, 2.8);

  const steps = [
    {label: '1. DATA', col: C.cyan, angle: 0},
    {label: '2. TRAINING', col: C.blue, angle: Math.PI / 3},
    {label: '3. PREDICTION', col: C.amber, angle: (2 * Math.PI) / 3},
    {label: '4. ERROR', col: C.red, angle: Math.PI},
    {label: '5. ADJUSTMENT', col: C.violet, angle: (4 * Math.PI) / 3},
    {label: '6. REPEAT', col: C.green, angle: (5 * Math.PI) / 3},
  ];

  // Traveling particle accelerator ring
  const ringR = 3.6;

  return (
    <Stage bg="#03040e" fog={[8, 30]} keyColor={C.cyan} rimColor={C.green}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Dust count={250} spread={[22, 12, 22]} />

      {/* Circular Accelerator Guide Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringR, 0.04, 16, 96]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.6} />
      </mesh>

      {/* The 6 Loop Stations */}
      {steps.map((st, i) => {
        const x = Math.sin(st.angle) * ringR;
        const z = Math.cos(st.angle) * ringR;
        const active = Math.floor(f / 20) % 6 === i;

        return (
          <group key={i} position={[x, 0, z]}>
            <mesh>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial color={active ? '#ffffff' : st.col} toneMapped={false} />
            </mesh>
            <Glow color={st.col} scale={active ? 3.5 : 1.8} opacity={active ? 0.9 : 0.4} />
            <Label
              text={st.label}
              size={0.28}
              color={active ? '#ffffff' : st.col}
              bg="rgba(10, 15, 30, 0.9)"
              border={st.col}
              position={[0, 0.6, 0]}
            />
          </group>
        );
      })}

      <Label
        text="THE FUNDAMENTAL LEARNING LOOP"
        size={0.36}
        color={C.green}
        bg="rgba(8, 20, 16, 0.9)"
        border={C.green}
        position={[0, 2.4, 0]}
      />
    </Stage>
  );
};

/** 3. EMERGE (Scale: Billions of Times -> Capable Behavior Emerges) */
export const EmergeShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos = orbit(f * 0.015, 11 - p * 2.5, 2.0);

  return (
    <Stage bg="#02030a" fog={[8, 35]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Starfield count={2200} radius={50} spin={0.001} />
      <Dust count={300} spread={[24, 14, 24]} color={C.cyan} />

      <AICore scale={1.8} intensity={1.4} />

      <Label
        text="BILLIONS OF PARAMETERS · PETABYTES OF DATA · EMERGENT INTELLIGENCE"
        size={0.34}
        color={C.cyan}
        bg="rgba(8, 14, 30, 0.9)"
        border={C.cyan}
        glow
        position={[0, 3.4, 0]}
      />
    </Stage>
  );
};
