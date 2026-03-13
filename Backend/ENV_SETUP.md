# 🔧 Configuración de Variables de Entorno

## 📁 Archivos de Entorno Disponibles

Este proyecto tiene dos archivos de configuración:

### 1. `.env` - Para Docker 🐳
**Usar cuando ejecutes con Docker Compose**

```bash
# Iniciar con Docker
docker-compose up
```

**Configuración clave:**
- `DB_HOST=db` ← Nombre del servicio Docker
- `DB_USER=planner_user`
- `DB_PASSWORD=planner_password`

### 2. `.env.local` - Para Ejecución Local 💻
**Usar cuando ejecutes sin Docker (directamente con Node.js)**

```bash
# Copiar archivo local
cp .env.local .env

# Iniciar servidor localmente
npm run dev
```

**Configuración clave:**
- `DB_HOST=localhost` ← MySQL local
- `DB_USER=root`
- `DB_PASSWORD=` (vacío para XAMPP/WAMP)

---

## 🚀 Guía Rápida

### Opción A: Ejecutar con Docker (Recomendado)

1. **Asegúrate de que `.env` tenga `DB_HOST=db`**
2. Ejecuta:
   ```bash
   docker-compose up
   ```
3. ¡Listo! Todo está configurado automáticamente

### Opción B: Ejecutar Localmente (Sin Docker)

1. **Copia el archivo local:**
   ```bash
   cp .env.local .env
   ```
2. **Asegúrate de tener MySQL corriendo localmente**
3. **Crea la base de datos:**
   ```bash
   npm run db:setup
   ```
4. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

---

## ⚠️ Importante

**NO** hagas commit del archivo `.env` con credenciales reales.

El archivo `.env` está en `.gitignore` por seguridad.

---

## 🔄 Cambiar entre Modos

### De Local a Docker:
```bash
# Restaurar configuración Docker
cp .env.example .env
# Editar DB_HOST=db
```

### De Docker a Local:
```bash
# Usar configuración local
cp .env.local .env
```

---

## 📝 Variables Importantes

| Variable | Docker | Local |
|----------|--------|-------|
| `DB_HOST` | `db` | `localhost` |
| `DB_USER` | `planner_user` | `root` |
| `DB_PASSWORD` | `planner_password` | `` (vacío) |
| `DB_NAME` | `planner_db` | `planificador_db` |

---

## 🆘 Problemas Comunes

### Error: "Can't connect to MySQL server"

**Con Docker:**
- Verifica que los contenedores estén corriendo: `docker-compose ps`
- Espera a que MySQL inicie completamente (30-60 segundos)

**Sin Docker:**
- Verifica que MySQL esté corriendo localmente
- Verifica las credenciales en `.env`
- Asegúrate de usar `DB_HOST=localhost`

### Error: "Access denied for user"

**Con Docker:**
- Verifica que `.env` tenga `DB_USER=planner_user` y `DB_PASSWORD=planner_password`

**Sin Docker:**
- Verifica que `.env` tenga `DB_USER=root` y `DB_PASSWORD=` (vacío)
