/**
 * @fileoverview Módulo de rutas para la gestión de Tareas.
 * Este módulo define los endpoints de la API REST para las operaciones CRUD 
 * sobre las tareas de un usuario (/api/tasks).
 * @module routes/tasks
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db'); 
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar la autenticación del usuario (Mismo que en habits)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); 
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
};

// --- ENDPOINTS PARA TAREAS (TASKS) ---

// 1. GET /api/tasks - Obtener todos las tareas del usuario
router.get('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    try {
        const [rows] = await pool.query(
            // **CORRECCIÓN: Usar la tabla 'tasks'**
            'SELECT id, title, description, priority, due_date, status, created_at FROM tasks WHERE user_id = ?',
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
    // **CORRECCIÓN: Obtener campos de tarea, el status usará el valor DEFAULT**
    const { title, description, priority, due_date } = req.body; 
    
    try {
        const [result] = await pool.query(
            // **CORRECCIÓN: Usar la tabla 'tasks' e insertar sus campos**
            'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, priority, due_date]
        );
        
        const newTaskId = result.insertId;
        const [newTask] = await pool.query(
            // **CORRECCIÓN: Usar la tabla 'tasks' y seleccionar sus campos**
            'SELECT id, title, description, priority, due_date, status, created_at FROM tasks WHERE id = ?',
            [newTaskId]
        );
        
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear la tarea');
    }
});

// 3. PUT /api/tasks/:id - Actualizar una tarea (CRUD completo)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    // **CORRECCIÓN: Obtener todos los campos actualizables de la tarea**
    const { title, priority, description, due_date, status } = req.body; 
    
    try {
        const [updateResult] = await pool.query(
            // **CORRECCIÓN: Usar la tabla 'tasks' y filtrar por user_id**
            'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, priority, due_date, status, id, userId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada');
        }
        
        // Devolver la tarea actualizada
        const [updatedTask] = await pool.query(
            'SELECT id, title, description, priority, due_date, status, created_at FROM tasks WHERE id = ?',
            [id]
        );
        
        res.json(updatedTask[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la tarea');
    }
});

// 4. DELETE /api/tasks/:id - Eliminar una tarea
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            // **CORRECCIÓN: Usar la tabla 'tasks' y filtrar por user_id**
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada');
        }

        res.status(200).send('Tarea eliminada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la tarea');
    }
});

// 5. PUT /api/tasks/:id/status - Ruta especial para cambiar el estado (check-off)
router.put('/:id/status', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { status } = req.body; // El frontend enviará el nuevo estado (ej: 'Completada')

    try {
        const [updateResult
            
        ] = await pool.query(
            'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
            [status, id, userId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).send('Tarea no encontrada o no autorizada');
        }
        
        const [updatedTask] = await pool.query(
            'SELECT id, title, description, priority, due_date, status, created_at FROM tasks WHERE id = ?',
            [id]
        );
        
        res.json(updatedTask[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el estado de la tarea');
    }
});


module.exports = router;