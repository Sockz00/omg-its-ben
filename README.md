# Ben Wroth portfolio

React, TypeScript and Vite portfolio. Project and photo content is in `src/data/content.ts`; about-page content is in `src/data/about.ts`. Images, video and fonts are loaded from the original site's external CDN.

```sh
npm ci
npm run dev
npm run build
```

Cloudflare builds the site from this repository. Its static output is `dist/`, configured in `wrangler.jsonc`. The previous site's source and content remain available in the repository's earlier commits.
