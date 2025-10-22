// Backend/src/middleware/authMiddleware.js

/**
 * Middleware de Autenticación Básico (Temporalmente en modo Bypass para depuración)
 * * En un entorno real, esta función debería:
 * 1. Leer el token JWT.
 * 2. Verificar el token.
 * 3. Decodificar para obtener el req.user.id.
 */

const authMiddleware = (req, res, next) => {
    // ⚠️ MODO DEPURACIÓN: Asignamos un ID de usuario de prueba (1)
    // Esto permite que el controlador de exportación simule la consulta.
    req.user = { id: 1 };
    
    // Si la ruta /api/test-db funciona, podemos asumir que la conexión a DB funcionará
    // para este usuario simulado.
    next(); 
};

module.exports = authMiddleware;
