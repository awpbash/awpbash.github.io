import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/static';

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
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  base: '/',
  outDir: './dist'
});