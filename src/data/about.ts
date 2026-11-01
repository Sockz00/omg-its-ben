import data from './about.json';

export type AboutPart =
  | { type: 'text'; value: string }
  | { type: 'link'; text: string; href: string; external?: boolean }
  | { type: 'break' };
export type AboutSection = { title: string; content: AboutPart[] };
export type AboutImage =
  | { key: string; type: 'image'; src: string }
  | { key: string; type: 'video'; id?: string; src?: string };

const about = data as { sections?: AboutSection[]; images?: AboutImage[] };
export const aboutSections = about.sections ?? [];
export const aboutImages = about.images ?? [];
