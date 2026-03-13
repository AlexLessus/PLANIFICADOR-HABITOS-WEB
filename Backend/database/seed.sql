-- ============================================================================
-- PLANIFICADOR DE TAREAS Y HÁBITOS - DATOS DE PRUEBA (SEED)
-- ============================================================================
-- Versión: 1.0.0
-- Descripción: Script para insertar datos de prueba en la base de datos
-- Autor: TIGERTECH SOFTWARE SOLUTIONS
-- ADVERTENCIA: Solo usar en entornos de desarrollo/testing
-- ============================================================================

USE planner_db;

-- ============================================================================
-- LIMPIAR DATOS EXISTENTES (SOLO PARA DESARROLLO)
-- ============================================================================
-- ADVERTENCIA: Esto eliminará todos los datos existentes
-- Comentar estas líneas si no deseas limpiar la base de datos

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE habit_completions;
TRUNCATE TABLE habits;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- INSERTAR USUARIOS DE PRUEBA
-- ============================================================================
-- Contraseña para todos los usuarios de prueba: "Password123"
-- Hash generado con bcrypt (10 rounds)

INSERT INTO users (first_name, last_name, email, password_hash) VALUES
('Juan', 'Pérez', 'juan.perez@example.com', '$2a$10$rZ5YhkKvXJKqvJGvXJKqvOXJKqvJGvXJKqvJGvXJKqvJGvXJKqvJG'),
('María', 'García', 'maria.garcia@example.com', '$2a$10$rZ5YhkKvXJKqvJGvXJKqvOXJKqvJGvXJKqvJGvXJKqvJGvXJKqvJG'),
('Carlos', 'López', 'carlos.lopez@example.com', '$2a$10$rZ5YhkKvXJKqvJGvXJKqvOXJKqvJGvXJKqvJGvXJKqvJGvXJKqvJG'),
('Ana', 'Martínez', 'ana.martinez@example.com', '$2a$10$rZ5YhkKvXJKqvJGvXJKqvOXJKqvJGvXJKqvJGvXJKqvJGvXJKqvJG'),
('Test', 'User', 'test@test.com', '$2a$10$rZ5YhkKvXJKqvJGvXJKqvOXJKqvJGvXJKqvJGvXJKqvJGvXJKqvJG');

-- ============================================================================
-- INSERTAR TAREAS DE PRUEBA
-- ============================================================================

-- Tareas para Juan Pérez (user_id = 1)
INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES
(1, 'Completar informe mensual', 'Preparar y enviar el informe de actividades del mes', 'Alta', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Pendiente'),
(1, 'Reunión con equipo', 'Reunión semanal de seguimiento de proyectos', 'Media', CURDATE(), 'En Progreso'),
(1, 'Revisar correos', 'Responder correos pendientes de la semana', 'Baja', CURDATE(), 'Completada'),
(1, 'Planificar sprint', 'Definir tareas para el próximo sprint', 'Alta', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pendiente');

-- Tarea recurrente para Juan Pérez
INSERT INTO tasks (user_id, title, description, priority, due_date, status, is_recurring, frequency, recurrence_end_date) VALUES
(1, 'Ejercicio matutino', 'Hacer 30 minutos de ejercicio', 'Media', CURDATE(), 'Completada', TRUE, 'Diaria', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

-- Tareas para María García (user_id = 2)
INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES
(2, 'Estudiar para examen', 'Repasar capítulos 5-8 del libro de texto', 'Alta', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'En Progreso'),
(2, 'Comprar materiales', 'Comprar materiales para el proyecto de arte', 'Media', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Pendiente'),
(2, 'Llamar al dentista', 'Agendar cita para revisión dental', 'Baja', CURDATE(), 'Pendiente');

-- Tareas para Carlos López (user_id = 3)
INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES
(3, 'Desarrollar nueva funcionalidad', 'Implementar sistema de notificaciones', 'Alta', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'En Progreso'),
(3, 'Code review', 'Revisar pull requests del equipo', 'Media', CURDATE(), 'Completada'),
(3, 'Actualizar documentación', 'Documentar nuevas APIs desarrolladas', 'Media', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Pendiente');

-- Tareas vencidas (para testing)
INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES
(1, 'Tarea vencida 1', 'Esta tarea está vencida', 'Alta', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Pendiente'),
(2, 'Tarea vencida 2', 'Esta tarea también está vencida', 'Media', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Pendiente');

-- ============================================================================
-- INSERTAR HÁBITOS DE PRUEBA
-- ============================================================================

-- Hábitos para Juan Pérez (user_id = 1)
INSERT INTO habits (user_id, title, time, location) VALUES
(1, 'Meditación matutina', '07:00:00', 'Casa - Sala de estar'),
(1, 'Leer 30 minutos', '21:00:00', 'Casa - Habitación'),
(1, 'Beber 2 litros de agua', '12:00:00', 'Oficina'),
(1, 'Ejercicio cardiovascular', '06:30:00', 'Gimnasio');

-- Hábitos para María García (user_id = 2)
INSERT INTO habits (user_id, title, time, location) VALUES
(2, 'Estudiar inglés', '19:00:00', 'Casa - Escritorio'),
(2, 'Practicar guitarra', '20:00:00', 'Casa - Sala de música'),
(2, 'Caminar 10,000 pasos', '18:00:00', 'Parque');

-- Hábitos para Carlos López (user_id = 3)
INSERT INTO habits (user_id, title, time, location) VALUES
(3, 'Programar proyecto personal', '22:00:00', 'Casa - Oficina'),
(3, 'Revisar noticias tech', '08:00:00', 'Oficina'),
(3, 'Hacer estiramientos', '15:00:00', 'Oficina');

-- ============================================================================
-- INSERTAR COMPLETADOS DE HÁBITOS (PARA TESTING DE RACHAS)
-- ============================================================================

-- Racha de 7 días para "Meditación matutina" de Juan (habit_id = 1)
INSERT INTO habit_completions (habit_id, completion_date) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, CURDATE());

-- Racha de 3 días para "Leer 30 minutos" de Juan (habit_id = 2)
INSERT INTO habit_completions (habit_id, completion_date) VALUES
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(2, CURDATE());

-- Completados esporádicos para "Beber 2 litros de agua" (habit_id = 3)
INSERT INTO habit_completions (habit_id, completion_date) VALUES
(3, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(3, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(3, CURDATE());

-- Racha de 5 días para "Estudiar inglés" de María (habit_id = 5)
INSERT INTO habit_completions (habit_id, completion_date) VALUES
(5, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(5, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(5, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(5, CURDATE());

-- Completados para "Programar proyecto personal" de Carlos (habit_id = 8)
INSERT INTO habit_completions (habit_id, completion_date) VALUES
(8, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(8, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(8, CURDATE());

-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================

SELECT '=== RESUMEN DE DATOS INSERTADOS ===' AS '';

SELECT 'Usuarios:' AS Tabla, COUNT(*) AS Total FROM users
UNION ALL
SELECT 'Tareas:', COUNT(*) FROM tasks
UNION ALL
SELECT 'Hábitos:', COUNT(*) FROM habits
UNION ALL
SELECT 'Completados de Hábitos:', COUNT(*) FROM habit_completions;

SELECT '' AS '';
SELECT '=== USUARIOS CREADOS ===' AS '';
SELECT id, first_name, last_name, email FROM users;

SELECT '' AS '';
SELECT '=== TAREAS POR USUARIO ===' AS '';
SELECT u.first_name, u.last_name, COUNT(t.id) AS total_tareas
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.first_name, u.last_name;

SELECT '' AS '';
SELECT '=== HÁBITOS POR USUARIO ===' AS '';
SELECT u.first_name, u.last_name, COUNT(h.id) AS total_habitos
FROM users u
LEFT JOIN habits h ON u.id = h.user_id
GROUP BY u.id, u.first_name, u.last_name;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Todos los usuarios de prueba tienen la contraseña: "Password123"
-- 2. Los hashes de contraseña son ejemplos, deberás generar hashes reales
--    usando bcrypt en tu aplicación
-- 3. Este script es solo para desarrollo/testing
-- 4. NO usar en producción con datos reales
-- ============================================================================
