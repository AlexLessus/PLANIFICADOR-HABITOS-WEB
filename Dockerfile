# ============================================
# Multi-stage Dockerfile para Frontend React
# ============================================

# ============================================
# Etapa 1: Base común
# ============================================
FROM node:18-alpine AS base
WORKDIR /app

# ============================================
# Etapa 2: Dependencias
# ============================================
FROM base AS dependencies
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci && \
    npm cache clean --force

# ============================================
# Etapa 3: Build para producción
# ============================================
FROM base AS build
WORKDIR /app

# Declarar argumentos de build (variables de entorno para React)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID

# Convertir ARG a ENV para que estén disponibles durante el build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# Copiar node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build de la aplicación React (las variables ENV estarán disponibles)
RUN npm run build

# ============================================
# Etapa 4: Desarrollo
# ============================================
FROM base AS development
WORKDIR /app

# Copiar node_modules completo
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo
EXPOSE 3000

# En desarrollo ejecutamos como root para evitar problemas de permisos con volúmenes
# USER node

# Comando para desarrollo
CMD ["npm", "start"]

# ============================================
# Etapa 5: Producción con Nginx
# ============================================
FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos build desde la etapa de build
COPY --from=build /app/build /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
