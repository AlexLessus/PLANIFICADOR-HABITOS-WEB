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
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Configuración de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET; // Obtiene la clave secreta para JWT

// Verificar que JWT_SECRET esté configurado (solo en desarrollo para diagnóstico)
if (!JWT_SECRET && process.env.NODE_ENV === 'development') {
    console.warn('[WARNING] JWT_SECRET no está configurado. La autenticación no funcionará correctamente.');
}


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
            // No exponer detalles del error en producción
            const errorMessage = process.env.NODE_ENV === 'development' 
                ? 'Error interno del servidor durante el registro.' 
                : 'Error interno del servidor durante el registro.';
            res.status(500).json({ 
                success: false,
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    },

    /**
     * Maneja el inicio de sesión de usuarios.
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'El correo electrónico y la contraseña son obligatorios.' });
        }

        try {
            const userRows = await userModel.findByEmail(email);
            if (userRows.length === 0) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const user = userRows[0];

            const isMatch = await userModel.comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

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
            // No exponer detalles del error en producción
            const errorMessage = process.env.NODE_ENV === 'development' 
                ? 'Error interno del servidor durante el inicio de sesión.' 
                : 'Error interno del servidor durante el inicio de sesión.';
            res.status(500).json({ 
                success: false,
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    },

    googleLogin: async (req, res) => {
        const { token } = req.body;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const { name, email, picture } = ticket.getPayload();

            let userRows = await userModel.findByEmail(email);
            let user;

            if (userRows.length > 0) {
                user = userRows[0];
            } else {
                const result = await userModel.create(name, '', email, 'google-provided');
                user = { id: result.insertId, email, first_name: name, last_name: '' };
            }

            const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Inicio de sesión con Google exitoso',
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                },
                token: jwtToken
            });

        } catch (error) {
            console.error('Error en el inicio de sesión con Google:', error);
            res.status(401).json({ message: 'Token de Google inválido.' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        try {
            const userRows = await userModel.findByEmail(email);
            if (userRows.length === 0) {
                return res.status(404).json({ message: 'No se encontró un usuario con ese correo electrónico.' });
            }
            const user = userRows[0];

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

            await userModel.savePasswordResetToken(user.id, resetTokenHash, resetTokenExpires);

            // El enlace debe apuntar a la ruta del frontend donde el usuario restablecerá su contraseña.
            // Lo he cambiado a 'localhost:3000', pero ajústalo a la URL de tu frontend si es diferente.
            const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
            const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../templates/passwordReset.hbs'), 'utf8');
            const template = handlebars.compile(emailTemplateSource);
            const htmlToSend = template({
                name: user.first_name,
                resetUrl: resetUrl
            });

            const msg = {
                to: user.email,
                from: 'equipotigretech@gmail.com', 
                subject: 'Restablecimiento de contraseña',
                html: htmlToSend,
            };

            await sgMail.send(msg);

            res.status(200).json({ message: 'Se ha enviado un correo de restablecimiento de contraseña.' });

        } catch (error) {
            console.error('Error en forgotPassword:', error);
            if (error.response) {
                console.error(error.response.body)
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        try {
            const userRows = await userModel.findUserByResetToken(resetTokenHash);
            if (userRows.length === 0) {
                return res.status(400).json({ message: 'El token de restablecimiento de contraseña es inválido o ha expirado.' });
            }
            const user = userRows[0];

            await userModel.updateUserPassword(user.id, password);

            res.status(200).json({ message: 'La contraseña ha sido actualizada exitosamente.' });
        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    },

    verifyResetToken: async (req, res) => {
        const { token } = req.params;
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        try {
            const userRows = await userModel.findUserByResetToken(resetTokenHash);
            if (userRows.length === 0) {
                return res.status(400).json({ message: 'El token de restablecimiento de contraseña es inválido o ha expirado.' });
            }

            res.status(200).json({ message: 'Token válido.' });
        } catch (error) {
            console.error('Error en verifyResetToken:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    },
};

module.exports = authController;