/**
 * @fileoverview Utilidades de Logger
 * Funciones helper para logging en diferentes partes de la aplicación
 * @module utils/logger
 */

const logger = require('../config/logger');

/**
 * Log de inicio de aplicación
 */
const logAppStart = (port) => {
    logger.info('='.repeat(50));
    logger.info('🚀 PLANIFICADOR API - Servidor Iniciado');
    logger.info(`📡 Puerto: ${port}`);
    logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`⏰ Timestamp: ${new Date().toISOString()}`);
    logger.info('='.repeat(50));
};

/**
 * Log de conexión a base de datos
 */
const logDatabaseConnection = (status, details = '') => {
    if (status === 'success') {
        logger.info(`✅ Conexión a base de datos exitosa ${details}`);
    } else {
        logger.error(`❌ Error en conexión a base de datos: ${details}`);
    }
};

/**
 * Log de autenticación
 */
const logAuth = (action, email, success, details = '') => {
    const message = `Auth ${action} - ${email} - ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
        logger.info(message);
    } else {
        logger.warn(`${message} - ${details}`);
    }
};

/**
 * Log de operaciones CRUD
 */
const logCRUD = (operation, resource, userId, success, details = '') => {
    const message = `${operation.toUpperCase()} ${resource} - User: ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
        logger.info(message);
    } else {
        logger.error(`${message} - ${details}`);
    }
};

/**
 * Log de errores con contexto completo
 */
const logErrorWithContext = (error, context = {}) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context,
        timestamp: new Date().toISOString(),
    };
    
    logger.error('Error occurred:', errorData);
};

/**
 * Log de eventos de seguridad
 */
const logSecurityEvent = (event, severity, details) => {
    const message = `🔒 SECURITY: ${event} - ${details}`;
    
    if (severity === 'critical') {
        logger.error(message);
    } else if (severity === 'high') {
        logger.warn(message);
    } else {
        logger.info(message);
    }
};

/**
 * Log de rate limiting
 */
const logRateLimit = (ip, endpoint) => {
    logger.warn(`⚠️ Rate limit exceeded - IP: ${ip} - Endpoint: ${endpoint}`);
};

/**
 * Log de exportación de datos
 */
const logDataExport = (userId, dataType, format, success) => {
    const message = `Export ${dataType} as ${format} - User: ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    logger.info(message);
};

/**
 * Log de email enviado
 */
const logEmailSent = (to, subject, success, error = null) => {
    if (success) {
        logger.info(`📧 Email sent to ${to} - Subject: ${subject}`);
    } else {
        logger.error(`📧 Email failed to ${to} - Subject: ${subject} - Error: ${error}`);
    }
};

module.exports = {
    logAppStart,
    logDatabaseConnection,
    logAuth,
    logCRUD,
    logErrorWithContext,
    logSecurityEvent,
    logRateLimit,
    logDataExport,
    logEmailSent,
};
