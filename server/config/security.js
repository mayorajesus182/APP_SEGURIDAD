/**
 * Configuración de Seguridad y Endurecimiento HTTP
 * Implementa Helmet, Rate Limiting y CORS restrictivo.
 */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// 1. Configuración de Cabeceras Seguras con Helmet
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"], // Permite onclick/onload inline
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://academiasi.suiche7b.com", "http://localhost:8085", "http://127.0.0.1:8085"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null, // Gestionado por Nginx en producción; permite pruebas locales HTTP sin bloqueo TLS
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
};

// 2. Limitador de Peticiones Global (Mitigación de DoS / Scraping)
const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10)) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta dirección IP. Por favor intenta de nuevo más tarde.',
  },
});

// 3. Limitador Estricto para Registro de Usuarios (Anti-Brute Force / Spam)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 registros por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Límite de registros alcanzado. Por favor espera antes de intentar nuevamente.',
  },
});

// 4. Configuración CORS (Soporta dominio corporativo e instancias locales de prueba)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedEnv = (process.env.CORS_ORIGIN || 'https://academiasi.suiche7b.com').toLowerCase();
    const normalizedOrigin = origin.toLowerCase();
    const isLocalhost = normalizedOrigin.startsWith('http://localhost:') || normalizedOrigin.startsWith('http://127.0.0.1:');

    if (allowedEnv === '*' || isLocalhost || allowedEnv.split(',').map(s => s.trim()).includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso bloqueado por política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

module.exports = {
  configureHelmet,
  globalLimiter,
  authLimiter,
  corsOptions: cors(corsOptions),
};
