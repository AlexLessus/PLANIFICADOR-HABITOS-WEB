# 🚀 Guía Rápida - Configuración de Base de Datos

Esta guía te ayudará a configurar la base de datos en **5 minutos**.

## ✅ Prerrequisitos

- MySQL Server instalado y corriendo
- Node.js instalado
- Archivo `.env` configurado en `Backend/`

## 📝 Paso 1: Configurar Variables de Entorno

Crea o edita el archivo `Backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=planner_db
```

## 🎯 Paso 2: Elegir Método de Instalación

### Opción A: Usando Scripts NPM (Recomendado)

```bash
# Navegar al directorio Backend
cd Backend

# Crear base de datos y tablas
npm run db:setup

# Insertar datos de prueba (opcional, solo desarrollo)
npm run db:seed

# Verificar estado
npm run db:status
```

### Opción B: Usando MySQL CLI

```bash
# Navegar al directorio de database
cd Backend/database

# Crear base de datos y tablas
mysql -u root -p < schema.sql

# Insertar datos de prueba (opcional)
mysql -u root -p < seed.sql
```

### Opción C: Usando MySQL Workbench

1. Abrir MySQL Workbench
2. Conectar a tu servidor MySQL
3. Abrir archivo `Backend/database/schema.sql`
4. Ejecutar todo el script (⚡ icono de rayo)
5. (Opcional) Abrir y ejecutar `seed.sql` para datos de prueba

## 🧪 Paso 3: Verificar Instalación

### Usando NPM:
```bash
npm run db:status
```

### Usando MySQL:
```bash
mysql -u root -p -e "USE planner_db; SHOW TABLES;"
```

Deberías ver 4 tablas:
- ✅ users
- ✅ tasks
- ✅ habits
- ✅ habit_completions

## 🎮 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run db:setup` | Crea la base de datos y todas las tablas |
| `npm run db:seed` | Inserta datos de prueba |
| `npm run db:rollback` | Elimina todas las tablas |
| `npm run db:reset` | Elimina todo y recrea desde cero |
| `npm run db:status` | Muestra el estado actual |

## 👤 Usuarios de Prueba

Después de ejecutar `npm run db:seed`, puedes usar:

| Email | Password |
|-------|----------|
| test@test.com | Password123 |
| juan.perez@example.com | Password123 |
| maria.garcia@example.com | Password123 |

## 🔧 Solución de Problemas

### Error: "Access denied for user"
```bash
# Verificar credenciales en .env
# Asegurarse que MySQL está corriendo
mysql -u root -p
```

### Error: "Database doesn't exist"
```bash
# Ejecutar setup nuevamente
npm run db:setup
```

### Error: "Table already exists"
```bash
# Hacer reset completo
npm run db:reset
```

### Limpiar y empezar de nuevo
```bash
npm run db:reset
```

## 📊 Estructura de Datos

### Usuarios (users)
- Almacena información de usuarios
- Contraseñas hasheadas con bcrypt
- Soporte para reset de contraseña

### Tareas (tasks)
- Tareas simples y recurrentes
- Prioridades: Alta, Media, Baja
- Estados: Pendiente, En Progreso, Completada, Cancelada

### Hábitos (habits)
- Hábitos personalizables
- Hora y ubicación sugerida

### Completados (habit_completions)
- Registro diario de cumplimiento
- Cálculo automático de rachas

## 🎯 Próximos Pasos

1. ✅ Configurar base de datos
2. ✅ Verificar conexión
3. ▶️ Iniciar servidor backend: `npm start`
4. ▶️ Probar endpoints con Postman o frontend

---

**¡Listo!** Tu base de datos está configurada y lista para usar. 🎉
