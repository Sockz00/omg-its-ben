# Ben Wroth portfolio

React, TypeScript and Vite portfolio. Edit the website through [Pages CMS](https://app.pagescms.org/) by selecting this repository and its `main` branch. The homepage introductions, projects, photo gallery, and About page each have an editor. Save changes in Pages CMS to commit them to GitHub and trigger the Cloudflare rebuild.

Images and videos can be uploaded in Pages CMS. Existing media and fonts are loaded from the original site's external CDN. In the About image stack, keep the existing position IDs when replacing images. Existing CDN videos use an ID; choosing an uploaded video overrides that ID.

The CMS configuration is `.pages.yml`, and content is stored in the JSON files in `src/data/`. The TypeScript files in that folder provide the types and media handling used by the site.

```sh
npm ci
npm run dev
npm run build
node --test tests/cms-content.test.cjs
```

Cloudflare builds the site from this repository. Its static output is `dist/`, configured in `wrangler.jsonc`. The previous site's source and content remain available in the repository's earlier commits.
