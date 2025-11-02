
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

require('dotenv').config(); // Carga las variables de entorno al inicio
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importaciones de DB, Rutas y Middleware
const db = require('./database/db'); 
const authRoutes = require('./routes/authRoutes'); 
const habitsRoutes = require('./routes/habits'); 
const tasksRouter = require('./routes/tasks');
const exportRoutes = require('./routes/exportRoutes'); // Archivo de rutas de exportación
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000; 

// Configuración de seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Material-UI necesita inline styles
      scriptSrc: [
        "'self'",
        "https://accounts.google.com", // Google OAuth
        "https://apis.google.com", // Google APIs
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://accounts.google.com", // Google OAuth
        "https://oauth2.googleapis.com", // Google OAuth token exchange
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com", // Google OAuth iframe
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Puede causar problemas con algunas librerías
}));

// Configuración de CORS mejorada
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      // Agregar otros orígenes según sea necesario
    ];

    // Permitir requests sin origen (Postman, mobile apps, etc.) solo en desarrollo
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware Global
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global (se aplica a todas las rutas)
app.use('/api', apiLimiter);

// --------------------------------------------------------------------------
// Rutas de la API
// --------------------------------------------------------------------------

// Ruta de Prueba de Conexión a la Base de Datos
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('[API DB Test] Resultado de la prueba de DB:', rows[0].solution);
        res.status(200).json({
            message: 'Conexión a la base de datos exitosa',
            solution: rows[0].solution
        });
    } catch (err) {
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
// Los middlewares de autenticación se aplican DENTRO de cada archivo de ruta (ej. tasks, habits, export)
app.use('/api/auth', authRoutes); 
app.use('/api/habits', habitsRoutes); 
app.use('/api/tasks', tasksRouter); 

// MONTAJE CORRECTO DE LA RUTA DE EXPORTACIÓN
// Se monta el archivo de rutas exportRoutes, que internamente usa el authMiddleware.
app.use('/api/export', exportRoutes); 

// --------------------------------------------------------------------------
// MANEJO GLOBAL DE ERRORES
// Este debe ser el último middleware, después de todas las rutas
app.use(errorHandler.handleError);
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
            console.error('No se pudo establecer conexión inicial con la base de datos:', err.message);
        });
});

