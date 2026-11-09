import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { serviceAreas, serviceAreaPath } from '../src/data/service-areas.ts';
import { canonicalPath, serializeSchema, organizationSchema } from '../src/lib/seo.ts';

test('coverage matches the six supplied Google profile cities, with Kingsburg first', () => {
  assert.deepEqual(serviceAreas.map(area => area.name), ['Kingsburg', 'Fresno', 'Madera', 'Visalia', 'Fowler', 'Hanford']);
  assert.equal(new Set(serviceAreas.map(area => area.slug)).size, 6);
  assert.equal(organizationSchema.areaServed.length, 6);
  assert.equal(organizationSchema['@type'], 'Organization');
  assert.equal('address' in organizationSchema, false);
});
test('each service area has individual editorial content and an official planning resource', () => {
  for (const field of ['title', 'description', 'intro', 'planning', 'resource']) {
    assert.equal(new Set(serviceAreas.map(area => JSON.stringify(area[field]))).size, 6, `${field} is unique`);
  }
  for (const area of serviceAreas) {
    assert.ok(area.description.length <= 165);
    assert.ok(area.intro.length > 200);
    assert.ok(area.planning.length > 200);
    assert.ok(area.resource.text.length > 200);
    assert.equal(area.checklist.length, 3);
    assert.equal(area.questions.length, 2);
    assert.ok(new URL(area.resource.url).hostname.endsWith('.gov') || new URL(area.resource.url).hostname === 'www.fowlercity.org');
    assert.equal(serviceAreaPath(area.slug), `/service-areas/${area.slug}/`);
  }
});
test('canonicals normalize trailing slashes and JSON-LD cannot terminate its script', () => {
  assert.equal(canonicalPath('/'), '/');
  assert.equal(canonicalPath('/service-areas/kingsburg'), '/service-areas/kingsburg/');
  assert.equal(canonicalPath('/service-areas/kingsburg/'), '/service-areas/kingsburg/');
  assert.equal(serializeSchema({ text: '</script>' }).includes('<'), false);
});
test('public summary matches coverage and does not retain withdrawn areas', () => {
  const summary = fs.readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  for (const area of serviceAreas) assert.ok(summary.includes(serviceAreaPath(area.slug)));
  assert.doesNotMatch(summary, /Modesto|Selma|Clovis|Chowchilla|Merced|Atwater|Turlock/);
});
