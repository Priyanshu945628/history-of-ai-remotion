import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {Chip, GPUCard} from '../three/objects';
import {
  CanvasPlane,
  Dust,
  Glow,
  Grid,
  Label,
  Rig,
  Stage,
  Text3D,
  orbit,
} from '../three/primitives';

/** 1. THREE (The Triad: More Data, More Hardware, Better Algorithms) */
export const ThreeShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 5,
    2.5,
    11 - (f / dur) * 2,
  ];

  const pillars = [
    {x: -3.8, title: 'MORE DATA', sub: 'BILLIONS OF SAMPLES', col: C.cyan},
    {x: 0, title: 'POWERFUL HARDWARE', sub: 'PARALLEL GPUS', col: C.green},
    {x: 3.8, title: 'BETTER ALGORITHMS', sub: 'DEEP ARCHITECTURES', col: C.violet},
  ];

  return (
    <Stage bg="#03060e" fog={[8, 30]} keyColor={C.green} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 1.5, 0]} />
      <Grid size={45} div={45} color="#16382c" opacity={0.35} y={0} />
      <Dust count={250} spread={[22, 14, 22]} color={C.green} />

      {pillars.map((p, i) => {
        const height = 4.2;
        return (
          <group key={i} position={[p.x, height / 2, 0]}>
            <mesh>
              <boxGeometry args={[2.4, height, 1.2]} />
              <meshStandardMaterial
                color="#0c1d18"
                emissive={p.col}
                emissiveIntensity={0.35}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.62]}>
              <boxGeometry args={[2.42, height + 0.02, 0.02]} />
              <meshBasicMaterial color={p.col} wireframe transparent opacity={0.3} />
            </mesh>
            <Label text={p.title} size={0.3} color={p.col} position={[0, 1.0, 0.7]} />
            <Label text={p.sub} size={0.2} color={C.white} position={[0, 0.4, 0.7]} />
            <Glow color={p.col} scale={4} opacity={0.4} position={[0, 0, 0.6]} />
          </group>
        );
      })}

      <Label
        text="THE THREE CATALYSTS OF THE DEEP LEARNING REVOLUTION"
        size={0.34}
        color={C.green}
        bg="rgba(8, 22, 16, 0.9)"
        border={C.green}
        position={[0, 4.4, 0]}
      />
    </Stage>
  );
};

/** 2. GPU (Graphic Processing Units & Massively Parallel Matrix Math) */
export const GPUShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos = orbit(f * 0.012, 10 - p * 1.5, 3.0);

  return (
    <Stage bg="#03080c" fog={[8, 30]} keyColor={C.green} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={C.green} />

      {/* Hero GPU Card */}
      <GPUCard position={[0, 0.5, 0]} scale={0.9} open={Math.sin(f * 0.02) * 0.3 + 0.3} />

      <Label
        text="GRAPHICS CARDS // PARALLEL MATRIX CALCULATIONS"
        size={0.34}
        color={C.green}
        bg="rgba(6, 20, 14, 0.9)"
        border={C.green}
        position={[0, 3.4, 0]}
      />
    </Stage>
  );
};

/** 3. ALEXNET (The 2012 ImageNet Breakthrough) */
export const AlexNetShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.015) * 5,
    2.5,
    10 - (f / dur) * 1.5,
  ];

  return (
    <Stage bg="#030610" fog={[8, 30]} keyColor={C.cyan} rimColor={C.green}>
      <Rig pos={camPos} look={[0, 1.4, 0]} />
      <Grid size={45} div={45} color="#183642" opacity={0.35} y={0} />
      <Dust count={200} spread={[20, 12, 20]} />

      {/* 2012 ImageNet Competition Comparison Bars */}
      {/* Traditional CV bar (26% error) */}
      <group position={[-2.2, 1.8, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 3.6, 1.2]} />
          <meshStandardMaterial color="#33141a" emissive={C.red} emissiveIntensity={0.3} />
        </mesh>
        <Label text="TRADITIONAL CV" size={0.24} color={C.red} position={[0, 2.2, 0.7]} />
        <Label text="26.2% ERROR" size={0.32} color={C.white} position={[0, 0, 0.7]} />
      </group>

      {/* AlexNet bar (15.3% error - massive victory) */}
      <group position={[2.2, 1.1, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 2.2, 1.2]} />
          <meshStandardMaterial color="#0c2e22" emissive={C.green} emissiveIntensity={0.5} />
        </mesh>
        <Label text="ALEXNET (2012)" size={0.24} color={C.green} position={[0, 1.5, 0.7]} />
        <Label text="15.3% ERROR" size={0.32} color={C.white} position={[0, 0, 0.7]} />
        <Glow color={C.green} scale={4} opacity={0.5} position={[0, 0, 0.7]} />
      </group>

      <Text3D
        text="ALEXNET · 2012"
        size={1.0}
        depth={0.25}
        color="#ffffff"
        emissive={C.green}
        emissiveIntensity={0.6}
        position={[0, 4.4, 0]}
        anim="drop"
        dur={20}
      />
    </Stage>
  );
};

/** 4. SCALE (Scaling Laws & Exponential Acceleration) */
export const ScaleShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.015, 11, 2.5);

  // Exponential cluster of interconnected computing nodes
  return (
    <Stage bg="#030514" fog={[8, 35]} keyColor={C.green} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.8, 0]} />
      <Dust count={300} spread={[24, 16, 24]} color={C.green} />

      {/* Server racks scaling upwards */}
      {new Array(12).fill(0).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const rad = 4.2;
        const x = Math.sin(angle) * rad;
        const z = Math.cos(angle) * rad;
        const h = 2 + (i / 12) * 3;
        return (
          <group key={i} position={[x, h / 2, z]}>
            <mesh>
              <boxGeometry args={[1.0, h, 0.8]} />
              <meshStandardMaterial
                color="#0e1d2b"
                emissive={C.green}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      })}

      <Label
        text="SCALING LAWS: MORE COMPUTE + DATA = SYSTEMATIC CAPABILITY LEAPS"
        size={0.34}
        color={C.green}
        bg="rgba(8, 24, 18, 0.9)"
        border={C.green}
        position={[0, 3.8, 0]}
      />
    </Stage>
  );
};
