/**
 * @fileoverview Módulo de rutas para la gestión de Tareas.
 * Este módulo define los endpoints de la API REST para las operaciones CRUD 
 * sobre las tareas de un usuario (/api/tasks).
 * @module routes/tasks
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db'); 
const authenticateToken = require('../middleware/authMiddleware');



// --- FUNCIÓN DE UTILIDAD PARA RECURRENCIA (RF-05) ---

/**
 * Calcula la fecha de la próxima ocurrencia de una tarea recurrente.
 * @param {Date} startDate La fecha de inicio (due_date) de la última tarea.
 * @param {string} frequency La frecuencia de recurrencia ('Diaria', 'Semanal', 'Mensual').
 * @returns {Date | null} La fecha de la siguiente ocurrencia.
 */
const getNextOccurrenceDate = (startDate, frequency) => {
    if (!startDate) return null;
    const nextDate = new Date(startDate);
    
    switch (frequency) {
        case 'Diaria':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'Semanal':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'Mensual':
            // Intentar mantener el día del mes, si no es posible, va al último día.
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        default:
            return null;
    }
    // Asegurar que no exceda la fecha de fin de la serie (aunque esto se comprueba en el generador)
    return nextDate;
};


// --- ENDPOINTS PARA TAREAS (TASKS) ---

// 1. GET /api/tasks - Obtener todos las tareas del usuario
router.get('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    try {
        const [rows] = await pool.query(
            // **MODIFICACIÓN: Incluir campos de recurrencia**
            'SELECT id, title, description, priority, due_date, status, created_at, is_recurring, frequency, recurrence_end_date, parent_id FROM tasks WHERE user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error del servidor al obtener tareas');
    }
});

// 2. POST /api/tasks - Crear una nueva tarea
router.post('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { 
        title, description, priority, due_date, status,
        is_recurring, frequency, recurrence_end_date // Nuevos campos RF-05
    } = req.body; 
    
    try {
        // 1. Insertar la tarea principal
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, title, description, priority, due_date, status, is_recurring, frequency, recurrence_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userId, title, description, priority, due_date, status || 'Pendiente', 
                is_recurring ? 1 : 0, frequency, recurrence_end_date
            ]
        );
        
        const newTaskId = result.insertId;
        
        // 2. Lógica de generación de instancias (RF-05)
        if (is_recurring) {
            let lastDate = new Date(due_date);
            const endDate = recurrence_end_date ? new Date(recurrence_end_date) : null;
            const MAX_INSTANCES = 5; // Generar solo las próximas 5 tareas inicialmente

            for (let i = 0; i < MAX_INSTANCES; i++) {
                const nextDate = getNextOccurrenceDate(lastDate, frequency);
                
                // Si ya no hay fecha de vencimiento o se alcanza la fecha de fin de recurrencia
                if (!nextDate || (endDate && nextDate > endDate)) {
                    break;
                }

                // Convertir a string para SQL (YYYY-MM-DD)
                const nextDateString = nextDate.toISOString().split('T')[0];
                
                // Insertar la nueva instancia de tarea
                await pool.query(
                    'INSERT INTO tasks (user_id, title, description, priority, due_date, status, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [userId, title, description, priority, nextDateString, 'Pendiente', newTaskId]
                );
                
                lastDate = nextDate; // Mover al siguiente punto de inicio
            }
        }

        // 3. Devolver la tarea principal creada
        const [newTask] = await pool.query(
            'SELECT id, title, description, priority, due_date, status, created_at, is_recurring, frequency, recurrence_end_date, parent_id FROM tasks WHERE id = ?',
            [newTaskId]
        );
        
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('Error al crear/generar la tarea recurrente:', err);
        res.status(500).send('Error al crear la tarea');
    }
});

// 3. PUT /api/tasks/:id - Actualizar una tarea (CRUD completo)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    
    const { 
        title, priority, description, due_date, status,
        is_recurring, frequency, recurrence_end_date // Nuevos campos RF-05
    } = req.body; 

    try {
        // La lógica de actualización es la misma, solo se añaden los nuevos campos
        const [updateResult] = await pool.query(
            // **MODIFICACIÓN: Incluir campos de recurrencia**
            'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, is_recurring = ?, frequency = ?, recurrence_end_date = ? WHERE id = ? AND user_id = ?',
            [
                title, description, priority, due_date, status, 
                is_recurring ? 1 : 0, frequency, recurrence_end_date, 
                id, userId
            ]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada');
        }
        
        // Devolver la tarea actualizada
        const [updatedTask] = await pool.query(
            'SELECT id, title, description, priority, due_date, status, created_at, is_recurring, frequency, recurrence_end_date, parent_id FROM tasks WHERE id = ?',
            [id]
        );
        
        res.json(updatedTask[0]);
    } catch (err) {
        console.error('Error al actualizar la tarea:', err);
        res.status(500).send('Error al actualizar la tarea');
    }
});

// 4. DELETE /api/tasks/:id - Eliminar una tarea
// routes/tasks.js

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    try {
        // 1. Obtener los datos antes de borrar (necesario para el mensaje)
        const [taskRow] = await pool.query(
            'SELECT is_recurring, parent_id FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (taskRow.length === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada para la eliminación');
        }
        const task = taskRow[0];

        // 2. Ejecutar la eliminación
        const [result] = await pool.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        // 3. Verificar el resultado de la eliminación
        if (result.affectedRows === 0) {
            // Este caso solo se daría si la tarea fue eliminada por otro proceso
            // entre el SELECT y el DELETE, o si hay un error silencioso de BD.
            return res.status(404).send('La tarea no se pudo eliminar. Inténtelo de nuevo.');
        }

        let message = task.is_recurring 
                      ? 'Serie de tareas recurrente y todas sus instancias eliminadas exitosamente.'
                      : task.parent_id
                        ? 'Instancia de tarea recurrente eliminada exitosamente.'
                        : 'Tarea eliminada exitosamente.';

        res.status(200).json({ message, deletedId: id });

    } catch (err) {
        // Aquí capturamos el error de BD, que puede ser la violación de clave externa
        console.error('Error al eliminar la tarea (BD o REST):', err);
        // Devolvemos el error específico para ayudar a depurar si es una restricción
        res.status(500).send(`Error al eliminar la tarea: ${err.message}`); 
    }
});

// 5. PUT /api/tasks/:id/status - Ruta especial para cambiar el estado (check-off)
router.put('/:id/status', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { status } = req.body; // El frontend enviará el nuevo estado (ej: 'Completada')

    try {
        // --- 1. Obtener la tarea antes de actualizar el estado ---
        const [taskRow] = await pool.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (taskRow.length === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada');
        }
        const task = taskRow[0];
        
        // --- 2. Actualizar el estado de la tarea actual ---
        const [updateResult] = await pool.query(
            'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
            [status, id, userId]
        );

        if (updateResult.affectedRows === 0) {
            // Esto no debería pasar si taskRow.length > 0, pero es un buen control
            return res.status(404).send('Error al actualizar el estado de la tarea');
        }

        let updatedTask = task;
        
        // --- 3. Lógica de generación de la siguiente instancia (RF-07) ---
        // Generar la siguiente instancia solo si la tarea se está marcando como Completada
        if (status === 'Completada') {
            
            // La tarea principal es el task.id si es la recurrente, o task.parent_id si es una instancia
            const parentId = task.parent_id || (task.is_recurring ? task.id : null);
            
            if (parentId) {
                // Obtener los datos del patrón recurrente (si es una instancia, necesitamos el patrón del padre)
                const [parentRow] = await pool.query(
                    'SELECT id, title, description, priority, is_recurring, frequency, recurrence_end_date FROM tasks WHERE id = ?',
                    [parentId]
                );
                
                const parentTask = parentRow[0];

                if (parentTask && parentTask.frequency) {
                    
                    // a. Calcular la fecha de la siguiente ocurrencia
                    // Usamos la due_date de la tarea que se acaba de completar como punto de partida
                    const lastDueDate = new Date(task.due_date);
                    const nextDueDate = getNextOccurrenceDate(lastDueDate, parentTask.frequency);
                    
                    const endDate = parentTask.recurrence_end_date ? new Date(parentTask.recurrence_end_date) : null;
                    
                    // b. Verificar si la próxima fecha es válida y no excede el final
                    if (nextDueDate && (!endDate || nextDueDate <= endDate)) {
                        
                        const nextDateString = nextDueDate.toISOString().split('T')[0];
                        
                        // c. Insertar la nueva instancia (RF-07 completado)
                        const [insertResult] = await pool.query(
                            'INSERT INTO tasks (user_id, title, description, priority, due_date, status, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [
                                userId, 
                                parentTask.title, 
                                parentTask.description, 
                                parentTask.priority, 
                                nextDateString, 
                                'Pendiente', 
                                parentTask.id
                            ]
                        );
                        console.log(`Nueva instancia de tarea recurrente generada: ID ${insertResult.insertId}`);
                    }
                }
            }
        }

        // 4. Devolver la tarea actualizada (para que el frontend actualice la lista)
        const [updatedTaskRow] = await pool.query(
            // Asegurarse de seleccionar todos los campos para compatibilidad con el frontend
            'SELECT id, title, description, priority, due_date, status, created_at, is_recurring, frequency, recurrence_end_date, parent_id FROM tasks WHERE id = ?',
            [id]
        );

        // Si la tarea era una instancia, también necesitamos devolver el padre actualizado 
        // o recargar toda la lista en el frontend para ver la nueva instancia. 
        // Por ahora, solo devolvemos la instancia completada.

        res.json(updatedTaskRow[0]);
    } catch (err) {
        console.error('Error al actualizar el estado y generar recurrencia:', err);
        res.status(500).send('Error al actualizar el estado de la tarea');
    }
});


module.exports = router;