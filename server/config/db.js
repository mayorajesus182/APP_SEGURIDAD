/**
 * Configuración del Pool de Conexiones a PostgreSQL
 * Utiliza consultas parametrizadas para prevenir inyecciones SQL.
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ciberseguridad_db',
  user: process.env.DB_USER || 's7b_security_admin',
  password: process.env.DB_PASSWORD || 'Suiche7B_SecurePassword_2026!',
  max: 20, // Máximo de conexiones concurrentes en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el pool de PostgreSQL:', err.message);
});

// Función de consulta segura con logging controlado
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SQL Query] Executed in ${duration}ms | Rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`❌ [SQL Error] ${error.message} | Query: ${text}`);
    throw error;
  }
};

// Función para registrar auditoría de forma centralizada
const logAudit = async (userId, actionType, details = {}, ip = '127.0.0.1', userAgent = '') => {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action_type, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, actionType, JSON.stringify(details), ip, userAgent]
    );
  } catch (err) {
    console.error('Error registrando auditoría:', err.message);
  }
};

module.exports = {
  pool,
  query,
  logAudit,
};
