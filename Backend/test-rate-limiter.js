/**
 * Script de prueba para verificar el funcionamiento del rate limiter
 * Ejecutar con: node test-rate-limiter.js
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

// Crear una app de prueba
const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Configurar un rate limiter de prueba
const testLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 requests por minuto
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Límite de prueba excedido (5 requests por minuto)',
    });
  },
});

// Ruta de prueba con rate limiter
app.get('/test', testLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'Rate limiter funcionando correctamente',
    ip: req.ip,
    requestCount: res.getHeader('RateLimit-Remaining'),
  });
});

// Iniciar servidor de prueba
const PORT = 5555;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor de prueba iniciado en http://localhost:${PORT}`);
  console.log(`📊 Prueba el rate limiter visitando: http://localhost:${PORT}/test`);
  console.log(`⚠️  Límite: 5 requests por minuto`);
  console.log(`\n💡 Presiona Ctrl+C para detener el servidor\n`);
});
