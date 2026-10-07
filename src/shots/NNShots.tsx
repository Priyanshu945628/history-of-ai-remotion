import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {NeuralNet, netLayout} from '../three/objects';
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

/** 1. NNINTRO (Neural Network Inspiration & Overview) */
export const NNIntroShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.012, 10, 2.2);

  return (
    <Stage bg="#03040e" fog={[8, 30]} keyColor={C.violet} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0.6, 0]} />
      <Dust count={250} spread={[22, 14, 22]} color={C.violet} />

      <Text3D
        text="NEURAL"
        size={1.4}
        depth={0.35}
        color="#ffffff"
        emissive={C.violet}
        emissiveIntensity={0.6}
        position={[0, 1.4, 0]}
        anim="drop"
        dur={22}
      />
      <Text3D
        text="NETWORKS"
        size={1.3}
        depth={0.35}
        color={C.violet}
        emissive={C.cyan}
        emissiveIntensity={0.7}
        position={[0, -0.4, 0]}
        anim="drop"
        dur={26}
      />

      <Label
        text="INSPIRED BY BIOLOGICAL BRAIN CIRCUITS"
        size={0.34}
        color={C.cyan}
        bg="rgba(14, 10, 30, 0.9)"
        border={C.violet}
        position={[0, -1.8, 0]}
      />
    </Stage>
  );
};

/** 2. NNLAYERS (Input -> Hidden Layers -> Output Wave) */
export const NNLayersShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 6,
    1.8,
    10 - (f / dur) * 1.5,
  ];

  // 4-layer layout: Input (4), Hidden1 (6), Hidden2 (6), Output (2)
  const layout = useMemo(() => netLayout([4, 6, 6, 2], 2.4, 0.5), []);
  const wave = (f * 0.08) % 4.5; // looping forward activation wave

  return (
    <Stage bg="#030410" fog={[8, 32]} keyColor={C.violet} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Grid size={45} div={45} color="#1c1642" opacity={0.35} y={-2.2} />
      <Dust count={200} spread={[20, 12, 20]} />

      <NeuralNet
        layout={layout}
        wave={wave}
        color={C.violet}
        color2={C.cyan}
        baseGlow={0.35}
      />

      {/* Layer Classification Labels */}
      <Label text="INPUT" size={0.28} color={C.cyan} position={[-3.6, 2.0, 0]} />
      <Label text="HIDDEN LAYER 1" size={0.25} color={C.violet} position={[-1.2, 2.4, 0]} />
      <Label text="HIDDEN LAYER 2" size={0.25} color={C.violet} position={[1.2, 2.4, 0]} />
      <Label text="OUTPUT" size={0.28} color={C.green} position={[3.6, 2.0, 0]} />
    </Stage>
  );
};

/** 3. CATSDOGS (Classifying Cats vs Dogs Feature Vectors) */
export const CatsDogsShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [0, 1.2, 8.5 - (f / dur) * 1.2];

  const layout = useMemo(() => netLayout([3, 5, 2], 2.2, 0.45), []);
  const wave = (f * 0.06) % 3.5;

  return (
    <Stage bg="#03040e" fog={[7, 28]} keyColor={C.cyan} rimColor={C.amber}>
      <Rig pos={camPos} look={[0, 0.3, 0]} />
      <Dust count={200} spread={[18, 12, 18]} />

      <NeuralNet layout={layout} wave={wave} color={C.cyan} color2={C.amber} />

      {/* Output probability bars */}
      <group position={[3.8, 0, 0]}>
        <Label text="CAT: 88%" size={0.28} color={C.cyan} position={[0, 0.5, 0]} />
        <Label text="DOG: 12%" size={0.28} color={C.amber} position={[0, -0.5, 0]} />
      </group>

      <Label
        text="INITIAL ACCURACY: RAW PREDICTIONS MUST BE REFINED"
        size={0.32}
        color={C.amber}
        bg="rgba(10, 15, 28, 0.9)"
        border={C.amber}
        position={[0, 2.2, 0]}
      />
    </Stage>
  );
};

/** 4. TRAINING (The Learning Loop: Prediction -> Error -> Adjustment -> Repeat) */
export const TrainingShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.012, 9, 1.8);

  // Active training step based on frame
  const cycle = Math.floor(f / 25) % 4;
  const stepTitles = ['PREDICTION', 'ERROR CALCULATION', 'WEIGHT ADJUSTMENT', 'REPEAT'];
  const stepColors = [C.cyan, C.red, C.amber, C.green];

  const layout = useMemo(() => netLayout([4, 6, 4], 2.4, 0.5), []);
  const isBackprop = cycle === 2;

  return (
    <Stage bg="#04020a" fog={[7, 28]} keyColor={stepColors[cycle]} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Dust count={250} spread={[20, 12, 20]} color={stepColors[cycle]} />

      <NeuralNet
        layout={layout}
        wave={isBackprop ? 3 - ((f * 0.1) % 3) : (f * 0.1) % 3}
        jitter={isBackprop ? 1.0 : 0.2}
        errorTint={cycle === 1 ? 0.9 : 0}
        color={stepColors[cycle]}
      />

      <Label
        text={stepTitles[cycle]}
        size={0.48}
        color={stepColors[cycle]}
        bg="rgba(10, 5, 20, 0.9)"
        border={stepColors[cycle]}
        glow
        position={[0, 2.4, 0]}
      />
      <Label
        text="BACKPROPAGATION & GRADIENT DESCENT"
        size={0.28}
        color={C.grey}
        position={[0, -2.0, 0]}
      />
    </Stage>
  );
};

/** 5. DEEP (Deep Learning: Hundreds of Stacked Layers) */
export const DeepShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.015) * 6,
    2.5,
    12 - (f / dur) * 2,
  ];

  // Deep architecture: 8 layers
  const layout = useMemo(() => netLayout([3, 5, 6, 7, 7, 6, 5, 2], 1.4, 0.4), []);
  const wave = (f * 0.12) % 8.5;

  return (
    <Stage bg="#030310" fog={[8, 35]} keyColor={C.violet} rimColor={C.cyan}>
      <Rig pos={camPos} look={[0, 0, 0]} />
      <Grid size={50} div={50} color="#201844" opacity={0.3} y={-2.5} />
      <Dust count={300} spread={[25, 14, 25]} color={C.violet} />

      <NeuralNet
        layout={layout}
        wave={wave}
        color={C.violet}
        color2={C.cyan}
        baseGlow={0.4}
      />

      <Text3D
        text="DEEP LEARNING"
        size={1.1}
        depth={0.3}
        color="#ffffff"
        emissive={C.violet}
        emissiveIntensity={0.6}
        position={[0, 2.8, 0]}
        anim="drop"
        dur={20}
      />
    </Stage>
  );
};
