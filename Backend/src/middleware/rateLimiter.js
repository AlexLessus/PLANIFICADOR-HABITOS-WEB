/**
 * @fileoverview Middleware de Rate Limiting
 * Protege las rutas de ataques de fuerza bruta y abuso
 * Implementa rate limiting por usuario autenticado (userId) o por IP para rutas públicas
 */

const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

/**
 * Función para extraer la clave del rate limiter
 * - Para usuarios autenticados: usa el userId del token JWT
 * - Para usuarios no autenticados: usa la IP
 */
const getUserKeyForRateLimit = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return `user_${decoded.id}`; // Usa el userId como clave
    }
  } catch (error) {
    // Si el token es inválido o no existe, usar IP como fallback
  }
  return `ip_${req.ip}`; // Fallback a IP para rutas públicas
};

// Rate limiter general para todas las rutas (por usuario autenticado)
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10000, // límite de 10000 requests por usuario por ventana de tiempo(Cambiar despues de la presentacion a 1000)
  message: {
    success: false,
    error: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  keyGenerator: getUserKeyForRateLimit, // Usa userId o IP
  skip: (req) => {
    // En desarrollo, saltar rate limiting para localhost
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  },
});

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 para la presentacion, se debe cambiar despues 
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // En desarrollo, saltar rate limiting para localhost
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  },
});

// Rate limiter para reset de contraseña
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000, // 1000 para la presentacion, se debe cambiar despues 
  message: {
    success: false,
    error: 'Demasiados intentos de restablecimiento de contraseña. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
};

