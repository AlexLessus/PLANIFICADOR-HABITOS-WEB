/**
 * @fileoverview Definición de las rutas de Autenticación.
 * Este módulo configura las rutas base '/register' y '/login' y las mapea a 
 * las funciones correspondientes del authController.
 * * Responsabilidades Clave:
 * 1. Definir los endpoints de la API para Autenticación.
 * 2. Conectar cada endpoint con la lógica del controlador (authController).
 * * @author Gustavo
 * @version 1.0.0
 * @module routes/authRoutes
 */

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

// Ruta para el inicio de sesión con Google
// POST /api/auth/google-login
router.post('/google-login', authController.googleLogin);

module.exports = router; // Exporta el router para que pueda ser utilizado por app.js