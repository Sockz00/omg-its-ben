const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadTypeScript(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(js, filename);
  return mod.exports;
}

test('site content is read from the files edited by Pages CMS', () => {
  const content = loadTypeScript('src/data/content.ts');
  const site = require('../src/data/site.json');
  const projects = require('../src/data/projects.json');
  const photos = require('../src/data/photos.json');
  assert.equal(content.heroTitle, site.heroTitle);
  assert.equal(content.aboutIntro, site.aboutIntro);
  assert.deepEqual(content.projects, projects.items);
  assert.equal(content.photosIntro, photos.intro);
  assert.deepEqual(content.photos, photos.items);
});

test('About text and image stack are read from the CMS file', () => {
  const about = loadTypeScript('src/data/about.ts');
  const data = require('../src/data/about.json');
  assert.deepEqual(about.aboutSections, data.sections);
  assert.deepEqual(about.aboutImages, data.images);
});

test('uploaded images use their own path without old CDN variants', () => {
  const { imageSrc, imageSrcSet } = loadTypeScript('src/data/content.ts');
  const image = { type: 'image', file: '/images/new-photo.jpg', widths: [500], full: 1200 };
  assert.equal(imageSrc(image), '/images/new-photo.jpg');
  assert.equal(imageSrcSet(image), undefined);
});

test('original CDN images keep their responsive variants', () => {
  const { imageSrc, imageSrcSet } = loadTypeScript('src/data/content.ts');
  const image = { type: 'image', file: 'example.avif', widths: [500], full: 1200 };
  assert.match(imageSrc(image), /example\.avif$/);
  assert.match(imageSrcSet(image), /example-p-500\.avif 500w/);
});

test('uploaded videos use the uploaded file instead of CDN-generated URLs', () => {
  const { videoSources } = loadTypeScript('src/data/content.ts');
  const video = videoSources('/videos/example.webm');
  assert.equal(video.webm, '/videos/example.webm');
  assert.equal(video.mp4, undefined);
  assert.equal(video.poster, undefined);
});
