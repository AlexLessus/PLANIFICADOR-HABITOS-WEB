// Backend/src/controllers/exportController.js

// 🚨 REVISE ESTAS IMPORTACIONES: 
// Asegúrese de que su conexión a MySQL y middleware estén bien importados
const db = require('../database/db'); 
const ExcelJS = require('exceljs');
const pdf = require('html-pdf');
const util = require('util');

// Promisificamos pdf.create().toStream para usar async/await
const pdfCreateStream = (html, options) => {
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toStream((err, stream) => {
            if (err) return reject(err);
            resolve(stream);
        });
    });
};

// --- FUNCIÓN BASE PARA CONSULTAR DATOS ---
const fetchDataToExport = async (dataType, userId, startDate, endDate) => {
    let query = '';
    let params = [];

    // 🔥 MODIFICACIÓN CLAVE: ELIMINAMOS el filtro WHERE user_id
    if (dataType === 'tareas' || dataType === 'ambos') {
        // DEPUREMOS: Consulta todas las tareas, ignorando el usuario por ahora
        query = `
            SELECT title AS Título, priority AS Prioridad, status AS Estado, DATE_FORMAT(due_date, '%Y-%m-%d') AS 'Fecha Límite' 
            FROM tasks 
            LIMIT 50
        `;
        params = []; // Ya no necesitamos userId ni fechas
    } else if (dataType === 'habitos') {
        query = `
            SELECT name AS Hábito, current_streak AS 'Racha Actual', longest_streak AS 'Racha Más Larga' 
            FROM habits 
            LIMIT 50
        `;
        params = []; 
    } else {
        return [];
    }

    try {
        const [rows] = await db.query(query, params); 
        // VITAL: Muestra los datos que se obtuvieron ANTES de intentar exportar.
        console.log(`[EXPORT DEBUG] Datos obtenidos para ${dataType}: ${rows.length} filas.`);
        return rows;
    } catch (error) {
        console.error('CRITICAL DB ERROR DURING EXPORT:', error); 
        throw new Error('Falló la consulta a la base de datos.');
    }
};


// --- EXPORTAR A EXCEL (XLSX) ---
exports.exportToExcel = async (req, res) => {
    const { dataType } = req.params;
    const { start, end } = req.query; 
    // ⚠️ Reemplace 1 con la variable de usuario real después de autenticación
    const userId = req.user ? req.user.id : 1; 

    try {
        const data = await fetchDataToExport(dataType, userId, start, end);

        if (data.length === 0) {
            return res.status(404).send('No se encontraron datos para exportar en Excel.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Reporte_${dataType}`);

        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key, width: 25 }));
        worksheet.addRows(data);

        // 🔥 CABECERAS CRÍTICAS PARA LA DESCARGA
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end(); // Finaliza la respuesta y fuerza la descarga
    } catch (error) {
        console.error('Error durante la exportación a Excel:', error);
        res.status(500).send('Error interno del servidor al generar el Excel.');
    }
};

// --- EXPORTAR A PDF ---
exports.exportToPDF = async (req, res) => {
    const { dataType } = req.params;
    const { start, end } = req.query;
    const userId = req.user ? req.user.id : 1;

    try {
        const data = await fetchDataToExport(dataType, userId, start, end);
        
        if (data.length === 0) {
            return res.status(404).send('No se encontraron datos para exportar en PDF.');
        }

        // Generación de contenido HTML para el PDF
        let htmlContent = `
            <html><head><style>body{font-family:sans-serif;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:10px; text-align:left;} th{background-color:#3f51b5; color:white;}</style></head><body>
            <h1>Reporte de ${dataType.toUpperCase()} - TIGERTECH</h1>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
            <table>
                <thead><tr>${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}</tr></thead>
                <tbody>
                    ${data.map(row => 
                        `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
                    ).join('')}
                </tbody>
            </table>
            </body></html>
        `;

        const options = { format: 'A4', border: '1cm' };
        
        const pdfStream = await pdfCreateStream(htmlContent, options);

        // 🔥 CABECERAS CRÍTICAS PARA LA DESCARGA
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.pdf`);
        
        pdfStream.pipe(res); 

    } catch (error) {
        console.error('Error durante la exportación a PDF:', error);
        res.status(500).send('Error interno del servidor al generar el PDF. (Verifique wkhtmltopdf y la variable PATH).');
    }
};