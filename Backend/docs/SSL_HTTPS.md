# 🔒 Configuración SSL/HTTPS - Guía Completa

Sistema completo de SSL/HTTPS para desarrollo y producción.

## 📋 Tabla de Contenidos

1. [Características](#características)
2. [Configuración Rápida](#configuración-rápida)
3. [Desarrollo Local](#desarrollo-local)
4. [Producción](#producción)
5. [Variables de Entorno](#variables-de-entorno)
6. [Troubleshooting](#troubleshooting)

## ✨ Características

- ✅ **Soporte HTTP y HTTPS**
- ✅ **Generación automática de certificados** para desarrollo
- ✅ **Redirección HTTP → HTTPS** en producción
- ✅ **Headers de seguridad SSL** (HSTS, CSP)
- ✅ **Cierre graceful** del servidor
- ✅ **Manejo de errores** robusto
- ✅ **Logging completo** de eventos SSL

## 🚀 Configuración Rápida

### Opción A: Solo HTTP (Desarrollo Simple)

```env
# .env
SSL_ENABLED=false
PORT=5000
```

```bash
npm start
# Servidor en: http://localhost:5000
```

### Opción B: HTTPS (Desarrollo Seguro)

```bash
# 1. Generar certificados SSL
npm run ssl:generate

# 2. Configurar .env
SSL_ENABLED=true
HTTPS_PORT=5000

# 3. Iniciar servidor
npm start
# Servidor en: https://localhost:5000
```

## 🔧 Desarrollo Local

### Paso 1: Generar Certificados Autofirmados

```bash
npm run ssl:generate
```

Este comando:
- ✅ Verifica que OpenSSL esté instalado
- ✅ Genera clave privada RSA de 4096 bits
- ✅ Crea certificado autofirmado válido por 365 días
- ✅ Guarda archivos en `Backend/ssl/`

**Salida esperada:**
```
🔐 Generador de Certificados SSL para Desarrollo

✅ OpenSSL encontrado
✅ Directorio ssl/ creado
📝 Generando certificados SSL autofirmados...

✅ Certificados SSL generados exitosamente

📁 Archivos creados:
  🔑 Clave privada: C:\...\Backend\ssl\key.pem
  📜 Certificado: C:\...\Backend\ssl\cert.pem
```

### Paso 2: Configurar Variables de Entorno

```env
# .env
SSL_ENABLED=true
HTTPS_PORT=5000
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
NODE_ENV=development
```

### Paso 3: Iniciar Servidor

```bash
npm start
```

**Salida esperada:**
```
==================================================
🚀 PLANIFICADOR API - Servidor Iniciado
📡 Puerto: 5000
🌍 Entorno: development
⏰ Timestamp: 2024-11-07T10:00:00.000Z
==================================================
✅ Certificados SSL cargados correctamente
⚠️  Usando certificados SSL autofirmados (solo desarrollo)
🔒 Protocolo: HTTPS (SSL Habilitado)
🔗 URL: https://localhost:5000
⚠️  Certificados autofirmados - El navegador mostrará advertencia
💡 Para aceptar: Avanzado → Continuar a localhost
✅ Conexión a base de datos exitosa - Pool de conexiones listo
```

### Paso 4: Aceptar Certificado en el Navegador

1. Ir a `https://localhost:5000`
2. Verás advertencia: "Tu conexión no es privada"
3. Click en **"Avanzado"**
4. Click en **"Continuar a localhost (no seguro)"**

**Esto es normal con certificados autofirmados en desarrollo.**

## 🌐 Producción

### Opción 1: Let's Encrypt (Recomendado - Gratis)

#### Usando Certbot

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tudominio.com

# Certificados se guardan en:
# /etc/letsencrypt/live/tudominio.com/fullchain.pem
# /etc/letsencrypt/live/tudominio.com/privkey.pem
```

#### Configurar .env

```env
SSL_ENABLED=true
HTTPS_PORT=443
SSL_KEY_PATH=/etc/letsencrypt/live/tudominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/tudominio.com/fullchain.pem
HTTP_REDIRECT=true
NODE_ENV=production
```

#### Renovación Automática

```bash
# Agregar a crontab
sudo crontab -e

# Renovar cada 3 meses
0 0 1 */3 * certbot renew --quiet && systemctl restart planner-api
```

### Opción 2: Certificado Comercial

1. Comprar certificado SSL de un CA (GoDaddy, Namecheap, etc.)
2. Descargar archivos `.key` y `.crt`
3. Configurar rutas en `.env`

```env
SSL_ENABLED=true
SSL_KEY_PATH=/path/to/your/private.key
SSL_CERT_PATH=/path/to/your/certificate.crt
```

### Opción 3: Reverse Proxy (Nginx/Apache)

Si usas Nginx o Apache como reverse proxy, ellos manejan SSL:

```env
# .env - Backend solo HTTP
SSL_ENABLED=false
PORT=5000
```

**Nginx maneja HTTPS y hace proxy a tu backend HTTP.**

#### Ejemplo Nginx Config:

```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ⚙️ Variables de Entorno

### Variables SSL

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `SSL_ENABLED` | Habilitar HTTPS | `false` | `true` |
| `SSL_KEY_PATH` | Ruta a clave privada | `./ssl/key.pem` | `/etc/ssl/key.pem` |
| `SSL_CERT_PATH` | Ruta a certificado | `./ssl/cert.pem` | `/etc/ssl/cert.pem` |
| `HTTPS_PORT` | Puerto HTTPS | `443` | `5000`, `8443` |
| `HTTP_REDIRECT` | Redirigir HTTP a HTTPS | `false` | `true` |

### Variables de Servidor

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto HTTP | `5000` |
| `HOST` | Host del servidor | `localhost` |
| `NODE_ENV` | Entorno | `development` |

## 🔐 Headers de Seguridad

Cuando SSL está habilitado en producción, se añaden automáticamente:

### HSTS (HTTP Strict Transport Security)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- Fuerza HTTPS por 1 año
- Incluye subdominios
- Elegible para preload list de navegadores

### Content Security Policy
```
Content-Security-Policy: upgrade-insecure-requests
```
- Actualiza automáticamente recursos HTTP a HTTPS

### Otros Headers (vía Helmet)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

## 🔄 Redirección HTTP → HTTPS

### Desarrollo
No se redirige automáticamente (para facilitar testing)

### Producción
Con `HTTP_REDIRECT=true`, se inicia servidor HTTP adicional que redirige:

```javascript
HTTP Request → http://tudominio.com/api/users
↓
301 Redirect
↓
HTTPS Request → https://tudominio.com/api/users
```

## 📊 Arquitectura

```
┌─────────────────────────────────────────┐
│         Cliente (Navegador)             │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS (443)
                  ↓
┌─────────────────────────────────────────┐
│      server.js (HTTPS Server)           │
│  ┌────────────────────────────────┐     │
│  │  SSL/TLS Termination           │     │
│  │  - Certificados                │     │
│  │  - Handshake                   │     │
│  └────────────────────────────────┘     │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│           app.js (Express)              │
│  ┌────────────────────────────────┐     │
│  │  Middleware Stack              │     │
│  │  - HTTPS Redirect              │     │
│  │  - SSL Security Headers        │     │
│  │  - CORS                        │     │
│  │  - Rate Limiting               │     │
│  │  - Routes                      │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

## 🛠️ Comandos Útiles

### Generar Certificados
```bash
npm run ssl:generate
```

### Verificar Certificado
```bash
openssl x509 -in ssl/cert.pem -text -noout
```

### Ver Fecha de Expiración
```bash
openssl x509 -in ssl/cert.pem -noout -dates
```

### Test de Conexión SSL
```bash
openssl s_client -connect localhost:5000
```

### Verificar Puerto en Uso
```bash
# Windows
netstat -ano | findstr :443

# Linux/Mac
lsof -i :443
```

## 🚨 Troubleshooting

### Error: "OpenSSL no está instalado"

**Windows:**
1. Descargar de: https://slproweb.com/products/Win32OpenSSL.html
2. Instalar versión "Win64 OpenSSL v3.x.x"
3. Agregar a PATH: `C:\Program Files\OpenSSL-Win64\bin`

**Linux:**
```bash
sudo apt-get install openssl
```

**macOS:**
```bash
brew install openssl
```

### Error: "Puerto 443 ya está en uso"

```bash
# Cambiar puerto en .env
HTTPS_PORT=8443

# O detener proceso que usa el puerto
# Windows
netstat -ano | findstr :443
taskkill /PID <PID> /F

# Linux/Mac
sudo lsof -ti:443 | xargs kill -9
```

### Error: "EACCES: Permission denied"

Puerto 443 requiere permisos de administrador:

**Opción 1:** Usar puerto > 1024
```env
HTTPS_PORT=5000
```

**Opción 2:** Ejecutar con permisos
```bash
# Linux/Mac
sudo npm start

# Windows (PowerShell como Administrador)
npm start
```

### Advertencia: "Certificado autofirmado"

**Desarrollo:** Es normal, acepta la advertencia

**Producción:** Usa certificados de Let's Encrypt o CA comercial

### Error: "Cannot find module 'https'"

Node.js incluye `https` por defecto. Reinstalar Node.js.

### Logs no muestran HTTPS

Verificar `.env`:
```env
SSL_ENABLED=true  # No 'false'
```

## 📚 Mejores Prácticas

### ✅ DO

```javascript
// Usar certificados válidos en producción
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/domain/fullchain.pem

// Habilitar HSTS en producción
NODE_ENV=production

// Redirigir HTTP a HTTPS
HTTP_REDIRECT=true

// Usar puertos estándar en producción
HTTPS_PORT=443
```

### ❌ DON'T

```javascript
// No usar certificados autofirmados en producción
SSL_CERT_PATH=./ssl/cert.pem  // ❌ En producción

// No exponer claves privadas
git add ssl/key.pem  // ❌ NUNCA

// No usar HTTP en producción
SSL_ENABLED=false  // ❌ En producción

// No hardcodear rutas de certificados
const cert = fs.readFileSync('/my/cert.pem');  // ❌
```

## 🔍 Verificación de Seguridad

### Test SSL en Producción

1. **SSL Labs:** https://www.ssllabs.com/ssltest/
2. **Security Headers:** https://securityheaders.com/

### Checklist de Seguridad

- [ ] Certificados válidos instalados
- [ ] HSTS habilitado
- [ ] Redirección HTTP → HTTPS activa
- [ ] Puerto 80 cerrado o redirigiendo
- [ ] Certificados renovándose automáticamente
- [ ] Headers de seguridad configurados
- [ ] TLS 1.2+ habilitado
- [ ] Cipher suites seguros

## 📞 Soporte

Para problemas con SSL/HTTPS:
- Revisar logs: `Backend/logs/error.log`
- Verificar certificados: `npm run ssl:generate`
- Consultar documentación de OpenSSL

---

**Sistema SSL/HTTPS v1.0.0**  
**Última actualización:** 2024-11-07
