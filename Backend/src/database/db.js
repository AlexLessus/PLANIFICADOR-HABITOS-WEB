// Planificador/backend/src/database/db.js
require('dotenv').config(); // Carga las variables de entorno

const mysql = require('mysql2/promise'); // Importa el driver mysql2 con soporte para promesas

// Crea un pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Espera si no hay conexiones disponibles
    connectionLimit: 10,     // Número máximo de conexiones en el pool
    queueLimit: 0            // Sin límite de cola para las conexiones
});

module.exports = pool; // Exporta el pool de conexiones para usarlo en otras partes de la app