// Planificador/backend/src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController'); // Importa el controlador de autenticación

const router = express.Router(); // Crea un nuevo router de Express

// Ruta para el registro de usuarios
// POST /api/auth/register
router.post('/register', authController.register);

// Ruta para el inicio de sesión de usuarios
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router; // Exporta el router para que pueda ser utilizado por app.js