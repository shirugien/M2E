import { getConnection } from '../../lib/mysql.js';

// GET - Récupérer tous les événements
export async function GET({ url }) {
  const connection = await getConnection();
  try {
    const searchParams = new URL(url).searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (status && status !== 'Tous') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'Toutes') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY date DESC';

    const [events] = await connection.query(query, params);
    
    return new Response(
      JSON.stringify({ success: true, events }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// POST - Créer un nouvel événement
export async function POST({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      status = 'draft',
      registration_required = false,
      max_participants,
      registration_deadline,
      registration_url,
      contact_name,
      contact_email,
      contact_phone
    } = data;

    if (!title || !description || !date || !time || !location) {
      return new Response(
        JSON.stringify({ success: false, message: 'Tous les champs obligatoires doivent être remplis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO events 
        (title, description, date, time, location, category, status, registration_required, max_participants, registration_deadline, registration_url, contact_name, contact_email, contact_phone, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description, date, time, location, category, status, registration_required, max_participants, registration_deadline, registration_url, contact_name, contact_email, contact_phone]
    );

    return new Response(
      JSON.stringify({ success: true, id: result.insertId, message: 'Événement créé avec succès' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// PUT - Mettre à jour un événement
export async function PUT({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de l\'événement requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await connection.query(
      `UPDATE events SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Événement mis à jour avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// DELETE - Supprimer un événement
export async function DELETE({ request }) {
  const connection = await getConnection();
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de l\'événement requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connection.query('DELETE FROM events WHERE id = ?', [id]);

    return new Response(
      JSON.stringify({ success: true, message: 'Événement supprimé avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}