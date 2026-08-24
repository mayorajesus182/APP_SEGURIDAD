/**
 * Manejador Centralizado de Errores
 * Oculta trazas internas en producción para prevenir fuga de información (Information Disclosure).
 */

const errorHandler = (err, req, res, next) => {
  console.error(`❌ [Error Handler] ${err.message}`, {
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Ocurrió un error interno en el servidor seguro. Por favor intente más tarde.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
