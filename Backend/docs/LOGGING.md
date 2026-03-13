# 📝 Sistema de Logging - Planificador de Tareas y Hábitos

Sistema profesional de logging implementado con **Winston** para desarrollo y producción.

## 📋 Tabla de Contenidos

1. [Características](#características)
2. [Niveles de Log](#niveles-de-log)
3. [Archivos de Log](#archivos-de-log)
4. [Uso Básico](#uso-básico)
5. [Funciones Utilitarias](#funciones-utilitarias)
6. [Ejemplos](#ejemplos)
7. [Configuración](#configuración)
8. [Mejores Prácticas](#mejores-prácticas)

## ✨ Características

- ✅ **Múltiples niveles de log** (error, warn, info, http, debug)
- ✅ **Logs en consola con colores** (desarrollo)
- ✅ **Logs en archivos** (producción)
- ✅ **Rotación automática de archivos** (máx 5MB por archivo)
- ✅ **Logging de requests HTTP** automático
- ✅ **Contexto enriquecido** (IP, user agent, userId)
- ✅ **Diferentes formatos** según entorno
- ✅ **Funciones helper** para casos comunes

## 📊 Niveles de Log

| Nivel | Prioridad | Uso | Color |
|-------|-----------|-----|-------|
| `error` | 0 | Errores críticos | 🔴 Rojo |
| `warn` | 1 | Advertencias | 🟡 Amarillo |
| `info` | 2 | Información general | 🟢 Verde |
| `http` | 3 | Requests HTTP | 🟣 Magenta |
| `debug` | 4 | Debugging (solo desarrollo) | 🔵 Azul |

### Nivel Automático por Entorno

- **Desarrollo:** `debug` (muestra todo)
- **Producción:** `warn` (solo warnings y errores)

## 📁 Archivos de Log

Los logs se guardan en `Backend/logs/`:

```
Backend/logs/
├── error.log       # Solo errores (nivel error)
├── combined.log    # Todos los logs
└── .gitignore      # Los archivos .log están ignorados
```

### Rotación de Archivos

- **Tamaño máximo:** 5MB por archivo
- **Archivos máximos:** 5 archivos
- **Rotación:** Automática cuando se alcanza el límite

## 🚀 Uso Básico

### Importar el Logger

```javascript
const logger = require('../config/logger');
```

### Logging Simple

```javascript
// Información general
logger.info('Usuario creado exitosamente');

// Advertencias
logger.warn('Límite de rate limit alcanzado');

// Errores
logger.error('Error al conectar a la base de datos');

// Debug (solo desarrollo)
logger.debug('Valor de variable:', variable);

// HTTP requests (automático con middleware)
logger.http('GET /api/users 200 - 45ms');
```

### Logging con Contexto

```javascript
logger.error('Error en autenticación', {
    email: 'user@example.com',
    ip: req.ip,
    timestamp: new Date().toISOString()
});
```

## 🛠️ Funciones Utilitarias

El módulo `utils/logger.js` proporciona funciones helper:

### 1. Log de Inicio de Aplicación

```javascript
const { logAppStart } = require('../utils/logger');

logAppStart(5000);
// Salida:
// ==================================================
// 🚀 PLANIFICADOR API - Servidor Iniciado
// 📡 Puerto: 5000
// 🌍 Entorno: development
// ⏰ Timestamp: 2024-11-06T15:30:00.000Z
// ==================================================
```

### 2. Log de Conexión a BD

```javascript
const { logDatabaseConnection } = require('../utils/logger');

// Éxito
logDatabaseConnection('success', 'Pool de conexiones listo');
// ✅ Conexión a base de datos exitosa - Pool de conexiones listo

// Error
logDatabaseConnection('error', 'Credenciales inválidas');
// ❌ Error en conexión a base de datos: Credenciales inválidas
```

### 3. Log de Autenticación

```javascript
const { logAuth } = require('../utils/logger');

// Login exitoso
logAuth('login', 'user@example.com', true);
// Auth login - user@example.com - SUCCESS

// Login fallido
logAuth('login', 'user@example.com', false, 'Contraseña incorrecta');
// Auth login - user@example.com - FAILED - Contraseña incorrecta
```

### 4. Log de Operaciones CRUD

```javascript
const { logCRUD } = require('../utils/logger');

// Crear tarea
logCRUD('create', 'task', userId, true);
// CREATE task - User: 123 - SUCCESS

// Error al eliminar
logCRUD('delete', 'habit', userId, false, 'No encontrado');
// DELETE habit - User: 123 - FAILED - No encontrado
```

### 5. Log de Errores con Contexto

```javascript
const { logErrorWithContext } = require('../utils/logger');

try {
    // código que puede fallar
} catch (error) {
    logErrorWithContext(error, {
        userId: req.user.id,
        action: 'create_task',
        data: req.body
    });
}
```

### 6. Log de Eventos de Seguridad

```javascript
const { logSecurityEvent } = require('../utils/logger');

// Evento crítico
logSecurityEvent('Intento de SQL Injection', 'critical', 'IP: 192.168.1.1');
// 🔒 SECURITY: Intento de SQL Injection - IP: 192.168.1.1

// Evento de advertencia
logSecurityEvent('Múltiples intentos de login', 'high', 'user@example.com');
```

### 7. Log de Rate Limiting

```javascript
const { logRateLimit } = require('../utils/logger');

logRateLimit(req.ip, '/api/auth/login');
// ⚠️ Rate limit exceeded - IP: 192.168.1.1 - Endpoint: /api/auth/login
```

### 8. Log de Exportación de Datos

```javascript
const { logDataExport } = require('../utils/logger');

logDataExport(userId, 'tasks', 'PDF', true);
// Export tasks as PDF - User: 123 - SUCCESS
```

### 9. Log de Emails

```javascript
const { logEmailSent } = require('../utils/logger');

// Email exitoso
logEmailSent('user@example.com', 'Reset Password', true);
// 📧 Email sent to user@example.com - Subject: Reset Password

// Email fallido
logEmailSent('user@example.com', 'Welcome', false, 'SMTP error');
// 📧 Email failed to user@example.com - Subject: Welcome - Error: SMTP error
```

## 💡 Ejemplos Prácticos

### En Controladores

```javascript
// authController.js
const logger = require('../config/logger');
const { logAuth } = require('../utils/logger');

const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await userModel.findByEmail(email);
        
        if (!user) {
            logAuth('login', email, false, 'Usuario no encontrado');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const isMatch = await userModel.comparePassword(password, user.password_hash);
        
        if (!isMatch) {
            logAuth('login', email, false, 'Contraseña incorrecta');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        logAuth('login', email, true);
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.json({ token });
        
    } catch (error) {
        logger.error('Error en login:', {
            email,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Error interno' });
    }
};
```

### En Rutas

```javascript
// tasks.js
const logger = require('../config/logger');
const { logCRUD } = require('../utils/logger');

router.post('/', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    const { title, description } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
            [userId, title, description]
        );
        
        logCRUD('create', 'task', userId, true);
        res.status(201).json({ id: result.insertId });
        
    } catch (error) {
        logCRUD('create', 'task', userId, false, error.message);
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});
```

### En Middleware

```javascript
// rateLimiter.js
const { logRateLimit } = require('../utils/logger');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        logRateLimit(req.ip, req.originalUrl);
        res.status(429).json({
            error: 'Demasiados intentos. Intenta de nuevo más tarde.'
        });
    }
});
```

## ⚙️ Configuración

### Variables de Entorno

```env
NODE_ENV=production  # development | production
```

### Personalizar Niveles

Editar `Backend/src/config/logger.js`:

```javascript
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    
    // Personalizar nivel por entorno
    if (env === 'production') return 'warn';
    if (env === 'staging') return 'info';
    return 'debug'; // development
};
```

### Añadir Nuevos Transports

```javascript
// Ejemplo: Enviar errores a un servicio externo
const transports = [
    // ... transports existentes
    
    // Sentry, Loggly, etc.
    new winston.transports.Http({
        host: 'logs.example.com',
        port: 443,
        path: '/logs',
        ssl: true
    })
];
```

## 📚 Mejores Prácticas

### ✅ DO

```javascript
// Usar niveles apropiados
logger.error('Error crítico que requiere atención');
logger.warn('Situación inusual pero manejable');
logger.info('Evento importante del sistema');
logger.debug('Información de debugging');

// Incluir contexto útil
logger.error('Error en pago', {
    userId: user.id,
    amount: payment.amount,
    paymentId: payment.id,
    timestamp: new Date()
});

// Usar funciones helper
logAuth('login', email, success);
logCRUD('create', 'task', userId, true);
```

### ❌ DON'T

```javascript
// No usar console.log
console.log('Usuario creado'); // ❌

// No loggear información sensible
logger.info('Login:', {
    password: user.password,  // ❌ NUNCA
    creditCard: user.card     // ❌ NUNCA
});

// No loggear en exceso
for (let i = 0; i < 10000; i++) {
    logger.debug('Iteración', i); // ❌ Demasiado
}

// No usar nivel incorrecto
logger.error('Usuario hizo click en botón'); // ❌ No es un error
```

## 🔍 Monitoreo de Logs

### Ver Logs en Tiempo Real

```bash
# Todos los logs
tail -f Backend/logs/combined.log

# Solo errores
tail -f Backend/logs/error.log

# Filtrar por término
tail -f Backend/logs/combined.log | grep "ERROR"
```

### Analizar Logs

```bash
# Contar errores
grep -c "error" Backend/logs/combined.log

# Buscar por usuario
grep "userId.*123" Backend/logs/combined.log

# Logs de las últimas 24 horas
find Backend/logs -name "*.log" -mtime -1
```

## 🚨 Troubleshooting

### Los logs no se guardan en archivos

1. Verificar que existe el directorio `Backend/logs/`
2. Verificar permisos de escritura
3. Revisar espacio en disco

### Logs muy grandes

1. Reducir nivel de log en producción (`warn` en lugar de `debug`)
2. Implementar rotación más agresiva
3. Usar servicio externo de logs

### No se ven logs en consola

1. Verificar `NODE_ENV`
2. Revisar configuración de transports
3. Asegurar que el logger está importado correctamente

## 📞 Soporte

Para problemas con el sistema de logging:
- Revisar `Backend/src/config/logger.js`
- Verificar que Winston está instalado: `npm list winston`
- Consultar documentación de Winston: https://github.com/winstonjs/winston

---

**Sistema de Logging v1.0.0**  
**Última actualización:** 2024-11-06
