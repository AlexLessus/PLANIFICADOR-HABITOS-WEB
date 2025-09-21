// Planificador/backend/src/app.js
require('dotenv').config(); // Carga las variables de entorno al inicio
const express = require('express');
const cors = require('cors');
const db = require('./database/db');       // Importa nuestro pool de conexiones a la DB
const authRoutes = require('./routes/authRoutes'); // <--- rutas

const app = express();
const PORT = process.env.PORT || 5000;

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