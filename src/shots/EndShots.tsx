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
  orbit,
} from '../three/primitives';

/** 1. RECAP (From Instruction Followers to Reasoning Systems) */
export const RecapShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 5,
    1.8,
    10 - (f / dur) * 2,
  ];

  return (
    <Stage bg="#03040e" fog={[7, 30]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 1.0, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={C.cyan} />

      <group position={[-2.8, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 2.8, 0.4]} />
          <meshStandardMaterial color="#1a120c" emissive={C.amber} emissiveIntensity={0.3} />
        </mesh>
        <Label text="1940s" size={0.32} color={C.amber} position={[0, 0.8, 0.25]} />
        <Label text="FIXED RULES" size={0.24} color={C.white} position={[0, 0.2, 0.25]} />
        <Label text="CALCULATIONS" size={0.24} color={C.grey} position={[0, -0.4, 0.25]} />
      </group>

      <group position={[2.8, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 2.8, 0.4]} />
          <meshStandardMaterial color="#0c182b" emissive={C.cyan} emissiveIntensity={0.4} />
        </mesh>
        <Label text="TODAY" size={0.32} color={C.cyan} position={[0, 0.8, 0.25]} />
        <Label text="DEEP REASONING" size={0.24} color={C.white} position={[0, 0.2, 0.25]} />
        <Label text="MULTIMODAL" size={0.24} color={C.cyan} position={[0, -0.4, 0.25]} />
      </group>

      <Label
        text="AN EIGHTY YEAR JOURNEY OF COMPUTATIONAL EVOLUTION"
        size={0.34}
        color={C.cyan}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.cyan}
        position={[0, 3.4, 0]}
      />
    </Stage>
  );
};

/** 2. BEGINNING ("How intelligent can they become?") */
export const BeginningShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 1.0, 10 - p * 2.2];

  return (
    <Stage bg="#02030a" fog={[8, 30]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.6, 0]} />
      <Starfield count={2000} radius={45} />
      <Dust count={250} spread={[20, 12, 20]} color={C.cyan} />

      <Text3D
        text="HOW INTELLIGENT"
        size={1.2}
        depth={0.3}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 1.8, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="CAN THEY BECOME?"
        size={1.3}
        depth={0.35}
        color={C.cyan}
        emissive={C.violet}
        emissiveIntensity={0.7}
        position={[0, 0.2, 0]}
        anim="drop"
        dur={26}
      />

      <Label
        text="STILL AT THE VERY BEGINNING"
        size={0.36}
        color={C.amber}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.amber}
        position={[0, -1.6, 0]}
      />
    </Stage>
  );
};

/** 3. FINALE ("And that... is a story we're still writing.") */
export const FinaleShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  // Camera slowly pulls back into the cosmic starfield
  const camPos: [number, number, number] = [
    Math.sin(f * 0.008) * 4,
    1.5 + p * 2.5,
    9 + p * 12,
  ];

  return (
    <Stage bg="#010207" fog={[12, 60]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Starfield count={3500} radius={80} spin={0.0006} />
      <Dust count={400} spread={[35, 20, 35]} color={C.cyan} />

      <AICore scale={2.4} intensity={1.5} />

      <Label
        text="A STORY STILL BEING WRITTEN"
        size={0.52}
        color={C.cyan}
        bg="rgba(4, 8, 20, 0.95)"
        border={C.cyan}
        glow
        position={[0, -3.2, 0]}
      />
    </Stage>
  );
};
