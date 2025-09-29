/**
 * @fileoverview Módulo de rutas para la gestión de Hábitos.
 * Este módulo define los endpoints de la API REST para las operaciones CRUD 
 * sobre los hábitos de un usuario (/api/habits), incluyendo la creación, 
 * lectura, actualización, eliminación y el registro de finalización (check-in).
 * * Responsabilidades Clave:
 * - Aplicar el middleware de autenticación (authenticateToken) a todas las rutas.
 * - Interactuar con la base de datos (pool) para manipular la tabla 'habits' 
 * y 'habit_completions'.
 * * @author Gustavo
 * @version 1.0.0
 * @module routes/habits
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db'); // Importa tu conexión a la BD
const jwt = require('jsonwebtoken'); // Para verificar el token del usuario

const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_SECRET usado en habits:", JWT_SECRET);

// Middleware para verificar la autenticación del usuario
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Si no hay token, no autorizado
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token no válido
        req.user = user;
        next();
    });
};

// --- ENDPOINTS PARA HÁBITOS ---

// 1. GET /api/habits - Obtener todos los hábitos del usuario
router.get('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user; // Obtiene el ID del usuario del token
    try {
        const [rows] = await pool.query(
            'SELECT id, title, time, location FROM habits WHERE user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error del servidor');
    }
});

// 2. POST /api/habits - Crear un nuevo hábito
router.post('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { title, time, location } = req.body;
    
    // Aquí es donde la base de datos usa los valores DEFAULT
    try {
        const [result] = await pool.query(
            'INSERT INTO habits (user_id, title, time, location) VALUES (?, ?, ?, ?)',
            [userId, title, time, location]
        );
        
        const newHabitId = result.insertId;
        const [newHabit] = await pool.query(
            'SELECT id, title, time, location FROM habits WHERE id = ?',
            [newHabitId]
        );
        
        res.status(201).json(newHabit[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el hábito');
    }
});

// 3. PUT /api/habits/:id - Actualizar un hábito
router.put('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { title, time, location } = req.body;
    
    try {
        await pool.query(
            'UPDATE habits SET title = ?, time = ?, location = ? WHERE id = ? AND user_id = ?',
            [title, time, location, id, userId]
        );
        
        const [updatedHabit] = await pool.query(
            'SELECT id, title, time, location FROM habits WHERE id = ?',
            [id]
        );
        
        res.json(updatedHabit[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el hábito');
    }
});

// 4. DELETE /api/habits/:id - Eliminar un hábito
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    try {
        await pool.query(
            'DELETE FROM habits WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        res.status(200).send('Hábito eliminado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar el hábito');
    }
});

// 5. POST /api/habits/:id/checkin - Registrar una finalización de hábito
router.post('/:id/checkin', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    try {
        // 1. Verificar si el hábito pertenece al usuario
        const [habit] = await pool.query('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
        if (habit.length === 0) {
            return res.status(404).send('Hábito no encontrado o no autorizado');
        }

        // 2. Registrar la finalización del hábito
        await pool.query('INSERT INTO habit_completions (habit_id, completion_date) VALUES (?, CURDATE())', [id]);
        
        // 3. (Opcional) Calcular y devolver la racha
        const [streakResult] = await pool.query('SELECT COUNT(*) AS streak FROM habit_completions WHERE habit_id = ? AND DATEDIFF(CURDATE(), completion_date) < ? GROUP BY DATEDIFF(CURDATE(), completion_date)', [id, 7]);
        // Esta query es un ejemplo simple, la lógica real de racha es más compleja
        
        res.status(200).json({ message: 'Hábito registrado con éxito', streak: streakResult[0] ? streakResult[0].streak : 1 });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar el hábito');
    }
});


module.exports = router;