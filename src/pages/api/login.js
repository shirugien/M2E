import { getConnection } from '../../lib/mysql.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email et mot de passe requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const connection = await getConnection();
    
    try {
      // Vérifier les identifiants (pour la démo, utilisateur admin simple)
      if (email === 'admin@m2epolytech.fr' && password === 'admin123') {
        const token = jwt.sign(
          { email, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Connexion réussie',
            token 
          }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400`
            } 
          }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, message: 'Identifiants incorrects' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}