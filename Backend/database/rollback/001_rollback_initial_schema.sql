-- ============================================================================
-- ROLLBACK 001: Revertir Schema Inicial
-- ============================================================================
-- Fecha: 2024-11-06
-- Descripción: Elimina todas las tablas creadas en la migración 001
-- ADVERTENCIA: Esto eliminará TODOS los datos
-- ============================================================================

USE planner_db;

-- Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas en orden inverso de dependencias
DROP TABLE IF EXISTS habit_completions;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Eliminar vistas si existen
DROP VIEW IF EXISTS v_user_task_stats;
DROP VIEW IF EXISTS v_user_habit_stats;

-- Habilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Opcional: Eliminar la base de datos completa
-- DROP DATABASE IF EXISTS planner_db;
