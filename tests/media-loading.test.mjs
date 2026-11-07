import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('hero and showcase have no eagerly discoverable video sources or autoplay', () => {
  for (const component of ['HeroBanner', 'BeforeAfterShowcase']) {
    const markup = source(`src/components/${component}.astro`).split('<style>')[0];
    assert.doesNotMatch(markup, /\sautoplay(?:\s|>)/);
    assert.doesNotMatch(markup, /<source\s+src=/);
    assert.match(markup, /<source\s+data-src=/);
    assert.match(markup, /preload="none"/);
  }
});

test('hero is responsive, high priority, build-optimized and explicitly dimensioned', () => {
  const hero = source('src/components/HeroBanner.astro');
  assert.match(hero, /import.*heroImage.*\.jpg/);
  assert.match(hero, /import.*mobileHeroImage.*mobile\.webp/);
  assert.match(hero, /<source media="\(max-width: 480px\)"/);
  assert.match(hero, /widths: \[640, 768, 1280, 1468\]/);
  assert.match(hero, /widths=\{\[960, 1280, 1920, 2200\]\}/);
  assert.match(hero, /width=\{2200\}/);
  assert.match(hero, /sizes="\(max-width: 640px\) 1000px, 100vw"/);
  assert.match(hero, /format="webp"/);
  assert.match(hero, /loading="eager"/);
  assert.match(hero, /fetchpriority="high"/);
  assert.doesNotMatch(hero, /poster=".*\.jpg"/);
  assert.match(source('astro.config.mjs'), /imageService: 'compile'/);
});

test('only fingerprinted assets receive immutable caching, not HTML or stable media URLs', () => {
  const headers = source('public/_headers');
  assert.match(headers, /\/_astro\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  for (const dir of ['images', 'videos']) {
    assert.match(headers, new RegExp(`/${dir}/\\*\\s+Cache-Control: public, max-age=86400(?:\\n|$)`));
  }
  assert.doesNotMatch(headers, /^\/\*|^\/\s|\.html/m);
});
