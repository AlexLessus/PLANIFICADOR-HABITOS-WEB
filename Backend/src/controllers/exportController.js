// Backend/src/controllers/exportController.js

const db = require('../database/db'); 
const ExcelJS = require('exceljs');
const pdf = require('html-pdf');
// const util = require('util'); // No es necesario si se usa la función de promesa a continuación

// Promisifica pdf.create().toStream para usar async/await
const pdfCreateStream = (html, options) => {
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toStream((err, stream) => {
            if (err) return reject(err);
            resolve(stream);
        });
    });
};

// --- FUNCIÓN BASE PARA CONSULTAR DATOS (CORREGIDA) ---
const fetchDataToExport = async (dataType, userId) => {
    let query = '';
    let params = [];

    // ✅ CORRECCIÓN CLAVE: FILTRADO POR user_id
    if (dataType === 'tareas' || dataType === 'ambos') {
        query = `
            SELECT title AS Título, priority AS Prioridad, status AS Estado, DATE_FORMAT(due_date, '%Y-%m-%d') AS 'Fecha Límite' 
            FROM tasks 
            WHERE user_id = ?  
            LIMIT 50
        `;
        params = [userId]; // <-- ¡PARÁMETRO AÑADIDO!

    } else if (dataType === 'habitos') {
        query = `
            SELECT name AS Hábito, current_streak AS 'Racha Actual', longest_streak AS 'Racha Más Larga' 
            FROM habits 
            WHERE user_id = ?  
            LIMIT 50
        `;
        params = [userId]; // <-- ¡PARÁMETRO AÑADIDO!
    } else {
        return [];
    }

    try {
        const [rows] = await db.query(query, params); 
        console.log(`[EXPORT DEBUG] Datos obtenidos para ${dataType}: ${rows.length} filas.`);
        return rows;
    } catch (error) {
        console.error('CRITICAL DB ERROR DURING EXPORT:', error); 
        throw new Error('Falló la consulta a la base de datos.');
    }
};


// --- EXPORTAR A EXCEL (XLSX) (CORREGIDO) ---
exports.exportToExcel = async (req, res) => {
    const { dataType } = req.params;
    // ⚠️ Importante: El middleware de autenticación (authMiddleware) debe ejecutarse antes
    const userId = req.user.id; // Ya no hay necesidad de un fallback a 1

    try {
        // Nota: Se elimina el paso de 'start' y 'end' de fetchDataToExport por simplicidad,
        // ya que no se estaban usando en la consulta SQL.
        const data = await fetchDataToExport(dataType, userId); 

        if (data.length === 0) {
            return res.status(404).send('No se encontraron datos para exportar en Excel para este usuario.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Reporte_${dataType}`);

        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key, width: 25 }));
        worksheet.addRows(data);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error durante la exportación a Excel:', error);
        res.status(500).send('Error interno del servidor al generar el Excel.');
    }
};

// --- EXPORTAR A PDF (CORREGIDO) ---
exports.exportToPDF = async (req, res) => {
    const { dataType } = req.params;
    const userId = req.user.id; // Ya no hay necesidad de un fallback a 1

    try {
        const data = await fetchDataToExport(dataType, userId);
        
        if (data.length === 0) {
            return res.status(404).send('No se encontraron datos para exportar en PDF para este usuario.');
        }

        // ... (el código de generación HTML y PDF es correcto)
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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.pdf`);
        
        pdfStream.pipe(res); 

    } catch (error) {
        console.error('Error durante la exportación a PDF:', error);
        res.status(500).send('Error interno del servidor al generar el PDF. (Verifique wkhtmltopdf y la variable PATH).');
    }
};