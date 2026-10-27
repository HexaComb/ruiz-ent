// Read-only browser checks against the built static page; never submit a form or dial.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { get } from 'node:http';
import { mkdir, stat, writeFile } from 'node:fs/promises';
const require = createRequire(`${process.env.RUNNER_TEMP}/engineering-qa/package.json`);
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4321';
const anchor = '#engineering-public-works';
const output = 'engineering-preview';
// Element-only captures exclude sticky chrome; header captures remain unmodified.
const isolatedCapture = { style: '[data-site-header] { visibility: hidden !important; }' };
await mkdir(output, { recursive: true });
for (let attempt = 0; ; attempt++) {
  try {
    const ready = await new Promise((resolve, reject) => {
      const request = get(base, response => {
        response.resume();
        response.on('end', () => resolve(response.statusCode === 200));
      });
      request.on('error', reject);
    });
    if (ready) break;
  } catch {}
  if (attempt === 30) throw new Error('Static preview server did not start');
  await new Promise(resolve => setTimeout(resolve, 250));
}
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1600, 1440, 1280, 1120, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 1000 } });
    const errors = [];
    const engineeringVideoRequests = [];
    page.on('request', request => {
      if (/engineering/.test(request.url()) && /\.mp4(?:[?#]|$)/.test(request.url())) engineeringVideoRequests.push(request.url());
    });
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
    const overflow = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth, viewport: innerWidth,
      elements: [...document.querySelectorAll('body *')].filter(element => {
        const r = element.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1);
      }).slice(0, 20).map(element => ({ tag: element.tagName, class: element.className, width: element.getBoundingClientRect().width }))
    }));
    if (overflow.page > overflow.viewport) await page.screenshot({ path: `${output}/${width}-overflow.png` });
    assert.ok(overflow.page <= overflow.viewport, `${width}: page overflow ${JSON.stringify(overflow)}`);
    assert.ok(await page.locator('.header-inner').evaluate(element => {
      const children = [...element.children].filter(child => getComputedStyle(child).display !== 'none');
      const rects = children.map(child => child.getBoundingClientRect());
      return rects.every((rect, index) => rect.left >= 0 && rect.right <= innerWidth + 1
        && (index === 0 || rect.left >= rects[index - 1].right - 1));
    }), `${width}: header outside viewport`);
    const headerLogo = page.locator('.brand-logo-img');
    assert.equal(await headerLogo.getAttribute('src'), '/images/brand/ruiz-monogram-256.png');
    await headerLogo.evaluate(image => image.decode());
    assert.ok(await headerLogo.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight) < 0.02), 'Header logo aspect ratio');
    assert.equal(await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'), '/apple-touch-icon.png');
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
    const galleries = section.locator('[data-gallery]');
    assert.equal(await galleries.count(), 2, 'Photo and video carousels');
    const images = section.locator('img');
    assert.ok(await images.count() >= 7, 'All seven supplied photographs represented');
    const sources = new Set();
    for (const img of await images.all()) {
      assert.equal(await img.getAttribute('loading'), 'lazy');
      assert.ok(await img.getAttribute('alt'));
      assert.ok(Number(await img.getAttribute('width')) > 0);
      assert.ok(Number(await img.getAttribute('height')) > 0);
      sources.add(await img.getAttribute('src'));
      for (const candidate of (await img.getAttribute('srcset') || '').split(',')) {
        const src = candidate.trim().split(/\s+/)[0];
        if (src) sources.add(src);
      }
    }
    const videos = section.locator('video');
    assert.ok(await videos.count() >= 4, 'Substantial client video selection');
    for (const video of await videos.all()) {
      assert.equal(await video.getAttribute('preload'), 'none');
      assert.ok(await video.evaluate(element => element.controls));
      assert.equal(await video.getAttribute('autoplay'), null);
      assert.equal(await video.getAttribute('src'), null);
      assert.equal(await video.locator('source[src]').count(), 0, 'Video has no attached source before explicit play');
      const poster = await video.getAttribute('poster');
      assert.ok(poster, 'Video has a poster');
      sources.add(poster);
    }
    const mediaBytes = (await Promise.all([...sources].map(src => stat(`public${src}`)))).reduce((sum, file) => sum + file.size, 0);
    assert.ok(mediaBytes <= 2_000_000, `All stills, responsive variants and posters budget: ${mediaBytes} bytes`);
    assert.deepEqual(engineeringVideoRequests, [], 'No engineering video downloads before interaction');
    assert.ok(await section.evaluate(element => element.scrollWidth <= element.clientWidth), `${width}: section overflow`);
    await section.screenshot({ ...isolatedCapture, path: `${output}/${width}-section.png` });
    for (let galleryIndex = 0; galleryIndex < await galleries.count(); galleryIndex++) {
      const gallery = galleries.nth(galleryIndex);
      const track = gallery.locator('.gallery-track');
      const slides = track.locator('.gallery-slide');
      const total = await slides.count();
      assert.ok(total >= 4);
      assert.equal(await track.getAttribute('tabindex'), '0', 'Keyboard-operable gallery track');
      const status = gallery.locator('[data-gallery-status]');
      assert.equal(await status.getAttribute('aria-live'), 'polite');
      async function selected(index) {
        await page.waitForFunction(({ element, expected, count }) => {
          const numbers = element.textContent.match(/\d+/g)?.map(Number) || [];
          return numbers[0] === expected && numbers[numbers.length - 1] === count;
        }, { element: await status.elementHandle(), expected: index + 1, count: total });
        await page.waitForFunction(({ element, index }) => {
          const track = element.querySelector('.gallery-track');
          const slide = track.querySelectorAll('.gallery-slide')[index];
          const trackRect = track.getBoundingClientRect();
          const rect = slide.getBoundingClientRect();
          return rect.right > trackRect.left && rect.left < trackRect.right;
        }, { element: await gallery.elementHandle(), index });
      }
      await track.focus();
      await page.keyboard.press('Home');
      await selected(0);
      for (const image of await slides.first().locator('img').all()) await image.evaluate(element => element.decode());
      const initialScroll = await track.evaluate(element => element.scrollLeft);
      // No autoplay: position remains still without a navigation action.
      await page.waitForTimeout(1100);
      assert.equal(await track.evaluate(element => element.scrollLeft), initialScroll);
      await gallery.screenshot({ ...isolatedCapture, path: `${output}/${width}-gallery-${galleryIndex}-initial.png` });
      await gallery.locator('[data-next]').click();
      await selected(1);
      assert.ok(await track.evaluate(element => element.scrollLeft) > initialScroll);
      await gallery.locator('[data-prev]').click();
      await selected(0);
      await track.focus();
      await page.keyboard.press('ArrowRight');
      await selected(1);
      await page.keyboard.press('End');
      await selected(total - 1);
      await gallery.screenshot({ ...isolatedCapture, path: `${output}/${width}-gallery-${galleryIndex}-advanced.png` });
      await page.keyboard.press('Home');
      await selected(0);
      // Native scroll path covers the state update used by touch swipes.
      await track.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: 'instant' }));
      await selected(total - 1);
      await track.focus();
      await page.keyboard.press('Home');
      await selected(0);
      for (const image of await gallery.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
      }
      await track.focus();
      await page.keyboard.press('Home');
      await selected(0);
    }
    assert.deepEqual(engineeringVideoRequests, [], 'Navigation and screenshots never fetch video payloads');
    const play = section.locator('[data-video-load]').first();
    const videoSlide = play.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " gallery-slide ")]');
    const video = videoSlide.locator('video');
    await video.evaluate(element => { element.muted = true; });
    await play.click();
    await page.waitForFunction(element => !element.paused && element.currentTime > 0, await video.elementHandle());
    assert.ok(engineeringVideoRequests.length > 0, 'Explicit play loads selected media');
    await videoSlide.screenshot({ ...isolatedCapture, path: `${output}/${width}-video-playing.png` });
    await page.locator('#hero-heading').scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element.paused, await video.elementHandle());
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
    await section.screenshot({ ...isolatedCapture, path: `${output}/${width}-reduced-motion.png` });
    const footerLogo = page.locator('.footer-logo-img');
    await footerLogo.scrollIntoViewIfNeeded();
    await footerLogo.evaluate(image => image.decode());
    assert.equal(await footerLogo.getAttribute('src'), '/images/brand/ruiz-full-logo.webp');
    assert.ok(await footerLogo.evaluate(image => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight) < 0.02), 'Footer logo aspect ratio');
    await page.locator('.footer-top').screenshot({ ...isolatedCapture, path: `${output}/${width}-footer.png` });
    assert.deepEqual(errors, []);
    results.push({ width, mobileNavigation: mobile, mediaBytes, status: 'passed' });
    console.log(`PASS ${width}: content, anchor/back, navigation, media, overflow, metadata, carousel controls, lazy video playback/pause and reduced motion`);
    await page.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
