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
  vite: {
    define: {
      __SECURITY_HEADERS__: true
    }
  },
  server: {
    headers: {
      // Protection contre le clickjacking
      'X-Frame-Options': 'DENY',
      
      // Protection XSS
      'X-XSS-Protection': '1; mode=block',
      
      // Empêche le MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Force HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Politique de référent
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy (anciennement Feature Policy)
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https:",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "worker-src 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
        "manifest-src 'self'"
      ].join('; ')
    }
  }
});