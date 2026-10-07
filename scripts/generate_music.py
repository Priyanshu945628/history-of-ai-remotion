"""
Procedurally compose an original, royalty-free cinematic electronic score that is
locked to the video's chapter timeline (src/data/timeline.json).

Musical design (D minor, 90 BPM, progression Dm - Bb - F - C):
  pad      detuned saw pad, brightness rises with intensity
  sub      sine sub-bass on chord roots, sidechained to the kick
  pulse    8th-note low pluck (tension / "machine" feel)
  keys     soft vintage electric-piano motif (1940s-50s chapters)
  arp      16th-note plucked arpeggio with ping-pong delay (machine learning onward)
  drums    kick / hats / snare that build through the deep learning + ChatGPT boom
  shimmer  high glassy bells (transformers, ending)
  fx       riser into every chapter + sub impact on every chapter downbeat

Output: public/audio/music.mp3
Run:    python scripts/generate_music.py   (after generate_voiceover.py)
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, oaconvolve, sawtooth, sosfilt

ROOT = Path(__file__).resolve().parent.parent
TIMELINE = ROOT / "src" / "data" / "timeline.json"
OUT_WAV = ROOT / "scripts" / "_music.wav"
OUT_MP3 = ROOT / "public" / "audio" / "music.mp3"

SR = 44100
BPM = 90
BEAT = 60 / BPM
rng = np.random.default_rng(7)

# ----------------------------------------------------------------------------- timeline
tl = json.loads(TIMELINE.read_text(encoding="utf-8"))
FPS = tl["fps"]
TOTAL = tl["totalFrames"] / FPS + 1.0
N = int(TOTAL * SR)
t_all = np.arange(N, dtype=np.float32) / SR
chapters = [(c["id"], c["startFrame"] / FPS) for c in tl["chapters"]]

# layer intensity per chapter (0..1)
LEVELS = {
    #        pad   sub  pulse keys  arp  kick  hats snare shimmer
    "hook":  (0.85, 0.6, 0.7, 0.0, 0.0, 0.25, 0.0, 0.0, 0.35),
    "idea":  (0.65, 0.4, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.2),
    "birth": (0.70, 0.6, 0.4, 0.6, 0.25, 0.0, 0.2, 0.0, 0.2),
    "ml":    (0.70, 0.7, 0.3, 0.2, 0.7, 0.45, 0.45, 0.0, 0.2),
    "nn":    (0.75, 0.8, 0.2, 0.0, 0.8, 0.6, 0.6, 0.3, 0.3),
    "dl":    (0.90, 1.0, 0.3, 0.0, 0.9, 1.0, 0.8, 0.7, 0.3),
    "tf":    (0.90, 1.0, 0.2, 0.0, 0.9, 1.0, 0.9, 0.8, 0.8),
    "chat":  (1.00, 1.0, 0.3, 0.0, 1.0, 1.0, 1.0, 1.0, 0.6),
    "why":   (0.80, 0.7, 0.8, 0.0, 0.4, 0.3, 0.3, 0.0, 0.4),
    "end":   (1.00, 0.6, 0.0, 0.3, 0.3, 0.0, 0.0, 0.0, 0.9),
}
LAYERS = ["pad", "sub", "pulse", "keys", "arp", "kick", "hats", "snare", "shimmer"]


def envelope(layer: str, ramp: float = 2.5) -> np.ndarray:
    """Per-sample intensity curve for a layer, ramping between chapter values."""
    li = LAYERS.index(layer)
    ctl_rate = 100
    n = int(TOTAL * ctl_rate)
    step = np.zeros(n, dtype=np.float32)
    for k, (cid, start) in enumerate(chapters):
        end = chapters[k + 1][1] if k + 1 < len(chapters) else TOTAL
        step[int(start * ctl_rate):int(end * ctl_rate)] = LEVELS[cid][li]
    step[: int(chapters[0][1] * ctl_rate)] = LEVELS[chapters[0][0]][li]
    w = int(ramp * ctl_rate)
    kernel = np.ones(w, dtype=np.float32) / w
    smooth = np.convolve(np.pad(step, (w, w), mode="edge"), kernel, mode="same")[w:-w]
    return np.interp(t_all, np.arange(n) / ctl_rate, smooth).astype(np.float32)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# voice-led chords and bass roots
CHORDS = [
    ([50, 53, 57, 62], 38),  # Dm
    ([50, 53, 58, 62], 34),  # Bb
    ([48, 53, 57, 60], 41),  # F
    ([48, 52, 55, 60], 36),  # C
]
CHORD_LEN = 8 * BEAT


def chord_at(time):
    return CHORDS[int(time // CHORD_LEN) % len(CHORDS)]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x).astype(np.float32)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x).astype(np.float32)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x).astype(np.float32)


def add(buf, sig, start_s):
    s = int(start_s * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]


def pluck(freq, dur, bright=8, decay=5.0):
    t = np.arange(int(dur * SR), dtype=np.float32) / SR
    out = np.zeros_like(t)
    for h in range(1, bright + 1):
        if freq * h > 16000:
            break
        out += (1 / h) * np.sin(2 * np.pi * freq * h * t) * np.exp(-t * (decay + h * 2.2))
    att = np.minimum(1, t / 0.004)
    return (out * att).astype(np.float32)


# ----------------------------------------------------------------------------- layers
print("pad...")
padL = np.zeros(N, np.float32)
padR = np.zeros(N, np.float32)
n_chords = int(np.ceil(TOTAL / CHORD_LEN))
xf = int(0.6 * SR)  # chord crossfade
for c in range(n_chords):
    notes, _ = CHORDS[c % 4]
    s0 = max(0, int(c * CHORD_LEN * SR) - xf)
    s1 = min(N, int((c + 1) * CHORD_LEN * SR) + xf)
    tt = t_all[s0:s1]
    seg_l = np.zeros_like(tt)
    seg_r = np.zeros_like(tt)
    for m in notes + [notes[0] - 12]:
        f = mtof(m)
        for det, pan in ((-9, 0.85), (0, 0.5), (9, 0.15)):
            fd = f * 2 ** (det / 1200)
            ph = rng.uniform(0, 1)
            w = sawtooth(2 * np.pi * (fd * tt + ph)).astype(np.float32)
            seg_l += w * pan
            seg_r += w * (1 - pan)
    win = np.ones_like(tt)
    ramp = np.linspace(0, 1, xf, dtype=np.float32)
    win[:xf] = ramp
    win[-xf:] = ramp[::-1]
    padL[s0:s1] += seg_l * win
    padR[s0:s1] += seg_r * win
pad_env = envelope("pad")
dark_L, dark_R = lp(padL, 500), lp(padR, 500)
bright_L, bright_R = lp(padL, 2400), lp(padR, 2400)
mix = np.clip((pad_env - 0.6) / 0.4, 0, 1)
# slow breathing filter movement
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * t_all / (CHORD_LEN * 2))
mix = np.clip(mix * (0.7 + 0.3 * lfo), 0, 1)
padL = (dark_L * (1 - mix) + bright_L * mix) * pad_env * 0.045
padR = (dark_R * (1 - mix) + bright_R * mix) * pad_env * 0.045
del dark_L, dark_R, bright_L, bright_R

print("drums...")
kick_env, hats_env, snare_env = envelope("kick"), envelope("hats"), envelope("snare")
kick = np.zeros(N, np.float32)
hats = np.zeros(N, np.float32)
snare = np.zeros(N, np.float32)
pump = np.ones(N, np.float32)
kt = np.arange(int(0.45 * SR), dtype=np.float32) / SR
kick_one = np.sin(2 * np.pi * (45 * kt + (110 / 18) * (1 - np.exp(-18 * kt)))) * np.exp(-kt * 7)
kick_one = (np.tanh(kick_one * 2.5) * 0.9).astype(np.float32)
pump_one = 1 - 0.45 * np.exp(-np.arange(int(0.4 * SR)) / SR / 0.09)
ht = np.arange(int(0.08 * SR), dtype=np.float32) / SR
st = np.arange(int(0.3 * SR), dtype=np.float32) / SR
n_beats = int(TOTAL / BEAT)
for b in range(n_beats):
    tb = b * BEAT
    i = min(N - 1, int(tb * SR))
    kl, hl, sl = kick_env[i], hats_env[i], snare_env[i]
    bar_pos = b % 4
    if kl > 0.02 and (kl > 0.7 or bar_pos == 0 or (bar_pos == 2 and kl > 0.4)):
        add(kick, kick_one * kl, tb)
        seg = pump[i:i + len(pump_one)]
        np.minimum(seg, 1 - (1 - pump_one[:len(seg)]) * kl, out=seg)
    if hl > 0.02:
        noise = hp(rng.standard_normal(len(ht)).astype(np.float32), 7000)
        add(hats, noise * np.exp(-ht * 55) * 0.35 * hl, tb + BEAT / 2)
        if hl > 0.75:
            add(hats, noise * np.exp(-ht * 80) * 0.18 * hl, tb + BEAT / 4 * 3)
    if sl > 0.02 and bar_pos in (1, 3):
        nz = bp(rng.standard_normal(len(st)).astype(np.float32), 900, 7000)
        body = np.sin(2 * np.pi * 185 * st) * np.exp(-st * 25)
        add(snare, (nz * np.exp(-st * 16) * 0.5 + body * 0.5) * 0.55 * sl, tb)

print("sub...")
sub_env = envelope("sub")
sub = np.zeros(N, np.float32)
for c in range(n_chords):
    _, root = CHORDS[c % 4]
    s0, s1 = int(c * CHORD_LEN * SR), min(N, int((c + 1) * CHORD_LEN * SR))
    tt = t_all[s0:s1] - t_all[s0]
    f = mtof(root)
    tone = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)
    env = np.minimum(1, tt / 0.05) * np.minimum(1, (tt[-1] - tt + 1e-4) / 0.05)
    sub[s0:s1] = tone * env
sub = sub * sub_env * pump * 0.30

print("pulse / arp / keys / shimmer...")
pulse_env, arp_env, keys_env, shim_env = (envelope(x) for x in ("pulse", "arp", "keys", "shimmer"))
pulse = np.zeros(N, np.float32)
arp = np.zeros(N, np.float32)
keys = np.zeros(N, np.float32)
shim = np.zeros(N, np.float32)
ARP_PAT = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 4, 3, 2, 1]
step = BEAT / 4
for k in range(int(TOTAL / step)):
    ts = k * step
    i = min(N - 1, int(ts * SR))
    notes, root = chord_at(ts)
    if arp_env[i] > 0.02:
        tones = notes + [notes[1] + 12]
        m = tones[ARP_PAT[k % 16]] + 12
        acc = 1.0 if k % 4 == 0 else 0.7
        add(arp, pluck(mtof(m), 0.5, bright=7, decay=7) * arp_env[i] * acc * 0.11, ts)
    if k % 2 == 0 and pulse_env[i] > 0.02:
        acc = 1.0 if k % 8 == 0 else 0.65
        add(pulse, pluck(mtof(root + 12), 0.3, bright=6, decay=12) * pulse_env[i] * acc * 0.16, ts)
    if k % 6 == 0 and keys_env[i] > 0.02:
        motif = [notes[3], notes[2], notes[1], notes[2], notes[3] + 2, notes[2]]
        m = motif[(k // 6) % len(motif)] + 12
        f = mtof(m)
        tt = np.arange(int(2.0 * SR), dtype=np.float32) / SR
        ep = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3)
              + 0.12 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 6)) * np.exp(-tt * 1.6)
        ep *= np.minimum(1, tt / 0.006) * (1 + 0.15 * np.sin(2 * np.pi * 5 * tt))
        add(keys, ep.astype(np.float32) * keys_env[i] * 0.13, ts)
    if k % 8 == 4 and shim_env[i] > 0.02:
        m = notes[(k // 8) % 4] + 24
        f = mtof(m)
        tt = np.arange(int(3.0 * SR), dtype=np.float32) / SR
        bell = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 2)) * np.exp(-tt * 1.3)
        add(shim, bell.astype(np.float32) * shim_env[i] * 0.06, ts)

print("fx (risers + impacts)...")
fx = np.zeros(N, np.float32)
for k, (cid, start) in enumerate(chapters):
    if k > 0:
        rd = 2.6
        rt = np.arange(int(rd * SR), dtype=np.float32) / SR
        nz = hp(rng.standard_normal(len(rt)).astype(np.float32), 1500)
        sweep = np.sin(2 * np.pi * (180 * rt + (900 / (2 * rd)) * rt ** 2))
        rise = (rt / rd) ** 2.2
        add(fx, (nz * 0.10 + sweep * 0.04) * rise, start - rd)
    it = np.arange(int(2.5 * SR), dtype=np.float32) / SR
    boom = np.sin(2 * np.pi * (32 * it + (60 / 6) * (1 - np.exp(-6 * it)))) * np.exp(-it * 2.2)
    hit = lp(rng.standard_normal(len(it)).astype(np.float32), 2500) * np.exp(-it * 5)
    add(fx, (boom * 0.55 + hit * 0.12).astype(np.float32), start)

# ----------------------------------------------------------------------------- mix
print("mixing + reverb...")
d = int(BEAT * 0.75 * SR)  # dotted-eighth ping-pong delay
arpL, arpR = arp.copy(), arp.copy()
arpL[d:] += arp[:-d] * 0.0
arpR[d:] += arp[:-d] * 0.45
arpL[2 * d:] += arp[:-2 * d] * 0.3
arpR[3 * d:] += arp[:-3 * d] * 0.18
arpL[4 * d:] += arp[:-4 * d] * 0.1

dryL = padL + sub + pulse * 0.9 + keys * 0.8 + arpL + kick + hats * 0.8 + snare + shim * 0.6 + fx
dryR = padR + sub + pulse * 0.7 + keys * 0.9 + arpR + kick + hats * 1.0 + snare + shim * 0.8 + fx
sendL = padL * 0.4 + keys * 0.6 + arpL * 0.5 + shim * 1.2 + fx * 0.5 + snare * 0.2 + pulse * 0.3
sendR = padR * 0.4 + keys * 0.6 + arpR * 0.5 + shim * 1.2 + fx * 0.5 + snare * 0.2 + pulse * 0.3

ir_len = int(3.2 * SR)
irt = np.arange(ir_len, dtype=np.float32) / SR
ir_env = np.exp(-irt * 2.1) * np.minimum(1, irt / 0.02)
irL = lp(rng.standard_normal(ir_len).astype(np.float32), 6000) * ir_env
irR = lp(rng.standard_normal(ir_len).astype(np.float32), 6000) * ir_env
irL /= np.sqrt(np.sum(irL ** 2))
irR /= np.sqrt(np.sum(irR ** 2))
wetL = oaconvolve(sendL, irL)[:N].astype(np.float32)
wetR = oaconvolve(sendR, irR)[:N].astype(np.float32)

L = dryL + wetL * 0.55
R = dryR + wetR * 0.55
master = np.stack([L, R], axis=1)
master = hp(master.T, 28).T
fade_in = np.minimum(1, t_all / 1.5)
fade_out = np.clip((TOTAL - t_all) / 6.0, 0, 1)
master *= (fade_in * fade_out)[:, None]
master = np.tanh(master * 1.3) / np.tanh(1.3)
master /= np.max(np.abs(master)) / 0.89

wavfile.write(OUT_WAV, SR, (master * 32767).astype(np.int16))
OUT_MP3.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT_WAV),
                "-codec:a", "libmp3lame", "-b:a", "192k", str(OUT_MP3)], check=True)
OUT_WAV.unlink()
print(f"Music written: {OUT_MP3} ({TOTAL:.1f}s)")
