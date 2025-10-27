/**
 * @fileoverview Módulo de rutas para la gestión de Hábitos.
 * @module routes/habits
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_SECRET usado en habits:", JWT_SECRET);

// Middleware para verificar la autenticación del usuario
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

/**
 * Consulta única y segura para calcular la racha, inicializando variables DENTRO 
 * de la sentencia SQL para evitar errores de conexión/pool (la Solución B).
 */
const STREAK_QUERY_VARS_SINGLE = `
    SELECT 
        current_streak 
    FROM (
        SELECT 
            @racha := CASE
                -- DATEDIFF(@prev_date, completion_date) = 1 verifica que la diferencia sea exactamente 1 día (consecutivo)
                WHEN (@prev_date IS NULL OR DATEDIFF(@prev_date, completion_date) = 1) 
                THEN @racha + 1
                ELSE 1
            END AS current_streak,
            @prev_date := completion_date AS last_date_checked
        FROM 
            habit_completions,
            -- Inicializa las variables @racha y @prev_date aquí
            (SELECT @racha := 0, @prev_date := NULL) AS vars
        WHERE 
            habit_id = ?
        ORDER BY 
            completion_date DESC
    ) AS T1
    ORDER BY current_streak DESC
    LIMIT 1;
`;

// NOTA: Se ha ELIMINADO la función getStreakData para evitar problemas de conexión.

// 1. GET /api/habits/completions - Obtener todas las fechas de completado de hábitos del usuario
// IMPORTANTE: Este endpoint debe estar ANTES de cualquier ruta con parámetros dinámicos (:id)
router.get('/completions', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    
    try {
        const [completions] = await pool.query(`
            SELECT 
                hc.habit_id,
                hc.completion_date,
                h.title,
                h.time,
                h.location
            FROM habit_completions hc
            JOIN habits h ON h.id = hc.habit_id
            WHERE h.user_id = ?
            ORDER BY hc.completion_date DESC
        `, [userId]);
        
        res.json(completions);
    } catch (err) {
        console.error("Error al obtener completados de hábitos:", err);
        res.status(500).send('Error al obtener completados');
    }
});

// 2. GET /api/habits - Obtener todos los hábitos del usuario con racha y última finalización
router.get('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    // Eliminado: let connection;

    try {
        // Eliminado: connection = await pool.getConnection();

        // Obtener la lista base de hábitos
        const [habits] = await pool.query( // Usamos pool.query
            'SELECT id, title, time, location FROM habits WHERE user_id = ?',
            [userId]
        );

        const habitsWithData = [];
        for (const habit of habits) {
            
            // 1. Obtener última fecha
            const [lastCompletedResult] = await pool.query(
                'SELECT MAX(completion_date) AS lastCompleted FROM habit_completions WHERE habit_id = ?', 
                [habit.id]
            );
            const lastCompleted = lastCompletedResult[0].lastCompleted;

            // 2. Obtener racha actual (usando la consulta simple de variables)
            const [streakResult] = await pool.query(STREAK_QUERY_VARS_SINGLE, [habit.id]);
            const currentStreak = streakResult[0]?.current_streak || 0;

            habitsWithData.push({
                ...habit,
                lastCompleted: lastCompleted,
                streak: currentStreak
            });
        }

        res.json(habitsWithData);
    } catch (err) {
        console.error("Error en GET /api/habits:", err);
        res.status(500).send('Error del servidor');
    } 
    // Eliminado: finally { if (connection) connection.release(); }
});


// 3. POST /api/habits - Crear un nuevo hábito (Sin Cambios en la lógica)
router.post('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { title, time, location } = req.body;
    
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
        
        // Devuelve el nuevo hábito con racha 0 y sin fecha de finalización
        res.status(201).json({ ...newHabit[0], lastCompleted: null, streak: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el hábito');
    }
});

// 4. PUT /api/habits/:id - Actualizar un hábito (Sin Cambios)
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

// 5. DELETE /api/habits/:id - Eliminar un hábito (Sin Cambios)
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

// 6. POST /api/habits/:id/checkin - Registrar una finalización de hábito y calcular racha
router.post('/:id/checkin', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id: habitId } = req.params;
    // Eliminado: let connection;

    try {
        // 1. Verificar si el hábito pertenece al usuario (y obtener datos básicos)
        const [habit] = await pool.query('SELECT id, title, time, location FROM habits WHERE id = ? AND user_id = ?', [habitId, userId]);
        if (habit.length === 0) {
            return res.status(404).send('Hábito no encontrado o no autorizado');
        }

        // 2. Registrar la finalización (INSERT IGNORE previene duplicados)
        await pool.query('INSERT IGNORE INTO habit_completions (habit_id, completion_date) VALUES (?, CURDATE())', [habitId]);
        
        // 3. CÁLCULO DE LA RACHA ACTUAL (Usando la consulta única)
        const [streakResult] = await pool.query(STREAK_QUERY_VARS_SINGLE, [habitId]); 
        const currentStreak = streakResult[0]?.current_streak || 0;

        // 4. Obtener la última fecha de nuevo (separado de la racha)
        const [lastCompletedResult] = await pool.query('SELECT MAX(completion_date) AS lastCompleted FROM habit_completions WHERE habit_id = ?', [habitId]);
        const lastCompleted = lastCompletedResult[0].lastCompleted;

        // 5. Devolver el objeto de hábito completo con los datos actualizados
        res.status(200).json({ 
            ...habit[0], 
            lastCompleted: lastCompleted, 
            streak: currentStreak 
        });

    } catch (err) {
        console.error("Error al registrar el hábito o calcular la racha:", err);
        res.status(500).send('Error al registrar el hábito');
    } 
    // Eliminado: finally { if (connection) connection.release(); }
});


module.exports = router;