import { getConnection } from '../../../lib/mysql.js';

// GET - Récupérer un événement par ID
export async function GET({ params }) {
  const connection = await getConnection();
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de l\'événement requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [events] = await connection.query('SELECT * FROM events WHERE id = ?', [id]);
    
    if (events.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Événement non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, event: events[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}