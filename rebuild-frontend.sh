#!/bin/bash

# Script para reconstruir el frontend con las variables de entorno correctas
# Uso: bash rebuild-frontend.sh

set -e

echo "================================================"
echo "Reconstrucción del Frontend - Producción"
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Verificando archivo .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Archivo .env no encontrado, copiando desde .env.prod...${NC}"
    cp .env.prod .env
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✓ Archivo .env existe${NC}"
fi
echo ""

echo -e "${YELLOW}2. Verificando variables de entorno...${NC}"
source .env
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_GOOGLE_CLIENT_ID: $REACT_APP_GOOGLE_CLIENT_ID"
echo ""

if [ "$REACT_APP_API_URL" != "https://tigertech.com.mx" ]; then
    echo -e "${RED}✗ REACT_APP_API_URL no está configurada correctamente${NC}"
    echo "Debe ser: https://tigertech.com.mx"
    echo "Actual: $REACT_APP_API_URL"
    exit 1
fi
echo -e "${GREEN}✓ Variables de entorno correctas${NC}"
echo ""

echo -e "${YELLOW}3. Deteniendo contenedor frontend...${NC}"
docker compose -f docker-compose.prod.yml stop frontend
echo -e "${GREEN}✓ Contenedor detenido${NC}"
echo ""

echo -e "${YELLOW}4. Reconstruyendo frontend (sin caché)...${NC}"
echo "Esto puede tardar varios minutos..."
docker compose -f docker-compose.prod.yml build --no-cache --progress=plain frontend 2>&1 | tee build.log
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend reconstruido${NC}"
else
    echo -e "${RED}✗ Error al reconstruir frontend${NC}"
    echo "Revisa build.log para más detalles"
    exit 1
fi
echo ""

echo -e "${YELLOW}5. Iniciando contenedor frontend...${NC}"
docker compose -f docker-compose.prod.yml up -d frontend
echo -e "${GREEN}✓ Contenedor iniciado${NC}"
echo ""

echo -e "${YELLOW}6. Esperando que el frontend esté listo...${NC}"
sleep 5
echo ""

echo -e "${YELLOW}7. Verificando estado del contenedor...${NC}"
docker compose -f docker-compose.prod.yml ps frontend
echo ""

echo -e "${YELLOW}8. Verificando que la API URL esté correcta en el build...${NC}"
echo "Probando una petición desde el contenedor..."
docker exec planificador-frontend-prod cat /usr/share/nginx/html/index.html | grep -o "tigertech.com.mx" | head -1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ La URL de producción está en el build${NC}"
else
    echo -e "${YELLOW}⚠ No se pudo verificar la URL en el HTML${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}Reconstrucción completada${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Limpia la caché del navegador o usa modo incógnito"
echo "2. Abre: https://www.tigertech.com.mx"
echo "3. Verifica que no haya errores de 'localhost:5000' en la consola"
echo ""
echo -e "${YELLOW}Para verificar logs:${NC}"
echo "docker compose -f docker-compose.prod.yml logs -f frontend"
