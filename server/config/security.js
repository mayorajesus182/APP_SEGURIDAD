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
        scriptSrcAttr: ["'unsafe-inline'"], // Permite onclick/onload inline (Helmet pone 'none' por defecto)
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://academiasi.suiche7b.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
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

// 4. Configuración CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes del mismo origen o localhost/servidor web interno
    const allowed = process.env.CORS_ORIGIN || 'https://academiasi.suiche7b.com';
    if (allowed === '*' || !origin || allowed.split(',').includes(origin)) {
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
