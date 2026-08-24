/**
 * Rutas de Health Check para Monitoreo y Docker
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const result = await query('SELECT 1 AS status');
    if (result.rows.length > 0) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
