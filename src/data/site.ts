import type { ActivityItem, Discipline, JournalEntry } from './types';

/* ════════════════════════════════════════════════════════════════
   SITE / PROFILE — every value wrapped in [EDIT …] is a placeholder.
   Nothing here is invented biography: fill in your own details.
   ════════════════════════════════════════════════════════════════ */

export const SITE = {
  name: "OMG, IT'S BEN",
  shortName: 'OIB',
  url: 'https://omg-its-ben.example', // [EDIT] your production URL (used for canonical / OG)
  description: 'A multidisciplinary archive of sound, image, code and everything between — music, photography, film, art, design, AI and security research.',
  author: 'Ben',
  location: '[EDIT: city / timezone]',
  email: '[EDIT: hello@your-domain]',
  /** Optional media base for future Cloudflare R2 hosting (empty = serve from /public). */
  mediaBase: (import.meta.env.VITE_MEDIA_BASE as string | undefined) ?? '',
  socials: [
    { label: 'GitHub', href: 'https://github.com/[EDIT]', handle: '@[EDIT]' },
    { label: 'Bandcamp', href: 'https://[EDIT].bandcamp.com', handle: '[EDIT]' },
    { label: 'Instagram', href: 'https://instagram.com/[EDIT]', handle: '@[EDIT]' },
    { label: 'YouTube', href: 'https://youtube.com/@[EDIT]', handle: '@[EDIT]' },
    { label: 'Mastodon', href: 'https://[EDIT]', handle: '@[EDIT]' },
  ],
};

export const NOW = {
  updated: '2025-02-01',
  listening: '[EDIT: what you are listening to]',
  reading: '[EDIT: what you are reading]',
  making: ['Extending the Flowfield Instrument (demo)', 'Night Crossings — new plates (demo)', 'Tiny Language Model — next notes (demo)'],
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

export const journal: JournalEntry[] = [
  {
    slug: 'one-practice',
    title: 'One practice, many instruments',
    date: '2025-01-20',
    kind: 'essay',
    demo: true,
    summary: 'Why photography, synthesis and security research might be the same activity wearing different clothes.',
    tags: ['practice', 'process'],
    related: ['flowfield-instrument', 'tiny-language-model'],
    body: `**Demonstration journal entry.** Replace with your own writing.

Every discipline in this archive rewards the same thing: patient attention to a signal. A photograph is light sampled at a moment. A mix is energy distributed across frequencies. A packet capture is behaviour, written down by a machine.

> The tools change; the listening doesn't.

## Shared habits
- **Sampling.** Shutter speed, sample rate, polling interval.
- **Noise.** Grain, hiss, false positives — each discipline has a vocabulary for what isn't the signal.
- **Composition.** Framing a shot, arranging a track, structuring a codebase.

This website is built on the same idea: one archive, one index, one graph of relationships, instead of separate portfolios for separate selves.`,
  },
  {
    slug: 'dither-notes',
    title: 'Notes on ordered dithering',
    date: '2024-12-02',
    kind: 'technical',
    demo: true,
    summary: 'A Bayer matrix, a threshold and a canvas — how the archive’s dither treatment works.',
    tags: ['graphics', 'canvas', 'technical'],
    related: ['night-crossings'],
    body: `**Demonstration journal entry.**

Ordered dithering compares each pixel's luminance against a repeating threshold matrix. The 4×4 Bayer matrix is enough for a convincing print-like texture:

\`\`\`
 0  8  2 10
12  4 14  6
 3 11  1  9
15  7 13  5
\`\`\`

Divide by 16, compare with luminance, output ink or paper. In the archive the threshold is mixed with the cursor distance, so the original image *surfaces* where you look.`,
  },
  {
    slug: 'listening-log-01',
    title: 'Listening log 01',
    date: '2024-10-15',
    kind: 'log',
    demo: true,
    summary: 'A placeholder for a recurring log of records, rooms and sounds.',
    tags: ['music', 'log'],
    body: `**Demonstration journal entry.** Use log entries for short, regular notes.

- [EDIT] A record you listened to.
- [EDIT] A room with interesting reverb.
- [EDIT] A sound you recorded on the way home.`,
  },
  {
    slug: 'isolation-first',
    title: 'Isolation first: building a safe home lab',
    date: '2024-11-20',
    kind: 'research',
    demo: true,
    summary: 'Defensive principles for running security experiments at home without endangering your own network.',
    tags: ['security', 'homelab'],
    related: ['tiny-language-model'],
    body: `**Demonstration journal entry — general educational notes, not a guide to attacking anything.**

## Principles
- Experiments live on a segment with **no route** to personal devices.
- Default-deny between segments; log everything that is dropped.
- Treat the experiment host as already compromised: rebuild, don't repair.`,
  },
];

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
