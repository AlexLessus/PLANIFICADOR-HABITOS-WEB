// Planificador/backend/src/models/userModel.js
const db = require('../database/db'); // Importa el pool de conexiones a la base de datos
const bcrypt = require('bcryptjs');   // Importa la librería para hashear contraseñas

const userModel = {
    /**
     * Busca un usuario por su dirección de correo electrónico.
     * @param {string} email - El correo electrónico del usuario.
     * @returns {Promise<Array>} Un array con los datos del usuario o vacío si no se encuentra.
     */
    findByEmail: async (email) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows;
        } catch (error) {
            console.error('Error al buscar usuario por email:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo usuario en la base de datos.
     * @param {string} first_name - Nombre del usuario.
     * @param {string} last_name - Apellido del usuario.
     * @param {string} email - Correo electrónico único del usuario.
     * @param {string} password - Contraseña en texto plano (se hasheará antes de guardar).
     * @returns {Promise<Object>} El resultado de la inserción en la base de datos.
     */
    create: async (first_name, last_name, email, password) => {
        try {
            // Genera un hash de la contraseña de forma asíncrona
            const salt = await bcrypt.genSalt(10); // Genera un "salt" para la seguridad del hash
            const password_hash = await bcrypt.hash(password, salt); // Hashea la contraseña

            // Inserta el nuevo usuario con la contraseña hasheada
            const [result] = await db.query(
                'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
                [first_name, last_name, email, password_hash]
            );
            return result;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },

    /**
     * Compara una contraseña en texto plano con un hash de contraseña.
     * @param {string} password - Contraseña en texto plano.
     * @param {string} password_hash - Contraseña hasheada almacenada en la base de datos.
     * @returns {Promise<boolean>} True si las contraseñas coinciden, false en caso contrario.
     */
    comparePassword: async (password, password_hash) => {
        try {
            return await bcrypt.compare(password, password_hash);
        } catch (error) {
            console.error('Error al comparar contraseñas:', error);
            throw error;
        }
    }
};

module.exports = userModel; // Exporta el modelo para que otros archivos puedan usarlo