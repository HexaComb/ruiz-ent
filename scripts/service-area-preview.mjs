// Read-only page checks. Never submit an estimate, send a message or dial.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || `${process.env.RUNNER_TEMP}/service-area-qa/package.json`);
const { chromium } = require('playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const cities = ['kingsburg', 'fresno', 'madera', 'visalia', 'fowler', 'hanford'];
const output = 'service-area-preview';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
    for (const city of cities) {
      const route = `/service-areas/${city}/`;
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.ok((await page.locator('h1').innerText()).toLowerCase().includes(city));
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://ruizfamilyhardscapes.biz${route}`);
      assert.equal(await page.locator('main a[href="#quote-builder"]').count(), city === 'kingsburg' ? 4 : 3);
      assert.equal(await page.locator('#quoteForm').count(), 1);
      assert.equal(await page.locator('#quoteForm').getAttribute('data-service-city'), city);
      assert.equal(await page.locator('#clientCity').inputValue(), city[0].toUpperCase() + city.slice(1));
      assert.ok(await page.locator('main a[href="tel:+15592441922"]').count());
      assert.equal(await page.locator('footer nav[aria-label="Service areas"] a').count(), 6);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${city} overflow at ${width}`);
      if (city === 'kingsburg') {
        await page.screenshot({ path: `${output}/kingsburg-${width}.png`, fullPage: true });
        const toggle = page.locator('#mobileToggle');
        if (await toggle.isVisible()) {
          await toggle.click();
          await page.locator('#mobileDrawer a[href="/service-areas/"]').click();
          await page.waitForURL('**/service-areas/');
          await page.locator('main h3 a[href="/service-areas/kingsburg/"]').click();
          await page.waitForURL('**/service-areas/kingsburg/');
          // Repeat navigation and Back/Forward rather than only testing first load.
          await page.goBack();
          await page.waitForURL('**/service-areas/');
          await page.goForward();
          await page.waitForURL('**/service-areas/kingsburg/');
          await toggle.click();
          await page.keyboard.press('Escape');
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        }
        await page.locator('main a[href="#quote-builder"]').first().click();
        assert.equal(new URL(page.url()).pathname, route, 'estimate CTA stays on city page');
        assert.equal(await page.locator('#quoteForm').count(), 1);
        assert.equal(await page.locator('.city-proof-photos img').count(), 2);
        await page.locator('#quoteForm').screenshot({ path: `${output}/kingsburg-form-${width}.png` });
        await page.goto(`${base}/`, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('#service-areas h3 a').count(), 6);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `homepage overflow at ${width}`);
        await page.locator('#service-areas').screenshot({ path: `${output}/homepage-areas-${width}.png` });
      }
    }
    await page.goto(`${base}/service-areas/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('main h3 a').count(), 6);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `${output}/hub-${width}.png`, fullPage: true });
    assert.deepEqual(errors, [], `browser errors at ${width}`);
    results.push({ width, pages: cities.length + 1, errors });
    await page.close();
  }
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJs.goto(`${base}/service-areas/kingsburg/`);
  assert.ok(await noJs.locator('h1').isVisible());
  assert.ok(await noJs.locator('#city-resource-heading').isVisible());
  await noJs.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('PASS: six city pages + hub at five widths, no overflow, navigation, history, estimate links and no-JS content.');
} finally { await browser.close(); }
