/**
 * @fileoverview Configuración SSL/HTTPS
 * Maneja certificados SSL para desarrollo y producción
 * @module config/ssl
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Verifica si SSL está habilitado
 */
const isSSLEnabled = () => {
    return process.env.SSL_ENABLED === 'true';
};

/**
 * Obtiene las opciones SSL para el servidor HTTPS
 */
const getSSLOptions = () => {
    if (!isSSLEnabled()) {
        return null;
    }

    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../../ssl/key.pem');
    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../../ssl/cert.pem');

    // Verificar que existen los archivos
    if (!fs.existsSync(keyPath)) {
        logger.error(`❌ No se encontró el archivo de clave SSL: ${keyPath}`);
        logger.warn('💡 Ejecuta: node scripts/generate-ssl-cert.js');
        return null;
    }

    if (!fs.existsSync(certPath)) {
        logger.error(`❌ No se encontró el archivo de certificado SSL: ${certPath}`);
        logger.warn('💡 Ejecuta: node scripts/generate-ssl-cert.js');
        return null;
    }

    try {
        const sslOptions = {
            key: fs.readFileSync(keyPath, 'utf8'),
            cert: fs.readFileSync(certPath, 'utf8'),
        };

        logger.info('✅ Certificados SSL cargados correctamente');
        
        // En desarrollo, mostrar advertencia
        if (process.env.NODE_ENV === 'development') {
            logger.warn('⚠️  Usando certificados SSL autofirmados (solo desarrollo)');
        }

        return sslOptions;
    } catch (error) {
        logger.error('❌ Error al leer certificados SSL:', error.message);
        return null;
    }
};

/**
 * Obtiene el protocolo (http o https)
 */
const getProtocol = () => {
    return isSSLEnabled() ? 'https' : 'http';
};

/**
 * Obtiene el puerto correcto según el protocolo
 */
const getPort = () => {
    if (isSSLEnabled()) {
        return process.env.HTTPS_PORT || 443;
    }
    return process.env.PORT || 5000;
};

/**
 * Obtiene la URL completa del servidor
 */
const getServerURL = (port) => {
    const protocol = getProtocol();
    const host = process.env.HOST || 'localhost';
    
    // Si es puerto estándar, no incluirlo en la URL
    if ((protocol === 'https' && port == 443) || (protocol === 'http' && port == 80)) {
        return `${protocol}://${host}`;
    }
    
    return `${protocol}://${host}:${port}`;
};

/**
 * Configuración de seguridad SSL adicional
 */
const getSecurityHeaders = () => {
    return {
        // Forzar HTTPS en producción
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        
        // Prevenir clickjacking
        'X-Frame-Options': 'DENY',
        
        // Prevenir MIME sniffing
        'X-Content-Type-Options': 'nosniff',
        
        // XSS Protection
        'X-XSS-Protection': '1; mode=block',
        
        // Referrer Policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        
        // Permissions Policy
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
};

module.exports = {
    isSSLEnabled,
    getSSLOptions,
    getProtocol,
    getPort,
    getServerURL,
    getSecurityHeaders,
};
