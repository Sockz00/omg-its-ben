import type { ImageAsset, Project } from './types';

/* ════════════════════════════════════════════════════════════════
   PROJECTS
   ----------------------------------------------------------------
   Every entry below is DEMONSTRATION CONTENT (demo: true). It exists
   to exercise the content system — none of it describes real work,
   clients, awards or achievements. Replace freely.

   The archive currently ships five demonstration objects, one per
   wing (Sound, Image, Film, Lab × 2). To add a project: copy any
   object, change the slug, and fill in the fields you need. Listings,
   filters, the relationship map, the command palette and the project
   page are all generated from here.
   ════════════════════════════════════════════════════════════════ */

const img = (src: string, width: number, height: number, alt: string, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  src,
  width,
  height,
  alt,
  ...extra,
});

export const IMAGES = {
  night: img('/images/photography/night-crossing.jpg', 1536, 1024, 'An empty rain-soaked crossing at night under sodium streetlights', {
    caption: 'Crossing, 02:40. Placeholder image (AI-generated demo asset).',
    exif: { camera: '[EDIT] 35mm rangefinder', lens: '35mm f/2', aperture: 'f/2', shutter: '1/30s', iso: 1600, film: 'Demo / pushed +1' },
  }),
  fog: img('/images/photography/fog-coast.jpg', 1080, 1456, 'Basalt rocks dissolving into coastal fog at dawn', {
    caption: 'Coast, first light. Placeholder image.',
    exif: { camera: '[EDIT] Medium format', lens: '80mm', aperture: 'f/5.6', shutter: '1/125s', iso: 160 },
  }),
  stair: img('/images/photography/concrete-stair.jpg', 1536, 1024, 'Brutalist concrete staircase cut by diagonal shadows', {
    caption: 'Stair, noon. Placeholder image.',
    exif: { camera: '[EDIT] Digital body', lens: '24mm', aperture: 'f/8', shutter: '1/500s', iso: 100 },
  }),
  market: img('/images/photography/market-light.jpg', 1536, 1024, 'Shafts of late light through the windows of an indoor market', {
    caption: 'Market hall, 17:52. Placeholder image.',
    exif: { camera: '[EDIT] 35mm SLR', lens: '50mm f/1.4', aperture: 'f/2.8', shutter: '1/250s', iso: 400 },
  }),
  ink: img('/images/drawing/ink-studies.jpg', 1024, 1536, 'Sketchbook page of ink studies: hands, a cassette recorder, a microphone', {
    caption: 'Sketchbook spread. Placeholder image.',
  }),
  tide: img('/images/music/cover-low-tide.jpg', 1254, 1254, 'Album artwork: a single orange horizon over deep blue-black'),
  bench: img('/images/tech/workbench.jpg', 1536, 1024, 'Overhead view of an electronics workbench with an oscilloscope and circuit boards', {
    caption: 'Bench, revision C. Placeholder image.',
  }),
};

export const projects: Project[] = [
  {
    slug: 'low-tide',
    title: 'Low Tide',
    demo: true,
    description: 'A three-track ambient EP built from slow-moving chords, tape hiss and a single recurring melody.',
    category: 'music',
    disciplines: ['music', 'sound'],
    tags: ['ambient', 'ep', 'synthesis', 'tape'],
    created: '2024-02-10',
    published: '2024-06-21',
    status: 'complete',
    featured: true,
    accent: '#ff7a2f',
    cover: IMAGES.tide,
    audio: {
      format: 'ep',
      artwork: IMAGES.tide,
      tracks: [
        {
          title: 'Shelf',
          synth: { kind: 'ambient', seconds: 48, seed: 7, root: 50 },
          markers: [ { time: 0, label: 'Intro' }, { time: 16, label: 'Swell' }, { time: 34, label: 'Tail' } ],
          annotations: [ { time: 8, text: 'Detuned pad: two saws, 7 cents apart.' }, { time: 22, text: 'Filter opens over 12 seconds.' } ],
          notes: 'The whole track is one chord progression played twice, the second pass an octave lower.',
          stems: [
            { name: 'Pad', synth: { kind: 'ambient', seconds: 48, seed: 7, root: 50 } },
            { name: 'Drone', synth: { kind: 'drone', seconds: 48, seed: 3, root: 38 } },
            { name: 'Bells', synth: { kind: 'bells', seconds: 48, seed: 11, root: 62 } },
          ],
        },
        { title: 'Undertow', synth: { kind: 'pulse', seconds: 42, seed: 21, bpm: 84, root: 45 }, markers: [ { time: 0, label: 'Pulse' }, { time: 20, label: 'Break' } ], annotations: [ { time: 12, text: 'Sequencer: 16 steps, 5 active.' } ] },
        { title: 'Salt Glass', synth: { kind: 'bells', seconds: 40, seed: 5, root: 57 }, markers: [ { time: 0, label: 'Bells' }, { time: 26, label: 'Decay' } ] },
      ],
    },
    credits: [ { role: 'Composition, production', name: 'Ben [EDIT]' }, { role: 'Mastering', name: '[EDIT: name or self]' } ],
    equipment: ['Polyphonic synth [EDIT]', 'Cassette deck', 'Condenser microphone'],
    software: ['Ableton Live', 'Web Audio API'],
    techniques: ['Tape saturation', 'Granular synthesis', 'Subtractive synthesis'],
    technical: [ { label: 'Sample rate', value: '44.1 kHz' }, { label: 'Loudness target', value: '−16 LUFS integrated' }, { label: 'Demo audio', value: 'Synthesised in your browser' } ],
    process: [
      { title: 'Sketch', text: 'Chords were found on a single sustained patch, recorded live without quantisation.' },
      { title: 'Degrade', text: 'Bounced to cassette and back, then layered with the clean signal for depth.' },
      { title: 'Arrange', text: 'Long-form automation replaces arrangement — nothing enters, everything evolves.' },
    ],
    downloads: [ { label: 'Liner notes (TXT)', href: '/downloads/low-tide-liner-notes.txt', size: '1 KB' } ],
    body: `## About this release
**Demonstration project.** This EP exists to show how the archive presents music: artwork, a tracklist, waveform scrubbing, section markers, annotations, a multitrack stem view and a live spectrogram.

The audio you hear is *not a recording*. Every track is generated procedurally inside your browser by a small synthesis engine (\`src/lib/synth.ts\`), rendered offline to a WAV and handed to the player. Swap the \`synth\` field for a \`src\` pointing at a real file and nothing else changes.

> Nothing enters, everything evolves.

## Production notes
- Pads: detuned oscillators through a slowly modulated low-pass filter.
- Space: feedback delay into a long convolution-style tail.
- Texture: pink noise shaped as a tape-hiss bed.`,
    related: ['flowfield-instrument', 'night-crossings'],
  },
  {
    slug: 'night-crossings',
    title: 'Night Crossings',
    demo: true,
    description: 'A photographic series about thresholds — crossings, stairwells and halls at the hours when no one is in them.',
    category: 'photography',
    disciplines: ['photography'],
    tags: ['series', 'night', 'urban', 'film', 'colour'],
    created: '2023-10-01',
    published: '2024-03-03',
    status: 'complete',
    featured: true,
    accent: '#3fd0c9',
    cover: IMAGES.night,
    galleryLayout: 'asymmetric',
    gallery: [IMAGES.night, IMAGES.market, IMAGES.stair, IMAGES.fog],
    compare: { before: IMAGES.night, after: IMAGES.night, beforeFilter: 'saturate(0.35) contrast(0.78) brightness(1.12) sepia(0.12)', label: 'Flat scan → final grade' },
    equipment: ['[EDIT] 35mm rangefinder', '[EDIT] Medium format camera', 'Flatbed scanner'],
    software: ['Lightroom', 'Negative Lab Pro'],
    techniques: ['Push processing', 'Colour grading', 'Long exposure'],
    body: `## Series statement
**Demonstration project — images are AI-generated placeholders.** Replace them with your own photographs and keep the metadata structure.

The series demonstrates an asymmetric gallery, a full-screen lightbox (arrow keys, \`+\`/\`−\` to zoom, drag to pan), per-image EXIF data, and a before/after comparison slider showing a flat scan against a finished grade.`,
    related: ['tunnel-vision', 'low-tide'],
  },
  {
    slug: 'flowfield-instrument',
    title: 'Flowfield Instrument',
    demo: true,
    description: 'An interactive particle field you can play — drag to stir, hold a key to change the weather.',
    category: 'creative-coding',
    disciplines: ['creative-coding', 'digital-art', 'sound'],
    tags: ['interactive', 'particles', 'canvas', 'audio-reactive', 'live'],
    created: '2024-03-14',
    published: '2024-04-01',
    status: 'ongoing',
    featured: true,
    accent: '#ffd23f',
    cover: { generative: 'contour', seed: 3, label: 'FLW' },
    experiment: 'flowfield',
    software: ['TypeScript', 'Canvas 2D', 'Web Audio API'],
    techniques: ['Flow fields', 'Particle systems', 'Value noise'],
    github: 'https://github.com/[EDIT]',
    body: `## How to play
**Demonstration project — fully original and genuinely interactive.** Move or drag across the canvas to stir currents. Press **Sound** to let the field emit a soft tone shaped by particle velocity (opt-in; nothing plays automatically).`,
    related: ['tiny-language-model', 'low-tide'],
  },
  {
    slug: 'tiny-language-model',
    title: 'Tiny Language Model',
    demo: true,
    description: 'A notebook-scale exploration of how language models predict text, starting from a character-level Markov chain.',
    category: 'ai',
    disciplines: ['ai', 'code', 'research'],
    tags: ['machine-learning', 'nlp', 'markov', 'python', 'live'],
    created: '2024-07-01',
    published: '2024-08-20',
    status: 'ongoing',
    featured: true,
    accent: '#a3b8ff',
    cover: { generative: 'grid', seed: 88, label: 'LM' },
    experiment: 'markov',
    software: ['Python', 'PyTorch', 'TypeScript'],
    techniques: ['N-gram models', 'Tokenisation', 'Sampling temperature'],
    github: 'https://github.com/[EDIT]',
    code: [
      {
        lang: 'py',
        filename: 'ngram.py',
        source: `from collections import defaultdict, Counter
import random

def train(text: str, order: int = 4):
    model = defaultdict(Counter)
    for i in range(len(text) - order):
        model[text[i:i + order]][text[i + order]] += 1
    return model

def sample(model, seed: str, n: int = 200, temperature: float = 1.0):
    out = seed
    for _ in range(n):
        counts = model.get(out[-len(seed):])
        if not counts:
            break
        chars, weights = zip(*counts.items())
        weights = [w ** (1 / temperature) for w in weights]
        out += random.choices(chars, weights)[0]
    return out`,
      },
    ],
    diagram: {
      nodes: [
        { id: 'c', label: 'Corpus', x: 8, y: 50, kind: 'io' },
        { id: 't', label: 'Tokenise', x: 30, y: 25, kind: 'process' },
        { id: 'm', label: 'N-gram table', x: 52, y: 50, kind: 'store' },
        { id: 's', label: 'Sampler (T)', x: 74, y: 25, kind: 'process' },
        { id: 'o', label: 'Output', x: 92, y: 50, kind: 'io' },
      ],
      edges: [ { from: 'c', to: 't' }, { from: 't', to: 'm', label: 'count' }, { from: 'm', to: 's', label: 'p(x|ctx)' }, { from: 's', to: 'o' } ],
    },
    timeline: [
      { date: '2024-07', label: 'Character n-grams' },
      { date: '2024-08', label: 'Browser demo' },
      { date: '[NEXT]', label: 'Small transformer comparison' },
    ],
    body: `## Overview
**Demonstration project.** Before attention and transformers, there is counting. The live demo below trains a character-level model *in your browser* on the text of this archive, then samples from it. Raise the temperature to watch coherence dissolve.

## What it shows
- Higher order = more memorised, less novel.
- Temperature reshapes the distribution: \`w ** (1 / T)\`.
- No data leaves the page.`,
    related: ['honeypot-notes', 'flowfield-instrument'],
  },
  {
    slug: 'type-field',
    title: 'Type Field',
    demo: true,
    description: 'Interactive typography: letterforms sampled into thousands of particles that scatter and reassemble.',
    category: 'creative-coding',
    disciplines: ['creative-coding', 'design'],
    tags: ['interactive', 'typography', 'particles', 'live'],
    created: '2024-06-01',
    published: '2024-06-12',
    status: 'complete',
    cover: { generative: 'grid', seed: 19, label: 'TYP' },
    experiment: 'typefield',
    software: ['TypeScript', 'Canvas 2D'],
    techniques: ['Particle systems', 'Spring physics'],
    body: `## Notes
**Demonstration project.** Type any word in the field below the canvas. Each glyph is rasterised, sampled into points, and every point springs home after your cursor pushes it away.`,
    related: ['flowfield-instrument', 'interference-shader'],
  },
  {
    slug: 'interference-shader',
    title: 'Interference',
    demo: true,
    description: 'A raw WebGL fragment shader of moiré interference patterns, steered by the cursor.',
    category: 'creative-coding',
    disciplines: ['creative-coding', 'research'],
    tags: ['webgl', 'shader', 'glsl', 'live'],
    created: '2024-09-01',
    published: '2024-09-03',
    status: 'complete',
    cover: { generative: 'noise', seed: 55, label: 'GLSL' },
    experiment: 'shader',
    software: ['WebGL', 'GLSL'],
    techniques: ['Shaders', 'Wave interference'],
    code: [
      {
        lang: 'glsl',
        filename: 'interference.frag',
        source: `precision mediump float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5 * u_res) / u_res.y;
  float a = sin(length(uv - m) * 60.0 - u_time * 2.0);
  float b = sin(length(uv + m) * 58.0 + u_time * 1.6);
  float v = smoothstep(-0.2, 0.2, a * b);
  gl_FragColor = vec4(vec3(v), 1.0);
}`,
      },
    ],
    body: `## Why raw WebGL?
**Demonstration project.** A full 3D library is unnecessary for a single full-screen quad. This experiment is ~80 lines with no dependencies, and falls back to a message if WebGL is unavailable.`,
    related: ['flowfield-instrument', 'type-field'],
  },
  {
    slug: 'honeypot-notes',
    title: 'Honeypot Notes',
    demo: true,
    description: 'A home-lab research log on observing automated SSH scanning with a low-interaction honeypot.',
    category: 'security',
    disciplines: ['security', 'research', 'code'],
    tags: ['cybersecurity', 'homelab', 'networking', 'research', 'live'],
    created: '2024-11-01',
    published: '2025-01-10',
    status: 'ongoing',
    accent: '#ff5d73',
    cover: { generative: 'noise', seed: 404, label: 'SEC' },
    experiment: 'entropy',
    software: ['Python', 'Docker', 'Grafana'],
    equipment: ['Single-board computer [EDIT]', 'Isolated VLAN'],
    techniques: ['Threat observation', 'Log analysis', 'Network segmentation'],
    code: [
      {
        lang: 'bash',
        filename: 'isolate.sh',
        source: `# The honeypot lives on its own VLAN with no route to the LAN
nft add table inet lab
nft add chain inet lab forward '{ type filter hook forward priority 0; policy drop; }'
nft add rule inet lab forward iifname "vlan66" oifname "wan0" accept
nft add rule inet lab forward ct state established,related accept
# everything else from vlan66 is dropped and logged
nft add rule inet lab forward iifname "vlan66" log prefix "LAB-DROP " drop`,
      },
    ],
    diagram: {
      nodes: [
        { id: 'i', label: 'Internet', x: 8, y: 50, kind: 'external' },
        { id: 'f', label: 'Firewall', x: 30, y: 50, kind: 'process' },
        { id: 'h', label: 'Honeypot (VLAN 66)', x: 55, y: 22, kind: 'process' },
        { id: 'l', label: 'Log store', x: 78, y: 22, kind: 'store' },
        { id: 'd', label: 'Dashboard', x: 92, y: 62, kind: 'io' },
        { id: 'n', label: 'Home LAN (no route)', x: 55, y: 80, kind: 'external' },
      ],
      edges: [ { from: 'i', to: 'f' }, { from: 'f', to: 'h', label: ':22' }, { from: 'h', to: 'l', label: 'json' }, { from: 'l', to: 'd' }, { from: 'f', to: 'n', label: 'deny' } ],
    },
    timeline: [ { date: '2024-11', label: 'Lab isolated' }, { date: '2024-12', label: 'Logging pipeline' }, { date: '2025-01', label: 'First write-up' } ],
    body: `## Scope & ethics
**Demonstration project — educational framing only.** Defensive observation on equipment you own, isolated from everything else. No figures here are real measurements.

## Live demo
The tool below estimates password strength entirely client-side — nothing you type is stored or sent. It illustrates why automated scanners succeed against short, predictable credentials.`,
    related: ['tiny-language-model', 'modular-bench'],
  },
  {
    slug: 'modular-bench',
    title: 'Modular Bench',
    demo: true,
    description: 'Hardware notes for a small DIY synth module — a microcontroller-driven random voltage source.',
    category: 'code',
    disciplines: ['code', 'music', 'research'],
    tags: ['hardware', 'electronics', 'embedded', 'synthesis'],
    created: '2023-11-11',
    published: '2024-02-20',
    status: 'ongoing',
    cover: IMAGES.bench,
    gallery: [IMAGES.bench],
    galleryLayout: 'masonry',
    equipment: ['Oscilloscope', 'Soldering station', 'Microcontroller [EDIT]'],
    software: ['C', 'KiCad'],
    techniques: ['PCB design', 'Embedded programming'],
    code: [
      {
        lang: 'c',
        filename: 'random_cv.c',
        source: `// Sample-and-hold random voltage, clocked by an external gate
static uint32_t state = 0x1234ABCD;

static inline uint32_t xorshift(void) {
  state ^= state << 13;
  state ^= state >> 17;
  state ^= state << 5;
  return state;
}

void on_gate_rising(void) {
  uint16_t v = xorshift() & 0x0FFF; // 12-bit DAC
  dac_write(v);
}`,
      },
    ],
    timeline: [ { date: '2023-11', label: 'Breadboard' }, { date: '2024-01', label: 'PCB rev A' }, { date: '2024-02', label: 'Rev C (this)' } ],
    body: `## Notes
**Demonstration project — image is a placeholder.** Hardware sits where music and code meet: the module produces voltages that play synthesisers.`,
    related: ['low-tide', 'honeypot-notes'],
  },
];
