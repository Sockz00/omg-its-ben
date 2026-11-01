import site from './site.json';
import projectData from './projects.json';
import photoData from './photos.json';

export const CDN = 'https://cdn.prod.website-files.com/6915dc055cdc24f198ca9061/';
const CDN_VIDEO = 'https://cdn.prod.website-files.com/6915dc055cdc24f198ca9061%2F';

export type Shape = 'portrait' | 'landscape' | 'square';
export type ImageMedia = {
  type: 'image';
  hidden?: boolean;
  name: string;
  shape: Shape;
  file: string;
  widths?: number[];
  full?: number;
  alt: string;
};
export type VideoMedia = {
  type: 'video';
  hidden?: boolean;
  name: string;
  shape: Shape;
  id?: string;
  src?: string;
};
export type Media = ImageMedia | VideoMedia;

export const imageSrc = (m: ImageMedia) =>
  /^(?:https?:\/\/|\/)/i.test(m.file) ? m.file : CDN + m.file;

export const imageSrcSet = (m: ImageMedia): string | undefined => {
  const src = imageSrc(m);
  if (!src.startsWith(CDN) || !src.endsWith('.avif') || !m.widths?.length || !m.full) return undefined;
  const base = src.replace(/\.avif$/, '');
  return [...m.widths.map((w) => `${base}-p-${w}.avif ${w}w`), `${src} ${m.full}w`].join(', ');
};

export const videoSources = (id: string): { mp4?: string; webm?: string; poster?: string } => {
  if (/^(?:https?:\/\/|\/)/i.test(id)) {
    return /\.webm(?:[?#]|$)/i.test(id) ? { webm: id } : { mp4: id };
  }
  return { mp4: `${CDN_VIDEO}${id}_mp4.mp4`, webm: `${CDN_VIDEO}${id}_webm.webm`, poster: `${CDN_VIDEO}${id}_poster.0000000.jpg` };
};

export type CreditPart = { text: string; href?: string };
export type Credit = { label: string; parts: CreditPart[] };
export type Project = { title: string; category: string; year: string; description: string; credits: Credit[]; media: Media[] };

export const heroTitle = site.heroTitle;
export const aboutIntro = site.aboutIntro;
export const projects = (projectData as { items?: Project[] }).items ?? [];
export const photosIntro = photoData.intro;
export const photos = (photoData.items as Media[]).filter((item) => !item.hidden);
