import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('404 uses the shared brand, noindex and explicit recovery links without redirecting', () => {
  const page = source('src/pages/404.astro');
  assert.match(page, /import Layout/);
  assert.match(page, /\bnoindex\b/);
  assert.match(page, /href="\/"/);
  assert.match(page, /href="\/#quote-builder"/);
  assert.match(page, /aria-labelledby="not-found-heading"/);
  assert.doesNotMatch(page, /Astro.redirect|http-equiv|window.location/);
});
test('error metadata does not canonicalize missing pages to the homepage', () => {
  const layout = source('src/layouts/Layout.astro');
  assert.match(layout, /noindex = false/);
  assert.match(layout, /!noindex && <link rel="canonical"/);
  assert.match(layout, /noindex \? "noindex, follow"/);
});
test('shared navigation preserves home anchors and recovers from missing URLs', () => {
  for (const component of ['Header', 'Footer']) {
    const content = source(`src/components/${component}.astro`);
    assert.match(content, /Astro.url.pathname === "\/" \? "" : "\/"/);
    // The Services nav now opens the searchable hub; home-only anchors still recover from other pages.
    assert.match(content, /href="\/services\/"/);
    assert.match(content, /href=\{`\$\{homePath\}#our-work`\}/);
    assert.doesNotMatch(content, /href="#/);
  }
});
