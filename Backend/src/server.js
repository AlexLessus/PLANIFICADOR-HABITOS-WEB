/**
 * @fileoverview Servidor Principal con soporte HTTP/HTTPS
 * Inicia el servidor con o sin SSL según configuración
 * @module server
 */

require('dotenv').config();
const http = require('http');
const https = require('https');
const app = require('./app');
const logger = require('./config/logger');
const { logAppStart, logDatabaseConnection } = require('./utils/logger');
const { isSSLEnabled, getSSLOptions, getProtocol, getServerURL } = require('./config/ssl');
const db = require('./database/db');

// Determinar puerto
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

/**
 * Inicia el servidor HTTP
 */
function startHTTPServer() {
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
        logAppStart(PORT);
        logger.info(`🌐 Protocolo: HTTP`);
        logger.info(`🔗 URL: ${getServerURL(PORT)}`);
        
        // Test de conexión a BD
        testDatabaseConnection();
    });

    return server;
}

/**
 * Inicia el servidor HTTPS
 */
function startHTTPSServer() {
    const sslOptions = getSSLOptions();
    
    if (!sslOptions) {
        logger.error('❌ No se pudieron cargar los certificados SSL');
        logger.warn('⚠️  Iniciando servidor HTTP en su lugar...');
        return startHTTPServer();
    }

    const server = https.createServer(sslOptions, app);
    
    server.listen(HTTPS_PORT, () => {
        logAppStart(HTTPS_PORT);
        logger.info(`🔒 Protocolo: HTTPS (SSL Habilitado)`);
        logger.info(`🔗 URL: ${getServerURL(HTTPS_PORT)}`);
        
        if (process.env.NODE_ENV === 'development') {
            logger.warn('⚠️  Certificados autofirmados - El navegador mostrará advertencia');
            logger.info('💡 Para aceptar: Avanzado → Continuar a localhost');
        }
        
        // Test de conexión a BD
        testDatabaseConnection();
    });

    // Opcionalmente, iniciar servidor HTTP que redirija a HTTPS
    if (process.env.HTTP_REDIRECT === 'true') {
        const httpServer = http.createServer((req, res) => {
            const httpsUrl = `https://${req.headers.host}${req.url}`;
            logger.info(`🔀 Redirigiendo HTTP → HTTPS: ${req.url}`);
            res.writeHead(301, { Location: httpsUrl });
            res.end();
        });

        httpServer.listen(PORT, () => {
            logger.info(`🔀 Servidor HTTP (redirección) en puerto ${PORT}`);
        });
    }

    return server;
}

/**
 * Test de conexión a base de datos
 */
async function testDatabaseConnection() {
    try {
        const connection = await db.getConnection();
        logDatabaseConnection('success', '- Pool de conexiones listo');
        connection.release();
    } catch (err) {
        logDatabaseConnection('error', err.message);
    }
}

/**
 * Manejo de errores del servidor
 */
function handleServerError(error, port) {
    if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${port} ya está en uso`);
        logger.info('💡 Soluciones:');
        logger.info('   1. Cambiar el puerto en .env');
        logger.info('   2. Detener el proceso que usa el puerto');
        process.exit(1);
    } else if (error.code === 'EACCES') {
        logger.error(`❌ Permiso denegado para usar puerto ${port}`);
        logger.info('💡 Usa un puerto > 1024 o ejecuta con permisos de administrador');
        process.exit(1);
    } else {
        logger.error('❌ Error al iniciar servidor:', error.message);
        process.exit(1);
    }
}

/**
 * Manejo de cierre graceful
 */
function setupGracefulShutdown(server) {
    const shutdown = async (signal) => {
        logger.info(`\n⚠️  ${signal} recibido. Cerrando servidor...`);
        
        server.close(async () => {
            logger.info('✅ Servidor cerrado');
            
            try {
                await db.end();
                logger.info('✅ Conexiones de BD cerradas');
                process.exit(0);
            } catch (error) {
                logger.error('❌ Error al cerrar conexiones:', error.message);
                process.exit(1);
            }
        });

        // Forzar cierre después de 10 segundos
        setTimeout(() => {
            logger.error('❌ Forzando cierre del servidor...');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Iniciar servidor
 */
function startServer() {
    let server;

    try {
        if (isSSLEnabled()) {
            server = startHTTPSServer();
        } else {
            server = startHTTPServer();
        }

        server.on('error', (error) => {
            const port = isSSLEnabled() ? HTTPS_PORT : PORT;
            handleServerError(error, port);
        });

        setupGracefulShutdown(server);

    } catch (error) {
        logger.error('❌ Error fatal al iniciar servidor:', error.message);
        process.exit(1);
    }
}

// Iniciar servidor
startServer();

module.exports = app;
