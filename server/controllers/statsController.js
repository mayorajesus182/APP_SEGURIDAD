/**
 * Controlador de Estadísticas, Configuración de Fases (Fase 1 / Fase 2 / Ambas),
 * Auditoría Detallada y Verificación de Certificados (Con Resiliencia Local).
 */
const { query, logAudit, PHASE1_MODULES, PHASE2_MODULES } = require('../config/db');
const { getAcademyConfigFromDB } = require('./authController');

let inMemoryAcademyConfig = {
  activePhaseMode: 'both',
  campaignName: 'Programa Anual de Concientización 2026',
  requirePhase1ForPhase2: false
};

let inMemoryScenarios = null;

// 1. Obtener tabla de clasificación agregada por departamento (Leaderboard)
const getLeaderboard = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        d.name AS dept,
        COUNT(u.id) AS count,
        COALESCE(SUM(u.total_score), 0) AS total_department_score,
        CASE 
          WHEN COALESCE(SUM(u.total_questions), 0) > 0 
          THEN ROUND((SUM(u.correct_answers)::numeric / SUM(u.total_questions)::numeric) * 100)
          ELSE 0 
        END AS correct_percent,
        COALESCE((
          SELECT COUNT(*)
          FROM module_progress mp
          JOIN users u2 ON mp.user_id = u2.id
          WHERE u2.department_id = d.id AND u2.is_active = TRUE AND mp.is_completed = TRUE
            AND mp.module_key = ANY(ARRAY[${[...PHASE1_MODULES, ...PHASE2_MODULES].map(m => `'${m}'`).join(',')}]::text[])
        ), 0) AS completed_modules_dept
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.is_active = TRUE
      GROUP BY d.id, d.name
      ORDER BY total_department_score DESC, correct_percent DESC, d.name ASC
    `);

    const leaderboard = result.rows.map(row => ({
      dept: row.dept,
      count: parseInt(row.count, 10),
      totalScore: parseInt(row.total_department_score, 10),
      correctPercent: parseInt(row.correct_percent, 10),
      completedModules: parseInt(row.completed_modules_dept, 10)
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.json({
      success: true,
      data: []
    });
  }
};

// 2. Obtener métricas generales para administradores (Soporta Fase 1 + Fase 2)
const getGeneralStats = async (req, res) => {
  try {
    const totalUsersResult = await query('SELECT COUNT(*) AS total FROM users WHERE is_active = TRUE');
    const completedModulesResult = await query(
      'SELECT COUNT(*) AS total FROM module_progress WHERE is_completed = TRUE AND module_key = ANY($1)',
      [[...PHASE1_MODULES, ...PHASE2_MODULES]]
    );
    const phase1CompletedResult = await query(
      `SELECT COUNT(*) AS total FROM module_progress WHERE is_completed = TRUE AND module_key = ANY($1)`,
      [PHASE1_MODULES]
    );
    const phase2CompletedResult = await query(
      `SELECT COUNT(*) AS total FROM module_progress WHERE is_completed = TRUE AND module_key = ANY($1)`,
      [PHASE2_MODULES]
    );
    const totalScoreResult = await query('SELECT COALESCE(SUM(total_score), 0) AS total FROM users WHERE is_active = TRUE');
    const successRateResult = await query(`
      SELECT CASE
        WHEN COALESCE(SUM(total_questions), 0) > 0
        THEN ROUND((SUM(correct_answers)::numeric / SUM(total_questions)::numeric) * 100)
        ELSE 0
      END AS percentage
      FROM users
      WHERE is_active = TRUE
    `);

    let totalCertificates = 0;
    try {
      const certRes = await query('SELECT COUNT(*) AS total FROM certificates');
      totalCertificates = parseInt(certRes.rows[0].total, 10);
    } catch (e) {
      totalCertificates = 0;
    }

    const recentAuditsResult = await query(`
      SELECT a.id, a.action_type, a.created_at, u.full_name, a.details
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 15
    `);

    const academyConfig = await getAcademyConfigFromDB(inMemoryAcademyConfig);
    inMemoryAcademyConfig = { ...inMemoryAcademyConfig, ...academyConfig };

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].total, 10),
        totalModulesCompleted: parseInt(completedModulesResult.rows[0].total, 10),
        phase1ModulesCompleted: parseInt(phase1CompletedResult.rows[0].total, 10),
        phase2ModulesCompleted: parseInt(phase2CompletedResult.rows[0].total, 10),
        totalCertificates,
        totalScore: parseInt(totalScoreResult.rows[0].total, 10),
        successRate: parseInt(successRateResult.rows[0].percentage, 10),
        academyConfig: inMemoryAcademyConfig,
        recentActivity: recentAuditsResult.rows
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalModulesCompleted: 0,
        phase1ModulesCompleted: 0,
        phase2ModulesCompleted: 0,
        totalCertificates: 0,
        totalScore: 0,
        successRate: 0,
        academyConfig: inMemoryAcademyConfig,
        recentActivity: []
      }
    });
  }
};

// 3. Obtener auditoría detallada de todos los usuarios con desglose Fase 1 y Fase 2
const getUsersAudit = async (req, res) => {
  try {
    const result = await query(`
      WITH current_users AS (
        SELECT DISTINCT ON (LOWER(BTRIM(u.full_name)))
          u.id, u.employee_id, u.full_name, u.department_id, u.total_score,
          u.correct_answers, u.total_questions, u.created_at, u.last_activity
        FROM users u
        WHERE u.is_active = TRUE
        ORDER BY
          LOWER(BTRIM(u.full_name)),
          u.total_score DESC,
          u.last_activity DESC,
          u.id DESC
      )
      SELECT
        u.id, u.employee_id, u.full_name, d.name AS department, u.total_score,
        u.correct_answers, u.total_questions, u.created_at, u.last_activity,
        (SELECT COUNT(*) FROM module_progress mp WHERE mp.user_id = u.id AND mp.is_completed = TRUE AND mp.module_key = ANY($1::text[] || $2::text[])) AS modules_completed,
        (SELECT COUNT(*) FROM module_progress mp WHERE mp.user_id = u.id AND mp.is_completed = TRUE AND mp.module_key = ANY($1)) AS phase1_completed,
        (SELECT COUNT(*) FROM module_progress mp WHERE mp.user_id = u.id AND mp.is_completed = TRUE AND mp.module_key = ANY($2)) AS phase2_completed,
        COALESCE(
          (SELECT json_agg(mp.module_key) FROM module_progress mp WHERE mp.user_id = u.id AND mp.is_completed = TRUE),
          '[]'::json
        ) AS completed_keys
      FROM current_users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.total_score DESC, u.last_activity DESC
    `, [PHASE1_MODULES, PHASE2_MODULES]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.json({
      success: true,
      data: []
    });
  }
};

// 4. Obtener y actualizar la configuración global de Fases (Fase 1, Fase 2 o Ambas)
const getAcademySettings = async (req, res) => {
  try {
    const config = await getAcademyConfigFromDB(inMemoryAcademyConfig);
    inMemoryAcademyConfig = { ...inMemoryAcademyConfig, ...config };
    res.json({
      success: true,
      data: inMemoryAcademyConfig
    });
  } catch (error) {
    res.json({
      success: true,
      data: inMemoryAcademyConfig
    });
  }
};

const updateAcademySettings = async (req, res) => {
  const { activePhaseMode, campaignName, requirePhase1ForPhase2 } = req.body;
  const validModes = ['phase1', 'phase2', 'both'];

  if (!activePhaseMode || !validModes.includes(activePhaseMode)) {
    return res.status(400).json({
      success: false,
      message: 'Modo de fase inválido. Valores permitidos: phase1, phase2, both.'
    });
  }

  inMemoryAcademyConfig = {
    ...inMemoryAcademyConfig,
    activePhaseMode,
    campaignName: campaignName ? String(campaignName).trim().slice(0, 120) : inMemoryAcademyConfig.campaignName,
    requirePhase1ForPhase2: Boolean(requirePhase1ForPhase2)
  };

  try {
    await query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES ('academy_config', $1::jsonb, 'admin', CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         updated_by = 'admin',
         updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(inMemoryAcademyConfig)]
    );

    const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    await logAudit(null, 'ACADEMY_PHASE_CONFIG_UPDATED', inMemoryAcademyConfig, clientIp);
  } catch (e) {
    console.warn('Configuración de fases guardada en memoria (DB offline):', e.message);
  }

  res.json({
    success: true,
    message: 'Configuración de fases actualizada correctamente.',
    data: inMemoryAcademyConfig
  });
};

// 5. Obtener y guardar plantillas personalizadas de escenarios en PostgreSQL
const getCustomScenarios = async (req, res) => {
  try {
    const result = await query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'custom_scenarios'"
    );
    res.json({
      success: true,
      data: result.rows.length > 0 ? result.rows[0].setting_value : inMemoryScenarios
    });
  } catch (error) {
    res.json({
      success: true,
      data: inMemoryScenarios
    });
  }
};

const saveCustomScenarios = async (req, res) => {
  const scenarios = req.body;
  if (!scenarios || typeof scenarios !== 'object') {
    return res.status(400).json({ success: false, message: 'Formato de escenarios inválido.' });
  }
  inMemoryScenarios = scenarios;

  try {
    await query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES ('custom_scenarios', $1::jsonb, 'admin', CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         updated_by = 'admin',
         updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(scenarios)]
    );

    const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    await logAudit(null, 'CUSTOM_SCENARIOS_UPDATED', { keys: Object.keys(scenarios) }, clientIp);
  } catch (e) {
    console.warn('Escenarios guardados en memoria (DB offline):', e.message);
  }

  res.json({
    success: true,
    message: 'Escenarios personalizados guardados exitosamente.'
  });
};

// 6. Verificar autenticidad de un Certificado por Código
const verifyCertificate = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Código de certificado requerido.' });
    }

    const result = await query(
      `SELECT c.certificate_code, c.phase, c.score_at_issue, c.issued_at,
              u.full_name, d.name AS department
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE UPPER(c.certificate_code) = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No se encontró ningún certificado oficial con ese código en los registros de Suiche 7B.'
      });
    }

    res.json({
      success: true,
      valid: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      valid: false,
      message: 'No se pudo verificar el certificado en este momento.'
    });
  }
};

module.exports = {
  getLeaderboard,
  getGeneralStats,
  getUsersAudit,
  getAcademySettings,
  updateAcademySettings,
  getCustomScenarios,
  saveCustomScenarios,
  verifyCertificate
};
