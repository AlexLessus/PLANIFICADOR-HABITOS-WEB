# 🚀 Logging - Guía Rápida

Configuración del sistema de logging en **3 pasos**.

## Paso 1: Instalar Dependencia

```bash
cd Backend
npm install winston
```

## Paso 2: Verificar Archivos

Asegúrate de que existen estos archivos:

```
Backend/
├── src/
│   ├── config/
│   │   └── logger.js                 ✅ Configuración principal
│   ├── middleware/
│   │   └── requestLogger.js          ✅ Middleware HTTP
│   └── utils/
│       └── logger.js                 ✅ Funciones helper
└── logs/
    └── .gitignore                    ✅ Ignorar archivos de log
```

## Paso 3: Usar en tu Código

### Opción A: Logger Básico

```javascript
const logger = require('../config/logger');

logger.info('Mensaje informativo');
logger.warn('Advertencia');
logger.error('Error crítico');
logger.debug('Debug info');
```

### Opción B: Funciones Helper

```javascript
const { logAuth, logCRUD } = require('../utils/logger');

// Login
logAuth('login', 'user@example.com', true);

// CRUD
logCRUD('create', 'task', userId, true);
```

## ✅ Verificar Funcionamiento

1. Iniciar servidor:
```bash
npm start
```

2. Deberías ver en consola:
```
==================================================
🚀 PLANIFICADOR API - Servidor Iniciado
📡 Puerto: 5000
🌍 Entorno: development
⏰ Timestamp: 2024-11-06T15:30:00.000Z
==================================================
✅ Conexión a base de datos exitosa - Pool de conexiones listo
```

3. Verificar archivos de log:
```bash
ls -la Backend/logs/
# Deberías ver: combined.log y error.log
```

## 📝 Ejemplo Completo

```javascript
// En tu controlador
const logger = require('../config/logger');
const { logAuth } = require('../utils/logger');

const login = async (req, res) => {
    try {
        // Tu lógica aquí
        logAuth('login', email, true);
        res.json({ token });
    } catch (error) {
        logger.error('Error en login:', {
            email,
            error: error.message
        });
        res.status(500).json({ error: 'Error interno' });
    }
};
```

## 🎯 Próximos Pasos

- Leer documentación completa: `docs/LOGGING.md`
- Reemplazar todos los `console.log` con `logger`
- Configurar nivel de log para producción

---

**¡Listo!** Tu sistema de logging está configurado. 🎉
