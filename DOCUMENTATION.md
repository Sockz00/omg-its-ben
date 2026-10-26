# OMG, IT'S BEN — complete documentation

The operator’s manual for this site: how it works, what every file is for, and how to change anything without breaking the rest.

The short version lives in `README.md`. This is the long version.

---

## Table of contents

1. [What this website is](#1-what-this-website-is)
2. [Run, build, deploy](#2-run-build-deploy)
3. [Mental model](#3-mental-model)
4. [Directory map](#4-directory-map)
5. [The content system](#5-the-content-system)
6. [Adding, editing and deleting projects](#6-adding-editing-and-deleting-projects)
7. [Adding images, audio and downloads](#7-adding-images-audio-and-downloads)
8. [Editing the rest of the site](#8-editing-the-rest-of-the-site)
9. [Routing, pages and SEO](#9-routing-pages-and-seo)
10. [Every source file](#10-every-source-file)
11. [Design system, themes and motion](#11-design-system-themes-and-motion)
12. [Interactive systems](#12-interactive-systems)
13. [Keyboard, accessibility and performance](#13-keyboard-accessibility-and-performance)
14. [Scripts and configuration](#14-scripts-and-configuration)
15. [First-run checklist](#15-first-run-checklist)
16. [Troubleshooting](#16-troubleshooting)
17. [What was removed in the simplification](#17-what-was-removed-in-the-simplification)

---

## 1. What this website is

A static, art-directed personal portfolio. Five sections, no more:

| # | Section | Route | What lives there |
|---|---|---|---|
| 01 | **Photo** | `#/photo` | Photography, digital art, drawing, design — plate wall, contact sheet, lightbox, image treatments |
| 02 | **Music** | `#/music` | Releases and sound design — the custom audio player |
| 03 | **Tech** | `#/tech` | Software, AI, cybersecurity, hardware, creative coding — a searchable index; each entry opens a full case study |
| 04 | **Journal** | `#/journal` | Long-form writing, notes, research |
| 05 | **About** | `#/about` | Profile, disciplines, “now” |

Plus the homepage (`#/`), a project detail template (`#/project/<slug>`), a journal post template (`#/journal/<slug>`) and a 404.

There is **no backend, no database, no CMS, no cookies and no trackers**. Everything is generated at build time from TypeScript files in `src/data/`.

### Demonstration content

Eight demonstration projects ship with the site. They exist to exercise the machinery — they are **not** real work, clients or achievements, and each is labelled **Demo** everywhere it appears.

| Slug | Section | Demonstrates |
|---|---|---|
| `night-crossings` | Photo | Gallery layouts, lightbox, EXIF, before/after slider |
| `low-tide` | Music | Audio player, stems, spectrogram, markers, annotations |
| `flowfield-instrument` | Tech | Live particle experiment + opt-in sound |
| `type-field` | Tech | Particle typography experiment |
| `interference-shader` | Tech | Raw WebGL shader + highlighted GLSL source |
| `tiny-language-model` | Tech | In-browser Markov model, Python source, architecture diagram, timeline |
| `honeypot-notes` | Tech | Security research, bash source, diagram, entropy experiment |
| `modular-bench` | Tech | Hardware notes, C source, gallery, timeline |

Profile values in `[EDIT …]` are placeholders — no biography has been invented. The photographs are AI-generated stand-ins. All demo audio is synthesised in the visitor’s browser.

---

## 2. Run, build, deploy

**Requires** Node 20+. ImageMagick is optional (only for `scripts/optimize-images.sh`).

```bash
npm install
npm run dev        # Vite dev server with hot reload
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

### Cloudflare Workers (static assets)

`wrangler.jsonc` is already configured to serve `./dist` with SPA fallback:

```bash
npm run build
npx wrangler deploy
```

No Worker script, secrets or R2 credentials needed. Any static host works — upload the contents of `dist/`.

Current production bundle: **386 kB raw / 118 kB gzipped**, inlined into a single `index.html`.

### Environment variables

| Variable | When | Effect |
|---|---|---|
| `VITE_MEDIA_BASE` | build | Prefixes every relative media path. For originals hosted on Cloudflare R2 or a CDN: `VITE_MEDIA_BASE=https://media.your-domain npm run build` |
| `SITE_URL` | sitemap script | Origin written into `public/sitemap.xml` |

---

## 3. Mental model

```
DATA    src/data/*.ts        projects, profile, journal, types
LOGIC   src/lib/*.ts         queries, sections, router, audio, markdown, theme, motion
VIEW    src/pages + src/components + src/index.css + src/styles
```

**Adding work almost never means touching VIEW.** Append an object to `src/data/projects.ts` and the section pages, the Tech index and its filters, the command palette, related-project suggestions, the homepage and the sitemap (after regenerating) all update themselves.

A project belongs to a section through its **disciplines**, not through a manual assignment — see §5.3.

---

## 4. Directory map

```
.
├── DOCUMENTATION.md          ← this file
├── README.md                 ← short start guide
├── index.html                ← HTML shell: fonts, OG tags, no-flash theme script
├── package.json  vite.config.ts  tsconfig.json  wrangler.jsonc
├── public/                   ← copied to dist/ verbatim
│   ├── images/
│   │   ├── photography/      night-crossing, fog-coast, concrete-stair, market-light
│   │   ├── drawing/          ink-studies
│   │   ├── music/            cover-low-tide
│   │   ├── tech/             workbench
│   │   └── og.jpg            Open Graph share image (1200×630)
│   ├── audio/music/          drop mp3/wav/ogg/flac here
│   ├── audio/sound-design/
│   ├── downloads/            files linked from a project's `downloads`
│   ├── fonts/                Archivo, Instrument Serif, JetBrains Mono (SIL OFL)
│   ├── favicon/              favicon.svg + apple-touch-icon.png
│   ├── sitemap.xml  robots.txt  _headers
├── scripts/
│   ├── optimize-images.sh    JPG/PNG → -640.webp and -1600.webp
│   └── generate-sitemap.mjs  rebuilds public/sitemap.xml from the content files
└── src/
    ├── main.tsx              React mount
    ├── App.tsx               hash router + per-route <title>/OG
    ├── index.css             tokens, fonts, base, utilities
    ├── styles/
    │   ├── components.css    header, footer, home, Tech index, palette, status bar
    │   ├── media.css         covers, treatments, gallery, lightbox, player, code, experiments
    │   └── pages.css         project page, Photo/Music sections, about, journal, 404
    ├── data/
    │   ├── types.ts          the content model — read this first
    │   ├── projects.ts       ALL projects + the shared IMAGES dictionary
    │   └── site.ts           SITE, NOW, DISCIPLINES, journal, activity
    ├── lib/
    │   ├── content.ts        indexes, search, related, section mapping
    │   ├── router.tsx        hash parsing, <Link>, navigate, setQuery
    │   ├── store.ts          theme, recents, RNG, noise, setMeta
    │   ├── palette.ts        cached colour tokens for canvases
    │   ├── raf.ts            rAF throttle, lerp, easeTo, scrollProgress
    │   ├── markdown.tsx      safe Markdown subset → React
    │   ├── highlight.tsx     tokenizer syntax highlighter
    │   └── synth.ts          procedural audio engine
    ├── components/
    │   ├── Shell.tsx         header, mobile menu, footer, shortcuts, page wipe
    │   ├── CommandPalette.tsx  ⌘K / Ctrl+K / /
    │   ├── Cover.tsx         <picture>, generative covers, image treatments
    │   ├── Gallery.tsx       layouts, lightbox, before/after
    │   ├── AudioPlayer.tsx   waveform, spectrogram, stems, markers, annotations
    │   ├── experiments.tsx   five live browser experiments
    │   └── ui.tsx            scramble, reveal, tiles, rows, diagram, timeline, hover preview
    └── pages/
        ├── Home.tsx
        ├── Sections.tsx      Photo + Music
        ├── Tech.tsx          the technical index
        ├── Project.tsx       one template, generated per slug
        ├── Journal.tsx       index + post
        ├── About.tsx
        └── NotFound.tsx
```

---

## 5. The content system

### 5.1 Where content lives

| File | Owns |
|---|---|
| `src/data/types.ts` | The TypeScript types. This is the contract. |
| `src/data/projects.ts` | The `projects` array and the `IMAGES` dictionary of reusable image assets. |
| `src/data/site.ts` | `SITE`, `NOW`, `DISCIPLINES`, `journal`, `activity`. |

If TypeScript complains after an edit, the type is the source of truth — fix the data, don’t silence the error.

### 5.2 A project, field by field

**Required**

| Field | Type | Notes |
|---|---|---|
| `slug` | `string` | URL fragment → `#/project/<slug>`. Lowercase, hyphenated, unique. |
| `title` | `string` | Giant heading on the detail page; used in every listing. |
| `description` | `string` | One or two sentences. Listings, hover cards, OG description, palette. |
| `body` | `string` | Long-form text in the Markdown subset (§5.5). |
| `category` | `Discipline` | Primary discipline. Decides which section owns the project. |
| `tags` | `string[]` | Free-form. AND-combined in the Tech filters. |
| `created` | `string` | `YYYY-MM-DD`. Drives the `N°001` index number and prev/next order. |
| `published` | `string` | `YYYY-MM-DD`. Default sort (newest first). |
| `status` | `'complete' \| 'ongoing' \| 'archived' \| 'concept'` | Labelled dot; `ongoing` pulses. Filterable in Tech. |
| `cover` | `Cover` | An `ImageAsset` or a `GenerativeCover`. Always required. |

**Optional — identity**

| Field | Effect |
|---|---|
| `demo` | Draws the **Demo** badge. Keep on demonstration objects; remove for real work. |
| `featured` | Appears in “Selected objects” on the homepage. |
| `disciplines` | Extra disciplines beyond `category`. |
| `accent` | CSS colour that tints hover states and the detail page’s `--accent`. |

**Optional — images**

| Field | Effect |
|---|---|
| `gallery` | `ImageAsset[]`, rendered under “Plates”. |
| `galleryLayout` | `masonry` (default) · `asymmetric` · `sequence` (one frame at a time, photobook) · `horizontal` (snap strip) |
| `compare` | `{ before, after, beforeFilter?, label? }` — draggable before/after. `beforeFilter` is a CSS `filter:` string, so “flat scan → grade” needs no second file. |

`ImageAsset`:

```ts
{
  src: '/images/photography/harbour-01.jpg', // inside public/, or an absolute URL
  alt: 'Fishing boats at first light',       // required — the accessible name
  width: 1600, height: 1067,                 // required — prevents layout shift
  caption: 'Harbour, 05:12.',
  variants: true,                            // true when -640.webp / -1600.webp exist
  effect: 'dither',                          // optional; omit for an untreated photograph
  exif: { camera: '…', lens: '…', aperture: 'f/2', shutter: '1/60s', iso: 400, film: '…' },
}
```

`effect`: `'none' | 'halftone' | 'dither' | 'pixel' | 'parallax' | 'distort'`. Treatments are opt-in.

`GenerativeCover` (when there is no photograph):

```ts
{ generative: 'contour' | 'grid' | 'orbit' | 'noise' | 'bars', seed: 12, label: 'ABC' }
```

Deterministic per `seed`; redraws on theme change.

**Optional — audio**

```ts
audio: {
  format: 'album' | 'ep' | 'single' | 'composition' | 'sound-design' | 'experimental' | 'breakdown' | 'mix-master',
  artwork: /* ImageAsset | GenerativeCover */,
  allowSpeed: true,       // 0.5× / 0.75× / 1× / 1.5× — useful for studies, off for finished music
  tracks: [{
    title: 'Shelf',
    src: '/audio/music/shelf.mp3',   // a real file — takes priority over synth
    synth: { kind: 'ambient', seconds: 48, seed: 7, root: 50 },
    markers: [{ time: 16, label: 'Swell' }],
    annotations: [{ time: 8, text: 'Detuned pad.' }],   // light up during playback
    notes: 'One chord, twice.',
    stems: [{ name: 'Pad', synth: { kind: 'ambient', seconds: 48, seed: 7 } }],
  }],
}
```

`synth.kind`: `ambient | pulse | texture | beat | drone | bells`. `root` is a MIDI note. **A project with an `audio` field appears in the Music section.** Audio never autoplays, and only one player sounds at a time.

**Optional — technical presentation**

| Field | Effect |
|---|---|
| `code` | `{ lang, filename, source }[]` — highlighted, line numbers, Copy button. `lang`: `ts js py glsl bash rust c` |
| `diagram` | `{ nodes, edges }`. Nodes: `{ id, label, x, y, kind? }`, x/y are 0–100 percentages. `kind`: `io \| process \| store \| external` |
| `timeline` | `{ date, label }[]`. Horizontal on desktop, vertical on mobile. A date starting with `[` renders as a dashed “next” marker. |
| `process` | `{ title, text }[]` — numbered steps |
| `experiment` | `flowfield \| typefield \| shader \| markov \| entropy` — embeds that live experiment at the top of the detail page |
| `technical` | `{ label, value }[]` — definition list in the sidebar |
| `credits` | `{ role, name }[]` |
| `collaborators` | `string[]` |
| `equipment` / `software` / `techniques` | `string[]`. On technical projects these link into the Tech search. |
| `downloads` | `{ label, href, size? }[]` |
| `links` | `{ label, href }[]` — external, new tab |
| `github` | URL → “Source on GitHub” |
| `related` | Slugs shown first in “Related objects”; the rest are scored automatically from shared disciplines, tags and software, **within the same section** |

### 5.3 Sections and disciplines

Disciplines are defined once, in `src/data/site.ts`:

`music` `sound` `photography` `digital-art` `drawing` `design` `code` `ai` `security` `creative-coding` `research`

`src/lib/content.ts` maps them onto the three work sections:

```ts
PHOTO_DISCIPLINES = ['photography', 'digital-art', 'drawing', 'design']  → /photo
MUSIC_DISCIPLINES = ['music', 'sound']                                   → /music
TECH_DISCIPLINES  = ['code', 'ai', 'security', 'creative-coding', 'research'] → /tech
```

Helpers you will use:

| Export | Meaning |
|---|---|
| `isPhoto(p)` `isMusic(p)` `isTech(p)` | Section membership by discipline |
| `photoProjects` `musicProjects` `techProjects` | The three indexes. `musicProjects` is “projects with an `audio` field”. |
| `sectionFor(d)` | `{ id, label, to }` for a discipline — `to` includes `?d=` for Tech |
| `sectionOf(p)` | Same, from a project’s `category` |
| `projectsInSection(id)` | The pool used for prev/next and related suggestions |

To add a discipline: extend the `Discipline` union in `types.ts`, add its entry in `DISCIPLINES`, and put it in one of the three `*_DISCIPLINES` arrays. Disciplines no project claims are hidden automatically (`usedDisciplines`).

### 5.4 Journal and activity

`journal` in `site.ts` is `JournalEntry[]`: `slug`, `title`, `date`, `kind` (`essay | note | research | technical | log` — filterable on the index), `summary`, `body` (same Markdown subset), `tags`, `related` (project slugs), `demo`.

`activity` is `ActivityItem[]`, newest first: `{ date, type: 'project' | 'experiment' | 'update' | 'note' | 'now', text, href }`. The homepage “Currently” panel shows the first four. There is no separate activity page.

### 5.5 Markdown subset

No `dangerouslySetInnerHTML`. `src/lib/markdown.tsx` parses only:

```
## Heading        ### Subheading
**bold**  *italic*  `inline code`  [link](url)
> Blockquote
- list item
```

Fenced code blocks with a language:

````
```ts
const x = 1;
```
````

Tables, images and raw HTML inside `body` are **not** supported. Images go in `gallery`.

---

## 6. Adding, editing and deleting projects

### Add

1. Open `src/data/projects.ts`.
2. Copy the existing object closest to what you are adding.
3. Change `slug`, `title`, `description`, `body`, `category`, `tags`, `created`, `published`, `status`, `cover`.
4. Fill in only the optional fields you need. Omit the rest.
5. Set `demo: true` while it is placeholder content.
6. Save — the dev server hot-reloads. Visit `#/project/your-slug`.
7. Before deploying: `node scripts/generate-sitemap.mjs`.

You do **not** create a page file. `src/pages/Project.tsx` is a single template that reads the slug from the URL and renders a section only when the matching field exists.

Which section it appears in is decided by `category` / `disciplines`:

- a photography discipline → Photo
- an `audio` field → Music
- a technical discipline → Tech

### Edit

Change the object. Every listing, filter, chip and the detail page re-read the array.

### Delete

Remove the object, then:

1. Grep the repo for the slug: `related` arrays, `journal[].related`, `activity[].href`, `NOW.making`. Stale slugs in `related` are skipped silently; a stale `href` in `activity` becomes a 404.
2. Delete media that is now unreferenced (`grep -rl "filename" src/` first).
3. Regenerate the sitemap.

### Index numbers

`N°001`, `N°002` … are assigned by **creation date**, not array order. They are stable unless you change a `created` date; inserting an older project renumbers the later ones.

---

## 7. Adding images, audio and downloads

### Images

1. Drop a JPG/PNG in the matching folder under `public/images/<area>/`.
2. `bash scripts/optimize-images.sh` (needs ImageMagick) writes `name-640.webp` and `name-1600.webp` beside the original.
3. Set `variants: true` plus the real `width`/`height`. The `<picture>` then serves WebP with a JPEG fallback.
4. Skipping the script is fine — omit `variants` and the original is used everywhere.

Keep masters out of git where you can; `.gitignore` already excludes `public/audio/**/*.wav`.

**Cloudflare R2 later:** upload the same tree to a public bucket and build with `VITE_MEDIA_BASE=https://media.your-domain`. Absolute `https://…` URLs on individual assets also work and bypass the prefix.

### Audio

Files go in `public/audio/music/` or `public/audio/sound-design/`, referenced as `src: '/audio/music/file.mp3'`. Anything the browser can decode works (mp3, ogg, wav, flac, m4a). Waveforms are drawn from a decoded `AudioBuffer`, so large lossless files take a moment on first play. Demo projects use `synth` instead so the repo ships no recordings.

### Downloads

Put the file in `public/downloads/` and add `{ label: 'Score (PDF)', href: '/downloads/score.pdf', size: '1.2 MB' }`.

---

## 8. Editing the rest of the site

| You want to change | Where |
|---|---|
| Site name, URL, email, location, socials | `SITE` in `src/data/site.ts` (+ the same URL in `index.html`, `public/robots.txt`, and a sitemap regen) |
| “Currently” panel | `NOW` in `site.ts` |
| Journal entries | `journal` in `site.ts` |
| Activity feed (homepage) | `activity` in `site.ts` |
| About copy | `src/pages/About.tsx` — placeholders are wrapped in `<mark>[EDIT …]</mark>` |
| Header nav labels/order | `NAV` in `src/components/Shell.tsx` |
| Palette pages + `G`-then-letter keys | `PAGES` in `src/components/CommandPalette.tsx` |
| Footer columns | `Footer` in `src/components/Shell.tsx` |
| Homepage copy and sections | `src/pages/Home.tsx` |
| 404 copy | `src/pages/NotFound.tsx` |

**Contact** lives in the footer (email, location, socials) and in the About sidebar button. There is deliberately no contact form: a static site cannot deliver submissions, and a form that silently discarded them would be worse than none. `SITE.email` is rendered as a `mailto:` only once it no longer contains `[EDIT`.

`NAV` and `PAGES` must stay in sync — `PAGES` also drives the shortcuts dialog.

---

## 9. Routing, pages and SEO

### Routes

`src/lib/router.tsx` reads `window.location.hash`; `src/App.tsx` switches on it.

```
#/                       Home
#/photo                  Photo
#/music                  Music
#/tech                   Tech index — filters live in the query: ?q=&d=&s=&t=
#/project/<slug>         Project detail
#/journal                Journal index
#/journal/<slug>         Journal post
#/about                  About
anything else            404
```

`<Link to="/tech">` renders `<a href="#/tech">`; external URLs pass through unchanged.

Tech filters use `history.replaceState`, so adjusting a chip does not spam the back button, and the URL stays shareable: `#/tech?d=security&s=ongoing&t=homelab`.

| Param | Meaning |
|---|---|
| `q` | Search text |
| `d` | Discipline |
| `s` | Status |
| `t` | Comma-separated tags (all must match) |

Everything else is `React.lazy` except Home and the 404, so first paint stays small.

### Per-route metadata

On each navigation `setMeta()` (`src/lib/store.ts`) updates `document.title`, `<meta name="description">`, Open Graph title/description/image/url, the Twitter equivalents and `<link rel="canonical">`.

Project pages use the project’s own title, description, discipline and cover image; unknown slugs get a “Not found” title. Static tags (favicon, theme-color, JSON-LD, font preloads) are in `index.html`.

The no-flash script in `index.html` applies the stored theme **before** React mounts.

### Sitemap

```bash
SITE_URL=https://your-domain.example node scripts/generate-sitemap.mjs
```

It reads `slug:` out of `projects.ts` and `site.ts` and writes `public/sitemap.xml` — 6 pages + every project + every journal entry. Re-run after adding content. Because routing is hash-based, `loc` values look like `https://your-domain/#/project/low-tide`.

---

## 10. Every source file

### Entry

**`index.html`** — the only HTML document. Font preloads, default `data-theme="dark"`, the no-flash theme script, OG/Twitter/JSON-LD, `#root`, and a noscript fallback pointing at the sitemap. Update the title, description and `og:url` when you have a real domain.

**`src/main.tsx`** — `createRoot(...).render(<StrictMode><App /></StrictMode>)`. No logic here.

**`src/App.tsx`** — the route switch and the `META` dictionary (title + description per section). Calls `setMeta` on path change and wraps the page in `<Shell>` + `<Suspense>`.

**`src/vite-env.d.ts`** — Vite client types, so `import.meta.env.VITE_MEDIA_BASE` type-checks.

### Data — see §5.

### Logic (`src/lib`)

**`content.ts`** — the only module pages use to read projects: `allProjects`, `getProject`, `getJournal`, `journalSorted`, `disciplinesOf`, `allTags`, `usedDisciplines`, `countFor`, `indexOf`, `relatedTo(p, n, pool)`, `searchProjects(q, list?)`, `randomProject(exclude?)`, `fmtDate`, `mediaUrl`, `isImage`/`isGenerative`, plus the section helpers in §5.3.

**`router.tsx`** — `parseHash`, `useRoute`, `navigate`, `setQuery`, `<Link>`. Hash-only; no router dependency.

**`store.ts`** — theme (`getTheme`/`setTheme`/`toggleTheme`/`useTheme`, persisted as `localStorage['oib:theme']`, also updates `<meta name="theme-color">`); recents (`pushRecent`/`getRecent`, max 8, `localStorage['oib:recent']`, feeds the palette); `usePersisted`; `useReducedMotion`; `mulberry32`; `makeNoise`; `setMeta`.

**`palette.ts`** — `getComputedStyle` inside an animation loop causes layout thrash, so canvases read cached tokens from `palette()`, refreshed only when the theme changes.

**`raf.ts`** — `rafThrottle`, `lerp`, `clamp`, `easeTo`, `scrollProgress`. Used by the pointer-driven treatments, the hero field, the Photo scroll scenes and the status bar.

**`markdown.tsx`** — §5.5.

**`highlight.tsx`** — a small tokenizer; keyword lists per language at the top of the file. `CodeBlock` adds a gutter, filename bar and Copy.

**`synth.ts`** — offline Web Audio renderer. Given a `SynthRecipe` it schedules oscillators, noise, filters and a stereo delay into an `OfflineAudioContext`, writes a 16-bit WAV blob and caches it per recipe. `loadFile(src)` decodes a real file; `peaks(buffer, n)` produces the waveform array. To change how a `kind` sounds, edit this file; to use a real recording, set `src` on the track instead.

### Components

**`Shell.tsx`** — persistent chrome: header (mark, nav, search, random, theme, menu), the mobile full-screen index (same five sections as desktop), `<main>`, footer (Sections / Elsewhere / Contact / Colophon), status bar (path, scroll, clock, `?`), page-wipe overlay, palette mount, shortcuts dialog, and the global key handling.

**`CommandPalette.tsx`** — fuzzy search over recently viewed, actions (random, theme, copy URL), the six pages, every project and every journal entry. `PAGES` here is also the `G`-then-letter table.

**`Cover.tsx`** — `Picture` (responsive `<picture>`, WebP srcset, lazy + async), `Generative` (five canvas cover algorithms), `EffectImage` (the treatments), `Cover` (dispatcher).

**`Gallery.tsx`** — the four layouts, `Lightbox` (portal, focus restore, `← → + − 0 I Esc`, drag-to-pan when zoomed, EXIF panel) and `Compare`.

**`AudioPlayer.tsx`** — play/pause, waveform seeking (pointer + arrow keys), volume, optional speed, marker buttons, annotations that light up during playback, a live spectrogram via `AnalyserNode`, an optional stem view, and the tracklist. Dispatches `oib:play` so two players never sound at once.

**`experiments.tsx`** — the five experiments, exported as `<Experiment id>` and individually. Each uses `useLoop`, so it pauses off-screen, when the tab is hidden, and (starting paused) under `prefers-reduced-motion`.

**`ui.tsx`** — `Scramble` (writes straight to the DOM, one write per frame), `Reveal`, `DemoBadge`, `Breadcrumbs`, `SectionHead`, `DisciplineChips`, `ProjectTile`, `ProjectRow`, `HoverPreview` (lerped follow), `Diagram`, `Timeline`, `Marquee`.

### Pages

**`Home.tsx`** — hero (signal field, split-flap discipline readout, section CTAs, featured index), marquee, the discipline list with a hover peek image, “Selected objects”, “Recently added”, a live FlowField beside the “Currently” panel, and the manifesto.

**`Sections.tsx`** — exports `Photo` and `Music`.
- `Photo`: scroll-expanding hero plate → a horizontally scroll-driven wall of plates → contact sheet / masonry toggle → the five optional treatments → photo projects.
- `Music`: a shelf of every project with `audio`, with the player beside it.

**`Tech.tsx`** — the technical index. Search, discipline chips, status chips, tag cloud, one list view with a cursor-following cover preview. Filters sync to the URL query.

**`Project.tsx`** — the single detail template. Sections render only when their field exists, in this order: experiment → audio → body + sidebar → gallery → compare → diagram → code → process/timeline → prev/next → related. Prev/next and related are scoped to the project’s own section. Breadcrumbs read `Index / Section / (Discipline) / Title`. Tool and tag links point into the Tech search for technical projects and render as plain text otherwise, so a photograph never links to a search that cannot find it.

**`Journal.tsx`** — index (filterable by `kind`) and post, with referenced projects and older/newer navigation.

**`About.tsx`** — portrait, editable copy, the discipline list (each linking to the section that holds it), “Now”, and Journal/Contact buttons.

**`NotFound.tsx`** — 404 with a live FlowField behind the type and links to every section plus a random project.

### Styles

```
src/index.css
  @import "tailwindcss";
  @import "./styles/components.css";
        @import "./media.css";
        @import "./pages.css";
```

Tailwind is imported as a reset/utility layer only — nearly every rule is handwritten CSS against the tokens. You never need Tailwind classes to restyle this site.

---

## 11. Design system, themes and motion

### Tokens

All colour, type and timing live in `src/index.css` on `:root` and `[data-theme='dark'|'light']`.

| Token | Role |
|---|---|
| `--bg --bg-2 --bg-3` | page, elevated, inset surfaces |
| `--ink --ink-2 --ink-3` | primary, secondary, mute text |
| `--line --line-2` | hairlines |
| `--accent` | signal colour — vermilion `#ff4a1c` on dark, ultramarine `#1f3bff` on light |
| `--accent-ink` | text on accent |
| `--hi` | secondary accent |
| `--serif --sans --mono` | Instrument Serif · Archivo (variable width 62–125%) · JetBrains Mono |
| `--pad --gap --hdr` | page padding, grid gap, header height |
| `--ease --ease-out --t-fast --t-med --t-hover` | motion |

The two themes are designed as two experiences, not an inversion: dark is a carbon archive with a vermilion signal and faint scanlines; light is newsprint with an ultramarine stamp and paper grain. Switch themes by toggling `data-theme` on `<html>` — the `T` key and the header button already do this. Per-project `accent` overrides `--accent` on that project’s `<article>`.

### Type

Self-hosted, SIL Open Font License, in `public/fonts/`: **Archivo** variable width (condensed for display), **Instrument Serif** roman + italic (ledes, quotes, listing titles), **JetBrains Mono** (metadata, chips, code, status bar). Fallbacks are declared in the tokens, and `index.html` preloads Archivo and Instrument Serif.

### Motion rules

- Hover responses animate **transform and opacity** (plus `font-stretch`, which does not reflow). Padding-on-hover was removed deliberately — it causes layout thrash.
- Pointer-driven values (`--mx --my --tx --ty --rx --ry`) are **registered** `@property`s so CSS can transition them instead of stepping.
- Canvases pause off-screen and when the document is hidden.
- `prefers-reduced-motion: reduce` disables animations and transitions globally, skips the page wipe, shows Reveals immediately and starts experiments paused.

If a hover feels choppy, the cause is almost always a layout-triggering property (`padding`, `border-width`, `top`, `font-style`). Move it to `transform`.

### Where to restyle what

| Target | File |
|---|---|
| Colours, fonts, spacing, reduced motion | `src/index.css` |
| Header, footer, homepage, Tech index, palette, status bar | `src/styles/components.css` |
| Images, treatments, gallery, lightbox, player, code, experiments | `src/styles/media.css` |
| Project page, Photo/Music sections, about, journal, 404 | `src/styles/pages.css` |

Class names are short and namespaced (`.hdr`, `.tile`, `.row`, `.player`, `.proj__`, `.shelf`). Grep is the right way to find them.

---

## 12. Interactive systems

### 12.1 Image treatments (Photo)

Declared per `ImageAsset` as `effect`; implemented in `Cover.tsx` → `EffectImage`.

| Effect | How |
|---|---|
| `dither` | Ordered 4×4 Bayer threshold drawn to a canvas overlay. A radial CSS mask follows the cursor, so the photograph surfaces where you look. |
| `halftone` | Dot screen, same mask. |
| `pixel` | Downsample then upscale, same mask. |
| `parallax` | The image is scaled up and tilted via `--rx/--ry/--tx/--ty`. |
| `distort` | SVG `feTurbulence` + `feDisplacementMap`. The displacement **scale** eases toward the cursor in its own rAF loop; `baseFrequency` stays constant (animating it per event is what made it stutter). |

The Photo page shows one of each as a demonstration, independent of which project an image belongs to.

### 12.2 Experiments

All five live in `src/components/experiments.tsx`. Each is embedded on the detail page of the project that declares it via `experiment`; the FlowField also appears on the homepage and the 404.

| id | What | Input |
|---|---|---|
| `flowfield` | Particles in a value-noise current | Pointer stirs; press-drag for a storm; “New weather” reseeds; optional Web Audio tone driven by particle speed |
| `typefield` | A word sampled into spring-loaded particles | Type a word (≤12 chars); the pointer scatters points |
| `shader` | Raw WebGL full-screen quad, two interfering wave sources | Pointer moves the sources; falls back to a message without WebGL |
| `markov` | Character n-gram model trained **in the browser** on this site’s own text | Order 2–7, temperature 0.3–3, resample. Nothing leaves the page. |
| `entropy` | Password-strength estimator | Typed locally, never stored or transmitted. Educational model only. |

To add a sixth: extend `ExperimentId` in `types.ts`, write the component and add a `case` in `<Experiment>`, then set `experiment: 'your-id'` on a project.

### 12.3 Procedural audio

`src/lib/synth.ts` is a small offline studio. It exists so the demo archive can be cloned without shipping recordings and so a visitor on a slow connection still hears something. For real releases, use `src` — the player does not care which path produced the buffer. Recipes are cached in memory for the session; changing `seed`, `seconds`, `root` or `kind` produces a new buffer.

---

## 13. Keyboard, accessibility and performance

### Shortcuts

| Keys | Action |
|---|---|
| `⌘K` / `Ctrl K` / `/` | Command palette |
| `G` then `H` `P` `M` `T` `J` `B` | Index · Photo · Music · Tech · Journal · About |
| `R` | Random project |
| `T` | Toggle theme |
| `?` | Shortcuts dialog |
| `Esc` | Close menu / dialog |
| `← → + − 0 I Esc` | Lightbox: move, zoom, reset, EXIF, close |
| `Space` `← →` `Home` `End` | Audio waveform: play/pause, seek ±5s, jump |

Shortcuts are ignored while typing in a field and while the lightbox is open. `G T` (Tech) and plain `T` (theme) coexist because the `G` prefix opens a short window.

### Accessibility

Semantic landmarks; a skip link as the first focusable element; focus moves to `<main>` on route change; visible `:focus-visible` ring; `aria-current` on the active nav item; `aria-pressed` on toggles; `role="dialog"` + `aria-modal` on the palette, lightbox and shortcuts; the waveform is a `role="slider"` with `aria-valuetext`; images have `alt` and generative canvases have `role="img"` + `aria-label`; reduced motion honoured globally; contrast designed against both palettes.

Known limits: the experiments are pointer-first (the Markov and entropy ones are fully keyboard-operable; the canvas ones are not).

### Performance

One inlined JS/CSS payload (~118 kB gzipped). Images are lazy, async-decoded, srcset’d and dimensioned. Canvases pause off-screen, batch fills with `Path2D` instead of switching `fillStyle` per particle, read a cached palette, and take rAF-throttled pointer writes. Audio is decoded on demand and never autoplays. Hover animation sticks to transform/opacity, with `will-change` only on images that actually zoom.

Prefer a hundred lines in `src/lib` to a new dependency — that has been the rule throughout.

---

## 14. Scripts and configuration

**`scripts/optimize-images.sh`** — walks `public/images` for `jpg/jpeg/png` and writes `-640.webp` / `-1600.webp` beside each original (quality 78, metadata stripped), skipping files that already exist.

**`scripts/generate-sitemap.mjs`** — reads slugs from `src/data/projects.ts` and `src/data/site.ts` (keep writing them as `slug: 'this-form'`) and writes `public/sitemap.xml` for the pages `'' photo music tech journal about`.

**`wrangler.jsonc`** — `assets.directory: ./dist`, `not_found_handling: single-page-application`. Rename `"name"` to your Workers project.

**`vite.config.ts`** — React, Tailwind, `vite-plugin-singlefile` (inlines JS/CSS into `index.html`), `@` → `src/`. Don’t remove the single-file plugin unless you change how the build is served.

**`public/_headers`** — year-long immutable caching for `/images/*` and `/fonts/*`. Cloudflare honours it; other hosts may ignore it.

**`public/robots.txt`** — allow all, sitemap URL. Update the origin when you have a domain.

---

## 15. First-run checklist

1. **Identity** — `SITE` in `src/data/site.ts`: `url`, `author`, `location`, `email`, `socials`. Then the same URL in `index.html` and `robots.txt`, and regenerate the sitemap.
2. **About** — replace the `<mark>[EDIT …]</mark>` copy in `src/pages/About.tsx`; add a portrait if you want one.
3. **Contact** — real email and socials; delete the rows you don’t use. The footer and About button pick the email up automatically.
4. **Demo projects** — delete the ones you don’t want, or keep a couple as examples and leave `demo: true` on them. Grep for removed slugs afterwards.
5. **Your first real project** — §6, required fields only to start.
6. **Media** — §7, then run the image script.
7. **Journal** — replace the four demonstration entries.
8. **Activity / NOW** — write what you are actually doing.
9. **Favicon and OG image** — `public/favicon/favicon.svg`, `public/images/og.jpg` (1200×630).
10. **Accent** (optional) — `--accent` in `src/index.css`.
11. **Build and click through** — `npm run build && npm run preview`: all five nav items on desktop and at phone width, open a project, play audio, open the lightbox, press `⌘K`, toggle the theme.
12. **Sitemap** — `SITE_URL=… node scripts/generate-sitemap.mjs`.
13. **Deploy** — `npx wrangler deploy`, or upload `dist/`.

---

## 16. Troubleshooting

**Blank page.** Open the console. `ReferenceError: Cannot access 'X' before initialization` means a `const` is used above its declaration. Missing fonts do not blank the page — the type just falls back.

**Fonts look like Arial/Times.** `public/fonts/*.woff2` must exist and start with the bytes `wOF2`. The HTML preloads `/fonts/archivo-wdth.woff2` and `/fonts/instrument-serif.woff2`; served from a subpath, those absolute URLs 404 — host at the domain root or change the `@font-face` urls.

**A project 404s.** The slug must match `slug:` exactly, and the route is `#/project/<slug>` (singular).

**A project is missing from its section.** Section membership comes from `category` + `disciplines` (§5.3). Music additionally requires an `audio` field. The Photo page hides projects that carry an `experiment`.

**Images missing.** Paths are root-absolute (`/images/…`) and map to `public/images/…`. `variants: true` without the WebP siblings 404s the `<source>`, but the JPEG fallback still renders. Check the Network tab.

**Audio silent.** Browsers block autoplay, so a click is required. `synth` tracks show “Rendering audio…” for a second or two the first time. `src` tracks 404 if the file is not in `public/`. Safari is picky about codecs — prefer mp3/aac.

**Spectrogram empty.** It only draws while audio is playing (it needs an AnalyserNode).

**Hover animations stuck.** `prefers-reduced-motion: reduce` is on — the CSS kills transitions on purpose.

**Theme not persisting.** `localStorage` is blocked (private mode, some iframes). It still toggles for the session.

**TypeScript error after adding a project.** Almost always a misspelled `category`, `status`, `galleryLayout`, `experiment` or `audio.format`, or a missing required field. The error names the field.

**`npm run build` fails.** The build command is fixed to `vite build`. Keep new code in `src/` and avoid adding dependencies.

**I want a backend / CMS / contact form.** Out of scope by design. A Cloudflare Worker in front of the assets could proxy a form POST or read from R2, but that leaves the static-archive contract — document it here if you add one.

---

## 17. What was removed in the simplification

The site was reduced from twelve navigable areas to five sections. Removed, with the reason:

| Removed | Why / where it went |
|---|---|
| `/archive` (general index) | Replaced by **Tech**, a curated technical index. Photo and Music have their own sections. |
| `/visual`, `/sound` routes | Renamed to `/photo` and `/music`. The pages themselves are unchanged. |
| `/film` + `Video.tsx` + the `video` field, `VideoAsset` type, `public/video/` | No section needed them. YouTube/Vimeo/local-file playback is gone; re-add from git history if a film section returns. |
| `/lab` | Its five experiments now live on the Tech projects that declare them. |
| `/map` + `RelationMap.tsx` + `buildGraph()` | Standalone visualisation with no section to belong to. |
| `/skills` | Its tool list was inferred from project metadata, which is still shown in each project’s sidebar and is searchable from Tech. |
| `/activity` | The log survives as the homepage “Currently” panel, fed by `activity` in `site.ts`. |
| `/contact` | Email, location and socials moved to the footer and the About sidebar. |
| Editorial archive view (`ProjectEditorial`) | Tech keeps one list view. Tiles remain for related projects and the Photo grid. |
| Year histogram, featured-only toggle, sort select, view switcher | Redundant controls on a focused index. Search, discipline, status and tag filters are kept. |
| The `film` discipline | No film section. |
| `tunnel-vision` project and three unreferenced images | Film-only demo content. |

Kept deliberately: both themes, the typography, every gallery layout, the lightbox, all five image treatments, the whole audio player, all five experiments, code highlighting, diagrams, timelines, the command palette, recently-viewed, random project, breadcrumbs and the reduced-motion behaviour.

*If you change the content model, update §5 in the same commit.*
