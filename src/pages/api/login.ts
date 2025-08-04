// src/pages/api/login.ts
import type { APIRoute } from 'astro';

function sanitize(input: string): string {
  return input.replace(/[<>"'`;&]/g, '').trim();
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = sanitize(form.get('email')?.toString() || '');
  const password = sanitize(form.get('password')?.toString() || '');

  const valid = email === 'admin@m2epolytech.fr' && password === 'securepassword'; // TODO: replace

  if (!valid) {
    return new Response(JSON.stringify({ success: false, message: 'Identifiants incorrects.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ✅ Auth réussie : créer une session/token ici si nécessaire
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
