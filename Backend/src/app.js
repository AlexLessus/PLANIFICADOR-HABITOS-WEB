/**
 * @fileoverview Módulo Principal de la aplicación Planificador API.
 * Este archivo inicializa el servidor Express, configura los middlewares, 
 * establece la conexión a la base de datos (DB) y define las rutas principales 
 * para la autenticación y la gestión de hábitos.
 * * Responsabilidades Clave:
 * 1. Cargar variables de entorno (.env).
 * 2. Configurar CORS y manejo de JSON.
 * 3. Montar las rutas de la API (/api/auth, /api/habits).
 * 4. Iniciar la escucha del servidor en el puerto configurado.
 * * @author Gustavo
 * @version 1.0.0
 * @module app
 */

// Planificador/backend/src/app.js
require('dotenv').config(); // Carga las variables de entorno al inicio
const express = require('express');
const cors = require('cors');
const db = require('./database/db');       // Importa nuestro pool de conexiones a la DB
const authRoutes = require('./routes/authRoutes'); // <--- rutas
const habitsRoutes = require('./routes/habits'); // <--- habits routes
const tasksRouter = require('./routes/tasks'); // <--- tasks routes

const app = express();
const PORT = process.env.PORT || 5000;


console.log(habitsRoutes)


// Middleware
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// Rutas de la API
// --------------------------------------------------------------------------

// Ruta de Prueba de Conexión a la Base de Datos
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('Resultado de la prueba de DB:', rows[0].solution);
        res.status(200).json({
            message: 'Conexión a la base de datos exitosa',
            solution: rows[0].solution
        });
    } catch (err) {
        console.error('Error al conectar/consultar la base de datos:', err.message);
        res.status(500).json({
            error: 'Error al conectar/consultar la base de datos',
            details: err.message
        });
    }
});

// Ruta raíz (opcional, como habíamos hablado)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bienvenido a la API del Planificador' });
});


// Rutas de Autenticación
app.use('/api/auth', authRoutes); // <--- LÍNEA para usar las rutas de autenticación
app.use('/api/habits', habitsRoutes); // <--- LÍNEA para usar las rutas de hábitos
app.use('/api/tasks', tasksRouter); // <--- LÍNEA para usar las rutas de tareas
// --------------------------------------------------------------------------
// Iniciar el Servidor
// --------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    db.getConnection()
        .then(connection => {
            console.log('Pool de conexiones de la base de datos listo.');
            connection.release();
        })
        .catch(err => {
            console.error('No se pudo establecer conexión inicial con la base de datos:', err.message);
        });
});