// Read-only browser checks against the built static page; never submit a form or dial.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, stat, writeFile } from 'node:fs/promises';
const require = createRequire(`${process.env.RUNNER_TEMP}/engineering-qa/package.json`);
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4321';
const anchor = '#engineering-public-works';
const output = 'engineering-preview';
await mkdir(output, { recursive: true });
for (let attempt = 0; ; attempt++) {
  try { if ((await fetch(base)).ok) break; } catch {}
  if (attempt === 30) throw new Error('Static preview server did not start');
  await new Promise(resolve => setTimeout(resolve, 250));
}
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 1280, 1120, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator(anchor);
    assert.equal(await section.count(), 1, 'Unique section anchor');
    assert.equal(await section.getAttribute('aria-labelledby'), 'engineering-heading');
    assert.match(await page.locator('#engineering-heading').innerText(), /Engineering\s*\/\s*Public Works/);
    const copy = await section.innerText();
    for (const content of ['CSLB A License', 'DIR registered', 'Fresno, Clovis, Visalia', '559-244-1922']) {
      assert.ok(copy.includes(content), `Supplied copy: ${content}`);
    }
    assert.equal(await section.locator('a[href="tel:559-244-1922"]').count(), 1);
    assert.equal(await page.locator('[data-hardscape-build], .build-model').count(), 0);
    assert.equal(await page.locator('#hero-heading').innerText(), 'Hardscapes Built for Generations.');
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'link[rel="canonical"]']) {
      assert.ok(await page.locator(selector).getAttribute(selector.startsWith('link') ? 'href' : 'content'));
    }
    assert.ok(await page.title());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: page overflow`);
    assert.ok(await page.locator('.header-inner').evaluate(element => {
      const children = [...element.children].filter(child => getComputedStyle(child).display !== 'none');
      const rects = children.map(child => child.getBoundingClientRect());
      return rects.every((rect, index) => rect.left >= 0 && rect.right <= innerWidth + 1
        && (index === 0 || rect.left >= rects[index - 1].right - 1));
    }), `${width}: header outside viewport`);
    await page.screenshot({ path: `${output}/${width}-header.png` });
    const toggle = page.locator('#mobileToggle');
    const mobile = await toggle.isVisible();
    const nav = mobile ? page.locator('#mobileDrawer') : page.locator('.main-nav');
    if (mobile) {
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    }
    await nav.locator(`a[href="${anchor}"]`).click();
    await page.waitForURL(`**/${anchor}`);
    if (mobile) assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    // Wait for smooth anchor navigation, without changing the shipped motion behavior.
    await page.waitForFunction(() => {
      const top = document.getElementById('engineering-heading').getBoundingClientRect().top;
      return top >= document.getElementById('header').getBoundingClientRect().bottom - 1 && top < innerHeight;
    });
    const images = section.locator('img');
    assert.equal(await images.count(), 3);
    const sources = [];
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
      assert.equal(await img.getAttribute('loading'), 'lazy');
      assert.ok(await img.getAttribute('alt'));
      assert.ok(Number(await img.getAttribute('width')) > 0);
      assert.ok(Number(await img.getAttribute('height')) > 0);
      sources.push(await img.getAttribute('src'));
    }
    const mediaBytes = (await Promise.all(sources.map(src => stat(`public${src}`)))).reduce((sum, file) => sum + file.size, 0);
    assert.ok(mediaBytes < 750_000, `Selected media budget: ${mediaBytes} bytes`);
    assert.ok(await section.evaluate(element => element.scrollWidth <= element.clientWidth), `${width}: section overflow`);
    await section.screenshot({ path: `${output}/${width}-section.png` });
    await page.goBack();
    assert.equal(new URL(page.url()).hash, '');
    if (mobile) {
      await page.evaluate(() => scrollTo(0, 0));
      await toggle.click();
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Escape closes drawer');
      assert.ok(await toggle.evaluate(element => element === document.activeElement), 'Escape restores focus');
      await toggle.click();
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Repeated toggle closes drawer');
      await toggle.click();
      await nav.locator(`a[href="${anchor}"]`).click();
      await page.waitForURL(`**/${anchor}`);
      await page.goBack();
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${base}/${anchor}`, { waitUntil: 'networkidle' });
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `${output}/${width}-reduced-motion.png` });
    assert.deepEqual(errors, []);
    results.push({ width, mobileNavigation: mobile, mediaBytes, status: 'passed' });
    console.log(`PASS ${width}: content, anchor/back, navigation, media, overflow, metadata and reduced motion`);
    await page.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
