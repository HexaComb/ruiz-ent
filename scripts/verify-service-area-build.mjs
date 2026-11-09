// Checks the actual prerendered output after npm run build, not just source text.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serviceAreas, serviceAreaPath } from '../src/data/service-areas.ts';
import { servicePages, servicePagePath } from '../src/data/service-pages.ts';
const root = 'dist/client';
const origin = 'https://ruizfamilyhardscapes.biz';
const routes = ['/', '/service-areas/', ...serviceAreas.map(area => serviceAreaPath(area.slug)), '/services/', ...servicePages.map(page => servicePagePath(page.slug))];
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(locations.sort(), routes.map(route => `${origin}${route}`).sort());
const titles = new Set(); const descriptions = new Set();
for (const route of routes) {
  const html = readFileSync(join(root, route, 'index.html'), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: one h1`);
  assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`), `${route}: self canonical`);
  assert.ok(html.includes(`property="og:url" content="${origin}${route}"`), `${route}: OG URL`);
  assert.ok(html.includes('content="index, follow'), `${route}: indexable`);
  assert.ok(html.includes(`data-analytics-path="${route}"`), `${route}: safe reporting path`);
  assert.doesNotMatch(html, /workers\.dev\/images\/social/);
  titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
  descriptions.add(html.match(/name="description" content="(.*?)"/s)[1]);
  const schemaMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(schemaMatch, `${route}: valid JSON-LD`);
  const schema = JSON.parse(schemaMatch[1]);
  assert.equal(schema['@graph'][0].areaServed.length, 6);
  assert.doesNotMatch(schemaMatch[1], /streetAddress|postalCode|aggregateRating|openingHours|LocalBusiness/);
  const city = serviceAreas.find(area => route === serviceAreaPath(area.slug));
  if (city) {
    assert.equal(schema['@graph'][1].areaServed.name, `${city.name}, California`);
    assert.equal(schema['@graph'][1].provider['@id'], `${origin}/#organization`);
    assert.equal(schema['@graph'][2].itemListElement.at(-1).item, `${origin}${route}`);
    assert.ok(html.includes(city.resource.url));
    assert.ok(html.includes('href="/#quote-builder"'));
    assert.ok(html.includes('href="tel:+15592441922"'));
  }
  const service = servicePages.find(page => route === servicePagePath(page.slug));
  if (service) {
    assert.equal(schema['@graph'][1]['@id'], origin + route + '#service');
    assert.equal(schema['@graph'][1].provider['@id'], origin + '/#organization');
    assert.equal(schema['@graph'][1].areaServed.length, 6);
    assert.equal(schema['@graph'][2].itemListElement.at(-1).item, origin + route);
    assert.ok(html.includes('id="quoteForm"'), route + ': on-page estimate form');
    assert.ok(html.includes('href="#quote-builder"'), route + ': on-page estimate CTA');
    assert.equal(html.includes('href="/#quote-builder"'), false, route + ': all estimate links stay on-page');
    assert.ok(html.includes(service.heroImage.src), route + ': existing hero image');
    assert.ok(html.includes('href="tel:+15592441922"'), route + ': call option');
  }
  // Internal page links must point to files that were actually generated.
  for (const match of html.matchAll(/href="(\/[^"?#]*)[^"]*"/g)) {
    const href = match[1];
    const target = href.endsWith('/') ? join(root, href, 'index.html') : join(root, href);
    assert.ok(existsSync(target), `${route}: missing internal target ${href}`);
  }
  const areaNav = html.match(/<nav[^>]*aria-label="Service areas"[^>]*>(.*?)<\/nav>/s)?.[1];
  assert.ok(areaNav, `${route}: shared coverage navigation`);
  assert.doesNotMatch(areaNav, /Modesto|Selma|Clovis|Chowchilla|Merced|Atwater|Turlock/);
}
assert.equal(titles.size, routes.length, 'unique titles');
assert.equal(descriptions.size, routes.length, 'unique descriptions');
const missing = readFileSync(join(root, '404.html'), 'utf8');
assert.ok(missing.includes('noindex, follow'));
assert.equal(missing.includes('application/ld+json'), false);
assert.equal(missing.includes('rel="canonical"'), false);
console.log(`PASS: ${routes.length} pages, six city guides, three service pages, links, canonical/OG, structured data, sitemap and 404.`);
