// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';
import viteConfig from './vite.config.mjs'; // <-- Ajout de cette ligne

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    alpinejs()
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
  vite: viteConfig, // <-- Ajout de cette ligne
});
