# AGENTS.md

Astro v6 static portfolio site, deployed to Cloudflare Pages via wrangler.

## Commands

- `npm run dev` — start dev server
- `npm run build` — static build to `./dist`
- `npm run preview` — preview the production build
- `npm run deploy` — runs `npm run build` then `wrangler deploy` (order matters; deploy builds first)

No test runner, linter, formatter, or CI is configured. `tsconfig.json` extends `astro/tsconfigs/strict` and excludes `dist`.

## Architecture / entrypoints

- `astro.config.mjs` — `output: 'static'`, `site` is currently placeholder `https://example.com` (replace with real domain before deploying)
- `wrangler.jsonc` — assets directory `./dist`, `compatibility_date: 2026-10-26`
- `src/data/projects.ts` — single source of truth for all project entries (`Project[]`). When adding work, add here and keep each `slug` unique.
- `src/layouts/BaseLayout.astro` — shared layout; takes `title` and `description` props
- `src/components/` — `ProjectCard.astro`, `SiteHeader.astro`, `SiteFooter.astro`
- `src/pages/` — `index.astro`, `archive.astro`, `projects/`
- `src/styles/global.css` — global styles

## Conventions

- Pages are Astro components with frontmatter scripts at the top.
- Project data lives in `src/data/projects.ts`; components consume it via typed props (`Project` type).
- Accent colors and category symbols are keyed off `project.accent` and `project.category` in `ProjectCard.astro`.

## Homepage behaviors

- `src/pages/index.astro` shows a full-screen "Enter the archive" overlay before the homepage content. Clicking "ENTER" dismisses it (client-side, no persistence) — it appears on every homepage visit. Keep this in mind when editing the page structure or frontmatter.

## Shared layout behaviors (`src/layouts/BaseLayout.astro`)

- A custom mouse cursor (`#cursor`) follows the pointer and grows on hover over interactive elements (`a`, `button`, `.project-card`, etc.). It uses `mix-blend-mode: difference`.
- Sections with the `.reveal` class fade in on scroll via an `IntersectionObserver` (threshold 0.12). Added to homepage sections and archive items.
- `main` has a page-entrance fade (`@keyframes fadeIn`).
- `prefers-reduced-motion` disables all transitions/animations.

## Gotchas

- `.gitignore` excludes `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars`, `.DS_Store`.
- `site` in `astro.config.mjs` is a placeholder — update before publishing.
- No CI/CD workflows exist; deployment is manual via `npm run deploy` (requires `wrangler` CLI authenticated).
- Remote: `origin` -> `https://github.com/Sockz00/omg-its-ben.git`, default branch `main`.
