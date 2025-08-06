import { getConnection } from '../../lib/mysql';

// Vérifie si un titre de formation existe déjà (hors id donné)
export async function isFormationTitleExists(title, excludeId = null) {
  const connection = await getConnection();
  try {
    let query = 'SELECT COUNT(*) as count FROM formations WHERE title = ?';
    let params = [title];
    if (excludeId !== null) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await connection.query(query, params);
    return rows[0].count > 0;
  } catch (error) {
    console.error('[isFormationTitleExists] Erreur SQL :', error.message);
    return false;
  } finally {
    connection.release();
  }
}

// Ajouter une formation
export async function addFormation(data) {
  const connection = await getConnection();
  try {
    // Vérification du titre
    const exists = await isFormationTitleExists(data.title);
    if (exists) {
      return { success: false, error: "Ce titre de formation existe déjà." };
    }
    const { title, description, type, duration, status, students } = data;
    const [result] = await connection.query(
      'INSERT INTO formations (title, description, type, duration, status, students) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, type, duration, status, students]
    );
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('[addFormation] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Modifier une formation
export async function updateFormation(id, data) {
  const connection = await getConnection();
  try {
    // Vérification du titre (hors la formation courante)
    const exists = await isFormationTitleExists(data.title, id);
    if (exists) {
      return { success: false, error: "Ce titre de formation existe déjà." };
    }
    const { title, description, type, duration, status, students } = data;
    await connection.query(
      'UPDATE formations SET title=?, description=?, type=?, duration=?, status=?, students=? WHERE id=?',
      [title, description, type, duration, status, students, id]
    );
    return { success: true };
  } catch (error) {
    console.error('[updateFormation] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Supprimer une formation
export async function deleteFormation(id) {
  const connection = await getConnection();
  try {
    await connection.query('DELETE FROM formations WHERE id=?', [id]);
    return { success: true };
  } catch (error) {
    console.error('[deleteFormation] Erreur SQL :', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}