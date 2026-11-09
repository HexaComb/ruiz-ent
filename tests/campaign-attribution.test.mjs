import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { trackEvent } from '../src/lib/analytics.ts';

const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
const bootstrap = layout.match(/<script is:inline>\s*([\s\S]*?)<\/script>/)[1];

function configure(search = '', path = '/', renderedPath = '/') {
  const context = { document: { documentElement: { dataset: { analyticsPath: renderedPath } } }, URL, URLSearchParams, location: { search, pathname: path, hash: '#private' } };
  context.window = context;
  vm.runInNewContext(bootstrap, context);
  return Array.from(context.dataLayer, entry => Array.from(entry));
}

test('Instagram bio UTMs reach GA4 config without Facebook click IDs or other query data', () => {
  const calls = configure('?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=private-click-id&email=person%40example.com');
  assert.deepEqual(calls.map(call => call[0]), ['js', 'config']);
  assert.equal(calls[1][1], 'G-G35MWF4BT4');
  assert.equal(calls[1][2].page_location, 'https://ruizfamilyhardscapes.biz/?utm_source=ig&utm_medium=social&utm_content=link_in_bio');
  assert.equal(calls[1][2].page_referrer, '');
  assert.equal(calls[1][2].page_title, 'Ruiz Family Enterprises');
  assert.doesNotMatch(JSON.stringify(calls), /private|fbclid|email|person|example\.com/);
});

test('all supported campaign labels survive encoded values without inventing a campaign', () => {
  const location = configure('?utm_source=instagram&utm_medium=social&utm_campaign=Fall%20Patios&utm_id=fall-2026&utm_term=concrete&utm_content=bio_v2&utm_source_platform=instagram')[1][2].page_location;
  const query = new URL(location).searchParams;
  assert.equal(query.size, 7);
  assert.equal(query.get('utm_campaign'), 'Fall Patios');
  assert.equal(query.get('utm_id'), 'fall-2026');
  assert.equal(new URL(configure('?utm_source=ig')[1][2].page_location).searchParams.has('utm_campaign'), false);
});

test('untagged, invalid and missing-page URLs retain the privacy-safe baseline', () => {
  for (const search of [
    '', '?fbclid=private&gclid=private&name=private', '?utm_source=',
    '?utm_source=ig&utm_source=other', '?utm_source=person%40example.com',
    '?utm_medium=https%3A%2F%2Fexample.com', '?utm_content=5592441922',
    '?utm_campaign=%0Aprivate', '?utm_campaign=%3Cscript%3E',
    `?utm_campaign=${'x'.repeat(101)}`,
  ]) {
    assert.equal(configure(search, '/private-missing-page')[1][2].page_location, 'https://ruizfamilyhardscapes.biz/');
  }
});

test('clicks and confirmed leads inherit sanitized campaign config without overriding location', () => {
  const calls = [];
  globalThis.window = { gtag: (...args) => calls.push(args) };
  for (const name of ['navigation_click', 'cta_click', 'phone_click', 'email_click', 'generate_lead']) {
    trackEvent(name, 'fixed_target', 'content');
  }
  assert.equal(calls.length, 5);
  for (const call of calls) {
    assert.equal(Object.hasOwn(call[2], 'page_location'), false);
    assert.equal(call[2].page_referrer, '');
  }
});

test('built city canonical preserves useful page attribution without arbitrary request paths', () => {
  const config = configure('?utm_source=ig&email=private', '/untrusted-path', '/service-areas/kingsburg/')[1][2];
  assert.equal(config.page_location, 'https://ruizfamilyhardscapes.biz/service-areas/kingsburg/?utm_source=ig');
  assert.doesNotMatch(JSON.stringify(config), /untrusted|email|private/);
});
