import { getConnection } from '../../lib/mysql.js';

// GET - Récupérer tous les articles
export async function GET({ url }) {
  const connection = await getConnection();
  try {
    const searchParams = new URL(url).searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM articles WHERE 1=1';
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

    query += ' ORDER BY created_at DESC';

    const [articles] = await connection.query(query, params);
    
    return new Response(
      JSON.stringify({ success: true, articles }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// POST - Créer un nouvel article
export async function POST({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const {
      title,
      excerpt,
      content,
      meta_title,
      meta_description,
      status = 'draft',
      publish_date,
      category,
      featured_image,
      image_alt,
      tags,
      author = 'Admin'
    } = data;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ success: false, message: 'Titre et contenu requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [result] = await connection.query(
      `INSERT INTO articles 
        (title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author]
    );

    return new Response(
      JSON.stringify({ success: true, id: result.insertId, message: 'Article créé avec succès' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// PUT - Mettre à jour un article
export async function PUT({ request }) {
  const connection = await getConnection();
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de l\'article requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await connection.query(
      `UPDATE articles SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Article mis à jour avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}

// DELETE - Supprimer un article
export async function DELETE({ request }) {
  const connection = await getConnection();
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID de l\'article requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connection.query('DELETE FROM articles WHERE id = ?', [id]);

    return new Response(
      JSON.stringify({ success: true, message: 'Article supprimé avec succès' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    connection.release();
  }
}