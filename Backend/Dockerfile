# ============================================
# Multi-stage Dockerfile para Backend Node.js
# ============================================

# ============================================
# Etapa 1: Base común
# ============================================
FROM node:18-alpine AS base
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# ============================================
# Etapa 2: Dependencias
# ============================================
FROM base AS dependencies
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Instalar todas las dependencias (incluyendo dev) en carpeta separada
RUN npm ci && \
    npm cache clean --force

# ============================================
# Etapa 3: Build (si fuera necesario)
# ============================================
FROM dependencies AS build
WORKDIR /app

# Copiar código fuente
COPY . .

# ============================================
# Etapa 4: Desarrollo
# ============================================
FROM base AS development
WORKDIR /app

# Copiar node_modules completo (con dev dependencies)
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear directorio de logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 5000

# Usuario no-root para seguridad
USER node

# Comando para desarrollo (con nodemon si lo agregas)
CMD ["npm", "run", "dev"]

# ============================================
# Etapa 5: Producción
# ============================================
FROM base AS production
WORKDIR /app

# Copiar solo dependencias de producción
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear directorio de logs
RUN mkdir -p logs && \
    chown -R node:node /app

# Exponer puerto
EXPOSE 5000

# Usuario no-root para seguridad
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para producción
CMD ["npm", "start"]
