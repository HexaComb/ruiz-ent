# Homepage media loading

## Behavior

- The hero photo uses Astro's build-time WebP optimization with 640, 960, 1280 and 1920 pixel variants. It remains eager/high-priority and is visible while the desktop video starts, if autoplay is blocked, or without JavaScript.
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

## Initial size comparison

The original hero photo was 739,065 bytes (721.7 KiB). At quality 80, this change generates:

| Width | Bytes | KiB | Reduction |
| --- | ---: | ---: | ---: |
| 640 | 49,598 | 48.4 | 93.3% |
| 960 | 104,884 | 102.4 | 85.8% |
| 1280 | 172,900 | 168.8 | 76.6% |
| 1920 | 337,994 | 330.1 | 54.3% |

The browser selects a variant based on viewport and pixel density. Byte reductions are not measured loading-time or Lighthouse improvements. Retest the deployed/preview site under the same mobile conditions as the original 10.2-second LCP observation before claiming an LCP improvement.
