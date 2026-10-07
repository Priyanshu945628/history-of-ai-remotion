import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {Monitor, drawPaper, drawScreen} from '../three/objects';
import {
  CanvasPlane,
  Dust,
  Glow,
  Grid,
  Label,
  Rig,
  Stage,
  Text3D,
  Tube,
  arc,
  orbit,
} from '../three/primitives';

/** 1. REWIND (Floating retrospective archival timeline) */
export const RewindShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.015) * 5,
    1.8,
    10 - (f / dur) * 4,
  ];

  const milestones = [
    {year: '2022', label: 'CHATGPT & MODERN LLMs', z: 3},
    {year: '2007', label: 'SMARTPHONES & MOBILE COMPUTE', z: 0},
    {year: '1980', label: 'HOME COMPUTERS', z: -3},
    {year: '1950', label: 'EARLY SCIENTIFIC QUESTIONS', z: -6},
  ];

  return (
    <Stage bg="#03040a" fog={[6, 25]} keyColor={C.amber} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 1.2, -2]} />
      <Grid size={40} div={40} color="#352614" opacity={0.35} y={-0.5} />
      <Dust count={200} spread={[18, 10, 20]} color={C.amber} />

      {milestones.map((m, i) => (
        <group key={i} position={[0, 1.2, m.z]}>
          <mesh position={[-3, 0, 0]}>
            <boxGeometry args={[1.8, 0.8, 0.1]} />
            <meshStandardMaterial
              color="#1a140c"
              emissive={C.amber}
              emissiveIntensity={0.4}
            />
          </mesh>
          <Label text={m.year} size={0.35} color={C.amber} position={[-3, 0, 0.08]} />
          <Label
            text={m.label}
            size={0.28}
            color={C.white}
            align="left"
            position={[-1.6, 0, 0.08]}
          />
        </group>
      ))}
    </Stage>
  );
};

/** 2. QUESTION ("Can a machine think?") */
export const QuestionShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [
    Math.sin(p * 0.5) * 3,
    1.2,
    9 - p * 2.5,
  ];

  return (
    <Stage bg="#04030a" fog={[8, 30]} keyColor={C.amber} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.8, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={C.amber} />

      <Text3D
        text="CAN A MACHINE"
        size={1.1}
        depth={0.3}
        color="#ffffff"
        emissive={C.amber}
        emissiveIntensity={0.6}
        position={[0, 1.8, 0]}
        anim="drop"
        dur={20}
      />
      <Text3D
        text="THINK?"
        size={1.5}
        depth={0.4}
        color={C.amber}
        emissive="#ff6b3d"
        emissiveIntensity={0.7}
        position={[0, 0.4, 0]}
        anim="drop"
        dur={24}
      />

      {/* Floating 1950s Scientific Inquiry Ring */}
      <mesh rotation={[Math.PI / 2 + f * 0.005, 0, f * 0.01]}>
        <torusGeometry args={[3.8, 0.025, 8, 80]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.6} />
      </mesh>
      <Label
        text="1940s — 1950s // THE PHILOSOPHICAL FOUNDATION"
        size={0.32}
        color={C.grey}
        bg="rgba(10, 8, 16, 0.8)"
        border={C.amber}
        position={[0, -1.2, 0]}
      />
    </Stage>
  );
};

/** 3. TURING (Alan Turing & The 1950 Landmark Paper) */
export const TuringShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [
    -1.5 + Math.sin(f * 0.01) * 2,
    1.8,
    7 - p * 1.5,
  ];

  return (
    <Stage bg="#03040c" fog={[6, 25]} keyColor={C.amber} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 1.6, 0]} />
      <Dust count={200} spread={[16, 10, 16]} color={C.amber} />

      {/* The 1950 Paper Floating Document */}
      <group position={[0, 1.6, 0]} rotation={[0, -0.2 + Math.sin(f * 0.015) * 0.05, 0]}>
        <CanvasPlane
          id="turing_paper_1950"
          px={[900, 1200]}
          width={3.2}
          position={[0, 0, 0]}
          draw={drawPaper({
            kicker: 'MIND · VOL. LIX. NO. 236 · OCTOBER 1950',
            title: 'COMPUTING MACHINERY AND INTELLIGENCE',
            authors: 'BY A. M. TURING',
            sub: '1. The Imitation Game',
            firstLine:
              'I propose to consider the question, "Can machines think?"',
            bodyLines: 12,
          })}
        />
        <Glow color={C.amber} scale={5.5} opacity={0.4} position={[0, 0, -0.2]} />
      </group>

      <Label
        text="ALAN TURING // 1912 – 1954"
        size={0.35}
        color={C.amber}
        bg="rgba(10, 14, 25, 0.9)"
        border={C.amber}
        position={[0, -0.7, 0.5]}
      />
    </Stage>
  );
};

/** 4. TURING TEST (The Imitation Game 3D Architecture) */
export const TuringTestShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.012) * 5,
    2.2,
    11 - (f / dur) * 2,
  ];

  // Animated data flow pulses between Judge and Terminals
  const signalProgress = (f * 0.03) % 1;

  return (
    <Stage bg="#02040c" fog={[8, 30]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 1.5, 0]} />
      <Grid size={45} div={45} color="#152b47" opacity={0.35} y={-0.2} />
      <Dust count={250} spread={[22, 12, 22]} />

      {/* Center Dividing Acoustic/Screen Barrier */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 6]} />
        <meshStandardMaterial
          color="#0b1626"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.24, 5.04, 6.04]} />
        <meshBasicMaterial color={C.cyan} wireframe transparent opacity={0.35} />
      </mesh>

      {/* Terminal A: Human Responder */}
      <Monitor
        id="turing_screen_human"
        position={[-3.5, 1.6, -1]}
        rotation={[0, 0.35, 0]}
        glow={C.green}
        draw={drawScreen(
          'RESPONDENT A',
          ['IDENTITY: HUMAN', 'COMMUNICATION: TEXT ONLY', 'STATUS: ACTIVE'],
          C.green,
          'human'
        )}
      />

      {/* Terminal B: Machine / AI */}
      <Monitor
        id="turing_screen_machine"
        position={[3.5, 1.6, -1]}
        rotation={[0, -0.35, 0]}
        glow={C.magenta}
        draw={drawScreen(
          'RESPONDENT B',
          ['IDENTITY: MACHINE', 'SIMULATING: HUMAN DIALOGUE', 'STATUS: ACTIVE'],
          C.magenta,
          'machine'
        )}
      />

      {/* Foreground: The Judge Terminal */}
      <Monitor
        id="turing_screen_judge"
        position={[0, 1.2, 3.2]}
        rotation={[0, Math.PI, 0]}
        glow={C.amber}
        draw={drawScreen(
          'HUMAN INTERROGATOR',
          ['CANNOT SEE OR HEAR RESPONDENTS', 'WHICH ONE IS INTELLIGENT?'],
          C.amber,
          'judge'
        )}
      />

      {/* Animated communication arc tubes */}
      <Tube
        curve={arc([0, 1.8, 3.2], [-3.5, 1.8, -1], 2.2)}
        color={C.green}
        progress={signalProgress}
        radius={0.035}
      />
      <Tube
        curve={arc([0, 1.8, 3.2], [3.5, 1.8, -1], 2.2)}
        color={C.magenta}
        progress={signalProgress}
        radius={0.035}
      />

      <Label
        text="THE TURING TEST (1950)"
        size={0.42}
        color={C.amber}
        bg="rgba(5, 10, 22, 0.9)"
        border={C.amber}
        position={[0, 4.4, 0]}
      />
    </Stage>
  );
};

/** 5. FOUNDATION (Emergence of the foundational pillars of AI) */
export const FoundationShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 6,
    3.0,
    11 - (f / dur) * 2,
  ];

  const pillars = [
    {x: -4, label: 'COMPUTABILITY', col: C.cyan},
    {x: -1.3, label: 'SYMBOLIC LOGIC', col: C.amber},
    {x: 1.3, label: 'STATISTICAL PATTERNS', col: C.violet},
    {x: 4, label: 'INFORMATION THEORY', col: C.green},
  ];

  return (
    <Stage bg="#030510" fog={[8, 32]} keyColor={C.amber} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 2.2, 0]} />
      <Grid size={50} div={50} color="#182c47" opacity={0.3} y={0} />
      <Dust count={260} spread={[24, 14, 24]} color={C.amber} />

      {/* Foundation Pedestal */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[12, 0.5, 6]} />
        <meshStandardMaterial color="#0c1626" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Four Pillars */}
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 2.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.65, 3.8, 16]} />
            <meshStandardMaterial
              color="#131e33"
              emissive={p.col}
              emissiveIntensity={0.3}
              metalness={0.5}
            />
          </mesh>
          <mesh position={[0, 2.0, 0]}>
            <boxGeometry args={[1.5, 0.25, 1.5]} />
            <meshStandardMaterial color="#1a2742" metalness={0.6} />
          </mesh>
          <Label
            text={p.label}
            size={0.24}
            color={p.col}
            bg="rgba(8, 12, 24, 0.9)"
            position={[0, 1.0, 0.8]}
          />
        </group>
      ))}

      {/* Header Architrave */}
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[12, 0.6, 2]} />
        <meshStandardMaterial color="#1a2742" emissive={C.amber} emissiveIntensity={0.2} />
      </mesh>
      <Label
        text="THE FOUNDATION OF ARTIFICIAL INTELLIGENCE"
        size={0.38}
        color={C.amber}
        position={[0, 4.6, 1.05]}
      />
    </Stage>
  );
};
