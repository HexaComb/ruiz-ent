import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cityPage = fs.readFileSync(new URL('../src/pages/service-areas/[city].astro', import.meta.url), 'utf8');
const areas = fs.readFileSync(new URL('../src/data/service-areas.ts', import.meta.url), 'utf8');
const quote = fs.readFileSync(new URL('../src/components/QuoteBuilder.astro', import.meta.url), 'utf8');
const analytics = fs.readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');

test('Kingsburg intent content is Kingsburg-only and leads to existing services and estimate form', () => {
  assert.match(cityPage, /area\.slug === 'kingsburg' && \(\s*<Section variant="light" ariaLabelledby="kingsburg-concrete-heading">/);
  for (const heading of ['Concrete driveway installation or replacement', 'Concrete patios and stamped finishes', 'Block walls and site improvements']) {
    assert.ok(cityPage.includes(heading), `Missing Kingsburg intent: ${heading}`);
  }
  for (const link of ['/services/concrete/', '/services/masonry/', '/services/general-engineering/', '#quote-builder']) {
    assert.ok(cityPage.includes(`href="${link}"`), `Missing service or lead path: ${link}`);
  }
  assert.match(cityPage, /No exact price or start date is assumed/);
});

test('Kingsburg remains a service-area page without invented local project proof', () => {
  assert.match(cityPage, /Individual photo locations are not specified/);
  assert.match(cityPage, /this page does not represent a separate office/);
  assert.match(areas, /slug: 'kingsburg', name: 'Kingsburg'/);
  assert.match(areas, /Free on-site estimates\./);
});

test('successful-form lead event remains single and gated on API delivery', () => {
  assert.match(quote, /if \(response\.ok\) \{\s*if \('sent' in result && result\.sent === true\)/);
  assert.equal(quote.match(/trackEvent\('generate_lead'/g)?.length, 1);
  assert.match(analytics, /'generate_lead'/);
  assert.match(analytics, /approvedCities/);
});
