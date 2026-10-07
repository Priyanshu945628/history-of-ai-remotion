import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {CampusHall, ChessPiece} from '../three/objects';
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

/** 1. DARTMOUTH (1956 Dartmouth College Summer Research Project) */
export const DartmouthShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [
    Math.sin(p * 0.4) * 6,
    3.2,
    13 - p * 3,
  ];

  return (
    <Stage bg="#04060e" fog={[10, 35]} keyColor={C.amber} rimColor="#64b5f6">
      <Rig pos={camPos} look={[0, 2.5, 0]} />
      <Dust count={250} spread={[24, 12, 20]} color={C.amber} />

      {/* 3D Dartmouth Hall Architecture */}
      <CampusHall position={[0, 0, -2]} scale={1.2} lit={1} />

      {/* Floating 1956 Workshop Plaque */}
      <group position={[0, 4.8, 2]}>
        <Label
          text="DARTMOUTH COLLEGE // HANOVER, NEW HAMPSHIRE"
          size={0.28}
          color={C.amber}
          bg="rgba(10, 15, 30, 0.9)"
          border={C.amber}
        />
        <Label
          text="1956 SUMMER RESEARCH PROJECT ON ARTIFICIAL INTELLIGENCE"
          size={0.34}
          color={C.white}
          position={[0, -0.5, 0]}
        />
      </group>
    </Stage>
  );
};

/** 2. AITERM (The Birth of the Term: "ARTIFICIAL INTELLIGENCE") */
export const AITermShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 0.8, 11 - p * 2.2];

  return (
    <Stage bg="#03040c" fog={[6, 30]} keyColor={C.amber} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.4, 0]} />
      <Dust count={300} spread={[25, 14, 25]} color={C.amber} />

      <Text3D
        text="ARTIFICIAL"
        size={1.4}
        depth={0.35}
        color="#ffffff"
        emissive={C.amber}
        emissiveIntensity={0.6}
        position={[0, 1.4, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="INTELLIGENCE"
        size={1.3}
        depth={0.35}
        color={C.amber}
        emissive="#ff5e36"
        emissiveIntensity={0.7}
        position={[0, -0.4, 0]}
        anim="drop"
        dur={26}
      />

      <Label
        text="COINED IN 1956 BY JOHN McCARTHY & COLLEAGUES"
        size={0.32}
        color={C.grey}
        bg="rgba(10, 12, 22, 0.9)"
        border={C.amber}
        position={[0, -1.8, 0]}
      />
    </Stage>
  );
};

/** 3. SIMULATE ("What if intelligence could be simulated?") */
export const SimulateShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.012, 10, 2.5);

  return (
    <Stage bg="#030512" fog={[8, 30]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 0.8, 0]} />
      <Dust count={250} spread={[20, 12, 20]} />

      {/* Symbolic simulation sphere */}
      <group position={[0, 1.0, 0]}>
        <mesh rotation={[f * 0.01, f * 0.015, 0]}>
          <icosahedronGeometry args={[2.0, 1]} />
          <meshBasicMaterial color={C.cyan} wireframe transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[-f * 0.01, 0, f * 0.01]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial
            color="#0f2038"
            emissive={C.amber}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
        <Glow color={C.cyan} scale={5} opacity={0.4} />
      </group>

      <Label
        text="PREMISE: EVERY ASPECT OF LEARNING CAN BE PRECISELY DESCRIBED"
        size={0.32}
        color={C.amber}
        bg="rgba(8, 12, 24, 0.9)"
        border={C.amber}
        position={[0, 3.2, 0]}
      />
    </Stage>
  );
};

/** 4. SYMBOLIC (Early AI: Mathematics, Logic, Chess, Theorem Proving) */
export const SymbolicShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.015) * 5,
    3.0,
    9 - (f / dur) * 2,
  ];

  return (
    <Stage bg="#03040c" fog={[7, 28]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 1.2, 0]} />
      <Grid size={40} div={40} color="#152d4c" opacity={0.4} y={-0.1} />
      <Dust count={200} spread={[18, 10, 18]} />

      {/* 3D Chess Board & Pieces */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[5, 0.1, 5]} />
          <meshStandardMaterial color="#0c1729" metalness={0.8} roughness={0.2} />
        </mesh>
        <ChessPiece type="king" color="#3ee6ff" position={[-1.2, 0, -1]} emissive="#104060" />
        <ChessPiece type="rook" color="#ffffff" position={[1.2, 0, -1]} emissive="#333333" />
        <ChessPiece type="pawn" color="#ffb547" position={[-0.4, 0, 0.8]} emissive="#603010" />
        <ChessPiece type="pawn" color="#3ee6ff" position={[0.6, 0, 0.5]} emissive="#104060" />
      </group>

      {/* Floating Logic Trees & Mathematical Symbols */}
      <Label
        text="LOGIC THEORIST (1956) · CHESS ENGINES · SYMBOL MANIPULATION"
        size={0.3}
        color={C.cyan}
        bg="rgba(10, 16, 32, 0.9)"
        border={C.cyan}
        position={[0, 3.4, 0]}
      />
    </Stage>
  );
};

/** 5. RULES (The Huge Problem: Hardcoded Rules Cannot Learn) */
export const RulesShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [
    Math.sin(f * 0.02) * 3,
    1.8,
    8 - p * 2,
  ];

  const ruleLines = [
    'IF (has_whiskers == TRUE) AND (four_legs == TRUE):',
    '    THEN maybe_cat()',
    'IF (color == orange) AND (sitting_upright == TRUE):',
    '    THEN execute_classify()',
    'ELSE: ERROR // UNKNOWN PATTERN',
  ];

  return (
    <Stage bg="#080306" fog={[6, 25]} keyColor={C.red} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 1.2, 0]} />
      <Grid size={40} div={40} color="#45121c" opacity={0.4} y={-0.2} />
      <Dust count={250} spread={[18, 10, 18]} color={C.red} />

      {/* Broken / Rigid Rule Wall */}
      <group position={[0, 1.2, 0]}>
        <CanvasPlane
          id="rules_code_wall"
          px={[1024, 600]}
          width={4.2}
          draw={(ctx, w, h) => {
            ctx.fillStyle = '#14050a';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#ff4d5e';
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, w - 20, h - 20);

            ctx.fillStyle = '#ff4d5e';
            ctx.font = 'bold 36px monospace';
            ctx.fillText('MANUALLY ENCODED RULES (BRITTLE)', 40, 70);

            ctx.font = '28px monospace';
            ctx.fillStyle = '#ffcbd2';
            ruleLines.forEach((line, idx) => {
              ctx.fillText(line, 40, 150 + idx * 60);
            });
          }}
        />
        <Glow color={C.red} scale={5} opacity={0.3} />
      </group>

      <Label
        text="FAILURE TO SCALE: REALITY HAS INFINITE EXCEPTIONS"
        size={0.34}
        color={C.red}
        bg="rgba(30, 8, 12, 0.9)"
        border={C.red}
        position={[0, -0.6, 0.5]}
      />
    </Stage>
  );
};
