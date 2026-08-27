/**
 * Rutas de la API REST Segura (/api/v1)
 */
const express = require('express');
const router = express.Router();

const { authLimiter } = require('../config/security');
const { validateUserRegistration, validateProgressUpdate } = require('../middlewares/validate');

const {
  getDepartments,
  registerUser,
  getUserProfile
} = require('../controllers/userController');

const {
  updateProgress,
  resetProgress
} = require('../controllers/progressController');

const {
  getLeaderboard,
  getGeneralStats,
  getUsersAudit
} = require('../controllers/statsController');

const authController = require('../controllers/authController');

// Middleware para verificar token de admin
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
  next();
};

// --- Rutas de Usuarios y Autenticación ---
router.get('/departments', getDepartments);
router.post('/auth/login', authLimiter, authController.loginWithAD);
// router.post('/users/register', authLimiter, validateUserRegistration, registerUser); // Deprecated
router.get('/users/:id', getUserProfile);

// --- Rutas de Progreso de Entrenamiento ---
router.post('/progress/update', validateProgressUpdate, updateProgress);
router.post('/progress/reset/:userId', resetProgress);

// --- Rutas de Leaderboard y Métricas ---
router.get('/stats/leaderboard', getLeaderboard);
router.get('/stats/summary', requireAdmin, getGeneralStats);
router.get('/stats/users', requireAdmin, getUsersAudit);

module.exports = router;
