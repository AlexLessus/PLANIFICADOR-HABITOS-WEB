/**
 * @fileoverview Middleware de Redirección HTTP a HTTPS
 * Redirige automáticamente todas las peticiones HTTP a HTTPS
 * @module middleware/httpsRedirect
 */

const logger = require('../config/logger');

/**
 * Middleware para redirigir HTTP a HTTPS
 * Solo activo en producción cuando SSL está habilitado
 */
const httpsRedirect = (req, res, next) => {
    // Solo en producción
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    // Solo si SSL está habilitado
    if (process.env.SSL_ENABLED !== 'true') {
        return next();
    }

    // Verificar si la petición es segura
    // req.secure verifica si la conexión es HTTPS
    // req.headers['x-forwarded-proto'] es usado por proxies/load balancers
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

    if (!isSecure) {
        const httpsUrl = `https://${req.hostname}${req.url}`;
        
        logger.warn(`🔒 Redirigiendo HTTP a HTTPS: ${req.url}`, {
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
        
        // Redirección permanente (301)
        return res.redirect(301, httpsUrl);
    }

    next();
};

/**
 * Middleware para agregar headers de seguridad SSL
 */
const sslSecurityHeaders = (req, res, next) => {
    // Solo en producción con SSL habilitado
    if (process.env.NODE_ENV === 'production' && process.env.SSL_ENABLED === 'true') {
        // HSTS - Forzar HTTPS por 1 año
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        
        // Upgrade Insecure Requests
        res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    }
    
    next();
};

module.exports = {
    httpsRedirect,
    sslSecurityHeaders,
};
