import type { ActivityItem, Discipline } from './types';
import profile from '../content/profile.json';

export const SITE = {
  name: profile.name,
  shortName: profile.shortName,
  url: profile.url,
  description: profile.description,
  author: profile.displayName,
  location: profile.location,
  email: profile.email,
  mediaBase: (import.meta.env.VITE_MEDIA_BASE as string | undefined) ?? '',
  socials: profile.socials,
};

export const NOW = {
  updated: '2025-02-01',
  listening: '[EDIT: what you are listening to]',
  reading: '[EDIT: what you are reading]',
  making: profile.currentActivity,
};

export const DISCIPLINES: Record<Discipline, { label: string; short: string; glyph: string; blurb: string }> = {
  music: { label: 'Music', short: 'MUS', glyph: '♪', blurb: 'Composition and production' },
  sound: { label: 'Sound', short: 'SND', glyph: '∿', blurb: 'Audio engineering & sound design' },
  photography: { label: 'Photography', short: 'PHO', glyph: '◐', blurb: 'Series, studies, single frames' },
  'digital-art': { label: 'Digital Art', short: 'DIG', glyph: '◇', blurb: 'Generative & digital work' },
  drawing: { label: 'Drawing', short: 'DRW', glyph: '✎', blurb: 'Traditional drawing & illustration' },
  design: { label: 'Design', short: 'DES', glyph: '▦', blurb: 'Graphic design & typography' },
  code: { label: 'Software', short: 'SWE', glyph: '{}', blurb: 'Programming & hardware' },
  ai: { label: 'AI', short: 'AI', glyph: '◎', blurb: 'Machine learning experiments' },
  security: { label: 'Security', short: 'SEC', glyph: '⌘', blurb: 'Cybersecurity research' },
  'creative-coding': { label: 'Creative Code', short: 'CCD', glyph: '✳', blurb: 'Interactive & generative systems' },
  research: { label: 'Research', short: 'RES', glyph: '§', blurb: 'Investigations & notes' },
};

export const activity: ActivityItem[] = [
  { date: '2025-02-01', type: 'now', text: 'Site reduced to five sections: photo, music, tech, journal, about.', href: '#/tech' },
  { date: '2025-01-20', type: 'note', text: 'Journal: “One practice, many instruments”.', href: '#/journal/one-practice' },
  { date: '2025-01-10', type: 'project', text: 'Honeypot Notes — home-lab research log.', href: '#/project/honeypot-notes' },
  { date: '2024-12-02', type: 'note', text: 'Technical note on ordered dithering.', href: '#/journal/dither-notes' },
  { date: '2024-09-03', type: 'experiment', text: 'Interference — a raw WebGL shader.', href: '#/project/interference-shader' },
  { date: '2024-08-20', type: 'project', text: 'Tiny Language Model — browser demo online.', href: '#/project/tiny-language-model' },
  { date: '2024-06-21', type: 'project', text: 'Low Tide EP published (demo).', href: '#/project/low-tide' },
  { date: '2024-06-12', type: 'experiment', text: 'Type Field: interactive typography.', href: '#/project/type-field' },
  { date: '2024-04-01', type: 'experiment', text: 'Flowfield Instrument v1.', href: '#/project/flowfield-instrument' },
  { date: '2024-03-03', type: 'project', text: 'Night Crossings series published.', href: '#/project/night-crossings' },
  { date: '2024-02-20', type: 'project', text: 'Modular Bench — hardware notes, rev C.', href: '#/project/modular-bench' },
];
