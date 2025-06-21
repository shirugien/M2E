import type { MiddlewareResponseHandler } from 'astro';

export const securityHeaders: MiddlewareResponseHandler = async (context, next) => {
  const response = await next();
  
  // Protection contre le clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Protection XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Empêche le MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS en production
  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Politique de référent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Content Security Policy
  const csp = [
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
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
};