import { getConnection } from '../../lib/mysql.js';

// GET - Récupérer tous les messages de contact
export async function GET({ url }) {
  const connection = await getConnection();
  try {
    const searchParams = new URL(url).searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];

    if (status && status !== 'Tous') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'Toutes') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [messages] = await connection.query(query, params);
    
    return new Response(
      JSON.stringify({ success: true, messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// POST - Créer un nouveau message de contact
export async function POST({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const {
      name,
      email,
      subject,
      message,
      priority = 'normale',
      status = 'nouveau'
    } = data;

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'Tous les champs sont requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO contact_messages 
        (name, email, subject, message, priority, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, subject, message, priority, status]
    );

    return new Response(
      JSON.stringify({ success: true, id: result.insertId, message: 'Message envoyé avec succès' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// PUT - Mettre à jour le statut d'un message
export async function PUT({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const { id, status, priority } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID du message requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (priority) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Aucune mise à jour spécifiée' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    values.push(id);

    await connection.query(
      `UPDATE contact_messages SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Message mis à jour avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}