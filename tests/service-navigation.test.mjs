import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estimateHref, serviceNavigationTarget } from '../src/lib/service-navigation.ts';
import { servicePages, servicePagePath } from '../src/data/service-pages.ts';
import { serviceAreas, serviceAreaPath } from '../src/data/service-areas.ts';

test('estimate links stay on pages with a form and recover to home everywhere else', () => {
  assert.equal(estimateHref('/'), '#quote-builder');
  for (const page of servicePages) {
    const path = servicePagePath(page.slug);
    assert.equal(estimateHref(path), '#quote-builder');
    assert.equal(estimateHref(path.slice(0, -1)), '#quote-builder');
    assert.ok(serviceNavigationTarget(path), 'every service needs a fixed navigation label');
  }
  for (const area of serviceAreas) {
    const path = serviceAreaPath(area.slug);
    assert.equal(estimateHref(path), '#quote-builder');
    assert.equal(estimateHref(path.slice(0, -1)), '#quote-builder');
  }
  for (const path of ['/services/', '/service-areas/', '/service-areas/selma/', '/404', '/missing/', '/services/concrete/missing/']) {
    assert.equal(estimateHref(path), '/#quote-builder', path);
  }
});

test('header, mobile menu and footer share the tested estimate destination', () => {
  for (const [component, count] of [['Header', 2], ['Footer', 1]]) {
    const source = readFileSync(new URL(`../src/components/${component}.astro`, import.meta.url), 'utf8');
    assert.match(source, /const estimateLink = estimateHref\(Astro.url.pathname\)/);
    assert.equal(source.match(/href=\{estimateLink\}/g).length, count);
    assert.doesNotMatch(source, /\$\{homePath\}#quote-builder/);
  }
});
