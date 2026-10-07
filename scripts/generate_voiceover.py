"""
Generate the voiceover for every script line with Microsoft Edge neural TTS
(edge-tts) and build the master timeline used by Remotion and the music generator.

Outputs
  public/audio/vo/NNN.mp3     one clip per narration line
  src/data/timeline.json      frame-accurate timeline (lines, shots, chapters, word timings)

Run:  python scripts/generate_voiceover.py
Clips are cached by text hash, so re-running only regenerates changed lines.
"""
import asyncio
import hashlib
import json
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "script.json"
VO_DIR = ROOT / "public" / "audio" / "vo"
CACHE = VO_DIR / "_cache.json"
TIMELINE = ROOT / "src" / "data" / "timeline.json"

FPS = 30
LEAD_IN = 1.2  # seconds of music / visuals before the first word


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)]
    )
    return float(out.strip())


async def synth(text: str, voice: str, rate: str, out_path: Path):
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open(out_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({
                    "w": chunk["text"],
                    "t": chunk["offset"] / 1e7,       # seconds
                    "d": chunk["duration"] / 1e7,
                })
    return words


async def main():
    data = json.loads(SCRIPT.read_text(encoding="utf-8"))
    voice, rate = data["voice"], data["rate"]
    default_pause = data["defaultPause"]
    VO_DIR.mkdir(parents=True, exist_ok=True)
    TIMELINE.parent.mkdir(parents=True, exist_ok=True)
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}

    lines, chapters, shots = [], [], []
    cursor = LEAD_IN
    idx = 0
    for ch in data["chapters"]:
        ch_start = cursor
        for ln in ch["lines"]:
            fname = f"{idx:03d}.mp3"
            out = VO_DIR / fname
            key = hashlib.sha1(f"{voice}|{rate}|{ln['t']}".encode()).hexdigest()
            if cache.get(fname, {}).get("key") == key and out.exists():
                words = cache[fname]["words"]
            else:
                print(f"[tts] {fname}: {ln['t'][:70]}")
                words = await synth(ln["t"], voice, rate, out)
                cache[fname] = {"key": key, "words": words}
            dur = probe_duration(out)
            if words:  # edge-tts pads clips with silence; time against the last spoken word
                dur = min(dur, words[-1]["t"] + words[-1]["d"] + 0.15)
            pause = ln.get("pause", default_pause) * data.get("pauseScale", 1.0)

            start_f = round(cursor * FPS)
            dur_f = max(1, round(dur * FPS))
            slot_f = round((cursor + dur + pause) * FPS) - start_f
            lines.append({
                "i": idx,
                "chapter": ch["id"],
                "shot": ln["s"],
                "text": ln["t"],
                "k": ln.get("k", ""),
                "p": ln.get("p", "bottom"),
                "file": f"audio/vo/{fname}",
                "startFrame": start_f,
                "durFrames": dur_f,
                "slotFrames": slot_f,
                "words": [{"w": w["w"], "f": round(w["t"] * FPS)} for w in words],
            })
            # group consecutive lines with the same shot id
            if shots and shots[-1]["shot"] == ln["s"] and shots[-1]["chapter"] == ch["id"]:
                shots[-1]["lines"].append(idx)
            else:
                shots.append({"shot": ln["s"], "chapter": ch["id"], "lines": [idx]})
            cursor += dur + pause
            idx += 1
        chapters.append({
            "id": ch["id"], "label": ch["label"], "title": ch["title"],
            "startFrame": round(ch_start * FPS), "endFrame": round(cursor * FPS),
        })

    by_i = {l["i"]: l for l in lines}
    for k, s in enumerate(shots):
        first = by_i[s["lines"][0]]
        last = by_i[s["lines"][-1]]
        s["startFrame"] = 0 if k == 0 else first["startFrame"]
        s["endFrame"] = last["startFrame"] + last["slotFrames"]
    # make shots contiguous (first starts at 0, each ends where next begins)
    for a, b in zip(shots, shots[1:]):
        a["endFrame"] = b["startFrame"]
    total = shots[-1]["endFrame"]
    for s in shots:
        s["durFrames"] = s["endFrame"] - s["startFrame"]

    CACHE.write_text(json.dumps(cache, indent=1))
    TIMELINE.write_text(json.dumps({
        "fps": FPS, "totalFrames": total,
        "chapters": chapters, "shots": shots, "lines": lines,
    }, indent=1), encoding="utf-8")
    print(f"Timeline: {len(lines)} lines, {len(shots)} shots, "
          f"{total} frames = {total / FPS:.1f}s")


if __name__ == "__main__":
    asyncio.run(main())
