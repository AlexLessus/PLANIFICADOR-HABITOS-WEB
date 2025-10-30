// Backend/src/controllers/exportController.js

const db = require('../database/db');
const ExcelJS = require('exceljs');
const pdf = require('html-pdf');
const fs = require('fs'); // Módulo para leer archivos del sistema
const path = require('path'); // Módulo para manejar rutas de archivos

// Promisifica pdf.create().toStream para usar async/await
const pdfCreateStream = (html, options) => {
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toStream((err, stream) => {
            if (err) return reject(err);
            resolve(stream);
        });
    });
};

// --- FUNCIÓN BASE PARA CONSULTAR DATOS (VERSIÓN FINAL) ---
const fetchDataToExport = async (dataType, userId) => {
    if (!userId) {
        console.error('[EXPORT ERROR] Se intentó exportar sin un ID de usuario.');
        return [];
    }

    // Consulta para calcular la racha actual de un hábito (copiada de habits.js)
    const STREAK_QUERY = `
        SELECT 
            current_streak 
        FROM (
            SELECT 
                @racha := CASE
                    WHEN (@prev_date IS NULL OR DATEDIFF(@prev_date, completion_date) = 1) 
                    THEN @racha + 1
                    ELSE 1
                END AS current_streak,
                @prev_date := completion_date AS last_date_checked
            FROM 
                habit_completions,
                (SELECT @racha := 0, @prev_date := NULL) AS vars
            WHERE 
                habit_id = ?
            ORDER BY 
                completion_date DESC
        ) AS T1
        ORDER BY current_streak DESC
        LIMIT 1;
    `;

    try {
        let tasks = [];
        let habits = [];

        // 1. Obtener Tareas si es necesario (Esta parte ya funciona bien)
        if (dataType === 'tareas' || dataType === 'ambos') {
            const tasksQuery = `
                SELECT title AS Título, priority AS Prioridad, status AS Estado, DATE_FORMAT(due_date, '%Y-%m-%d') AS 'Fecha Límite' 
                FROM tasks 
                WHERE user_id = ?`;
            const [taskRows] = await db.query(tasksQuery, [userId]);
            tasks = taskRows;
            console.log(`[EXPORT DEBUG] Encontradas ${tasks.length} tareas para el usuario ${userId}.`);
        }

        // 2. Obtener Hábitos con su racha calculada (LÓGICA CORREGIDA)
        if (dataType === 'habitos' || dataType === 'ambos') {
            // Primero, obtenemos los hábitos del usuario
            const [habitList] = await db.query(
                'SELECT id, title FROM habits WHERE user_id = ?', 
                [userId]
            );

            // Ahora, para cada hábito, calculamos su racha
            for (const habit of habitList) {
                const [streakResult] = await db.query(STREAK_QUERY, [habit.id]);
                const currentStreak = streakResult[0]?.current_streak || 0;

                // Nota: La columna 'longest_streak' no parece existir en tu base de datos.
                // La omitimos para evitar más errores.
                habits.push({
                    'Hábito': habit.title,
                    'Racha Actual': currentStreak,
                    'Racha Más Larga': 'N/A' // O un valor por defecto
                });
            }
            console.log(`[EXPORT DEBUG] Calculados los datos para ${habits.length} hábitos.`);
        }

        // 3. Devolver los datos combinados o individuales
        if (dataType === 'ambos') {
            const combinedData = [];
            if (tasks.length > 0) {
                combinedData.push({ 'Categoría': '--- TAREAS ---', 'Detalle': '', 'Estado/Racha': '', 'Fecha/Racha Máx.': '' });
                tasks.forEach(t => combinedData.push({
                    'Categoría': t.Título,
                    'Detalle': t.Prioridad,
                    'Estado/Racha': t.Estado,
                    'Fecha/Racha Máx.': t['Fecha Límite']
                }));
            }
            if (habits.length > 0) {
                combinedData.push({ 'Categoría': '--- HÁBITOS ---', 'Detalle': '', 'Estado/Racha': '', 'Fecha/Racha Máx.': '' });
                habits.forEach(h => combinedData.push({
                    'Categoría': h.Hábito,
                    'Detalle': '',
                    'Estado/Racha': h['Racha Actual'],
                    'Fecha/Racha Máx.': h['Racha Más Larga']
                }));
            }
            return combinedData;
        } else if (dataType === 'tareas') {
            return tasks;
        } else if (dataType === 'habitos') {
            return habits;
        }

        return [];

    } catch (error) {
        console.error('CRITICAL DB ERROR DURING EXPORT:', error);
        throw new Error('Falló la consulta a la base de datos durante la exportación.');
    }
};

// --- EXPORTAR A EXCEL (XLSX) (VERSIÓN FINAL) ---
exports.exportToExcel = async (req, res) => {
    const { dataType } = req.params;
    const userId = req.user.id;

    try {
        const data = await fetchDataToExport(dataType, userId);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Reporte de ${dataType}`);

        // Define las columnas de antemano
        let columns = [];
        if (dataType === 'tareas') {
            columns = [
                { header: 'Título', key: 'Título', width: 30 },
                { header: 'Prioridad', key: 'Prioridad', width: 15 },
                { header: 'Estado', key: 'Estado', width: 15 },
                { header: 'Fecha Límite', key: 'Fecha Límite', width: 20 },
            ];
        } else if (dataType === 'habitos') {
            columns = [
                { header: 'Hábito', key: 'Hábito', width: 30 },
                { header: 'Racha Actual', key: 'Racha Actual', width: 20 },
                { header: 'Racha Más Larga', key: 'Racha Más Larga', width: 20 },
            ];
        } else { // 'ambos'
            columns = [
                { header: 'Categoría', key: 'Categoría', width: 30 },
                { header: 'Detalle', key: 'Detalle', width: 20 },
                { header: 'Estado/Racha', key: 'Estado/Racha', width: 20 },
                { header: 'Fecha/Racha Máx.', key: 'Fecha/Racha Máx.', width: 20 },
            ];
        }
        worksheet.columns = columns;

        // ✅ INICIO DE LA MODIFICACIÓN
        // Estilo para los encabezados de sección (TAREAS, HÁBITOS)
        const separatorStyle = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3F51B5' } },
            font: { color: { argb: 'FFFFFFFF' }, bold: true },
            alignment: { horizontal: 'center' }
        };

        // Añade los datos fila por fila para aplicar estilos
        if (data.length > 0) {
            data.forEach(rowData => {
                // Limpia los '---' del título antes de añadirlo
                if (dataType === 'ambos' && (rowData['Categoría'] || '').includes('---')) {
                    rowData['Categoría'] = rowData['Categoría'].replace(/---/g, '');
                }

                const row = worksheet.addRow(rowData);

                // Si es una fila separadora, aplica el estilo
                if (dataType === 'ambos' && (rowData['Detalle'] === '' && rowData['Estado/Racha'] === '' )) {
                    worksheet.mergeCells(row.number, 1, row.number, columns.length);
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.style = separatorStyle;
                    });
                }
            });
        } else {
            worksheet.addRow({ [columns[0].key]: 'No se encontraron datos para exportar.' });
        }
        // ✅ FIN DE LA MODIFICACIÓN

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error durante la exportación a Excel:', error);
        res.status(500).send('Error interno del servidor al generar el Excel.');
    }
};

// --- EXPORTAR A PDF (VERSIÓN FINAL) ---
exports.exportToPDF = async (req, res) => {
    const { dataType } = req.params;
    const userId = req.user.id;

    try {
        const data = await fetchDataToExport(dataType, userId);

        // --- Añadir Logo ---
        const logoPath = path.join(__dirname, '../assets/logo.png');
        let logoSrc = '';
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            logoSrc = `data:image/png;base64,${logoBase64}`;
        }
        
        let headers = [];
        if (dataType === 'tareas') {
            headers = ['Título', 'Prioridad', 'Estado', 'Fecha Límite'];
        } else if (dataType === 'habitos') {
            headers = ['Hábito', 'Racha Actual', 'Racha Más Larga'];
        } else {
            headers = ['Categoría', 'Detalle', 'Estado/Racha', 'Fecha/Racha Máx.'];
        }

        // ✅ INICIO DE LA MODIFICACIÓN
        // --- Generar Contenido HTML con logo centrado ---
        let htmlContent = `
            <html><head><style>body{font-family:sans-serif;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;} th{background-color:#3f51b5; color:white;}</style></head><body>
            <div style="text-align: center; margin-bottom: 20px;">
                ${logoSrc ? `<img src="${logoSrc}" style="width: 300px; height: auto;" alt="Logo">` : '<h1>TigerTech.corp</h1>'}
            </div>
            <h1>Reporte de ${dataType.toUpperCase()}</h1>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
            <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>
                    ${data.length > 0 ?
                        data.map(row => {
                            const isSeparator = dataType === 'ambos' && (row['Categoría'] || '').includes('---');
                            if (isSeparator) {
                                return `<tr><td colspan="${headers.length}" style="background-color: #3f51b5; color: white; text-align: center; font-weight: bold;">${row['Categoría'].replace(/---/g, '').trim()}</td></tr>`;
                            } else {
                                return `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`;
                            }
                        }).join('') :
                        `<tr><td colspan="${headers.length}" style="text-align:center;">No se encontraron datos para exportar.</td></tr>`
                    }
                </tbody>
            </table>
            </body></html>
        `;
        // ✅ FIN DE LA MODIFICACIÓN

        const options = { format: 'A4', border: '1cm' };
        const pdfStream = await pdfCreateStream(htmlContent, options);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${dataType}_${new Date().toISOString().split('T')[0]}.pdf`);
        pdfStream.pipe(res);

    } catch (error) {
        console.error('Error durante la exportación a PDF:', error);
        res.status(500).send('Error interno del servidor al generar el PDF.');
    }
};