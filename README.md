# Personal Creative Archive

A fully custom, responsive multidisciplinary portfolio built with Astro. Static output is deployed to Cloudflare Workers. All layout, styling, content and behaviour are owned in this repository.

## Requirements

- Node.js 22.12.0 or newer (recommended for current Astro releases)
- npm
- A Cloudflare account for deployment

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Astro.

## Add or edit projects

Edit `src/data/projects.ts`. Each project becomes an archive card and a detail page automatically. Use a unique `slug`. Available categories are `Visual art`, `Photography`, `Music`, `Film`, `Creative technology`, and `Research`.

The current artwork panels are intentionally generated with CSS so the site works immediately without stock imagery. Replace them with your own images, video embeds, audio players or custom components as you add real projects. Put local assets in `public/` and reference them with paths such as `/images/my-photo.webp`.

## Personalise the site

- Replace `Ben` in page titles and the `B.` monogram in `src/components/SiteHeader.astro`.
- Replace `hello@example.com` in `src/pages/index.astro` with your contact email.
- Update the footer location in `src/components/SiteFooter.astro` if desired.
- Replace `https://example.com` in `astro.config.mjs` with your actual canonical site URL after choosing a domain.
- Change colours, typography and layout in `src/styles/global.css`.

## Deploy to Cloudflare Workers

This is a static Astro site; it does not need the Astro Cloudflare SSR adapter.

1. Create a GitHub repository and push this project.
2. Install dependencies: `npm install`.
3. Build locally: `npm run build`.
4. Log in to Cloudflare: `npx wrangler login`.
5. Deploy: `npx wrangler deploy`.
6. Cloudflare will provide a `workers.dev` URL. Add a custom domain from the Workers & Pages dashboard when you own one.

The `wrangler.jsonc` file points Cloudflare at the generated `dist/` directory. Update `compatibility_date` when you next review the deployment configuration.

## Project structure

```text
src/
  components/    Shared header, footer and project card
  data/          Editable project catalogue
  layouts/       Base HTML document and theme behaviour
  pages/         Homepage, archive and generated project pages
  styles/        Global design system and responsive styling
public/          Your images, video poster frames, icons and other static assets
```

## Notes

- Theme options: system, dark and light. The selection is saved in local browser storage.
- Archive search matches project title, description, category and medium.
- Category filters and project pages are generated from the same project data.
- The sample project entries are placeholders. Replace descriptions, links and details with your own work before publishing.
- Google Fonts are currently loaded remotely. Self-host font files if you want the site to avoid third-party font requests.
