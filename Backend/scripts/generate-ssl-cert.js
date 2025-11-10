/**
 * @fileoverview Script para generar certificados SSL autofirmados
 * Solo para desarrollo local - NO usar en producción
 * Uso: node scripts/generate-ssl-cert.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkOpenSSL() {
    try {
        execSync('openssl version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function generateCertificates() {
    log('\n🔐 Generador de Certificados SSL para Desarrollo\n', 'blue');
    
    // Verificar OpenSSL
    if (!checkOpenSSL()) {
        log('❌ OpenSSL no está instalado o no está en el PATH', 'red');
        log('\n📥 Instalación de OpenSSL:', 'yellow');
        log('  Windows: https://slproweb.com/products/Win32OpenSSL.html', 'cyan');
        log('  macOS: brew install openssl', 'cyan');
        log('  Linux: sudo apt-get install openssl\n', 'cyan');
        process.exit(1);
    }
    
    log('✅ OpenSSL encontrado', 'green');
    
    // Crear directorio ssl si no existe
    const sslDir = path.join(__dirname, '../ssl');
    if (!fs.existsSync(sslDir)) {
        fs.mkdirSync(sslDir, { recursive: true });
        log('✅ Directorio ssl/ creado', 'green');
    }
    
    const keyPath = path.join(sslDir, 'key.pem');
    const certPath = path.join(sslDir, 'cert.pem');
    
    // Verificar si ya existen certificados
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        log('\n⚠️  Los certificados SSL ya existen', 'yellow');
        log('¿Deseas regenerarlos? Elimina los archivos manualmente:', 'yellow');
        log(`  - ${keyPath}`, 'cyan');
        log(`  - ${certPath}\n`, 'cyan');
        return;
    }
    
    log('\n📝 Generando certificados SSL autofirmados...', 'cyan');
    
    try {
        // Generar clave privada y certificado
        const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=MX/ST=Jalisco/L=Ciudad Guzman/O=TIGERTECH/OU=Development/CN=localhost"`;
        
        execSync(command, { stdio: 'inherit' });
        
        log('\n✅ Certificados SSL generados exitosamente', 'green');
        log('\n📁 Archivos creados:', 'cyan');
        log(`  🔑 Clave privada: ${keyPath}`, 'green');
        log(`  📜 Certificado: ${certPath}`, 'green');
        
        log('\n⚠️  IMPORTANTE:', 'yellow');
        log('  - Estos certificados son SOLO para desarrollo', 'yellow');
        log('  - El navegador mostrará advertencia de seguridad (es normal)', 'yellow');
        log('  - Para producción, usa certificados de Let\'s Encrypt o un CA válido', 'yellow');
        
        log('\n🚀 Próximos pasos:', 'blue');
        log('  1. Configurar variables de entorno en .env:', 'cyan');
        log('     SSL_ENABLED=true', 'cyan');
        log('     SSL_KEY_PATH=./ssl/key.pem', 'cyan');
        log('     SSL_CERT_PATH=./ssl/cert.pem', 'cyan');
        log('  2. Reiniciar el servidor: npm start', 'cyan');
        log('  3. Acceder a: https://localhost:5000\n', 'cyan');
        
    } catch (error) {
        log('\n❌ Error al generar certificados:', 'red');
        log(error.message, 'red');
        process.exit(1);
    }
}

// Ejecutar
generateCertificates();
