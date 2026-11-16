/**
 * Configuración del Pool de Conexiones a PostgreSQL y Auto-Migración de Esquema (Fase 2)
 * Utiliza consultas parametrizadas para prevenir inyecciones SQL.
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const PHASE1_MODULES = ['phishing', 'pci', 'incident', 'password', 'usb'];
const PHASE2_MODULES = ['ai_sec', 'pci_dss', 'quishing_mfa', 'bec_fraud', 'remote_vpn'];
const ALL_MODULES = [...PHASE1_MODULES, ...PHASE2_MODULES];

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

// Auto-migración segura para bases de datos existentes en contenedores Docker
const ensureSchema = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(60) PRIMARY KEY,
        setting_value JSONB NOT NULL,
        updated_by VARCHAR(100) DEFAULT 'system',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phase VARCHAR(20) NOT NULL,
        certificate_code VARCHAR(40) UNIQUE NOT NULL,
        score_at_issue INTEGER DEFAULT 0,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_phase_cert UNIQUE (user_id, phase)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
    `);

    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_by)
      VALUES (
        'academy_config',
        '{"activePhaseMode": "both", "campaignName": "Programa Anual de Concientización 2026", "requirePhase1ForPhase2": false}'::jsonb,
        'system'
      )
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    console.log('✅ Esquema PostgreSQL Fase 1 + Fase 2 verificado correctamente.');
  } catch (err) {
    console.warn('⚠️ Aviso al verificar esquema de base de datos (modo offline o DB iniciando):', err.message);
  }
};

module.exports = {
  pool,
  query,
  logAudit,
  ensureSchema,
  PHASE1_MODULES,
  PHASE2_MODULES,
  ALL_MODULES,
};
