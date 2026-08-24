/**
 * Controlador de Progreso de Módulos y Puntuaciones
 */
const { query, logAudit } = require('../config/db');

// Actualizar progreso de un módulo y puntuación general
const updateProgress = async (req, res, next) => {
  try {
    const { userId, moduleKey, scoreEarned, isCompleted, isCorrectAnswer } = req.sanitizedProgress;
    const clientIp = req.ip || req.connection.remoteAddress;

    // 1. Actualizar tabla module_progress
    await query(
      `INSERT INTO module_progress (user_id, module_key, is_completed, score_earned, attempts, completed_at, last_updated)
       VALUES ($1, $2, $3, $4, 1, CASE WHEN $3 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, module_key) DO UPDATE SET
         is_completed = EXCLUDED.is_completed OR module_progress.is_completed,
         score_earned = module_progress.score_earned + EXCLUDED.score_earned,
         attempts = module_progress.attempts + 1,
         completed_at = CASE 
           WHEN EXCLUDED.is_completed = TRUE AND module_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP 
           ELSE module_progress.completed_at 
         END,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, moduleKey, isCompleted, scoreEarned]
    );

    // 2. Actualizar puntuación total en tabla users
    const userUpdateResult = await query(
      `UPDATE users SET
         total_score = total_score + $1,
         correct_answers = correct_answers + CASE WHEN $2 = TRUE THEN 1 ELSE 0 END,
         total_questions = total_questions + 1,
         last_activity = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING total_score, correct_answers, total_questions`,
      [scoreEarned, isCorrectAnswer, userId]
    );

    if (userUpdateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const updatedUser = userUpdateResult.rows[0];

    // 3. Registrar auditoría si se completó el módulo
    if (isCompleted) {
      await logAudit(
        userId,
        'MODULE_COMPLETED',
        { moduleKey, scoreEarned, totalScore: updatedUser.total_score },
        clientIp
      );
    }

    res.json({
      success: true,
      data: {
        score: updatedUser.total_score,
        correctAnswers: updatedUser.correct_answers,
        totalQuestions: updatedUser.total_questions,
        moduleKey,
        isCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// Reiniciar progreso del usuario
const resetProgress = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const clientIp = req.ip || req.connection.remoteAddress;

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'ID de usuario inválido.' });
    }

    // Reiniciar puntuaciones del usuario
    await query(
      `UPDATE users SET
         total_score = 0,
         correct_answers = 0,
         total_questions = 0,
         last_activity = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    // Reiniciar módulos
    await query(
      `UPDATE module_progress SET
         is_completed = FALSE,
         score_earned = 0,
         attempts = 0,
         completed_at = NULL,
         last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );

    await logAudit(userId, 'PROGRESS_RESET', { reason: 'User requested reset' }, clientIp);

    res.json({
      success: true,
      message: 'Progreso reiniciado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProgress,
  resetProgress
};
