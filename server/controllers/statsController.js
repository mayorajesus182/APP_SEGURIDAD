/**
 * Controlador de Estadísticas y Tabla de Clasificación (Leaderboard)
 */
const { query } = require('../config/db');

// Obtener tabla de clasificación agregada por departamento
const getLeaderboard = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        d.name AS dept,
        COUNT(u.id) AS count,
        COALESCE(SUM(u.total_score), 0) AS total_department_score,
        CASE 
          WHEN SUM(u.total_questions) > 0 
          THEN ROUND((SUM(u.correct_answers)::numeric / SUM(u.total_questions)::numeric) * 100)
          ELSE 0 
        END AS correct_percent
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.is_active = TRUE
      GROUP BY d.id, d.name
      ORDER BY correct_percent DESC, total_department_score DESC, d.name ASC
    `);

    // Formatear la respuesta para el frontend
    const leaderboard = result.rows.map(row => ({
      dept: row.dept,
      count: parseInt(row.count, 10),
      totalScore: parseInt(row.total_department_score, 10),
      correctPercent: parseInt(row.correct_percent, 10)
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// Obtener métricas generales para administradores
const getGeneralStats = async (req, res, next) => {
  try {
    const totalUsersResult = await query('SELECT COUNT(*) AS total FROM users WHERE is_active = TRUE');
    const completedModulesResult = await query('SELECT COUNT(*) AS total FROM module_progress WHERE is_completed = TRUE');
    const totalScoreResult = await query('SELECT COALESCE(SUM(total_score), 0) AS total FROM users WHERE is_active = TRUE');
    const recentAuditsResult = await query(`
      SELECT a.id, a.action_type, a.created_at, u.full_name, a.details
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].total, 10),
        totalModulesCompleted: parseInt(completedModulesResult.rows[0].total, 10),
        totalScore: parseInt(totalScoreResult.rows[0].total, 10),
        recentActivity: recentAuditsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener auditoría detallada de todos los usuarios
const getUsersAudit = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.full_name, d.name AS department, u.total_score, 
        u.correct_answers, u.total_questions, u.created_at, u.last_activity,
        (SELECT COUNT(*) FROM module_progress mp WHERE mp.user_id = u.id AND mp.is_completed = TRUE) as modules_completed
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.total_score DESC, u.last_activity DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getGeneralStats,
  getUsersAudit
};
