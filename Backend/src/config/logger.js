/**
 * @fileoverview Configuración de Logger con Winston
 * Sistema de logging profesional para desarrollo y producción
 * @module config/logger
 */

const winston = require('winston');
const path = require('path');

// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Agregar colores a Winston
winston.addColors(colors);

// Determinar el nivel de log según el entorno
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Formato para logs en consola (desarrollo)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Formato para logs en archivos (producción)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Definir transports (destinos de logs)
const transports = [
    // Consola - siempre activa
    new winston.transports.Console({
        format: consoleFormat,
    }),
    
    // Archivo de errores - solo errores
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    
    // Archivo combinado - todos los logs
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

// Crear el logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
    // No salir en errores no manejados
    exitOnError: false,
});

// Función helper para logging de requests HTTP
logger.logRequest = (req, res, responseTime) => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms - ${req.ip}`;
    
    if (res.statusCode >= 500) {
        logger.error(message);
    } else if (res.statusCode >= 400) {
        logger.warn(message);
    } else {
        logger.http(message);
    }
};

// Función helper para logging de errores con contexto
logger.logError = (error, context = {}) => {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        ...context,
    };
    
    logger.error(JSON.stringify(errorInfo));
};

// Stream para Morgan (middleware HTTP)
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

module.exports = logger;
