// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ruizfamilyhardscapes.biz',
  integrations: [sitemap()],
  adapter: cloudflare(),
  // This static portfolio does not use sessions or require a SESSION KV namespace.
  session: false
});
