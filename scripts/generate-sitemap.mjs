// Generates public/sitemap.xml from the content files. Run: node scripts/generate-sitemap.mjs
// Set SITE_URL to your production origin, e.g. SITE_URL=https://example.com node scripts/generate-sitemap.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const SITE = process.env.SITE_URL ?? 'https://omg-its-ben.example';
const slugs = (file) => [...readFileSync(file, 'utf8').matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const pages = ['', 'photo', 'music', 'tech', 'journal', 'about'];
const urls = [
  ...pages.map((p) => (p ? `${SITE}/#/${p}` : `${SITE}/`)),
  ...slugs('src/data/projects.ts').map((s) => `${SITE}/#/project/${s}`),
  ...slugs('src/data/site.ts').map((s) => `${SITE}/#/journal/${s}`),
];
const today = new Date().toISOString().slice(0, 10);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`sitemap.xml: ${urls.length} urls`);
