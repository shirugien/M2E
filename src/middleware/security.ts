import type { MiddlewareResponseHandler } from 'astro';

export const securityHeaders: MiddlewareResponseHandler = async (context, next) => {
  const response = await next();

  // ✅ Protection contre le clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // ✅ Empêche le MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // ✅ Politique de référent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ✅ Politique de permissions
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // ✅ Force HTTPS uniquement en production
  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // ⚠️ Headers COOP/COEP : attention à la compatibilité avec les services externes
  if (import.meta.env.PROD) {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  // ✅ Politique CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://maps.googleapis.com https://unpkg.com https://www.openstreetmap.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "child-src https://www.google.com https://maps.google.com https://www.openstreetmap.org",
    "frame-src https://www.google.com https://maps.google.com https://www.openstreetmap.org",
    "worker-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
};
