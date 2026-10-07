import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {C, MONO, easeOut, interpolate, prog} from '../theme';
import type {ShotProps} from '../timeline';
import {Globe} from '../three/objects';
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

/** 1. RELEASE (November 2022 Milestone) */
export const ReleaseShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur);
  const camPos: [number, number, number] = [0, 0.8, 11 - p * 2.2];

  return (
    <Stage bg="#02040d" fog={[8, 30]} keyColor={C.cyan} rimColor={C.green}>
      <Rig pos={camPos} look={[0, 0.5, 0]} />
      <Starfield count={1800} radius={45} />
      <Dust count={250} spread={[22, 14, 22]} color={C.cyan} />

      <Text3D
        text="NOVEMBER 2022"
        size={1.3}
        depth={0.35}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 1.4, 0]}
        anim="drop"
        dur={20}
      />
      <Text3D
        text="CHATGPT"
        size={1.5}
        depth={0.4}
        color={C.cyan}
        emissive={C.green}
        emissiveIntensity={0.7}
        position={[0, -0.4, 0]}
        anim="drop"
        dur={24}
      />

      <Label
        text="AI ESCAPES THE LAB INTO PUBLIC CONSCIOUSNESS"
        size={0.34}
        color={C.amber}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.amber}
        position={[0, -2.0, 0]}
      />
    </Stage>
  );
};

/** 2. CHATUI (Floating 3D Holographic Conversational Interface) */
export const ChatUIShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos = orbit(f * 0.01, 8.5, 1.6);

  // Typewriter streaming response on canvas
  const fullText =
    'Artificial intelligence is the simulation of human intelligence processes by computer systems, learning from data patterns.';
  const charCount = Math.min(fullText.length, Math.floor(f * 1.5));
  const currentText = fullText.slice(0, charCount);

  return (
    <Stage bg="#030514" fog={[7, 28]} keyColor={C.cyan} rimColor={C.violet}>
      <Rig pos={camPos} look={[0, 0.8, 0]} />
      <Grid size={40} div={40} color="#152745" opacity={0.35} y={-1.5} />
      <Dust count={200} spread={[18, 12, 18]} />

      {/* Floating 3D Browser / Chat Card */}
      <group position={[0, 0.8, 0]}>
        <CanvasPlane
          id={`chat_ui_${f}`}
          px={[900, 560]}
          width={4.8}
          draw={(ctx, w, h) => {
            ctx.fillStyle = '#0a101f';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, w - 20, h - 20);

            // Window Header Bar
            ctx.fillStyle = '#111a30';
            ctx.fillRect(10, 10, w - 20, 50);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 22px monospace';
            ctx.fillText('AI CONVERSATION INTERFACE // CHATGPT', 35, 42);

            // User Prompt Bubble
            ctx.fillStyle = '#1e293b';
            roundRect(ctx, 40, 90, w - 80, 80, 12);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('USER:', 60, 120);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '22px monospace';
            ctx.fillText('Explain what artificial intelligence really is.', 60, 150);

            // AI Response Bubble
            ctx.fillStyle = '#0f172a';
            roundRect(ctx, 40, 200, w - 80, 220, 12);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('AI ASSISTANT:', 60, 235);
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '22px monospace';

            // Word wrap
            const words = currentText.split(' ');
            let line = '';
            let lineY = 275;
            words.forEach((wd) => {
              const test = line ? `${line} ${wd}` : wd;
              if (ctx.measureText(test).width > w - 160) {
                ctx.fillText(line, 60, lineY);
                lineY += 34;
                line = wd;
              } else {
                line = test;
              }
            });
            ctx.fillText(line, 60, lineY);
          }}
        />
        <Glow color={C.cyan} scale={5.5} opacity={0.35} position={[0, 0, -0.2]} />
      </group>

      <Label
        text="INSTANT ACCESSIBILITY FOR HUNDREDS OF MILLIONS"
        size={0.32}
        color={C.cyan}
        bg="rgba(10, 16, 32, 0.9)"
        border={C.cyan}
        position={[0, -1.2, 0]}
      />
    </Stage>
  );
};

/** 3. BOOM (The Worldwide Generative AI Boom) */
export const BoomShot: React.FC<ShotProps> = ({dur}) => {
  const f = useCurrentFrame();
  const camPos: [number, number, number] = [
    Math.sin(f * 0.01) * 6,
    2.5,
    11 - (f / dur) * 2,
  ];

  return (
    <Stage bg="#02030a" fog={[8, 35]} keyColor={C.cyan} rimColor={C.magenta}>
      <Rig pos={camPos} look={[0, 0.6, 0]} />
      <Starfield count={2000} radius={50} />
      <Dust count={300} spread={[24, 14, 24]} color={C.cyan} />

      {/* Rotating illuminated globe with active data nodes */}
      <Globe r={2.8} color={C.cyan} rotY={f * 0.01} position={[0, 0.6, 0]} />

      <Text3D
        text="THE AI BOOM"
        size={1.3}
        depth={0.35}
        color="#ffffff"
        emissive={C.cyan}
        emissiveIntensity={0.6}
        position={[0, 3.8, 0]}
        anim="drop"
        dur={22}
      />

      <Label
        text="CODING · ART · AUDIO · VIDEO · MEDICINE · SCIENCE"
        size={0.32}
        color={C.amber}
        bg="rgba(10, 15, 30, 0.9)"
        border={C.amber}
        position={[0, -2.6, 0]}
      />
    </Stage>
  );
};
