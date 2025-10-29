// Backend/Routes/exportRoutes.js

const express = require('express');
const router = express.Router();

// Importar el controlador que maneja la lógica de exportación (donde están las consultas filtradas)
const exportController = require('../controllers/exportController');

// Importar el middleware de autenticación CORREGIDO (que verifica el token JWT)
const authMiddleware = require('../middleware/authMiddleware'); 

/**
 * Rutas de Exportación (/api/export)
 * * Todas las rutas están protegidas por authMiddleware. Esto garantiza que:
 * 1. La solicitud tiene un token válido.
 * 2. req.user.id contiene la identificación real del usuario.
 */

// POST/GET /api/export/excel/:dataType
// :dataType puede ser 'tareas' o 'habitos'
router.get('/:dataType/excel', authMiddleware, exportController.exportToExcel);
router.get('/:dataType/pdf', authMiddleware, exportController.exportToPDF);

module.exports = router;