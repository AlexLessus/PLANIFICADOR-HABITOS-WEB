// Backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticación
 * 1. Lee y verifica el token JWT del header 'Authorization'.
 * 2. Decodifica y asigna el ID del usuario real a req.user.
 * 3. Si falla, devuelve un error 401 (No autorizado).
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Verificar si existe el header de autorización o si tiene el formato 'Bearer token'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se encontró el token de autenticación.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar el token usando la clave secreta de tu entorno
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Asigna el ID del usuario REAL a req.user para que los controladores lo utilicen
        req.user = { id: decoded.id };
        
        next();
    } catch (error) {
        // Token inválido, expirado o error de verificación
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = authMiddleware;