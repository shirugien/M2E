// lib/mysql.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test',
  port: Number(process.env.MYSQL_PORT) || 3306,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

/**
 * Obtenir une connexion MySQL depuis le pool.
 */
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[MySQL] Connexion obtenue du pool');
    return connection;
  } catch (error) {
    console.error('[MySQL] Erreur de connexion :', error.message);
    throw error;
  }
}

/**
 * Fermer complètement le pool (utile lors de l'arrêt du serveur).
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('[MySQL] Pool fermé proprement');
  } catch (error) {
    console.error('[MySQL] Erreur lors de la fermeture du pool :', error.message);
  }
}
