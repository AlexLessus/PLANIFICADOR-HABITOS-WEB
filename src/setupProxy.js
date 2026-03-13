/**
 * @fileoverview Configuración del proxy para el servidor de desarrollo
 * Deshabilita Cross-Origin-Opener-Policy para permitir Google OAuth
 * 
 * IMPORTANTE: Este archivo es detectado automáticamente por Create React App
 * y se ejecuta cuando inicias el servidor de desarrollo con `npm start`
 */

module.exports = function(app) {
  // Middleware para modificar headers de respuesta
  // Esto se ejecuta ANTES de que webpack-dev-server añada sus headers
  app.use((req, res, next) => {
    // Interceptar el método setHeader original
    const originalSetHeader = res.setHeader;
    
    res.setHeader = function(name, value) {
      // Bloquear el header COOP que causa problemas con Google OAuth
      if (name === 'Cross-Origin-Opener-Policy') {
        console.log('[setupProxy] Bloqueando header COOP para permitir Google OAuth');
        return;
      }
      
      // Bloquear COEP también para mayor compatibilidad
      if (name === 'Cross-Origin-Embedder-Policy') {
        console.log('[setupProxy] Bloqueando header COEP para permitir Google OAuth');
        return;
      }
      
      // Permitir todos los demás headers
      return originalSetHeader.call(this, name, value);
    };
    
    next();
  });

  console.log('[setupProxy] Configuración cargada - Headers COOP/COEP deshabilitados para Google OAuth');
};
