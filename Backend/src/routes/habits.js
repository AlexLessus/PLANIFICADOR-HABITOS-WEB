/**
 * @fileoverview Módulo de rutas para la gestión de Hábitos.
 * @module routes/habits
 */

const express = require('express');
const router = express.Router();
const pool = require('../database/db'); // Importa tu conexión a la BD
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
 * Consulta con variables de sesión para calcular la racha actual.
 * Funciona de forma más fiable en versiones antiguas de MariaDB/MySQL.
 */
const STREAK_QUERY_VARS = `
    SELECT 
        current_streak 
    FROM (
        SELECT 
            @racha := CASE
                -- DATEDIFF(@prev_date, completion_date) = 1 verifica que la diferencia sea exactamente 1 día (consecutivo)
                WHEN @prev_date IS NULL OR DATEDIFF(@prev_date, completion_date) = 1
                THEN @racha + 1
                ELSE 1
            END AS current_streak,
            @prev_date := completion_date AS last_date_checked
        FROM 
            habit_completions
        WHERE 
            habit_id = ?
        ORDER BY 
            completion_date DESC
    ) AS T1
    ORDER BY current_streak DESC
    LIMIT 1;
`;

/**
 * Función auxiliar para calcular la racha y la última fecha de finalización 
 * para un hábito dado, usando una única conexión para las variables de sesión.
 * @param {number} habitId - El ID del hábito.
 * @param {object} connection - Una conexión activa de MySQL.
 * @returns {Promise<{lastCompleted: string|null, currentStreak: number}>}
 */
const getStreakData = async (habitId, connection) => {
    // 1. Obtener última fecha (No necesita variables)
    const [lastCompletedResult] = await connection.query(
        'SELECT MAX(completion_date) AS lastCompleted FROM habit_completions WHERE habit_id = ?', 
        [habitId]
    );
    const lastCompleted = lastCompletedResult[0].lastCompleted;

    // 2. Inicializar variables de sesión para el cálculo de racha
    await connection.query('SET @racha = 0');
    await connection.query('SET @prev_date = NULL');

    // 3. Obtener racha actual
    const [streakResult] = await connection.query(STREAK_QUERY_VARS, [habitId]);
    const currentStreak = streakResult[0]?.current_streak || 0;

    return { lastCompleted, currentStreak };
};


// 1. GET /api/habits - Obtener todos los hábitos del usuario con racha y última finalización
router.get('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    let connection;

    try {
        // Necesitamos una conexión para asegurar la persistencia de las variables de sesión
        connection = await pool.getConnection();

        // Obtener la lista base de hábitos
        const [habits] = await connection.query(
            'SELECT id, title, time, location FROM habits WHERE user_id = ?',
            [userId]
        );

        const habitsWithData = [];
        for (const habit of habits) {
            const { lastCompleted, currentStreak } = await getStreakData(habit.id, connection);

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
    } finally {
        if (connection) connection.release();
    }
});


// 2. POST /api/habits - Crear un nuevo hábito (Sin Cambios en la lógica)
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

// 3. PUT /api/habits/:id - Actualizar un hábito (Sin Cambios)
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

// 4. DELETE /api/habits/:id - Eliminar un hábito (Sin Cambios)
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

// 5. POST /api/habits/:id/checkin - Registrar una finalización de hábito y calcular racha
router.post('/:id/checkin', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { id: habitId } = req.params;
    let connection;

    try {
        // Obtenemos una conexión para asegurar la secuencia de sentencias
        connection = await pool.getConnection();

        // 1. Verificar si el hábito pertenece al usuario (y obtener datos básicos)
        const [habit] = await connection.query('SELECT id, title, time, location FROM habits WHERE id = ? AND user_id = ?', [habitId, userId]);
        if (habit.length === 0) {
            connection.release();
            return res.status(404).send('Hábito no encontrado o no autorizado');
        }

        // 2. Registrar la finalización (INSERT IGNORE previene duplicados)
        await connection.query('INSERT IGNORE INTO habit_completions (habit_id, completion_date) VALUES (?, CURDATE())', [habitId]);
        
        // 3. CÁLCULO DE LA RACHA ACTUAL Y OBTENCIÓN DE LA ÚLTIMA FECHA (usando la misma conexión)
        const { lastCompleted, currentStreak } = await getStreakData(habitId, connection);

        // 4. Devolver el objeto de hábito completo con los datos actualizados para el frontend
        res.status(200).json({ 
            ...habit[0], // Datos originales del hábito
            lastCompleted: lastCompleted, // Fecha de hoy (o la fecha más reciente si es un checkin tardío)
            streak: currentStreak 
        });

    } catch (err) {
        console.error("Error al registrar el hábito o calcular la racha:", err);
        res.status(500).send('Error al registrar el hábito');
    } finally {
        if (connection) connection.release(); // ¡Liberar la conexión es crucial!
    }
});


module.exports = router;