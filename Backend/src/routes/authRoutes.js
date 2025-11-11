/**
 * @fileoverview Definición de las rutas de Autenticación.
 * Este módulo configura las rutas base '/register' y '/login' y las mapea a 
 * las funciones correspondientes del authController.
 * * Responsabilidades Clave:
 * 1. Definir los endpoints de la API para Autenticación.
 * 2. Conectar cada endpoint con la lógica del controlador (authController).
 * * @author TigerTech
 * @version 2.0.0 (Seguridad mejorada)
 * @module routes/authRoutes
 */

// Planificador/backend/src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController'); // Importa el controlador de autenticación
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    handleValidationErrors,
} = require('../middleware/validators/authValidators');

const router = express.Router(); // Crea un nuevo router de Express

// Ruta para el registro de usuarios
// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, handleValidationErrors, authController.register);

// Ruta para el inicio de sesión de usuarios
// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

// Ruta para el inicio de sesión con Google
// POST /api/auth/google-login
// NOTA: Sin rate limiter temporalmente para debugging
router.post('/google-login', authController.googleLogin);

// Ruta para solicitar el restablecimiento de contraseña
// POST /api/auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, handleValidationErrors, authController.forgotPassword);

// Ruta para restablecer la contraseña
// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', passwordResetLimiter, validateResetPassword, handleValidationErrors, authController.resetPassword);

// Ruta para verificar el token de restablecimiento
// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', authController.verifyResetToken);

module.exports = router; // Exporta el router para que pueda ser utilizado por app.js