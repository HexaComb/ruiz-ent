# Homepage media loading

## Behavior

- The hero photo uses Astro's build-time WebP optimization with 960, 1280, 1920 and 2200 pixel variants. It remains eager/high-priority and is visible while the desktop video starts, if autoplay is blocked, or without JavaScript.
- Hero video URLs remain in `data-src` until the viewport is wider than 640 pixels, the hero image has loaded, and reduced-motion/Save-Data preferences permit playback. Returning to mobile or enabling either preference removes the video sources and cancels the load.
- Each showcase video keeps its poster but no active media source until it enters a 200 pixel viewport margin or its play button is pressed. Offscreen/hidden-tab playback pauses. Manual pauses survive scrolling away and back.
- Reduced-motion and Save-Data visitors load showcase videos only by explicitly pressing play. If IntersectionObserver is unavailable, the buttons still load and play the clips.
- Public images/videos cache for one day because their names are stable. Fingerprinted `/_astro/` assets cache immutably for one year. HTML and API responses keep their existing caching behavior.

The hero original moved to `src/assets/hero/` so Astro can optimize it. `imageService: 'compile'` avoids requiring on-demand Cloudflare Images transformations for this static portfolio. Replace the source image there to regenerate all variants and their cache keys.

## Validation

Run `npm test` and `npm run build`. For browser regression tests, serve `dist/client/` at `http://127.0.0.1:4321` and run:

```
PLAYWRIGHT_PACKAGE_JSON=/absolute/path/to/qa/package.json node scripts/media-preview.mjs
```

The supplied package must have Playwright installed. Optional settings are `CHROMIUM_PATH`, `PREVIEW_URL`, and `MEDIA_PREVIEW_OUTPUT`. The **Media loading validation** workflow installs an isolated Playwright dependency, runs the standard production build, validates desktop/tablet/mobile boundaries, all five clip controls, repeat clicks, resizing, preference changes, unavailable observers, rejected autoplay and no-JavaScript fallback, and uploads screenshots.

Cache headers are Cloudflare Static Assets rules in `public/_headers`. A generic local static server does not apply those rules. Verify them on Cloudflare with response headers when reviewing a preview or after an authorized deployment.

## Image quality and size comparison

The original hero photo was 739,065 bytes (721.7 KiB). The initial quality-80 640px candidate was visibly soft after the portrait hero’s cover crop. The final configuration uses quality 85, a conservative 1000px mobile source-size hint, and a full-resolution option for high-density screens. This generates:

| Width | Bytes | KiB | Reduction |
| --- | ---: | ---: | ---: |
| 960 | 128,574 | 125.6 | 82.6% |
| 1280 | 213,552 | 208.5 | 71.1% |
| 1920 | 416,056 | 406.3 | 43.7% |
| 2200 | 526,672 | 514.3 | 28.7% |

The browser selects a variant based on rendered photo size and pixel density. At ordinary mobile density the 1280px version preserves visible detail much better than the original 640px candidate; high-density screens can use the original photo’s full 2200px resolution. WebP remains lossy, so it is not pixel-identical to the JPEG. Side-by-side checks at mobile and desktop display sizes showed only minor fine-detail differences in the final settings. Browser tests also check the cover-crop resolution budget at 1x, 2x and 3x. Byte reductions are not measured loading-time or Lighthouse improvements. Retest the deployed/preview site under the same mobile conditions as the original 10.2-second LCP observation before claiming an LCP improvement.

## Responsive image follow-up (PR preview)

Phones up to 480px use a square, lossless extraction of the original hero. The
crop removes only the original cover layout's hidden sides: left =
round((2200 - 1468) × 0.54) = 395px. It retains the full 1468px source height and
54% focal point. The wider mobile and desktop compositions are unchanged. `npm run build` and `npm run dev` regenerate it from the original photograph.
If running Astro directly, run `node scripts/generate-mobile-hero.mjs` first.
Astro encodes the final square WebP variants at quality 85: 640px = 87,332 bytes,
768px = 118,968, 1280px = 259,192, 1468px = 382,128. The lossless source itself is
not the browser-delivered image. Relative to the previous phone selections,
1x uses about 59% fewer hero bytes, 2x about 38–51% fewer (depending on browser
selection), and full-resolution 3x about 27% fewer. These are asset comparisons,
not claims about page-load time or a guaranteed Lighthouse score.

All 11 video posters are responsive build-time WebPs and remain inert until
within 200px of the viewport. The separate poster controller waits for a video
frame before uncovering playback, restores the poster on errors/reset, and
retains native lazy images when IntersectionObserver is unavailable. No-JavaScript
visitors keep ordinary lazy posters and direct video links. The five service
carousel images now use lazy responsive WebP variants with cover-aware sizing.

`Responsive image comparison` builds the PR and its base revision on the same
runner. It checks unchanged hero dimensions, 1x/2x/3x resolution, inert initial
posters, captures before/after screenshots, and runs three mobile and three
desktop Lighthouse audits per revision, alternating order. Analytics is blocked
in both revisions, and no forms or phone links are activated. The resulting
lab scores are comparative, not production field metrics; raw JSON and the
first mobile trace are uploaded for review.
