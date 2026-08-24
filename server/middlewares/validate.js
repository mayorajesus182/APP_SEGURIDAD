/**
 * Middleware de Validación y Sanitización de Entradas
 * Previene XSS y datos malformados.
 */

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

// Validación para actualización de progreso
const validateProgressUpdate = (req, res, next) => {
  const { userId, moduleKey, scoreEarned, isCompleted, isCorrectAnswer } = req.body;

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId) || parsedUserId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID de usuario inválido.'
    });
  }

  const validModules = ['phishing', 'pci', 'incident', 'password', 'usb'];
  if (!moduleKey || !validModules.includes(moduleKey)) {
    return res.status(400).json({
      success: false,
      error: 'Módulo de entrenamiento no reconocido.'
    });
  }

  const points = parseInt(scoreEarned, 10);
  req.sanitizedProgress = {
    userId: parsedUserId,
    moduleKey,
    scoreEarned: isNaN(points) ? 0 : Math.max(0, Math.min(points, 200)), // Límite razonable de puntos por módulo
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
