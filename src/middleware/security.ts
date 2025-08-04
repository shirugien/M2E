// src/middleware/security.ts
import type { MiddlewareHandler, MiddlewareResponseHandler } from 'astro';

// Brute-force protection (remplacer par Redis en prod)
const MAX_ATTEMPTS = 5;
const TIME_WINDOW = 10 * 60 * 1000; // 10 minutes
const attemptMap = new Map<string, { count: number; firstTry: number }>();

/** 🔐 Middleware de sécurité brute-force + validation IP */
export const bruteForceProtection: MiddlewareHandler = async (context, next) => {
  const ip = context.request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const url = new URL(context.request.url);

  if (url.pathname === '/api/login' && context.request.method === 'POST') {
    const record = attemptMap.get(ip) || { count: 0, firstTry: now };

    // Fenêtre de tentative en cours
    if (now - record.firstTry < TIME_WINDOW) {
      if (record.count >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: 'LOCKED', message: 'Trop de tentatives. Réessayez plus tard.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Reset après fenêtre expirée
      record.count = 0;
      record.firstTry = now;
    }

    record.count += 1;
    attemptMap.set(ip, record);
  }

  return next();
};

/** 🛡️ Middleware de headers de sécurité */
export const securityHeaders: MiddlewareResponseHandler = async (context, next) => {
  const response = await next();

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  // CSP
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
    "manifest-src 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
};
