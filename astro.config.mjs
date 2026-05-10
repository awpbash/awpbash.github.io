import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/static';

// https://astro.build/config
export default defineConfig({
  // TODO: update to the real domain after Vercel deploy gives you a URL.
  site: 'https://awpbash.github.io',
  integrations: [react(), mdx(), sitemap(), tailwind()],
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  base: '/',
  outDir: './dist'
});