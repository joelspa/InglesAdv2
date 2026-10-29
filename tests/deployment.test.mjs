import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Vercel serves a complete static application with no server dependency', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const entry = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.equal(config.framework, 'vite');
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.installCommand, 'npm ci');
  assert.ok(config.rewrites.some(rule => rule.destination === '/index.html'));
  assert.equal(pkg.dependencies.express, undefined);
  assert.doesNotMatch(app, /fetch\(|\/api\//);
  assert.doesNotMatch(styles, /@import\s+url/, 'fonts are bundled, not loaded from a CDN');
  assert.match(entry, /@fontsource\/nunito/);
  assert.match(styles, /prefers-reduced-motion/);
});
