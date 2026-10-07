import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {CanvasPlane, Dust, Glow, Grid, Label, Rig, Stage, Starfield, Text3D, Tube, arc, orbit} from '../three/primitives';
import {drawPaper, drawTextBlock} from '../three/objects';

/** 1. PAPER2017 ("Attention Is All You Need") */
export const Paper2017Shot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 3,
    1.8,
    7.5 - p * 1.5,
  ];

  return (
    <Stage bg="#04020c" fog={[6, 25]} keyColor={C.magenta} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 1.5, 0]} />
      <Dust count={250} spread={[18, 12, 18]} color={C.magenta} />

      {/* Floating 2017 Landmark Paper */}
      <group position={[0, 1.6, 0]} rotation={[0, Math.sin(f * 0.015) * 0.06, 0]}>
        <CanvasPlane
          id="transformer_paper_2017"
          px={[900, 1200]}
          width={3.2}
          draw={drawPaper({
            kicker: 'NIPS 2017 · GOOGLE BRAIN & GOOGLE RESEARCH',
            title: 'ATTENTION IS ALL YOU NEED',
            authors: 'VASWANI ET AL.',
            sub: 'The Transformer Model Architecture',
            firstLine:
              'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
            bodyLines: 12,
            dark: true,
          })}
        />
        <Glow color={C.magenta} scale={5.5} opacity={0.4} position={[0, 0, -0.2]} />
      </group>

      <Label
        text="JUNE 2017 // REVOLUTIONIZING NATURAL LANGUAGE PROCESSING"
        size={0.32}
        color={C.magenta}
        bg="rgba(18, 8, 28, 0.9)"
        border={C.magenta}
        position={[0, -0.7, 0.5]}
      />
    </Stage>
  );
};

/** 2. TRANSFORMER (The Transformer Architecture) */
export const TransformerShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 1.2, 11 - p * 2.2];

  return (
    <Stage bg="#030312" fog={[8, 30]} keyColor={C.magenta} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.8, 0]} />
      <Starfield count={1600} radius={45} color="#d49aff" />
      <Dust count={300} spread={[24, 14, 24]} color={C.magenta} />

      <Text3D
        text="THE TRANSFORMER"
        size={1.3}
        depth={0.35}
        color="#ffffff"
        emissive={C.magenta}
        emissiveIntensity={0.6}
        position={[0, 2.2, 0]}
        anim="drop"
        dur={22}
      />

      {/* 3D Stack of Encoder / Decoder / Attention blocks */}
      <group position={[0, -0.2, 0]}>
        {[-1.8, 0, 1.8].map((y, k) => (
          <group key={k} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[4.2, 0.7, 1.5]} />
              <meshStandardMaterial
                color="#1b0e33"
                emissive={k === 1 ? C.magenta : C.cyan}
                emissiveIntensity={0.4}
                metalness={0.7}
              />
            </mesh>
            <Label
              text={k === 0 ? 'FEED FORWARD NETWORK' : k === 1 ? 'MULTI-HEAD SELF-ATTENTION' : 'POSITIONAL ENCODING'}
              size={0.24}
              color={C.white}
              position={[0, 0, 0.8]}
            />
          </group>
        ))}
      </group>
    </Stage>
  );
};

/** 3. ATTENTION (Dynamic Self-Attention Laser Beams Linking Sentence Tokens) */
export const AttentionShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 4,
    2.2,
    9 - (f / dur) * 1.5,
  ];

  // Sentence tokens: "The animal didn't cross the street because it was tired"
  const tokens = [
    {word: 'The', x: -4.5},
    {word: 'animal', x: -3.2, highlight: true},
    {word: "didn't", x: -1.8},
    {word: 'cross', x: -0.6},
    {word: 'the', x: 0.5},
    {word: 'street', x: 1.6},
    {word: 'because', x: 2.8},
    {word: 'it', x: 3.9, highlight: true},
  ];

  // Attention laser beam pulse between "it" and "animal"
  const laserP = (f * 0.05) % 1;

  return (
    <Stage bg="#030310" fog={[7, 28]} keyColor={C.magenta} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 1.0, 0]} />
      <Dust count={200} spread={[20, 12, 20]} color={C.magenta} />

      {/* Token Boxes in 3D Space */}
      <group position={[0, 0.8, 0]}>
        {tokens.map((t, i) => (
          <group key={i} position={[t.x, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.0, 0.6, 0.6]} />
              <meshStandardMaterial
                color={t.highlight ? '#330a2a' : '#0e1424'}
                emissive={t.highlight ? C.magenta : C.cyan}
                emissiveIntensity={t.highlight ? 0.7 : 0.2}
              />
            </mesh>
            <Label text={t.word} size={0.24} color={C.white} position={[0, 0, 0.35]} />
          </group>
        ))}

        {/* 3D Attention Beam from "it" to "animal" */}
        <Tube
          curve={arc([3.9, 0.3, 0], [-3.2, 0.3, 0], 2.2)}
          color={C.magenta}
          progress={laserP}
          radius={0.045}
        />
        <Label
          text="ATTENTION WEIGHT: 0.94 -> 'it' refers to 'animal'"
          size={0.28}
          color={C.magenta}
          bg="rgba(24, 6, 28, 0.9)"
          border={C.magenta}
          position={[0.3, 2.5, 0]}
        />
      </group>

      <Label
        text="SELF-ATTENTION: UNDERSTANDING CONTEXT ACROSS ENTIRE SEQUENCES"
        size={0.34}
        color={C.cyan}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.cyan}
        position={[0, -0.6, 0]}
      />
    </Stage>
  );
};

/** 4. LLM (Enormous Text Ingestion Tunnel & Statistical Language Patterns) */
export const LLMShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const z = 20 - (f / dur) * 30;

  return (
    <Stage bg="#02030d" fog={[5, 35]} keyColor={C.magenta} rimColor={C.cyan}>
      <Rig pos={[0, 0, z + 8]} look={[0, 0, z - 10]} roll={f * 0.005} />
      <Starfield count={1500} radius={45} />

      {/* Knowledge tunnel constructed of floating text code blocks */}
      {new Array(16).fill(0).map((_, i) => {
        const blkZ = 20 - i * 3.5;
        return (
          <group key={i} position={[0, 0, blkZ]}>
            <CanvasPlane
              id={`text_block_l_${i}`}
              px={[700, 360]}
              width={3.6}
              position={[-3.2, 0, 0]}
              rotation={[0, 0.4, 0]}
              draw={drawTextBlock(i * 2, C.magenta)}
            />
            <CanvasPlane
              id={`text_block_r_${i}`}
              px={[700, 360]}
              width={3.6}
              position={[3.2, 0, 0]}
              rotation={[0, -0.4, 0]}
              draw={drawTextBlock(i * 2 + 1, C.cyan)}
            />
          </group>
        );
      })}

      <Label
        text="LARGE LANGUAGE MODELS // BILLIONS OF PARAMETERS"
        size={0.38}
        color={C.magenta}
        bg="rgba(20, 8, 30, 0.9)"
        border={C.magenta}
        glow
        position={[0, 0, z - 2]}
      />
    </Stage>
  );
};

/** 5. CAPABILITIES (Emergent Reasoning, Code, Translation, Analysis) */
export const CapabilitiesShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.015, 10, 2.2);

  const capabilities = [
    {label: 'ESSAY & WRITING', col: C.cyan, r: 4.0, phase: 0},
    {label: 'CODE GENERATION', col: C.green, r: 4.5, phase: 1.25},
    {label: 'TRANSLATE LANGUAGES', col: C.amber, r: 4.0, phase: 2.5},
    {label: 'SUMMARIZE DATA', col: C.violet, r: 4.5, phase: 3.75},
    {label: 'COMPLEX REASONING', col: C.magenta, r: 4.2, phase: 5.0},
  ];

  return (
    <Stage bg="#030310" fog={[8, 35]} keyColor={C.magenta} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Dust count={300} spread={[24, 14, 24]} color={C.magenta} />

      {/* Central LLM Synapse Core */}
      <mesh>
        <octahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          color="#150a2e"
          emissive={C.magenta}
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      <Glow color={C.magenta} scale={4.5} opacity={0.5} />

      {/* Orbiting Emergent Capability Monoliths */}
      {capabilities.map((c, i) => {
        const th = f * 0.018 + c.phase;
        const x = Math.sin(th) * c.r;
        const z = Math.cos(th) * c.r;
        const y = Math.sin(f * 0.03 + i) * 0.8;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[1.6, 0.7, 0.3]} />
              <meshStandardMaterial
                color="#0f162b"
                emissive={c.col}
                emissiveIntensity={0.4}
              />
            </mesh>
            <Label text={c.label} size={0.22} color={C.white} position={[0, 0, 0.2]} />
          </group>
        );
      })}

      <Label
        text="SURPRISING CAPABILITIES EMERGE FROM NEXT-TOKEN PREDICTION"
        size={0.34}
        color={C.magenta}
        bg="rgba(20, 6, 28, 0.9)"
        border={C.magenta}
        position={[0, 3.2, 0]}
      />
    </Stage>
  );
};
