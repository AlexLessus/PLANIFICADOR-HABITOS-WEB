/**
 * @fileoverview Controlador para la gestión de Autenticación (Registro y Login).
 * Este módulo contiene la lógica de negocio para las rutas de autenticación, 
 * interactuando con el modelo de usuario para verificar credenciales y 
 * generar tokens de acceso JWT.
 * * Responsabilidades Clave:
 * 1. Validar datos de entrada para registro y login.
 * 2. Utilizar userModel para buscar y crear usuarios.
 * 3. Manejar el hashing y comparación de contraseñas.
 * 4. Generar y firmar tokens JWT para usuarios autenticados.
 * * @author Gustavo
 * @version 1.0.0
 * @module controllers/authController
 */


// Planificador/backend/src/controllers/authController.js
const userModel = require('../models/userModel'); // Importa el modelo de usuario
const jwt = require('jsonwebtoken');               // Importa jsonwebtoken
require('dotenv').config();                        // Asegura que las variables de entorno estén cargadas

const JWT_SECRET = process.env.JWT_SECRET; // Obtiene la clave secreta para JWT

console.log("JWT_SECRET usado en authController:", JWT_SECRET);


const authController = {
    /**
     * Maneja el registro de nuevos usuarios.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    register: async (req, res) => {
        const { first_name, last_name, email, password } = req.body;

        // Validación básica
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        try {
            // 1. Verificar si el usuario ya existe
            const existingUser = await userModel.findByEmail(email);
            if (existingUser.length > 0) {
                return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
            }

            // 2. Crear el nuevo usuario (el hash de la contraseña se hace en el modelo)
            const result = await userModel.create(first_name, last_name, email, password);

            // 3. Generar un token JWT para el nuevo usuario
            const token = jwt.sign({ id: result.insertId, email: email }, JWT_SECRET, { expiresIn: '1h' });

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: result.insertId,
                    first_name,
                    last_name,
                    email
                },
                token
            });

        } catch (error) {
            console.error('Error en el registro:', error);
            // Si el error es una violación de UNIQUE (por email, aunque ya lo chequeamos antes), podríamos ser más específicos.
            res.status(500).json({ message: 'Error interno del servidor durante el registro.', details: error.message });
        }
    },

    /**
     * Maneja el inicio de sesión de usuarios.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    login: async (req, res) => {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ message: 'El correo electrónico y la contraseña son obligatorios.' });
        }

        try {
            // 1. Buscar el usuario por email
            const userRows = await userModel.findByEmail(email);
            if (userRows.length === 0) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const user = userRows[0]; // El usuario encontrado

            // 2. Comparar la contraseña proporcionada con el hash almacenado
            const isMatch = await userModel.comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // 3. Generar un token JWT si las credenciales son correctas
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                },
                token
            });

        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.', details: error.message });
        }
    }
};

module.exports = authController; // Exporta el controlador