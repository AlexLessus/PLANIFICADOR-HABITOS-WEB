# 🚀 SSL/HTTPS - Guía Rápida

Configuración de HTTPS en **3 pasos**.

## 🎯 Desarrollo Local

### Paso 1: Generar Certificados

```bash
cd Backend
npm run ssl:generate
```

### Paso 2: Configurar .env

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

Acceder a: **https://localhost:5000**

**Nota:** El navegador mostrará advertencia de seguridad (es normal con certificados autofirmados).

---

## 🌐 Producción

### Opción A: Let's Encrypt (Gratis)

```bash
# 1. Instalar Certbot
sudo apt-get install certbot

# 2. Obtener certificado
sudo certbot certonly --standalone -d tudominio.com

# 3. Configurar .env
SSL_ENABLED=true
HTTPS_PORT=443
SSL_KEY_PATH=/etc/letsencrypt/live/tudominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/tudominio.com/fullchain.pem
HTTP_REDIRECT=true
NODE_ENV=production

# 4. Iniciar servidor
npm start
```

### Opción B: Reverse Proxy (Nginx)

```bash
# Backend sin SSL (Nginx maneja HTTPS)
SSL_ENABLED=false
PORT=5000
```

**Nginx Config:**
```nginx
server {
    listen 443 ssl;
    server_name tudominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
    }
}
```

---

## ✅ Verificar Funcionamiento

### Desarrollo
```bash
# Deberías ver:
🔒 Protocolo: HTTPS (SSL Habilitado)
🔗 URL: https://localhost:5000
⚠️  Certificados autofirmados - El navegador mostrará advertencia
```

### Producción
```bash
# Test SSL
curl -I https://tudominio.com

# Deberías ver:
HTTP/2 200
strict-transport-security: max-age=31536000
```

---

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run ssl:generate` | Generar certificados para desarrollo |
| `npm start` | Iniciar servidor (HTTP o HTTPS según config) |
| `openssl x509 -in ssl/cert.pem -text` | Ver detalles del certificado |

---

## 🚨 Troubleshooting

### Error: "OpenSSL no encontrado"
```bash
# Windows
# Descargar de: https://slproweb.com/products/Win32OpenSSL.html

# Linux
sudo apt-get install openssl

# macOS
brew install openssl
```

### Error: "Puerto 443 en uso"
```env
# Cambiar puerto en .env
HTTPS_PORT=8443
```

### Advertencia en navegador
**Desarrollo:** Normal con certificados autofirmados  
**Producción:** Usar Let's Encrypt o certificado comercial

---

## 📚 Documentación Completa

Ver: `Backend/docs/SSL_HTTPS.md`

---

**¡Listo!** Tu servidor ahora soporta HTTPS. 🔒
