/**
 * Rutas de la API REST Segura (/api/v1) - Soporte Fase 1 + Fase 2
 */
const express = require('express');
const router = express.Router();

const { authLimiter } = require('../config/security');
const { requireAdmin, verifyUserOrOptional } = require('../config/jwt');
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
  getUsersAudit,
  getAcademySettings,
  updateAcademySettings,
  getCustomScenarios,
  saveCustomScenarios,
  verifyCertificate
} = require('../controllers/statsController');

const authController = require('../controllers/authController');

// --- Rutas de Usuarios y Autenticación ---
router.get('/departments', getDepartments);
router.post('/auth/login', authLimiter, authController.loginWithAD);
router.post('/users/register', authLimiter, validateUserRegistration, registerUser);
router.get('/users/:id', verifyUserOrOptional, getUserProfile);

// --- Rutas de Progreso de Entrenamiento ---
router.post('/progress/update', verifyUserOrOptional, validateProgressUpdate, updateProgress);
router.post('/progress/reset/:userId', verifyUserOrOptional, resetProgress);

// --- Rutas de Configuración de Fases y Escenarios (Fase 1 / Fase 2 / Ambas) ---
router.get('/settings/phase', getAcademySettings);
router.post('/settings/phase', requireAdmin, updateAcademySettings);
router.get('/settings/scenarios', getCustomScenarios);
router.post('/settings/scenarios', requireAdmin, saveCustomScenarios);

// --- Rutas de Certificados Verificables ---
router.get('/certificates/verify/:code', verifyCertificate);

// --- Rutas de Leaderboard y Métricas ---
router.get('/stats/leaderboard', getLeaderboard);
router.get('/stats/summary', requireAdmin, getGeneralStats);
router.get('/stats/users', requireAdmin, getUsersAudit);

module.exports = router;
