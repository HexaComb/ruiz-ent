// Check the built page locally without dialing, submitting forms or sending analytics.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

const require = createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON || `${process.env.RUNNER_TEMP}/hero-qa/package.json`);
const { chromium } = require('playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const output = process.env.MEDIA_PREVIEW_OUTPUT || 'hero-preview';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
await mkdir(output, { recursive: true });

async function open(options = {}, setup) {
  const context = await browser.newContext(options);
  if (setup) await context.addInitScript(setup);
  const page = await context.newPage();
  const errors = [];
  const videos = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/\.(webm|mp4)(?:\?|$)/.test(request.url())) videos.push(request.url()); });
  await page.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
  await page.goto(base, { waitUntil: 'networkidle' });
  return { context, page, errors, videos };
}
const playing = (page, selector) => page.waitForFunction(selector => {
  const video = document.querySelector(selector);
  return !video.paused && video.readyState >= 2 && video.currentTime > 0;
}, selector);
const paused = (page, selector) => page.waitForFunction(selector => document.querySelector(selector).paused, selector);
const leadSelector = '[data-jobsite-video]';

try {
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740], [480, 800], [481, 800], [640, 900], [641, 900]]) {
    const { context, page, errors, videos } = await open({ viewport: { width, height } });
    assert.equal(await page.locator('#hero-heading').innerText(), 'Big plans. Solid work.');
    assert.equal(await page.locator('.hero-btn-main').getAttribute('href'), '#quote-builder');
    assert.equal(await page.locator('.hero-btn-sub').getAttribute('href'), '#our-services');
    assert.equal(await page.locator('.hero-direct-call a').getAttribute('href'), 'tel:+15592441922');
    assert.ok(await page.locator('.hero-mobile-image').evaluate(img => img.complete && img.naturalWidth > 0));
    const image = await page.locator('.hero-mobile-image').evaluate(img => ({ src: img.currentSrc, width: img.width, height: img.height }));
    assert.match(image.src, /\/_astro\/.*\.webp/);
    assert.ok(image.width > 0 && image.height > 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(videos.filter(url => !url.includes('hero_background')).length, 0, 'Offscreen clips must not download');
    if (width <= 640) assert.equal(videos.length, 0, 'Mobile must load no video bytes');
    else await playing(page, '.hero-bg-video');
    await page.screenshot({ path: `${output}/${width}-hero.png` });

    // Re-initialization must not duplicate play/pause handlers.
    await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
    const lead = page.locator(leadSelector).first();
    const button = page.locator('[data-video-toggle]').first();
    await lead.scrollIntoViewIfNeeded();
    await playing(page, leadSelector);
    assert.equal(await page.locator('[data-jobsite-video] source[src]').count() > 0, true);
    await button.click();
    await paused(page, leadSelector);
    assert.match(await button.getAttribute('aria-label'), /^Play video:/);
    assert.equal(await button.locator('.icon-play').evaluate(el => getComputedStyle(el).display !== 'none'), true);
    await page.evaluate(() => scrollTo(0, 0));
    await lead.scrollIntoViewIfNeeded();
    assert.equal(await lead.evaluate(video => video.paused), true, 'Manual pause survives scrolling away and back');
    await button.click();
    await playing(page, leadSelector);
    await button.click();
    await button.click();
    await button.click();
    await paused(page, leadSelector);
    await page.screenshot({ path: `${output}/${width}-showcase.png` });

    // Every card must retain a working button and native playback, not just the lead.
    for (let index = 1; index < 5; index++) {
      const clip = page.locator('[data-jobsite-video]').nth(index);
      const control = page.locator('[data-video-toggle]').nth(index);
      await clip.scrollIntoViewIfNeeded();
      await page.waitForFunction(index => {
        const video = document.querySelectorAll('[data-jobsite-video]')[index];
        return !video.paused && video.readyState >= 2 && video.currentTime > 0;
      }, index);
      await control.click();
      assert.equal(await clip.evaluate(video => video.paused), true);
      await control.click();
      await page.waitForFunction(index => !document.querySelectorAll('[data-jobsite-video]')[index].paused, index);
    }

    for (const selector of ['.hero-btn-sub', '.hero-btn-main']) {
      await page.locator(selector).click();
      assert.equal(new URL(page.url()).hash, await page.locator(selector).getAttribute('href'));
      await page.goBack();
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${width}px: initial requests, image, playback, pause/replay, repeated init/clicks, navigation and overflow`);
  }

  for (const deviceScaleFactor of [1, 2, 3]) {
    const { page, context, videos } = await open({ viewport: { width: 320, height: 740 }, deviceScaleFactor });
    const resolution = await page.locator('.hero-mobile-image').evaluate(async img => {
      const decoded = new Image();
      decoded.src = img.currentSrc;
      await decoded.decode();
      const box = img.getBoundingClientRect();
      // Portrait phones use a lossless square extraction at original resolution.
      // Cover must still have enough pixels for the entire height, not just width.
      const required = Math.min(1468, Math.max(box.width, box.height) * devicePixelRatio);
      return { actual: decoded.naturalWidth, required };
    });
    assert.ok(resolution.actual >= resolution.required, `Hero resolution at ${deviceScaleFactor}x: ${JSON.stringify(resolution)}`);
    assert.equal(videos.length, 0);
    await context.close();
    console.log(`PASS mobile ${deviceScaleFactor}x: cover-aware image resolution without video downloads`);
  }

  const resize = await open({ viewport: { width: 390, height: 844 } });
  assert.equal(resize.videos.length, 0);
  await resize.page.setViewportSize({ width: 1440, height: 1000 });
  await playing(resize.page, '.hero-bg-video');
  await resize.page.setViewportSize({ width: 390, height: 844 });
  await resize.page.waitForFunction(() => !document.querySelector('.hero-bg-video source[src]'));
  await paused(resize.page, '.hero-bg-video');
  await resize.page.setViewportSize({ width: 1440, height: 1000 });
  await playing(resize.page, '.hero-bg-video');
  await resize.page.emulateMedia({ reducedMotion: 'reduce' });
  await resize.page.waitForFunction(() => !document.querySelector('.hero-bg-video source[src]'));
  assert.deepEqual(resize.errors, []);
  await resize.context.close();
  console.log('PASS breakpoint and live motion-preference changes');

  for (const mode of ['reduced-motion', 'save-data', 'no-observer', 'autoplay-rejected']) {
    const setup = mode === 'save-data' ? () => Object.defineProperty(navigator, 'connection', { value: Object.assign(new EventTarget(), { saveData: true }), configurable: true })
      : mode === 'no-observer' ? () => { delete window.IntersectionObserver; }
      : mode === 'autoplay-rejected' ? () => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked in test', 'NotAllowedError')); }
      : undefined;
    const { page, context, errors, videos } = await open({ viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference' }, setup);
    await page.locator(leadSelector).first().scrollIntoViewIfNeeded();
    // Wait for the browser's observer callback, not an arbitrary network-idle period.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (mode !== 'autoplay-rejected') assert.equal(videos.length, 0, `${mode} stays click-to-play`);
    const button = page.locator('[data-video-toggle]').first();
    await button.click();
    if (mode !== 'autoplay-rejected') {
      await playing(page, leadSelector);
      await button.click();
      await paused(page, leadSelector);
    } else {
      await page.waitForFunction(() => document.querySelector('[data-video-toggle]').getAttribute('aria-label').startsWith('Play'));
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`PASS ${mode}: intentional playback and rejection handling`);
  }

  const noJs = await open({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  assert.equal(noJs.videos.length, 0);
  assert.ok(await noJs.page.locator('.hero-mobile-image').evaluate(img => img.complete && img.naturalWidth > 0));
  assert.equal(await noJs.page.locator('.hero-btn-main').getAttribute('href'), '#quote-builder');
  await noJs.context.close();
  console.log('PASS no JavaScript: image and native navigation remain available');
} finally { await browser.close(); }
