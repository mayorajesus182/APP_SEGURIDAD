/**
 * Controlador de Progreso de Módulos, Control Anti-Farming y Emisión de Certificados (Fase 1 + Fase 2)
 */
const crypto = require('crypto');
const { query, logAudit, PHASE1_MODULES, PHASE2_MODULES } = require('../config/db');

// Tope máximo de puntos por módulo para impedir inflación ("Point Farming") por repetición
const MODULE_MAX_SCORES = {
  // Fase 1
  phishing: 150,
  pci: 160,
  incident: 100,
  password: 100,
  usb: 150,
  // Fase 2
  ai_sec: 150,
  pci_dss: 150,
  quishing_mfa: 150,
  bec_fraud: 150,
  remote_vpn: 150,
  // Arcade (juegos extra: no afectan certificados)
  arcade_jornada: 300,
  arcade_bandeja: 200,
  arcade_cartas: 200,
  arcade_boveda: 250
};

// Generar código único verificable de certificado institucional
const generateCertificateCode = (userId, phase) => {
  const prefix = phase === 'phase1' ? 'F1' : phase === 'phase2' ? 'F2' : 'M2';
  const digest = crypto
    .createHash('sha256')
    .update(`S7B-${userId}-${phase}-CERT-2026`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  return `S7B-${prefix}-${String(userId).padStart(3, '0')}-${digest}`;
};

// Emitir certificados automáticamente cuando el colaborador completa Fase 1, Fase 2 o Ambas
const evaluateAndIssueCertificates = async (userId, totalScore, clientIp) => {
  const progressRes = await query(
    'SELECT module_key, is_completed FROM module_progress WHERE user_id = $1',
    [userId]
  );

  const completedMap = {};
  progressRes.rows.forEach(r => {
    completedMap[r.module_key] = Boolean(r.is_completed);
  });

  const phase1Done = PHASE1_MODULES.every(m => completedMap[m]);
  const phase2Done = PHASE2_MODULES.every(m => completedMap[m]);

  const phasesToIssue = [];
  if (phase1Done) phasesToIssue.push('phase1');
  if (phase2Done) phasesToIssue.push('phase2');
  if (phase1Done && phase2Done) phasesToIssue.push('master');

  for (const phase of phasesToIssue) {
    const code = generateCertificateCode(userId, phase);
    const insertRes = await query(
      `INSERT INTO certificates (user_id, phase, certificate_code, score_at_issue)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, phase) DO UPDATE SET
         score_at_issue = GREATEST(certificates.score_at_issue, EXCLUDED.score_at_issue)
       RETURNING certificate_code, phase, score_at_issue, issued_at`,
      [userId, phase, code, totalScore]
    );

    if (insertRes.rowCount > 0) {
      await logAudit(
        userId,
        'CERTIFICATE_ISSUED',
        { phase, certificateCode: code, score: totalScore },
        clientIp
      );
    }
  }

  const certList = await query(
    'SELECT phase, certificate_code, score_at_issue, issued_at FROM certificates WHERE user_id = $1',
    [userId]
  );

  const certificates = {};
  certList.rows.forEach(c => {
    certificates[c.phase] = {
      code: c.certificate_code,
      score: c.score_at_issue,
      issuedAt: c.issued_at
    };
  });

  return certificates;
};

// Actualizar progreso de un módulo y puntuación general (Con protección Anti-Farming)
const updateProgress = async (req, res, next) => {
  try {
    const { userId, moduleKey, scoreEarned, isCompleted, isCorrectAnswer } = req.sanitizedProgress;
    const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    const maxCap = MODULE_MAX_SCORES[moduleKey] || 150;

    // Consultar estado previo del módulo para saber si ya estaba completado al máximo
    const prevModRes = await query(
      'SELECT is_completed, score_earned FROM module_progress WHERE user_id = $1 AND module_key = $2',
      [userId, moduleKey]
    );

    const prevCompleted = prevModRes.rows.length > 0 ? Boolean(prevModRes.rows[0].is_completed) : false;
    const prevScore = prevModRes.rows.length > 0 ? parseInt(prevModRes.rows[0].score_earned || 0, 10) : 0;

    // Consultar si el Administrador tiene activo el switch de permitir repetir módulos
    let allowRetries = false;
    try {
      const cfgRes = await query("SELECT setting_value FROM system_settings WHERE setting_key = 'academy_config'");
      if (cfgRes.rows.length > 0 && cfgRes.rows[0].setting_value) {
        allowRetries = Boolean(cfgRes.rows[0].setting_value.allowModuleRetries);
      }
    } catch (e) {
      allowRetries = false;
    }

    // Anti-Farming estricto: si el módulo ya fue completado y el switch de repetición está INACTIVO, bloquear
    if (prevCompleted && !allowRetries) {
      const currentUserRes = await query(
        'SELECT total_score, correct_answers, total_questions FROM users WHERE id = $1',
        [userId]
      );
      const u = currentUserRes.rows[0] || { total_score: 0, correct_answers: 0, total_questions: 0 };
      const certificates = await evaluateAndIssueCertificates(userId, parseInt(u.total_score || 0, 10), clientIp);
      return res.status(200).json({
        success: true,
        locked: true,
        message: 'Módulo ya completado previamente (Anti-Farming: 1 solo intento permitido).',
        data: {
          score: parseInt(u.total_score || 0, 10),
          correctAnswers: parseInt(u.correct_answers || 0, 10),
          totalQuestions: parseInt(u.total_questions || 0, 10),
          moduleKey,
          isCompleted: true,
          certificates
        }
      });
    }

    const alreadyMaxed = prevCompleted && prevScore >= maxCap;

    // 1. Actualizar tabla module_progress respetando el tope máximo del módulo (si es reintento habilitado, conserva el mejor puntaje)
    await query(
      `INSERT INTO module_progress (user_id, module_key, is_completed, score_earned, attempts, completed_at, last_updated)
       VALUES ($1, $2, $3, LEAST($4::integer, $5::integer), 1, CASE WHEN $3 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, module_key) DO UPDATE SET
         is_completed = EXCLUDED.is_completed OR module_progress.is_completed,
         score_earned = CASE
           WHEN module_progress.is_completed = TRUE THEN GREATEST(module_progress.score_earned, LEAST($4::integer, $5::integer))
           ELSE LEAST($5::integer, module_progress.score_earned + EXCLUDED.score_earned)
         END,
         attempts = CASE WHEN $3 = TRUE THEN module_progress.attempts + 1 ELSE GREATEST(1, module_progress.attempts) END,
         completed_at = CASE 
           WHEN EXCLUDED.is_completed = TRUE AND module_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP 
           ELSE module_progress.completed_at 
         END,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, moduleKey, isCompleted, scoreEarned, maxCap]
    );

    // 2. Recalcular puntaje total real como la suma exacta de module_progress
    // Solo contabilizar pregunta en estadísticas de precisión si es una jugada de evaluación (no el evento final de cierre sin puntos ni repetición ya al tope)
    const countQuestion = !alreadyMaxed && !(isCompleted && scoreEarned === 0 && moduleKey !== 'password');

    const userUpdateResult = await query(
      `UPDATE users SET
         total_score = (SELECT COALESCE(SUM(score_earned), 0) FROM module_progress WHERE user_id = $1),
         correct_answers = correct_answers + CASE WHEN $2 = TRUE AND $3 = TRUE THEN 1 ELSE 0 END,
         total_questions = total_questions + CASE WHEN $3 = TRUE THEN 1 ELSE 0 END,
         last_activity = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING total_score, correct_answers, total_questions`,
      [userId, isCorrectAnswer, countQuestion]
    );

    if (userUpdateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const updatedUser = userUpdateResult.rows[0];

    // 3. Registrar auditoría y verificar certificados si se completó el módulo
    let certificates = {};
    if (isCompleted) {
      await logAudit(
        userId,
        'MODULE_COMPLETED',
        { moduleKey, scoreEarned, totalScore: updatedUser.total_score },
        clientIp
      );
      certificates = await evaluateAndIssueCertificates(userId, updatedUser.total_score, clientIp);
    }

    res.json({
      success: true,
      data: {
        score: updatedUser.total_score,
        correctAnswers: updatedUser.correct_answers,
        totalQuestions: updatedUser.total_questions,
        moduleKey,
        isCompleted,
        certificates
      }
    });
  } catch (error) {
    if (error.message === 'DB_FAST_OFFLINE') {
      return res.json({
        success: true,
        localMode: true
      });
    }
    next(error);
  }
};

// Reiniciar progreso del usuario
const resetProgress = async (req, res, next) => {
  try {
    const requestedUserId = parseInt(req.params.userId, 10);
    const effectiveUserId = (req.auth && !req.auth.isAdmin && req.auth.id)
      ? parseInt(req.auth.id, 10)
      : requestedUserId;
    const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';

    if (isNaN(effectiveUserId)) {
      return res.status(400).json({ success: false, error: 'ID de usuario inválido.' });
    }

    await query(
      `UPDATE users SET
         total_score = 0,
         correct_answers = 0,
         total_questions = 0,
         last_activity = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [effectiveUserId]
    );

    await query(
      `UPDATE module_progress SET
         is_completed = FALSE,
         score_earned = 0,
         attempts = 0,
         completed_at = NULL,
         last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [effectiveUserId]
    );

    await logAudit(effectiveUserId, 'PROGRESS_RESET', { reason: 'User or Admin requested reset' }, clientIp);

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
  resetProgress,
  MODULE_MAX_SCORES
};
