// Read-only UI checks: block analytics, intercept tel clicks, never dial or submit.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

const require = createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON || `${process.env.RUNNER_TEMP}/floating-call-qa/package.json`);
const { chromium } = require('playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const output = process.env.CALL_PREVIEW_OUTPUT || 'floating-call-preview';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const callSelector = '.floating-call-button';
const visible = page => page.locator(callSelector).evaluate(el => getComputedStyle(el).visibility === 'visible');
await mkdir(output, { recursive: true });

try {
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 640], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const call = page.getByRole('link', { name: 'Call Ruiz Family Enterprises at (559) 244-1922', exact: true });
    assert.equal(await call.count(), 1);
    assert.equal(await call.getAttribute('href'), 'tel:+15592441922');
    const box = await call.boundingBox();
    assert.equal(box.width, 56);
    assert.equal(box.height, 56);
    assert.equal(width - box.x - box.width, 16);
    assert.equal(height - box.y - box.height, 16);
    assert.ok(await call.evaluate(el => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(x + width / 2, y + height / 2));
    }));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${output}/${width}-home.png` });

    // Prevent actual dialing only in the test, after the site's click handler.
    await page.evaluate(() => {
      window.callEvents = [];
      window.callDefaults = [];
      window.gtag = (...args) => window.callEvents.push(args);
      document.addEventListener('click', event => {
        if (event.target.closest('.floating-call-button')) {
          window.callDefaults.push(event.defaultPrevented);
          event.preventDefault();
        }
      });
    });
    await call.locator('svg').click();
    await page.keyboard.press('Tab');
    await call.focus();
    assert.equal(await call.evaluate(el => el.matches(':focus-visible')), true);
    assert.equal(await call.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    await page.screenshot({ path: `${output}/${width}-focus.png` });
    await page.keyboard.press('Enter');
    await call.click();
    const events = await page.evaluate(() => ({ calls: window.callEvents, defaults: window.callDefaults }));
    assert.deepEqual(events.defaults, [false, false, false]);
    assert.equal(events.calls.length, 3);
    for (const event of events.calls) {
      assert.deepEqual(event, ['event', 'phone_click', {
        target: 'business_phone', area: 'floating_call', page_referrer: '', page_title: 'Ruiz Family Enterprises'
      }]);
    }

    if (width < 1280) {
      await page.locator('#mobileToggle').click();
      assert.equal(await visible(page), false, 'Call button clears the open menu');
      await page.keyboard.press('Escape');
      assert.equal(await visible(page), true, 'Call button returns after Escape');
      await page.locator('#mobileToggle').click();
      await page.locator('#mobileDrawer a[href="#quote-builder"]').click();
      assert.equal(await visible(page), true, 'Call button returns after navigation');
      await page.goBack();
    }
    await page.locator('#clientName').focus();
    assert.equal(await visible(page), width >= 768, 'Small-screen form focus clears the call button');
    await page.locator('#submitBtn').focus();
    assert.equal(await visible(page), width >= 768);
    await page.locator('#submitBtn').evaluate(el => el.blur());
    assert.equal(await visible(page), true);

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const footer = await page.locator('.footer-copyright-row').boundingBox();
    const bottomCall = await call.boundingBox();
    assert.ok(footer.y + footer.height < bottomCall.y, 'Footer remains above the floating call button');
    await page.screenshot({ path: `${output}/${width}-footer.png` });
    await page.goto(`${base}/404.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator(callSelector).getAttribute('href'), 'tel:+15592441922');
    assert.equal(await visible(page), true);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator(callSelector).evaluate(el => getComputedStyle(el).display), 'none');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}x${height}: placement, phone, focus, repeated clicks, analytics, menu, form, footer, 404 and print`);
    await page.close();
  }
  const noJs = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await noJs.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await noJs.locator(callSelector).getAttribute('href'), 'tel:+15592441922');
  assert.equal(await visible(noJs), true);
  await noJs.close();
  console.log('PASS: native call link remains available without JavaScript');
} finally {
  await browser.close();
}
