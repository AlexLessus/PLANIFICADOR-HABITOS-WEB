// Backend/src/routes/exportRoutes.js

const express = require('express');
const router = express.Router();
// ✅ 1. IMPORTA LAS FUNCIONES CORRECTAMENTE (DESESTRUCTURANDO)
const { exportToPDF, exportToExcel } = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

// --- RUTAS DE EXPORTACIÓN ---

// Endpoint para exportar a PDF
// ✅ 2. USA LA FUNCIÓN "exportToPDF" DIRECTAMENTE
router.get('/:dataType/pdf', authMiddleware, exportToPDF);

// Endpoint para exportar a Excel
// ✅ 3. USA LA FUNCIÓN "exportToExcel" DIRECTAMENTE
router.get('/:dataType/excel', authMiddleware, exportToExcel);

module.exports = router;