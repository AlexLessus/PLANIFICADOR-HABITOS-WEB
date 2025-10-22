/**
 * @fileoverview Módulo Principal de la aplicación Planificador API.
 * Este archivo inicializa el servidor Express, configura los middlewares, 
 * establece la conexión a la base de datos (DB) y define las rutas principales 
 * para la autenticación y la gestión de hábitos.
 * * Responsabilidades Clave:
 * 1. Cargar variables de entorno (.env).
 * 2. Configurar CORS y manejo de JSON.
 * 3. Montar las rutas de la API (/api/auth, /api/habits, /api/export).
 * 4. Iniciar la escucha del servidor en el puerto configurado.
 * * @author Gustavo
 * @version 1.0.1 (Exportación añadida)
 * @module app
 */

// Planificador/backend/src/app.js
require('dotenv').config(); // Carga las variables de entorno al inicio
const express = require('express');
const cors = require('cors');

// 🚨 CORRECCIÓN DE RUTAS: Usamos './database/db' y 'express'
const db = require('./database/db'); 

// Importa todas las rutas y middleware
const authRoutes = require('./routes/authRoutes'); 
const habitsRoutes = require('./routes/habits'); 
const tasksRouter = require('./routes/tasks'); 
const authMiddleware = require('./middleware/authMiddleware'); // Asumiendo que está en src/middleware/
const exportController = require('./controllers/exportController'); // Asumiendo que está en src/controllers/

const app = express();
const PORT = process.env.PORT || 5000; 

// Nota: habitsRoutes es un objeto o función importada, no se imprime directamente
// console.log(habitsRoutes) 

// Middleware
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// Rutas de la API
// --------------------------------------------------------------------------

// Ruta de Prueba de Conexión a la Base de Datos
app.get('/api/test-db', async (req, res) => {
    try {
        // Ejecuta una consulta simple para validar la conexión
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('[API DB Test] Resultado de la prueba de DB:', rows[0].solution);
        res.status(200).json({
            message: 'Conexión a la base de datos exitosa',
            solution: rows[0].solution
        });
    } catch (err) {
        // 🔥 Muestra el error exacto de MySQL en la terminal
        console.error('[API DB Test] CRITICAL ERROR: Error al conectar/consultar la base de datos:', err.message);
        res.status(500).json({
            error: 'Error al conectar/consultar la base de datos. Verifique credenciales.',
            details: err.message
        });
    }
});

// Ruta raíz 
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bienvenido a la API del Planificador' });
});


// Montaje de rutas
app.use('/api/auth', authRoutes); 
app.use('/api/habits', habitsRoutes); 
app.use('/api/tasks', tasksRouter); 


// 🔥 RUTA DE EXPORTACIÓN FINAL PARA PDF/EXCEL
// Estructura de la URL: /api/export/:dataType/:format?start=...&end=...
app.get('/api/export/:dataType/:format', authMiddleware, (req, res) => {
    const { format } = req.params;
    
    if (format === 'excel') {
        return exportController.exportToExcel(req, res);
    } else if (format === 'pdf') {
        return exportController.exportToPDF(req, res);
    } else {
        return res.status(400).send('Formato de exportación no soportado.');
    }
});


// --------------------------------------------------------------------------
// 🔥 MANEJO GLOBAL DE ERRORES (IMPORTANTE PARA DEPURACIÓN SILENCIOSA)
// Captura cualquier error que no haya sido atrapado por un try/catch
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR HANDLER]', err.stack);
    // Si la respuesta ya ha sido enviada (cabeceras ya enviadas), no hagas nada
    if (res.headersSent) {
        return next(err);
    }
    // Para errores en el proceso de streaming de archivos (que fallan silenciosamente)
    res.status(500).send({
        error: "Internal Server Error during file generation.",
        message: err.message
    });
});
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// Iniciar el Servidor
// --------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    // Prueba de conexión inicial del pool para diagnóstico
    db.getConnection()
        .then(connection => {
            console.log('Pool de conexiones de la base de datos listo.');
            connection.release();
        })
        .catch(err => {
            // Este error ocurre si las credenciales son totalmente incorrectas
            console.error('No se pudo establecer conexión inicial con la base de datos:', err.message);
        });
});
