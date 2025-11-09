/**
 * @fileoverview Middleware de Logging de Requests HTTP
 * Registra todas las peticiones HTTP con detalles de timing y respuesta
 * @module middleware/requestLogger
 */

const logger = require('../config/logger');

/**
 * Middleware para logging de requests HTTP
 * Registra método, URL, status code, tiempo de respuesta e IP
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Capturar el método original de res.json para interceptar respuestas
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    // Interceptar res.json
    res.json = function(body) {
        res.locals.body = body;
        return originalJson(body);
    };
    
    // Interceptar res.send
    res.send = function(body) {
        res.locals.body = body;
        return originalSend(body);
    };
    
    // Cuando la respuesta termina, registrar el log
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Construir mensaje de log
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent') || 'unknown',
        };
        
        // Si hay usuario autenticado, incluir su ID
        if (req.user && req.user.id) {
            logData.userId = req.user.id;
        }
        
        // Determinar nivel de log según status code
        let logLevel = 'http';
        let message = `${logData.method} ${logData.url} ${logData.status} - ${logData.responseTime}`;
        
        if (res.statusCode >= 500) {
            logLevel = 'error';
            message += ` - SERVER ERROR`;
        } else if (res.statusCode >= 400) {
            logLevel = 'warn';
            message += ` - CLIENT ERROR`;
        } else if (res.statusCode >= 300) {
            logLevel = 'info';
            message += ` - REDIRECT`;
        }
        
        // Registrar log
        logger[logLevel](message, logData);
        
        // En desarrollo, mostrar detalles adicionales para errores
        if (process.env.NODE_ENV === 'development' && res.statusCode >= 400) {
            if (res.locals.body) {
                logger.debug('Response body:', res.locals.body);
            }
        }
    });
    
    next();
};

module.exports = requestLogger;
