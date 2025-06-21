// astro.config.mjs
import { defineConfig } from 'astro/config';
import path from 'node:path';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';

export default defineConfig({
  integrations: [
    tailwind(),
    alpinejs()
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
  vite: {
    define: {
      __SECURITY_HEADERS__: true
    },
    resolve: {
      alias: {
        '@layouts': path.resolve('./src/layouts'),
        '@components': path.resolve('./src/components'),
      },
    },
  },
});
