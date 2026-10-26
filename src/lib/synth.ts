import type { SynthRecipe } from '../data/types';
import { mulberry32 } from './store';

/* ────────────────────────────────────────────────────────────────
   Procedural audio engine. Renders a SynthRecipe offline with the
   Web Audio API and returns { url (WAV blob), buffer }. Results are
   cached so tracks render once per session. Original sound — no
   samples, no external files.
   ──────────────────────────────────────────────────────────────── */

const SR = 32000;
const cache = new Map<string, Promise<{ url: string; buffer: AudioBuffer }>>();
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function noiseBuffer(ctx: BaseAudioContext, seconds: number, seed: number, pink = true) {
  const r = mulberry32(seed);
  const b = ctx.createBuffer(1, Math.floor(seconds * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = r() * 2 - 1;
    if (pink) {
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
    } else d[i] = w;
  }
  return b;
}

function space(ctx: OfflineAudioContext, input: AudioNode, out: AudioNode, time = 0.37, fb = 0.55, mix = 0.45) {
  const dl = ctx.createDelay(2); dl.delayTime.value = time;
  const dr = ctx.createDelay(2); dr.delayTime.value = time * 1.31;
  const g = ctx.createGain(); g.gain.value = fb;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  const wet = ctx.createGain(); wet.gain.value = mix;
  const merger = ctx.createChannelMerger(2);
  input.connect(dl); dl.connect(lp); lp.connect(g); g.connect(dr); dr.connect(dl);
  dl.connect(merger, 0, 0); dr.connect(merger, 0, 1);
  merger.connect(wet); wet.connect(out);
  input.connect(out);
}

function render(r: SynthRecipe) {
  const ctx = new OfflineAudioContext(2, Math.floor(r.seconds * SR), SR);
  const rand = mulberry32(r.seed);
  const T = r.seconds;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, 0);
  master.gain.linearRampToValueAtTime(0.8, Math.min(3, T * 0.1));
  master.gain.setValueAtTime(0.8, T - 4);
  master.gain.linearRampToValueAtTime(0, T);
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp); comp.connect(ctx.destination);
  const bus = ctx.createGain();
  space(ctx, bus, master, 0.29 + rand() * 0.2);
  const root = r.root ?? 48;
  const scale = [0, 2, 3, 5, 7, 9, 10];

  const hiss = (level: number) => {
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx, T, r.seed + 1);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    const g = ctx.createGain(); g.gain.value = level;
    n.connect(hp); hp.connect(g); g.connect(master); n.start();
  };

  if (r.kind === 'ambient' || r.kind === 'drone') {
    const chords = r.kind === 'drone' ? [[0, 7, 12]] : [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -1, 2, 7]];
    const len = T / (r.kind === 'drone' ? 1 : 8);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(300, 0);
    lp.frequency.linearRampToValueAtTime(r.kind === 'drone' ? 900 : 2400, T * 0.55);
    lp.frequency.linearRampToValueAtTime(400, T);
    lp.connect(bus);
    const steps = r.kind === 'drone' ? 1 : 8;
    for (let s = 0; s < steps; s++) {
      const ch = chords[s % chords.length];
      const t0 = s * len;
      const oct = s >= 4 ? -12 : 0;
      ch.forEach((iv) => {
        [-7, 7].forEach((det) => {
          const o = ctx.createOscillator(); o.type = r.kind === 'drone' ? 'sine' : 'sawtooth';
          o.frequency.value = mtof(root + iv + oct); o.detune.value = det + (rand() - 0.5) * 4;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(r.kind === 'drone' ? 0.12 : 0.035, t0 + len * 0.4);
          g.gain.linearRampToValueAtTime(0, t0 + len * 1.15);
          o.connect(g); g.connect(lp); o.start(t0); o.stop(Math.min(T, t0 + len * 1.2));
        });
      });
      if (r.kind === 'drone') {
        [2, 3, 4, 5].forEach((h) => {
          const o = ctx.createOscillator(); o.frequency.value = mtof(root) * h + rand() * 0.8;
          const g = ctx.createGain(); g.gain.value = 0.03 / h;
          o.connect(g); g.connect(lp); o.start(0); o.stop(T);
        });
      }
    }
    hiss(0.05);
  }

  if (r.kind === 'bells' || r.kind === 'ambient') {
    const n = r.kind === 'bells' ? 26 : 10;
    for (let i = 0; i < n; i++) {
      const t0 = 1 + rand() * (T - 6);
      const f = mtof((r.kind === 'bells' ? root : root + 24) + scale[Math.floor(rand() * scale.length)] + (rand() > 0.7 ? 12 : 0));
      [1, 2.76, 5.4].forEach((ratio, j) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * ratio;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.06 / (j + 1), t0 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.5 / (j + 1));
        o.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + 4);
      });
    }
    if (r.kind === 'bells') hiss(0.03);
  }

  if (r.kind === 'pulse' || r.kind === 'beat') {
    const bpm = r.bpm ?? 100;
    const step = 60 / bpm / 4;
    const pattern = Array.from({ length: 16 }, () => rand() > 0.62);
    pattern[0] = true;
    const total = Math.floor((T - 2) / step);
    for (let i = 0; i < total; i++) {
      const t0 = i * step;
      const s = i % 16;
      if (r.kind === 'pulse' && pattern[s]) {
        const o = ctx.createOscillator(); o.type = 'square';
        o.frequency.value = mtof(root + 12 + scale[(s * 3) % scale.length]);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3000 * (0.4 + 0.6 * Math.sin(t0 * 0.3) ** 2), t0); lp.frequency.exponentialRampToValueAtTime(200, t0 + step * 1.8);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.09, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + step * 2);
        o.connect(lp); lp.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + step * 2);
      }
      if (s % 4 === 0 && (r.kind === 'beat' || i > total / 4)) {
        const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + 0.2);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.4);
      }
      const dbl = r.kind === 'beat' && t0 > T / 2;
      if (r.kind === 'beat' && (s % 2 === 0 || dbl)) {
        const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx, 0.08, i, false);
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
        const g = ctx.createGain(); g.gain.setValueAtTime(s % 4 === 2 ? 0.16 : 0.07, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
        n.connect(hp); hp.connect(g); g.connect(bus); n.start(t0);
      }
    }
    // bass pedal
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(root - 12);
    const g = ctx.createGain(); g.gain.value = 0.12; o.connect(g); g.connect(master); o.start(0); o.stop(T);
  }

  if (r.kind === 'texture') {
    for (let i = 0; i < 90; i++) {
      const t0 = rand() * (T - 1);
      const n = ctx.createBufferSource(); n.buffer = noiseBuffer(ctx, 1.2, r.seed + i, false);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 18 + rand() * 30; bp.frequency.value = 200 + rand() * 5000;
      const g = ctx.createGain(); const dur = 0.05 + rand() * 0.9;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + dur * 0.3); g.gain.linearRampToValueAtTime(0, t0 + dur);
      const pan = ctx.createStereoPanner(); pan.pan.value = rand() * 2 - 1;
      n.connect(bp); bp.connect(g); g.connect(pan); pan.connect(bus); n.start(t0); n.stop(t0 + dur + 0.05);
    }
    hiss(0.04);
  }

  return ctx.startRendering();
}

function toWav(buf: AudioBuffer) {
  const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate;
  const data = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); data.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
  data.setUint32(24, sr, true); data.setUint32(28, sr * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true);
  w(36, 'data'); data.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, chans[c][i])); data.setInt16(o, s * 0x7fff, true); o += 2; }
  return new Blob([data], { type: 'audio/wav' });
}

export function renderRecipe(r: SynthRecipe) {
  const key = JSON.stringify(r);
  if (!cache.has(key)) cache.set(key, render(r).then((buffer) => ({ buffer, url: URL.createObjectURL(toWav(buffer)) })));
  return cache.get(key)!;
}

/** Load a real file and decode it for waveform drawing. */
const fileCache = new Map<string, Promise<{ url: string; buffer: AudioBuffer | null }>>();
export function loadFile(src: string) {
  if (!fileCache.has(src)) {
    fileCache.set(src, fetch(src).then((r) => r.arrayBuffer()).then((ab) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(ab)).then((buffer) => ({ url: src, buffer })).catch(() => ({ url: src, buffer: null })));
  }
  return fileCache.get(src)!;
}

export function peaks(buffer: AudioBuffer, n: number) {
  const d = buffer.getChannelData(0);
  const size = Math.floor(d.length / n);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let j = i * size; j < (i + 1) * size; j += 16) m = Math.max(m, Math.abs(d[j]));
    out[i] = m;
  }
  const max = Math.max(...out, 0.001);
  return out.map((v) => v / max);
}
