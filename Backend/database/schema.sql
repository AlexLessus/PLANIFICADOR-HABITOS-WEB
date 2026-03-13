-- ============================================================================
-- PLANIFICADOR DE TAREAS Y HÁBITOS - SCHEMA DE BASE DE DATOS
-- ============================================================================
-- Versión: 1.0.0
-- Descripción: Script de creación de base de datos y tablas
-- Autor: TIGERTECH SOFTWARE SOLUTIONS
-- ============================================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS planner_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE planner_db;

-- ============================================================================
-- TABLA: users
-- Descripción: Almacena información de usuarios del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token_hash VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token_hash, reset_token_expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: tasks
-- Descripción: Almacena tareas de los usuarios (RF-04, RF-05)
-- Soporta tareas simples y recurrentes
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
    due_date DATE,
    status ENUM('Pendiente', 'En Progreso', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    
    -- Campos para tareas recurrentes (RF-05)
    is_recurring BOOLEAN DEFAULT FALSE,
    frequency ENUM('Diaria', 'Semanal', 'Mensual') DEFAULT NULL,
    recurrence_end_date DATE DEFAULT NULL,
    parent_id INT DEFAULT NULL COMMENT 'ID de la tarea padre si es una instancia recurrente',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Índices para optimización
    INDEX idx_user_id (user_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_due_date (user_id, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: habits
-- Descripción: Almacena hábitos de los usuarios (RF-06)
-- ============================================================================
CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    time TIME DEFAULT NULL COMMENT 'Hora sugerida para realizar el hábito',
    location VARCHAR(255) DEFAULT NULL COMMENT 'Ubicación sugerida para el hábito',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Índices para optimización
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: habit_completions
-- Descripción: Registra el cumplimiento diario de hábitos (RF-07)
-- Permite calcular rachas (streaks) de constancia
-- ============================================================================
CREATE TABLE IF NOT EXISTS habit_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    completion_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    
    -- Índices para optimización y prevención de duplicados
    UNIQUE KEY unique_habit_date (habit_id, completion_date),
    INDEX idx_habit_id (habit_id),
    INDEX idx_completion_date (completion_date),
    INDEX idx_habit_date (habit_id, completion_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista para obtener estadísticas de tareas por usuario
CREATE OR REPLACE VIEW v_user_task_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    COUNT(t.id) AS total_tasks,
    SUM(CASE WHEN t.status = 'Completada' THEN 1 ELSE 0 END) AS completed_tasks,
    SUM(CASE WHEN t.status = 'Pendiente' THEN 1 ELSE 0 END) AS pending_tasks,
    SUM(CASE WHEN t.status = 'En Progreso' THEN 1 ELSE 0 END) AS in_progress_tasks,
    SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'Completada' THEN 1 ELSE 0 END) AS overdue_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.email;

-- Vista para obtener estadísticas de hábitos por usuario
CREATE OR REPLACE VIEW v_user_habit_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    COUNT(DISTINCT h.id) AS total_habits,
    COUNT(hc.id) AS total_completions,
    COUNT(DISTINCT DATE(hc.completion_date)) AS days_with_completions
FROM users u
LEFT JOIN habits h ON u.id = h.user_id
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
GROUP BY u.id, u.email;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para limpiar tokens de reset expirados automáticamente
DELIMITER //
CREATE TRIGGER IF NOT EXISTS clean_expired_tokens_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.reset_token_expires IS NOT NULL AND NEW.reset_token_expires < NOW() THEN
        SET NEW.reset_token_hash = NULL;
        SET NEW.reset_token_expires = NULL;
    END IF;
END//
DELIMITER ;

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================
-- Este schema incluye:
-- ✓ Tabla de usuarios con soporte para reset de contraseña
-- ✓ Tabla de tareas con soporte para recurrencia (RF-05)
-- ✓ Tabla de hábitos (RF-06)
-- ✓ Tabla de completados de hábitos para tracking de rachas (RF-07)
-- ✓ Índices optimizados para consultas frecuentes
-- ✓ Claves foráneas con CASCADE para integridad referencial
-- ✓ Vistas para estadísticas rápidas
-- ✓ Triggers para limpieza automática
-- ============================================================================
