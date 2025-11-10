# 🐳 Guía de Dockerización - Planificador de Hábitos

Esta guía explica cómo ejecutar la aplicación completa (Frontend + Backend + Base de Datos) usando Docker.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Entorno de Desarrollo](#entorno-de-desarrollo)
- [Entorno de Producción](#entorno-de-producción)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

### Instalación de Docker

#### Windows
Descarga e instala [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/)

#### macOS
Descarga e instala [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/)

#### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd PLANIFICADOR-HABITOS-WEB
```

### 2. Configurar Variables de Entorno

#### Frontend (.env)
Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
```

#### Backend (Backend/.env)
Copia el archivo de ejemplo y configura las variables:

```bash
cp Backend/.env.example Backend/.env
```

Edita `Backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development
HOST=localhost

# Database
DB_HOST=db
DB_USER=planner_user
DB_PASSWORD=planner_password
DB_NAME=planner_db
DB_ROOT_PASSWORD=rootpassword

# JWT
JWT_SECRET=tu_super_secreto_jwt_minimo_32_caracteres

# SendGrid
SENDGRID_API_KEY=tu_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id

# Frontend URL
FRONTEND_URL=http://localhost:3000

# SSL/HTTPS
SSL_ENABLED=false
```

---

## 🚀 Entorno de Desarrollo

### Iniciar todos los servicios

```bash
docker-compose up
```

O en modo detached (segundo plano):

```bash
docker-compose up -d
```

### Servicios disponibles

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### Detener servicios

```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes (¡CUIDADO! Elimina la BD)
docker-compose down -v
```

### Hot Reload

El entorno de desarrollo está configurado con hot reload:
- **Frontend**: Los cambios en `src/` se reflejan automáticamente
- **Backend**: Los cambios en `Backend/src/` se reflejan automáticamente

---

## 🏭 Entorno de Producción

### 1. Configurar Variables de Entorno de Producción

Crea archivos `.env` con valores de producción:

**Frontend (.env)**:
```env
REACT_APP_API_URL=https://api.tudominio.com
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
```

**Backend (Backend/.env)**:
```env
NODE_ENV=production
PORT=5000
DB_HOST=db
DB_USER=planner_user_prod
DB_PASSWORD=contraseña_segura_produccion
DB_NAME=planner_db_prod
DB_ROOT_PASSWORD=contraseña_root_muy_segura
JWT_SECRET=secreto_jwt_super_seguro_minimo_32_caracteres
SENDGRID_API_KEY=tu_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com
GOOGLE_CLIENT_ID=tu_google_client_id_produccion
FRONTEND_URL=https://tudominio.com
SSL_ENABLED=false
```

### 2. Construir y ejecutar en producción

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. Verificar estado

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 4. Ver logs de producción

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Detener producción

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## 🛠️ Comandos Útiles

### Reconstruir imágenes

```bash
# Desarrollo
docker-compose build

# Producción
docker-compose -f docker-compose.prod.yml build

# Reconstruir sin caché
docker-compose build --no-cache
```

### Ejecutar comandos dentro de contenedores

```bash
# Acceder al contenedor del backend
docker-compose exec backend sh

# Ejecutar migraciones de base de datos
docker-compose exec backend npm run db:setup

# Acceder a MySQL
docker-compose exec db mysql -u planner_user -p planner_db
```

### Limpiar recursos de Docker

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Eliminar volúmenes no usados
docker volume prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

### Inspeccionar contenedores

```bash
# Ver estado de salud
docker-compose ps

# Inspeccionar un contenedor
docker inspect planificador-backend-dev

# Ver uso de recursos
docker stats
```

---

## 🔍 Troubleshooting

### El frontend no se conecta al backend

1. Verifica que `REACT_APP_API_URL` en `.env` apunte a `http://localhost:5000`
2. Asegúrate de que el backend esté corriendo: `docker-compose logs backend`
3. Verifica la red: `docker network inspect planificador-habitos-web_planificador-network`

### Error de conexión a la base de datos

1. Espera a que MySQL esté completamente iniciado (puede tomar 30-60 segundos)
2. Verifica las credenciales en `Backend/.env`
3. Revisa los logs: `docker-compose logs db`
4. Verifica el health check: `docker-compose ps`

### Puerto ya en uso

```bash
# Encuentra qué proceso usa el puerto
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :3000
lsof -i :5000

# Cambia el puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usa puerto 3001 en lugar de 3000
```

### Los cambios no se reflejan (hot reload no funciona)

1. Verifica que los volúmenes estén montados correctamente
2. En Windows, asegúrate de que Docker Desktop tenga acceso a la unidad
3. Reinicia los contenedores: `docker-compose restart`

### Problemas de permisos (Linux)

```bash
# Dar permisos al usuario actual
sudo chown -R $USER:$USER .

# O ejecutar Docker sin sudo
sudo usermod -aG docker $USER
newgrp docker
```

### Limpiar y empezar de cero

```bash
# Detener todo
docker-compose down -v

# Limpiar imágenes
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up
```

### Ver logs detallados

```bash
# Logs con timestamps
docker-compose logs -f --timestamps

# Últimas 100 líneas
docker-compose logs --tail=100

# Logs de un servicio específico
docker-compose logs -f backend
```

---

## 📊 Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                 planificador-network                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Database   │  │
│  │   (React)    │  │   (Node.js)  │  │   (MySQL)    │  │
│  │              │  │              │  │              │  │
│  │   Port 3000  │  │   Port 5000  │  │   Port 3306  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad en Producción

### Recomendaciones

1. **Nunca** commits archivos `.env` con credenciales reales
2. Usa contraseñas fuertes para la base de datos
3. Cambia el `JWT_SECRET` por uno único y seguro
4. Configura SSL/HTTPS en producción
5. Usa variables de entorno del sistema en lugar de archivos `.env`
6. Limita el acceso a puertos expuestos
7. Mantén Docker y las imágenes actualizadas

### Variables de entorno en el servidor

En lugar de archivos `.env`, usa variables de entorno del sistema:

```bash
export DB_PASSWORD="contraseña_segura"
export JWT_SECRET="secreto_muy_seguro"
```

O usa Docker secrets en Docker Swarm:

```bash
echo "contraseña_segura" | docker secret create db_password -
```

---

## 📝 Notas Adicionales

- Los volúmenes de MySQL persisten los datos entre reinicios
- En desarrollo, los `node_modules` se montan como volúmenes anónimos para mejor rendimiento
- El frontend en producción usa Nginx para servir archivos estáticos
- Los health checks aseguran que los servicios estén listos antes de aceptar tráfico

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta la documentación oficial de Docker
4. Abre un issue en el repositorio

---

**¡Feliz desarrollo! 🚀**
