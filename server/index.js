/**
 * Servidor Principal - Academia CiberSegura Corporación Suiche 7B
 * SSL/TLS gestionado por Nginx (academiaSI.suiche7b.com)
 */
const express = require('express');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { configureHelmet, globalLimiter, corsOptions } = require('./config/security');
const apiRoutes = require('./routes/apiRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = parseInt(process.env.PORT || '8085', 10);

// 1. Cabeceras Seguras y Endurecimiento HTTP
app.use(configureHelmet());

// 2. Control de CORS
app.use(corsOptions);

// 3. Limitador Global contra DoS y Escaneos
app.use(globalLimiter);

// 4. Logging Seguro de Peticiones
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// 5. Parser de JSON con límite estricto de carga útil (Previene DoS por Payload Masivo)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 6. Rutas del Sistema y Salud
app.use('/', healthRoutes);

// 7. Rutas de la API REST v1
app.use('/api/v1', apiRoutes);

// 8. Servir Archivos Estáticos de la Aplicación Frontend
const publicPath = path.join(__dirname, '../public');
const fallbackStaticPath = path.join(__dirname, '../');

// Servir recursos estáticos (CSS, JS, imágenes)
app.use(express.static(publicPath));
app.use(express.static(fallbackStaticPath));

// 9. Redirección SPA para rutas no coincidentes
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.sendFile(path.join(fallbackStaticPath, 'index.html'));
    }
  });
});

// 10. Manejador Central de Errores
app.use(errorHandler);

// Iniciar servidor HTTP (Nginx gestiona SSL/TLS en producción)
const server = http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🔒 Academia CiberSegura Corporación Suiche 7B - Servidor Iniciado`);
  console.log(`🌐 Puerto interno: ${PORT} | Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 URL Producción: https://academiaSI.suiche7b.com`);
  console.log(`🛡️  Seguridad: Helmet, CSP, Rate-Limiter, CORS y Nginx activos`);
  console.log(`=======================================================`);
});

// Cierre Limpio (Graceful Shutdown)
const shutdown = () => {
  console.log('\n🛑 Cerrando servidor y conexiones de forma segura...');
  server.close(() => {
    console.log('✅ Servidor cerrado.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
