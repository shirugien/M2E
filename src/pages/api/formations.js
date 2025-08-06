import { getConnection } from '../../lib/mysql.js';

// GET - Récupérer toutes les formations
export async function GET({ url }) {
  const connection = await getConnection();
  try {
    const searchParams = new URL(url).searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM formations WHERE 1=1';
    const params = [];

    if (type && type !== 'Tous') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status && status !== 'Tous') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [formations] = await connection.query(query, params);
    
    return new Response(
      JSON.stringify({ success: true, formations }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// POST - Créer une nouvelle formation
export async function POST({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const {
      title,
      description,
      type,
      duration,
      status = 'draft',
      students = 0,
      level,
      requirements,
      objectives,
      program,
      career_prospects
    } = data;

    if (!title || !description || !type || !duration) {
      return new Response(
        JSON.stringify({ success: false, message: 'Tous les champs obligatoires doivent être remplis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le titre existe déjà
    const [existing] = await connection.query('SELECT id FROM formations WHERE title = ?', [title]);
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Ce titre de formation existe déjà' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO formations 
        (title, description, type, duration, status, students, level, requirements, objectives, program, career_prospects, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description, type, duration, status, students, level, requirements, objectives, program, career_prospects]
    );

    return new Response(
      JSON.stringify({ success: true, id: result.insertId, message: 'Formation créée avec succès' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// PUT - Mettre à jour une formation
export async function PUT({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de la formation requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le titre existe déjà (sauf pour la formation courante)
    if (updateData.title) {
      const [existing] = await connection.query('SELECT id FROM formations WHERE title = ? AND id != ?', [updateData.title, id]);
      if (existing.length > 0) {
        return new Response(
          JSON.stringify({ success: false, message: 'Ce titre de formation existe déjà' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await connection.query(
      `UPDATE formations SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Formation mise à jour avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// DELETE - Supprimer une formation
export async function DELETE({ request }) {
  const connection = await getConnection();
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de la formation requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connection.query('DELETE FROM formations WHERE id = ?', [id]);

    return new Response(
      JSON.stringify({ success: true, message: 'Formation supprimée avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}