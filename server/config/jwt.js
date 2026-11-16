/**
 * Utilidad Criptográfica JWT (RFC 7519 HMAC-SHA256) sin dependencias externas
 * Garantiza sesiones autenticadas e inmutables para colaboradores y administradores.
 */
const crypto = require('crypto');

const getSecret = () => {
  return process.env.JWT_SECRET || process.env.ADMIN_TOKEN || 'Suiche7B_CyberShield_JWT_Secret_Key_2026!';
};

const base64UrlEncode = (str) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

const signToken = (payload, expiresInSeconds = 12 * 3600) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  // Compatibilidad con ADMIN_TOKEN estático configurado en variables de entorno
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
    return { id: 'admin', isAdmin: true, role: 'admin' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
};

// Middleware para rutas de Administrador
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado. Token requerido.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren privilegios de Administrador.' });
  }
  req.auth = decoded;
  next();
};

// Middleware para verificar identidad del colaborador o administrador
const verifyUserOrOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.auth = decoded;
    }
  }
  next();
};

module.exports = {
  signToken,
  verifyToken,
  requireAdmin,
  verifyUserOrOptional,
};
