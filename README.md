# The History of AI — 3D Remotion Video

A 3D motion-graphics documentary video about the history of Artificial Intelligence, built with [Remotion](https://www.remotion.dev), [Three.js](https://threejs.org), and `@remotion/three`.

## Features
- **Full 3D Visuals**: Procedural 3D scenes for every era (1944 mainframe racks, 1950 Turing Test architecture, 1956 Dartmouth hall, neural network activation flows, GPU cards, transformer attention beams, holographic conversational UI, and cosmic finale).
- **Zero Emojis**: Clean, academic cyber-minimalist motion graphics.
- **Word-Level Kinetic Typography**: Word-by-word spring animations with glowing colored keyword accents synchronized to speech.
- **Synchronized Voiceover**: 119 script lines synthesized with Microsoft Edge Neural TTS.
- **Procedural Electronic Score**: Original score in D minor (90 BPM) with dynamic risers, chapter downbeat impacts, and voice ducking.
- **Automated Cloud Rendering**: GitHub Actions workflow renders the complete video and uploads the final `.mp4` as an artifact.

## Local Development

```bash
# Install dependencies
npm install

# Start Remotion Studio preview
npm run dev
# -> Opens http://localhost:3000
```

## GitHub Actions Render
Pushes to `main` or manual triggers via **Actions -> Render Video** will automatically render the video on Ubuntu runners and attach the final `history-of-ai-final-video` artifact for direct download.
