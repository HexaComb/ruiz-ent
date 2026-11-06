import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { registerClicks } from '../src/lib/analytics.ts';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('shared layout includes one accessible native call link to the existing business number', () => {
  const component = source('src/components/FloatingCallButton.astro');
  const layout = source('src/layouts/Layout.astro');
  const phone = source('src/components/Header.astro').match(/href="(tel:[^"]+)"/)[1];
  assert.ok(component.includes(`href="${phone}"`));
  assert.match(component, /aria-label="Call Ruiz Family Enterprises at \(559\) 244-1922"/);
  assert.match(component, /aria-hidden="true" focusable="false"/);
  assert.equal(layout.match(/<FloatingCallButton\s*\/>/g)?.length, 1);
  assert.doesNotMatch(component, /<script|onclick|target="_blank"/);
});

test('floating call clicks use existing privacy-safe analytics without preventing navigation', () => {
  const events = [];
  let click;
  globalThis.window = { location: { origin: 'https://ruizfamilyhardscapes.biz' }, gtag: (...args) => events.push(args) };
  globalThis.document = { addEventListener: (_, handler) => { click = handler; } };
  class Element {}
  class Anchor extends Element {
    closest(selector) { return ['a, button', '.floating-call-button'].includes(selector) ? this : null; }
    getAttribute() { return 'tel:private-value'; }
  }
  globalThis.Element = Element;
  globalThis.HTMLAnchorElement = Anchor;
  registerClicks();
  const event = { target: new Anchor(), preventDefault() { assert.fail('Native dialing must remain available'); } };
  click(event);
  assert.deepEqual(events, [['event', 'phone_click', {
    target: 'business_phone', area: 'floating_call', page_referrer: '', page_title: 'Ruiz Family Enterprises'
  }]]);
  window.gtag = () => { throw new Error('Analytics blocked'); };
  assert.doesNotThrow(() => click(event));
  delete window.gtag;
  assert.doesNotThrow(() => click(event));
});
