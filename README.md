# OMG, IT'S BEN — a multidisciplinary digital archive

A static, art-directed personal archive for work across music, sound, photography, film, digital art, drawing, design, software, AI, cybersecurity, creative coding and research.

> **Everything marked `Demo` is demonstration content.** Projects, journal entries and activity items exist to exercise the content system. They do not describe real work, clients or achievements. Profile values in `[EDIT …]` brackets are placeholders, and no biography has been invented. The images are AI-generated placeholders. All audio is synthesised in the browser.

---

## Stack, and a note on Astro

The brief asked for **Astro**. The environment this was built in has a fixed **React + Vite + TypeScript** toolchain. Its build command is `vite build`, it can't be changed, and it emits `dist/index.html`. So the archive is a fully static single-page app with **hash routing** (`#/archive`, `#/project/low-tide`). Hash routing means:

- It deploys to **Cloudflare Workers static assets**, or any static host, with no server.
- It has **no backend**, no cookies and no trackers.
- It uses very few dependencies. React is the only runtime library. Animation, galleries, the lightbox, the audio player, WebGL, the force-directed graph and syntax highlighting are all hand-written. GSAP, PhotoSwipe, WaveSurfer and Three.js were evaluated and then *not* installed, because lightweight custom versions covered the needs at a fraction of the size. The whole app is about 128 KB gzipped.

The code is laid out so it can move to Astro without much work. `src/data`, `src/lib` and the canvas/WebGL/audio logic are framework-agnostic. Pages could become `src/pages/*.astro`, with the interactive parts kept as islands (`client:visible`).

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

## Deploy to Cloudflare Workers (static assets)

`wrangler.jsonc` is included and serves `./dist` with SPA fallback. When you choose to deploy:

```bash
npm run build
npx wrangler deploy
```

No Worker script, secrets or R2 credentials are needed. `public/_headers` sets long-cache headers for images and fonts.

## Project structure

```
public/
  images/{photography,digital-art,drawing,design,music,film,tech}/   originals + -640/-1600.webp
  audio/{music,sound-design}/   video/{films,animation}/   downloads/   fonts/   favicon/
  sitemap.xml  robots.txt  _headers
scripts/
  optimize-images.sh       → WebP variants (ImageMagick)
  generate-sitemap.mjs     → sitemap from content
src/
  data/types.ts            → the content model (read this first)
  data/projects.ts         → ALL projects
  data/site.ts             → profile, socials, "now", disciplines, journal, activity
  lib/                     → content queries & graph, router, theme/persistence, markdown,
                             syntax highlighter, procedural audio engine
  components/              → Shell (nav, ⌘K, shortcuts), Cover/treatments, Gallery/Lightbox/Compare,
                             AudioPlayer, Video, RelationMap, experiments, ui primitives
  pages/                   → Home, Archive, Project, Disciplines (Image/Sound/Film/Lab), Info, Journal, 404
  index.css, styles/       → design tokens (two themes) + component/page styles
```

## Adding a project

Add one object to `src/data/projects.ts`. Every listing, filter, tag, year bar, ⌘K entry, relationship-map node, related-project suggestion and project page is generated from it.

```ts
{
  slug: 'harbour-series',
  title: 'Harbour Series',
  description: 'One-sentence summary used in listings and meta tags.',
  body: `## Statement\nLong-form text in a small Markdown subset.`,
  category: 'photography',
  disciplines: ['photography', 'design'],     // optional extra disciplines
  tags: ['series', 'colour'],
  created: '2025-03-01', published: '2025-03-10',
  status: 'complete',                         // complete | ongoing | archived | concept
  featured: true,
  cover: { src: '/images/photography/harbour-01.jpg', width: 1600, height: 1067, alt: '…', variants: true },
  gallery: [/* ImageAsset[] */], galleryLayout: 'asymmetric', // masonry | asymmetric | sequence | horizontal
}
```

Optional fields, all typed in `types.ts`:

| Field | What it adds |
|---|---|
| `audio` | Custom player: tracks, markers, annotations, stems, notes, speed control |
| `video` | YouTube or Vimeo embeds that load on click, local files with captions, or generative films |
| `compare` | Before/after slider |
| `code` | Syntax-highlighted code |
| `diagram` | Architecture diagram |
| `timeline`, `process` | Process documentation |
| `experiment` | A live interactive piece |
| `credits`, `collaborators`, `equipment`, `software`, `techniques`, `technical` | Project details |
| `downloads`, `links`, `github` | Downloads and external links |
| `related` | Related projects you pick yourself |
| `accent` | A colour for this project's page |

Software, equipment and techniques feed the relationship map and skills map automatically.

Without a photo, use a generative cover: `cover: { generative: 'contour' | 'grid' | 'orbit' | 'noise' | 'bars', seed: 12, label: 'ABC' }`.

Image treatments are opt-in per image: `effect: 'halftone' | 'dither' | 'pixel' | 'parallax' | 'distort'`.

## Adding media

- **Images:** drop JPG/PNG files into `public/images/<discipline>/`, then run `bash scripts/optimize-images.sh` to create the `-640.webp` and `-1600.webp` variants. Set `variants: true`, plus the real `width` and `height` (these prevent layout shift). EXIF is a plain `exif: { camera, lens, aperture, shutter, iso, film }` object.
- **Audio:** put files in `public/audio/music/` and set `tracks: [{ title, src: '/audio/music/song.mp3' }]`. A `src` takes priority over `synth`. Waveforms are decoded from the file.
- **Video:** use `{ kind: 'file', src: '/video/films/x.mp4', poster, captions: [{ src: '/video/films/x.vtt', label: 'English', lang: 'en' }] }`, or `kind: 'youtube' | 'vimeo'` with an `id`. The demo embeds are **placeholders** using the Blender Foundation's CC-BY open movie.
- **Large files / Cloudflare R2:** keep masters out of git (see `.gitignore`). Upload them to an R2 bucket with a public domain, then build with `VITE_MEDIA_BASE=https://media.your-domain npm run build`. Every relative media path is prefixed automatically, and absolute URLs also work per asset.

## Journal & activity

Both live in `src/data/site.ts`. Journal entries use the same Markdown subset, including fenced code blocks.

## Keyboard

| Keys | Action |
|---|---|
| `⌘K` / `Ctrl K` / `/` | Command palette |
| `R` | Random project |
| `T` | Toggle theme |
| `G` then a letter | Jump to a page (`H` A I S F L M K J Y B C) |
| `?` | Show all shortcuts |
| `←` `→` `+` `−` `0` `I` `Esc` | Lightbox: move, zoom, reset, info, close |
| `Space` `←` `→` `Home` `End` | Audio waveform: play/pause and seek |

## Accessibility & performance

- Semantic landmarks, a skip link, and focus moves to the page on route change.
- ARIA on the slider, tabs, dialogs and combobox, plus visible focus styles.
- `prefers-reduced-motion` disables the page wipe and reveals, and makes experiments start paused.
- Canvases pause when off-screen.
- Images use responsive WebP, lazy loading and fixed dimensions.
- Third-party embeds load only after a click.
- Audio never autoplays.
- Per-route title, description, canonical and Open Graph tags; JSON-LD, a sitemap, robots.txt and a custom 404.

## Fonts & licences

- Instrument Serif, Archivo (variable width) and JetBrains Mono are under the SIL Open Font License, self-hosted from `@fontsource`.
- The placeholder images are original AI-generated assets.
- All audio is procedurally generated by `src/lib/synth.ts`.
