const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadSettings() {
  const filename = path.resolve(__dirname, '../src/lib/ascii-settings.ts');
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(js, filename);
  return mod.exports;
}

test('CMS settings preserve a local model, colours and motion choices', () => {
  const { normalizeBackgroundSettings } = loadSettings();
  const settings = normalizeBackgroundSettings({ model: '/models/face.glb', color: '#b03060', backgroundColor: '#fafafa', opacity: 0.4, rotationY: -0.7, characters: ' .#@', fontSize: 12, animationSpeed: 2, lightIntensity: 3 });
  assert.equal(settings.model, '/models/face.glb');
  assert.equal(settings.color, '#b03060');
  assert.equal(settings.backgroundColor, '#fafafa');
  assert.equal(settings.opacity, 0.4);
  assert.equal(settings.rotationY, -0.7);
  assert.equal(settings.characters, ' .#@');
  assert.equal(settings.fontSize, 12);
  assert.equal(settings.animationSpeed, 2);
  assert.equal(settings.lightIntensity, 3);
});

test('invalid, missing and unsafe settings fall back to usable bounds', () => {
  const { normalizeBackgroundSettings } = loadSettings();
  const settings = normalizeBackgroundSettings({ model: 'https://example.com/model.glb', color: 'not-a-colour', opacity: 7, fontSize: 0, characters: '' });
  assert.equal(settings.model, '');
  assert.match(settings.color, /^#[0-9a-f]{6}$/i);
  assert.ok(settings.opacity >= 0 && settings.opacity <= 1);
  assert.ok(settings.fontSize >= 6);
  assert.ok(settings.characters.length >= 2);
  assert.doesNotThrow(() => normalizeBackgroundSettings(null));
});

test('portrait screens move the camera back so wide models fit', () => {
  const { cameraDistanceForViewport } = loadSettings();
  assert.equal(cameraDistanceForViewport(1200, 800), 4.8);
  assert.ok(cameraDistanceForViewport(390, 844) > 9);
  assert.ok(Number.isFinite(cameraDistanceForViewport(0, 0)));
});
