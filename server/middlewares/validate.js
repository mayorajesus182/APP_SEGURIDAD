/**
 * Middleware de Validación y Sanitización de Entradas
 * Previene XSS, manipulación de IDs y datos malformados.
 */
const { ALL_MODULES } = require('../config/db');

// Función auxiliar para escapar caracteres HTML peligrosos
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[&<>"'/]/g, (s) => {
      const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
      };
      return entityMap[s] || s;
    });
};

// Validación para registro de usuario
const validateUserRegistration = (req, res, next) => {
  const { name, department } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: 'El nombre es obligatorio y debe tener entre 2 y 100 caracteres.'
    });
  }

  if (!department || typeof department !== 'string' || department.trim().length < 2 || department.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: 'El departamento es obligatorio.'
    });
  }

  // Sanitizar valores limpios
  req.sanitizedBody = {
    name: name.trim().slice(0, 100),
    department: department.trim().slice(0, 100),
    employeeId: req.body.employeeId ? String(req.body.employeeId).trim().slice(0, 50) : null
  };

  next();
};

// Validación para actualización de progreso (Soporta los 10 módulos de Fase 1 y Fase 2)
const validateProgressUpdate = (req, res, next) => {
  const { userId, moduleKey, scoreEarned, isCompleted, isCorrectAnswer } = req.body;

  // Si existe sesión JWT de usuario no-admin, forzar que el userId coincida con el token autenticado
  const effectiveUserId = (req.auth && !req.auth.isAdmin && req.auth.id)
    ? parseInt(req.auth.id, 10)
    : parseInt(userId, 10);

  if (isNaN(effectiveUserId) || effectiveUserId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de usuario inválido.'
    });
  }

  if (!moduleKey || !ALL_MODULES.includes(moduleKey)) {
    return res.status(400).json({
      success: false,
      error: `Módulo de entrenamiento no reconocido (${moduleKey}).`
    });
  }

  const points = parseInt(scoreEarned, 10);
  req.sanitizedProgress = {
    userId: effectiveUserId,
    moduleKey,
    scoreEarned: isNaN(points) ? 0 : Math.max(0, Math.min(points, 200)), // Límite razonable de puntos por acción
    isCompleted: Boolean(isCompleted),
    isCorrectAnswer: Boolean(isCorrectAnswer)
  };

  next();
};

module.exports = {
  sanitizeString,
  validateUserRegistration,
  validateProgressUpdate
};
