import type { ImageAsset, Project } from './types';

const imageVariants = new Set<string>();

const normalizeImage = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(normalizeImage);
  const record = value as Record<string, unknown>;
  const normalized = Object.fromEntries(Object.entries(record).map(([key, child]) => [key, normalizeImage(child)]));
  if (typeof normalized.src === 'string') {
    normalized.variants = imageVariants.has(normalized.src);
  }
  return normalized;
};

const normalizeProject = (value: unknown): Project => normalizeImage(value) as Project;

const modules = import.meta.glob('../content/projects/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

export const projects: Project[] = Object.values(modules)
  .map(normalizeProject)
  .filter((project) => !project.draft);

const img = (src: string, width: number, height: number, alt: string, extra: Partial<ImageAsset> = {}): ImageAsset => ({
  src,
  width,
  height,
  alt,
  variants: imageVariants.has(src),
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
  ink: img('/images/drawing/ink-studies.jpg', 1024, 1536, 'Sketchbook page of ink studies: hands, a cassette recorder, a microphone', { caption: 'Sketchbook spread. Placeholder image.' }),
  tide: img('/images/music/cover-low-tide.jpg', 1254, 1254, 'Album artwork: a single orange horizon over deep blue-black'),
  bench: img('/images/tech/workbench.jpg', 1536, 1024, 'Overhead view of an electronics workbench with an oscilloscope and circuit boards', { caption: 'Bench, revision C. Placeholder image.' }),
};
