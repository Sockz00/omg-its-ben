# OMG, IT'S BEN

A static, art-directed portfolio in five sections: **Photo · Music · Tech · Journal · About**.

> **Demonstration content.** Eight projects ship with the site to exercise the machinery. They are labelled **Demo** everywhere and are not real work. Values in `[EDIT …]` are placeholders, images are AI-generated stand-ins, and demo audio is synthesised in the browser.

**The complete manual — every file, every field, how to add work, how the player and experiments work — is [DOCUMENTATION.md](./DOCUMENTATION.md).**

---

## Run

```bash
npm install
npm run dev        # local dev server
npm run build      # production → dist/  (~118 kB gzipped)
npm run preview    # serve dist/ locally
```

## Deploy (Cloudflare Workers static assets)

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` is already configured. No Worker script or secrets required.

## Routes

```
#/            homepage
#/photo       photography, digital art, drawing, design
#/music       releases — custom player (waveform, spectrogram, stems, markers)
#/tech        software, AI, security, hardware, creative code — searchable index
#/project/x   a project's full case study
#/journal     writing, and #/journal/x for one entry
#/about       profile
```

## The only files you edit to add work

| File | What |
|---|---|
| `src/data/projects.ts` | Projects. Add an object; the section pages, Tech filters, palette and detail page update themselves. |
| `src/data/site.ts` | Name, email, socials, “currently”, journal, activity. |
| `public/images/…`, `public/audio/…` | Media. Then `bash scripts/optimize-images.sh` for WebP variants. |

A project lands in a section through its `category`/`disciplines`; Music also needs an `audio` field. Field-by-field reference: **DOCUMENTATION.md §5–§7**. First-run checklist: **§15**.

## Stack

React + TypeScript + Vite, hash-routed, no backend, no trackers. React is the only runtime library — galleries, lightbox, audio player, WebGL, syntax highlighting and motion are hand-written. Fonts (Instrument Serif, Archivo, JetBrains Mono) are SIL OFL and self-hosted.

Contact details live in the footer and on About. There is no contact form: a static site cannot deliver submissions.
