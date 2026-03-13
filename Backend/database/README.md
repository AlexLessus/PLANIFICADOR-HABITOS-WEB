# 📊 Scripts de Base de Datos - Planificador de Tareas y Hábitos

Este directorio contiene todos los scripts SQL necesarios para la gestión de la base de datos del proyecto.

## 📁 Estructura de Archivos

```
database/
├── schema.sql                    # Schema completo de la base de datos
├── seed.sql                      # Datos de prueba para desarrollo
├── migrations/                   # Scripts de migración versionados
│   └── 001_initial_schema.sql   # Migración inicial
├── rollback/                     # Scripts para revertir migraciones
│   └── 001_rollback_initial_schema.sql
└── README.md                     # Este archivo
```

## 🚀 Inicio Rápido

### 1. Crear Base de Datos desde Cero

```bash
# Opción 1: Usando MySQL CLI
mysql -u root -p < schema.sql

# Opción 2: Usando MySQL Workbench
# Abrir schema.sql y ejecutar todo el script
```

### 2. Insertar Datos de Prueba (Solo Desarrollo)

```bash
mysql -u root -p < seed.sql
```

### 3. Verificar Instalación

```bash
mysql -u root -p -e "USE planner_db; SHOW TABLES;"
```

## 📋 Descripción de Scripts

### `schema.sql`
Script principal que crea:
- ✅ Base de datos `planner_db`
- ✅ Tabla `users` - Usuarios del sistema
- ✅ Tabla `tasks` - Tareas (simples y recurrentes)
- ✅ Tabla `habits` - Hábitos de usuarios
- ✅ Tabla `habit_completions` - Registro de cumplimiento de hábitos
- ✅ Índices optimizados para consultas frecuentes
- ✅ Vistas para estadísticas
- ✅ Triggers para limpieza automática

**Uso:**
```bash
mysql -u root -p < schema.sql
```

### `seed.sql`
Datos de prueba para desarrollo:
- 5 usuarios de prueba
- Múltiples tareas con diferentes estados
- Hábitos de ejemplo
- Completados de hábitos para testing de rachas

**Credenciales de Prueba:**
- Email: `test@test.com`
- Password: `Password123`

**Uso:**
```bash
mysql -u root -p < seed.sql
```

⚠️ **ADVERTENCIA:** Este script limpia todos los datos existentes. NO usar en producción.

### `migrations/001_initial_schema.sql`
Primera migración del sistema. Crea el schema inicial de forma versionada.

**Uso:**
```bash
mysql -u root -p < migrations/001_initial_schema.sql
```

### `rollback/001_rollback_initial_schema.sql`
Revierte la migración 001, eliminando todas las tablas.

**Uso:**
```bash
mysql -u root -p < rollback/001_rollback_initial_schema.sql
```

## 🗃️ Estructura de Tablas

### Tabla: `users`
```sql
- id (PK)
- first_name
- last_name
- email (UNIQUE)
- password_hash
- reset_token_hash
- reset_token_expires
- created_at
- updated_at
```

### Tabla: `tasks`
```sql
- id (PK)
- user_id (FK -> users.id)
- title
- description
- priority (Alta, Media, Baja)
- due_date
- status (Pendiente, En Progreso, Completada, Cancelada)
- is_recurring
- frequency (Diaria, Semanal, Mensual)
- recurrence_end_date
- parent_id (FK -> tasks.id)
- created_at
- updated_at
```

### Tabla: `habits`
```sql
- id (PK)
- user_id (FK -> users.id)
- title
- time
- location
- created_at
- updated_at
```

### Tabla: `habit_completions`
```sql
- id (PK)
- habit_id (FK -> habits.id)
- completion_date
- created_at
```

## 🔧 Comandos Útiles

### Conectar a MySQL
```bash
mysql -u root -p
```

### Seleccionar Base de Datos
```sql
USE planner_db;
```

### Ver Todas las Tablas
```sql
SHOW TABLES;
```

### Describir una Tabla
```sql
DESCRIBE users;
DESCRIBE tasks;
DESCRIBE habits;
DESCRIBE habit_completions;
```

### Ver Estadísticas
```sql
-- Usar las vistas creadas
SELECT * FROM v_user_task_stats;
SELECT * FROM v_user_habit_stats;
```

### Backup de Base de Datos
```bash
# Backup completo
mysqldump -u root -p planner_db > backup_$(date +%Y%m%d).sql

# Backup solo estructura (sin datos)
mysqldump -u root -p --no-data planner_db > schema_backup.sql

# Backup solo datos
mysqldump -u root -p --no-create-info planner_db > data_backup.sql
```

### Restaurar desde Backup
```bash
mysql -u root -p planner_db < backup_20241106.sql
```

## 🔐 Configuración de Variables de Entorno

Asegúrate de configurar estas variables en tu archivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=planner_db
```

## 📝 Migraciones

### Crear Nueva Migración

1. Crear archivo en `migrations/` con formato: `00X_descripcion.sql`
2. Crear archivo de rollback correspondiente en `rollback/`
3. Documentar cambios en este README

### Aplicar Migración
```bash
mysql -u root -p < migrations/002_nueva_migracion.sql
```

### Revertir Migración
```bash
mysql -u root -p < rollback/002_rollback_nueva_migracion.sql
```

## ⚠️ Consideraciones de Seguridad

1. **Nunca** commitear archivos `.env` con credenciales reales
2. **Nunca** usar datos de `seed.sql` en producción
3. Cambiar contraseñas de usuarios de prueba antes de desplegar
4. Usar conexiones SSL/TLS en producción
5. Implementar backups automáticos regulares
6. Restringir permisos de usuario de base de datos

## 🧪 Testing

### Verificar Integridad de Datos
```sql
-- Verificar claves foráneas
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'planner_db'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verificar índices
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'planner_db'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Verificar Performance
```sql
-- Analizar queries lentas
SHOW FULL PROCESSLIST;

-- Ver tamaño de tablas
SELECT 
    TABLE_NAME,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'planner_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

## 📚 Recursos Adicionales

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Best Practices for Database Design](https://www.mysqltutorial.org/mysql-database-design/)
- [SQL Performance Tuning](https://use-the-index-luke.com/)

## 🆘 Solución de Problemas

### Error: "Access denied for user"
```bash
# Verificar credenciales
mysql -u root -p

# Crear usuario si es necesario
CREATE USER 'planner_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON planner_db.* TO 'planner_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Table doesn't exist"
```bash
# Verificar que la base de datos existe
mysql -u root -p -e "SHOW DATABASES;"

# Recrear schema
mysql -u root -p < schema.sql
```

### Error: "Foreign key constraint fails"
```bash
# Verificar orden de inserción de datos
# Asegurarse de insertar en orden: users -> tasks/habits -> habit_completions
```
