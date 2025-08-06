import { getConnection } from '../../lib/mysql';

// Ajouter un article
export async function addArticle(data) {
  const connection = await getConnection();
  try {
    const { title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author } = data;
    const [result] = await connection.query(
      `INSERT INTO articles 
        (title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('[addArticle] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Modifier un article
export async function updateArticle(id, data) {
  const connection = await getConnection();
  try {
    const { title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author } = data;
    await connection.query(
      `UPDATE articles SET 
        title=?, excerpt=?, content=?, meta_title=?, meta_description=?, status=?, publish_date=?, category=?, featured_image=?, image_alt=?, tags=?, author=?
        WHERE id=?`,
      [title, excerpt, content, meta_title, meta_description, status, publish_date, category, featured_image, image_alt, tags, author, id]
    );
    return { success: true };
  } catch (error) {
    console.error('[updateArticle] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Supprimer un article
export async function deleteArticle(id) {
  const connection = await getConnection();
  try {
    await connection.query('DELETE FROM articles WHERE id=?', [id]);
    return { success: true };
  } catch (error) {
    console.error('[deleteArticle] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}