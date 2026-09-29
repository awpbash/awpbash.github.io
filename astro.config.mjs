import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://junwei.ng',
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/fitsensei/'),
    }),
    tailwind(),
  ],
  // Pages stay prerendered. Only routes with `prerender = false` (the Jev API) run on demand.
  output: 'static',
  adapter: vercel({
    imageService: false,
  }),
  redirects: {
    '/benchmarks': '/fun/benchmarks',
  },
  base: '/',
  outDir: './dist'
});
