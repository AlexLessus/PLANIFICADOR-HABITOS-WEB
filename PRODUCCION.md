# 🚀 Guía de Comandos para Producción - Planificador de Hábitos

Esta guía contiene todos los comandos esenciales para gestionar los contenedores Docker en producción.

---

## 📋 Tabla de Contenidos

- [Comandos Esenciales](#comandos-esenciales)
- [Gestión de Contenedores](#gestión-de-contenedores)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Base de Datos](#base-de-datos)
- [Backups](#backups)
- [Mantenimiento](#mantenimiento)
- [Troubleshooting](#troubleshooting)
- [Checklist de Despliegue](#checklist-de-despliegue)

---

## 🎯 Comandos Esenciales

### Iniciar Aplicación en Producción

```bash
# Construir e iniciar todos los servicios
docker compose -f docker-compose.prod.yml up --build -d

# Solo iniciar (sin reconstruir)
docker compose -f docker-compose.prod.yml up -d

# Iniciar un servicio específico
docker compose -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.prod.yml up -d frontend
docker compose -f docker-compose.prod.yml up -d db
```

### Detener Aplicación

```bash
# Detener todos los servicios (mantiene contenedores)
docker compose -f docker-compose.prod.yml stop

# Detener y eliminar contenedores (mantiene volúmenes/datos)
docker compose -f docker-compose.prod.yml down

# Detener un servicio específico
docker compose -f docker-compose.prod.yml stop backend
```

### Reiniciar Aplicación

```bash
# Reiniciar todos los servicios
docker compose -f docker-compose.prod.yml restart

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart db
```

---

## 🐳 Gestión de Contenedores

### Ver Estado de Contenedores

```bash
# Ver todos los contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver estado detallado con health checks
docker ps --filter "name=planificador"

# Ver uso de recursos en tiempo real
docker stats
```

### Reconstruir Imágenes

```bash
# Reconstruir todas las imágenes
docker compose -f docker-compose.prod.yml build

# Reconstruir sin usar caché (limpio)
docker compose -f docker-compose.prod.yml build --no-cache

# Reconstruir un servicio específico
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build frontend

# Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml up --build -d
```

### Actualizar Aplicación (Deploy)

```bash
# 1. Detener servicios
docker compose -f docker-compose.prod.yml down

# 2. Actualizar código (git pull, etc.)
git pull origin main

# 3. Reconstruir y reiniciar
docker compose -f docker-compose.prod.yml up --build -d

# 4. Verificar estado
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

### Deploy con Zero Downtime (Rolling Update)

```bash
# Actualizar backend sin downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend

# Actualizar frontend sin downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

---

## 📊 Monitoreo y Logs

### Ver Logs

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.prod.yml logs

# Ver logs en tiempo real (follow)
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f db

# Ver últimas N líneas
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Ver logs con timestamps
docker compose -f docker-compose.prod.yml logs -f --timestamps

# Ver logs desde una fecha específica
docker compose -f docker-compose.prod.yml logs --since 2024-01-01T00:00:00
docker compose -f docker-compose.prod.yml logs --since 1h
docker compose -f docker-compose.prod.yml logs --since 30m
```

### Logs del Sistema (Backend)

```bash
# Ver logs de aplicación (dentro del contenedor)
docker compose -f docker-compose.prod.yml exec backend cat logs/app.log
docker compose -f docker-compose.prod.yml exec backend cat logs/error.log

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml exec backend tail -f logs/app.log
docker compose -f docker-compose.prod.yml exec backend tail -f logs/error.log

# Ver logs desde el host (si están montados)
tail -f Backend/logs/app.log
tail -f Backend/logs/error.log
```

### Monitoreo de Recursos

```bash
# Ver uso de CPU, memoria, red, I/O
docker stats

# Ver solo contenedores de producción
docker stats --filter "name=planificador-*-prod"

# Ver recursos de un contenedor específico
docker stats planificador-backend-prod
docker stats planificador-frontend-prod
docker stats planificador-db-prod
```

### Health Checks

```bash
# Verificar health status
docker inspect --format='{{.State.Health.Status}}' planificador-backend-prod
docker inspect --format='{{.State.Health.Status}}' planificador-frontend-prod
docker inspect --format='{{.State.Health.Status}}' planificador-db-prod

# Ver detalles completos del health check
docker inspect planificador-backend-prod | grep -A 10 Health
```

---

## 🗄️ Base de Datos

### Acceder a MySQL

```bash
# Acceder a MySQL CLI
docker compose -f docker-compose.prod.yml exec db mysql -u planner_user -p planner_db

# Acceder como root
docker compose -f docker-compose.prod.yml exec db mysql -u root -p

# Ejecutar query directamente
docker- compose -f docker-compose.prod.yml exec db mysql -u planner_user -p planner_db -e "SELECT * FROM users LIMIT 5;"
```

### Migraciones de Base de Datos

```bash
# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec backend npm run db:setup

# Ver estado de migraciones
docker compose -f docker-compose.prod.yml exec backend npm run db:status

# Rollback de migraciones
docker compose -f docker-compose.prod.yml exec backend npm run db:rollback

# Reset completo (¡CUIDADO! Elimina todos los datos)
docker compose -f docker-compose.prod.yml exec backend npm run db:reset
```

### Verificar Conexión a Base de Datos

```bash
# Ping a MySQL
docker compose -f docker-compose.prod.yml exec db mysqladmin ping -u root -p

# Ver bases de datos
docker compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SHOW DATABASES;"

# Ver tablas
docker compose -f docker-compose.prod.yml exec db mysql -u planner_user -p planner_db -e "SHOW TABLES;"

# Ver usuarios
docker compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

---

## 💾 Backups

### Backup de Base de Datos

```bash
# Backup completo de la base de datos
docker compose -f docker-compose.prod.yml exec db mysqldump -u root -p planner_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup con compresión
docker compose -f docker-compose.prod.yml exec db mysqldump -u root -p planner_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup de todas las bases de datos
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p --all-databases > backup_all_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Base de Datos

```bash
# Restaurar desde backup
docker-compo    se -f docker-compose.prod.yml exec -T db mysql -u root -p planner_db < backup_20240101_120000.sql

# Restaurar desde backup comprimido
gunzip < backup_20240101_120000.sql.gz | docker-compose -f docker-compose.prod.yml exec -T db mysql -u root -p planner_db
```

### Backup de Volúmenes

```bash
# Backup del volumen de MySQL
docker run --rm \
  -v planificador-habitos-web_mysql_data_prod:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql_volume_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restaurar volumen de MySQL
docker run --rm \
  -v planificador-habitos-web_mysql_data_prod:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_volume_backup_20240101_120000.tar.gz -C /data
```

### Backup Automático (Cron Job)

```bash
# Crear script de backup
cat > /usr/local/bin/backup-planificador.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/planificador"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de base de datos
docker-compose -f /ruta/a/docker-compose.prod.yml exec -T db mysqldump -u root -p$DB_ROOT_PASSWORD planner_db | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

chmod +x /usr/local/bin/backup-planificador.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
# Agregar línea:
# 0 2 * * * /usr/local/bin/backup-planificador.sh >> /var/log/backup-planificador.log 2>&1
```

---

## 🔧 Mantenimiento

### Limpiar Recursos de Docker

```bash
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes no usadas
docker image prune -a -f

# Eliminar volúmenes no usados (¡CUIDADO!)
docker volume prune -f

# Eliminar redes no usadas
docker network prune -f

# Limpiar todo el sistema (¡EXTREMO CUIDADO!)
docker system prune -a --volumes -f
```

### Actualizar Imágenes Base

```bash
# Actualizar imagen de MySQL
docker pull mysql:8.0

# Actualizar imagen de Node
docker pull node:18-alpine

# Reconstruir después de actualizar imágenes base
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Inspeccionar Contenedores

```bash
# Ver configuración completa de un contenedor
docker inspect planificador-backend-prod

# Ver variables de entorno
docker inspect --format='{{.Config.Env}}' planificador-backend-prod

# Ver volúmenes montados
docker inspect --format='{{.Mounts}}' planificador-backend-prod

# Ver red
docker inspect --format='{{.NetworkSettings.Networks}}' planificador-backend-prod
```

### Ejecutar Comandos en Contenedores

```bash
# Acceder a shell del backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Acceder a shell del frontend
docker-compose -f docker-compose.prod.yml exec frontend sh

# Ejecutar comando sin entrar al shell
docker-compose -f docker-compose.prod.yml exec backend node --version
docker-compose -f docker-compose.prod.yml exec backend npm list

# Ver archivos en el contenedor
docker-compose -f docker-compose.prod.yml exec backend ls -la
docker-compose -f docker-compose.prod.yml exec backend cat package.json
```

---

## 🔍 Troubleshooting

### Contenedor No Inicia

```bash
# Ver logs de error
docker-compose -f docker-compose.prod.yml logs backend

# Ver eventos del contenedor
docker events --filter container=planificador-backend-prod

# Inspeccionar estado
docker inspect planificador-backend-prod | grep -A 20 State

# Intentar iniciar en modo interactivo
docker-compose -f docker-compose.prod.yml run --rm backend sh
```

### Problemas de Conexión

```bash
# Verificar red
docker network ls
docker network inspect planificador-habitos-web_planificador-network

# Ping entre contenedores
docker-compose -f docker-compose.prod.yml exec backend ping db
docker-compose -f docker-compose.prod.yml exec frontend ping backend

# Ver puertos expuestos
docker-compose -f docker-compose.prod.yml ps
docker port planificador-frontend-prod
```

### Base de Datos No Responde

```bash
# Verificar health check
docker inspect --format='{{.State.Health.Status}}' planificador-db-prod

# Ver logs de MySQL
docker-compose -f docker-compose.prod.yml logs db

# Reiniciar solo la base de datos
docker-compose -f docker-compose.prod.yml restart db

# Verificar procesos en MySQL
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Alto Uso de Recursos

```bash
# Ver uso de recursos
docker stats

# Ver procesos dentro del contenedor
docker-compose -f docker-compose.prod.yml exec backend top

# Ver logs para identificar problemas
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Reiniciar contenedor problemático
docker-compose -f docker-compose.prod.yml restart backend
```

### Limpiar y Reiniciar Desde Cero

```bash
# ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos

# 1. Detener y eliminar todo
docker-compose -f docker-compose.prod.yml down -v

# 2. Limpiar imágenes
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Iniciar de nuevo
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Checklist de Despliegue

### Pre-Despliegue

- [ ] Verificar que todos los archivos `.env` estén configurados correctamente
- [ ] Verificar que las variables de entorno de producción estén configuradas
- [ ] Hacer backup de la base de datos actual
- [ ] Verificar que el código esté en la rama correcta (`main` o `production`)
- [ ] Ejecutar tests localmente
- [ ] Verificar que los certificados SSL estén actualizados (si aplica)

### Despliegue

```bash
# 1. Conectar al servidor
ssh usuario@servidor-produccion

# 2. Navegar al directorio del proyecto
cd /ruta/a/PLANIFICADOR-HABITOS-WEB

# 3. Actualizar código
git pull origin main

# 4. Verificar cambios
git log -1
git status

# 5. Detener servicios
docker-compose -f docker-compose.prod.yml down

# 6. Reconstruir imágenes
docker-compose -f docker-compose.prod.yml build --no-cache

# 7. Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 8. Verificar estado
docker-compose -f docker-compose.prod.yml ps

# 9. Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# 10. Verificar health checks
docker ps --filter "name=planificador"
```

### Post-Despliegue

- [ ] Verificar que todos los contenedores estén corriendo
- [ ] Verificar health checks
- [ ] Probar endpoints principales de la API
- [ ] Verificar que el frontend cargue correctamente
- [ ] Verificar logs por errores
- [ ] Probar funcionalidades críticas (login, registro, etc.)
- [ ] Monitorear recursos durante 15-30 minutos

### Rollback (Si algo falla)

```bash
# 1. Detener servicios actuales
docker-compose -f docker-compose.prod.yml down

# 2. Volver al commit anterior
git reset --hard HEAD~1

# 3. Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml up --build -d

# 4. Restaurar base de datos si es necesario
docker-compose -f docker-compose.prod.yml exec -T db mysql -u root -p planner_db < backup_anterior.sql
```

---

## 📊 Información de los Servicios

### Puertos

| Servicio | Puerto Interno | Puerto Externo | Descripción |
|----------|---------------|----------------|-------------|
| Frontend | 80 | 127.0.0.1:8080 | Nginx sirviendo React |
| Backend | 5000 | - | API Node.js (interno) |
| MySQL | 3306 | - | Base de datos (interno) |

### Volúmenes

| Volumen | Descripción | Ubicación |
|---------|-------------|-----------|
| `mysql_data_prod` | Datos de MySQL | `/var/lib/mysql` |
| `./Backend/logs` | Logs del backend | `./Backend/logs` |
| `./Backend/ssl` | Certificados SSL | `./Backend/ssl` |

### Redes

| Red | Driver | Descripción |
|-----|--------|-------------|
| `planificador-network` | bridge | Red interna para comunicación entre contenedores |

---

## 🔐 Seguridad en Producción

### Variables de Entorno Críticas

```bash
# Verificar que estas variables estén configuradas:
- DB_ROOT_PASSWORD (contraseña fuerte)
- DB_PASSWORD (contraseña fuerte)
- JWT_SECRET (mínimo 32 caracteres)
- SENDGRID_API_KEY
- GOOGLE_CLIENT_ID
```

### Comandos de Seguridad

```bash
# Verificar permisos de archivos sensibles
ls -la Backend/.env
chmod 600 Backend/.env

# Verificar que .env no esté en git
git check-ignore Backend/.env

# Rotar contraseñas de base de datos
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p -e "ALTER USER 'planner_user'@'%' IDENTIFIED BY 'nueva_contraseña';"

# Actualizar variable de entorno
# Editar Backend/.env y reiniciar
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📈 Monitoreo Continuo

### Script de Monitoreo Simple

```bash
# Crear script de monitoreo
cat > /usr/local/bin/monitor-planificador.sh << 'EOF'
#!/bin/bash

echo "=== Estado de Contenedores ==="
docker-compose -f /ruta/a/docker-compose.prod.yml ps

echo -e "\n=== Health Checks ==="
docker inspect --format='Backend: {{.State.Health.Status}}' planificador-backend-prod
docker inspect --format='Frontend: {{.State.Health.Status}}' planificador-frontend-prod
docker inspect --format='Database: {{.State.Health.Status}}' planificador-db-prod

echo -e "\n=== Uso de Recursos ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo -e "\n=== Últimos Errores en Logs ==="
docker-compose -f /ruta/a/docker-compose.prod.yml logs --tail=20 | grep -i error
EOF

chmod +x /usr/local/bin/monitor-planificador.sh

# Ejecutar cada 5 minutos
crontab -e
# Agregar:
# */5 * * * * /usr/local/bin/monitor-planificador.sh >> /var/log/monitor-planificador.log 2>&1
```

---

## 🆘 Contactos de Emergencia

### Comandos de Emergencia

```bash
# Reinicio rápido de todo
docker-compose -f docker-compose.prod.yml restart

# Detener todo inmediatamente
docker-compose -f docker-compose.prod.yml stop

# Ver qué está consumiendo recursos
docker stats --no-stream

# Ver logs de errores críticos
docker-compose -f docker-compose.prod.yml logs --tail=100 | grep -i "error\|critical\|fatal"
```

---

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0.0

---

## 🎯 Comandos Rápidos (Cheat Sheet)

```bash
# Iniciar
docker-compose -f docker-compose.prod.yml up -d

# Detener
docker-compose -f docker-compose.prod.yml down

# Reiniciar
docker-compose -f docker-compose.prod.yml restart

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Backup DB
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p planner_db > backup.sql

# Acceder a MySQL
docker-compose -f docker-compose.prod.yml exec db mysql -u planner_user -p planner_db

# Ver recursos
docker stats

# Actualizar
docker-compose -f docker-compose.prod.yml up --build -d
```

---

**¡Mantén este archivo a mano para referencia rápida! 🚀**
