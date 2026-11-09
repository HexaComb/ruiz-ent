import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { servicePages, servicePagePath } from '../src/data/service-pages.ts';
import { serviceAreas } from '../src/data/service-areas.ts';

test('three separate, unique service targets with existing media and distinct estimate defaults', () => {
  assert.deepEqual(servicePages.map(page => page.slug), ['concrete', 'masonry', 'general-engineering']);
  assert.equal(new Set(servicePages.map(page => page.title)).size, servicePages.length);
  assert.equal(new Set(servicePages.map(page => page.description)).size, servicePages.length);
  assert.equal(new Set(servicePages.map(page => page.defaultProjectType)).size, servicePages.length);
  for (const page of servicePages) {
    assert.equal(servicePagePath(page.slug), '/services/' + page.slug + '/');
    assert.ok(page.description.length <= 165);
    assert.ok(page.offerings.length >= 5);
    assert.equal(page.faq.length, 3);
    for (const photo of [page.heroImage, page.detailImage]) {
      assert.ok(photo.alt.length > 10);
      assert.ok(existsSync(new URL('../public' + photo.src, import.meta.url)), 'real image: ' + photo.src);
    }
  }
});

test('service pages preserve the six approved Google Profile service areas', () => {
  assert.deepEqual(serviceAreas.map(area => area.name), ['Kingsburg', 'Fresno', 'Madera', 'Visalia', 'Fowler', 'Hanford']);
  const template = readFileSync(new URL('../src/components/ServiceLandingPage.astro', import.meta.url), 'utf8');
  assert.match(template, /serviceAreas\.map/);
  assert.match(template, /<QuoteBuilder defaultProjectType=\{page\.defaultProjectType\}/);
  assert.match(template, /href="#quote-builder"/);
  assert.doesNotMatch(template, /<HeroBanner/);
});

test('form default project type is prop-driven without altering confirmed GA4 lead semantics', () => {
  const form = readFileSync(new URL('../src/components/QuoteBuilder.astro', import.meta.url), 'utf8');
  for (const page of servicePages) {
    assert.ok(form.includes("defaultProjectType === '" + page.defaultProjectType + "'"));
  }
  assert.match(form, /'sent' in result && result.sent === true/);
  assert.equal(form.match(/trackEvent\('generate_lead'/g).length, 1);
});
