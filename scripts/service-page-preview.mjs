// Read-only browser regression checks. Never submit an estimate, send mail or dial.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { servicePages, servicePagePath } from '../src/data/service-pages.ts';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || `${process.env.RUNNER_TEMP}/service-area-qa/package.json`);
const { chromium } = require('playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const output = 'service-page-preview';
const campaign = '?utm_source=qa&utm_campaign=service_review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = []; let submissions = 0;
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
    await page.route('**/api/contact', route => { submissions++; return route.abort(); });

    for (const service of servicePages) {
      const path = servicePagePath(service.slug);
      const response = await page.goto(base + path + campaign, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://ruizfamilyhardscapes.biz${path}`);
      assert.equal(await page.locator('input[name="projectType"]:checked').inputValue(), service.defaultProjectType);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path + ' overflow at ' + width);
      await page.screenshot({ path: `${output}/${service.slug}-${width}.png`, fullPage: true });

      // Partly completed forms must survive repeated CTAs instead of navigating to a fresh home form.
      await page.locator('#clientName').fill('QA draft, never submitted');
      let selectedProjectType = service.defaultProjectType;
      const verifyDraft = async () => {
        assert.equal(page.url(), base + path + campaign + '#quote-builder');
        assert.equal(await page.locator('input[name="projectType"]:checked').inputValue(), selectedProjectType);
        assert.equal(await page.locator('#clientName').inputValue(), 'QA draft, never submitted');
      };
      await page.locator('main a[href="#quote-builder"]').first().click();
      await verifyDraft();
      const headerCta = page.locator('.btn-header-cta');
      assert.equal(await headerCta.getAttribute('href'), '#quote-builder');
      if (await headerCta.isVisible()) { await headerCta.click(); await verifyDraft(); }
      const toggle = page.locator('#mobileToggle');
      if (await toggle.isVisible()) {
        for (let repeat = 0; repeat < 2; repeat++) {
          await toggle.click();
          await page.locator('.mobile-estimate-btn').click();
          await verifyDraft();
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          assert.equal(await page.locator('#mobileDrawer').isVisible(), false);
        }
        await toggle.click(); await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      }
      await page.locator('footer nav[aria-label="Footer Navigation"] a[href="#quote-builder"]').click();
      await verifyDraft();
      // Browser Back/Forward restores the same service and draft through anchor history.
      await page.goBack();
      assert.equal(new URL(page.url()).pathname, path);
      await page.goForward();
      await verifyDraft();
      await page.locator('label.type-pill').filter({ has: page.locator('input[value="Other or Custom Project"]') }).click();
      selectedProjectType = 'Other or Custom Project';
      await page.locator('main a[href="#quote-builder"]').first().click();
      await verifyDraft();
      if (await headerCta.isVisible()) { await headerCta.click(); await verifyDraft(); }
      if (await toggle.isVisible()) {
        await toggle.click(); await page.locator('.mobile-estimate-btn').click(); await verifyDraft();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      }
      await page.locator('footer nav[aria-label="Footer Navigation"] a[href="#quote-builder"]').click();
      await verifyDraft();
    }

    // The overview has no form; its shared CTAs must still recover to the homepage.
    await page.goto(base + '/services/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('main h3 a').count(), 3);
    assert.equal(await page.locator('.btn-header-cta').getAttribute('href'), '/#quote-builder');
    assert.equal(await page.locator('.mobile-estimate-btn').getAttribute('href'), '/#quote-builder');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `${output}/hub-${width}.png`, fullPage: true });

    // Capture the actual delegated click handler before navigation unloads the page.
    await page.evaluate(() => {
      sessionStorage.removeItem('qa-service-events');
      window.gtag = (...args) => sessionStorage.setItem('qa-service-events', JSON.stringify(args));
    });
    await page.locator('main h3 a[href="/services/masonry/"]').click();
    await page.waitForURL('**/services/masonry/');
    const tracked = await page.evaluate(() => JSON.parse(sessionStorage.getItem('qa-service-events')));
    assert.equal(tracked[0], 'event'); assert.equal(tracked[1], 'navigation_click');
    assert.equal(tracked[2].target, 'service_masonry'); assert.equal(tracked[2].area, 'content');
    assert.deepEqual(errors, [], `browser errors at ${width}`);
    assert.equal(submissions, 0, 'no form requests may leave the browser');
    results.push({ width, servicePages: servicePages.length, hub: true, submissions, errors });
    await page.close();
  }
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  for (const service of servicePages) {
    await noJs.goto(base + servicePagePath(service.slug));
    assert.ok(await noJs.locator('h1').isVisible());
    await noJs.locator('main a[href="#quote-builder"]').first().click();
    assert.equal(await noJs.locator('input[name="projectType"]:checked').inputValue(), service.defaultProjectType);
    assert.equal(await noJs.locator('#quoteForm').getAttribute('action'), '/api/contact');
  }
  await noJs.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('PASS: three service pages and hub at five widths, repeated desktop/mobile/footer CTAs, retained drafts/defaults/campaigns, history, navigation tracking and no-JS forms.');
} finally { await browser.close(); }
