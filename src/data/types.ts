/* ──────────────────────────────────────────────────────────────
   CONTENT MODEL — every page in the archive is generated from these.
   Add a project by appending an object to src/data/projects.ts.
   ────────────────────────────────────────────────────────────── */

export type Discipline =
  | 'music'
  | 'sound'
  | 'photography'
  | 'digital-art'
  | 'drawing'
  | 'design'
  | 'code'
  | 'ai'
  | 'security'
  | 'creative-coding'
  | 'research';

export type ImageEffect = 'none' | 'halftone' | 'dither' | 'pixel' | 'parallax' | 'distort';

export interface Exif {
  camera?: string;
  lens?: string;
  focal?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  film?: string;
}

export interface ImageAsset {
  /** Path inside /public (e.g. /images/photography/x.jpg) or absolute URL (R2/CDN). */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  exif?: Exif;
  /** true when `-640.webp` / `-1600.webp` siblings exist (scripts/optimize-images.sh). */
  variants?: boolean;
  /** Optional presentation style. Images are shown untreated by default. */
  effect?: ImageEffect;
}

/** Generative cover (used when a project has no photograph). */
export interface GenerativeCover {
  generative: 'contour' | 'grid' | 'orbit' | 'noise' | 'bars';
  seed: number;
  label?: string;
}

export type Cover = ImageAsset | GenerativeCover;

/** Procedural audio recipe — rendered in-browser to a WAV (see src/lib/synth.ts). */
export interface SynthRecipe {
  kind: 'ambient' | 'pulse' | 'texture' | 'beat' | 'drone' | 'bells';
  seconds: number;
  seed: number;
  bpm?: number;
  /** MIDI root note */
  root?: number;
}

export interface Track {
  title: string;
  /** A real audio file (mp3/ogg/wav/flac) — takes priority over `synth`. */
  src?: string;
  synth?: SynthRecipe;
  markers?: { time: number; label: string }[];
  annotations?: { time: number; text: string }[];
  notes?: string;
  /** Multitrack display — each stem is decoded and drawn as its own lane. */
  stems?: { name: string; synth?: SynthRecipe; src?: string }[];
}

export interface AudioRelease {
  format: 'album' | 'ep' | 'single' | 'composition' | 'sound-design' | 'experimental' | 'breakdown' | 'mix-master';
  artwork?: ImageAsset | GenerativeCover;
  tracks: Track[];
  /** Allow playback-speed control (useful for breakdowns, less so for finished music). */
  allowSpeed?: boolean;
}

export interface CodeSample {
  lang: 'ts' | 'js' | 'py' | 'glsl' | 'bash' | 'rust' | 'c';
  filename: string;
  source: string;
}

export interface Diagram {
  nodes: { id: string; label: string; x: number; y: number; kind?: 'io' | 'process' | 'store' | 'external' }[];
  edges: { from: string; to: string; label?: string }[];
}

export type ExperimentId = 'flowfield' | 'typefield' | 'shader' | 'markov' | 'entropy';

export interface Project {
  slug: string;
  title: string;
  /** Demonstration content flag — rendered as a visible label everywhere. */
  demo?: boolean;
  /** Unpublished CMS draft; excluded from all public content. */
  draft?: boolean;
  description: string;
  /** Long-form body in a small Markdown subset (## h, > quote, - list, **b**, *i*, `code`, [a](url)). */
  body: string;
  category: Discipline;
  disciplines?: Discipline[];
  tags: string[];
  created: string; // ISO date
  published: string; // ISO date
  status: 'complete' | 'ongoing' | 'archived' | 'concept';
  featured?: boolean;
  cover: Cover;
  gallery?: ImageAsset[];
  galleryLayout?: 'masonry' | 'asymmetric' | 'sequence' | 'horizontal';
  compare?: { before: ImageAsset; after: ImageAsset; beforeFilter?: string; label?: string };
  audio?: AudioRelease;
  downloads?: { label: string; href: string; size?: string }[];
  credits?: { role: string; name: string }[];
  collaborators?: string[];
  equipment?: string[];
  software?: string[];
  techniques?: string[];
  technical?: { label: string; value: string }[];
  process?: { title: string; text: string }[];
  links?: { label: string; href: string }[];
  github?: string;
  related?: string[];
  code?: CodeSample[];
  diagram?: Diagram;
  timeline?: { date: string; label: string }[];
  experiment?: ExperimentId;
  /** Accent override for this project's page (CSS colour). */
  accent?: string;
}

export interface JournalEntry {
  slug: string;
  title: string;
  date: string;
  kind: 'essay' | 'note' | 'research' | 'technical' | 'log';
  summary: string;
  body: string;
  tags: string[];
  demo?: boolean;
  related?: string[];
}

export interface ActivityItem {
  date: string;
  type: 'project' | 'experiment' | 'update' | 'note' | 'now';
  text: string;
  href?: string;
}
