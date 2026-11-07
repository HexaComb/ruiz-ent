import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { initVideoPoster } from '../src/lib/video-poster.ts';

function fixture({ observer = true, frameCallback = true, controls = false } = {}) {
  const video = new EventTarget();
  video.readyState = 0;
  video.controls = controls;
  let present;
  let cancelled = false;
  if (frameCallback) {
    video.requestVideoFrameCallback = callback => { present = callback; return 42; };
    video.cancelVideoFrameCallback = () => { cancelled = true; };
  }
  let intersect;
  let disconnected = false;
  class Observer {
    constructor(callback) { intersect = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  globalThis.window = observer ? { IntersectionObserver: Observer } : {};
  globalThis.IntersectionObserver = Observer;
  const animationFrames = [];
  globalThis.requestAnimationFrame = callback => { animationFrames.push(callback); return animationFrames.length; };
  globalThis.cancelAnimationFrame = () => {};
  const image = Object.assign(new EventTarget(), {
    parentElement: { querySelector: () => video },
    dataset: { src: '/_astro/poster.webp', srcset: '/_astro/poster-small.webp 240w, /_astro/poster.webp 540w' },
    hasAttribute: name => Boolean(image[name]),
    hidden: false,
    complete: false,
    naturalWidth: 0,
    currentSrc: '',
  });
  return { image, video, intersect: inView => intersect([{ isIntersecting: inView }]),
    present: () => present?.(), cancelled: () => cancelled, disconnected: () => disconnected,
    paint: () => animationFrames.shift()?.() };
}

test('posters stay inert offscreen and choose a responsive candidate near the viewport', () => {
  const f = fixture();
  const dispose = initVideoPoster(f.image);
  assert.equal(f.image.src, undefined);
  f.intersect(false);
  assert.equal(f.image.src, undefined);
  f.intersect(true);
  assert.equal(f.image.srcset, f.image.dataset.srcset);
  assert.equal(f.image.src, f.image.dataset.src);
  assert.equal(f.disconnected(), true);
  dispose();
});

test('play alone cannot uncover an empty video; wait for an actual presented frame', () => {
  const f = fixture();
  const dispose = initVideoPoster(f.image);
  f.video.dispatchEvent(new Event('play'));
  assert.equal(f.image.hidden, false);
  f.video.readyState = 2;
  f.video.dispatchEvent(new Event('loadeddata'));
  assert.equal(f.image.hidden, false);
  f.present();
  assert.equal(f.image.hidden, true);
  f.video.dispatchEvent(new Event('error'));
  assert.equal(f.image.hidden, false);
  dispose();
});

test('cleanup cancels outstanding frame work and removes event handlers', () => {
  const f = fixture();
  const dispose = initVideoPoster(f.image);
  f.video.readyState = 2;
  f.video.dispatchEvent(new Event('loadeddata'));
  dispose();
  assert.equal(f.cancelled(), true);
  f.present();
  assert.equal(f.image.hidden, false);
});

test('older browsers retain native lazy images and decoded-frame fallback', () => {
  const f = fixture({ observer: false, frameCallback: false });
  const dispose = initVideoPoster(f.image);
  assert.equal(f.image.loading, 'lazy');
  assert.equal(f.image.src, f.image.dataset.src);
  f.video.readyState = 2;
  f.video.dispatchEvent(new Event('loadeddata'));
  f.paint();
  assert.equal(f.image.hidden, false);
  f.paint();
  assert.equal(f.image.hidden, true);
  dispose();
});

test('all below-fold posters avoid eager native poster attributes and retain no-JS fallback', () => {
  for (const name of ['BeforeAfterShowcase', 'EngineeringPublicWorks']) {
    const markup = readFileSync(`src/components/${name}.astro`, 'utf8');
    assert.doesNotMatch(markup, /\sposter=/);
    assert.match(markup, /<DeferredVideoPoster /);
    assert.match(markup, /<noscript><a[^>]+href=/);
  }
  const component = readFileSync('src/components/DeferredVideoPoster.astro', 'utf8');
  assert.match(component, /format: 'webp'/);
  assert.match(component, /<img data-video-poster data-src=/);
  assert.match(component, /<noscript><img src=/);
  const services = readFileSync('src/components/ServicesOverview.astro', 'utf8');
  assert.match(services, /<Image\s/);
  assert.match(services, /format="webp"/);
  assert.match(services, /loading="lazy"/);
  assert.doesNotMatch(services, /loading=.*eager/);
});


test('native controls use only the loaded responsive candidate, never an offscreen poster', () => {
  const f = fixture({ controls: true });
  const dispose = initVideoPoster(f.image);
  assert.equal(f.video.poster, undefined);
  f.intersect(false);
  assert.equal(f.video.poster, undefined);
  f.intersect(true);
  assert.equal(f.video.poster, undefined, 'Wait for the selected candidate to finish loading');
  f.image.currentSrc = '/_astro/poster-small.webp';
  f.image.naturalWidth = 240;
  f.image.complete = true;
  f.image.dispatchEvent(new Event('load'));
  assert.equal(f.video.poster, '/_astro/poster-small.webp');
  assert.equal(f.image.hidden, true, 'An overlay must not obscure native controls');
  for (const event of ['error', 'emptied']) {
    f.video.dispatchEvent(new Event(event));
    assert.equal(f.video.poster, '/_astro/poster-small.webp');
    assert.equal(f.image.hidden, true, 'Reset keeps native controls uncovered');
  }
  dispose();
  f.image.currentSrc = '/_astro/poster.webp';
  f.image.dispatchEvent(new Event('load'));
  assert.equal(f.video.poster, '/_astro/poster-small.webp', 'Cleanup removes the image listener');
});

test('cached native posters survive reinitialization; showcase keeps the frame overlay', () => {
  for (const controls of [true, false]) {
    const f = fixture({ controls });
    f.image.src = '/_astro/poster.webp';
    f.image.currentSrc = '/_astro/poster-small.webp';
    f.image.naturalWidth = 240;
    f.image.complete = true;
    const dispose = initVideoPoster(f.image);
    assert.equal(f.image.hidden, controls);
    assert.equal(f.video.poster, controls ? f.image.currentSrc : undefined);
    f.image.dispatchEvent(new Event('load'));
    assert.equal(f.image.hidden, controls);
    dispose();
  }
});
