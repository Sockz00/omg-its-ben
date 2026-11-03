const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');

test('wave reaches the farthest screen corner from the button', () => {
  const filename = path.resolve(__dirname, '../src/lib/wave.ts');
  const source = fs.readFileSync(filename, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = new Module(filename, module);
  mod._compile(js, filename);
  assert.equal(mod.exports.waveRadius(20, 30, 100, 90), 100);
  assert.equal(mod.exports.waveRadius(50, 50, 100, 100), Math.hypot(50, 50));
});
