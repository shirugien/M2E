// src/middleware/index.ts
import { sequence } from 'astro/middleware';
import { bruteForceProtection, securityHeaders } from './security';

export const onRequest = sequence(
  bruteForceProtection,
  securityHeaders     
);
