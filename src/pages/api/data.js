import { getConnection } from '../../lib/mysql';

export async function getAllHomepageData() {
  let connection;
  try {
    connection = await getConnection();

    const [articles] = await connection.query('SELECT * FROM articles');
    const [events] = await connection.query('SELECT * FROM events');
    const [formations] = await connection.query('SELECT * FROM formations');
    const [contact_messages] = await connection.query('SELECT * FROM contact_messages');

    return {
      articles,
      events,
      formations,
      contact_messages
    };
  } catch (error) {
    console.error('[getAllHomepageData] Erreur SQL :', error.message);
    return {
      articles: [],
      events: [],
      formations: [],
      contact_messages: [],
      error: error.message
    };
  } finally {
    if (connection) {
      connection.release(); // ✅ Corrigé : libère la connexion au pool
    }
  }
}
