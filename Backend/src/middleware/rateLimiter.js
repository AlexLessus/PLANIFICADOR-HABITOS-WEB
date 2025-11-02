/**
 * @fileoverview Middleware de Rate Limiting
 * Protege las rutas de ataques de fuerza bruta y abuso
 */

const rateLimit = require('express-rate-limit');

// Rate limiter general para todas las rutas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP por ventana de tiempo
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skip: (req) => {
    // En desarrollo, saltar rate limiting para localhost
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  },
});

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos por IP
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
  max: 3, // Solo 3 intentos por hora
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

